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

const LatencyGraph = forwardRef(({ selectedItem, selectedUser, selectedTimestampRange, numberOfDaysSelected, startDate, endDate }, ref) => {
  const websocketRef = useRef(null);
  const [websocket, setWebsocket] = useState(null);
  const [messageFromServerLatency, setMessageFromServerLatency] = useState('');

  let defaultNumberofDays = 7;
  console.log('Start Date and End Date from Latency', startDate, endDate);

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

  const sendMessageToServerLatency = (selectedItem, selectedUser, selectedTimestampRange, numberOfDaysSelected, startDate, endDate) => {
    let q = 'SELECT application_name, data, timestamp FROM performance';

    defaultNumberofDays = numberOfDaysSelected;
    console.log(defaultNumberofDays, "numberOfDaysSelected::::", numberOfDaysSelected);

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
    // if (selectedTimestampRange) {
    //   const endTime = moment();
    //   let startTime;

    //   switch (selectedTimestampRange) {
    //     case 'last24hours':
    //       startTime = endTime.clone().subtract(24, 'hours');
    //       break;
    //     case 'last7days':
    //       startTime = endTime.clone().subtract(7, 'days');
    //       break;
    //     case 'last30days':
    //       startTime = endTime.clone().subtract(30, 'days');
    //       break;
    //     default:
    //       startTime = endTime.clone().subtract(7, 'days');
    //   }
      
    //   q += ` AND timestamp`;
    // }
    if (startDate && endDate) {
      q += ` WHERE timestamp >= '${startDate}' AND timestamp <= '${endDate}'`;
    }

    console.log('q from latency', q);

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
    sendMessageToServerLatency(selectedItem, selectedUser, selectedTimestampRange, startDate, endDate);
  }, [selectedItem, selectedUser, selectedTimestampRange, startDate, endDate]);

  useEffect(() => {
    if (messageFromServerLatency) {
        getLatencyDataInside(messageFromServerLatency, startDate, endDate);
    }
}, [messageFromServerLatency, startDate, endDate]);

  const getLatencyDataInside = (apps, startDate, endDate) => {
    let startTime = startDate;
    let endTime = endDate;
    const SelectedDays = endTime - startTime;
    console.log("SelectedDays", SelectedDays);
    // const intervals = getIntervals(starttime, endtime, 10);


    console.log('Latency apps', apps);

    console.log("messageFromServerLatency", messageFromServerLatency);

    //new code 
    const result = [];

    for (const appId in apps) {
      const app = apps[appId];
      console.log('Latency appID & app', appId, ':', app);
      const convertUTCToIST = (utcDateString) => {
        const utcDate = new Date(utcDateString);
      
        // Calculate the offset between UTC and IST
        const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
      
        // Add the IST offset to the UTC date
        const istDate = new Date(utcDate.getTime() + istOffset);
      
        return istDate; // Returns a Date object in IST
      };
      const timestamp = convertUTCToIST(app.timestamp);
      console.log('Latency Time', timestamp);

      let latency = app.data.latency.histogram.bins;
        if (Array.isArray(app.data.latency.histogram.bins)) {
          latency = latency > 0 ? latency / 100000000 : 0;
        } else if (typeof app.data.latency.histogram.bins === 'number') {
          latency = app.data.latency.histogram.bins;
        }

      
      console.log('Time inside getLatencyDataInside', startTime, endTime);  
      console.log('new Date(timestamp).getTime()', new Date(timestamp).getTime());

      console.log("new Date(timestamp).getTime() >= startTime && new Date(timestamp).getTime() <= endTime", timestamp >= startTime , timestamp <= endTime);
      
      if (timestamp >= startTime && timestamp <= endTime) {
        result.push({
          group: 'Dataset 1',
          key: app.timestamp,
          value: latency
        });
      }else if(startTime == undefined && endTime == undefined){
        result.push({
          group: 'Dataset 1',
          key: app.timestamp,
          value: latency
        });
      }
    }

    console.log('latency Result', result);
    latency_number = result.length
    return result;
  };

    
  let latency_number;
  console.log("latency_number:",latency_number);
  const latencyDataInside = getLatencyDataInside(messageFromServerLatency, startDate, endDate);
  console.log("latencyDataInside", latencyDataInside);
  
  const latencyOptions = {
    title: 'Latency (in seconds): ' + latency_number,
  }

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
