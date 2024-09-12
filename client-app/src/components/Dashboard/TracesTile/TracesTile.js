import React, { useEffect, useState } from "react";
import moment from "moment";
import { Button, Tile, Tooltip } from "@carbon/react";
import { useStoreContext } from "../../../store";
import { formatCount } from "../../../utils/data-utils";

const defaultData = {
  apps: 0,
  avgLatency: 0,
  users: 0,
  operations: 0,
  models: 0,
};

const TracesTile = () => {
  const [data, setData] = useState(defaultData);
  const { state } = useStoreContext();

  // API Call to fetch trace data
  const fetchTraceData = async () => {
    const apiUrl = process.env.REACT_APP_BACKEND_API_URL; // Replace with actual API endpoint

    const operationsQuery = `SELECT * FROM operations`;
    const performanceQuery = `SELECT * FROM performance`; // Adjust the query as needed

    try {
      const [operationsResponse, performanceResponse] = await Promise.all([
        fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: operationsQuery }),
        }),
        fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: performanceQuery }),
        }),
      ]);

      if (!operationsResponse.ok || !performanceResponse.ok) {
        throw new Error("Network response was not ok");
      }

      const [operationsData, performanceData] = await Promise.all([
        operationsResponse.json(),
        performanceResponse.json(),
      ]);

      console.log("Operations Data:", operationsData);
      console.log("Performance Data:", performanceData);

      return { operationsData, performanceData };
    } catch (error) {
      console.error("Error fetching trace data:", error);
      return { operationsData: [], performanceData: [] };
    }
  };

  useEffect(() => {
    fetchTraceData().then(({ operationsData, performanceData }) => {
      if (operationsData.length > 0 || performanceData.length > 0) {
        // Process operations data
        const appsCount = new Set(operationsData.map(item => item.application_name)).size;
        const usersSet = new Set(operationsData.flatMap(item => item.tags.filter(tag => tag.key === 'user').map(tag => tag.value)));
        const modelsSet = new Set(operationsData.flatMap(item => item.tags.filter(tag => tag.key === 'model').map(tag => tag.value)));
        const operationsCount = operationsData.length;

        // Process performance data
        const latencies = performanceData.map(item => {
          const startUs = item.start_us ? Number(item.start_us) : NaN;
          const endUs = item.end_us ? Number(item.end_us) : NaN;
          console.log(`Processing item: start_us=${startUs}, end_us=${endUs}`);

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
          users: usersSet.size,
          operations: operationsCount,
          models: modelsSet.size,
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
          Quick Summary
        </h5>
        <div className="types">
          <Tooltip className="button-tooltip" align="top" label={'Your Total AI Applications'}>
            <Button className="type" kind="ghost">
              <div className="title">
                <div className="indicator engines" />
                <span>Total AI applications</span>
              </div>
              <h2>{data.apps}</h2>
              {/* <h2>{moment.duration(data.avgLatency).asSeconds().toFixed(1)} s</h2> */}
            </Button>
          </Tooltip>
          <Tooltip className="button-tooltip" align="top" label={'Total Number of Users you have'}>
            <Button className="type" kind="ghost">
              <div className="title">
                <div className="indicator buckets" />
                <span>Users</span>
              </div>
              <h2>{formatCount(data.users)}</h2>
            </Button>
          </Tooltip>
          <Tooltip className="button-tooltip" align="top" label={'Total Number of Operations done throughout'}>
            <Button className="type" kind="ghost">
              <div className="title">
                <div className="indicator catalogs" />
                <span>Total operations</span>
              </div>
              <h2>{formatCount(data.operations)}</h2>
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
      </div>
      {/* <Button kind="ghost" className="bottom-link" href="#/traces">
        <span>Go to application tracing</span>
      </Button> */}
    </Tile>
  );
};

export default TracesTile;
