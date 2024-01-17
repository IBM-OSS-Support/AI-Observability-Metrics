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
import { ClickableTile, Column, Content, Grid } from "@carbon/react";

import { SimpleBarChart } from "@carbon/charts-react";

// Globals -------------------------------------------------------------------->
import {
  latencyDistData,
  latencyDistOptions,
} from "../Metrics/Performance/constants";
import TracesTile from "./TracesTile/TracesTile";
import SessionsTile from "./SessionsTile/SessionsTile";
import MetricsTile from "./MetricsTile/MetricsTile";
import RojaChat from "../common/RojaChat";
import CpuUsage from "./CpuUsage/CpuUsage";
import CallCountGraph from "../Metrics/Performance/CallCountGraph";
import LatencyGraph from "../Metrics/Performance/LatencyGraph";

function Dashboard() {
  return (
    <Content className="page-container home-container">
      <Grid fullWidth className="page-content">
        <Column
          max={12}
          xlg={12}
          lg={12}
          md={8}
          sm={4}
          className="left-container"
        >
          <Grid fullWidth narrow id="header" className="page-header">
            <Column max={12} xlg={12} lg={12} md={8} sm={4}>
              <div className="left">
                <div className="title">
                  <h3>AI Observability & Monitoring</h3>
                </div>
              </div>
            </Column>
          </Grid>
          <Grid fullWidth narrow id="body" className="body">
            <Column
              max={4}
              xlg={4}
              lg={4}
              md={4}
              sm={4}
              className="content-tile"
            >
              <TracesTile />
            </Column>
            <Column
              max={4}
              xlg={4}
              lg={4}
              md={4}
              sm={4}
              className="content-tile"
            >
              <SessionsTile />
            </Column>
            <Column
              max={4}
              xlg={4}
              lg={4}
              md={4}
              sm={4}
              className="content-tile"
            >
              <CpuUsage />
            </Column>
            {/* <Column
              max={8}
              xlg={8}
              lg={8}
              md={8}
              sm={4}
              className="content-tile space-5"
            >
              <div className="metrics-panel">
                <h3>Visualize graphically</h3>
              </div>
            </Column> */}

            {/* <Column
              max={4}
              xlg={4}
              lg={4}
              md={4}
              sm={4}
              className="content-tile space-5"
            >
              <MetricsTile />
            </Column> */}
            <Column
              max={6}
              xlg={6}
              lg={6}
              md={6}
              sm={6}
              className="content-tile"
            >
              <ClickableTile
                className="chart-tile"
                style={{}}
                href={"#/"}
                onKeyDown={(event) => {}}
              >
                <LatencyGraph />
              </ClickableTile>
            </Column>
            <Column
              max={6}
              xlg={6}
              lg={6}
              md={6}
              sm={6}
              className="content-tile"
            >
              <ClickableTile
                className="chart-tile"
                style={{}}
                href={"#/"}
                onKeyDown={(event) => {}}
              >
                <CallCountGraph />
              </ClickableTile>
            </Column>
            <Column
              max={16}
              xlg={16}
              lg={16}
              md={8}
              sm={4}
              className="content-tile"
            >
              <ClickableTile
                className="chart-tile"
                style={{}}
                href={"#/"}
                onKeyDown={(event) => {}}
              >
                <SimpleBarChart
                  data={latencyDistData}
                  options={latencyDistOptions}
                />
              </ClickableTile>
            </Column>
          </Grid>
        </Column>
        <Column max={4} xlg={4} lg={4} md={0} sm={0}>
          <RojaChat />
        </Column>
      </Grid>
    </Content>
  );
}

export default Dashboard;
