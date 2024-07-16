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
  callCountOptions,
} from "../constants";
import { useStoreContext } from "../../../store";
import { getIntervals, getLatencyData } from "../helper";
import moment from "moment";

function CallCountGraph() {

  const [websocket, setWebsocket] = useState(null);
  const [messageFromServerCallCount, setMessageFromServerCallCount] = useState('');

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
  const sendMessageToServerCallCount = () => {
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
        setMessageFromServerCallCount(JSON.parse(event.data));
      };
    }
  }, [websocket]);

  const { state } = useStoreContext();
  console.log('state', state);

  const data = messageFromServerCallCount;
  console.log('CallCount Data message From server', data);
  
  
  const getCallCountDataInside = (apps) => {
    let starttime = 1717998543000;
    let endtime = 1722050943000;
    let obj = {};
    let returnArray = [];
  
    console.log('CallCount apps', apps);
  
    const intervals = getIntervals(starttime, endtime, 10);
    console.log('CallCount intervals', intervals);
  
    for (const i in intervals) {
      let { start, end } = intervals[i];
      start = moment(start);
      end = moment(end);

      console.log('CallCount start and end', start, end);

      
      for (const appId in apps) {
        const app = apps[appId];
        console.log("latency app.data.call_count.counter", app.data.call_count.counter);
        let callCount = app.data.call_count.counter;
        console.log(appId, 'CallCount value', callCount);
        
        const appTime = moment(app.time);
        console.log('CallCount appTime', appTime);
        
        console.log('For CallCount app time check', appTime.isSameOrAfter(start) && appTime.isSameOrBefore(end));
        
        if (appTime.isSameOrAfter(start) && appTime.isSameOrBefore(end)) {
          
          if (obj[i]) {
            obj[i].value = callCount;;
            obj[i].key = end.add(50, 'minutes').format('YYYY-MM-DDTHH:mm:ssZ');
            returnArray.push({ ...obj[i] });
          } else {
            obj[i] = {
              group: 'Dataset1',
              key: appTime.add(240, 'minutes').format('YYYY-MM-DDTHH:mm:ssZ'),
              value: callCount,
            }
            returnArray.push({ ...obj[i] });
          }
          }
          console.log(appId, 'CallCount obj', obj[i]);
          }
        }
        
    console.log('CallCount return array', returnArray);
    console.log('CallCount object', Object.values(obj));

    return returnArray;
  }

  
  

  const CallCountDataInside = getCallCountDataInside(messageFromServerCallCount);
  console.log('CallCount Data Inside', CallCountDataInside);

  

  // const latencyData = getLatencyDataInside(data, starttime, endtime);

  return (
    <>
    <button onClick={sendMessageToServerCallCount}>Load Data</button>
    <CustomLineChart
      data={CallCountDataInside}
      options={callCountOptions}
    />
    </>
  );
}

export default CallCountGraph;
