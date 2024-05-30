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
import React, { useMemo, useState } from 'react';
import { useEffect } from 'react';
import CustomDataTable from '../../common/CustomDataTable';

const LogHistoryTable = () => {
  const [websocket, setWebsocket] = useState(null);
  const [messageFromServerLog, setMessageFromServerLog] = useState('');
  const [rowDataLog, setRowDataLog] = useState([]); // Define state for formatted data
  const [headersLog, setHeadersLog] = useState([]); // Define state for headers

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
  const sendMessageToServerLog = (messageFromServerLog) => {
    var q = 'SELECT id,application_name,app_user,timestamp FROM maintenance';
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
        console.log('log data', event.data);
        setMessageFromServerLog(JSON.parse(event.data));
        console.log('log event data[0]',event.data[4]);
        // console.log('setRowDataLog', messageFromServerLog[0]);
        // setRowDataLog(messageFromServerLog);
      };
      //setMessageFromServerLog(messageFromServerLog);
    }
  }, [websocket]);
console.log('log table messageFromServer', messageFromServerLog[5]);
console.log('log table row data', rowDataLog);
// code starts here

useEffect(() => {
  setHeadersLog([
    {key: "id", header: "ID"},
    { key: "application_name", header: "Application Name" },
    { key: "app_user", header: "User" },
    { key: "timestamp", header: "Timestamp" },
  ]);
}, []);

  const arrayLog = Array.isArray(messageFromServerLog) ? messageFromServerLog : [messageFromServerLog];

  console.log('Array log', arrayLog);
// code ends here

  return (
    <div>
      <button onClick={sendMessageToServerLog}>Load data</button>
      {/* Display message received from server */}
      <div>
        <CustomDataTable
        headers={headersLog}
        rows={Array.isArray(messageFromServerLog) ? messageFromServerLog : [messageFromServerLog]}
        />
      </div>
    </div>
  );
};

export default LogHistoryTable;


