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
import { getIntervals } from "../helper";
import moment from "moment";
import NoData from "../../common/NoData/NoData";

const CallCountGraph = forwardRef(({ selectedItem, selectedUser, selectedTimestampRange, numberOfDaysSelected, startDate, endDate }, ref) => {
  const [messageFromServerCallCount, setMessageFromServerCallCount] = useState('');
  let defaultNumberofDays = 7;

  useImperativeHandle(ref, () => ({
    sendMessageToServerCallCount,
  }));

  // Function to fetch data from the API
  const sendMessageToServerCallCount = async (selectedItem, selectedUser, selectedTimestampRange, numberOfDaysSelected, startDate, endDate) => {
    let query = 'SELECT application_name, data, timestamp FROM performance';
    defaultNumberofDays = numberOfDaysSelected;

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

    if (startDate && endDate) {
      query += ` WHERE timestamp >= '${startDate}' AND timestamp <= '${endDate}'`;
    }

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

      const data = await response.json();
      setMessageFromServerCallCount(data); // Assuming the data is in the correct structure
    } catch (error) {
      console.error("Error fetching data:", error);
    }

    return defaultNumberofDays;
  };

  useEffect(() => {
    sendMessageToServerCallCount(selectedItem, selectedUser, selectedTimestampRange, numberOfDaysSelected, startDate, endDate);
  }, [selectedItem, selectedUser, selectedTimestampRange, numberOfDaysSelected, startDate, endDate]);

  const getCallCountDataInside = (apps, startDate, endDate, selectedItem, selectedUser) => {
    let result = [];

    for (const appId in apps) {
      const app = apps[appId];
      const convertUTCToIST = (utcDateString) => {
        const utcDate = new Date(utcDateString);
        const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
        return new Date(utcDate.getTime() + istOffset); // Returns a Date object in IST
      };

      const timestamp = convertUTCToIST(app.timestamp);
      let callCount = app.data.call_count.counter;

      if (Array.isArray(callCount)) {
        callCount = callCount > 0 ? callCount / 100000000 : 0;
      } else if (typeof callCount === 'number') {
        callCount = callCount;
      }

      if (timestamp >= startDate && timestamp <= endDate) {
        result.push({
          group: 'Dataset 1',
          key: app.timestamp,
          value: callCount,
        });
      } else if (!startDate && !endDate) {
        result.push({
          group: 'Dataset 1',
          key: app.timestamp,
          value: callCount,
        });
      }
    }

    return result;
  };

  const { state } = useStoreContext();
  const CallCountDataInside = getCallCountDataInside(messageFromServerCallCount, startDate, endDate, selectedItem, selectedUser);
  const call_count_number = CallCountDataInside.length;

  const formatDate = (date) => moment(date).format('YYYY-MM-DD');
  const startDateFormatted = startDate ? formatDate(startDate) : '';
  const endDateFormatted = endDate ? formatDate(endDate) : '';
  
  const callCountOptions = {
    // title: `Total Call Count of ${selectedUser || 'all user'}'s ${selectedItem || 'all applications'}: ${call_count_number} in ${startDateFormatted} to ${endDateFormatted} these days`,
    title: ''
  };

  console.log(startDateFormatted, endDateFormatted, "111122223333", startDate, endDate, selectedItem, selectedUser);
  

  return (
    <>
      {CallCountDataInside.length === 0 ? (
        <NoData />
      ) : (
        <>
          <h5>
            {`${selectedUser || 'All User'}'s ${selectedItem || 'all Applications'} Call Count is ${call_count_number}`}
            {/* Total Call Count of
            {selectedUser && selectedItem ? ` ${selectedUser}'s ${selectedItem} ` : selectedUser ? selectedUser === 'all' ? ` of ${selectedUser} ` : ` ${selectedUser}'s ` : selectedItem ? ` ${selectedItem}'s ` : ' of all '}  */}
          </h5>
          <CustomLineChart data={CallCountDataInside} options={callCountOptions} />
        </>
      )}
    </>
  );
});

export default CallCountGraph;
