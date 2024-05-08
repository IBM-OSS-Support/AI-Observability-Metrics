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
    ErrorRateOptions,
  callCountOptions
} from "../constants";
import { useStoreContext } from "../../../store";
import { getErrorRateData } from "../helper";

function ErrorRate() {
  const { state } = useStoreContext();

  const ErrorRateData = useMemo(() => {
    if (state.metrics) {
        console.table(state.metrics);
      return getErrorRateData(state.metrics);
    }

    return [];
  }, [state.metrics]);

  return (
    <CustomLineChart
      data={ErrorRateData}
      options={ErrorRateOptions}
    />
  );
}

export default ErrorRate;
