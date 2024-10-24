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
import { latencyOptions } from "../constants";
import { useStoreContext } from "../../../store";
import { getIntervals, getLatencyData } from "../helper";
import moment from "moment";
import NoData from "../../common/NoData/NoData";

const LatencyGraph = forwardRef(({ selectedItem, selectedUser, startDate, endDate }, ref) => {
  const [messageFromServerLatency, setMessageFromServerLatency] = useState('');
  const [loading, setLoading] = useState(true); // Add loading state

  useImperativeHandle(ref, () => ({
    fetchLatencyData,
  }));

  // Function to fetch data from the API
  const fetchLatencyData = async (selectedItem, selectedUser, startDate, endDate) => {
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

      var responseData = await response.json();
      setMessageFromServerLatency(responseData); // Assuming the data is in the correct structure
    } catch (error) {
      console.error("Error fetching data:", error);
    }finally {
      if (Array.isArray(responseData) && responseData.length > 0) {
        setLoading(false); // Stop loading
      }else {
        setLoading(false); // Stop loading in case of empty data or error
    }
    }
  };

  useEffect(() => {
    fetchLatencyData(selectedItem, selectedUser, startDate, endDate);
  }, [selectedItem, selectedUser, startDate, endDate]);

  const getLatencyDataInside = (apps, startDate, endDate) => {
    const result = [];

    for (const appId in apps) {
      const app = apps[appId];
      const convertUTCToIST = (utcDateString) => {
        const utcDate = new Date(utcDateString);
        const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
        return new Date(utcDate.getTime() + istOffset); // Returns a Date object in IST
      };

      const timestamp = convertUTCToIST(app.timestamp);

      let latency = app.data.latency.histogram.bins;
      if (Array.isArray(app.data.latency.histogram.bins)) {
        latency = latency > 0 ? latency / 100000000 : 0;
      } else if (typeof latency === 'number') {
        latency = latency;
      }

      if (timestamp >= startDate && timestamp <= endDate) {
        result.push({
          group: 'Dataset 1',
          key: app.timestamp,
          value: latency,
        });
      } else if (!startDate && !endDate) {
        result.push({
          group: 'Dataset 1',
          key: app.timestamp,
          value: latency,
        });
      }
    }

    return result;
  };

  const { state } = useStoreContext();
  const latencyDataInside = getLatencyDataInside(messageFromServerLatency, startDate, endDate);
  const latency_number = latencyDataInside.length;

  const latencyOptions = {
    title: '', // 'Latency (in seconds): ' + latency_number,
    data: {
      loading: loading
    },
  };

  return (
    <>
      {loading ? (
        <>
        <h4 className="title">
          Latency (in seconds)
        </h4>
        <p>
          <ul className="sub-title">
            <li><strong>User Name:</strong> { `${selectedUser || 'For All User Name'}`}</li>
            <li><strong>Application Name:</strong> { `${selectedItem || 'For All Application Name'}`}</li>
          </ul>
        </p>
        <CustomLineChart
          data={[]}
          options={latencyOptions}
        />
      </>
      ) : latencyDataInside.length > 0 ? (
        <>
          <h4 className="title">
            Latency (in seconds)
          </h4>
          <p>
            <ul className="sub-title">
              <li><strong>User Name:</strong> { `${selectedUser || 'For All User Name'}`}</li>
              <li><strong>Application Name:</strong> { `${selectedItem || 'For All Application Name'}`}</li>
            </ul>
          </p>
          <CustomLineChart
            data={latencyDataInside}
            options={latencyOptions}
          />
        </>
      ) : (
        <NoData />
      )}
    </>
  );
});

export default LatencyGraph;
