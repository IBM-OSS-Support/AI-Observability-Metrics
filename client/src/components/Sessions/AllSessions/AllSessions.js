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


import CustomDataTable from "../../common/CustomDataTable";
import { Download, Time } from "@carbon/icons-react";

import data from "../../../constants/sessions.json";

function AllSessions() {
  const navigate = useNavigate();
  const defaultHeaders = [
    {
      key: "session",
      header: "Session",
      checked: true,
    },
    {
      key: "transactions",
      header: "Transactions",
      checked: true,
    },
    {
      key: "deployment",
      header: "Deployment",
      checked: true,
    },
    {
      key: "user",
      header: "User",
      checked: true,
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
  const [startDate, setStartDate] = useState(undefined);
  const [endDate, setEndDate] = useState(undefined);
  const [rows, setRows] = useState(data);

  function formatData(rowData) {
    return rowData.map((row, i) => {
      return defaultHeaders.reduce((r, h) => {
        switch(h.key) {
          case 'session':
            r[h.key] = {
              displayType: 'link',
              data: <><Time style={{marginRight: '.5rem'}}></Time> {row[h.key]}</>,
              href: `#/traces/?trace=${row[h.key]}`,
            }
            break;
          default:
            r[h.key] = row[h.key]
        }
        return r
      }, {id: `row_${i}`})
    })
  }
  return (
    <div>
      <CustomDataTable
        headers={headers.filter((h) => h.checked || h.key === "actions")}
        rows={formatData(rows)}
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
            title: "No sessions yet.",
            noDataSubtitle:
              "All sessions are listed here.",
          }
        }
        sortRowHandler={() => {}}
        tableHeaderClickHandler={() => {}}
      />
    </div>
  );
}

export default AllSessions;
