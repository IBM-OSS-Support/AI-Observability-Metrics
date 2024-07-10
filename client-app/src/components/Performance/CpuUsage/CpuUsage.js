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
}

const defaultData = [
  {
    group: 'value',
    value: 0
  }
];

const defaultMessage = [
  {
    process_cpu_usage : {gauge : 0}
  }
];

const CpuUsage = () => {

  const [data, setData] = useState(defaultData);
  const [avg, setAvg] = useState(0);
  const [websocket, setWebsocket] = useState(null);
  const [messageFromServerCPU, setMessageFromServerCPU] = useState(defaultMessage);

  const { state } = useStoreContext();

  // Connect to WebSocket server on component mount
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080');
    setWebsocket(ws);
    // Cleanup function to close WebSocket connection on component unmount
    return () => {
      ws.close();
    };
  }, []);

  // Function to send message to WebSocket server
  const sendMessageToServerCPU = () => {
    var q = 'SELECT process_cpu_usage FROM system';
    if (websocket && websocket.readyState === WebSocket.OPEN) {
      const message = {
        tab: 'auditing',
        action: q
      };
      websocket.send(JSON.stringify(message));
    }
  };

  // Listen for messages from WebSocket server
  useEffect(() => {
    if (websocket) {
      websocket.onmessage = (event) => {
        setMessageFromServerCPU(JSON.parse(event.data));
      };
    }
  }, [websocket]);

  // useEffect(() => {
  //   let newData = defaultData;
  //   let newAvg = 0;
  //   if(state.status === 'success') {
  //     const appData = getAppData();

  //     console.log('CPU app data', appData[0].data);
      

  //     const cpuUsages = appData
  //       .filter(d => moment(d.data.upload_ms / 1000).diff(moment(), 'days') <= 7)
  //       .map(d => {
  //         const cpuUsage = d.data.metrics.find(m => m.name === 'process_cpu_usage');
  //         let gauge = 0;
  //         console.log('CPUUsage', cpuUsage);
  //         if (cpuUsage) {
  //           gauge = (cpuUsage.gauge || 0)
  //         }
  //         return gauge
  //       });
  //       console.log('CPUUsages',cpuUsages);
  //     newData = [
  //       {
  //         group: 'value',
  //         value: cpuUsages[0] || 0
  //       }
  //     ];
  //     newAvg = (cpuUsages.reduce((s, g) => s + +g, 0) / cpuUsages.length).toFixed(2);
  //   }

  //   setData(newData);
  //   setAvg(newAvg);
  // }, [state.status]);
  // console.log('CPU messageFromServer', messageFromServerCPU);
  // if(messageFromServerCPU){
  //   console.log('CPU messageFromServer.gauge', messageFromServerCPU[0].process_cpu_usage.gauge);

  // }

  // start

    useEffect(() => {
      let newData = defaultData;
      let newAvg = 0;
      let newAvgValue = 0;
      if(state.status === 'success') {
        const appData = getAppData();
  
        console.log('CPU app data', appData[0].data);
        
        if (messageFromServerCPU) {
          
          const cpuUsages = messageFromServerCPU
            .map(d => {
              const cpuUsage = d.process_cpu_usage.gauge;
              let gauge = 0;
              console.log('CPUUsage', cpuUsage);
              if (cpuUsage) {
                gauge = cpuUsage
              }
              return gauge
            });
            console.log('CPUUsages',cpuUsages);
        newAvgValue = cpuUsages.reduce((s, g) => s + +g, 0) / cpuUsages.length;
        newAvg = newAvgValue.toFixed(2);
        newData = [
          {
            group: 'value',
            value: newAvgValue || 0
          }
        ];
        
      }
  
      setData(newData);
      setAvg(newAvg);
      console.log('New average', newAvg);
    }}, messageFromServerCPU);


    console.log('CPU messageFromServer', messageFromServerCPU);
    if(messageFromServerCPU){
      console.log('CPU messageFromServer.gauge', messageFromServerCPU[0].process_cpu_usage.gauge);
  
    }
  //end

  // Render
  return (
    <Tile className="infrastructure-components cpu-usage" >
      <h5>Latest CPU usage</h5>
          <button onClick={sendMessageToServerCPU}>Load graph</button>
        <div className="cpu-usage-chart">
          <GaugeChart
            data={data}
            options={options}
          />
        </div>
        <div className="cpu-usage-data">
          <div className="label">Average CPU usage for last 7 days</div>
          <h3 className="data">{avg} %</h3>
        </div>
    </Tile>
  );
};

export default CpuUsage;
