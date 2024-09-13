import React, { useEffect, useState } from "react";
import CustomDataTable from "../common/CustomDataTable";
import { useParams } from "react-router-dom";
import { useStoreContext } from "../../store";
import { Pagination, Slider } from '@carbon/react';

const defaultHeaders = [
  {
    key: "operation",
    header: "Operation",
    checked: true,
    required: true,
  },
  {
    key: "latency",
    header: "Latency",
    checked: true,
  },
  {
    key: "timeline",
    header: "Timeline",
    checked: true,
  },
  {
    key: "toggletip",
    header: "Model",
    checked: true,
  },
  {
    key: "data",
    header: "",
    checked: true,
  },
];

const TraceAnalysisTable = () => {
  const { appName } = useParams();
  const [rows, setRows] = useState([]);
  const { state } = useStoreContext();
  const [messageFromServerTraceTable, setMessageFromServerTraceTable] = useState([]);
  const [headers, setHeaders] = useState(defaultHeaders);
  const [currentPage, setCurrentPage] = useState(1); // Current page state
  const [rowsPerPage, setRowsPerPage] = useState(5); // Rows per page
  const [totalItems, setTotalItems] = useState(0); // Total number of items

  // API call replacing WebSocket
  const fetchTraceData = async () => {
    try {
      const query = `SELECT * FROM operations WHERE application_name = '${appName}'`;
      const apiUrl = process.env.REACT_APP_BACKEND_API_URL;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      console.log('Response in trace table', response);

      if (!response.ok) {
        throw new Error("Failed to fetch trace data");
      }
      const data = await response.json();
      console.log('data in trace table', data);
      setMessageFromServerTraceTable(data);
      setTotalItems(data.length);
    } catch (error) {
      console.error("Error fetching trace data:", error);
    }
  };

  useEffect(() => {
    fetchTraceData();
  }, [appName]);

  // Log messageFromServerTraceTable to the console
  useEffect(() => {
    console.log("messageFromServerTraceTable:", messageFromServerTraceTable);
  }, [messageFromServerTraceTable]);

  // Process and format data
  useEffect(() => {
    if (messageFromServerTraceTable) {
      const data = Array.isArray(messageFromServerTraceTable)
        ? messageFromServerTraceTable
        : [];

      // If the application data is found, log it
      if (data.length > 0) {
        setHeaders(defaultHeaders);
        setRows(data);
      }
    }
  }, [appName, messageFromServerTraceTable]);

  // Calculate min and max for the slider
  const calculateSliderRange = () => {
    let min = Infinity;
    let max = -Infinity;

    rows.forEach(appData => {
      const start = appData.start_ns/ 10000000000;
      const end = (appData.start_ns/ 10000000000) + (appData.latency_ns/ 10000000000);

      if (start < min) min = start;
      if (end > max) max = end;
    });

    return { min, max };
  };

  // Get data for the current page
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const { min, max } = calculateSliderRange();

    // Map over the array to format each row
    let formattedRows = rows.slice(startIndex, endIndex).map((appData) => {
      // Extract the model value from the tags
      const modelTag = appData.tags.find(tag => tag.key === 'model');
      const model = modelTag ? `model=${modelTag.value}` : '';

      return {
        operation: (
          <a href={`#/traces/?operation=${appData.operation}`}>
            {appData.operation}
          </a>
        ),
        id: appData.id,
        latency: appData.latency_ns > 0 ? `${(appData.latency_ns / 10000000000).toFixed(2)} s` : 'No value',
        timeline: (
          <div className="timeline-column">
            <Slider
              min={0}
              max={1}
              value={[
                appData.start_ns / 100000000000,
                (appData.start_ns / 100000000000) + (appData.latency_ns / 100000000000)
              ]}
              disabled
              hideTextInput
              readOnly
              step={0.1}
            />
          </div>
        ),
        toggletip: model, // Add the extracted model value here
      };
    });

    return formattedRows;
  };

  const handlePaginationChange = ({ page, pageSize }) => {
    setCurrentPage(page);
    setRowsPerPage(pageSize);
  };

  const currentRows = getCurrentPageData();

  return (
    <div>
      <CustomDataTable
        headers={defaultHeaders}
        rows={currentRows}
      />
      {/* Add pagination component */}
      <Pagination
        totalItems={totalItems}
        pageSize={rowsPerPage}
        page={currentPage}
        onChange={handlePaginationChange} // Use a single handler for both page and pageSize
        pageSizes={[5, 10, 20, 30, 40, 50]} // Options for rows per page
      />
    </div>
  );
};

export default TraceAnalysisTable;
