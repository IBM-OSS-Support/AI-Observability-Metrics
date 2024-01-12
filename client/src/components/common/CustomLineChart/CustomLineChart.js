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

const defaultOptions = {
  theme: "g100",
  axes: {
    left: {
      mapsTo: "value",
    },
    bottom: {
      mapsTo: "key",
      scaleType: "time",
    },
  },
  timeScale: {
    addSpaceOnEdges: 0
  },
  legend: {
    enabled: false,
  },
  toolbar: {
    enabled: false,
  },
  height: "170px"
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
