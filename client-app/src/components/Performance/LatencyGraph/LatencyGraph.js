/* ******************************************************************************
 * IBM Confidential
 *
 * OCO Source Materials
 *
 *  Copyright IBM Corp. 2024  All Rights Reserved.
 *
 * The source code for this program is not published or otherwise divested
 * of its trade secrets, irrespective of what has been deposited with
 * the U.S. Copyright Office.
 ****************************************************************************** */
import React, { useEffect, useMemo, useState } from "react";

import CustomLineChart from "../../common/CustomLineChart";

import {
  latencyOptions
} from "../constants";
import { useStoreContext } from "../../../store";
import { getIntervals, getLatencyData } from "../helper";
import { fetchAppData, getAppData } from "../../../appData";
import moment from "moment";
import { Button } from "@carbon/react";
import { json } from "react-router-dom";

function LatencyGraph() {

  const [websocket, setWebsocket] = useState(null);
  const [messageFromServerLatency, setMessageFromServerLatency] = useState('');

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
  const sendMessageToServerLatency = () => {
    var q = 'SELECT application_name, data, timestamp FROM performance';
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
        setMessageFromServerLatency(JSON.parse(event.data));
      };
    }
  }, [websocket]);

  const { state } = useStoreContext();
  console.log('state', state);

  const data = messageFromServerLatency;
  console.log('latency Data message From server', data);
  
  
  const getLatencyDataInside = (apps) => {
    let starttime = 1717998543000;
    let endtime = 1722050943000;
    let obj = {};
    let returnArray = [];
  
    console.log('Latency apps', apps);
  
    const intervals = getIntervals(starttime, endtime, 10);
    console.log('Latency intervals', intervals);
  
    for (const i in intervals) {
      let { start, end } = intervals[i];
      start = moment(start);
      end = moment(end);

      console.log('Latency start and end', start, end);

      
      for (const appId in apps) {
        const app = apps[appId];
        console.log("latency app.data.latency.histogram.bins", app.data.latency.histogram.bins);
        let latency = app.data.latency.histogram.bins;
        latency = latency > 0 ? latency / 100000000 : 0;
        
        console.log(appId, 'Latency value', latency);
        
        const appTime = moment(app.time);
        console.log('Latency appTime', appTime);
        
        console.log('For latency app time check', appTime.isSameOrAfter(start) && appTime.isSameOrBefore(end));
        
        if (appTime.isSameOrAfter(start) && appTime.isSameOrBefore(end)) {
          
          if (obj[i]) {
            obj[i].value += latency;;
            obj[i].key = end.add(50, 'minutes').format('YYYY-MM-DDTHH:mm:ssZ');
            returnArray.push({ ...obj[i] });
          } else {
            obj[i] = {
              group: 'Dataset1',
              key: appTime.add(240, 'minutes').format('YYYY-MM-DDTHH:mm:ssZ'),
              value: latency,
            }
            returnArray.push({ ...obj[i] });
          }
          }
          console.log(appId, 'Latency obj', obj[i]);
          }
        }
        
    console.log('Latency return array', returnArray);
    console.log('latency object', Object.values(obj));

    return returnArray;
  }

  
  

  const latencyDataInside = getLatencyDataInside(messageFromServerLatency);
  console.log('latency Data Inside', latencyDataInside);

  const latencyData = useMemo(() => {
    if (state.metrics) {
      console.log('state.metrics', state.metrics);
      return getLatencyData(state.metrics);
    }

    return [];
  }, [state.metrics]);

  console.log("Latency Data existing", latencyData);

  // const latencyData = getLatencyDataInside(data, starttime, endtime);

  return (
    <>
    <button onClick={sendMessageToServerLatency}>Load Data</button>
    <CustomLineChart
      data={latencyDataInside}
      options={latencyOptions}
    />
    </>
  );
}

export default LatencyGraph;
