import React, { useState, useEffect, useImperativeHandle, forwardRef, useRef } from "react";
import CustomDataTable from "../../common/CustomDataTable";

const SafetyScoreTable = forwardRef((props, ref) => {
  const websocketRef = useRef(null);
  const [messageFromServer, setMessageFromServer] = useState([{ key: "1" }]);
  const [rowData, setRowData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [pagination, setPagination] = useState({ offset: 0, first: 10 });
  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState({});

  useImperativeHandle(ref, () => ({
    sendMessageToServer,
  }));

  useEffect(() => {
    const apiUrl = process.env.REACT_APP_WEBSOCKET_URL;
    const ws = new WebSocket(apiUrl);
    websocketRef.current = ws;

    console.log("Inside Table ws:", ws);

    ws.onmessage = (event) => {
      setMessageFromServer(JSON.parse(event.data));
    };

    // Cleanup function to close WebSocket connection on component unmount
    return () => {
      ws.close();
    };
  }, []);

  const sendMessageToServer = () => {
    const start_timestamp = "2024-03-28 10:23:58.072245";
    const end_timestamp = "2024-04-25 12:40:18.875514";
    const q = `
      SELECT COUNT(*) AS total_records,
             SUM(CASE WHEN flagged THEN 1 ELSE 0 END) AS true_count,
             SUM(CASE WHEN NOT flagged THEN 1 ELSE 0 END) AS false_count,
             (SUM(CASE WHEN flagged THEN 1 ELSE 0 END)::NUMERIC / COUNT(*)) * 100 AS true_percentage,
             (SUM(CASE WHEN NOT flagged THEN 1 ELSE 0 END)::NUMERIC / COUNT(*)) * 100 AS false_percentage
      FROM auditing
      WHERE timestamp BETWEEN '${start_timestamp}' AND '${end_timestamp}'`;

    console.log("Inside Table sendMessageToServer");

    const ws = websocketRef.current;
    if (ws) {
      ws.onopen = () => {
        if (ws.readyState === WebSocket.OPEN) {
          const message = {
            tab: "auditing",
            action: q,
          };
          ws.send(JSON.stringify(message));
        }
      };
    }
  };

  useEffect(() => {
    if (messageFromServer.length > 0) {
      const formattedData = messageFromServer;
      setRowData(formattedData[0]);
    }
  }, [messageFromServer]);

  useEffect(() => {
    setHeaders([
      { key: "total_records", header: "Total Records" },
      { key: "true_count", header: "True Count" },
      { key: "false_count", header: "False Count" },
      { key: "true_percentage", header: "True Percentage" },
      { key: "false_percentage", header: "False Percentage" },
    ]);
  }, []);

  return (
    <div>
      <CustomDataTable
        headers={headers}
        rows={[rowData]}
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
});

export default SafetyScoreTable;
