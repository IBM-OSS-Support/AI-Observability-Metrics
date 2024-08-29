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
import { callCountOptions } from "../constants";
import { useStoreContext } from "../../../store";
import { getIntervals } from "../helper";
import moment from "moment";
import NoData from "../../common/NoData/NoData";

const CallCountGraph = forwardRef(({selectedItem, selectedUser, selectedTimestampRange, numberOfDaysSelected, startDate, endDate}, ref) => {

  const websocketRef = useRef(null);
  const [websocket, setWebsocket] = useState(null);
  const [messageFromServerCallCount, setMessageFromServerCallCount] = useState('');

  let defaultNumberofDays = 7;
  // console.log('Start Date and End Date from callCount', startDate, endDate);

  useImperativeHandle(ref, () => ({
    sendMessageToServerCallCount,
  }));
  

  

  // Connect to WebSocket server on component mount
  useEffect(() => {
    const apiUrl = process.env.REACT_APP_WEBSOCKET_URL;
    const ws = new WebSocket(apiUrl);
    websocketRef.current = ws;
    setWebsocket(ws);
    // Cleanup function to close WebSocket connection on component unmount
    return () => {
      ws.close();
    };
  }, []);

  // Function to send message to WebSocket server
  const sendMessageToServerCallCount = (selectedItem, selectedUser, selectedTimestampRange, numberOfDaysSelected, startDate, endDate) => {
    let q = 'SELECT application_name, data, timestamp FROM performance';

    defaultNumberofDays = numberOfDaysSelected;
    // console.log(defaultNumberofDays, "numberOfDaysSelected::::", numberOfDaysSelected);

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
    return defaultNumberofDays
  };

  // Listen for messages from WebSocket server
  useEffect(() => {
    if (websocket) {
      websocket.onmessage = (event) => {
        setMessageFromServerCallCount(JSON.parse(event.data));
      };
    }
  }, [websocket]);

  useEffect(() => {
    sendMessageToServerCallCount(selectedItem, selectedUser, selectedTimestampRange, startDate, endDate);
  }, [selectedItem, selectedUser, selectedTimestampRange, startDate, endDate]);

  useEffect(() => {
    if (messageFromServerCallCount) {
        getCallCountDataInside(messageFromServerCallCount, numberOfDaysSelected, startDate, endDate);
    }
}, [messageFromServerCallCount, numberOfDaysSelected, startDate, endDate]);

  const { state } = useStoreContext();
  // console.log('state', state);

  const getCallCountDataInside = (apps, startDate, endDate) => {
    let startTime = startDate;
    let endTime = endDate;
    const SelectedDays = endTime - startTime;
    // console.log("SelectedDays", SelectedDays);
    let obj = {};
    let returnArray = [];

    // console.log('CallCount apps', apps);

  
    //new code 
    const result = [];

    for (const appId in apps) {
      const app = apps[appId];
      // console.log('CallCount app', appId, ':', app);
      const convertUTCToIST = (utcDateString) => {
        const utcDate = new Date(utcDateString);
      
        // Calculate the offset between UTC and IST
        const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
      
        // Add the IST offset to the UTC date
        const istDate = new Date(utcDate.getTime() + istOffset);
      
        return istDate; // Returns a Date object in IST
      };
      const timestamp = convertUTCToIST(app.timestamp);
      // console.log('CallCount Time', timestamp);

      let callCount = app.data.call_count.counter;
      // console.log("callCount:::", callCount);
      

      if (Array.isArray(callCount)) {
        callCount = callCount > 0 ? callCount / 100000000 : 0;
      } else if (typeof callCount === 'number') {
        callCount = callCount;
      }

      // console.log('Time inside getCallCountDataInside', startTime, endTime);  
      // console.log('new Date(timestamp).getTime()', new Date(timestamp).getTime());

      // console.log("new Date(timestamp).getTime() >= startTime && new Date(timestamp).getTime() <= endTime", timestamp >= startTime , timestamp <= endTime);
      
      if (timestamp >= startTime && timestamp <= endTime) {
        result.push({
          group: 'Dataset 1',
          key: app.timestamp,
          value: callCount
        });
      }else if(startTime == undefined && endTime == undefined){
        result.push({
          group: 'Dataset 1',
          key: app.timestamp,
          value: callCount
        });
      }
    }

    // console.log('CallCount Result', result);
    call_count_number = result.length
    return result;
  };

  let call_count_number;
  // console.log("call_count_number:",call_count_number);
  const CallCountDataInside = getCallCountDataInside(messageFromServerCallCount, startDate, endDate);
  // console.log("startDate, endDate",startDate, endDate, 'CallCount Data Inside', CallCountDataInside);

  const callCountOptions = {
    title: `Call Count : ` + call_count_number
  }

  return (
    <>
    {CallCountDataInside.length === 0 ? (
        <NoData />
      ) : (
        <CustomLineChart
          data={CallCountDataInside}
          options={callCountOptions}
        />
      )}
    </>
  );
});

export default CallCountGraph;