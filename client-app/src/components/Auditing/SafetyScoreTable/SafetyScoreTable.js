import React, { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import CustomDataTable from "../../common/CustomDataTable";

const SafetyScoreTable = forwardRef(
  ({ selectedItem, selectedUser, startDate, endDate }, ref) => {
    const [rowData, setRowData] = useState([]);
    const [headers, setHeaders] = useState([]);
    const [pagination, setPagination] = useState({ offset: 0, first: 10 });
    const [searchText, setSearchText] = useState("");
    const [filters, setFilters] = useState([]);
    const [selectedFilters, setSelectedFilters] = useState({});

    useImperativeHandle(ref, () => ({
      sendMessageToServer,
    }));

    const sendMessageToServer = async (selectedItem, selectedUser, startDate, endDate) => {
      let q = `
      SELECT COUNT(*) AS total_records,
             SUM(CASE WHEN flagged THEN 1 ELSE 0 END) AS true_count,
             SUM(CASE WHEN NOT flagged THEN 1 ELSE 0 END) AS false_count,
             (SUM(CASE WHEN flagged THEN 1 ELSE 0 END)::NUMERIC / COUNT(*)) * 100 AS true_percentage,
             (SUM(CASE WHEN NOT flagged THEN 1 ELSE 0 END)::NUMERIC / COUNT(*)) * 100 AS false_percentage
      FROM auditing`;

      // Add filtering logic based on selectedItem, selectedUser, startDate, and endDate
      if (startDate && endDate) {
        if (selectedItem && !selectedUser) {
          q = `
        SELECT COUNT(*) AS total_records,
               SUM(CASE WHEN flagged THEN 1 ELSE 0 END) AS true_count,
               SUM(CASE WHEN NOT flagged THEN 1 ELSE 0 END) AS false_count,
               (SUM(CASE WHEN flagged THEN 1 ELSE 0 END)::NUMERIC / COUNT(*)) * 100 AS true_percentage,
               (SUM(CASE WHEN NOT flagged THEN 1 ELSE 0 END)::NUMERIC / COUNT(*)) * 100 AS false_percentage
        FROM auditing
        WHERE application_name = '${selectedItem}' AND timestamp >= '${startDate}' AND timestamp <= '${endDate}'`;
        }
        if (selectedUser && !selectedItem) {
          q = `
        SELECT COUNT(*) AS total_records,
               SUM(CASE WHEN flagged THEN 1 ELSE 0 END) AS true_count,
               SUM(CASE WHEN NOT flagged THEN 1 ELSE 0 END) AS false_count,
               (SUM(CASE WHEN flagged THEN 1 ELSE 0 END)::NUMERIC / COUNT(*)) * 100 AS true_percentage,
               (SUM(CASE WHEN NOT flagged THEN 1 ELSE 0 END)::NUMERIC / COUNT(*)) * 100 AS false_percentage
        FROM auditing
        WHERE app_user = '${selectedUser}' AND timestamp >= '${startDate}' AND timestamp <= '${endDate}'`;
        }
        if (selectedUser && selectedItem) {
          q = `
        SELECT COUNT(*) AS total_records,
               SUM(CASE WHEN flagged THEN 1 ELSE 0 END) AS true_count,
               SUM(CASE WHEN NOT flagged THEN 1 ELSE 0 END) AS false_count,
               (SUM(CASE WHEN flagged THEN 1 ELSE 0 END)::NUMERIC / COUNT(*)) * 100 AS true_percentage,
               (SUM(CASE WHEN NOT flagged THEN 1 ELSE 0 END)::NUMERIC / COUNT(*)) * 100 AS false_percentage
        FROM auditing
        WHERE application_name = '${selectedItem}' AND app_user = '${selectedUser}' AND timestamp >= '${startDate}' AND timestamp <= '${endDate}'`;
        }
      } else if (selectedItem && !selectedUser) {
        q = `
      SELECT COUNT(*) AS total_records,
             SUM(CASE WHEN flagged THEN 1 ELSE 0 END) AS true_count,
             SUM(CASE WHEN NOT flagged THEN 1 ELSE 0 END) AS false_count,
             (SUM(CASE WHEN flagged THEN 1 ELSE 0 END)::NUMERIC / COUNT(*)) * 100 AS true_percentage,
             (SUM(CASE WHEN NOT flagged THEN 1 ELSE 0 END)::NUMERIC / COUNT(*)) * 100 AS false_percentage
      FROM auditing
      WHERE application_name = '${selectedItem}'`;
      } else if (selectedUser && !selectedItem) {
        q = `
      SELECT COUNT(*) AS total_records,
             SUM(CASE WHEN flagged THEN 1 ELSE 0 END) AS true_count,
             SUM(CASE WHEN NOT flagged THEN 1 ELSE 0 END) AS false_count,
             (SUM(CASE WHEN flagged THEN 1 ELSE 0 END)::NUMERIC / COUNT(*)) * 100 AS true_percentage,
             (SUM(CASE WHEN NOT flagged THEN 1 ELSE 0 END)::NUMERIC / COUNT(*)) * 100 AS false_percentage
      FROM auditing
      WHERE app_user = '${selectedUser}'`;
      } else if (selectedUser && selectedItem) {
        q = `
      SELECT COUNT(*) AS total_records,
             SUM(CASE WHEN flagged THEN 1 ELSE 0 END) AS true_count,
             SUM(CASE WHEN NOT flagged THEN 1 ELSE 0 END) AS false_count,
             (SUM(CASE WHEN flagged THEN 1 ELSE 0 END)::NUMERIC / COUNT(*)) * 100 AS true_percentage,
             (SUM(CASE WHEN NOT flagged THEN 1 ELSE 0 END)::NUMERIC / COUNT(*)) * 100 AS false_percentage
      FROM auditing
      WHERE application_name = '${selectedItem}' AND app_user = '${selectedUser}'`;
      }

      try {
        const apiUrl = process.env.REACT_APP_BACKEND_API_URL; // API URL
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: q }), // Sending query as body
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        console.log('data in datatable', data);
        setRowData(data); // Assuming the data format matches the table rows
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    useEffect(() => {
      setHeaders([
        { key: "total_records", header: "Total Records" },
        { key: "true_count", header: "True Count" },
        { key: "false_count", header: "False Count" },
        { key: "true_percentage", header: "True Percentage" },
        { key: "false_percentage", header: "False Percentage" },
      ]);
    }, []);

    console.log('rowdata', rowData);

    return (
      <div>
        <CustomDataTable
          headers={headers}
          rows={rowData}
          loading={false}
          search={{
            searchText: searchText,
            persistent: true,
            placeholder: "Search for queries",
            onChange: setSearchText,
          }}
          filter={{
            id: "query-history-filter",
            setSelectedFilters: (newSelectedFilters) => {
              setSelectedFilters(newSelectedFilters);
              setPagination((prev) => ({ ...prev, offset: 0 }));
            },
          }}
          pagination={{
            totalItems: rowData.length,
            setPagination,
            ...pagination,
          }}
          emptyState={
            !rowData.length && {
              type: false ? "NotFound" : "NoData",
              title: "No traces yet.",
              noDataSubtitle: "All traces from your data are listed here.",
            }
          }
        />
      </div>
    );
  }
);

export default SafetyScoreTable;
