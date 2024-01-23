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
        <Grid fullWidth narrow id="body" className="page-content body">
          <Column
            max={16}
            xlg={16}
            lg={16}
            md={8}
            sm={4}
            className="content-tile"
          >
            <Tile className="chart-tile">
              <CallCountGraph />
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
              <TokenCountGraph />
            </Tile>
          </Column>
          {/*
          <Column
            max={16}
            xlg={16}
            lg={16}
            md={8}
            sm={4}
            className="content-tile"
          >
            <Tile className="chart-tile">
            </Tile>
          </Column>
          */}
        </Grid>
      </div>
    </PageContainer>
  );
}

export default Performance;
