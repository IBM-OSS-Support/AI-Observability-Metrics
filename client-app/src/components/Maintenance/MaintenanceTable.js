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
import PageContainer from "../common/PageContainer";

import Transactions from "../Traces/Transactions/Transactions";
import CustomDataTable from "../common/CustomDataTable";

const MaintenanceTable = forwardRef((props, ref) => {


  const websocketRef = useRef(null);
  const [websocket, setWebsocket] = useState(null);
  const [messageFromServerLog, setMessageFromServerLog] = useState('');
  const [rowDataLog, setRowDataLog] = useState([]); // Define state for formatted data
  const [headersLog, setHeadersLog] = useState([]); // Define state for headers


  useImperativeHandle(ref, () => ({
    sendMessageToServerLog,
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
  const sendMessageToServerLog = (messageFromServerLog) => {
    var start_timestamp = '2024-03-28 10:23:58.072245';
    var end_timestamp = '2024-04-25 12:40:18.875514';
    var q = 'SELECT * FROM maintenance';
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
        console.log('log data', event.data);
        setMessageFromServerLog(JSON.parse(event.data));
        console.log('log event data[0]',event.data[4]);
        // console.log('setRowDataLog', messageFromServerLog[0]);
        // setRowDataLog(messageFromServerLog);
      };
      //setMessageFromServerLog(messageFromServerLog);
    }
  }, [websocket]);

console.log('log table row data', rowDataLog);
// code starts here

useEffect(() => {
  setHeadersLog([
    {key: "id" , header: "ID"},
    {key: "graphsignal_library_version", header: "Graphsignal Library Version"},
    { key: "os_name", header: "OS Name" },
    {key: "os_version" , header: "OS Version"},
    {key: "runtime_name", header: "Runtime Name"},
    { key: "runtime_version", header: "Runtime Version" },
    // { key: "app_user", header: "User" },
    // { key: "timestamp", header: "Timestamp" },
  ]);
}, []);

  const arrayLog = Array.isArray(messageFromServerLog) ? messageFromServerLog : [messageFromServerLog];
  console.log('log table before arraylog', messageFromServerLog[0]);
  console.log('Array log', arrayLog[0]);
  const arrayLogtemp = arrayLog.map((arrayItem) => {
    const { id, key, value } = arrayItem;
    return {
      id, key, value
    };
  });
  console.log('arrayLogtemp', arrayLogtemp);
// code ends here
	return(
      <div>
        <CustomDataTable
        headers={headersLog}
        rows={arrayLog}
        />
      </div>
	);
});

export default MaintenanceTable;