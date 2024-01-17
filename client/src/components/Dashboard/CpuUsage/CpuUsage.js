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
import React, { useEffect, useState } from "react";
import moment from "moment";

// Components ----------------------------------------------------------------->
import { Tile } from "@carbon/react";
import { GaugeChart } from "@carbon/charts-react";
import { getAppData } from "../../../appData";
import { useStoreContext } from "../../../store";

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

  const [data, setData] = useState([
    {
      group: 'value',
      value: 0
    }
  ]);
  const [avg, setAvg] = useState(0);

  const { state } = useStoreContext();

  useEffect(() => {
    let newData = [
      {
        group: 'value',
        value: 0
      }
    ];
    let newAvg = 0;
    if(state.status === 'success') {
      const appData = getAppData();

      const cpuUsages = appData
        .filter(d => moment(d.data.upload_ms / 1000).diff(moment(), 'days') <= 7)
        .map(d => {
          const cpuUsage = d.data.metrics.find(m => m.name === 'process_cpu_usage');
          let gauge = 0;
          if (cpuUsage) {
            gauge = (cpuUsage.gauge || 0)
          }
          return gauge
        });
      newData = [
        {
          group: 'value',
          value: cpuUsages[0] || 0
        }
      ];
      newAvg = (cpuUsages.reduce((s, g) => s + +g, 0) / cpuUsages.length).toFixed(2);
    }

    setData(newData);
    setAvg(newAvg);
  }, [state.status]);

  // Render
  return (
    <Tile className="infrastructure-components cpu-usage" >
      <h5>Latest CPU usage</h5> 
        <div className="cpu-usage-chart">
          <GaugeChart
            data={data}
            options={options}
          />
        </div>
        <div className="cpu-usage-data">
          <div className="label">Average CPU usage for last 7 days</div>
          <h3 className="data">{avg} %</h3>
        </div>
    </Tile>
  );
};

export default CpuUsage;
