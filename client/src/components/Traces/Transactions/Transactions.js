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
import React, { useMemo, useState } from "react";
import {
  useNavigate,
  useSearchParams
} from 'react-router-dom';

import CustomDataTable from "../../common/CustomDataTable";
import { Download } from "@carbon/icons-react";

function Transactions() {
  const navigate = useNavigate();
  const defaultHeaders = [
    {
      key: "query_id",
      header: "Query ID",
      checked: true,
      required: true,
    },
    {
      key: "query",
      header: "Query",
      checked: true,
    },
    {
      key: "state",
      header: "State",
      checked: true,
    },
    {
      key: "engine",
      header: "Engine",
      checked: true,
    },
    {
      key: "user",
      header: "User",
      checked: true,
    },
    {
      key: "source",
      header: "Source",
      checked: true,
    },
    {
      key: "queued_time_ms",
      header: "Queued time",
      checked: false,
    },
    {
      key: "analysis_time_ms",
      header: "Analysis time",
      checked: false,
    },
    {
      key: "created",
      header: "Created",
      checked: true,
    },
    { key: "actions", header: "" },
  ];

  const [headers, setHeaders] = useState(
    defaultHeaders.map((h) => Object.assign({}, h))
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState([]);
  const [initialSelectedFilters, setInitialSelectedFilters] = useState({
    'source': [
      'Web client'
    ]
  });
  const [selectedFilters, setSelectedFilters] = useState({});
  const [pagination, setPagination] = useState({ offset: 0, first: 10 });
  const [modal, setModal] = useState(false);
  const [startDate, setStartDate] = useState(undefined);
  const [endDate, setEndDate] = useState(undefined);
  const [rows, setRows] = useState([]);

  return (
    <div>
      <CustomDataTable
        headers={headers.filter((h) => h.checked || h.key === "actions")}
        rows={rows}
        loading={false}
        search={{
          searchText: searchText,
          persistent: true,
          placeholder: "Search for queries",
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
            title: "No queries yet.",
            noDataSubtitle: "Any queries run on your existing engines may be monitored here after submission.",
          }
        }
        sortRowHandler={() => {}}
        tableHeaderClickHandler={() => {}}
      />
    </div>
  );
}

export default Transactions;
