import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Tile } from "@carbon/react";
import { GaugeChart } from "@carbon/charts-react";
import { useStoreContext } from "../../../store";

const options = {
  theme: "g90",
  title: '',
  resizable: true,
  height: '80%',
  width: '100%',
  gauge: {
    alignment: 'center',
    type: 'semi',
    status: 'danger',
    arcWidth: 24
  },
  legend: {
    enabled: false
  },
  toolbar: {
    enabled: false
  },
  color: {
    scale: {
      value: '#136e6d'
    }
  }
};

const defaultData = [
  {
    group: 'value',
    value: 0
  }
];

const defaultMessage = [
  {
    process_cpu_usage: { gauge: 0 }
  }
];

const CpuUsage = forwardRef(({ selectedItem, selectedUser }, ref) => {
  const websocketRef = useRef(null);
  const [data, setData] = useState(defaultData);
  const [latest, setLatest] = useState(0);
  const [avg, setAvg] = useState(0);
  const [websocket, setWebsocket] = useState(null);
  const [messageFromServerCPU, setMessageFromServerCPU] = useState(defaultMessage);

  useImperativeHandle(ref, () => ({
    sendMessageToServerCPU,
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

  const sendMessageToServerCPU = (selectedItem, selectedUser) => {
    let q = 'SELECT process_cpu_usage FROM system';

    if (selectedItem) {
      q += ` WHERE application_name = '${selectedItem}'`;
    }
    if (selectedUser) {
      q += selectedItem ? ` AND app_user = '${selectedUser}'` : ` WHERE app_user = '${selectedUser}'`;
    }

    const ws = websocketRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
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
  };

  useEffect(() => {
    if (websocket) {
      websocket.onmessage = (event) => {
        const receivedData = JSON.parse(event.data);
        setMessageFromServerCPU(receivedData);
      };
    }
  }, [websocket]);

  useEffect(() => {
    if (messageFromServerCPU && messageFromServerCPU.length > 0) {
      const cpuUsages = messageFromServerCPU.map(d => d.process_cpu_usage.gauge || 0);
      
      // Calculate the latest CPU usage (most recent value)
      const latestUsage = cpuUsages[cpuUsages.length - 1] || 0;
      setLatest(latestUsage);

      // Calculate the average CPU usage
      const total = cpuUsages.reduce((sum, gauge) => sum + gauge, 0);
      const newAvgValue = cpuUsages.length > 0 ? total / cpuUsages.length : 0;
      const newAvg = newAvgValue.toFixed(2);
      setAvg(newAvg);

      // Update chart data to reflect the latest value
      setData([{ group: 'value', value: latestUsage }]);
    }
  }, [messageFromServerCPU]);

  return (
    <Tile className="infrastructure-components cpu-usage">
      <h5>Latest CPU Usage</h5>
      <div className="cpu-usage-chart">
        <GaugeChart data={data} options={options} />
      </div>
      <div className="cpu-usage-data">
        <div className="label">Average CPU Usage</div>
        <h3 className="data">{avg} %</h3>
      </div>
    </Tile>
  );
});

export default CpuUsage;
