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
import React, { useEffect, useState } from "react";
import { Accordion, AccordionItem, Column, Content, Dropdown, Grid, Tile } from "@carbon/react";

// Globals -------------------------------------------------------------------->
import CpuUsage from "./CpuUsage/CpuUsage";
import CallCountGraph from "./CallCountGraph/CallCountGraph";
import LatencyGraph from "./LatencyGraph/LatencyGraph";
import TokenCountGraph from "./TokenCountGraph/TokenCountGraph";
import MemoryTile from "./MemoryTile/MemoryTile";
import PageContainer from "../common/PageContainer/PageContainer";
import ErrorRate from "./ErrorRate/ErrorRate";
import AbandonmentRate from "./AbandonmentRate/AbandonmentRate";
import { GaugeChart } from "@carbon/charts-react";
import SessionLength from "./SessionLength/SessionLength";
import RequestsPerSession from "./RequestsPerSession/RequestsPerSession";
import Filter from "../common/HeaderFilter/HeaderFilter";
import AnalyticAggregation from "./AnalyticAggregation/AnalyticAggregation";
import PolicyDiagram from "./PolicyDiagram/PolicyDiagram";
import TokenPerSession from "./TokenPerSession/TokenPerSession";
import SuccessRate from "./SuccessRate/SuccessRate";
import FailureRate from "./FailureRate/FailureRate";

const Performance = () => {
  return (
    <PageContainer
      className="page-container performance-page"
      header={{
        title: "Performance",
        subtitle: "Performance graphs",
      }}
    >
      <div className="home-container">
		<Filter />
		<Accordion align="start">
			<AccordionItem title="Session Characteristics" open={false}>
				<Grid fullWidth narrow id="body" className="page-content body">
					<Column max={4} xlg={4} lg={4} md={4} sm={4} className="content-tile">
						<SessionLength />
					</Column>
					<Column max={4} xlg={4} lg={4} md={4} sm={4} className="content-tile">
						<RequestsPerSession />
					</Column>
          <Column max={4} xlg={4} lg={4} md={4} sm={4} className="content-tile">
						<TokenPerSession />
					</Column>
		  		</Grid>
			</AccordionItem>
		</Accordion>
        <Grid fullWidth narrow id="body" className="page-content body">
          <Column max={8} xlg={8} lg={8} md={4} sm={4} className="content-tile">
            <CpuUsage />
          </Column>
          <Column max={8} xlg={8} lg={8} md={4} sm={4} className="content-tile">
          <Tile className="chart-tile">
            <CallCountGraph />
          </Tile>
          </Column>
          <Column max={16} xlg={16} lg={16} md={4} sm={4} className="content-tile">
            <Tile className="chart-tile">
              <LatencyGraph />
            </Tile>
          </Column>
          {/* <Column
            max={16}
            xlg={16}
            lg={16}
            md={4}
            sm={4}
            className="content-tile"
          >
            <PolicyDiagram/>
          </Column> */}
          {/* <Column
            max={8}
            xlg={8}
            lg={8}
            md={4}
            sm={4}
            className="content-tile"
          >
            <Tile className="chart-tile">
              <ErrorRate />
            </Tile>
          </Column>
		  <Column
            max={8}
            xlg={8}
            lg={8}
            md={4}
            sm={4}
            className="content-tile"
          >
            <Tile className="chart-tile">
            	<AbandonmentRate />
            </Tile>
          </Column> */}
		  {/* <Column
            max={8}
            xlg={8}
            lg={8}
            md={4}
            sm={4}
            className="content-tile"
          >
            <Tile className="chart-tile">
              <AnalyticAggregation />
            </Tile>
          </Column> */}
        </Grid>
      </div>
    </PageContainer>
  );
};

export default Performance;
