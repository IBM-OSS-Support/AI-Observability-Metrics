import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { CodeSnippetSkeleton, Tile } from "@carbon/react";
import { GaugeChart } from "@carbon/charts-react";
import { useStoreContext } from "../../../store";
import NoData from "../../common/NoData/NoData";

const options = {
  theme: "g90",
  title: '',
  resizable: true,
  height: '80%',
  width: '100%',
  gauge: {
    alignment: 'center',
    type: 'semi',
    status: 'danger',
    arcWidth: 24
  },
  legend: {
    enabled: false
  },
  toolbar: {
    enabled: false
  },
  color: {
    scale: {
      value: '#136e6d'
    }
  }
};

const defaultMessage = [];

const CpuUsage = forwardRef(({ selectedItem, selectedUser }, ref) => {
  const [data, setData] = useState([]);
  const [latest, setLatest] = useState(0);
  const [avg, setAvg] = useState(0);
  const [messageFromServerCPU, setMessageFromServerCPU] = useState(defaultMessage);
  const [loading, setLoading] = useState(true);

  useImperativeHandle(ref, () => ({
    sendMessageToServerCPU,
  }));

  const sendMessageToServerCPU = async (selectedItem, selectedUser) => {
    let query = 'SELECT process_cpu_usage FROM system';

    if (selectedItem) {
      query += ` WHERE application_name = '${selectedItem}'`;
    }
    if (selectedUser) {
      query += selectedItem ? ` AND app_user = '${selectedUser}'` : ` WHERE app_user = '${selectedUser}'`;
    }

    try {
      const apiUrl = process.env.REACT_APP_BACKEND_API_URL;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const responseData = await response.json();
      setMessageFromServerCPU(responseData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (messageFromServerCPU && messageFromServerCPU.length > 0) {
      const cpuUsages = messageFromServerCPU.map(d => {
        if (d.process_cpu_usage && d.process_cpu_usage.gauge != null) {
          return d.process_cpu_usage.gauge;
        }
        return 0; // Default to 0 if gauge is not available
      });

      if (cpuUsages.length > 0) {
        const latestUsage = cpuUsages[cpuUsages.length - 1];
        setLatest(latestUsage.toFixed(2));

        const total = cpuUsages.reduce((sum, gauge) => sum + gauge, 0);
        const newAvg = (total / cpuUsages.length).toFixed(2);
        setAvg(newAvg);

        setData([{ group: 'value', value: parseFloat(newAvg) }]);
      }
    }
  }, [messageFromServerCPU]);
  

  return (
    <>
      {
        loading ? (
          <Tile className="infrastructure-components cpu-usage">
            <h4 className="title">Average CPU Usage</h4>
            <CodeSnippetSkeleton type="multi" />
            <CodeSnippetSkeleton type="multi" />
          </Tile>
        ) : (
          data.length > 0 ? (
            <Tile className="infrastructure-components cpu-usage">
              <h4 className="title">Average CPU Usage</h4>
              <p>
                <ul className="sub-title">
                  <li><strong>User Name:</strong> {selectedUser || 'For All User Name'}</li>
                  <li><strong>Application Name:</strong> {selectedItem || 'For All Application Name'}</li>
                </ul>
              </p>
              <div className="cpu-usage-chart">
                <GaugeChart data={data} options={options} />
              </div>
              <div className="cpu-usage-data">
                <div className="label">
                  Last {selectedUser && selectedItem ? `${selectedUser}'s ${selectedItem}` : selectedUser ? (selectedUser === 'all' ? ' of all users' : `${selectedUser}'s`) : selectedItem ? `${selectedItem}'s` : ' of all '} CPU Usage
                </div>
                <h3 className="data">{latest} %</h3>
              </div>
            </Tile>
          ) : (
            <Tile className="infrastructure-components cpu-usage">
              <h4 className="title">Average CPU Usage</h4>
              <NoData />
            </Tile>
          )
        )
      }
    </>
  );
});

export default CpuUsage;
