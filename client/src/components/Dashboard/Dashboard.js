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
import { Button, ClickableTile, Column, Content, Grid, TextInput } from "@carbon/react";

import { ArrowRight, Send } from "@carbon/icons-react";

// Globals -------------------------------------------------------------------->
import { DARK_THEME_ILLUSTRATION } from "./media/dark-theme-illustration";
import CustomLineChart from "../common/CustomLineChart";

import {
  callCountData,
  callCountOptions,
  latencyData,
  latencyDistData,
  latencyDistOptions,
  latencyOptions,
} from "../Metrics/Performance/constants";
import TracesTile from "./TracesTile/TracesTile";
import SessionsTile from "./SessionsTile/SessionsTile";
import MetricsTile from "./MetricsTile/MetricsTile";

function Dashboard() {
  return (
    <Content className="page-container home-container">
      <Grid fullWidth className="page-content">
        <Column max={12} xlg={12} lg={12} md={8} sm={4} className="left-container">
          <Grid fullWidth narrow id="header" className="header">
            <Column max={6} xlg={6} lg={6} md={8} sm={4}>
              <div className="left">
                <div className="title">
                  <h3>
                    Welcome back, <br /> Alice
                  </h3>
                </div>
              </div>
            </Column>
            {/* <Column max={1} xlg={1} lg={1} md={1} sm={0} /> */}
            <Column max={6} xlg={6} lg={6} md={0} sm={0}>
              <div className="right">
                <img src={DARK_THEME_ILLUSTRATION} alt="illustration" />
              </div>
            </Column>
          </Grid>
          <Grid
            fullWidth
            narrow
            id="body"
            className="body"
          >
            <Column
              max={4}
              xlg={4}
              lg={4}
              md={4}
              sm={4}
              className="content-tile"
            >
              <MetricsTile />
            </Column>
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
              max={8}
              xlg={8}
              lg={8}
              md={8}
              sm={4}
              className="content-tile space-5"
            >
              <div className="metrics-panel">
                <h1>Visualize graphically</h1>
              </div>
            </Column>

            <Column
              max={4}
              xlg={4}
              lg={4}
              md={4}
              sm={4}
              className="content-tile space-5"
            >
              <MetricsTile />
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
                // className="chart-tile"
                style={{}}
                href={"#/"}
                onKeyDown={(event) => {}}
              >
                <CustomLineChart
                  data={callCountData}
                  options={callCountOptions}
                />
              </ClickableTile>
            </Column>
            <Column
              max={8}
              xlg={8}
              lg={8}
              md={8}
              sm={4}
              className="content-tile"
            >
              <ClickableTile
                // className="chart-tile"
                style={{}}
                href={"#/"}
                onKeyDown={(event) => {}}
              >
                <CustomLineChart data={latencyData} options={latencyOptions} />
              </ClickableTile>
            </Column>
            <Column
              max={8}
              xlg={8}
              lg={8}
              md={8}
              sm={4}
              className="content-tile"
            >
              <ClickableTile
                // className="chart-tile"
                style={{}}
                href={"#/"}
                onKeyDown={(event) => {}}
              >
                <CustomLineChart
                  data={latencyDistData}
                  options={latencyDistOptions}
                />
              </ClickableTile>
            </Column>
          </Grid>
        </Column>
        <Column max={4} xlg={4} lg={4} md={8} sm={4} className="chat-container">
          <div className="chat-box">
            <h5 className="title">Talk to Roja</h5>
            <div className="input-container">

            <TextInput placeholder="What do you want to ask?"></TextInput>
            <div className="button-wrapper">

            <Button className="button-go" size="sm" hasIconOnly renderIcon={Send} kind="ghost"/>
            </div>
            </div>
            <label className="chat-info">
              Roja may generate incorrect information. <br />
              Verify important information.
            </label>
          </div>
        </Column>
      </Grid>
    </Content>
  );
}

export default Dashboard;
