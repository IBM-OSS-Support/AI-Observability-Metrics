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
import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { Download } from "@carbon/icons-react";
import { useStoreContext } from "../../store";
import Flow from "./Flow";
import CustomDataTable from "../common/CustomDataTable";
import PageContainer from "../common/PageContainer";
import { CVE_DUMMY_DATA, defaultHeaders, statusMap } from "./constants";

let fullRows = CVE_DUMMY_DATA;

const CveWorkflows = () => {
  const navigate = useNavigate();

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
  const [startDate, setStartDate] = useState(undefined);
  const [endDate, setEndDate] = useState(undefined);
  const [rows, setRows] = useState(fullRows);
  const [hoveredNode, setHoveredNode] = useState('');
  const [selectedNode, setSelectedNode] = useState('');
  const { state } = useStoreContext();

  function formatData(rowData = []) {
    return rowData.map((row = {}, i) => {
      return defaultHeaders.reduce(
        (r, h) => {
          switch (h.key) {
            case "cveId":
              r[h.key] = {
                displayType: "button-link",
                data: row[h.key],
                onClick: () => {},
              };
              break;
            default:
              r[h.key] = row[h.key];
          }
          return r;
        },
        { id: `row_${i}` }
      );
    });
  }

  function onNodeClick(nodeId) {
    if (selectedNode === nodeId) {
      setSelectedNode('');
      setRows(fullRows);
      return;
    }

    const statusMapPair = Object.entries(statusMap).find(([ key, value ]) => {
      return value === nodeId;
    });

    if (!statusMapPair) {
      return;
    }

    setSelectedNode(nodeId);
    const selectedStatus = statusMapPair[0];
    setRows(fullRows.filter(({ status }) => {
      return status === selectedStatus;
    }));
  }

  return (
    <PageContainer
      className="traces-container"
      header={{
        title: "CVE Workflow",
        subtitle: "List of all CVE's."
      }}
    >
        <div className="flow-diag-section">
          <Flow
            hoveredNode={hoveredNode}
            selectedNode={selectedNode}
            onNodeClick={onNodeClick}
          />
        </div>

        <div className="trace-sections">
          <CustomDataTable
            headers={headers.filter((h) => h.checked || h.key === "actions")}
            rows={formatData(rows)}
            loading={state.status === "loading"}
            search={{
              searchText: searchText,
              persistent: true,
              placeholder: "Search for cve",
              onChange: setSearchText,
            }}
            filter={{
              id: "cve-filter",
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
                  return navigate("/");
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
              onClick: () => {},
            }}
            primaryButton={{
              kind: "primary",
              renderIcon: Download,
              children: "Export to CSV",
              onClick: () => {},
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
                title: "No cve's found.",
                noDataSubtitle: "All cve's are listed here.",
              }
            }
            sortRowHandler={() => {}}
            tableHeaderClickHandler={() => {}}
            onRowMouseEnter={(row) => {
              const statusCol = row.cells.find(({ info: { header } }) => {
                return header === 'status';
              });
              setHoveredNode(statusMap[statusCol.value]);
            }
            }
            onRowMouseLeave={() => setHoveredNode('')}
          />
        </div>
    </PageContainer>
  );
};

export default CveWorkflows;
