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
import React, { useMemo } from "react";

import CustomDataTable from "../../common/CustomDataTable";

function Transactions() {
  const defaultHeaders = useMemo(
    () => [
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
        header: formatMessage({
          id: "QueryHistoryList.user",
          defaultMessage: "User",
        }),
        checked: true,
      },
      {
        key: "source",
        header: formatMessage({
          id: "QueryHistoryList.source",
          defaultMessage: "Source",
        }),
        checked: true,
      },
      {
        key: "queued_time_ms",
        header: formatMessage({
          id: "QueryHistoryList.queuedTime",
          defaultMessage: "Queued time",
        }),
        checked: false,
      },
      {
        key: "analysis_time_ms",
        header: formatMessage({
          id: "QueryHistoryList.analysisTime",
          defaultMessage: "Analysis time",
        }),
        checked: false,
      },
      {
        key: "created",
        header: formatMessage({
          id: "QueryHistoryList.created",
          defaultMessage: "Created",
        }),
        checked: true,
      },
      { key: "actions", header: "" },
    ],
    [formatMessage]
  );

  const [headers, setHeaders] = useState(
    defaultHeaders.map((h) => Object.assign({}, h))
  );
  return (
    <div>
      <CustomDataTable
        headers={headers.filter((h) => h.checked || h.key === "actions")}
        rows={rows || []}
        loading={!lastUpdated}
        search={{
          searchText: searchText,
          persistent: true,
          placeholder: formatMessage({
            id: "QueryHistoryList.searchPlaceholder",
            defaultMessage: "Search for queries",
          }),
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
          dateLabel: formatMessage({
            id: "QueryHistoryList.created",
            defaultMessage: "Created",
          }),
          setSelectedFilters: (newSelectedFilters) => {
            setSelectedFilters(newSelectedFilters);
            setPagination((prev) => ({ ...prev, offset: 0 }));

            if (!Object.keys(newSelectedFilters).length) {
              setInitialSelectedFilters({});
              return navigate(getPath("/query-history"));
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
          label: !!lastUpdated
            ? formatMessage(
                {
                  id: "QueryHistoryList.lastUpdated",
                  defaultMessage: "Refresh (last updated {timestamp} ago)",
                },
                {
                  timestamp: Moment.duration(Date.now() - lastUpdated)
                    .locale(locale)
                    .humanize(),
                }
              )
            : formatMessage({
                id: "QueryHistoryList.loading",
                defaultMessage: "Refresh (loading...)",
              }),
          align: "bottom-right",
          onClick: () => refresh(),
        }}
        primaryButton={{
          kind: "primary",
          renderIcon: Download,
          children: formatMessage({
            id: "QueryHistoryList.exportToCSV",
            defaultMessage: "Export to CSV",
          }),
          onClick: () => handleExportCSV(exportRows, headers, "QueryHistory"),
          disabled: rows.length === 0 || !lastUpdated,
        }}
        pagination={{
          totalItems,
          setPagination,
          ...pagination,
        }}
        emptyState={
          !rows.length && {
            type: noMatches ? "NotFound" : "NoData",
            title: formatMessage({
              id: "QueryHistoryList.emptyStateTitle",
              defaultMessage: "No queries yet.",
            }),
            noDataSubtitle: formatMessage({
              id: "QueryHistoryList.noDataSubtitle1",
              defaultMessage:
                "Any queries run on your existing engines may be monitored here after submission.",
            }),
          }
        }
        sortRowHandler={sortRowHandler}
        tableHeaderClickHandler={tableHeaderClickHandler}
      />
    </div>
  );
}

export default Transactions;
