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
import React from "react";

import { SimpleBarChart } from "@carbon/charts-react";

import PageContainer from "../common/PageContainer";
import CustomLineChart from "../common/CustomLineChart";
import { callCountData, callCountOptions, latencyData, latencyDistData, latencyDistOptions, latencyOptions } from "./constants";

function Metrics() {
  return (
    <PageContainer
      className='metrics-container'
      header={{
        title: "Traces",
        subtitle: "Traces fpr your data.",
      }}
    >
      <div className="line-chart-section">
        <CustomLineChart
          data={callCountData}
          options={callCountOptions}
        />
      </div>

      <div className="line-chart-section">
        <CustomLineChart
          data={latencyData}
          options={latencyOptions}
        />
      </div>

      <div className="line-chart-section">
        <SimpleBarChart
          data={latencyDistData}
          options={latencyDistOptions}
        />
      </div>
    </PageContainer>
  );
}

export default Metrics;
