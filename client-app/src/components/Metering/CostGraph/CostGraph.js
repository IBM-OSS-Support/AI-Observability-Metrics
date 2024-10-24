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
  const [messageFromServerCost, setMessageFromServerCost] = useState('');
  const [loading, setLoading] = useState(true); // Add loading state

  const costGraphOptions = {
    title: "Token Cost",
    data: {
      loading: loading
    },
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
    try {
      const apiUrl = process.env.REACT_APP_BACKEND_API_URL; // Use API URL instead of WebSocket URL
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: query }),
      });

      var responseData = await response.json();
      setMessageFromServerCost(responseData);
    } catch (error) {
      console.error('Error fetching data from API:', error);
    }finally {
      if (Array.isArray(responseData) && responseData.length > 0) {
        setLoading(false); // Stop loading
      }else {
        setLoading(false); // Stop loading in case of empty data or error
    }
    }
  }, []);


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

  

  return (
    <>
    {
      loading ? (
        <CustomLineChart data={[]} options={costGraphOptions} />
      ) : (
        costGraphData.length > 0 ? (
          <CustomLineChart data={costGraphData} options={costGraphOptions} />
        ) : (
          <NoData />
        )
      )
    }
    </>
  );
});

export default CostGraph;