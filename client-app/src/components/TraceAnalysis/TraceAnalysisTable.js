import React, { Fragment, useEffect, useRef, useState } from "react";
import moment from "moment";

import CustomDataTable from "../common/CustomDataTable";
import PageContainer from "../common/PageContainer";

import { Accordion, AccordionItem } from "@carbon/react";
import DataModal from "./DataModal";
import { useParams } from "react-router-dom";
import { useStoreContext } from "../../store";

const MODALS = [{ component: DataModal, string: "DataModal" }];

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

  const [searchText, setSearchText] = useState("");
  const [trace, setTrace] = useState({});
  const [rows, setRows] = useState([]);
  const [modal, setModal] = useState(false);
  const { state } = useStoreContext();

  const [pagination, setPagination] = useState({ offset: 0, first: 10 });

  const [websocket, setWebsocket] = useState(null);
  const [messageFromServerTraceTable, setMessageFromServerTraceTable] = useState([]);
  const [headers, setHeaders] = useState([]);

  const websocketRef = useRef(null);

  // WebSocket start

  // Connect to WebSocket server on component mount
  useEffect(() => {
    const apiUrl = process.env.REACT_APP_WEBSOCKET_URL;
    const ws = new WebSocket(apiUrl);
    websocketRef.current = ws;
    setWebsocket(ws);

    // Call sendMessageToServerTrace on page render
    sendMessageToServerTraceTable();

    // Cleanup function to close WebSocket connection on component unmount
    return () => {
      ws.close();
    };
  }, []);

  // Function to send message to WebSocket server
  const sendMessageToServerTraceTable = () => {
    const q = "SELECT * FROM operations";

    const ws = websocketRef.current;

    if (ws) {
      if (ws.readyState === WebSocket.OPEN) {
        const message = {
          tab: "auditing",
          action: q,
        };
        ws.send(JSON.stringify(message));
      } else {
        ws.onopen = () => {
          const message = {
            tab: "auditing",
            action: q,
          };
          ws.send(JSON.stringify(message));
        };
      }
    }
  };

  // Listen for messages from WebSocket server
  useEffect(() => {
    if (websocket) {
      websocket.onmessage = (event) => {
        setMessageFromServerTraceTable(JSON.parse(event.data));
      };
    }
  }, [websocket]);

  // Log messageFromServerTrace to the console
  useEffect(() => {
    console.log("messageFromServerTraceTable:", messageFromServerTraceTable);
  }, [messageFromServerTraceTable]);

  // Process and format data
  useEffect(() => {
    if (messageFromServerTraceTable) {
      const data = Array.isArray(messageFromServerTraceTable)
        ? messageFromServerTraceTable
        : [];
      console.log("Trace Table Data:", data);

      // Find all application data with the matching appName
    const appDataArray = data.filter((item) => item.application_name === appName);
      // If the application data is found, log it
      if (appDataArray.length > 0) {
        console.log("Trace app:", appDataArray);



        // Map over the array to format each row
      let formattedRows = appDataArray.map((appData) => ({
        operation: (
            <a href={`#/traces/?operation=${appData.operation}`}>
              {appData.operation}
            </a>
          ),
        id: appData.id
        // Uncomment and add more keys as needed
        // latency: appData.latency,
        // timeline: appData.timeline,
        // toggletip: appData.parameters,
        // data: appData.data,
      }));
        setHeaders(defaultHeaders);
        setRows(formattedRows);
        console.log("Formatted Rows:", formattedRows); // Log formatted rows
      } else {
        console.log(`No data found for application_name: ${appName}`);
      }

      
    }
  }, [appName, messageFromServerTraceTable]);

  console.log('Trace Table rows' , rows);

  // Pagination logic
  const handlePageChange = (page) => {

    console.log('page', page);
    if (messageFromServerTraceTable) {
        const data = Array.isArray(messageFromServerTraceTable)
          ? messageFromServerTraceTable
          : [];
        console.log("Trace Table Data:", data);
  
        // Find all application data with the matching appName
      const appDataArray = data.filter((item) => item.application_name === appName);
        // If the application data is found, log it
        if (appDataArray.length > 0) {
          console.log("Trace app:", appDataArray);
  
          // Slice the first 10 items
        let slicedData = appDataArray.slice(page, page+10);
  
  
          // Map over the array to format each row
        let formattedRows = slicedData.map((appData) => ({
          operation: (
              <a href={`#/traces/?operation=${appData.operation}`}>
                {appData.operation}
              </a>
            ),
          id: appData.id
          // Uncomment and add more keys as needed
          // latency: appData.latency,
          // timeline: appData.timeline,
          // toggletip: appData.parameters,
          // data: appData.data,
        }));
          setHeaders(defaultHeaders);
          setRows(formattedRows);
          console.log("Formatted Rows:", formattedRows); // Log formatted rows
        } else {
          console.log(`No data found for application_name: ${appName}`);
        }
  
        
      }
  };

  const handleItemsPerPageChange = (pageSize) => {
    console.log('pageSize', pageSize);
    if (messageFromServerTraceTable) {
        const data = Array.isArray(messageFromServerTraceTable)
          ? messageFromServerTraceTable
          : [];
        console.log("Trace Table Data:", data);
  
        // Find all application data with the matching appName
      const appDataArray = data.filter((item) => item.application_name === appName);
        // If the application data is found, log it
        if (appDataArray.length > 0) {
          console.log("Trace app:", appDataArray);
  
          // Slice the first 10 items
        let slicedData = appDataArray.slice(pageSize, pageSize+10);
  
  
          // Map over the array to format each row
        let formattedRows = slicedData.map((appData) => ({
          operation: (
              <a href={`#/traces/?operation=${appData.operation}`}>
                {appData.operation}
              </a>
            ),
          id: appData.id
          // Uncomment and add more keys as needed
          // latency: appData.latency,
          // timeline: appData.timeline,
          // toggletip: appData.parameters,
          // data: appData.data,
        }));
          setHeaders(defaultHeaders);
          setRows(formattedRows);
          console.log("Formatted Rows:", formattedRows); // Log formatted rows
        } else {
          console.log(`No data found for application_name: ${appName}`);
        }
  
        
      }
  };

  const startIndex = (pagination.page - 1) * pagination.pageSize;
  const endIndex = startIndex + pagination.pageSize;
  const paginatedRows = rows.slice(startIndex, endIndex);


  
  return (
    <CustomDataTable
      headers={defaultHeaders}
      rows={rows}
      loading={state.status === "loading"}
      pagination={{
        totalItems: rows.length,
              setPagination,
              ...pagination,
        onPageChange: handlePageChange,
        onItemsPerPageChange: handleItemsPerPageChange,
      }}
    />
  );
};

export default TraceAnalysisTable;
