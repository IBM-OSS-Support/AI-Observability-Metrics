import React, { Fragment, useEffect, useState } from "react";
import CustomDataTable from "../common/CustomDataTable";
import PageContainer from "../common/PageContainer";
import { Accordion, AccordionItem } from "@carbon/react";
import DataModal from "./DataModal";
import { useParams } from "react-router-dom";
import { useStoreContext } from "../../store";
import TraceAnalysisTable from "./TraceAnalysisTable";

const MODALS = [{ component: DataModal, string: "DataModal" }];

const defaultLibraryHeaders = [
  { key: "graphsignal_library_version", header: "Graphsignal Library Version", checked: true, required: true },
  { key: "langchain_library_version", header: "Langchain Library Version", checked: true },
  { key: "openai_library_version", header: "Openai Library Version", checked: true },
];

const defaultNodeHeaders = [
  { key: "hostname", header: "Hostname", checked: true, required: true },
  { key: "os_name", header: "OS", checked: true, required: true },
  { key: "os_version", header: "OS Version", checked: true, required: true },
  { key: "runtime_name", header: "Runtime", checked: true, required: true },
  { key: "runtime_version", header: "Runtime Version", checked: true, required: true },
];

const TraceAnalysis = () => {
  const { appName } = useParams();
  const [rowsLibraries, setRowsLibraries] = useState([]);
  const [rowsNode, setRowsNode] = useState([]);
  const [headersLibraries, setHeadersLibraries] = useState([]);
  const [headersNode, setHeadersNode] = useState([]);
  const { state } = useStoreContext();

  // API Call to fetch trace data
  const fetchTraceData = async () => {
    const apiUrl = process.env.REACT_APP_BACKEND_API_URL; // Replace with actual API endpoint

    // SQL query to fetch the required data
    const q = `
      SELECT * FROM maintenance`;

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: q }), // Sending the query in the request body
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log('data in trace analysis', data);
      return data;
    } catch (error) {
      console.error("Error fetching trace data:", error);
      return null;
    }
  };

  // Fetch trace data on mount
  useEffect(() => {
    fetchTraceData().then((data) => {
      if (data) {
        const appData = data.find((item) => item.application_name === appName);
        if (appData) {
          // Set headers and rows for Libraries section
          setHeadersLibraries(defaultLibraryHeaders);
          setRowsLibraries([
            {
              graphsignal_library_version: appData.graphsignal_library_version,
              langchain_library_version: appData.langchain_library_version || "N/A",
              openai_library_version: appData.openai_library_version || "N/A",
            },
          ]);

          // Set headers and rows for Node section
          setHeadersNode(defaultNodeHeaders);
          setRowsNode([
            {
              hostname: appData.hostname,
              os_name: appData.os_name || "N/A",
              os_version: appData.os_version || "N/A",
              runtime_name: appData.runtime_name || "N/A",
              runtime_version: appData.runtime_version || "N/A",
            },
          ]);
        } else {
          console.log(`No data found for application_name: ${appName}`);
        }
      }
    });
  }, [appName]);

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
