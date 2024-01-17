/* ******************************************************************************
 * IBM Confidential
 *
 * OCO Source Materials
 *
 *  Copyright IBM Corp. 2023  All Rights Reserved.
 *
 * The source code for this program is not published or otherwise divested
 * of its trade secrets, irrespective of what has been deposited with
 * the U.S. Copyright Office.
 ****************************************************************************** */
import React from "react";

// Components ----------------------------------------------------------------->
import { Tile } from "@carbon/react";
import { StackedBarChart } from "@carbon/charts-react";

const data = [
  {
    group: "Virtual",
    key: "dinesh_application",
    value: 65000,
  },
  {
    group: "Virtual",
    key: "vikram_application",
    value: 29123,
  },
  {
    group: "Process",
    key: "dinesh_application",
    value: 32432,
  },
  {
    group: "Process",
    key: "vikram_application",
    value: 21312,
  },
];
const options = {
  theme: "g90",
  title: "",
  axes: {
    left: {
      mapsTo: "value",
      stacked: true,
    },
    bottom: {
      mapsTo: "key",
      scaleType: "labels",
    },
  },
  height: "19rem",
  color: {
    scale: {
      value: "#136e6d",
    },
  },
  toolbar: {
    enabled: false,
  },
  legend: {
    position: 'top'
  }
};

const MemoryTile = () => {
  // Render
  return (
    <Tile
      className="memory-usage"
      style={{
        padding: "1rem",
      }}
    >
      <div className="memory-usage-content">
        <h5>Memory usage</h5>
        <div className="types">
          <StackedBarChart data={data} options={options}></StackedBarChart>
        </div>
      </div>
    </Tile>
  );
};

export default MemoryTile;
