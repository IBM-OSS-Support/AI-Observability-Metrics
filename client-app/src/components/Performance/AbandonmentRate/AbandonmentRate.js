import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { Tile } from "@carbon/react";
import { GaugeChart } from "@carbon/charts-react";
import { getAppData } from "../../../appData";
import { useStoreContext } from "../../../store";

const options = {
  theme: "g90",
  title: "",
  resizable: true,
  height: "80%",
  width: "100%",
  gauge: {
    alignment: "center",
    type: "semi",
    status: "danger",
    arcWidth: 24,
  },
  legend: {
    enabled: false,
  },
  toolbar: {
    enabled: false,
  },
  color: {
    scale: {
      value: "#136e6d",
    },
  },
};

const defaultData = [
  {
    group: "value",
    value: 0,
  },
];

const defaultMessage = [
  {
    percentage_usage: 0,
  },
];

const AbandonmentRate = forwardRef((props, ref) => {
  const [data, setData] = useState(defaultData);
  const [avg, setAvg] = useState(0);
  const [messageFromServerAbandonment, setMessageFromServerAbandonment] = useState(defaultMessage);

  const { state } = useStoreContext();

  useImperativeHandle(ref, () => ({
    sendMessageToServerAbandonment,
  }));

  // Function to fetch data from the API
  const sendMessageToServerAbandonment = async (selectedItem, selectedUser) => {
    let query = `SELECT COUNT(*) AS total_count, COUNT(*) FILTER (WHERE status = 'user_abandoned') * 100.0 / COUNT(*) AS user_abandoned_percentage FROM log_history`;
    
    if (selectedItem) {
      query = `SELECT COUNT(*) FILTER (WHERE application_name = '${selectedItem}') AS total_count, COUNT(*) FILTER (WHERE status = 'user_abandoned') * 100.0 / COUNT(*) AS user_abandoned_percentage FROM log_history`;
    }
    if (selectedUser) {
      query = `SELECT COUNT(*) FILTER (WHERE app_user = '${selectedUser}') AS total_count, COUNT(*) FILTER (WHERE status = 'user_abandoned' AND app_user = '${selectedUser}') * 100.0 / COUNT(*) AS user_abandoned_percentage FROM log_history`;
    }
    if (selectedUser && selectedItem) {
      query = `SELECT COUNT(*) FILTER (WHERE app_user = '${selectedUser}' AND application_name = '${selectedItem}') AS total_count, COUNT(*) FILTER (WHERE status = 'user_abandoned' AND app_user = '${selectedUser}' AND application_name = '${selectedItem}') * 100.0 / COUNT(*) AS user_abandoned_percentage FROM log_history`;
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
      setMessageFromServerAbandonment(data); // Assuming the data format matches the expected structure
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (state.status === "success") {
      const appData = getAppData();

      console.log("Abandonment app data", appData[0].data);

      if (messageFromServerAbandonment.length > 0) {
        const newAvgValue = messageFromServerAbandonment[0].user_abandoned_percentage;
        const newAvgValueToNumber = parseFloat(newAvgValue);
        const newAvg = newAvgValueToNumber.toFixed(2);

        setData([
          {
            group: "value",
            value: newAvgValueToNumber || 0,
          },
        ]);
        setAvg(newAvg);
        console.log("New average Abandonment", newAvg);
      }
    }
  }, [messageFromServerAbandonment, state]);

  return (
    <Tile className="infrastructure-components cpu-usage">
      <h5>Abandonment Rate</h5>
      <div className="cpu-usage-chart">
        <GaugeChart data={data} options={options} />
      </div>
      <div className="cpu-usage-data">
        <div className="label">Total Count</div>
        <h3 className="data">{messageFromServerAbandonment[0].total_count}</h3>
      </div>
    </Tile>
  );
});

export default AbandonmentRate;
