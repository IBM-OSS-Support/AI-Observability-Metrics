import React, { useEffect, useRef } from "react";
import {
  Accordion,
  AccordionItem,
  Column,
  Grid,
  Tile,
} from "@carbon/react";

// Globals -------------------------------------------------------------------->
import PageContainer from "../common/PageContainer/PageContainer";
import ErrorRate from "../Performance/ErrorRate/ErrorRate";
import AbandonmentRate from "../Performance/AbandonmentRate/AbandonmentRate";
import Filter from "../common/HeaderFilter/HeaderFilter";
import AdoptionRate from "./AdoptionRate/AdoptionRate";
import SafetyScoreTable from "./SafetyScoreTable/SafetyScoreTable";
import SuccessRate from "../Performance/SuccessRate/SuccessRate";
import FailureRate from "../Performance/FailureRate/FailureRate";
import UserSatisfaction from "../Metering/UserSatisfaction/UserSatisfaction";

const Auditing = () => {
  const safetyScoreTableRef = useRef();
  const adoptionRateRef = useRef();
  const userSatisfactionRef = useRef();
  const abandonmentRateRef = useRef();
  const failureRateRef = useRef();
  const successRateRef = useRef();

  useEffect(() => {
    if (safetyScoreTableRef.current) {
      safetyScoreTableRef.current.sendMessageToServer();
    }
    if (adoptionRateRef.current) {
      adoptionRateRef.current.sendMessageToServerAdoption();
    }
    if (userSatisfactionRef.current) {
      userSatisfactionRef.current.sendMessageToServerUser();
    }
    if (abandonmentRateRef.current) {
      abandonmentRateRef.current.sendMessageToServerAbandonment();
    }
    if (failureRateRef.current) {
      failureRateRef.current.sendMessageToServerFailure();
    }
    if (successRateRef.current) {
      successRateRef.current.sendMessageToServerSuccess();
    }
  }, []); // Empty dependency array ensures this runs on mount and reload

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
              <Column max={4} xlg={4} lg={4} md={4} sm={4} className="content-tile">
                <AbandonmentRate ref={abandonmentRateRef} />
              </Column>
              <Column max={4} xlg={4} lg={4} md={4} sm={4} className="content-tile">
                <SuccessRate ref={successRateRef}/>
              </Column>
              <Column max={4} xlg={4} lg={4} md={4} sm={4} className="content-tile">
                <FailureRate ref={failureRateRef}/>
              </Column>
            </Grid>
          </AccordionItem>
        </Accordion>
        <Grid fullWidth narrow id="body" className="page-content body">
          <Column max={8} xlg={8} lg={8} md={4} sm={4} className="content-tile">
            <AdoptionRate ref={adoptionRateRef} />
          </Column>
          <Column max={8} xlg={8} lg={8} md={4} sm={4} className="content-tile">
            <Tile className="chart-tile">
              <UserSatisfaction ref={userSatisfactionRef} />
            </Tile>
          </Column>
          <Column max={16} xlg={16} lg={16} md={4} sm={4} className="content-tile">
            <Tile className="chart-tile">
              <SafetyScoreTable ref={safetyScoreTableRef} />
            </Tile>
          </Column>
        </Grid>
      </div>
    </PageContainer>
  );
};

export default Auditing;
