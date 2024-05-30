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
    var q = 'SELECT * FROM performance';
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
  console.log('latency Data', data);
  const endtime = 1705418265000;
  const starttime = 1705417760000;


  const getLatencyDataInside = (apps, startTime, endTime ) => {
    let obj = {};
  
    console.log('latency apps', apps[0].data);
  
    const intervals = getIntervals(startTime, endTime, 10);
  
    for (const i in intervals) {
      let { start, end } = intervals[i];
      start = moment(start);
      end = moment(end);
  
      for (const appId in apps) {
        const app = apps[appId];
        let latency = (app.latency || []).reduce((acc, { latency }) => {
          return acc + latency;
        }, 0);
        latency = latency > 0 ? latency / (app.latency || []).length : 0;
  
        const appTime = moment(app.time);
        if (appTime.isSameOrAfter(start) && appTime.isSameOrBefore(end)) {
          if (obj[i]) {
            obj[i].value = obj[i].value + latency;
            obj[i].count = obj[i].count + 1;
          } else {
            obj[i] = {
              group: 'Dataset1',
              key: app.time,
              value: latency,
              count: 1
            }
          }
        }
      }
    }
  
    return Object.values(obj).map(({ count, value, ...rest }) => {
      return {
        ...rest,
        value: Number((value / count).toFixed(2))
      }
    });
  }

  const latencyData = useMemo(() => {
    if (state.metrics) {
      console.log('state.metrics', state.metrics);
      return getLatencyData(state.metrics);
    }

    return [];
  }, [state.metrics]);

  // const latencyData = getLatencyDataInside(data, starttime, endtime);

  return (
    <div>
    <Button onClick={sendMessageToServerLatency}>Load Data</Button>
    <CustomLineChart
      data={latencyData}
      options={latencyOptions}
    />
    </div>
  );
}

export default LatencyGraph;
