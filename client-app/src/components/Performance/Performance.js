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

const Performance = () => {
  const [selectedItem, setSelectedDeployment] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedTimestampRange, setSelectedTimestampRange] = useState(null); // Default value

  const tokenPerSessionRef = useRef();
  const cpuUsageRef = useRef();
  const callCountRef = useRef();
  const latencyRef = useRef();


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
      latencyRef.current.sendMessageToServerLatency();
    }
  }, []); 

  const handleFilterChange = (selectedItem, selectedUser, selectedTimestampRange) => {
    setSelectedDeployment(selectedItem);
    setSelectedUser(selectedUser);
    setSelectedTimestampRange(selectedTimestampRange);
    console.log('Selected Deployment:', selectedItem);
    console.log('Selected User:', selectedUser);
    console.log('Selected Timestamp Range:', selectedTimestampRange);

    if (cpuUsageRef.current) {
      cpuUsageRef.current.sendMessageToServerCPU(selectedItem, selectedUser, selectedTimestampRange);
    }
    if (callCountRef.current) {
      callCountRef.current.sendMessageToServerCallCount(selectedItem, selectedUser, selectedTimestampRange);
    }
    // if (callCountRef.current) {
    //   callCountRef.current.sendMessageToServerCallCount(selectedItem, selectedUser, selectedTimestampRange);
    // }
    if (tokenPerSessionRef.current) {
      tokenPerSessionRef.current.sendMessageToServerToken(selectedItem, selectedUser, selectedTimestampRange);
    }
    if (latencyRef.current) {
      latencyRef.current.sendMessageToServerLatency(selectedItem, selectedUser, selectedTimestampRange);
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
            <TokenPerSession1 ref={tokenPerSessionRef} selectedTimestampRange={selectedTimestampRange} />
          </Column>
          </Grid>
      </AccordionItem>
    </Accordion>
        <Grid fullWidth narrow id="body" className="page-content body">
          <Column max={8} xlg={8} lg={8} md={4} sm={4} className="content-tile">
            <CpuUsage ref={cpuUsageRef} selectedTimestampRange={selectedTimestampRange} />
          </Column>
          <Column max={8} xlg={8} lg={8} md={4} sm={4} className="content-tile">
          <Tile className="chart-tile">
            <CallCountGraph ref={callCountRef} selectedTimestampRange={selectedTimestampRange} />
          </Tile>
          </Column>
          <Column max={16} xlg={16} lg={16} md={4} sm={4} className="content-tile">
            <Tile className="chart-tile">
              <LatencyGraph ref={latencyRef} selectedTimestampRange={selectedTimestampRange} />
            </Tile>
          </Column>
          
        </Grid>
      </div>
    </PageContainer>
  );
};

export default Performance;
