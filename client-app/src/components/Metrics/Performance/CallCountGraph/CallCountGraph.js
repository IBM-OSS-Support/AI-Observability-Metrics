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

import CustomLineChart from "../../../common/CustomLineChart";

import {
  callCountOptions
} from "../constants";
import { useStoreContext } from "../../../../store";
import { getCallCountData } from "../helper";

function CallCountGraph() {
  const { state } = useStoreContext();

  const callCountData = useMemo(() => {
    if (state.metrics) {
      return getCallCountData(state.metrics);
    }

    return [];
  }, [state.metrics]);

  return (
    <CustomLineChart
      data={callCountData}
      options={callCountOptions}
    />
  );
}

export default CallCountGraph;
