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

import CustomDataTable from "../common/CustomDataTable";
import PageContainer from "../common/PageContainer";

import data from "../../constants/operations.json";
import { Accordion, AccordionItem } from "@carbon/react";

function TraceAnalysis() {
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

  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({ offset: 0, first: 10 });
  const [rows, setRows] = useState([data]);

  useEffect(() => {
    setRows([data].filter(d => d.operation.includes(searchText)));
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
      }, {id: `${level}_row_${rest.id}`})
      return arr.concat([row]).concat(formatRowData(traces || [], totalLatency || rest.latency, level + 1))
    }, []);
  }
  return (
    <PageContainer
      className="trace-analysis-container"
      header={{
        title: `Trace : ${data.trace}`,
        subtitle: "Trace analysis for your data.",
      }}
    >
      <div className="trace-analysis-section">
        <CustomDataTable
          headers={defaultHeaders}
          rows={formatRowData(rows, 0, 0)}
          loading={false}
          // useStaticWidth={true}
          search={{
            searchText: searchText,
            persistent: true,
            placeholder: "Search for operations",
            onChange: setSearchText,
          }}
          refresh={{
            label: "Refresh",
            align: "bottom-right",
            onClick: () => { },
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
        <Accordion align="start">
          <AccordionItem title="Libraries" open>
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
          </AccordionItem>
        </Accordion>
      </div>
      <div className="trace-analysis-section">
        <Accordion align="start">
          <AccordionItem title="Process" open>
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
          </AccordionItem>
        </Accordion>
      </div>
      <div className="trace-analysis-section">
        <Accordion align="start" size="sm">
          <AccordionItem title="Node" open>
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
          </AccordionItem>
        </Accordion>
      </div>
    </PageContainer>
  );
}

export default TraceAnalysis;
