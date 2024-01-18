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
import moment from "moment";

import { SimpleBarChart } from "@carbon/charts-react";
import { Maximize } from "@carbon/icons-react";

import { useStoreContext } from "../../../store";
import { getTokenCountData } from "../helper";

const options = {
  theme: "g100",
  title: "Token count",
  axes: {
    left: {
      mapsTo: "value",
    },
    bottom: {
      mapsTo: "key",
      scaleType: "time",
      ticks: {
        number: 4,
        formatter: (tick => moment(tick).format('hh:mm A'))
      }
    }
  },
  legend: {
    enabled: false,
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
    valueFormatter: (value, label) => {
      switch (label) {
        case 'y-value': return value;
        case 'x-value': return moment(value).format('DD-MMM-YY hh:mm A');
        case 'Group': return 'Token count';
        default: return ''
      }
    }
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
      return getTokenCountData(state.metrics);
    }

    return [];
  }, [state.metrics]);

  return (
    <SimpleBarChart
      data={callCountData}
      options={options}
    />
  );
}

export default TokenCountGraph;
