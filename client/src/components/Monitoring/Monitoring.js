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
import PageContainer from "../common/PageContainer";

import Transactions from "../Traces/Transactions/Transactions";
import Filter from "../common/HeaderFilter/HeaderFilter";
import AssetReusability from "./AssetReusability/AssetReusability";
import { Tile } from "@carbon/react";
import LogTable from "./LogTable/LogTable";

const Monitoring = () => {
	console.log('here');
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
      <LogTable/>
    <Tile className="chart-tile">
      <AssetReusability />
    </Tile>
    </PageContainer>
	);
}

export default Monitoring;