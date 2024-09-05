import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import CustomDataTable from '../../common/CustomDataTable';

const LogTable = forwardRef(({ selectedItem, selectedUser, startDate, endDate }, ref) => {
  const [messageFromServerLogTable, setMessageFromServerLogTable] = useState([]);
  const [headersLogTable, setHeadersLogTable] = useState([]);

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

      if (startDate && endDate) {
        const filteredData = data.filter((row) => {
          const rowTimestamp = convertUTCToIST(row.timestamp);
          return rowTimestamp >= startDate && rowTimestamp <= endDate;
        });

        const formattedData = filteredData.map((row) => ({
          ...row,
          application_name: (
            <a href={`#/trace-analysis/${row.application_name}`}>
              {row.application_name}
            </a>
          ),
        }));
        setMessageFromServerLogTable(formattedData);
      } else {
        const formattedData = data.map((row) => ({
          ...row,
          application_name: (
            <a href={`#/trace-analysis/${row.application_name}`}>
              {row.application_name}
            </a>
          ),
        }));
        setMessageFromServerLogTable(formattedData);
      }
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

  const arrayLogTable = Array.isArray(messageFromServerLogTable) ? messageFromServerLogTable : [messageFromServerLogTable];
  console.log('LogTable Row', arrayLogTable);

  return (
    <div>
      <CustomDataTable headers={headersLogTable} rows={arrayLogTable} />
    </div>
  );
});

export default LogTable;
