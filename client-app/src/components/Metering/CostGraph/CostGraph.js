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
import React, { useEffect, useState, useCallback, forwardRef, useImperativeHandle } from "react";
import moment from "moment";
import CustomLineChart from "../../common/CustomLineChart";
import NoData from "../../common/NoData/NoData";

const CostGraph = forwardRef(({ selectedItem, selectedUser, startDate, endDate }, ref) => {
  const defaultMessage = [
    {
      token_cost: 0,
    },
  ];
  const [messageFromServerCost, setMessageFromServerCost] = useState(defaultMessage);

  const costGraphOptions = {
    title: "Token Cost",
  };

  useImperativeHandle(ref, () => ({
    sendMessageToServerCost,
  }));

  // Function to send message to WebSocket server
  const sendMessageToServerCost = useCallback(async (selectedItem, selectedUser, startDate, endDate) => {
    var query = "SELECT application_name, app_user, token_cost,timestamp FROM token_usage";
    // Add filtering logic based on selectedItem, selectedUser, startDate, and endDate
    if (selectedItem && !selectedUser) {
      query += ` WHERE application_name = '${selectedItem}'`;
    }
    if (selectedUser && !selectedItem) {
      query += ` WHERE app_user = '${selectedUser}'`;
    }
    if (selectedUser && selectedItem) {
      query += ` WHERE application_name = '${selectedItem}' AND app_user = '${selectedUser}'`;
    }
    console.log('q', query);
    try {
      const apiUrl = process.env.REACT_APP_BACKEND_API_URL; // Use API URL instead of WebSocket URL
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: query }),
      });

      const result = await response.json();
      setMessageFromServerCost(result);
    } catch (error) {
      console.error('Error fetching data from API:', error);
    }
  }, []);

  console.log("Token Cost messageFromServer", messageFromServerCost);

  // starts

  // const getIntervals = (start, end, number) => {
  //   const interval = end - start;
  //   const step = Math.round(interval / number);
  //   const intervals = {};

  //   let intStart = start;
  //   let intEnd = start + step;
  //   while (intEnd <= end) {
  //     intervals[`${intStart}-${intEnd}`] = {
  //       start: intStart,
  //       end: intEnd,
  //     };

  //     intStart = intStart + step;
  //     intEnd = intEnd + step;
  //   }

  //   return intervals;
  // };

  const getCostGraphData = (apps, startDate, endDate) => {
    let result = [];
      for (const appId in apps) {
        const app = apps[appId];
        const convertUTCToIST = (utcDateString) => {
          const utcDate = new Date(utcDateString);
          const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
          return new Date(utcDate.getTime() + istOffset); // Returns a Date object in IST
        };

        const timestamp = convertUTCToIST(app.timestamp);

        let tokenCost = parseFloat(app.token_cost);

        if(tokenCost){
          if (Array.isArray(tokenCost)) {
            tokenCost = tokenCost > 0 ? tokenCost / 100000000 : 0;
          } else if (typeof tokenCost === 'number') {
            tokenCost = tokenCost;
          }
        }

        // Filter out NaN values
        if (isNaN(tokenCost)) {
          continue; 
        }

        if (timestamp >= startDate && timestamp <= endDate) {
          result.push({
            group: 'Dataset 1',
            key: app.timestamp,
            value: tokenCost,
          });
        } else if (!startDate && !endDate) {
          result.push({
            group: 'Dataset 1',
            key: app.timestamp,
            value: tokenCost,
          });
        }
      }
  
      return result;
        
  };

  const costGraphData = getCostGraphData(messageFromServerCost, startDate, endDate);
  console.log("costGraphData", costGraphData);

  //ends

  return (
    <>
    {costGraphData.length === 0 ? (
        <NoData />
      ) : (
        <CustomLineChart data={costGraphData} options={costGraphOptions} />
      )}
    </>
  );
});

export default CostGraph;