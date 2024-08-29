import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Tile } from "@carbon/react";
import { StackedBarChart } from "@carbon/charts-react";
import { Maximize } from "@carbon/icons-react";
import moment from 'moment';
import NoData from "../../common/NoData/NoData";

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

const TokenPerSession1 = forwardRef(({ selectedItem, selectedUser, selectedTimestampRange, startDate, endDate }, ref) => {
  const websocketRef = useRef(null);
  const [data, setData] = useState(defaultData);
  const [avg, setAvg] = useState(0);
  const [websocket, setWebsocket] = useState(null);
  const [messageFromServerToken, setMessageFromServerToken] = useState(defaultMessage);
  const [startDateState, setStartDateState] = useState(startDate);
  const [endDateState, setEndDateState] = useState(endDate);

  useImperativeHandle(ref, () => ({
    sendMessageToServerToken,
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

  const sendMessageToServerToken = (selectedItem, selectedUser, startDate, endDate) => {
    let q = "SELECT * FROM anthropic_metrics WHERE 1=1";
  
    if (selectedItem) {
      q += ` AND application_name = '${selectedItem}'`;
    }
    if (selectedUser) {
      q += ` AND app_user = '${selectedUser}'`;
    }
    if (startDate && endDate) {
      q += ` AND timestamp >= '${startDate.toISOString()}' AND timestamp <= '${endDate.toISOString()}'`;
    }
  
    const ws = websocketRef.current;
  
    if (ws) {
      const message = {
        tab: "auditing",
        action: q
      };
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      } else {
        ws.onopen = () => {
          ws.send(JSON.stringify(message));
        };
      }
    }
  };

  useEffect(() => {
    if (websocket) {
      websocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setMessageFromServerToken(data);
      };
    }
  }, [websocket]);

  useEffect(() => {
    if (startDateState && endDateState) {
      sendMessageToServerToken(selectedItem, selectedUser, startDateState, endDateState);
    }
  }, [startDateState, endDateState, selectedItem, selectedUser]);

  useEffect(() => {
    if (messageFromServerToken.length > 0) {
      const cpuUsages = messageFromServerToken.map((d) => {
        const cpuUsage = d.total_count;
        return cpuUsage ? Number(cpuUsage) : 0;
      });

      const filteredCpuUsages = cpuUsages.filter((value) => typeof value === "number" && !isNaN(value));

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
    } else {
      setData(defaultData);
      setAvg(0);
    }
  }, [messageFromServerToken]);

  return (
    <>
    {messageFromServerToken.length > 0 ? (
      <Tile>
        <StackedBarChart data={data} options={options} />
        <div className="cpu-usage-data pt-1">
          <div className="label">Average Tokens per Session</div>
          <h3 className="data">{avg}</h3>
        </div>
      </Tile>
    ) : (
      <NoData />
    )}
    </>
  );
});

export default TokenPerSession1;
