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

const Performance = () => {
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
    if (websocket && websocket.readyState === WebSocket.OPEN) {
		var start_timestamp = '2024-03-28 10:23:58.072245';
		var end_timestamp = '2024-04-25 12:40:18.875514';
		var q = 'SELECT (SELECT COUNT(*)::numeric FROM log_history WHERE status = \'success\' AND timestamp BETWEEN \'' + start_timestamp + '\' AND \''+ end_timestamp + '\') / total_count * 100 AS success_percentage, (SELECT COUNT(*)::numeric FROM log_history WHERE status = \'failure\' AND timestamp BETWEEN \'' + start_timestamp + '\' AND \''+ end_timestamp + '\') / total_count * 100 AS failure_percentage, (SELECT COUNT(*)::numeric FROM log_history WHERE status = \'user_abandoned\' AND timestamp BETWEEN \'' + start_timestamp + '\' AND \''+ end_timestamp + '\') / total_count * 100 AS user_abandoned_percentage FROM (SELECT COUNT(*) AS total_count FROM log_history WHERE timestamp BETWEEN \'' + start_timestamp + '\' AND \''+ end_timestamp + '\') AS counts;';
		const message = {
			tab: 'performance',
			action: q, // or any other action type
		};
      websocket.send(JSON.stringify(message));

	  /*
	  SELECT
    (COUNT(*) FILTER (WHERE status = 'success')::numeric / total_count) * 100 AS success_percentage,
    (COUNT(*) FILTER (WHERE status = 'failed')::numeric / total_count) * 100 AS failed_percentage,
    (COUNT(*) FILTER (WHERE status = 'user_abandoned')::numeric / total_count) * 100 AS user_abandoned_percentage
FROM
    log_history
WHERE
    timestamp_column BETWEEN 'start_timestamp' AND 'end_timestamp'
CROSS JOIN
    (SELECT COUNT(*) AS total_count FROM log_history WHERE timestamp_column BETWEEN 'start_timestamp' AND 'end_timestamp') AS counts;
	  */
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
      <h2>Performance Component</h2>
      <button onClick={sendMessageToServer}>Send Message to Server</button>
      {/* Display message received from server */}
      <div>
        <h3>Message from Server:</h3>
        <pre>{messageFromServer}</pre>
      </div>
    </div>
  );
};

export default Performance;
