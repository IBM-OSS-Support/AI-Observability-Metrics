import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Tile } from "@carbon/react";
import { MeterChart } from "@carbon/charts-react";
import { useStoreContext } from "../../../store";
import NoData from "../../common/NoData/NoData";

const getColorByValue = (value) => {
  if (value >= 4) return "#00bfae"; // Excellent
  if (value >= 3) return "#f1c21b"; // Good
  return "#f46666"; // Bad
};

const getStatusText = (value) => {
  if (value >= 4) return "Excellent";
  if (value >= 3) return "Good";
  return "Bad";
};

const options = (color, statusText) => ({
  theme: "g90",
  resizable: true,
  height: '80%',
  width: '100%',
  meter: {
    proportional: {
      total: 5,
      totalFormatter: e => statusText,
      breakdownFormatter: e => `The rating of the application is ${e.datasetsTotal.toFixed(2)} out of 5`
    },
    height: '70%',
    width: '150%'
    },
    color: {
      pairing: {
        option: 2
      }
    },
  toolbar: {
    enabled: false
  },
});


const defaultData = [
  {
    group: '',
    value: 0
  }
];

const UserSatisfaction = forwardRef(({ selectedItem, selectedUser, startDate, endDate }, ref) => {
  const websocketRef = useRef(null);
  const [data, setData] = useState(defaultData);
  const [avg, setAvg] = useState(0);
  const [websocket, setWebsocket] = useState(null);
  const [messageFromServerUser, setMessageFromServerUser] = useState(null);
  const [chartOptions, setChartOptions] = useState(options("#f46666", "Bad")); // Default options

  const { state } = useStoreContext();

  useImperativeHandle(ref, () => ({
    sendMessageToServerUser,
  }));

  useEffect(() => {
    const apiUrl = process.env.REACT_APP_WEBSOCKET_URL;
    const ws = new WebSocket(apiUrl);
    websocketRef.current = ws;
    setWebsocket(ws);
    return () => {
      ws.close();
    };
  }, []);

  const sendMessageToServerUser = (selectedItem, selectedUser, startDate, endDate) => {
    let q = "SELECT * FROM user_satisfaction";

    // Add filtering logic based on selectedItem, selectedUser, and selectedTimestampRange
    if (selectedItem && !selectedUser) {
      q += ` WHERE application_name = '${selectedItem}'`;
    }
    if (selectedUser && !selectedItem) {
      q += ` WHERE app_user = '${selectedUser}'`;
    }
    if (selectedUser && selectedItem) {
      q += ` WHERE application_name = '${selectedItem}' AND app_user = '${selectedUser}'`;
    }

    console.log("q from application rating", q);
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

  useEffect(() => {
    if (websocket) {
      websocket.onmessage = (event) => {
        setMessageFromServerUser(JSON.parse(event.data));
      };
    }
  }, [websocket]);

  useEffect(() => {
    if (messageFromServerUser && state.status === 'success') {

      let filteredData = messageFromServerUser;

    if (startDate && endDate) {
      const convertUTCToIST = (utcDateString) => {
        const utcDate = new Date(utcDateString);
        const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
        return new Date(utcDate.getTime() + istOffset); // Returns a Date object in IST
      };

      filteredData = messageFromServerUser.filter((accuracy) => {
        const timestamp = convertUTCToIST(accuracy.timestamp);
        console.log("Converted timestamp:", timestamp);

        // Log the comparison for debugging
        console.log("Is timestamp within range:", timestamp >= startDate && timestamp <= endDate);

        return timestamp >= startDate && timestamp <= endDate;
      });
    };

      console.log("Filtered Data:", filteredData);
      const UserRating = filteredData.map(d => d.rating || 0);

      const newAvgValue = UserRating.reduce((s, g) => s + +g, 0) / UserRating.length;
      const newAvg = newAvgValue.toFixed(2);

      const newData = [
        {
          group: 'User rating',
          value: newAvgValue // Ensure the value is between 0 and 10
        }
      ];

      // Determine chart color and status text based on the average value
      const chartColor = getColorByValue(newAvgValue);
      const statusText = getStatusText(newAvgValue);

      console.log('chartColor and statusText =' , chartColor , statusText);

      setData(newData);
      setAvg(newAvg);
      setChartOptions(options(chartColor, statusText));
    }
  }, [messageFromServerUser, state.status]);

  console.log('messageFromServerUser', messageFromServerUser);

  return (
    <Tile className="infrastructure-components accuracy">
      <h5>Application Rating</h5>
      <div className="cpu-usage-chart">
    {avg > 0 ? (
      <MeterChart data={data} options={chartOptions} />
      
    ) : (
      <NoData />
    )}
  </div>
  <div className="cpu-usage-data">
    {avg > 0 ? (
      <>
        <div className="label">
            {selectedUser && selectedItem ? (
              `Average rating of ${selectedItem} is`
            ) : (
              `Average rating of ${selectedUser} Application is`
            )}
          </div>
        <h3 className="data">{avg}/5</h3>
      </>
    ) : (
      <div className="label">
      </div>
    )}
  </div>
    </Tile>
  );
});

export default UserSatisfaction;
