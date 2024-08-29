/* ******************************************************************************
 * IBM Confidential
 *
 * OCO Source Materials
 *
 *  Copyright IBM Corp. 2023  All Rights Reserved.
 *
 * The source code for this program is not published or otherwise divested
 * of its trade secrets, irrespective of what has been deposited with
 * the U.S. Copyright Office.
 ****************************************************************************** */
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Tile } from "@carbon/react";
import { GaugeChart } from "@carbon/charts-react";
import { getAppData } from "../../../appData";
import { useStoreContext } from "../../../store";

const options = {
  theme: "g90",
  title: '',
  resizable: true,
  height: '80%',
  width: '100%',
  gauge: {
    alignment: 'center',
    type: 'semi',
    status: 'danger',
    arcWidth: 24
  },
  legend: {
    enabled: false
  },
  toolbar: {
    enabled: false
  },
  color: {
    scale: {
      value: '#136e6d'
    }
  }
}

const defaultData = [
  {
    group: 'value',
    value: 0
  }
];

const defaultMessage = [
  {
    percentage_usage : 0
  }
];

const SuccessRate = forwardRef((props, ref) => {
  const websocketRef = useRef(null);
  const [data, setData] = useState(defaultData);
  const [avg, setAvg] = useState(0);
  const [websocket, setWebsocket] = useState(null);
  const [messageFromServerSuccess, setMessageFromServerSuccess] = useState(defaultMessage);

  const { state } = useStoreContext();

  useImperativeHandle(ref, () => ({
    sendMessageToServerSuccess,
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
  const sendMessageToServerSuccess = (selectedItem, selectedUser) => {
    var q = `SELECT COUNT(*) AS total_count, COUNT(*) FILTER (WHERE status = 'success') * 100.0 / COUNT(*) AS success_percentage FROM log_history`;

    if (selectedItem) {
      q = `SELECT COUNT(*) FILTER (WHERE application_name = '${selectedItem}') AS total_count, COUNT(*) FILTER (WHERE status = 'success') * 100.0 / COUNT(*) AS success_percentage FROM log_history`;
      console.log("selectedItem", selectedItem, "Q", q);
    }
    if (selectedUser) {
      q = `SELECT 
          COUNT(*) FILTER (WHERE app_user = '${selectedUser}') AS total_count, 
          COUNT(*) FILTER (WHERE status = 'success' AND app_user = '${selectedUser}') * 100.0 / 
          (SELECT COUNT(*) FROM log_history WHERE app_user = '${selectedUser}') AS success_percentage
          FROM log_history`;
      console.log("selectedUser", selectedUser, "Q", q);
    }
    if(selectedUser && selectedItem) {
      q = `SELECT 
          COUNT(*) FILTER (WHERE app_user = '${selectedUser}' AND application_name = '${selectedItem}') AS total_count,
          
          COUNT(*) FILTER (WHERE status = 'success' AND app_user = '${selectedUser}' AND application_name = '${selectedItem}') * 100.0 / 
          (SELECT COUNT(*) FROM log_history WHERE app_user = '${selectedUser}' AND application_name = '${selectedItem}') AS success_percentage
          FROM log_history;`;
      console.log("selectedUser", selectedUser, "Q", q);
    }
    
    const ws = websocketRef.current;
    
    if (ws) {
      if (ws.readyState === WebSocket.OPEN) {
        const message = {
          tab: 'auditing',
          action: q
        };
        ws.send(JSON.stringify(message));
      } else {
        ws.onopen = () => {
          const message = {
            tab: 'auditing',
            action: q
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
        setMessageFromServerSuccess(JSON.parse(event.data));
      };
    }
  }, [websocket]);

  // Update chart data when messageFromServerSuccess changes
  useEffect(() => {
    let newData = defaultData;
    let newAvg = 0;
    let newAvgValue = 0;
    let newAvgValueToNumber = 0;
    if (state.status === 'success') {
      const appData = getAppData();
  
      console.log('Success app data', appData[0].data);
        
      if (messageFromServerSuccess.length > 0) {
        newAvgValue = messageFromServerSuccess[0].success_percentage; 
        newAvgValueToNumber = parseFloat(newAvgValue);
        console.log('Success newAvgValue', newAvgValueToNumber);
        newAvg = newAvgValueToNumber.toFixed(2);
        newData = [
          {
            group: 'value',
            value: newAvgValueToNumber || 0
          }
        ];
      }
  
      setData(newData);
      setAvg(newAvg);
      console.log('New average Success', newAvg);
    }
  }, [messageFromServerSuccess]);

  console.log(messageFromServerSuccess[0].total_count, 'Success messageFromServer', messageFromServerSuccess);
  if (messageFromServerSuccess) {
    console.log('Success messageFromServer.gauge', messageFromServerSuccess[0].success_percentage);
  }

  // Render
  return (
    <Tile className="infrastructure-components cpu-usage">
      <h5>Success Rate</h5>
      <div className="cpu-usage-chart">
        <GaugeChart data={data} options={options} />
      </div>
      <div className="cpu-usage-data">
        <div className="label">Total Count</div>
        <h3 className="data">{messageFromServerSuccess[0].total_count} </h3>
      </div>
    </Tile>
  );
});

export default SuccessRate;
