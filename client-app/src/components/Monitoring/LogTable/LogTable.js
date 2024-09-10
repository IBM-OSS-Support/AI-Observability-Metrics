import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import CustomDataTable from '../../common/CustomDataTable';
import { Pagination } from '@carbon/react';

const LogTable = forwardRef(({ selectedItem, selectedUser, startDate, endDate }, ref) => {
  const [messageFromServerLogTable, setMessageFromServerLogTable] = useState([]);
  const [headersLogTable, setHeadersLogTable] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // Current page state
  const [rowsPerPage, setRowsPerPage] = useState(5); // Rows per page
  const [totalItems, setTotalItems] = useState(0); // Total number of items

  useImperativeHandle(ref, () => ({
    fetchLogTableData,
  }));

  // Function to fetch data from the API
  const fetchLogTableData = async (selectedItem, selectedUser, startDate, endDate) => {
    let query = 'SELECT id, application_name, app_user, timestamp FROM maintenance';

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

    const apiUrl = process.env.REACT_APP_BACKEND_API_URL;

    try {
      const response = await fetch(`${apiUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      const convertUTCToIST = (utcDateString) => {
        const utcDate = new Date(utcDateString);
        const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
        return new Date(utcDate.getTime() + istOffset);
      };

      let filteredData = data;
      if (startDate && endDate) {
        filteredData = data.filter((row) => {
          const rowTimestamp = convertUTCToIST(row.timestamp);
          return rowTimestamp >= startDate && rowTimestamp <= endDate;
        });
      }

      const formattedData = filteredData.map((row) => ({
        ...row,
        application_name: (
          <a href={`#/trace-analysis/${row.application_name}`}>
            {row.application_name}
          </a>
        ),
      }));

      setMessageFromServerLogTable(formattedData);
      setTotalItems(formattedData.length); // Set total number of items
    } catch (error) {
      console.error('Error fetching log table data:', error);
    }
  };

  // Set headers for the table
  useEffect(() => {
    setHeadersLogTable([
      { key: 'id', header: 'ID' },
      { key: 'application_name', header: 'Application Name' },
      { key: 'app_user', header: 'User' },
      { key: 'timestamp', header: 'Timestamp' },
    ]);
  }, []);

  // Get data for the current page
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return messageFromServerLogTable.slice(startIndex, endIndex);
  };

  const handlePaginationChange = ({ page, pageSize }) => {
    setCurrentPage(page);
    setRowsPerPage(pageSize);
  };

  const currentRows = getCurrentPageData();
  
  return (
    <div>
      <CustomDataTable headers={headersLogTable} rows={currentRows} />

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

export default LogTable;
