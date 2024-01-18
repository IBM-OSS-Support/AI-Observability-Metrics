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

import CustomLineChart from "../../common/CustomLineChart";

import {
  latencyOptions
} from "../constants";
import { useStoreContext } from "../../../store";
import { getLatencyData } from "../helper";

function LatencyGraph() {
  const { state } = useStoreContext();

  const latencyData = useMemo(() => {
    if (state.metrics) {
      return getLatencyData(state.metrics);
    }

    return [];
  }, [state.metrics]);

  return (
    <CustomLineChart
      data={latencyData}
      options={latencyOptions}
    />
  );
}

export default LatencyGraph;
