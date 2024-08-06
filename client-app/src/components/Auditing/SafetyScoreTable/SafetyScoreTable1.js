import React, { useState, useEffect } from "react";
import CustomDataTable from "../../common/CustomDataTable";

const SafetyScoreTable = () => {
  const [websocket, setWebsocket] = useState(null);
  const [messageFromServer, setMessageFromServer] = useState([{ key: "1" }]);
  const [rowData, setRowData] = useState([]); // Define state for formatted data
  const [headers, setHeaders] = useState([]); // Define state for headers
  const [pagination, setPagination] = useState({ offset: 0, first: 10 });
  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState({});

  // Connect to WebSocket server on component mount
  useEffect(() => {
    const apiUrl = process.env.REACT_APP_WEBSOCKET_URL;
    const ws = new WebSocket(apiUrl);
    setWebsocket(ws);

    // Cleanup function to close WebSocket connection on component unmount
    return () => {
      ws.close();
    };
  }, []);

  // Function to send message to WebSocket server
  const sendMessageToServer = () => {
    var start_timestamp = "2024-03-28 10:23:58.072245";
    var end_timestamp = "2024-04-25 12:40:18.875514";
    var q =
      "SELECT COUNT(*) AS total_records, SUM(CASE WHEN flagged THEN 1 ELSE 0 END) AS true_count, SUM(CASE WHEN NOT flagged THEN 1 ELSE 0 END) AS false_count, (SUM(CASE WHEN flagged THEN 1 ELSE 0 END)::NUMERIC / COUNT(*)) * 100 AS true_percentage, (SUM(CASE WHEN NOT flagged THEN 1 ELSE 0 END)::NUMERIC / COUNT(*)) * 100 AS false_percentage FROM auditing WHERE timestamp BETWEEN '" +
      start_timestamp +
      "' AND '" +
      end_timestamp +
      "'";
    if (websocket && websocket.readyState === WebSocket.OPEN) {
      const message = {
        tab: "auditing",
        action: q,
      };
      websocket.send(JSON.stringify(message));
    }
  };

  // Listen for messages from WebSocket server
  useEffect(() => {
    if (websocket) {
      websocket.onmessage = (event) => {
        setMessageFromServer(JSON.parse(event.data));
      };
    }
    sendMessageToServer(messageFromServer);
    console.log("111websocket: ", messageFromServer);
  }, [websocket]);

  useEffect(() => {
    if (messageFromServer.length > 0) {
      console.log("Inside if-messageFromServer: ", messageFromServer);
      const formattedData = messageFromServer;
      setRowData(formattedData[0]);
    }
  }, [messageFromServer]);

  console.log("messageFromServer", messageFromServer);

  useEffect(() => {
    setHeaders([
      { key: "total_records", header: "Total Records" },
      { key: "true_count", header: "True Count" },
      { key: "false_count", header: "False Count" },
      { key: "true_percentage", header: "True Percentage" },
      { key: "false_percentage", header: "False Percentage" },
    ]);
  }, []);

  const formatData = (data) => {
    // Format data here
    const formattedRow = {
      id: "1", // Assuming a single row
      cells: [
        {
          id: "total_records",
          value: { displayType: "number", data: data[0].total_records },
        },
        {
          id: "true_count",
          value: { displayType: "number", data: data[0].true_count },
        },
        {
          id: "false_count",
          value: { displayType: "number", data: data[0].false_count },
        },
        {
          id: "true_percentage",
          value: { displayType: "number", data: data[0].true_percentage },
        },
        {
          id: "false_percentage",
          value: { displayType: "number", data: data[0].false_percentage },
        },
      ],
    };

    return formattedRow;
  };

  // const setHeaderRow = () => {
  //   // Format the data to match the structure expected by CustomDataTable
  //   const formattedData = messageFromServer.map((data, index) => ({
  //     id: index.toString(), // Provide a unique identifier for each row if needed
  //     cells: [
  //       { key: "total_records", value: { displayType: "number", data: data.total_records } },
  //       { key: "true_count", value: { displayType: "number", data: data.true_count } },
  //       { key: "false_count", value: { displayType: "number", data: data.false_count } },
  //       { key: "true_percentage", value: { displayType: "number", data: data.true_percentage } },
  //       { key: "false_percentage", value: { displayType: "number", data: data.false_percentage } },
  //     ],
  //   }));

  //   // Define headers for the table
  //   const headers = [
  //     { key: "total_records", header: "Total Records" },
  //     { key: "true_count", header: "True Count" },
  //     { key: "false_count", header: "False Count" },
  //     { key: "true_percentage", header: "True Percentage" },
  //     { key: "false_percentage", header: "False Percentage" },
  //   ];

  //   const Testing1 = formattedData
  //   // Update state with headers and formatted data
  //   setHeaders(headers);
  //   setFormattedData(Testing1);
  //   console.log('Headers', headers);
  //   console.log('Formatted data', formattedData);
  // };
console.log('safetyscore rowdata :', rowData);
  return (
    <div>
      {/* <table>
          <thead>
            <tr>
              {messageFromServer && Object.keys(messageFromServer[0]).map((key, index) => (
                <th key={index}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {messageFromServer && messageFromServer.map((item, index) => (
              <tr key={index}>
                {Object.values(item).map((value, index) => (
                  <td key={index}>{value}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table> */}
      {console.log("Testing", [rowData])}
      <button onClick={sendMessageToServer}>Load data</button>
      <CustomDataTable
        headers={headers}
        rows={[rowData]}
        loading={false} // Set loading to true if data is being fetched asynchronously
        // Pass any other required props to the CustomDataTable component
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
};

export default SafetyScoreTable;
