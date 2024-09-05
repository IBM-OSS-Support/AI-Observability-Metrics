import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { Tile } from "@carbon/react";
import { StackedBarChart } from "@carbon/charts-react";
import { Maximize } from "@carbon/icons-react";
import moment from 'moment';
import NoData from "../../common/NoData/NoData";

const options = {
  theme: "g100",
  title: "Average Token per Session",
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
    controls: [{
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

const defaultData = [
  {
    group: "value",
    key: "Count",
    value: 0
  }
];

const TokenPerSession1 = forwardRef(({ selectedItem, selectedUser, selectedTimestampRange, startDate, endDate }, ref) => {
  const [data, setData] = useState(defaultData);
  const [avg, setAvg] = useState(0);
  const [messageFromServerToken, setMessageFromServerToken] = useState('');

  useImperativeHandle(ref, () => ({
    sendMessageToServerToken,
  }));

  const sendMessageToServerToken = async (selectedItem, selectedUser, startDate, endDate) => {
    let query = "SELECT * FROM anthropic_metrics WHERE 1=1";
  
    if (selectedItem) {
      query += ` AND application_name = '${selectedItem}'`;
    }
    if (selectedUser) {
      query += ` AND app_user = '${selectedUser}'`;
    }
    if (startDate && endDate) {
      query += ` AND timestamp >= '${startDate.toISOString()}' AND timestamp <= '${endDate.toISOString()}'`;
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
        throw new Error("Failed to fetch token data");
      }
  
      const data = await response.json();
      setMessageFromServerToken(data);
    } catch (error) {
      console.error("Error fetching token data:", error);
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
      sendMessageToServerToken(selectedItem, selectedUser, startDate, endDate);
    }
  }, [selectedItem, selectedUser, startDate, endDate]);

  useEffect(() => {
    if (messageFromServerToken) {
      const cpuUsages = messageFromServerToken.map((d) => {
        const cpuUsage = d.total_count;
        return cpuUsage ? Number(cpuUsage) : 0;
      });

      const filteredCpuUsages = cpuUsages.filter((value) => typeof value === "number" && !isNaN(value));

      const total = filteredCpuUsages.reduce((s, g) => s + g, 0);
      const newAvgValue = filteredCpuUsages.length > 0 ? total / filteredCpuUsages.length : 0;
      const newAvg = newAvgValue.toFixed(2);

      setData([
        {
          group: "value",
          key: "Average",
          value: newAvgValue
        }
      ]);
      setAvg(newAvg);
    } else {
      setData(defaultData);
      setAvg(0);
    }
  }, [messageFromServerToken]);

  return (
    <>
    {messageFromServerToken.length > 0 ? (
      <Tile>
        <StackedBarChart data={data} options={options} />
        <div className="cpu-usage-data pt-1">
          <div className="label">Average Tokens per Session</div>
          <h3 className="data">{avg}</h3>
        </div>
      </Tile>
    ) : (
      <Tile className="nodata-wrap">
        <NoData />
      </Tile>
    )}
    </>
  );
});

export default TokenPerSession1;
