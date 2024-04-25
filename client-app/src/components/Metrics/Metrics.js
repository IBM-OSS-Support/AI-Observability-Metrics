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
import Performance from "./Performance";

function Metrics() {
  const [tab, setTab] = useState(0);

  let content;
  switch(tab) {
    case 0:
      content = <Performance />;
      break;
    default: break;
  }

  return (
    <PageContainer
      className='metrics-container'
      header={{
        title: "Metrics",
        subtitle: "Metrics based on your data.",
        navigation: (
          <Tabs
            selectedIndex={tab}
            onChange={({ selectedIndex }) => { setTab(selectedIndex) }}
          >
            <TabList aria-label="List of tabs">
              <Tab>Performance</Tab>
              <Tab disabled>Data</Tab>
              <Tab disabled>System</Tab>
              <Tab disabled>Cost</Tab>
            </TabList>
          </Tabs>
        )
      }}
    >
      {content}
    </PageContainer>
  );
}

export default Metrics;
