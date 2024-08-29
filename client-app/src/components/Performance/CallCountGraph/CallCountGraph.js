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

const CallCountGraph = forwardRef(({selectedItem, selectedUser, selectedTimestampRange, numberOfDaysSelected}, ref) => {

  const websocketRef = useRef(null);
  const [websocket, setWebsocket] = useState(null);
  const [messageFromServerCallCount, setMessageFromServerCallCount] = useState('');

  let defaultNumberofDays = 7;
  

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
  const sendMessageToServerCallCount = (selectedItem, selectedUser, selectedTimestampRange, numberOfDaysSelected) => {
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
      
      q += ` AND timestamp`;
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
    if (messageFromServerCallCount) {
        getCallCountDataInside(messageFromServerCallCount, numberOfDaysSelected);
    }
}, [messageFromServerCallCount, numberOfDaysSelected]);

  const { state } = useStoreContext();
  console.log('state', state);

  const getCallCountDataInside = (apps, defaultNumberofDays) => {
    const endtime = Date.now();
    const SelectedDays = numberOfDaysSelected ? numberOfDaysSelected : defaultNumberofDays;
    const starttime = endtime - SelectedDays * 24 * 60 * 60 * 10000;
    console.log(numberOfDaysSelected, 'Starttime call', starttime);
    console.log(defaultNumberofDays, 'Endtime call', endtime);
    let obj = {};
    let returnArray = [];

    console.log('CallCount apps', apps);

  
    //new code 
    const result = [];

    for (const appId in apps) {
      const app = apps[appId];
      console.log('CallCount app', appId, ':', app);
      const timestamp = app.timestamp;
      console.log('CallCount Time', timestamp);

      if (new Date(timestamp).getTime() >= starttime && new Date(timestamp).getTime() <= endtime) {
        result.push({
          group: 'Dataset 1',
          key: app.timestamp,
          value: app.data.call_count.counter
        });
      }
    }

    console.log(result.value, 'CallCount Result', result);
    call_count_number = result.length
    return result;
  };

  let call_count_number;
  console.log("call_count_number:",call_count_number);
  const CallCountDataInside = getCallCountDataInside(messageFromServerCallCount, defaultNumberofDays);
  console.log("defaultNumberofDays",defaultNumberofDays, 'CallCount Data Inside', CallCountDataInside);

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