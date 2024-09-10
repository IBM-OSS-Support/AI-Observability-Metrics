import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { Tile } from "@carbon/react";
import { GaugeChart } from "@carbon/charts-react";
import { getAppData } from "../../../appData";
import { useStoreContext } from "../../../store";

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
}

const defaultData = [
  {
    group: 'value',
    value: 0
  }
];

const defaultMessage = [
  {
    failure_percentage: 0,
    total_count: 0
  }
];

const FailureRate = forwardRef((props, ref) => {
  const [data, setData] = useState(defaultData);
  const [avg, setAvg] = useState(0);
  const [messageFromServerFailure, setMessageFromServerFailure] = useState(defaultMessage);
  const [failureNumber, setFailureNumber] = useState(0);
  

  const { state } = useStoreContext();

  useImperativeHandle(ref, () => ({
    sendMessageToServerFailure,
  }));

  // Function to fetch data from the API
  const sendMessageToServerFailure = async (selectedItem, selectedUser) => {
    let query = "SELECT COUNT(*) AS total_count, COUNT(*) FILTER (WHERE status = 'failure') * 100.0 / COUNT(*) AS failure_percentage FROM log_history ";

    if (selectedItem) {
      query = `SELECT COUNT(*) FILTER (WHERE application_name = '${selectedItem}') AS total_count, COUNT(*) FILTER (WHERE status = 'failure') * 100.0 / COUNT(*) AS failure_percentage FROM log_history`;
    }
    if (selectedUser) {
      query = `SELECT COUNT(*) FILTER (WHERE app_user = '${selectedUser}') AS total_count, COUNT(*) FILTER (WHERE status = 'failure' AND app_user = '${selectedUser}') * 100.0 / COUNT(*) AS failure_percentage FROM log_history`;
    }
    if (selectedUser && selectedItem) {
      query = `SELECT COUNT(*) FILTER (WHERE app_user = '${selectedUser}' AND application_name = '${selectedItem}') AS total_count, COUNT(*) FILTER (WHERE status = 'failure' AND app_user = '${selectedUser}' AND application_name = '${selectedItem}') * 100.0 / COUNT(*) AS failure_percentage FROM log_history`;
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

      const data = await response.json();
      setMessageFromServerFailure(data); // Assuming the data format matches the expected structure
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (state.status === 'success') {
      const appData = getAppData();

      console.log('Failure app data', appData[0].data);

      if (messageFromServerFailure.length > 0) {
        const newAvgValue = messageFromServerFailure[0].failure_percentage; 
        const newAvgValueToNumber = parseFloat(newAvgValue);
        const newAvg = newAvgValueToNumber.toFixed(2);
        const number = Math.ceil((newAvgValueToNumber * messageFromServerFailure[0].total_count)/100);
        setFailureNumber(number);

        setData([
          {
            group: 'value',
            value: newAvgValueToNumber || 0
          }
        ]);
        setAvg(newAvg);
        console.log('New average Failure', newAvg);
      }
    }
  }, [messageFromServerFailure, state]);

  return (
    <Tile className="infrastructure-components cpu-usage">
      <h5>Failure Rate</h5>
      <div className="cpu-usage-chart">
        <GaugeChart data={data} options={options} />
      </div>
      <div className="cpu-usage-data">
        <div className="label">Number of jobs failed</div>
        <h3 className="data">{failureNumber}</h3>
      </div>
    </Tile>
  );
});

export default FailureRate;
