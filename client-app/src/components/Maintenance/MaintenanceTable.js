import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import CustomDataTable from "../common/CustomDataTable";
import { Pagination, Tile } from "@carbon/react";
import NoData from "../common/NoData/NoData";

const defaultHeadersLog = [
  { key: "app_user", header: "User", checked: true },
  { key: "application_name", header: "Application Name", checked: true },
  { key: "operation", header: "Operation", checked: true },
  {
    key: "graphsignal_library_version",
    header: "Graphsignal Library Version",
    checked: true,
  },
  { key: "os_name", header: "OS Name", checked: true },
  { key: "os_version", header: "OS Version", checked: true },
  { key: "runtime_name", header: "Runtime Name", checked: true },
  { key: "runtime_version", header: "Runtime Version", checked: true },
];

const MaintenanceTable = forwardRef(
  ({ selectedItem, selectedUser, startDate, endDate }, ref) => {
    const [messageFromServerLog, setMessageFromServerLog] = useState([]);
    const [originalRows, setOriginalRows] = useState([]); // Original data from server
    const [rows, setRows] = useState([]); // Filtered data
    const [headersLog, setHeadersLog] = useState(defaultHeadersLog);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [totalItems, setTotalItems] = useState(0);

    useImperativeHandle(ref, () => ({
      sendMessageToServerLog,
    }));

    const sendMessageToServerLog = async (
      selectedItem,
      selectedUser,
      startDate,
      endDate
    ) => {
      let query = "SELECT * FROM operations";

      // Build the query based on filters (selectedItem, selectedUser)
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
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });

        const result = await response.json();
        setMessageFromServerLog(result);
        setOriginalRows(result); // Store original data
        setTotalItems(result.length);
      } catch (error) {
        console.error("Error fetching data from API:", error);
      }
    };

    // Re-fetch data when filter values change
    useEffect(() => {
      sendMessageToServerLog(selectedItem, selectedUser, startDate, endDate);
    }, [selectedItem, selectedUser]);

    useEffect(() => {
      if (messageFromServerLog.length > 0) {
        setRows(messageFromServerLog); // Initially set rows to server data
      }
    }, [messageFromServerLog]);

    // Apply frontend date filtering using startDate and endDate
    const filterByDateRange = (rows, startDate, endDate) => {
      if (startDate && endDate) {
        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime();

        return rows.filter((row) => {
          const timestamp = new Date(row.timestamp).getTime(); // Ensure proper timestamp format
          return timestamp >= start && timestamp <= end;
        });
      }
      return rows;
    };

    // Get data for the current page with date filtering applied
    const getCurrentPageData = () => {
      const filteredRows = filterByDateRange(rows, startDate, endDate); // Use filtered rows for pagination
      const startIndex = (currentPage - 1) * rowsPerPage;
      const endIndex = startIndex + rowsPerPage;

      const rowData = filteredRows.map((appData) => ({
        id: appData.id,
        app_user: appData.app_user,
        application_name: appData.application_name,
        operation: appData.operation,
        graphsignal_library_version: appData.config.find(
          (ver) => ver.key === "graphsignal.library.version"
        ).value,
        os_name: appData.config.find((ver) => ver.key === "os.name").value,
        os_version: appData.config.find((ver) => ver.key === "os.version")
          .value,
        runtime_name: appData.config.find((ver) => ver.key === "runtime.name")
          .value,
        runtime_version: appData.config.find(
          (ver) => ver.key === "runtime.version"
        ).value,
      }));

      return rowData.slice(startIndex, endIndex); // Return sliced data for the current page
    };

    const handlePaginationChange = ({ page, pageSize }) => {
      setCurrentPage(page);
      setRowsPerPage(pageSize);
    };

    const currentRows = getCurrentPageData(); // No setRows inside render

    return (
      <>
        {currentRows.length > 0 ? (
          <div>
            <CustomDataTable headers={headersLog} rows={currentRows} />

            <Pagination
              totalItems={totalItems}
              pageSize={rowsPerPage}
              page={currentPage}
              onChange={handlePaginationChange}
              pageSizes={[5, 10, 20, 30, 40, 50]}
            />
          </div>
        ) : (
          <Tile className="infrastructure-components content-tile">
            <h4>Maintenance Table</h4>
            <NoData />
          </Tile>
        )}
      </>
    );
  }
);

export default MaintenanceTable;


