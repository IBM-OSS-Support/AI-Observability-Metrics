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

import { LineChart } from '@carbon/charts-react';
import { Maximize } from '@carbon/icons-react';
import moment from "moment";

const defaultOptions = {
  theme: "g100",
  axes: {
    left: {
      mapsTo: "value",
      ticks: {
        number: 3
      }
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
  grid: {
    x: {
      alignWithAxisTicks: true,
    },
    y: {
      numberOfTicks: 3
    }
  },
  points: {
    fillOpacity: 1,
    filled: true,
    radius: 4
  },
  timeScale: {
    addSpaceOnEdges: 0.1
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
  color: {
    scale: {
      'Dataset1': '#893ffc'
    }
  },
  height: "100%"
}

function Metrics(props) {
  const options = useMemo(() => {
    return {
      ...defaultOptions,
      ...props.options
    }
  }, [props.options]);

  return (
    <LineChart
      data={props.data}
      options={options}
    ></ LineChart>
  );
}

export default Metrics;
