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

import { StackedBarChart } from "@carbon/charts-react";
import { Maximize } from "@carbon/icons-react";

import { useStoreContext } from "../../../store";
import { getAppData } from "../../../appData";

const options = {
  theme: "g100",
  title: "Token count",
  axes: {
    left: {
      mapsTo: "value",
      stacked: true
    },
    bottom: {
      mapsTo: "key",
      scaleType: "labels",
    }
  },
  legend: {
    position: 'top'
  },
  toolbar: {
    enabled: true,
    controls:[{
      type: "Make fullscreen"
    }],
    text: "Make fullscreen",
    iconSVG: {
      content: Maximize
    },
    shouldBeDisabled: false
  },
  tooltip: {
    truncation: {
      numCharacter: 20
    },
    groupLabel: 'count of',
  },
  height: "100%",
  color: {
    scale: {
      Dataset1: "#5281d8"
    },
  },
};

function TokenCountGraph() {
  const { state } = useStoreContext();

  const callCountData = useMemo(() => {
    if (state.metrics) {
      const appData = getAppData();

      return appData
        .map(d => d.data.spans.reduce((_counts, { data_profile }) => {
          if (data_profile && !!data_profile.length) {
            data_profile.forEach(({data_name, counts}) => {
  
              switch (data_name) {
                case 'messages':
                  _counts.inputs += +counts.find(count => count.name === 'token_count')?.count || 0;
                  break;
                case 'completion':
                  _counts.outputs += +counts.find(count => count.name === 'token_count')?.count || 0;
                  break;
                default: ;
              }
            }, _counts);
          }
          return _counts;
          }, {inputs: 0, outputs: 0, appName: d.data['application-name']})
        )
        .map(count => [
          {
            group: 'Inputs',
            key: count.appName,
            value: count.inputs
          },
          {
            group: 'Outputs',
            key: count.appName,
            value: count.outputs
          }
        ])
        .flat();
    }

    return [];
  }, [state.metrics]);

  return (
    <StackedBarChart
      data={callCountData}
      options={options}
    />
  );
}

export default TokenCountGraph;
