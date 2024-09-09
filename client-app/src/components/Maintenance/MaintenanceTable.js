import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import CustomDataTable from "../common/CustomDataTable";
import { Pagination } from "@carbon/react";

const MaintenanceTable = forwardRef((props, ref) => {
  const [messageFromServerLog, setMessageFromServerLog] = useState([]);
  const [rowDataLog, setRowDataLog] = useState([]); // Define state for formatted data
  const [headersLog, setHeadersLog] = useState([]); // Define state for headers
  const [currentPage, setCurrentPage] = useState(1); // Current page state
  const [rowsPerPage, setRowsPerPage] = useState(5); // Rows per page
  const [totalItems, setTotalItems] = useState(0); // Total number of items

  useImperativeHandle(ref, () => ({
    sendMessageToServerLog,
  }));

  // Function to send message to the API server
  const sendMessageToServerLog = async (messageFromServerLog) => {
    var q = 'SELECT * FROM maintenance limit 10';
    try {
      const apiUrl = process.env.REACT_APP_BACKEND_API_URL;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: q }),
      });

      const result = await response.json();
      setMessageFromServerLog(result);
      setTotalItems(result.length); // Set the total number of items
    } catch (error) {
      console.error('Error fetching data from API:', error);
    }
  };

  useEffect(() => {
    setHeadersLog([
      { key: "id", header: "ID" },
      { key: "graphsignal_library_version", header: "Graphsignal Library Version" },
      { key: "os_name", header: "OS Name" },
      { key: "os_version", header: "OS Version" },
      { key: "runtime_name", header: "Runtime Name" },
      { key: "runtime_version", header: "Runtime Version" },
    ]);
  }, []);

  // Get data for the current page
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return messageFromServerLog.slice(startIndex, endIndex);
  };

  const handlePaginationChange = ({ page, pageSize }) => {
    setCurrentPage(page);
    setRowsPerPage(pageSize);
  };

  const currentRows = getCurrentPageData();

  return (
    <div>
      <CustomDataTable headers={headersLog} rows={currentRows} />

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
});

export default MaintenanceTable;
