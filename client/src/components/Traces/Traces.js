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

import {
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@carbon/react";
import PageContainer from "../common/PageContainer";

import Anomalies from "./Anomalies";
import Errors from "./Errors";
import Generations from "./Generations";
import Operations from "./Operations";
import Transactions from "./Transactions";

function Traces() {
  return (
    <PageContainer
      className="query-workspace-container"
      header={{
        title: "Traces",
        subtitle: "Traces for your data.",
      }}
    >
      <Tabs>
        <TabList aria-label="List of tabs">
          <Tab>Transactions</Tab>
          <Tab>Generations</Tab>
          <Tab>Operations</Tab>
          <Tab>Errors</Tab>
          <Tab>Anomalies</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Transactions />
          </TabPanel>
          <TabPanel>
            <Generations />
          </TabPanel>
          <TabPanel>
            <Operations />
          </TabPanel>
          <TabPanel>
            <Errors />
          </TabPanel>
          <TabPanel>
            <Anomalies />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </PageContainer>
  );
}

export default Traces;
