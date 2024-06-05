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
  const [messageFromServerAbmt, setMessageFromServerAbmt] = useState('');
  const [rowDataAbmt, setRowDataAbmt] = useState([]); // Define state for formatted data
  const [headersAbmt, setHeadersAbmt] = useState([]); // Define state for headers

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
  const sendMessageToServerAbmt= () => {
    var q = 'SELECT id, application_name, status FROM log_history'
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
        console.log('Abandonment data', event.data);
        setMessageFromServerAbmt(JSON.parse(event.data));
        // console.log('setRowDataLog', messageFromServerLog[0]);
        // setRowDataLog(messageFromServerLog);
      };
      //setMessageFromServerLog(messageFromServerLog);
    }
  }, [websocket]);
console.log('Abandonment messageFromServer', messageFromServerAbmt);
console.log('Abandonment row data', rowDataAbmt);
// code starts here

useEffect(() => {
  setHeadersAbmt([
    {key: "id", header: "ID"},
    { key: "application_name", header: "Application Name" },
    { key: "status", header: "Status" },
  ]);
}, []);

  const arrayAbmt = Array.isArray(messageFromServerAbmt) ? messageFromServerAbmt : [messageFromServerAbmt];

  console.log('Array Abmt', arrayAbmt);
// code ends here

  return (
    <div>
      <button onClick={sendMessageToServerAbmt}>Load data</button>
      {/* Display message received from server */}
      <div>
        <CustomDataTable
        headers={headersAbmt}
        rows={Array.isArray(messageFromServerAbmt) ? messageFromServerAbmt : [messageFromServerAbmt]}
        />
      </div>
    </div>
  );
};

export default LogHistoryTable;


