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
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import CustomLineChart from "../../common/CustomLineChart";
import { latencyOptions } from "../constants";
import { useStoreContext } from "../../../store";
import { getIntervals, getLatencyData } from "../helper";
import moment from "moment";
import NoData from "../../common/NoData/NoData";

const LatencyGraph = forwardRef(({ selectedItem, selectedUser, selectedTimestampRange }, ref) => {
  const websocketRef = useRef(null);
  const [websocket, setWebsocket] = useState(null);
  const [messageFromServerLatency, setMessageFromServerLatency] = useState('');

  useImperativeHandle(ref, () => ({
    sendMessageToServerLatency,
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

  const sendMessageToServerLatency = (selectedItem, selectedUser, selectedTimestampRange) => {
    let q = 'SELECT application_name, data, timestamp FROM performance';

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
    if (selectedTimestampRange) {
      const endTime = moment();
      let startTime;

      switch (selectedTimestampRange) {
        case 'last24hours':
          startTime = endTime.clone().subtract(24, 'hours');
          break;
        case 'last7days':
          startTime = endTime.clone().subtract(7, 'days');
          break;
        case 'last30days':
          startTime = endTime.clone().subtract(30, 'days');
          break;
        default:
          startTime = endTime.clone().subtract(7, 'days');
      }
      
      q += ` AND timestamp BETWEEN ${startTime.valueOf()} AND ${endTime.valueOf()}`;
    }

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
        setMessageFromServerLatency(JSON.parse(event.data));
      };
    }
  }, [websocket]);

  useEffect(() => {
    sendMessageToServerLatency(selectedItem, selectedUser, selectedTimestampRange);
  }, [selectedItem, selectedUser, selectedTimestampRange]);

  const getLatencyDataInside = (apps) => {
    const starttime = 1718342400000;
    const endtime = 1724976000000;
    let obj = {};
    let returnArray = [];
    const intervals = getIntervals(starttime, endtime, 10);

    console.log("messageFromServerLatency", messageFromServerLatency);
    for (const i in intervals) {
      
      let { start, end } = intervals[i];
      start = moment(start);
      end = moment(end);

      for (const appId in apps) {
        const app = apps[appId];
        let latency = app.data.latency.histogram.bins;

        if (Array.isArray(app.data.latency.histogram.bins)) {
          latency = latency > 0 ? latency / 100000000 : 0;
        } else if (typeof app.data.latency.histogram.bins === 'number') {
          latency = app.data.latency.histogram.bins;
        }

        const appTime = moment(app.timestamp);

        if (appTime.isSameOrAfter(start) && appTime.isSameOrBefore(end)) {
          if (obj[i]) {
            obj[i].value += latency;
            obj[i].key = end.add(50, 'minutes').format('YYYY-MM-DDTHH:mm:ssZ');
          } else {
            obj[i] = {
              group: 'Dataset1',
              key: appTime.add(240, 'minutes').format('YYYY-MM-DDTHH:mm:ssZ'),
              value: latency,
            };
          }
          returnArray.push({ ...obj[i] });
        }
      }
    }

    return returnArray;
  };

  const latencyDataInside = getLatencyDataInside(messageFromServerLatency, selectedItem, selectedUser);

  return (
    <>
      {latencyDataInside.length > 0 ? (
        <CustomLineChart
          data={latencyDataInside}
          options={latencyOptions}
        />
      ) : (
        <NoData />
      )}
    </>
  );
});

export default LatencyGraph;
