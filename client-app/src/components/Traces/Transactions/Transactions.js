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
import React, { useEffect, useState, useMemo } from "react";
import moment from "moment";
import { useNavigate, useSearchParams } from "react-router-dom";

import CustomDataTable from "../../common/CustomDataTable";
import { Download, Maximize } from "@carbon/icons-react";
import { Accordion, AccordionItem, Tile } from "@carbon/react";
import { useStoreContext } from "../../../store";
import { getAppData } from "../../../appData";
import TimelineGraph from "./TimelineGraph";
import NoData from "../../common/NoData/NoData";

const Transactions = ({ component, showColors }) => {
  const navigate = useNavigate();

  const defaultHeaders = useMemo(() => {
    if (component === "audit") {
      return [
        {
          key: "deployment",
          header: "Application name",
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
          key: "trace",
          header: "Timestamp",
          checked: true,
        },
      ];
    } else if (component === "monitor") {
      return [
        {
          key: "deployment",
          header: "Application name",
          checked: true,
        },
        {
          key: "user",
          header: "User",
          checked: true,
        },
        {
          key: "operation",
          header: "Operation",
          checked: true,
        },
      ];
    }
    //safety score starts here
    else if (component === "safetyscore") {
      return [
        {
          key: "deployment",
          header: "Application name",
          checked: true,
        },
        {
          key: "hate",
          header: "Hate",
          checked: true,
        },
        {
          key: "user",
          header: "Sexual",
          checked: true,
        },
        {
          key: "operation",
          header: "Violence",
          checked: true,
        },
        {
          key: "deployment",
          header: "Self harm",
          checked: true,
        },
        {
          key: "user",
          header: "Harassment",
          checked: true,
        },
        {
          key: "operation",
          header: "Sexual/Minors",
          checked: true,
        },
        {
          key: "deployment",
          header: "Hate/Threatening",
          checked: true,
        },
        {
          key: "user",
          header: "Self harm/Intent",
          checked: true,
        },
        {
          key: "operation",
          header: "Violence/Graphic",
          checked: true,
        },
        {
          key: "deployment",
          header: "Harassment/Threatening",
          checked: true,
        },
        {
          key: "user",
          header: "Self harm/Instructions",
          checked: true,
        },
      ];
    }
    //end
    //maintenance starts here
    else if (component === "maintenance") {
      return [
        {
          key: "hostname",
          header: "Graphsignal Library",
          checked: true,
        },
        {
          key: "component",
          header: "OS Name",
          checked: true,
        },
        {
          key: "operation",
          header: "OS Version",
          checked: true,
        },
        {
          key: "user",
          header: "Runtime Name",
          checked: true,
        },
        {
          key: "operation",
          header: "Runtime Version",
          checked: true,
        },
        {
          key: "operation",
          header: "Library Versions",
          checked: true,
        },
      ];
    }
    // maintenance ends here
    return [
      {
        key: "deployment",
        header: "Application name",
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
      {
        key: "safety",
        header: "Safety Score",
        checked: true,
      },
    ];
  }, [component]);
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
    if (state.status === "success") {
      const data = getAppData();
      const rowData = data.map(({ data }) => {
        const rootSpanId = data.spans?.[0]?.context?.root_span_id;
        const root = (data.spans || []).find((s) => s.span_id === rootSpanId);
        if (!root) {
          return {
            deployment: data["application-name"],
            trace: moment(Number(data.upload_ms)).format("YYYY-MM-DD HH:mm:ss"),
            component: data[""],
            name: data[""],
            latency: 0,
            start_us: 0,
            end_us: 0,
          };
        }
        return root.tags.reduce(
          (res, tag) => {
            res[tag.key] = tag.value;
            return res;
          },
          {
            deployment: data["application-name"],
            trace: moment(Number(data.upload_ms)).format("YYYY-MM-DD HH:mm:ss"),
            latency: (Number(root.end_us) - Number(root.start_us)) / 1000,
            start_us: root.start_us,
            end_us: root.end_us,
          }
        );
      });
      setRows(rowData);
    } else {
      setRows([]);
    }
  }, [state.status]);

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
            case "latency":
              r[h.key] = `${moment
                .duration(row[h.key])
                .asSeconds()
                .toFixed(1)} s`;
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
    <div className="traces-container">
      {component !== "maintenance" &&
        component !== "safetyscore" &&
        component !== "audit" && (
          <Tile className="nodata-wrap">
            <NoData />
          </Tile>
        )}
    </div>
  );
};

export default Transactions;
