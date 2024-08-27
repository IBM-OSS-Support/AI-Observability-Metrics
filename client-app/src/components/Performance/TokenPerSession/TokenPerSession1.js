/* ******************************************************************************
 * IBM Confidential
 *
 * OCO Source Materials
 *
 *  Copyright IBM Corp. 2023  All Rights Reserved.
 *
 * The source code for this program is not published or otherwise divested
 * of its trade secrets, irrespective of what has been deposited with
 * the U.S. Copyright Office.
 ****************************************************************************** */
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
    controls:[{
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

const TokenPerSession1 = forwardRef((props, ref) => {
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
    console.log("ws", ws);
    websocketRef.current = ws;
    setWebsocket(ws);
    // Cleanup function to close WebSocket connection on component unmount
    return () => {
      ws.close();
    };
  }, []);

  // Function to send message to WebSocket server
  const sendMessageToServerToken = () => {
    const q = "SELECT application_name, total_count FROM anthropic_metrics";
    const ws = websocketRef.current;
    
    if (ws) {
      if (ws.readyState === WebSocket.OPEN) {
        const message = {
          tab: "auditing",
          action: q
        };
        ws.send(JSON.stringify(message));
      } else {
        ws.onopen = () => {
          const message = {
            tab: "auditing",
            action: q
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
        setMessageFromServerToken(JSON.parse(event.data));
        console.log("Token messageFromServer inside useEffect", messageFromServerToken);
      };
    }
  }, [websocket]);

  // Update chart data when messageFromServerToken changes
  useEffect(() => {
    let newData = defaultData;
    let newAvg = 0;
    let newAvgValue = 0;
    if (state.status === "success") {
      const appData = getAppData();
  
      console.log("Token app data", appData[0].data);
  
      if (messageFromServerToken.length > 0) {
        const cpuUsages = messageFromServerToken.map((d) => {
          if (d.total_count) {
            const cpuUsage = d.total_count;
            let gauge = 0;
            console.log("CPUUsage in Token", cpuUsage);
            if (cpuUsage) {
              gauge = Number(cpuUsage);
            }
            return gauge;
          }
          return 0; // return 0 for entries without total_count to keep the data structure consistent
        });

        const filteredCpuUsages = cpuUsages.filter((value) => typeof value === "number");

        console.log("CPUUsages in Token", cpuUsages);
        console.log("filteredCpuUsages in Token", filteredCpuUsages);
        newAvgValue = filteredCpuUsages.reduce((s, g) => s + +g, 0) / filteredCpuUsages.length;
        newAvg = newAvgValue.toFixed(2);
        newData = [
          {
            group: "value",
            key: "Average",
            value: newAvgValue || 0
          }
        ];
      }
  
      setData(newData);
      setAvg(newAvg);
      console.log("New average", newAvg);
    }
  }, [messageFromServerToken, state.status]);

  console.log("Json object =", typeof messageFromServerToken[0].json_object);
  console.log("Token messageFromServer1", messageFromServerToken);

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
