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
import { Accordion, AccordionItem, Column, Content, Dropdown, Grid, Tile } from "@carbon/react";

// Globals -------------------------------------------------------------------->
import CpuUsage from "./CpuUsage/CpuUsage";
import CallCountGraph from "./CallCountGraph/CallCountGraph";
import LatencyGraph from "./LatencyGraph/LatencyGraph";
import TokenCountGraph from "./TokenCountGraph/TokenCountGraph";
import MemoryTile from "./MemoryTile/MemoryTile";
import PageContainer from "../common/PageContainer/PageContainer";
import ErrorRate from "./ErrorRate/ErrorRate";
import AbandonmentRate from "./AbandonmentRate/AbandonmentRate";
import { GaugeChart } from "@carbon/charts-react";
import SessionLength from "./SessionLength/SessionLength";
import RequestsPerSession from "./RequestsPerSession/RequestsPerSession";
import Filter from "../common/HeaderFilter/HeaderFilter";
import AnalyticAggregation from "./AnalyticAggregation/AnalyticAggregation";
import PolicyDiagram from "./PolicyDiagram/PolicyDiagram";
import TokenPerSession from "./TokenPerSession/TokenPerSession";
import SuccessRate from "./SuccessRate/SuccessRate";
import FailureRate from "./FailureRate/FailureRate";
import TokenPerSession1 from "./TokenPerSession/TokenPerSession1";
import Accuracy from "./Accuracy/Accuracy";

const Performance = () => {
  const [selectedDeployment, setSelectedDeployment] = useState(null);
  const [selectedUser, setSelectedUser] = useState('all');
  const [selectedTimestampRange, setSelectedTimestampRange] = useState('last7days'); // Default value
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [numberOfDaysSelected, setNumberOfDaysSelected] = useState(null);

  const tokenPerSessionRef = useRef();
  const cpuUsageRef = useRef();
  const callCountRef = useRef();
  const latencyRef = useRef();
  const accuracyRef = useRef();


  useEffect(() => {
    if (tokenPerSessionRef.current) {
      tokenPerSessionRef.current.sendMessageToServerToken();
    }
    if (cpuUsageRef.current) {
      cpuUsageRef.current.sendMessageToServerCPU();
    }
    if (callCountRef.current) {
      callCountRef.current.sendMessageToServerCallCount();
    }
    if (latencyRef.current) {
      latencyRef.current.fetchLatencyData();
    }
    if (accuracyRef.current) {
      accuracyRef.current.fetchAccuracyData();
    }
  }, []); 

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

    if (cpuUsageRef.current) {
      cpuUsageRef.current.sendMessageToServerCPU(selectedItem, selectedUser, selectedTimestampRange);
    }
    if (callCountRef.current) {
      callCountRef.current.sendMessageToServerCallCount(selectedItem, selectedUser, selectedTimestampRange, startDate, endDate);
    }
    if (tokenPerSessionRef.current) {
      tokenPerSessionRef.current.sendMessageToServerToken(selectedItem, selectedUser, selectedTimestampRange);
    }
    if (latencyRef.current) {
      latencyRef.current.fetchLatencyData(selectedItem, selectedUser, selectedTimestampRange, startDate, endDate);
    }
    if (accuracyRef.current) {
      accuracyRef.current.fetchAccuracyData(selectedItem, selectedUser, startDate, endDate);
    }
  };

  return (
    <PageContainer
      className="page-container performance-page"
      header={{
        title: "Performance",
        subtitle: "Performance graphs",
      }}
    >
    <div className="home-container">
      <Filter onFilterChange={handleFilterChange} />
      <Accordion align="start">
        <AccordionItem title="Session Characteristics" open={false}>
          <Grid fullWidth narrow id="body" className="page-content body">
            <Column max={16} xlg={16} lg={16} md={4} sm={4} className="content-tile">
              <TokenPerSession1 ref={tokenPerSessionRef} selectedItem={selectedDeployment} selectedUser={selectedUser} startDate={startDate} endDate={endDate} />
            </Column>
            </Grid>
        </AccordionItem>
      </Accordion>
        <Grid fullWidth narrow id="body" className="page-content body">
          <Column max={8} xlg={8} lg={8} md={4} sm={4} className="content-tile">
            <CpuUsage ref={cpuUsageRef} selectedItem={selectedDeployment} selectedUser={selectedUser} />
          </Column>
          <Column max={8} xlg={8} lg={8} md={4} sm={4} className="content-tile">
          <Tile className="chart-tile">
            <CallCountGraph ref={callCountRef} selectedItem={selectedDeployment} selectedUser={selectedUser} startDate={startDate} endDate={endDate} />
          </Tile>
          </Column>
          <Column max={8} xlg={8} lg={8} md={4} sm={4} className="content-tile">
            <Tile className="chart-tile">
              <LatencyGraph ref={latencyRef} selectedItem={selectedDeployment} selectedUser={selectedUser} startDate={startDate} endDate={endDate} />
            </Tile>
          </Column>
          <Column max={8} xlg={8} lg={8} md={4} sm={4} className="content-tile">
            <Tile className="chart-tile">
              <Accuracy ref={accuracyRef} startDate={startDate} endDate={endDate} selectedUser={selectedUser} selectedItem={selectedDeployment}/>
            </Tile>
          </Column>
          
        </Grid>
      </div>
    </PageContainer>
  );
};

export default Performance;
