import React, { useEffect, useState } from "react";
import { Button, Tile, Tooltip, SkeletonText, SkeletonPlaceholder } from "@carbon/react";
import CountUp from 'react-countup'; // Import CountUp
import { useStoreContext } from "../../../store";
import { formatCount } from "../../../utils/data-utils";

const defaultData = { apps: 0, avgLatency: 0, users: 0, operations: 0, models: 0, appCount: 0 };

const TracesTile = () => {
  const [data, setData] = useState(defaultData);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [operationsData, setOperationsData] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [maintenanceData, setMaintenanceData] = useState([]);
  const [totalCounts, setTotalCounts] = useState({ operations: 0, performance: 0, maintenance: 0 });
  const { state } = useStoreContext();

  const fetchTotalCounts = async () => {
    const apiUrl = process.env.REACT_APP_BACKEND_API_URL;

    const queries = [
      { query: `SELECT COUNT(*) as count FROM operations` },
      { query: `SELECT COUNT(*) as count FROM performance` },
      { query: `SELECT COUNT(*) as count FROM maintenance` }
    ];

    try {
      const [operationsResponse, performanceResponse, maintenanceResponse] = await Promise.all(queries.map(query =>
        fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(query),
        })
      ));

      if (!operationsResponse.ok || !performanceResponse.ok || !maintenanceResponse.ok) {
        throw new Error("Network response was not ok");
      }

      const [operationsCount, performanceCount, maintenanceCount] = await Promise.all([
        operationsResponse.json(),
        performanceResponse.json(),
        maintenanceResponse.json(),
      ]);

      setTotalCounts({
        operations: operationsCount[0].count,
        performance: performanceCount[0].count,
        maintenance: maintenanceCount[0].count
      });
    } catch (error) {
      console.error("Error fetching total counts:", error);
    }
  };

  const fetchTraceData = async (limit, offset) => {
    const apiUrl = process.env.REACT_APP_BACKEND_API_URL;

    const queries = [
      { query: `SELECT * FROM operations LIMIT ${limit} OFFSET ${offset}` },
      { query: `SELECT * FROM performance LIMIT ${limit} OFFSET ${offset}` },
      { query: `SELECT * FROM maintenance LIMIT ${limit} OFFSET ${offset}` }
    ];

    try {
      const [operationsResponse, performanceResponse, maintenanceResponse] = await Promise.all(queries.map(query =>
        fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(query),
        })
      ));

      if (!operationsResponse.ok || !performanceResponse.ok || !maintenanceResponse.ok) {
        throw new Error("Network response was not ok");
      }

      const [newOperationsData, newPerformanceData, newMaintenanceData] = await Promise.all([
        operationsResponse.json(),
        performanceResponse.json(),
        maintenanceResponse.json(),
      ]);

      setOperationsData(prevData => [...prevData, ...newOperationsData]);
      setPerformanceData(prevData => [...prevData, ...newPerformanceData]);
      setMaintenanceData(prevData => [...prevData, ...newMaintenanceData]);

      const appsCount = new Set([...operationsData, ...newOperationsData].map(item => item.application_name)).size;
      const usersSet = new Set([...operationsData, ...newOperationsData].flatMap(item => item.tags.filter(tag => tag.key === 'user').map(tag => tag.value)));
      const modelsSet = new Set([...operationsData, ...newOperationsData].flatMap(item => item.tags.filter(tag => tag.key === 'model').map(tag => tag.value)));
      const operationsCount = [...operationsData, ...newOperationsData].length;
      const totalAppCount = [...maintenanceData, ...newMaintenanceData].length;

      const latencies = [
        ...performanceData, 
        ...newPerformanceData.map(item => {
          const startUs = item.start_us ? Number(item.start_us) : NaN;
          const endUs = item.end_us ? Number(item.end_us) : NaN;
          if (isNaN(startUs) || isNaN(endUs)) return NaN;
          return (endUs - startUs) / 1000; // Latency in seconds
        }).filter(latency => !isNaN(latency))
      ];

      const avgLatency = latencies.length > 0 ? latencies.reduce((sum, latency) => sum + latency, 0) / latencies.length : 0;

      setData({
        apps: appsCount,
        avgLatency,
        users: usersSet.size,
        operations: operationsCount,
        models: modelsSet.size,
        appCount: totalAppCount,
      });

      setLoading(false);
      setLoadingMore(false);
    } catch (error) {
      console.error("Error fetching trace data:", error);
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      await fetchTotalCounts();
      fetchTraceData(500, 0); // Initial load of first 500 items
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    if (operationsData.length < totalCounts.operations || performanceData.length < totalCounts.performance || maintenanceData.length < totalCounts.maintenance) {
      if (!loadingMore) {
        setLoadingMore(true);
        fetchTraceData(500, operationsData.length);
      }
    }
  }, [operationsData.length, performanceData.length, maintenanceData.length, totalCounts]);

  console.log(operationsData.length, performanceData.length, maintenanceData.length, totalCounts);
  

  return (
    <Tile className="infrastructure-components">
      <div className="infrastructure-components-content">
        <h5>Quick Summary</h5>
        <div className="types">
          {loading ? (
            <>
              <SkeletonPlaceholder className="type-placeholder" />
              <SkeletonText width="70%" />
              <SkeletonText width="50%" />
            </>
          ) : (
            <>
              <Tooltip className="button-tooltip" align="top" label={'Your Total No of Application Name'}>
                <Button className="type" kind="ghost">
                  <div className="title">
                    <div className="indicator engines" />
                    <span>Total No of Application Names</span>
                  </div>
                  <h2>
                    <CountUp end={data.apps} duration={2.5} />
                  </h2>
                </Button>
              </Tooltip>
              <Tooltip className="button-tooltip" align="top" label={'Total Number of Users you have'}>
                <Button className="type" kind="ghost">
                  <div className="title">
                    <div className="indicator buckets" />
                    <span>Total No of User Names</span>
                  </div>
                  <h2>
                    <CountUp end={data.users} duration={2.5} />
                  </h2>
                </Button>
              </Tooltip>
              <Tooltip className="button-tooltip" align="top" label={'Total Number of Models Used in'}>
                <Button className="type" kind="ghost">
                  <div className="title">
                    <div className="indicator databases" />
                    <span>Models used</span>
                  </div>
                  <h2>
                    <CountUp end={data.models} duration={2.5} />
                  </h2>
                </Button>
              </Tooltip>
              <Tooltip className="button-tooltip" align="top" label={'Total Number of Applications executed throughout'}>
                <Button className="type" kind="ghost">
                  <div className="title">
                    <div className="indicator catalogs" />
                    <span>Total Applications Executed</span>
                  </div>
                  <h2>
                    <CountUp end={data.appCount} duration={2.5} />
                  </h2>
                </Button>
              </Tooltip>
            </>
          )}
        </div>
      </div>
    </Tile>
  );
};

export default TracesTile;