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
import React, { Fragment, useContext, useEffect, useState } from "react";
import moment from 'moment';

import CustomDataTable from "../common/CustomDataTable";
import PageContainer from "../common/PageContainer";

import { Accordion, AccordionItem } from "@carbon/react";
import DataModal from "./DataModal";
import { useParams } from "react-router-dom";
import { AppContext } from "../../appContext";

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
    key: "runtime_impl",
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
    key: "os_name",
    header: "OS",
    checked: true,
    required: true,
  },
];


function formatData(span, spans, level, rootStartUs, rootEndUs) {
  // const span = spans.find(span => span.spanId === span.spanId)
  const startUs = Number(span.start_us) / 1000;
  const endUs = Number(span.end_us) / 1000;
  span.level = level;
  span.operation = span.tags?.find(tag => tag.key === 'operation')?.value;
  span.latency = endUs - startUs
  span.start_perc = (startUs - rootStartUs) / (rootEndUs - rootStartUs);
  span.latency_perc = (span.latency / (rootEndUs - rootStartUs));
  return [span]
    .concat(spans.filter(_span => _span.context.parent_span_id === span.span_id)
      .map(_span => formatData(_span, spans, level + 1, rootStartUs, rootEndUs))
      .flat()
    );
}

function TraceAnalysis() {

  const { appName } = useParams();

  const [searchText, setSearchText] = useState("");
  const [trace, setTrace] = useState({});
  const [pagination, setPagination] = useState({ offset: 0, first: 10 });
  const [rows, setRows] = useState([]);
  const [modal, setModal] = useState(false);
  const {status, data} = useContext(AppContext);

  useEffect(() => {
    if (status === 'success'){
      const app = data.find(data => data['application-name'] === appName);
      const rootSpanId = app.spans?.[0]?.context?.root_span_id
      const root = app.spans.find(span => span.span_id === rootSpanId);
      const operations = formatData(root, app.spans, 0, root.start_us / 1000, root.end_us / 1000);
      if (!!searchText.trim()) {
        setRows(operations.filter(op => op.operation.includes(searchText)));
      } else
        setRows(operations);
      setTrace(root);
    } else {
      setRows([]);
      setTrace({});
    }
  }, [appName, status, data, searchText])

  function formatRowData(rowData = [], headers) {
    return rowData.reduce((arr, r, i) => {
      const row = headers.reduce((o, h) => {
        switch (h.key) {
          case 'operation': {
            o[h.key] = {
              displayType: h.key,
              href: `#/traces/?operation=${r.operation}`,
              level: r.level,
              operation: r.operation,
              spanId: r.span_id
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
              items: (r.data_samples || []).map(d => ({
               id: d.data_name,
               name: d.data_name,
               onClick: () => setModal({
                 name: 'DataModal',
                 props: {
                   name: d.data_name,
                   modalLabel: d.data_name,
                   modalHeading: d.data_name,
                   data: JSON.parse(atob(d.content_bytes)),
                   primaryButtonText: 'Close',
                   onRequestSubmit: closeModal,
                 }
               }),
             }))
            }
            break;
          }
          case 'latency': {
            o[h.key] = `${moment.duration(r.latency).asSeconds().toFixed(1)}s`;
            break;
          }
          case 'timeline': {
            o[h.key] = {
              displayType: h.key,
              start: r.start_perc,
              end: r.start_perc + r.latency_perc,
            }
            break;
          }
          case 'version': {
            o[h.key] = `${r.version.major || 0}.${r.version.minor || 0}.${r.version.patch || 0}`;
            break;
          }
          case 'runtime': {
            o[h.key] = `${r.runtime} ${r.runtime_version.major || 0}.${r.runtime_version.minor || 0}.${r.runtime_version.patch || 0}`;
            break;
          }
          case 'started': {
            o[h.key] = moment(Number(r.start_ms)).format('YYYY-MM-DD HH:mm:ss');
            break;
          }
          case 'peakMemory': {
            o[h.key] = `${Math.round(r.max_rss / Math.pow(1000, 2))} MB`;
            break;
          }
          default: 
            o[h.key] = r[h.key] || r.name || ''
        }
        return o
      }, {id: `row_${i}`})
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
          title: `Application trace : ${appName}`,
          subtitle: "Trace analysis for your application.",
        }}
      >
        <div className="trace-analysis-section">
          <CustomDataTable
            headers={defaultHeaders}
            rows={formatRowData(rows, defaultHeaders)}
            loading={status === 'loading'}
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
                loading={status === 'loading'}
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
                rows={!trace.process_usage ? [] : formatRowData([trace.process_usage], defaultProcessHeaders)}
                loading={status === 'loading'}
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
                rows={!trace.node_usage ? []: formatRowData([trace.node_usage], defaultNodeHeaders)}
                loading={status === 'loading'}
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
