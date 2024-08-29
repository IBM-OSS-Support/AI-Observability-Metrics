import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Tile } from "@carbon/react";
import { MeterChart } from "@carbon/charts-react";
import { useStoreContext } from "../../../store";

const getColorByValue = (value) => {
  if (value >= 8) return "#00bfae"; // Excellent
  if (value >= 4) return "#f1c21b"; // Good
  return "#f46666"; // Bad
};

const getStatusText = (value) => {
  if (value >= 8) return "Excellent";
  if (value >= 4) return "Good";
  return "Bad";
};

const options = (color, statusText, selectedUser) => ({
  theme: "g90",
  resizable: true,
  height: '80%',
  width: '100%',
  meter: {
    proportional: {
      total: 10,
      totalFormatter: e => statusText,
      breakdownFormatter: e => `The accuracy score of the application is ${e.datasetsTotal} out of 10`
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

const Accuracy = forwardRef(({ selectedItem, selectedUser, startDate, endDate }, ref) => {
  const websocketRef = useRef(null);
  const [data, setData] = useState(defaultData);
  const [avg, setAvg] = useState(0);
  const [websocket, setWebsocket] = useState(null);
  const [messageFromServerAccuracy, setMessageFromServerAccuracy] = useState(null);
  const [chartOptions, setChartOptions] = useState(options("#f46666", "Bad")); // Default options

  const { state } = useStoreContext();

  useImperativeHandle(ref, () => ({
    sendMessageToServerAccuracy,
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

  const sendMessageToServerAccuracy = (selectedItem, selectedUser, startDate, endDate) => {
    let q = 'SELECT * FROM accuracy';

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

    console.log('q from accuracy', q);
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
        setMessageFromServerAccuracy(JSON.parse(event.data));
      };
    }
  }, [websocket]);

  useEffect(() => {
    if (messageFromServerAccuracy && state.status === 'success') {
      const accuracyScore = messageFromServerAccuracy.map(d => d.accuracy_score || 0);

      const newAvgValue = accuracyScore.reduce((s, g) => s + +g, 0) / accuracyScore.length;
      const newAvg = newAvgValue.toFixed(2);

      const newData = [
        {
          group: 'Accuracy score',
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
 }, [messageFromServerAccuracy, state.status]);

  return (
    <Tile className="infrastructure-components accuracy">
      <h5>Accuracy Score</h5>
      <div className="cpu-usage-chart">
        <MeterChart data={data} options={chartOptions} />
      </div>
      <div className="cpu-usage-data">
        <div className="label">Average accuracy of application is</div>
        <h3 className="data">{avg}/10</h3>
      </div>
    </Tile>
  );
});

export default Accuracy;
