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

const FrequencyOfUse = () => {

  const [data, setData] = useState(defaultData);
  const [avg, setAvg] = useState(0);
  const [websocket, setWebsocket] = useState(null);
  const [messageFromServerFrequency, setMessageFromServerFrequency] = useState(defaultMessage);

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
  const sendMessageToServerFrequency = () => {
    var q = 'WITH operation_counts AS ( SELECT operation, COUNT(*) AS operation_count FROM operations GROUP BY operation ), total_count AS ( SELECT COUNT(*) AS total FROM operations ) SELECT oc.operation, oc.operation_count, (oc.operation_count * 100.0 / tc.total) AS percentage_usage FROM operation_counts oc, total_count tc ORDER BY percentage_usage DESC;';
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
        setMessageFromServerFrequency(JSON.parse(event.data));
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
  
        console.log('Frequency app data', appData[0].data);
        
        if (messageFromServerFrequency) {
          
        newAvgValue = messageFromServerFrequency[0].percentage_usage; 
        newAvgValueToNumber = parseFloat(newAvgValue)
        console.log('Frequency newAvgValue', newAvgValueToNumber);
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
      console.log('New average adoption', newAvg);
    }}, messageFromServerFrequency);


    console.log('Frequency messageFromServer', messageFromServerFrequency);
    if(messageFromServerFrequency){
      console.log('Frequency messageFromServer.gauge', messageFromServerFrequency[0].percentage_usage);
  
    }
  //end

  // Render
  return (
    <Tile className="infrastructure-components cpu-usage" >
      <h5>Frequency of Use</h5>
          <button onClick={sendMessageToServerFrequency}>Load graph</button>
        <div className="cpu-usage-chart">
          <GaugeChart
            data={data}
            options={options}
          />
        </div>
        <div className="cpu-usage-data">
          <div className="label">Frequency of Use</div>
          <h3 className="data">{avg} %</h3>
        </div>
    </Tile>
  );
};

export default FrequencyOfUse;
