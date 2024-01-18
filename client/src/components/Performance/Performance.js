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
import React, { useEffect } from "react";
import { Column, Content, Grid, Tile } from "@carbon/react";

// Globals -------------------------------------------------------------------->
import CpuUsage from "./CpuUsage/CpuUsage";
import CallCountGraph from "./CallCountGraph/CallCountGraph";
import LatencyGraph from "./LatencyGraph/LatencyGraph";
import TokenCountGraph from "./TokenCountGraph/TokenCountGraph";
import MemoryTile from "./MemoryTile/MemoryTile";
import PageContainer from '../common/PageContainer/PageContainer';

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
			<Grid fullWidth narrow id="body" className="page-content body">
				<Column
						max={8}
						xlg={8}
						lg={8}
						md={4}
						sm={4}
						className="content-tile"
				>
					<CpuUsage />
				</Column>
				<Column
						max={8}
						xlg={8}
						lg={8}
						md={4}
						sm={4}
						className="content-tile"
				>
					<MemoryTile />
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
            <LatencyGraph />
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
			</Grid>
			</div>
		</PageContainer>
  );
}

export default Performance;
