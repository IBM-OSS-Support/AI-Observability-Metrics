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
  const [loading, setLoading] = useState(true); // Add loading state

  

  useImperativeHandle(ref, () => ({
    sendMessageToServerCPU,
  }));

  // Function to fetch data from the API
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
        body: JSON.stringify({ query }), // Sending query as body
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      var responseData = await response.json();
      setMessageFromServerCPU(responseData); // Assuming the data format matches the expected structure
    } catch (error) {
      console.error("Error fetching data:", error);
    }finally {
      if (responseData.length > 0) {
        setLoading(false); // Stop loading
      }
    }
  };

  useEffect(() => {
    if (messageFromServerCPU && messageFromServerCPU.length > 0) {
      const cpuUsages = messageFromServerCPU.map(d => d.process_cpu_usage.gauge || 0);
      
      // Calculate the latest CPU usage (most recent value)
      const latestUsage = cpuUsages[cpuUsages.length - 1] || 0;
      const lastUsage = latestUsage.toFixed(2);
      setLatest(lastUsage);

      // Calculate the average CPU usage
      const total = cpuUsages.reduce((sum, gauge) => sum + gauge, 0);
      const newAvgValue = cpuUsages.length > 0 ? total / cpuUsages.length : 0;
      const newAvg = newAvgValue.toFixed(2);
      setAvg(newAvg);

      // Update chart data to reflect the latest value
      setData([{ group: 'value', value: newAvgValue }]);
    }
  }, [messageFromServerCPU]);

  return (
    <>
    {
      loading ? (
        <Tile className="infrastructure-components cpu-usage">
           <h4 className="title">
            Average CPU Usage
          </h4>
          <CodeSnippetSkeleton type="multi" />
          <CodeSnippetSkeleton type="multi" />
        </Tile>
      ) : (
         data.length > 0 ? (
            <Tile className="infrastructure-components cpu-usage">
           <h4 className="title">
            Average CPU Usage
          </h4>
          <p>
            <ul className="sub-title">
              <li><strong>User Name:</strong> { `${selectedUser || 'For All User Name'}`}</li>
              <li><strong>Application Name:</strong> { `${selectedItem || 'For All Application Name'}`}</li>
            </ul>
          </p>
          <div className="cpu-usage-chart">
            <GaugeChart data={data} options={options} />
          </div>
          <div className="cpu-usage-data">
            <div className="label"> 
              Last
              {selectedUser && selectedItem 
                ? ` ${selectedUser}'s ${selectedItem} ` 
                : selectedUser 
                  ? selectedUser === 'all' ? ` of ${selectedUser} ` : ` ${selectedUser}'s ` 
                  : selectedItem 
                    ? ` ${selectedItem}'s ` 
                    : ' of all '} 
               CPU Usage
            </div>
            <h3 className="data">{latest} %</h3>
          </div>
        </Tile>
          ) : (
            <Tile className="infrastructure-components cpu-usage">
           <h4 className="title">
            Average CPU Usage
          </h4>
          <NoData />
        </Tile>
          )
        
      )
    }
    </>
  );
});

export default CpuUsage;
