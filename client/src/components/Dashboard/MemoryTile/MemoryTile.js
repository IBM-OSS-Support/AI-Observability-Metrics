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

// Components ----------------------------------------------------------------->
import { Tile } from "@carbon/react";
import { StackedBarChart } from "@carbon/charts-react";
import { useStoreContext } from "../../../store";
import { getAppData } from "../../../appData";
import { formatMemorySize } from "../../../utils/data-utils";

const options = {
  theme: "g90",
  title: "",
  axes: {
    left: {
      mapsTo: "value",
      stacked: true,
      ticks: {
        formatter: (tick) => formatMemorySize(tick)
      }
    },
    bottom: {
      mapsTo: "key",
      scaleType: "labels",
    },
  },
  height: "100%",
  color: {
    scale: {
      Virtual: '#099694',
      Process: '#773bcc'
    },
  },
  toolbar: {
    enabled: false,
  },
  legend: {
    position: 'top'
  },
  tooltip: {
    valueFormatter: (value, label) => {
      switch (label) {
        case 'y-value': 
          return `${formatMemorySize(value)}`;
          default:
        return value;
      }
    },
    groupLabel: 'memory'
  }
};

const defaultData = [];

const MemoryTile = () => {

  const [ data, setData ] = useState(defaultData);
  const { state } = useStoreContext();

  useEffect(() => {
    let newData = defaultData;
    if(state.status === 'success') {
      const appData = getAppData();

      newData = appData
        .map(d =>  d.data.metrics.reduce((_d, { name, gauge }) => {
            switch (name) {
              case 'process_memory': 
                return _d.concat({
                  group: 'Process',
                  key: d.data['application-name'],
                  value: gauge || 0
                });
              case 'virtual_memory': 
                return _d.concat({
                  group: 'Virtual',
                  key: d.data['application-name'],
                  value: gauge || 0
                });
              default: return _d;
            }
          }, [])
        )
        .flat();
    }

    setData(newData);
  }, [state.status]);

  // Render
  return (
    <Tile
      className="memory-usage infrastructure-components"
    >
      <h5>Memory usage</h5>
      <div className="memory-usage-content">
        <StackedBarChart data={data} options={options}></StackedBarChart>
      </div>
    </Tile>
  );
};

export default MemoryTile;
