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
    const [rows, setRows] = useState([]);
    const [headersLog, setHeadersLog] = useState(defaultHeadersLog);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [totalItems, setTotalItems] = useState(0);

    useImperativeHandle(ref, () => ({
      sendMessageToServerLog,
    }));

    // Function to send the message to the API server (without date filtering)
    const sendMessageToServerLog = async (
      selectedItem,
      selectedUser,
      startDate,
      endDate
    ) => {
      let query = "SELECT * FROM operations";

      console.log("end date inside sendMessageToServerLog", endDate);

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

      console.log("query", query);

      try {
        const apiUrl = process.env.REACT_APP_BACKEND_API_URL;
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: query }),
        });

        const result = await response.json();
        console.log("Result:", result);

        setMessageFromServerLog(result);
        setTotalItems(result.length);
      } catch (error) {
        console.error("Error fetching data from API:", error);
      }
    };

    useEffect(() => {
      setHeadersLog(defaultHeadersLog);
    }, []);

    // Re-fetch data when filter values change
    useEffect(() => {
      sendMessageToServerLog();
    }, [selectedItem, selectedUser]);

    useEffect(() => {
      if (messageFromServerLog.length > 0) {
        setRows(messageFromServerLog);
      }
    }, [messageFromServerLog]);

    // Convert UTC timestamp to IST (for display purposes if necessary)
    const convertUTCToIST = (utcDateString) => {
      const utcDate = new Date(utcDateString);
      const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
      return new Date(utcDate.getTime() + istOffset); // Returns a Date object in IST
    };

    // Apply frontend date filtering using startDate and endDate
    const filterByDateRange = (rows, startDate, endDate) => {
      console.log("Start Date:", startDate, "End Date:", endDate);
      if (startDate && endDate) {
        // Convert startDate and endDate to Date objects if they aren't already
        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime();
        console.log("start and end date", startDate, endDate);

        return rows.filter((row) => {
          const timestamp = convertUTCToIST(row.timestamp).getTime();
          console.log("time in rows", timestamp);
          // Ensure row.timestamp is a valid timestamp
          return timestamp >= start && timestamp <= end;
        });
      }
      return rows;
    };

    // Get data for the current page with date filtering applied
    const getCurrentPageData = (startDate, endDate) => {
      const filteredRows = filterByDateRange(rows, startDate, endDate); // Apply date filtering here
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

      return rowData.slice(startIndex, endIndex);
    };

    const handlePaginationChange = ({ page, pageSize }) => {
      setCurrentPage(page);
      setRowsPerPage(pageSize);
    };

    const currentRows = getCurrentPageData(startDate, endDate);

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
