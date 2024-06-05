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
import { Column, Grid, Tile } from "@carbon/react";

// Globals -------------------------------------------------------------------->
import PageContainer from '../common/PageContainer/PageContainer';
import CallCountGraph from "../Performance/CallCountGraph/CallCountGraph";
import TokenCountGraph from "../Performance/TokenCountGraph/TokenCountGraph";
import CostGraph from "./CostGraph/CostGraph";
import LatencyGraph from "../Metrics/Performance/LatencyGraph";
import HeaderFilter from "../common/HeaderFilter/HeaderFilter";
import AverageToken from "./AverageToken/AverageToken";

const Performance = () => {
  return (
    <PageContainer
      className="page-container metering-page"
      header={{
        title: "Metering & Billing",
        subtitle: "Metering & Billing graphs",
      }}
    >
      <div className="home-container">
        <HeaderFilter />
        <Grid fullWidth narrow id="body" className="page-content body">
          <Column
            max={8}
            xlg={8}
            lg={8}
            md={8}
            sm={4}
            className="content-tile"
          >
            <Tile className="chart-tile">
              <CostGraph />
            </Tile>
          </Column>
          <Column max={8} xlg={8} lg={8} md={8} sm={4} className="content-tile">
						<AverageToken />
					</Column>
          <Column
            max={8}
            xlg={8}
            lg={8}
            md={8}
            sm={4}
            className="content-tile"
          >
            <Tile className="chart-tile">
              <CallCountGraph />
            </Tile>
          </Column>
          <Column
            max={8}
            xlg={8}
            lg={8}
            md={8}
            sm={4}
            className="content-tile"
          >
            <Tile className="chart-tile">
              <TokenCountGraph />
            </Tile>
          </Column>
          <Column
            max={16}
            xlg={16}
            lg={16}
            md={8}
            sm={4}
            className="content-tile"
          >
            <Tile className="chart-tile">
              <LatencyGraph />
            </Tile>
          </Column>
        </Grid>
      </div>
    </PageContainer>
  );
}

export default Performance;
