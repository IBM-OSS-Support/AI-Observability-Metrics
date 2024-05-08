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

const Maintenance = () => {
	return(
    <PageContainer
      className="monitoring-container"
      header={{
        title: "Maintenance",
        subtitle: "Maintenance data",
      }}
    >
      <Transactions
        component='maintenance'
			/>
    </PageContainer>
	);
}

export default Maintenance;