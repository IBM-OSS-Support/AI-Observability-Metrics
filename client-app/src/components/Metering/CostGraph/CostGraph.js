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

import CustomLineChart from "../../common/CustomLineChart";
import moment from "moment";
import { LineChart } from "@carbon/charts-react";

function CostGraph() {
  const defaultMessage = [
    {
      token_cost: 0,
    },
  ];
  const [websocket, setWebsocket] = useState(null);
  const [messageFromServerCost, setMessageFromServerCost] =
    useState(defaultMessage);

  const costGraphOptions = {
    title: "Token Cost",
  };

  // Connect to WebSocket server on component mount
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");
    setWebsocket(ws);
    // Cleanup function to close WebSocket connection on component unmount
    return () => {
      ws.close();
    };
  }, []);

  // Function to send message to WebSocket server
  const sendMessageToServerCost = () => {
    var q = "SELECT application_name, token_cost,timestamp FROM token_usage";
    if (websocket && websocket.readyState === WebSocket.OPEN) {
      const message = {
        tab: "auditing",
        action: q,
      };
      websocket.send(JSON.stringify(message));
    }
  };

  // Listen for messages from WebSocket server
  useEffect(() => {
    if (websocket) {
      websocket.onmessage = (event) => {
        setMessageFromServerCost(JSON.parse(event.data));
      };
    }
  }, [websocket]);

  console.log("Token Cost messageFromServer", messageFromServerCost);

  // starts

  const getIntervals = (start, end, number) => {
    const interval = end - start;
    const step = Math.round(interval / number);
    const intervals = {};

    let intStart = start;
    let intEnd = start + step;
    while (intEnd <= end) {
      intervals[`${intStart}-${intEnd}`] = {
        start: intStart,
        end: intEnd,
      };

      intStart = intStart + step;
      intEnd = intEnd + step;
    }

    return intervals;
  };

  const getCostGraphData = (apps) => {
    let obj = {};
    let graphArray = [];
    let startTime = 1711615438201;
    let endTime = 1717585058217;
    console.log("time in cost graph", startTime);

    console.log("CostGraph apps", apps);

    const intervals = getIntervals(startTime, endTime, 10);
    console.log("CostGraph intervals", intervals);

    for (const i in intervals) {
      let { start, end } = intervals[i];
      start = moment(start);
      end = moment(end);
      
      console.log("CostGraph - inside for loop - start", start);
      
      for (const appId in apps) {
        const app = apps[appId];
        const count = app.token_cost;
        const appTime = moment(app.timestamp);
        let returnArray = [];
        console.log("CostGraph - app", app);
        console.log(
          "CostGraph - appTime.isSameOrAfter(start) and appTime.isSameOrBefore(end)",
          appTime.isSameOrAfter(start),
          appTime.isSameOrBefore(end)
        );

        if (appTime.isSameOrAfter(start) && appTime.isSameOrBefore(end)) {
          console.log("Cost Graph obj outside if", obj[i]);

          if (obj[i]) {
            obj[i].value = parseFloat(app.token_cost);
            obj[i].key = app.timestamp;
            let abc = obj[i];
            if (!isNaN(abc.value)) {
              graphArray.push({ ...abc }); // Add the object to the array
            }
            console.log("Cost Graph obj in if", abc);
          } else {
            obj[i] = {
              group: "Dataset1",
              key: app.timestamp,
              value: app.token_cost,
            };
            console.log("Cost Graph obj in else", obj[i]);
          }
        }
      returnArray = Object.values(obj);
      console.log("Costgraph object inside for loop", returnArray);
      }
    }
    console.log("CostGraph Object", Object.values(obj));
    console.log("CostGraph Object - obj", obj);
    console.log("Graph Array", graphArray);
    return graphArray;
  };

  const costGraphData = getCostGraphData(messageFromServerCost);
  console.log("costGraphData", costGraphData);

  //ends

  return (
    <>
      <button onClick={sendMessageToServerCost}>Load graph</button>
      <CustomLineChart data={costGraphData} options={costGraphOptions} />
    </>
  );
}

export default CostGraph;
