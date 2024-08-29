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
import React, { useEffect, useRef, useState } from "react";
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
  const [selectedDeployment, setSelectedDeployment] = useState(null);
  const [selectedUser, setSelectedUser] = useState('all');
  const [selectedTimestampRange, setSelectedTimestampRange] = useState('last7days'); // Default value
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [numberOfDaysSelected, setNumberOfDaysSelected] = useState(null);

  const safetyScoreTableRef = useRef();
  const adoptionRateRef = useRef();
  const userSatisfactionRef = useRef();
  const abandonmentRateRef = useRef();
  const failureRateRef = useRef();
  const successRateRef = useRef();

  const handleFilterChange = (selectedItem, selectedUser, selectedTimestampRange, startDate, endDate, numberOfDaysSelected) => {
    setSelectedDeployment(selectedItem);
    setSelectedUser(selectedUser);
    setSelectedTimestampRange(selectedTimestampRange);
    setStartDate(startDate);
    setEndDate(endDate);
    setNumberOfDaysSelected(numberOfDaysSelected);
    console.log('Selected Deployment:', selectedItem);
    console.log('Selected User:', selectedUser);
    console.log('Selected Timestamp Range:', selectedTimestampRange);
    console.log('Selected startDate:', startDate);
    console.log('Selected endDate:', endDate);
    console.log('Selected numberOfDaysSelected:', numberOfDaysSelected);
    
    if (safetyScoreTableRef.current) {
      safetyScoreTableRef.current.sendMessageToServer(selectedItem, selectedUser, selectedTimestampRange, startDate, endDate);
    }
    if (adoptionRateRef.current) {
      adoptionRateRef.current.sendMessageToServerAdoption(selectedItem, selectedUser, selectedTimestampRange, startDate, endDate);
    }
    if (userSatisfactionRef.current) {
      userSatisfactionRef.current.sendMessageToServerUser(selectedItem, selectedUser, selectedTimestampRange, startDate, endDate);
    }
    if (abandonmentRateRef.current) {
      abandonmentRateRef.current.sendMessageToServerAbandonment(selectedItem, selectedUser, selectedTimestampRange, startDate, endDate);
    }
    if (failureRateRef.current) {
      failureRateRef.current.sendMessageToServerFailure(selectedItem, selectedUser, selectedTimestampRange, startDate, endDate);
    }
    if (successRateRef.current) {
      successRateRef.current.sendMessageToServerSuccess(selectedItem, selectedUser, selectedTimestampRange, startDate, endDate);
    }
  };

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
        <Filter onFilterChange={handleFilterChange} />
        <Accordion align="start">
          <AccordionItem title="Error Rate" open={false}>
            <Grid fullWidth narrow id="body" className="page-content body">
              <Column max={4} xlg={4} lg={4} md={4} sm={4} className="content-tile">
                <AbandonmentRate ref={abandonmentRateRef} selectedItem={selectedDeployment} selectedUser={selectedUser} startDate={startDate} endDate={endDate} />
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
            <AdoptionRate ref={adoptionRateRef} selectedItem={selectedDeployment} selectedUser={selectedUser} startDate={startDate} endDate={endDate} />
          </Column>
          <Column max={8} xlg={8} lg={8} md={4} sm={4} className="content-tile">
            <Tile className="chart-tile">
              <UserSatisfaction ref={userSatisfactionRef} startDate={startDate} endDate={endDate} selectedUser={selectedUser} selectedItem={selectedDeployment}/>
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