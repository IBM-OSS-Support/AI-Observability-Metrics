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
import React, { useState } from "react";

import {
  Tab,
  TabList,
  Tabs,
} from "@carbon/react";
import PageContainer from "../common/PageContainer";

import Anomalies from "./Anomalies";
import Errors from "./Errors";
import AllSessions from "./AllSessions";

function Sessions() {
  const [tab, setTab] = useState(0);

  let content;
  switch (tab) {
    case 0:
      content = <AllSessions />;
      break;
    case 1:
      content = <Errors />;
      break;
    case 2:
      content = <Anomalies />;
      break;
    default: break;
  }

  return (
    <PageContainer
      className="sessions-container"
      header={{
        title: "Sessions",
        subtitle: "All sessions details here",
        navigation: (
          <Tabs
            selectedIndex={tab}
            onChange={({ selectedIndex }) => {
              setTab(selectedIndex);
            }}
          >
            <TabList aria-label="List of tabs">
              <Tab>All</Tab>
              <Tab>Errors</Tab>
              <Tab>Anomalies</Tab>
            </TabList>
          </Tabs>
        )
      }}
    >
      {content}
    </PageContainer>
  );
}

export default Sessions;
