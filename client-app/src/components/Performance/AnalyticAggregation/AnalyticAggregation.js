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
  AnalyticAggregationOptions
} from "../constants";
import { useStoreContext } from "../../../store";
import { getAnalyticAggregationData } from "../helper";

function AnalyticAggregation() {
  const { state } = useStoreContext();

  const AnalyticAggregationData = useMemo(() => {
    if (state.metrics) {
        console.table(state.metrics);
      return getAnalyticAggregationData(state.metrics);
    }

    return [];
  }, [state.metrics]);

  return (
    <CustomLineChart
      data={AnalyticAggregationData}
      options={AnalyticAggregationOptions}
    />
  );
}

export default AnalyticAggregation;
