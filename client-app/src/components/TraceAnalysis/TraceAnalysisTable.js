import React, { useEffect, useState } from "react";
import CustomDataTable from "../common/CustomDataTable";
import { useParams } from "react-router-dom";
import { useStoreContext } from "../../store";
import { Pagination } from '@carbon/react';

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
    header: "Parameters",
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

      if (!response.ok) {
        throw new Error("Failed to fetch trace data");
      }
      const data = await response.json();
      console.log('data in trace table', data);
      setMessageFromServerTraceTable(data);
      setTotalItems(data.length)
    } catch (error) {
      console.error("Error fetching trace data:", error);
    }
  };

  useEffect(() => {
    fetchTraceData();
  }, []);

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

  // Get data for the current page
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    // Map over the array to format each row
    let formattedRows = rows.slice(startIndex, endIndex).map((appData) => ({
      operation: (
        <a href={`#/traces/?operation=${appData.operation}`}>
          {appData.operation}
        </a>
      ),
      id: appData.id,
    }));
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
