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
import moment from 'moment';
import { useNavigate, useSearchParams } from "react-router-dom";

import { SimpleBarChart } from "@carbon/charts-react";

import CustomDataTable from "../../common/CustomDataTable";
import { Download, Maximize } from "@carbon/icons-react";
import { Accordion, AccordionItem } from "@carbon/react";
import { useStoreContext } from "../../../store";
import { getAppData } from "../../../appData";

const chartData = [
  {
    group: "16:30:00",
    value: 0,
  },
  {
    group: "16:43:00",
    value: 1,
  },
  {
    group: "16:56:00",
    value: 0,
  },
  {
    group: "17:09:00",
    value: 0,
  },
  {
    group: "17:22:00",
    value: 4,
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
  height: "180px",
  width: "100%",
  color: {
    scale: {
      "16:30:00": "#4589ff",
      "16:43:00": "#4589ff",
      "16:56:00": "#4589ff",
      "17:09:00": "#4589ff",
      "17:22:00": "#4589ff",
    },
  },
};

function Transactions() {
  const navigate = useNavigate();
  const defaultHeaders = [
    {
      key: "deployment",
      header: "Application name",
      checked: true,
    },
    {
      key: "latency",
      header: "Latency",
      checked: true,
    },
    {
      key: "user",
      header: "User",
      checked: true,
    },
    {
      key: "hostname",
      header: "Hostname",
      checked: true,
    },
    {
      key: "operation",
      header: "Operation",
      checked: true,
    },
    {
      key: "trace",
      header: "Timestamp",
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
  const [modal, setModal] = useState(false);
  const [startDate, setStartDate] = useState(undefined);
  const [endDate, setEndDate] = useState(undefined);
  const [rows, setRows] = useState([]);
  const { state } = useStoreContext();

  useEffect(() => {
    if(state.status === 'success') {
      const data = getAppData();
      const rowData = data.map(({ data }) => {
        const rootSpanId = data.spans?.[0]?.context?.root_span_id
        const root = data.spans.find(s => s.span_id === rootSpanId)
        
        return root.tags.reduce((res, tag) =>  {
          res[tag.key] = tag.value
          return res
        }, {
          deployment: data['application-name'],
          trace: moment(Number(data.upload_ms)).format('YYYY-MM-DD HH:mm:ss'),
          latency: (Number(root.end_us) - Number(root.start_us)) / 1000,
          start_us: root.start_us,
          end_us: root.end_us,
        })
      })
      setRows(rowData)
    } else {
      setRows([])
    }
  }, [state.status])

  function formatData(rowData) {
    return rowData.map((row, i) => {
      return defaultHeaders.reduce(
        (r, h) => {
          switch (h.key) {
            case "deployment":
              r[h.key] = {
                displayType: "link",
                data: row[h.key],
                href: `#/trace-analysis/${row[h.key]}`,
              };
              break;
            case 'latency': 
              r[h.key] = `${moment.duration(row[h.key]).asSeconds().toFixed(1)}s`;
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
  return (
    <>
      <div className="trace-sections">
        <Accordion align="start">
          <AccordionItem title="Timeline chart" open={true}>
            <SimpleBarChart
              data={chartData}
              options={chartOptions}
            ></SimpleBarChart>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="trace-sections">
        <CustomDataTable
          headers={headers.filter((h) => h.checked || h.key === "actions")}
          rows={formatData(rows)}
          loading={state.status === 'loading'}
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
              noDataSubtitle: "All traces from your data are listed here.",
            }
          }
          sortRowHandler={() => {}}
          tableHeaderClickHandler={() => {}}
        />
      </div>
    </>
  );
}

export default Transactions;
