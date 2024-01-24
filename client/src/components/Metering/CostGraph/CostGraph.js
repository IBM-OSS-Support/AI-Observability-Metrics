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

import { GroupedBarChart } from "@carbon/charts-react";
import { Maximize } from "@carbon/icons-react";

import { useStoreContext } from "../../../store";
import { getAppData } from "../../../appData";

const options = {
  theme: "g100",
  title: "Cost",
  axes: {
		left: {
			mapsTo: "value"
		},
		bottom: {
			scaleType: "labels",
			mapsTo: "key"
		},
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
  },
  height: "100%",
  color: {
    scale: {
      Dataset1: "#5281d8"
    },
  },
};

function CostGraph() {
  const { state } = useStoreContext();

  const costData = useMemo(() => {
    if (state.status === 'success') {
      const appData = getAppData();

      return appData
        .map(({data: app}) => [
          {
            group: 'openAI',
            key: app['application-name'],
            value: app['token-cost']
          },
          {
            group: 'Granite',
            key: app['application-name'],
            value: app['token-cost'] * .8
          },
        ])
        .flat();
    }

    return [];
  }, [state.status]);

  return (
    <GroupedBarChart
      data={costData}
      options={options}
    />
  );
}

export default CostGraph;
