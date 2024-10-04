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
import React, { useEffect, useState } from "react";
import moment from "moment";

// Components ----------------------------------------------------------------->
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
    usage: { counter: 0 },
  },
];

const TokenPerSession = () => {
  const [data, setData] = useState(defaultData);
  const [avg, setAvg] = useState(0);
  const [websocket, setWebsocket] = useState(null);
  const [messageFromServerToken, setMessageFromServerToken] =
    useState(defaultMessage);

  const { state } = useStoreContext();

  // Connect to WebSocket server on component mount
  useEffect(() => {
    const apiUrl = process.env.REACT_APP_WEBSOCKET_URL;
    const ws = new WebSocket(apiUrl);
    setWebsocket(ws);
    // Cleanup function to close WebSocket connection on component unmount
    return () => {
      ws.close();
    };
  }, []);

  // Function to send message to WebSocket server
  const sendMessageToServerToken = () => {
    var q =
      "SELECT usage,application_name,token_cost FROM token_usage WHERE id BETWEEN 9 AND 17";
    if (websocket && websocket.readyState === WebSocket.OPEN) {
      const message = {
        tab: "auditing",
        action: q,
      };
      websocket.send(JSON.stringify(message));
    }
  };

  // Listen for messages from WebSocket server
  useEffect(() => {
    if (websocket) {
      websocket.onmessage = (event) => {
        setMessageFromServerToken(JSON.parse(event.data));
      };
    }
  }, [websocket]);

  //start

  useEffect(() => {
    let newData = defaultData;
    let newAvg = 0;
    let newAvgValue = 0;
    if (state.status === "success") {
      const appData = getAppData();

      if (messageFromServerToken) {
        const cpuUsages = messageFromServerToken.map((d) => {
          if (d.usage.token_count) {
            const cpuUsage = d.usage.token_count.counter;
            let gauge = 0;
            if (cpuUsage) {
              gauge = cpuUsage;
            }
            return gauge;
          }
        });

        const filteredCpuUsages = cpuUsages.filter(
          (value) => typeof value === "number"
        );

        newAvgValue =
          filteredCpuUsages.reduce((s, g) => s + +g, 0) /
          filteredCpuUsages.length;
        newAvg = newAvgValue.toFixed(2);
        newData = [
          {
            group: "value",
            value: newAvgValue || 0,
          },
        ];
      }

      setData(newData);
      setAvg(newAvg);
    }
  }, messageFromServerToken);

  //end

  // Render
  return (
    <Tile className="infrastructure-components cpu-usage">
      <h5>Average Token per Session</h5>
      <button onClick={sendMessageToServerToken}>Load graph</button>
      <div className="cpu-usage-chart">
        <GaugeChart data={data} options={options} />
      </div>
      <div className="cpu-usage-data">
        <div className="label">Average Token per Session</div>
        <h3 className="data">{avg} %</h3>
      </div>
    </Tile>
  );
};

export default TokenPerSession;
