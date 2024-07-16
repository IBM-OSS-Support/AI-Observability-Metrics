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
import React, { useState } from 'react';
import { useEffect } from 'react';

const AuditingTable = () => {
  const [websocket, setWebsocket] = useState(null);
  const [messageFromServer, setMessageFromServer] = useState('');

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
  const sendMessageToServer = () => {
    var start_timestamp = '2024-03-28 10:23:58.072245';
    var end_timestamp = '2024-04-25 12:40:18.875514';
    var q = 'SELECT * FROM auditing WHERE id=2';
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
        setMessageFromServer(event.data);
      };
    }
  }, [websocket]);

  return (
    <div>
      <h2>Auditing Component</h2>
      <button onClick={sendMessageToServer}>Send Message to Server</button>
      {/* Display message received from server */}
      <div>
        <h3>Message from Server:</h3>
        <pre>{messageFromServer}</pre>
      </div>
    </div>
  );
};

export default AuditingTable;


/*
      const message = {
        tab: 'auditing',
        action: 'query', // or any other action type
      };
      websocket.send(JSON.stringify(message));
*/