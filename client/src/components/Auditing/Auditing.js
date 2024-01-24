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

const Auditing = () => {
	console.log('here');
	return(
    <PageContainer
      className="auditing-container"
      header={{
        title: "Auditing",
        subtitle: "Auditing",
      }}
    >
      <Transactions
        showColors
        component='audit'
			/>
    </PageContainer>
	);
}

export default Auditing;