import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
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
  
  const websocketRef = useRef(null);
  const [data, setData] = useState(defaultData);
  const [avg, setAvg] = useState(0);
  const [websocket, setWebsocket] = useState(null);
  const [messageFromServerAbandonment, setMessageFromServerAbandonment] = useState(defaultMessage);

  const { state } = useStoreContext();

  useImperativeHandle(ref, () => ({
    sendMessageToServerAbandonment,
  }));

  // Connect to WebSocket server on component mount
  useEffect(() => {
    const apiUrl = process.env.REACT_APP_WEBSOCKET_URL;
    const ws = new WebSocket(apiUrl);
    websocketRef.current = ws;
    setWebsocket(ws);
    // Cleanup function to close WebSocket connection on component unmount
    return () => {
      ws.close();
    };
  }, []);

  // Function to send message to WebSocket server
  const sendMessageToServerAbandonment = () => {
    var q =
      "SELECT COUNT(*) AS total_count, COUNT(*) FILTER (WHERE status = 'user_abandoned') * 100.0 / COUNT(*) AS user_abandoned_percentage, COUNT(*) FILTER (WHERE status = 'success') * 100.0 / COUNT(*) AS success_percentage, COUNT(*) FILTER (WHERE status = 'failure') * 100.0 / COUNT(*) AS failure_percentage FROM log_history ";
    
    const ws = websocketRef.current;
    
    if (ws) {
      if (ws.readyState === WebSocket.OPEN) {
        const message = {
          tab: "auditing",
          action: q,
        };
        ws.send(JSON.stringify(message));
      } else {
        ws.onopen = () => {
          const message = {
            tab: "auditing",
            action: q,
          };
          ws.send(JSON.stringify(message));
        };
      }
    }
  };

  // Listen for messages from WebSocket server
  useEffect(() => {
    if (websocket) {
      websocket.onmessage = (event) => {
        setMessageFromServerAbandonment(JSON.parse(event.data));
      };
    }
  }, [websocket]);

  // Update chart data when messageFromServerAbandonment changes
  useEffect(() => {
    let newData = defaultData;
    let newAvg = 0;
    let newAvgValue = 0;
    let newAvgValueToNumber = 0;
    if (state.status === "success") {
      const appData = getAppData();

      console.log("Abandonment app data", appData[0].data);

      if (messageFromServerAbandonment.length > 0) {
        newAvgValue = messageFromServerAbandonment[0].user_abandoned_percentage;
        newAvgValueToNumber = parseFloat(newAvgValue);
        console.log("Adoption newAvgValue", newAvgValueToNumber);
        newAvg = newAvgValueToNumber.toFixed(2);
        newData = [
          {
            group: "value",
            value: newAvgValueToNumber || 0,
          },
        ];
      }

      setData(newData);
      setAvg(newAvg);
      console.log("New average Abandonment", newAvg);
    }
  }, [messageFromServerAbandonment]);

  console.log("Abandonment messageFromServer", messageFromServerAbandonment);
  if (messageFromServerAbandonment) {
    console.log(
      "Abandonment messageFromServer.gauge",
      messageFromServerAbandonment[0].user_abandoned_percentage
    );
  }

  // Render
  return (
    <Tile className="infrastructure-components cpu-usage">
      <h5>Abandonment Rate</h5>
      <div className="cpu-usage-chart">
        <GaugeChart data={data} options={options} />
      </div>
      <div className="cpu-usage-data">
        <div className="label">Abandonment Rate</div>
        <h3 className="data">{avg} %</h3>
      </div>
    </Tile>
  );
});

export default AbandonmentRate;