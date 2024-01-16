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

import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@carbon/react";
import PageContainer from "../common/PageContainer";

import Anomalies from "./Anomalies";
import Errors from "./Errors";
import Generations from "./Generations";
import Operations from "./Operations";
import Transactions from "./Transactions";

function Traces() {
  const [tab, setTab] = useState(0);

  let content;
  switch (tab) {
    case 0:
      content = <Transactions />;
      break;
    case 1:
      content = <Generations />;
      break;
    case 2:
      content = <Operations />;
      break;
    case 3:
      content = <Errors />;
      break;
    case 4:
      content = <Anomalies />;
      break;
    default: break;
  }

  return (
    <PageContainer
      className="traces-container"
      header={{
        title: "AI applications",
        subtitle: "Traces information from your AI applications.",
        navigation: (
          <Tabs
            selectedIndex={tab}
            onChange={({ selectedIndex }) => {
              setTab(selectedIndex);
            }}
          >
            <TabList aria-label="List of tabs">
              <Tab>Transactions</Tab>
              <Tab>Generations</Tab>
              <Tab>Operations</Tab>
              <Tab>Errors</Tab>
              <Tab>Anomalies</Tab>
            </TabList>
          </Tabs>
        ),
      }}
    >
      {content}
    </PageContainer>
  );
}

export default Traces;
