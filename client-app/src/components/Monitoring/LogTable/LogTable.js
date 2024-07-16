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

const LogTable = () => {
  const [websocket, setWebsocket] = useState(null);
  const [messageFromServerLogTable, setMessageFromServerLogTable] = useState('');
  const [rowDataLogTable, setRowDataLogTable] = useState([]); // Define state for formatted data
  const [headersLogTable, setHeadersLogTable] = useState([]); // Define state for headers

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
  const sendMessageToServerLogTable = (messageFromServerLogTable) => {
    var start_timestamp = '2024-03-28 10:23:58.072245';
    var end_timestamp = '2024-04-25 12:40:18.875514';
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
        setMessageFromServerLogTable(JSON.parse(event.data));
        console.log('log event data[0]',event.data[4]);
        // console.log('setRowDataLog', messageFromServerLog[0]);
        // setRowDataLog(messageFromServerLog);
      };
      //setMessageFromServerLog(messageFromServerLog);
    }
  }, [websocket]);
console.log('log table messageFromServer', messageFromServerLogTable[5]);
console.log('log table row data', rowDataLogTable);
// code starts here

useEffect(() => {
  setHeadersLogTable([
    {key: "id", header: "ID"},
    { key: "application_name", header: "Application Name" },
    { key: "app_user", header: "User" },
    { key: "timestamp", header: "Timestamp" },
  ]);
}, []);

  const arrayLogTable = Array.isArray(messageFromServerLogTable) ? messageFromServerLogTable : [messageFromServerLogTable];

  console.log('Array log', arrayLogTable);
// code ends here

  return (
    <div>
      <button onClick={sendMessageToServerLogTable}>Load data</button>
      {/* Display message received from server */}
      <div>
        <CustomDataTable
        headers={headersLogTable}
        rows={Array.isArray(messageFromServerLogTable) ? messageFromServerLogTable : [messageFromServerLogTable]}
        />
      </div>
    </div>
  );
};

export default LogTable;


