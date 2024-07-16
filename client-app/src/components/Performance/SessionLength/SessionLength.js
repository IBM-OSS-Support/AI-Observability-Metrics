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
  height: '80%',
  width: '100%',
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
    enabled: false
  },
  color: {
    scale: {
      value: '#136e6d'
    }
  }
}

const defaultData = [
  {
    group: 'value',
    value: 0
  }
];

const SessionLength = () => {

  const [data, setData] = useState(defaultData);
  const [avg, setAvg] = useState(0);

  const { state } = useStoreContext();

  useEffect(() => {
    let newData = defaultData;
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
          value: cpuUsages[0] + 5.7 || 0  //cpUsages[0] changed to cpuUsages[0] + 5.7
        }
      ];
      newAvg = (cpuUsages.reduce((s, g) => s + +g, 0) / cpuUsages.length).toFixed(2);
    }

    setData(newData);
    setAvg(newAvg);
  }, [state.status]);

  // Render
  return (
    <Tile className="infrastructure-components session-length" >
      <h5>Average Session Length</h5> 
        <div className="session-length-chart">
          <GaugeChart
            data={data}
            options={options}
          />
        </div>
    </Tile>
  );
};

export default SessionLength;
