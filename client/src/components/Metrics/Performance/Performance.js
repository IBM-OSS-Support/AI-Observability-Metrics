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

import { SimpleBarChart } from "@carbon/charts-react";

import {
  filterValues,
  latencyDistData,
  latencyDistOptions,
} from "./constants";
import Filters from "../Filters";
import CallCountGraph from "./CallCountGraph";
import LatencyGraph from "./LatencyGraph";

function Metrics() {
  const [filters, setFilters] = useState(filterValues);

  return (
    <>
      <Filters
        items={filters}
        onFilterChange={(filterName, selectedArr) => {
          setFilters({
            ...filters,
            [filterName]: {
              ...filters[filterName],
              selected: selectedArr
            }
          })
        }}
      />

      <div className="line-chart-section">
        <CallCountGraph />
      </div>

      <div className="line-chart-section">
        <LatencyGraph />
      </div>

      <div className="line-chart-section">
        <SimpleBarChart
          data={latencyDistData}
          options={latencyDistOptions}
        />
      </div>
    </>
  );
}

export default Metrics;
