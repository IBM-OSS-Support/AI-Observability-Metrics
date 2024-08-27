import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
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
    process_cpu_usage: { gauge: 0 },
  },
];

const UserSatisfaction = forwardRef((props, ref) => {
  const websocketRef = useRef(null);
  const [data, setData] = useState(defaultData);
  const [avg, setAvg] = useState(0);
  const [messageFromServerUser, setMessageFromServerUser] = useState(defaultMessage);

  const { state } = useStoreContext();

  useImperativeHandle(ref, () => ({
    sendMessageToServerUser,
  }));

  // Connect to WebSocket server on component mount
  useEffect(() => {
    const apiUrl = process.env.REACT_APP_WEBSOCKET_URL;
    console.log('API URL', apiUrl);
    console.log('Process.env', process.env);
    const ws = new WebSocket(apiUrl);
    websocketRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connection established');
      sendMessageToServerUser();
    };

    ws.onmessage = (event) => {
      setMessageFromServerUser(JSON.parse(event.data));
    };

    // Cleanup function to close WebSocket connection on component unmount
    return () => {
      ws.close();
    };
  }, []);

  // Function to send message to WebSocket server
  const sendMessageToServerUser = () => {
    const q = "SELECT * FROM user_satisfaction"

    const ws = websocketRef.current;
    console.log("inside adoption ws:", ws);
    if (ws && ws.readyState === WebSocket.OPEN) {
      const message = {
        tab: "auditing",
        action: q,
      };
      ws.send(JSON.stringify(message));
    }
  };

  

  // Update chart data when messageFromServerUser changes
  useEffect(() => {
    let newData = defaultData;
    let newAvg = 0;
    let newAvgValue = 0;
    if (state.status === "success") {
      const appData = getAppData();

      console.log("User app data", appData[0].data);

      if (messageFromServerUser.length > 0) {
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
  }, [messageFromServerUser]);

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
      <div className="cpu-usage-chart">
        <GaugeChart data={data} options={options} />
      </div>
      <div className="cpu-usage-data">
        <div className="label">Average rating</div>
        <h3 className="data">{avg} %</h3>
      </div>
    </Tile>
  );
});

export default UserSatisfaction;
