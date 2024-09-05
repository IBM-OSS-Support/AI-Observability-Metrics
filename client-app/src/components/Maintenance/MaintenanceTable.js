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

  // Function to send message to WebSocket server
  const sendMessageToServerLog = async (messageFromServerLog) => {
    var start_timestamp = '2024-03-28 10:23:58.072245';
    var end_timestamp = '2024-04-25 12:40:18.875514';
    var q = 'SELECT * FROM maintenance limit 10';
    try {
      const apiUrl = process.env.REACT_APP_BACKEND_API_URL; // Use API URL instead of WebSocket URL
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: q }),
      });

      const result = await response.json();
      setMessageFromServerLog(result);
    } catch (error) {
      console.error('Error fetching data from API:', error);
    }
  };

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