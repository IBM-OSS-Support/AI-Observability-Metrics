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
import { GaugeChart } from "@carbon/charts-react";

const data = [
  {
    group: 'value',
    value: 1.02
  }
]

const options = {
  theme: "g90",
  title: '',
  resizable: true,
  height: '182px',
  width: '230px',
  gauge: {
    alignment: 'center',
    type: 'semi',
    status: 'danger',
    arcWidth: 24
  },
  legend: {
    enabled: false
  },
  toolbar: {
    enabled: false,
  },
  color: {
    scale: {
      value: '#136e6d'
    }
  }
}

const CpuUsage = () => {
  // Render
  return (
    <Tile className="infrastructure-components cpu-usage">
      <h5>Latest CPU usage</h5>
      <div className="cpu-usage-chart">
        <GaugeChart
          data={data}
          options={options}
        />
      </div>
      <div className="cpu-usage-data">
        <div className="label">Average CPU usage for last 7 days</div>
        <h3 className="data">0.79 %</h3>
      </div>
    </Tile>
  );
};

export default CpuUsage;
