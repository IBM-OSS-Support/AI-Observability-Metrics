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
import { useNavigate, useSearchParams } from "react-router-dom";

import { SimpleBarChart } from "@carbon/charts-react";

import CustomDataTable from "../../common/CustomDataTable";
import { Download } from "@carbon/icons-react";
import { Accordion, AccordionItem } from "@carbon/react";

function Transactions() {
  const navigate = useNavigate();
  const defaultHeaders = [
    {
      key: "query_id",
      header: "Label",
      checked: true,
      required: true,
    },
    {
      key: "query",
      header: "Trace",
      checked: true,
    },
    {
      key: "state",
      header: "Generations",
      checked: true,
    },
    {
      key: "engine",
      header: "Latency",
      checked: true,
    },
    {
      key: "user",
      header: "Deployment",
      checked: true,
    },
    {
      key: "source",
      header: "Component",
      checked: true,
    },
    {
      key: "queued_time_ms",
      header: "Operation",
      checked: true,
    },
    {
      key: "analysis_time_ms",
      header: "Hostname",
      checked: true,
    },
    {
      key: "created",
      header: "User",
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
    source: ["Web client"],
  });
  const [selectedFilters, setSelectedFilters] = useState({});
  const [pagination, setPagination] = useState({ offset: 0, first: 10 });
  const [modal, setModal] = useState(false);
  const [startDate, setStartDate] = useState(undefined);
  const [endDate, setEndDate] = useState(undefined);
  const [rows, setRows] = useState([]);

  const chartData = [
    {
      group: "Qty",
      value: 65000,
    },
    {
      group: "More",
      value: 29123,
    },
    {
      group: "Sold",
      value: 35213,
    },
    {
      group: "Restocking",
      value: 51213,
    },
    {
      group: "Misc",
      value: 16932,
    },
  ];

  const chartOptions = {
    theme: "g100",
    title: "",
    axes: {
      left: {
        mapsTo: "value",
      },
      bottom: {
        mapsTo: "group",
        scaleType: "labels",
      },
    },
    legend: {
      enabled: false,
    },
    toolbar: {
      enabled: false,
    },
    height: "170px",
    width: "100%",
    color: {
      scale: {
        Qty: "#4589ff",
        More: "#4589ff",
        Sold: "#4589ff",
        Restocking: "#4589ff",
        Misc: "#4589ff",
      },
    },
  };

  return (
    <div>
      <Accordion align="start">
        <AccordionItem title="Timeline chart">
          <SimpleBarChart
            data={chartData}
            options={chartOptions}
          ></SimpleBarChart>
        </AccordionItem>
      </Accordion>

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
            title: "No traces yet.",
            noDataSubtitle:
              "All traces from your data are listed here.",
          }
        }
        sortRowHandler={() => {}}
        tableHeaderClickHandler={() => {}}
      />
    </div>
  );
}

export default Transactions;
