import React, { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { useEffect } from 'react';
import CustomDataTable from '../../common/CustomDataTable';

const LogTable = forwardRef((props, ref) => {
  
  const websocketRef = useRef(null);
  const [websocket, setWebsocket] = useState(null);
  const [messageFromServerLogTable, setMessageFromServerLogTable] = useState([]);
  const [headersLogTable, setHeadersLogTable] = useState([]);

  useImperativeHandle(ref, () => ({
    sendMessageToServerLogTable,
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
  const sendMessageToServerLogTable = (messageFromServerLogTable) => {
    var start_timestamp = '2024-03-28 10:23:58.072245';
    var end_timestamp = '2024-04-25 12:40:18.875514';
    var q = 'SELECT id,application_name,app_user,timestamp FROM maintenance';
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
        const data = JSON.parse(event.data);
        // Format the data to include hyperlinks
        const formattedData = data.map(row => ({
          ...row,
          application_name: (
            <a href={`#/trace-analysis/${row.application_name}`}>
              {row.application_name}
            </a>
          ),
        }));
        setMessageFromServerLogTable(formattedData);
      };
    }
  }, [websocket]);

  useEffect(() => {
    setHeadersLogTable([
      { key: "id", header: "ID" },
      { key: "application_name", header: "Application Name" },
      { key: "app_user", header: "User" },
      { key: "timestamp", header: "Timestamp" },
    ]);
  }, []);

  const arrayLogTable = Array.isArray(messageFromServerLogTable) ? messageFromServerLogTable : [messageFromServerLogTable];
  console.log('LogTable Row', arrayLogTable);

  return (
    <div>
      <div>
        <CustomDataTable
          headers={headersLogTable}
          rows={arrayLogTable}
        />
      </div>
    </div>
  );
});

export default LogTable;
