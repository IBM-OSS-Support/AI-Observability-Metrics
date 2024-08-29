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
import { Button, ClickableTile, Column, Content, Grid, Tile } from "@carbon/react";

// Globals -------------------------------------------------------------------->
import TracesTile from "./TracesTile/TracesTile";
import SessionsTile from "./SessionsTile/SessionsTile";
import MetricsTile from "./MetricsTile/MetricsTile";
import RojaChat from "../common/RojaChat";
import CpuUsage from "./CpuUsage/CpuUsage";
import CallCountGraph from "../Metrics/Performance/CallCountGraph";
import TokenCountGraph from "../Metrics/Data/TokenCountGraph";
import MemoryTile from "./MemoryTile/MemoryTile";
import { Link } from "react-router-dom";
import LatencyGraph from "../Performance/LatencyGraph/LatencyGraph";

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
            <Column max={8} xlg={8} lg={8} md={6} sm={4}>
              <h3>GenAI Apps - Observability & Monitoring</h3>
            </Column>
            <Column max={8} xlg={8} lg={8} md={6} sm={4}>
              <h4>Quick Navigations</h4>
            </Column>
            <Column max={12} xlg={12} lg={12} md={8} sm={4}>
              <Button className="quick-link-button" kind="tertiary" href="#/performance">Performance</Button>
              <Button className="quick-link-button" kind="tertiary" href="#/auditing">Auditing</Button>
              <Button className="quick-link-button" kind="tertiary" href="#/traceability">Traceability</Button>
              <Button className="quick-link-button" kind="tertiary" href="#/metering">Metering & Billing</Button>
            </Column>
          </Grid>
          <Grid fullWidth narrow id="body" className="body">
            <Column
              max={5}
              xlg={5}
              lg={5}
              md={8}
              sm={4}
              className="content-tile"
            >
              <TracesTile />
            </Column>
            {/* <Column
              max={4}
              xlg={4}
              lg={4}
              md={4}
              sm={4}
              className="content-tile"
            >
              <MemoryTile />
            </Column> */}
            {/* <Column
              max={4}
              xlg={4}
              lg={4}
              md={4}
              sm={4}
              className="content-tile"
            >
              <CpuUsage />
            </Column> */}
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
              max={7}
              xlg={7}
              lg={7}
              md={8}
              sm={4}
              className="content-tile"
            >
              <Tile className="chart-tile">
                <LatencyGraph />
              </Tile>
            </Column>
            {/* <Column
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
            </Column> */}
            {/* <Column
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
                <TokenCountGraph />
              </ClickableTile>
            </Column> */}
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
