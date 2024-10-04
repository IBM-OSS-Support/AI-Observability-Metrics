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
    const apiUrl = process.env.REACT_APP_WEBSOCKET_URL;
    const ws = new WebSocket(apiUrl);
    setWebsocket(ws);
    // Cleanup function to close WebSocket connection on component unmount
    return () => {
      ws.close();
    };
  }, []);

  // Function to send message to WebSocket server
  const sendMessageToServerLog = (messageFromServerLog) => {
    var q = 'SELECT id,application_name,app_user,hostname,timestamp FROM maintenance';
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
        setMessageFromServerLog(JSON.parse(event.data));
      };
    }
  }, [websocket]);
// code starts here

useEffect(() => {
  setHeadersLog([
    {key: "id", header: "ID"},
    { key: "application_name", header: "Application Name" },
    { key: "app_user", header: "User" },
    { key: "hostname", header: "Hostname" },
    { key: "timestamp", header: "Timestamp" },
  ]);
}, []);

  const arrayLog = Array.isArray(messageFromServerLog) ? messageFromServerLog : [messageFromServerLog];
// code ends here

  return (
    <div>
      <button onClick={sendMessageToServerLog}>Load data</button>
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


