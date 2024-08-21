import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Tile } from "@carbon/react";
import { StackedBarChart } from "@carbon/charts-react";
import { getAppData } from "../../../appData";
import { useStoreContext } from "../../../store";
import { Maximize } from "@carbon/icons-react";

const options = {
  theme: "g100",
  title: "Average Token per Session",
  axes: {
    left: {
      mapsTo: "value",
      stacked: true
    },
    bottom: {
      mapsTo: "key",
      scaleType: "labels",
    }
  },
  legend: {
    position: 'top'
  },
  toolbar: {
    enabled: true,
    controls: [{
      type: "Make fullscreen"
    }],
    text: "Make fullscreen",
    iconSVG: {
      content: Maximize
    },
    shouldBeDisabled: false
  },
  tooltip: {
    truncation: {
      numCharacter: 20
    },
    groupLabel: 'count of',
  },
  height: "100%",
  color: {
    scale: {
      Dataset1: "#5281d8"
    },
  },
};

const defaultData = [
  {
    group: "value",
    key: "Count",
    value: 0
  }
];

const defaultMessage = [
  {
    usage: { counter: 0 }
  }
];

const TokenPerSession1 = forwardRef(({ selectedItem, selectedUser }, ref) => {
  const websocketRef = useRef(null);
  const [data, setData] = useState(defaultData);
  const [avg, setAvg] = useState(0);
  const [websocket, setWebsocket] = useState(null);
  const [messageFromServerToken, setMessageFromServerToken] = useState(defaultMessage);

  const { state } = useStoreContext();

  useImperativeHandle(ref, () => ({
    sendMessageToServerToken,
  }));

  // Connect to WebSocket server on component mount
  useEffect(() => {
    const apiUrl = process.env.REACT_APP_WEBSOCKET_URL;
    const ws = new WebSocket(apiUrl);
    console.log("WebSocket connected:", ws);
    websocketRef.current = ws;
    setWebsocket(ws);
    // Cleanup function to close WebSocket connection on component unmount
    return () => {
      ws.close();
      console.log("WebSocket closed");
    };
  }, []);

  // Function to send message to WebSocket server
  const sendMessageToServerToken = (selectedItem, selectedUser, selectedTimeWindow) => {
    let q = "SELECT * FROM anthropic_metrics WHERE 1=1";
  
    if (selectedItem) {
      q += ` AND application_name = '${selectedItem}'`;
    }
    if (selectedUser) {
      q += ` AND app_user = '${selectedUser}'`;
    }
    if (selectedTimeWindow) { debugger
      let timeCondition = '';
      const now = new Date();
      switch (selectedTimeWindow) {
        case 'Last Day':
          timeCondition = ` AND timestamp >= '${new Date(now - 1 * 24 * 60 * 60 * 1000).toISOString()}'`;
          break;
        case 'Last 5 Days':
          timeCondition = ` AND timestamp >= '${new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString()}'`;
          break;
        case 'Last 10 Days':
          timeCondition = ` AND timestamp >= '${new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString()}'`;
          break;
        default:
          break;
      }
      q += timeCondition;
    }
  
    console.log("Sending query:", q);
  
    const ws = websocketRef.current;
  
    if (ws) {
      const message = {
        tab: "auditing",
        action: q
      };
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
        console.log("Message sent:", message);
      } else {
        ws.onopen = () => {
          ws.send(JSON.stringify(message));
          console.log("Message sent after WebSocket open:", message);
        };
      }
    }
  };
  

  // Listen for messages from WebSocket server
  useEffect(() => {
    if (websocket) {
      websocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setMessageFromServerToken(data);
        console.log("Message received from server:", data);
      };
    }
  }, [websocket]);

  // Update chart data when messageFromServerToken changes
  useEffect(() => {
    if (state.status === "success") {
      if (messageFromServerToken.length > 0) {
        const cpuUsages = messageFromServerToken.map((d) => {
          const cpuUsage = d.total_count;
          return cpuUsage ? Number(cpuUsage) : 0;
        });

        const filteredCpuUsages = cpuUsages.filter((value) => typeof value === "number" && !isNaN(value));

        console.log("CPU Usages:", cpuUsages);
        console.log("Filtered CPU Usages:", filteredCpuUsages);

        const total = filteredCpuUsages.reduce((s, g) => s + g, 0);
        const newAvgValue = filteredCpuUsages.length > 0 ? total / filteredCpuUsages.length : 0;
        const newAvg = newAvgValue.toFixed(2);

        setData([
          {
            group: "value",
            key: "Average",
            value: newAvgValue
          }
        ]);
        setAvg(newAvg);

        console.log("New average token:", newAvg);
      } else {
        // Reset data to default if no message from server
        setData(defaultData);
        setAvg(0);
      }
    }
  }, [messageFromServerToken, state.status]);

  console.log("Current messageFromServerToken:", messageFromServerToken);

  // Render
  return (
    <Tile>
      <StackedBarChart data={data} options={options} />
      <div className="cpu-usage-data">
        <div className="label">Average Tokens per Session</div>
        <h3 className="data">{avg}</h3>
      </div>
    </Tile>
  );
});

export default TokenPerSession1;
