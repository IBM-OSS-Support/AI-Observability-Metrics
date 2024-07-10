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
    percentage_usage : 0
  }
];

const FailureRate = () => {

  const [data, setData] = useState(defaultData);
  const [avg, setAvg] = useState(0);
  const [websocket, setWebsocket] = useState(null);
  const [messageFromServerFailure, setMessageFromServerFailure] = useState(defaultMessage);

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
  const sendMessageToServerFailure = () => {
    var q = "SELECT COUNT(*) AS total_count, COUNT(*) FILTER (WHERE status = 'user_abandoned') * 100.0 / COUNT(*) AS user_abandoned_percentage, COUNT(*) FILTER (WHERE status = 'success') * 100.0 / COUNT(*) AS success_percentage, COUNT(*) FILTER (WHERE status = 'failure') * 100.0 / COUNT(*) AS failure_percentage FROM log_history ";
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
        setMessageFromServerFailure(JSON.parse(event.data));
      };
    }
  }, [websocket]);

  

  // start

    useEffect(() => {
      let newData = defaultData;
      let newAvg = 0;
      let newAvgValue = 0;
      let newAvgValueToNumber = 0;
      if(state.status === 'success') {
        const appData = getAppData();
  
        console.log('Failure app data', appData[0].data);
        
        if (messageFromServerFailure) {
          
        newAvgValue = messageFromServerFailure[0].failure_percentage; 
        newAvgValueToNumber = parseFloat(newAvgValue)
        console.log('Adoption newAvgValue', newAvgValueToNumber);
        newAvg = newAvgValueToNumber.toFixed(2);
        newData = [
          {
            group: 'value',
            value: newAvgValueToNumber || 0
          }
        ];
        
      }
  
      setData(newData);
      setAvg(newAvg);
      console.log('New average Failure', newAvg);
    }}, messageFromServerFailure);


    console.log('Failure messageFromServer', messageFromServerFailure);
    if(messageFromServerFailure){
      console.log('Failure messageFromServer.gauge', messageFromServerFailure[0].failure_percentage);
  
    }
  //end

  // Render
  return (
    <Tile className="infrastructure-components cpu-usage" >
      <h5>Failure Rate</h5>
          <button onClick={sendMessageToServerFailure}>Load graph</button>
        <div className="cpu-usage-chart">
          <GaugeChart
            data={data}
            options={options}
          />
        </div>
        <div className="cpu-usage-data">
          <div className="label">Failure Rate</div>
          <h3 className="data">{avg} %</h3>
        </div>
    </Tile>
  );
};

export default FailureRate;
