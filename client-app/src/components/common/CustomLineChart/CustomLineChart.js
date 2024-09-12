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
        number: 7
      }
    },
    bottom: {
      mapsTo: "key",
      scaleType: "time",
      ticks: {
        number: 13,
        formatter: (tick => moment(tick).format('MMM DD, YY'))
      }
    }
  },
  grid: {
    x: {
      alignWithAxisTicks: true,
    },
    y: {
      numberOfTicks: 7
    }
  },
  points: {
    fillOpacity: 0.1,
    filled: true,
    radius: 6
  },
  timeScale: {
    addSpaceOnEdges: 1
  },
  legend: {
    enabled: false,
  },
  toolbar: {
    enabled: true,
    numberOfIcons: 4,
    controls:[
      {
        type: "Make fullscreen",
     },
     {
       type: "Zoom out",
     },
     {
       type: "Zoom in",
     }
    ],
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
  zoomBar: {
    top: {
      enabled: true
    }
  },
  height: "95%"
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
