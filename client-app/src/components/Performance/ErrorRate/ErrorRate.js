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
import React, { useEffect, useMemo, useState } from "react";

import { StackedBarChart } from "@carbon/charts-react";
import { Maximize } from "@carbon/icons-react";

import { useStoreContext } from "../../../store";
import { getAppData } from "../../../appData";

const options = {
  theme: "g100",
  title: "Error Rate",
  axes: {
    left: {
      mapsTo: "value",
      stacked: true
    },
    bottom: {
      mapsTo: "key",
      scaleType: "labels",
    }
  },
  legend: {
    position: 'top'
  },
  toolbar: {
    enabled: true,
    controls:[{
      type: "Make fullscreen"
    }],
    text: "Make fullscreen",
    iconSVG: {
      content: Maximize
    },
    shouldBeDisabled: false
  },
  tooltip: {
    truncation: {
      numCharacter: 20
    },
    groupLabel: 'count of',
  },
  height: "100%",
  color: {
    scale: {
      Dataset1: "#5281d8"
    },
  },
};

const defaultMessage = [
  {
    usage : {counter : 0}
  }
];

function ErrorRate() {
  const { state } = useStoreContext();
  const [websocket, setWebsocket] = useState(null);
  const [messageFromServerError, setMessageFromServerError] = useState(defaultMessage);

  // Connect to WebSocket server on component mount
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080');
    console.log('ws', ws);
    setWebsocket(ws);
    // Cleanup function to close WebSocket connection on component unmount
    return () => {
      ws.close();
    };
  }, []);

  // Function to send message to WebSocket server
  const sendMessageToServerError = () => {
    var q = "SELECT COUNT(*) AS total_count, COUNT(*) FILTER (WHERE status = 'user_abandoned') * 100.0 / COUNT(*) AS user_abandoned_percentage, COUNT(*) FILTER (WHERE status = 'success') * 100.0 / COUNT(*) AS success_percentage, COUNT(*) FILTER (WHERE status = 'failure') * 100.0 / COUNT(*) AS failure_percentage FROM log_history ";
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
        setMessageFromServerError(JSON.parse(event.data));
        console.log('Error messageFromServer inside useeffect', messageFromServerError);
      };
    }
  }, [websocket]);

  console.log('Error messageFromServer ', messageFromServerError);


  const callCountData = useMemo(() => {
    if (state.metrics) {
      const appData = getAppData();

      return appData
        .map(d => (d.data.spans || []).reduce((_counts, { data_profile }) => {
          if (data_profile && !!data_profile.length) {
            data_profile.forEach(({data_name, counts}) => {
  
              switch (data_name) {
                case 'messages':
                  _counts.inputs += +counts.find(count => count.name === 'token_count')?.count || 0;
                  break;
                case 'completion':
                  _counts.outputs += +counts.find(count => count.name === 'token_count')?.count || 0;
                  break;
                default: ;
              }
            }, _counts);
          }
          return _counts;
          }, {inputs: 0, outputs: 0, appName: d.data['application-name']})
        )
        .map(count => [
          {
            group: 'Inputs',
            key: count.appName,
            value: count.inputs
          },
          {
            group: 'Outputs',
            key: count.appName,
            value: count.outputs
          }
        ])
        .flat();
    }

    return [];
  }, [state.metrics]);

console.log('ErrorRate callCountData', callCountData);

  return (
    <div>
      <button onClick={sendMessageToServerError}>Load graph</button>
      <StackedBarChart
        data={callCountData}
        options={options}
      />
    </div>
  );
}

export default ErrorRate;
