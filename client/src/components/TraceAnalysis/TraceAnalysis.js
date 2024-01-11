/* ******************************************************************************
 * IBM Confidential
 *
 * OCO Source Materials
 *
 *  Copyright IBM Corp. 2024  All Rights Reserved.
 *
 * The source code for this program is not published or otherwise divested
 * of its trade secrets, irrespective of what has been deposited with
 * the U.S. Copyright Office.
 ****************************************************************************** */
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import CustomDataTable from "../common/CustomDataTable";
import { Download } from "@carbon/icons-react";
import PageContainer from "../common/PageContainer";

import data from "../../constants/operations.json";

function TraceAnalysis() {
  const navigate = useNavigate();
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
      key: "parameters",
      header: "Parameters",
      checked: true,
    },
    {
      key: "data",
      header: "Data",
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
      key: "runtimeImplementation",
      header: "Runtime Implementation",
      checked: true,
      required: true,
    },
    {
      key: "graphSignalVersion",
      header: "Graph Signal Version",
      checked: true,
      required: true,
    },
  ];
  const defaultLibraryHeaders = [
    {
      key: "library",
      header: "Library",
      checked: true,
      required: true,
    },
    {
      key: "version",
      header: "Version",
      checked: true,
      required: true,
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
      key: "platform",
      header: "Platform",
      checked: true,
      required: true,
    },
    {
      key: "machine",
      header: "Machine",
      checked: true,
      required: true,
    },
    {
      key: "os",
      header: "OS",
      checked: true,
      required: true,
    },
  ];

  const [headers, setHeaders] = useState(
    defaultHeaders.map((h) => Object.assign({}, h))
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState([]);
  const [initialSelectedFilters, setInitialSelectedFilters] = useState({
    source: ["Web client"],
  });
  const [selectedFilters, setSelectedFilters] = useState({});
  const [pagination, setPagination] = useState({ offset: 0, first: 10 });
  const [modal, setModal] = useState(false);
  const [startDate, setStartDate] = useState(undefined);
  const [endDate, setEndDate] = useState(undefined);
  const [rows, setRows] = useState(data);

  useEffect(() => {
    setRows(data.filter(d => d.operation.includes(searchText)));
  }, [searchText])

  function formatRowData(rowData, totalLatency, level) {
    return rowData.reduce((arr, r, i) => {
      const {traces, ...rest} = r;
      const row = defaultHeaders.reduce((o, h) => {
        o[h.key] = {
          displayType: h.key,
          level,
          total: totalLatency || rest.latency,
          ...rest
        }
        return o
      }, {})
      return arr.concat([row]).concat(formatRowData(traces || [], totalLatency || rest.latency, level + 1))
    }, []);
  }
  return (
    <PageContainer
      className="trace-analysis-container"
      header={{
        title: "Trace",
        subtitle: "Trace analysis for your data.",
      }}
    >
      <div className="trace-analysis-section">
        <CustomDataTable
          headers={headers}
          rows={formatRowData(rows, 0, 0)}
          loading={false}
          search={{
            searchText: searchText,
            persistent: true,
            placeholder: "Search for operations",
            onChange: setSearchText,
          }}
          filter={{
            id: "query-history-filter",
            buttonOverrides: { align: "bottom" },
            filters,
            selectedFilters,
            startDate,
            setStartDate,
            endDate,
            setEndDate,
            hasDateRange: true,
            dateLabel: "Created",
            setSelectedFilters: (newSelectedFilters) => {
              setSelectedFilters(newSelectedFilters);
              setPagination((prev) => ({ ...prev, offset: 0 }));

              if (!Object.keys(newSelectedFilters).length) {
                setInitialSelectedFilters({});
                return navigate("/query-history");
              }

              Object.entries(newSelectedFilters).forEach(([key, values]) =>
                setSearchParams((prev) => {
                  const newSearchParams = [];

                  prev.forEach((v, k) => {
                    if (k !== key) {
                      newSearchParams.push([k, v]);
                    }
                  });

                  values.forEach((v) => newSearchParams.push([key, v]));

                  return newSearchParams;
                })
              );
            },
          }}
          columnCustomization={{
            id: "query-history-list-columns",
            buttonOverrides: { align: "bottom" },
            columns: headers,
            setColumns: setHeaders,
            reset: () =>
              setHeaders(defaultHeaders.map((h) => Object.assign({}, h))),
          }}
          refresh={{
            label: "Refresh",
            align: "bottom-right",
            onClick: () => { },
          }}
          primaryButton={{
            kind: "primary",
            renderIcon: Download,
            children: "Export to CSV",
            onClick: () => { },
            disabled: true,
          }}
          pagination={{
            totalItems: rows.length,
            setPagination,
            ...pagination,
          }}
          emptyState={
            !rows.length && {
              type: false ? "NotFound" : "NoData",
              title: "No queries yet.",
              noDataSubtitle:
                "Any queries run on your existing engines may be monitored here after submission.",
            }
          }
          sortRowHandler={() => { }}
          tableHeaderClickHandler={() => { }}
        />
      </div>
      <div className="trace-analysis-section">
        <div className="title">Libraries</div>
        <CustomDataTable
          headers={defaultLibraryHeaders}
          rows={rows[0].libraries}
          loading={false}
          emptyState={
            !rows.length && {
              type: false ? "NotFound" : "NoData",
              title: "No queries yet.",
              noDataSubtitle:
                "Any queries run on your existing engines may be monitored here after submission.",
            }
          }
          sortRowHandler={() => { }}
          tableHeaderClickHandler={() => { }}
        />
      </div>
      <div className="trace-analysis-section">
        <div className="title">Process</div>
        <CustomDataTable
          headers={defaultProcessHeaders}
          rows={rows[0].process}
          loading={false}
          emptyState={
            !rows.length && {
              type: false ? "NotFound" : "NoData",
              title: "No queries yet.",
              noDataSubtitle:
                "Any queries run on your existing engines may be monitored here after submission.",
            }
          }
          sortRowHandler={() => { }}
          tableHeaderClickHandler={() => { }}
        />
      </div>
      <div className="trace-analysis-section">
        <div className="title">Node</div>
        <CustomDataTable
          headers={defaultNodeHeaders}
          rows={rows[0].node}
          loading={false}
          emptyState={
            !rows.length && {
              type: false ? "NotFound" : "NoData",
              title: "No queries yet.",
              noDataSubtitle:
                "Any queries run on your existing engines may be monitored here after submission.",
            }
          }
          sortRowHandler={() => { }}
          tableHeaderClickHandler={() => { }}
        />
      </div>
    </PageContainer>
  );
}

export default TraceAnalysis;
