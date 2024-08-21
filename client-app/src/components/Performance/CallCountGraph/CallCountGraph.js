import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import CustomLineChart from "../../common/CustomLineChart";
import { callCountOptions } from "../constants";
import { useStoreContext } from "../../../store";
import { getIntervals } from "../helper";
import moment from "moment";
import NoData from "../../common/NoData/NoData";

const CallCountGraph = forwardRef(({ selectedItem, selectedUser, selectedTimestampRange }, ref) => {
  const websocketRef = useRef(null);
  const [websocket, setWebsocket] = useState(null);
  const [messageFromServerCallCount, setMessageFromServerCallCount] = useState('');

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
  const sendMessageToServerCallCount = (selectedItem, selectedUser) => {
    let q = 'SELECT application_name, data, timestamp FROM performance';
  
    if (selectedItem && !selectedUser) {
      q += ` WHERE application_name = '${selectedItem}'`;
    }
    if (selectedUser && !selectedItem) {
      q += ` WHERE app_user = '${selectedUser}'`;
    }
    if (selectedUser && selectedItem) {
      q += ` WHERE application_name = '${selectedItem}' AND app_user = '${selectedUser}'`;
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

  // Listen for messages from WebSocket server
  useEffect(() => {
    if (websocket) {
      websocket.onmessage = (event) => {
        setMessageFromServerCallCount(JSON.parse(event.data));
      };
    }
  }, [websocket]);

  const getCallCountDataInside = (apps) => {
    const starttime = 1718342400000;
    const endtime = 1724044799000;
    let obj = {};
    let returnArray = [];
  
    const intervals = getIntervals(starttime, endtime, 10);

    let TestStartTime = starttime;

    // console.log(messageFromServerCallCount.map(entry => entry.timestamp), "TestStartTime", TestStartTime);

     // Log the data type
     console.log("Type of messageFromServerCallCount:", typeof messageFromServerCallCount);
     console.log("Is Array:", Array.isArray(messageFromServerCallCount));
     console.log("Actual Data:", messageFromServerCallCount);
 
    //  if (Array.isArray(messageFromServerCallCount)) { debugger
    //      // If it's an array, proceed with map function
    //      const timestampsInMilliseconds = messageFromServerCallCount.map(entry => new Date(entry.timestamp).getTime());
 
    //      const minTimestamp = Math.min(...timestampsInMilliseconds);
 
    //      const constantTimestamp = new Date('2024-01-01T00:00:00.000Z').getTime();
 
    //      if (minTimestamp < constantTimestamp) {
    //          console.log("The minimum timestamp is earlier than the constant timestamp.");
    //      } else {
    //          console.log("The minimum timestamp is not earlier than the constant timestamp.");
    //      }
 
    //      console.log(`Minimum Timestamp in milliseconds: ${minTimestamp}`);

    //      TestStartTime = minTimestamp;
    //     //  return TestStartTime;
    //   } else {
    //      // If it's not an array, log an error
    //       console.error("messageFromServerCallCount is not an array. It is:", messageFromServerCallCount);
    //     }
    

    console.log("messageFromServerCallCount", messageFromServerCallCount);

    debugger
  
    // Loop through intervals
    for (const i in intervals) {
      let { start, end } = intervals[i];
      start = TestStartTime;
      end = moment(end);
  
      // Loop through apps
      for (const appId in apps) {
        const app = apps[appId];
        let callCount = app.data.call_count.counter;
  
        const appTime = moment(app.timestamp);
  
        if (appTime.isSameOrAfter(start) && appTime.isSameOrBefore(end)) {
          if (obj[i]) {
            obj[i].value += callCount;
            obj[i].key = end.add(50, 'minutes').format('YYYY-MM-DDTHH:mm:ssZ');
          } else {
            obj[i] = {
              group: 'Dataset1',
              key: appTime.add(240, 'minutes').format('YYYY-MM-DDTHH:mm:ssZ'),
              value: callCount,
            }
          }
          returnArray.push({ ...obj[i] });
        }
      }
    }
  
    return returnArray;
  };

  const CallCountDataInside = getCallCountDataInside(messageFromServerCallCount);
  console.log('CallCount Data Inside', CallCountDataInside);

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
