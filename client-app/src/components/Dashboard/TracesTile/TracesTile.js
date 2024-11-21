import React, { useEffect, useState } from "react";
import moment from "moment";
import { Button, CodeSnippetSkeleton, Tile, Tooltip } from "@carbon/react";
import { useStoreContext } from "../../../store";
import { formatCount } from "../../../utils/data-utils";

const defaultData = {
  apps: 0,
  avgLatency: 0,
  users: 0,
  operations: 0,
  models: 0,
  appCount: 0,
};

const TracesTile = () => {
  const [data, setData] = useState(defaultData);
  const { state } = useStoreContext();
  const [loading, setLoading] = useState(true); // Add loading state


  // API Call to fetch trace data
  const fetchTraceData = async () => {
  setLoading(true);
  const apiUrl = process.env.REACT_APP_BACKEND_API_URL;

  const operationsQuery = `SELECT * FROM operations WHERE timestamp >= NOW() - INTERVAL '30 DAY'`;
  const performanceQuery = `SELECT * FROM performance WHERE timestamp >= NOW() - INTERVAL '30 DAY'`;
  const maintenanceQuery = `SELECT * FROM maintenance WHERE timestamp >= NOW() - INTERVAL '30 DAY'`;
  const logQuery = `SELECT * FROM log_history WHERE timestamp >= NOW() - INTERVAL '30 DAY'`;

  try {
    const [operationsResponse, performanceResponse, maintenanceResponse, logResponse] = await Promise.all([
      fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: operationsQuery }),
      }),
      fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: performanceQuery }),
      }),
      fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: maintenanceQuery }),
      }),
      fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: logQuery }),
      }),
    ]);

    if (!operationsResponse.ok || !performanceResponse.ok || !maintenanceResponse.ok || !logResponse.ok) {
      throw new Error("One of the network responses was not ok");
    }

    const [operationsData, performanceData, maintenanceData, logData] = await Promise.all([
      operationsResponse.json(),
      performanceResponse.json(),
      maintenanceResponse.json(),
      logResponse.json(),
    ]);

    return { operationsData, performanceData, maintenanceData, logData };
  } catch (error) {
    console.error("Error fetching trace data:", error);
    // Return default empty arrays if there's an error
    return {
      operationsData: [],
      performanceData: [],
      maintenanceData: [],
      logData: [],
    };
  } finally {
    setLoading(false);
  }
};


  
  
  useEffect(() => {
    fetchTraceData().then(({ operationsData, performanceData, maintenanceData, logData }) => {
      if (operationsData.length > 0 || performanceData.length > 0 || maintenanceData.length > 0 || logData.length > 0) {
        // Process operations data
        const appsCount = new Set(logData.map(item => item.application_name)).size;
        const usersSet = new Set(logData.map(item => item.app_user)).size;
        // const usersSet = new Set(operationsData.flatMap(item => item.tags.filter(tag => tag.key === 'user').map(tag => tag.value)));
        const modelsSet = new Set(operationsData.flatMap(item => item.tags.filter(tag => tag.key === 'model').map(tag => tag.value)));
        const operationsCount = operationsData.length;

        const totalAppCount = maintenanceData.length

        // Process performance data
        const latencies = performanceData.map(item => {
          const startUs = item.start_us ? Number(item.start_us) : NaN;
          const endUs = item.end_us ? Number(item.end_us) : NaN;

          if (isNaN(startUs) || isNaN(endUs)) {
            console.warn(`Invalid start_us or end_us: start_us=${startUs}, end_us=${endUs}`);
            return NaN;
          }
          return (endUs - startUs) / 1000; // Latency in seconds
        }).filter(latency => !isNaN(latency));

        const avgLatency = latencies.length > 0 ? latencies.reduce((sum, latency) => sum + latency, 0) / latencies.length : 0;

        setData({
          apps: appsCount,
          avgLatency,
          users: usersSet,
          operations: operationsCount,
          models: modelsSet.size,
          appCount: totalAppCount,
        });
      } else {
        setData(defaultData);
      }
    });
  }, []);

  

  return (
    <Tile className="infrastructure-components">
      <div className="infrastructure-components-content">
        <h5>
          {/* AI applications <span className="count">({data.apps})</span> */}
          Quick Summary (Last 30 days)
        </h5>
        {loading ? (
          <>
          <CodeSnippetSkeleton type="multi" />
          <CodeSnippetSkeleton type="multi" />
          <CodeSnippetSkeleton type="multi" />
          </>
        ) : (
          <div className="types">
          <Tooltip className="button-tooltip" align="top" label={'Your Total No of Application Name'}>
            <Button className="type" kind="ghost">
              <div className="title">
                <div className="indicator engines" />
                <span>Total No of Application Names</span>
              </div>
              <h2>{data.apps}</h2>
              {/* <h2>{moment.duration(data.avgLatency).asSeconds().toFixed(1)} s</h2> */}
            </Button>
          </Tooltip>
          <Tooltip className="button-tooltip" align="top" label={'Total Number of Users you have'}>
            <Button className="type" kind="ghost">
              <div className="title">
                <div className="indicator buckets" />
                <span>Total No of User Names</span>
              </div>
              <h2>{data.users}</h2>
            </Button>
          </Tooltip>
          <Tooltip className="button-tooltip" align="top" label={'Total Number of Applications executed throughout'}>
            <Button className="type" kind="ghost">
              <div className="title">
                <div className="indicator catalogs" />
                <span>Total Applications Executed</span>
              </div>
              <h2>{formatCount(data.appCount)}</h2>
              {/* <h2>{formatCount(data.operations)}</h2> */}
            </Button>
          </Tooltip>
          <Tooltip className="button-tooltip" align="top" label={'Total Number of Models Used in'}>
            <Button className="type" kind="ghost">
              <div className="title">
                <div className="indicator databases" />
                <span>Models used</span>
              </div>
              <h2>{formatCount(data.models)}</h2>
            </Button>
          </Tooltip>
        </div>
        )}
        
      </div>
      {/* <Button kind="ghost" className="bottom-link" href="#/traces">
        <span>Go to application tracing</span>
      </Button> */}
    </Tile>
  );
};

export default TracesTile;