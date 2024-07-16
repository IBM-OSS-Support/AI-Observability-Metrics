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

const FrequencyOfUseTable = () => {
  const [websocket, setWebsocket] = useState(null);
  const [messageFromServerFreqTable, setMessageFromServerFreqTable] = useState('');
  const [rowDataFreqTable, setRowDataFreqTable] = useState([]); // Define state for formatted data
  const [headersFreqTable, setHeadersFreqTable] = useState([]); // Define state for headers

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
  const sendMessageToServerFreqTable = (messageFromServerFreqTable) => {
    var q = 'WITH operation_counts AS ( SELECT operation, COUNT(*) AS operation_count FROM operations GROUP BY operation ), total_count AS ( SELECT COUNT(*) AS total FROM operations ) SELECT oc.operation, oc.operation_count, (oc.operation_count * 100.0 / tc.total) AS percentage_usage FROM operation_counts oc, total_count tc ORDER BY percentage_usage DESC;';
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
        setMessageFromServerFreqTable(JSON.parse(event.data));
        console.log('log event data[0]',event.data[4]);
        // console.log('setRowDataLog', messageFromServerLog[0]);
        // setRowDataLog(messageFromServerLog);
      };
      //setMessageFromServerLog(messageFromServerLog);
    }
  }, [websocket]);
console.log('Frequency table messageFromServer', messageFromServerFreqTable[5]);
console.log('Frequency table row data', rowDataFreqTable);
// code starts here

useEffect(() => {
  setHeadersFreqTable([
    { key: "operation", header: "Operation" },
    { key: "operation_count", header: "Operation Count" },
    { key: "percentage_usage", header: "Frequency of Use" },
  ]);
}, []);

  const arrayFreqTable = Array.isArray(messageFromServerFreqTable) ? messageFromServerFreqTable : [messageFromServerFreqTable];

  console.log('Array log', arrayFreqTable);
// code ends here

  return (
    <div>
      <button onClick={sendMessageToServerFreqTable}>Load data</button>
      {/* Display message received from server */}
      <div>
        <CustomDataTable
        headers={headersFreqTable}
        rows={arrayFreqTable}
        />
      </div>
    </div>
  );
};

export default FrequencyOfUseTable;


