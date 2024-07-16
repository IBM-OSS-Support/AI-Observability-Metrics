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
import { Dropdown, Tile } from "@carbon/react";
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
    process_cpu_usage: { gauge: 0 },
  },
];

const UserSatisfaction = () => {
  const [data, setData] = useState(defaultData);
  const [avg, setAvg] = useState(0);
  const [websocket, setWebsocket] = useState(null);
  const [messageFromServerUser, setMessageFromServerUser] = useState(defaultMessage);

  const { state } = useStoreContext();

  // Connect to WebSocket server on component mount
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");
    console.log('ws', ws);
    setWebsocket(ws);
    // Cleanup function to close WebSocket connection on component unmount
    return () => {
      ws.close();
    };
  }, []);

  // Function to send message to WebSocket server
  const sendMessageToServerUser = () => {
    var q = "SELECT * FROM user_satisfaction";
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
        setMessageFromServerUser(JSON.parse(event.data));
      };
    }
  }, [websocket]);

  // start

  useEffect(() => {
    let newData = defaultData;
    let newAvg = 0;
    let newAvgValue = 0;
    if (state.status === "success") {
      const appData = getAppData();

      console.log("User app data", appData[0].data);

      if (messageFromServerUser) {
        const cpuUsages = messageFromServerUser.map((d) => {
          const cpuUsage = d.rating;
          let gauge = 0;
          console.log("CPUUsage in User", cpuUsage);
          if (cpuUsage) {
            gauge = cpuUsage;
          }
          return gauge;
        });
        console.log("CPUUsages in User", cpuUsages);
        newAvgValue = cpuUsages.reduce((s, g) => s + +g, 0) / cpuUsages.length;
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
      console.log("New average in User", newAvg);
    }
  }, messageFromServerUser);

  console.log("User messageFromServer", messageFromServerUser);
  if (messageFromServerUser) {
    console.log(
      "User messageFromServer.gauge",
      messageFromServerUser[0].rating
    );
  }
  //end

  // Render
  return (
    <Tile className="infrastructure-components cpu-usage">
      <h5>Average rating of Application</h5>
        <button onClick={sendMessageToServerUser}>Load graph</button>
      <div className="cpu-usage-chart">
        <GaugeChart data={data} options={options} />
      </div>
      <div className="cpu-usage-data">
        <div className="label">Average rating</div>
        <h3 className="data">{avg} %</h3>
      </div>
    </Tile>
  );
};

export default UserSatisfaction;
