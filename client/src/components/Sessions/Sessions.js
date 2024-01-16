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
import AllSessions from "./AllSessions";

function Sessions() {
  return (
    <PageContainer
      className="sessions-container"
      header={{
        title: "Sessions",
        subtitle: "All sessions details here",
      }}
    >
      <Tabs>
        <TabList aria-label="List of tabs">
          <Tab>All</Tab>
          <Tab disabled>Errors</Tab>
          <Tab disabled>Anomalies</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <AllSessions />
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

export default Sessions;
