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
import React, { Fragment, useEffect, useState } from "react";
import moment from 'moment';

import CustomDataTable from "../common/CustomDataTable";
import PageContainer from "../common/PageContainer";

import data from "../../constants/operations.json";
import { Accordion, AccordionItem } from "@carbon/react";
import DataModal from "./DataModal";
import { useParams } from "react-router-dom";

const MODALS = [
  { component: DataModal, string: 'DataModal' },
];


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
    key: "runtimeImpl",
    header: "Runtime Implementation",
    checked: true,
    required: true,
  }
];
const defaultLibraryHeaders = [
  {
    key: "name",
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
    key: "osName",
    header: "OS",
    checked: true,
    required: true,
  },
];


function formatData(span, spans, level, rootStartUs, rootEndUs) {
  // const span = spans.find(span => span.spanId === span.spanId)
  const startUs = Number(span.startUs) / 1000;
  const endUs = Number(span.endUs) / 1000;
  span.level = level;
  span.operation = span.tags?.find(tag => tag.key === 'operation')?.value;
  span.latency = endUs - startUs
  span.startPerc = (startUs - rootStartUs) / (rootEndUs - rootStartUs);
  span.latencyPerc = (span.latency / (rootEndUs - rootStartUs));
  return [span]
  .concat(spans.filter(_span => _span.context.parentSpanId === span.spanId)
    .map(_span => formatData(_span, spans, level + 1, rootStartUs, rootEndUs))
    .flat()
  );
}

function TraceAnalysis() {

  const spanId = "e6c358881ba9";
  const trace = data.spans.find(span => span.spanId === spanId);
  const operations = formatData(trace, data.spans, 0, trace.startUs / 1000, trace.endUs / 1000);
  let { appName } = useParams();

  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({ offset: 0, first: 10 });
  const [rows, setRows] = useState(operations);
  const [modal, setModal] = useState(false);

  useEffect(() => {
    // setRows(operations.filter(d => d.operation.includes(searchText)));
  }, [searchText]);


  function formatRowData(rowData, headers) {
    return rowData.reduce((arr, r, i) => {
      const row = headers.reduce((o, h) => {
        switch (h.key) {
          case 'operation': {
            o[h.key] = {
              displayType: h.key,
              href: `#/traces/?operation=${r.operation}`,
              level: r.level,
              operation: r.operation,
              spanId: r.spanId
            }
            break;
          }
          case 'toggletip': {
            if (r.params && r.params.length) {
              const params = r.params.map(p => `${p.name}=${p.value}`);
              o[h.key] = {
                displayType: h.key,
                data: params[0],
                content: params.length > 1 && <>
                  {params.map((param, i) => <span key={i}>
                      {param}
                    </span>)
                  }
                </>
              }
            } else {
              o[h.key] = {
                displayType: h.key,
                data: '',
              }
            }
            break;
          }
          case 'data': {
            o[h.key] = {
              displayType: h.key,
              items: (r.dataSamples || []).map(d => ({
               id: d.dataName,
               name: d.dataName,
               onClick: () => setModal({
                 name: 'DataModal',
                 props: {
                   name: d.dataName,
                   modalLabel: d.dataName,
                   modalHeading: d.dataName,
                   data: JSON.parse(atob(d.contentBytes)),
                   primaryButtonText: 'Close',
                   onRequestSubmit: closeModal,
                 }
               }),
             }))
            }
            break;
          }
          case 'latency': {
            o[h.key] = `${Math.round(moment.duration(r.latency).asSeconds())}s`;
            break;
          }
          case 'timeline': {
            o[h.key] = {
              displayType: h.key,
              start: r.startPerc,
              end: r.startPerc + r.latencyPerc,
            }
            break;
          }
          case 'version': {
            o[h.key] = `${r.version.major || 0}.${r.version.minor || 0}.${r.version.patch || 0}`;
            break;
          }
          case 'runtime': {
            o[h.key] = `${r.runtime} ${r.runtimeVersion.major || 0}.${r.runtimeVersion.minor || 0}.${r.runtimeVersion.patch || 0}`;
            break;
          }
          case 'started': {
            o[h.key] = moment(Number(r.startMs)).format('YYYY-MM-DD HH:mm:ss');
            break;
          }
          case 'peakMemory': {
            o[h.key] = `${Math.round(r.vmSize / Math.pow(1000, 2))} MB`;
            break;
          }
          default: 
            o[h.key] = r[h.key] || r.name || ''
        }
        return o
      }, {id: `${r.level}_row_${r.spanId}_${i}`})
      return arr.concat([row]);
    }, []);
  }

  function closeModal() {
    setModal(prev => ({
      ...prev,
      name: ''
    }));
  
    setTimeout(() =>
      setModal({
        name: '',
        props: {}
      })
    , 300);
  };

  return (
    <>
      <PageContainer
        className="trace-analysis-container"
        header={{
          title: `Application Trace : ${appName}`,
          subtitle: "Trace analysis for your application.",
        }}
      >
        <div className="trace-analysis-section">
          <CustomDataTable
            headers={defaultHeaders}
            rows={formatRowData(rows, defaultHeaders)}
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
                rows={formatRowData(trace.libraries, defaultLibraryHeaders)}
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
                rows={formatRowData([trace.processUsage], defaultProcessHeaders)}
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
                rows={formatRowData([trace.nodeUsage], defaultNodeHeaders)}
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
      {MODALS.map(({ component: Component, string: name }) =>
        <Fragment key={name}>
          <Component
            open={modal.name === name}
            close={closeModal}
            {...modal.props}
          />
        </Fragment>
      )}
    </>
  );
}

export default TraceAnalysis;
