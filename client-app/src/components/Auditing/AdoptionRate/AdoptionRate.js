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

const AdoptionRate = () => {

  const [data, setData] = useState(defaultData);
  const [avg, setAvg] = useState(0);
  const [websocket, setWebsocket] = useState(null);
  const [messageFromServerAdoption, setMessageFromServerAdoption] = useState(defaultMessage);

  const { state } = useStoreContext();

  

  // Connect to WebSocket server on component mount
  useEffect(() => {
    const apiUrl = process.env.REACT_APP_WEBSOCKET_URL;
    console.log('API URL', apiUrl);
    console.log('Process.env', process.env);
    const ws = new WebSocket(apiUrl);
    setWebsocket(ws);
    // Cleanup function to close WebSocket connection on component unmount
    return () => {
      ws.close();
    };
  }, []);

  // Function to send message to WebSocket server
  const sendMessageToServerAdoption = () => {
    var q = 'WITH user_counts AS ( SELECT app_user, COUNT(*) AS user_count FROM auditing GROUP BY app_user ), total_count AS ( SELECT COUNT(*) AS total FROM auditing ) SELECT uc.app_user, uc.user_count, (uc.user_count * 100.0 / tc.total) AS percentage_usage FROM user_counts uc, total_count tc ORDER BY percentage_usage DESC;';
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
        setMessageFromServerAdoption(JSON.parse(event.data));
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
  
        console.log('Adoption app data', appData[0].data);
        
        if (messageFromServerAdoption) {
          
        newAvgValue = messageFromServerAdoption[0].percentage_usage; 
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
      console.log('New average adoption', newAvg);
    }}, messageFromServerAdoption);


    console.log('Adoption messageFromServer', messageFromServerAdoption);
    if(messageFromServerAdoption){
      console.log('Adoption messageFromServer.gauge', messageFromServerAdoption[0].percentage_usage);
  
    }
  //end

  // Render
  return (
    <Tile className="infrastructure-components cpu-usage" >
      <h5>Adoption Rate</h5>
          <button onClick={sendMessageToServerAdoption}>Load graph</button>
        <div className="cpu-usage-chart">
          <GaugeChart
            data={data}
            options={options}
          />
        </div>
        <div className="cpu-usage-data">
          <div className="label">Adoption rate</div>
          <h3 className="data">{avg} %</h3>
        </div>
    </Tile>
  );
};

export default AdoptionRate;
