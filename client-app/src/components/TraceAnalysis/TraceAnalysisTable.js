import React, { Fragment, useEffect, useState } from "react";
import CustomDataTable from "../common/CustomDataTable";
import { useParams } from "react-router-dom";
import { useStoreContext } from "../../store";
import { Pagination, Slider } from "@carbon/react";
import DataModal from "./DataModal";
import moment from "moment";

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

function formatOperationHierarchy(data) {
  // Step 1: Sort the data by the 'start_us' field in ascending order
  const sortedData = data.sort(
    (a, b) => Number(a.start_us) - Number(b.start_us)
  );

  // Step 2: Create a balanced hierarchy
  const hierarchy = [];
  let currentLevel = 1;

  for (let i = 0; i < sortedData.length; i++) {
    const currentOperation = sortedData[i];

    // Default dataSamples array with 'inputs' and 'outputs'
    let dataSamples = [
      { data_name: "inputs", content_bytes: "eyJpbnB1dCI6ICJObyBkYXRhIn0=" },
      { data_name: "outputs", content_bytes: "eyJvdXRwdXQiOiAiTm8gZGF0YSJ9" },
    ];

    // If the operation name contains 'chat_models', add 'generations'
    if (
      currentOperation.operation &&
      /\bcompletions\b/.test(currentOperation.operation)
    ) {
      dataSamples.push({
        data_name: "completions",
        content_bytes: "eyJvdXRwdXQiOiAiTm8gZGF0YSJ9",
      });
    } else if (
      currentOperation.operation &&
      /\bchat_models\b/.test(currentOperation.operation)
    ) {
      dataSamples.push({
        data_name: "generations",
        content_bytes: "eyJvdXRwdXQiOiAiTm8gZGF0YSJ9",
      });
    } else if (
      currentOperation.operation &&
      /\brunnable\b/.test(currentOperation.operation)
    ) {
      dataSamples.push({
        data_name: "runnable",
        content_bytes: "eyJvdXRwdXQiOiAiTm8gZGF0YSJ9",
      });
    }

    // Create a new entry for the current operation
    const operationWithLevel = {
      ...currentOperation,
      level: currentLevel,
      data_samples: dataSamples,
    };

    // Push to hierarchy
    hierarchy.push(operationWithLevel);

    // Increment level if it's the last operation at this timestamp
    if (
      i + 1 < sortedData.length &&
      sortedData[i + 1].start_us !== currentOperation.start_us
    ) {
      currentLevel++; // Move to next level for the next set of operations
    }

    // Reset level to 1 if it exceeds 5
    if (currentLevel > 5) {
      currentLevel = 1; // Reset to level 1
    }
  }

  // Step 3: Return the formatted data with hierarchy levels
  return hierarchy;
}

function formatData(formattedData, rootStartUs, rootEndUs) {
  if (
    !formattedData ||
    !Array.isArray(formattedData) ||
    formattedData.length === 0
  ) {
    return [];
  }

  return formattedData.map((span) => {
    // Convert start_us and end_us to milliseconds
    const startUs = Number(span.start_us) / 1000;
    const endUs = Number(span.end_us) / 1000;

    // Calculate properties
    span.operation = span.tags?.find((tag) => tag.key === "operation")?.value; // Extract operation name
    span.latency = endUs - startUs; // Calculate latency
    // Calculate start percentage, ensuring it's non-negative
    const calculatedStartPerc =
      (startUs - rootStartUs) / (rootEndUs - rootStartUs);
    span.start_perc = Math.max(0, calculatedStartPerc); // Ensure non-negative

    span.latency_perc = (span.latency / (rootEndUs - rootStartUs)) * 1000; // Calculate latency percentage

    // Handle child spans if needed (assuming they would be organized in a certain way)
    // Since formattedData does not contain parent-child relationships directly, you can
    // implement a strategy to find child spans if necessary.

    return span; // Return the modified span
  });
}

const TraceAnalysisTable = () => {
  const { appName } = useParams();

  if (appName) {
    // Decode the URI components to handle special characters
    const decodedAppDetails = decodeURIComponent(appName);
    // Split the params to get applicationName and appId
    var [applicationName, appId] = decodedAppDetails
      .split("&")
      .map((part) => part.trim());
  }

  const [rows, setRows] = useState([]);
  const { state } = useStoreContext();
  const [messageFromServerTraceTable, setMessageFromServerTraceTable] =
    useState([]);
  const [headers, setHeaders] = useState(defaultHeaders);
  const [currentPage, setCurrentPage] = useState(1); // Current page state
  const [rowsPerPage, setRowsPerPage] = useState(5); // Rows per page
  const [totalItems, setTotalItems] = useState(0); // Total number of items

  const [modal, setModal] = useState(false);

  // API call replacing WebSocket
  const fetchTraceData = async () => {
    try {
      const query = `SELECT * FROM operations WHERE app_id = '${appId}'`;
      const apiUrl = process.env.REACT_APP_BACKEND_API_URL;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch trace data");
      }
      const data = await response.json();

      // Format the data
      const formattedData = formatOperationHierarchy(data);

      const rootStartUs = Math.min(
        ...formattedData.map((span) => Number(span.start_us))
      );
      const rootEndUs = Math.max(
        ...formattedData.map((span) => Number(span.end_us))
      );

      const processedData = formatData(formattedData, rootStartUs, rootEndUs);

      setMessageFromServerTraceTable(processedData);
      setTotalItems(processedData.length);
    } catch (error) {
      console.error("Error fetching trace data:", error);
    }
  };

  useEffect(() => {
    fetchTraceData();
  }, [applicationName]);

  // Log messageFromServerTraceTable to the console
  useEffect(() => {}, [messageFromServerTraceTable]);

  // Process and format data
  useEffect(() => {
    if (messageFromServerTraceTable) {
      const data = Array.isArray(messageFromServerTraceTable)
        ? messageFromServerTraceTable
        : [];

      // If the application data is found, log it
      if (data.length > 0) {
        setHeaders(defaultHeaders);
        setRows(data);
      }
    }
  }, [applicationName, messageFromServerTraceTable]);

  // Calculate min and max for the slider
  const calculateSliderRange = () => {
    let min = Infinity;
    let max = -Infinity;

    rows.forEach((appData) => {
      const start = appData.start_ns / 10000000000;
      const end =
        appData.start_ns / 10000000000 + appData.latency_ns / 10000000000;

      if (start < min) min = start;
      if (end > max) max = end;
    });

    return { min, max };
  };

  function formatRowData(rowData = [], headers) {
    return rowData.reduce((arr, r, i) => {
      const row = headers.reduce(
        (o, h) => {
          switch (h.key) {
            case "operation": {
              o[h.key] = {
                displayType: h.key,
                href: `#/traces/?operation=${r.operation}`,
                level: r.level,
                operation: r.operation,
                spanId: r.span_id,
              };
              break;
            }
            case "toggletip": {
              if (r.tags) {
                const params = r.tags.find((tag) => tag.key === "model");
                o[h.key] = {
                  displayType: h.key,
                  data: params ? `model=${params.value}` : "",
                };
              } else {
                o[h.key] = {
                  displayType: h.key,
                  data: "",
                };
              }
              break;
            }
            case "data": {
              if (r.payloads && r.payloads.length > 0) {
                o[h.key] = {
                  displayType: h.key,
                  items: r.payloads.map((d) => ({
                    id: d.name,
                    name: d.name,
                    onClick: () =>
                      setModal({
                        name: "DataModal",
                        props: {
                          name: d.name,
                          modalLabel: d.name,
                          modalHeading: d.name,
                          data: JSON.parse(atob(d.content_base64)),
                          primaryButtonText: "Close",
                          onRequestSubmit: closeModal,
                        },
                      }),
                  })),
                };
              } else {
                o[h.key] = {
                  displayType: h.key,
                  items: (r.data_samples || []).map((d) => ({
                    id: d.data_name,
                    name: d.data_name,
                    onClick: () =>
                      setModal({
                        name: "DataModal",
                        props: {
                          name: d.data_name,
                          modalLabel: d.data_name,
                          modalHeading: d.data_name,
                          data: JSON.parse(atob(d.content_bytes)),
                          primaryButtonText: "Close",
                          onRequestSubmit: closeModal,
                        },
                      }),
                  })),
                };
              }
              break;
            }

            case "latency": {
              o[h.key] = `${moment
                .duration(r.latency)
                .asSeconds()
                .toFixed(1)} s`;
              break;
            }
            case "timeline": {
              o[h.key] = {
                displayType: h.key,
                start: r.start_perc,
                end: r.start_perc + r.latency_perc,
              };
              break;
            }

            default:
              o[h.key] = r[h.key] || r.name || "";
          }
          return o;
        },
        { id: `row_${i}` }
      );
      return arr.concat([row]);
    }, []);
  }

  function closeModal() {
    setModal((prev) => ({
      ...prev,
      name: "",
    }));

    setTimeout(
      () =>
        setModal({
          name: "",
          props: {},
        }),
      300
    );
  }

  // Get data for the current page
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const { min, max } = calculateSliderRange();

    let slicedRows = rows.slice(startIndex, endIndex);

    let formattedRows = formatRowData(slicedRows, defaultHeaders);

    return formattedRows;
  };

  const handlePaginationChange = ({ page, pageSize }) => {
    setCurrentPage(page);
    setRowsPerPage(pageSize);
  };

  const currentRows = getCurrentPageData();

  return (
    <div>
      <CustomDataTable headers={defaultHeaders} rows={currentRows} />
      {/* Add pagination component */}
      <Pagination
        totalItems={totalItems}
        pageSize={rowsPerPage}
        page={currentPage}
        onChange={handlePaginationChange} // Use a single handler for both page and pageSize
        pageSizes={[5, 10, 20, 30, 40, 50]} // Options for rows per page
      />
      {MODALS.map(({ component: Component, string: name }) => (
        <Fragment key={name}>
          <Component
            open={modal.name === name}
            close={closeModal}
            {...modal.props}
          />
        </Fragment>
      ))}
    </div>
  );
};

export default TraceAnalysisTable;
