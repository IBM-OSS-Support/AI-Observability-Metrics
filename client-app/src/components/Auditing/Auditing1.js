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
import {
  Accordion,
  AccordionItem,
  Column,
  Content,
  Dropdown,
  Grid,
  Tile,
} from "@carbon/react";

// Globals -------------------------------------------------------------------->

import PageContainer from "../common/PageContainer/PageContainer";
import ErrorRate from "../Performance/ErrorRate/ErrorRate";
import AbandonmentRate from "../Performance/AbandonmentRate/AbandonmentRate";
import Filter from "../common/HeaderFilter/HeaderFilter";
import AdoptionRate from "./AdoptionRate/AdoptionRate";
import Transactions from "../Traces/Transactions";
import AuditingTable from "./AuditingTable/AuditingTable";
import SafetyScoreTable from "./SafetyScoreTable/SafetyScoreTable";
import LogHistoryTable from "./LogHistoryTable/LogHistoryTable";
import SuccessRate from "../Performance/SuccessRate/SuccessRate";
import FailureRate from "../Performance/FailureRate/FailureRate";
import UserSatisfaction from "../Metering/UserSatisfaction/UserSatisfaction";

const Auditing = () => {
  return (
    <PageContainer
      className="auditing-container"
      header={{
        title: "Auditing",
        subtitle: "Policies",
      }}
    >
      <div className="home-container">
        <Filter />
        <Accordion align="start">
          <AccordionItem title="Error Rate" open={false}>
            <Grid fullWidth narrow id="body" className="page-content body">
              <Column
                max={4}
                xlg={4}
                lg={4}
                md={4}
                sm={4}
                className="content-tile"
              >
                <AbandonmentRate />
              </Column>
              <Column
                max={4}
                xlg={4}
                lg={4}
                md={4}
                sm={4}
                className="content-tile"
              >
                <SuccessRate />
              </Column>
              <Column
                max={4}
                xlg={4}
                lg={4}
                md={4}
                sm={4}
                className="content-tile"
              >
                <FailureRate />
              </Column>
            </Grid>
          </AccordionItem>
        </Accordion>
        <Grid fullWidth narrow id="body" className="page-content body">
          <Column max={8} xlg={8} lg={8} md={4} sm={4} className="content-tile">
            <AdoptionRate />
          </Column>
          <Column max={8} xlg={8} lg={8} md={4} sm={4} className="content-tile">
            <Tile className="chart-tile">
              <UserSatisfaction />
            </Tile>
          </Column>
          <Column
            max={16}
            xlg={16}
            lg={16}
            md={4}
            sm={4}
            className="content-tile"
          >
            <Tile className="chart-tile">
              <SafetyScoreTable />
            </Tile>
          </Column>
        </Grid>
      </div>
    </PageContainer>
  );
};

export default Auditing;
