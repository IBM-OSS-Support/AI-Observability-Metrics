import React, { Fragment, useEffect, useRef, useState } from "react";
import moment from "moment";

import CustomDataTable from "../common/CustomDataTable";
import PageContainer from "../common/PageContainer";

import { Accordion, AccordionItem } from "@carbon/react";
import DataModal from "./DataModal";
import { useParams } from "react-router-dom";
import { useStoreContext } from "../../store";
import TraceAnalysisTable from "./TraceAnalysisTable";

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
const defaultProcessHeaders = [
  {
    key: "pid",
    header: "PID",
    checked: true,
    required: true,
  },
  {
    key: "started",
    header: "Started",
    checked: true,
    required: true,
  },
  {
    key: "peakMemory",
    header: "Peak Memory",
    checked: true,
    required: true,
  },
  {
    key: "runtime",
    header: "Runtime",
    checked: true,
    required: true,
  },
  {
    key: "runtime_impl",
    header: "Runtime Implementation",
    checked: true,
    required: true,
  },
];
const defaultLibraryHeaders = [
  {
    key: "graphsignal_library_version",
    header: "Graphsignal Library Version",
    checked: true,
    required: true,
  },
  {
    key: "langchain_library_version",
    header: "Langchain Library Version",
    checked: true,
  },
  {
    key: "openai_library_version",
    header: "Openai Library Version",
    checked: true,
  },
];
const defaultNodeHeaders = [
  {
    key: "hostname",
    header: "Hostname",
    checked: true,
    required: true,
  },
  {
    key: "os_name",
    header: "OS",
    checked: true,
    required: true,
  },
  {
    key: "os_version",
    header: "OS Version",
    checked: true,
    required: true,
  },
  {
    key: "runtime_name",
    header: "Runtime",
    checked: true,
    required: true,
  },
  {
    key: "runtime_version",
    header: "Runtime Version",
    checked: true,
    required: true,
  }
];


const TraceAnalysis = () => {
  const { appName } = useParams();

  const [searchText, setSearchText] = useState("");
  const [trace, setTrace] = useState({});
  const [pagination, setPagination] = useState({ offset: 0, first: 10 });
  const [rowsLibraries, setRowsLibraries] = useState([]);
  const [rowsNode, setRowsNode] = useState([]);
  const [modal, setModal] = useState(false);
  const { state } = useStoreContext();

  const [websocket, setWebsocket] = useState(null);
  const [messageFromServerTrace, setMessageFromServerTrace] = useState([]);
  const [headersLibraries, setHeadersLibraries] = useState([]);
  const [headersNode, setHeadersNode] = useState([]);

  const websocketRef = useRef(null);

  // WebSocket start

  // Connect to WebSocket server on component mount
  useEffect(() => {
    const apiUrl = process.env.REACT_APP_WEBSOCKET_URL;
    const ws = new WebSocket(apiUrl);
    websocketRef.current = ws;
    setWebsocket(ws);

    // Call sendMessageToServerTrace on page render
    sendMessageToServerTrace();

    // Cleanup function to close WebSocket connection on component unmount
    return () => {
      ws.close();
    };
  }, []);

  // Function to send message to WebSocket server
  const sendMessageToServerTrace = () => {
    const q = "SELECT * FROM maintenance";

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
        setMessageFromServerTrace(JSON.parse(event.data));
      };
    }
  }, [websocket]);

  // Log messageFromServerTrace to the console
  useEffect(() => {
    console.log("messageFromServerTrace:", messageFromServerTrace);
  }, [messageFromServerTrace]);

  // Process and format data
  useEffect(() => {
    if (messageFromServerTrace) {
      const data = Array.isArray(messageFromServerTrace) ? messageFromServerTrace : [];
      console.log("Trace Data:", data);

      // Find the application data with the matching appName
      const appData = data.find((item) => item.application_name === appName);

      // If the application data is found, log it
      if (appData) {
        console.log("Trace app:", appData);

        // Set headers and rows for LibrariesRow
        setHeadersLibraries(defaultLibraryHeaders);
        setRowsLibraries([{
          graphsignal_library_version: appData.graphsignal_library_version,
          langchain_library_version: appData.langchain_library_version || 'N/A',
          openai_library_version: appData.openai_library_version || 'N/A'
        }]);

        // Set headers and rows for Node
        setHeadersNode(defaultNodeHeaders);
        setRowsNode([{
          hostname: appData.hostname,
          os_name: appData.os_name || 'N/A',
          os_version: appData.os_version || 'N/A',
          runtime_name: appData.runtime_name || 'N/A',
          runtime_version: appData.runtime_version || 'N/A'
        }]);
      } else {
        console.log(`No data found for application_name: ${appName}`);
      }
    }
  }, [appName, messageFromServerTrace]);

  return (
    <>
      <PageContainer
        className="trace-analysis-container"
        header={{
          title: `Application trace : ${appName}`,
          subtitle: "Trace analysis for your application.",
        }}
      >
        <div className="trace-analysis-section">
          <TraceAnalysisTable />
        </div>
        <div className="trace-analysis-section">
          <Accordion align="start">
            <AccordionItem title="Libraries" open>
              <CustomDataTable headers={headersLibraries} rows={rowsLibraries} />
            </AccordionItem>
          </Accordion>
        </div>
        <div className="trace-analysis-section">
          <Accordion align="start">
            <AccordionItem title="Process" open></AccordionItem>
          </Accordion>
        </div>
        <div className="trace-analysis-section">
          <Accordion align="start" size="sm">
            <AccordionItem title="Node" open>
            <CustomDataTable headers={headersNode} rows={rowsNode} />
            </AccordionItem>
          </Accordion>
        </div>
      </PageContainer>
      {MODALS.map(({ component: Component, string: name }) => (
        <Fragment key={name}></Fragment>
      ))}
    </>
  );
};

export default TraceAnalysis;
