import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Button, Tile } from "@carbon/react";
import { MeterChart } from "@carbon/charts-react";
import { useStoreContext } from "../../../store";
import NoData from "../../common/NoData/NoData";
import { InformationFilled } from "@carbon/icons-react";

const getColorByValue = (value) => {
  if (value >= 4) return "#00bfae"; // Excellent
  if (value >= 3) return "#f1c21b"; // Good
  return "#f46666"; // Bad
};

const getStatusText = (value) => {
  if (value >= 4) return "Excellent";
  if (value >= 3) return "Good";
  return "Bad";
};

const options = (color, statusText) => ({
  theme: "g90",
  resizable: true,
  height: '60%',
  width: '100%',
  meter: {
    proportional: {
      total: 5,
      totalFormatter: e => statusText,
      breakdownFormatter: e => `The rating of the application is ${e.datasetsTotal.toFixed(2)} out of 5`
    },
    height: '60%',
    width: '150%'
    },
    color: {
      pairing: {
        option: 2
      }
    },
  toolbar: {
    enabled: false
  },
});


const defaultData = [
  {
    group: '',
    value: 0
  }
];

const UserSatisfaction = forwardRef(({ selectedItem, selectedUser, startDate, endDate }, ref) => {
  const [data, setData] = useState(defaultData);
  const [avg, setAvg] = useState(0);
  const [messageFromServerUser, setMessageFromServerUser] = useState(null);
  const [chartOptions, setChartOptions] = useState(options("#f46666", "Bad")); // Default options

  const { state } = useStoreContext();

  useImperativeHandle(ref, () => ({
    sendMessageToServerUser,
  }));

  useEffect(() => {
    if (selectedItem || selectedUser) {
      sendMessageToServerUser(selectedItem, selectedUser, startDate, endDate);
    }
  }, [selectedItem, selectedUser, startDate, endDate]);

  const sendMessageToServerUser = async (selectedItem, selectedUser, startDate, endDate) => {
    let q = "SELECT * FROM user_satisfaction";

    // Add filtering logic based on selectedItem, selectedUser, and date range
    if (selectedItem && !selectedUser) {
      q += ` WHERE application_name = '${selectedItem}'`;
    }
    if (selectedUser && !selectedItem) {
      q += ` WHERE app_user = '${selectedUser}'`;
    }
    if (selectedUser && selectedItem) {
      q += ` WHERE application_name = '${selectedItem}' AND app_user = '${selectedUser}'`;
    }

    if (startDate && endDate) {
      q += ` AND timestamp BETWEEN '${startDate.toISOString()}' AND '${endDate.toISOString()}'`;
    }

    try {
      const apiUrl = process.env.REACT_APP_BACKEND_API_URL; // Replace with actual API URL
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: q }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setMessageFromServerUser(data);
    } catch (error) {
      console.error("Error fetching user satisfaction data:", error);
    }
  };

  useEffect(() => {
    if (messageFromServerUser && state.status === 'success') {
      let filteredData = messageFromServerUser;

      if (startDate && endDate) {
        const convertUTCToIST = (utcDateString) => {
          const utcDate = new Date(utcDateString);
          const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
          return new Date(utcDate.getTime() + istOffset); // Returns a Date object in IST
        };

        filteredData = messageFromServerUser.filter((accuracy) => {
          const timestamp = convertUTCToIST(accuracy.timestamp);
          return timestamp >= startDate && timestamp <= endDate;
        });
      }

      const userRatings = filteredData.map(d => d.rating || 0);
      const newAvgValue = userRatings.reduce((s, g) => s + +g, 0) / userRatings.length;
      const newAvg = newAvgValue.toFixed(2);

      const newData = [
        {
          group: 'User rating',
          value: newAvgValue // Ensure the value is between 0 and 5
        }
      ];

      // Determine chart color and status text based on the average value
      const chartColor = getColorByValue(newAvgValue);
      const statusText = getStatusText(newAvgValue);

      setData(newData);
      setAvg(newAvg);
      setChartOptions(options(chartColor, statusText));
    }
  }, [messageFromServerUser, state.status]);

  return (
    <Tile className="infrastructure-components accuracy p-0">
      {/* <h5>Application Rating</h5> */}
      <h4 className="title">
        Application Rating
        <Button
          hasIconOnly
          renderIcon={InformationFilled}
          iconDescription="Application rating is the average rating provided by users for an application."
          kind="ghost"
          size="sm"
          className="customButton"
        />
      </h4>
      <p>
        <ul className="sub-title">
          <li><strong>User Name:</strong> { `${selectedUser || 'For All User Name'}`}</li>
          <li><strong>Application Name:</strong> { `${selectedItem || 'For All Application Name'}`}</li>
        </ul>
      </p>
      <div className="cpu-usage-chart">
        {avg > 0 ? (
          <MeterChart data={data} options={chartOptions} />
        ) : (
          <NoData />
        )}
      </div>
      <div className="cpu-usage-data">
        {avg > 0 ? (
          <>
            <div className="label">
             Average rating of application
            </div>
            <h3 className="data">{avg}/5</h3>
          </>
        ) : (
          <div className="label">
          </div>
        )}
      </div>
    </Tile>
  );
});

export default UserSatisfaction;
