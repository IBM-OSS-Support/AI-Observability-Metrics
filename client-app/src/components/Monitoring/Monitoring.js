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
import React, { useEffect, useRef } from "react";
import PageContainer from "../common/PageContainer";

import Transactions from "../Traces/Transactions/Transactions";
import Filter from "../common/HeaderFilter/HeaderFilter";
import AssetReusability from "./AssetReusability/AssetReusability";
import { Column, Grid, Tile } from "@carbon/react";
import LogTable from "./LogTable/LogTable";
import FrequencyOfUse from "./FrequencyOfUse/FrequencyOfUse";
import FrequencyOfUseTable from "./FrequencyOfUseTable/FrequencyOfUseTable";

const Monitoring = () => {
	
  const logTableRef = useRef();
  const frequencyOfUseRef = useRef();

  useEffect(() => {
    if (logTableRef.current) {
      logTableRef.current.sendMessageToServerLogTable();
    }
    if (frequencyOfUseRef.current) {
      frequencyOfUseRef.current.sendMessageToServerFrequency();
    }
  }, []);   


	return(
    <PageContainer
      className="monitoring-container"
      header={{
        title: "Traceability",
        subtitle: "Traceability data",
      }}
    >
      <Filter />
      <Transactions
        component='monitor'
			/>
      <LogTable ref={logTableRef}/>
      <Grid fullWidth narrow id="body" className="page-content body">
        <Column max={8} xlg={8} lg={8} md={4} sm={4} className="content-tile">
    <Tile className="chart-tile">
      <AssetReusability />
    </Tile>
        </Column>
        <Column max={8} xlg={8} lg={8} md={4} sm={4} className="content-tile">
    <Tile className="chart-tile">
      <FrequencyOfUse ref={frequencyOfUseRef}/>
    </Tile>
        </Column>
        {/* <Column max={16} xlg={16} lg={16} md={4} sm={4} className="content-tile">
    <Tile className="chart-tile">
      <FrequencyOfUseTable />
    </Tile>
        </Column> */}
      </Grid>
    </PageContainer>
	);
}

export default Monitoring;