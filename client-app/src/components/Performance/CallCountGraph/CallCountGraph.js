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
import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import CustomLineChart from "../../common/CustomLineChart";
import { useStoreContext } from "../../../store";
import moment from "moment";
import NoData from "../../common/NoData/NoData";

const CallCountGraph = forwardRef(({ selectedItem, selectedUser, startDate, endDate }, ref) => {
  const [messageFromServerCallCount, setMessageFromServerCallCount] = useState('');
  const [loading, setLoading] = useState(true); // Add loading state
  let defaultNumberofDays = 7;

  useImperativeHandle(ref, () => ({
    sendMessageToServerCallCount,
  }));

  // Function to fetch data from the API
  const sendMessageToServerCallCount = async (selectedItem, selectedUser, startDate, endDate) => {
    setLoading(true); // Start loading before making API call
    let query = 'SELECT application_name, data, timestamp FROM performance';
    // Add filtering logic based on selectedItem, selectedUser, and selectedTimestampRange
    if (selectedItem && !selectedUser) {
        query += ` WHERE application_name = '${selectedItem}'`;
    }
    if (selectedUser && !selectedItem) {
        query += ` WHERE app_user = '${selectedUser}'`;
    }
    if (selectedUser && selectedItem) {
        query += ` WHERE application_name = '${selectedItem}' AND app_user = '${selectedUser}'`;
    }

    let responseData; // Declare responseData outside the try block
    try {
        const apiUrl = process.env.REACT_APP_BACKEND_API_URL;
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ query }),
        });

        if (!response.ok) {
            throw new Error("Failed to fetch data");
        }

        responseData = await response.json();
        setMessageFromServerCallCount(responseData); // Assuming the data is in the correct structure
    } catch (error) {
        console.error("Error fetching data:", error);
    } finally {
        setLoading(false); // Stop loading in all cases
    }

    return defaultNumberofDays;
  };


  useEffect(() => {
    sendMessageToServerCallCount(selectedItem, selectedUser, startDate, endDate);
  }, [selectedItem, selectedUser, startDate, endDate]);

  const getCallCountDataInside = (apps, startDate, endDate, selectedItem, selectedUser) => {
    let result = [];

    // Ensure startDate and endDate are valid dates
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    for (const appId in apps) {
      const app = apps[appId];
      
      const convertUTCToIST = (utcDateString) => {
        const utcDate = new Date(utcDateString);
        const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
        return new Date(utcDate.getTime() + istOffset);
      };

      const timestamp = convertUTCToIST(app.timestamp);
      let callCount = app.data?.call_count?.counter || 0;

      if (typeof callCount === 'number') {
        // Check if the timestamp is within the start and end date range
        if ((!start || timestamp >= start) && (!end || timestamp <= end)) {
          result.push({
            group: 'Dataset 1',
            key: app.timestamp,
            value: callCount,
          });
        }
      }
    }

    return result;
  };

  const { state } = useStoreContext();
  const CallCountDataInside = getCallCountDataInside(
    messageFromServerCallCount,
    startDate,
    endDate,
    selectedItem,
    selectedUser
  );
  const call_count_number = CallCountDataInside.length;

  const formatDate = (date) => moment(date).format('YYYY-MM-DD');
  const startDateFormatted = startDate ? formatDate(startDate) : '';
  const endDateFormatted = endDate ? formatDate(endDate) : '';
  
  const callCountOptions = {
    title: '',
    data: {
      loading: loading
    },
  };

  console.log("startDate, endDate", startDate, endDate);
  console.log('CallCountDataInside =', CallCountDataInside);
  

  return (
    <>
      {loading ? (
        <>
        <h4 className="title">Call Count</h4>
        <p>
          <ul className="sub-title">
            <li><strong>User Name:</strong> {`${selectedUser || 'For All User Name'}`}</li>
            <li><strong>Application Name:</strong> {`${selectedItem || 'For All Application Name'}`}</li>
          </ul>
        </p>
        <CustomLineChart 
          data={[]} 
          options={callCountOptions} 
          key={JSON.stringify(CallCountDataInside)} // Add a unique key if needed
        />
      </>
      ) : CallCountDataInside.length > 0 ? (
        <>
          <h4 className="title">Call Count</h4>
          <p>
            <ul className="sub-title">
              <li><strong>User Name:</strong> {`${selectedUser || 'For All User Name'}`}</li>
              <li><strong>Application Name:</strong> {`${selectedItem || 'For All Application Name'}`}</li>
            </ul>
          </p>
          <CustomLineChart 
            data={CallCountDataInside} 
            options={callCountOptions} 
            key={JSON.stringify(CallCountDataInside)} // Add a unique key if needed
          />
        </>
      ) : (
        <NoData />
      )}
    </>
  );
});

export default CallCountGraph;
