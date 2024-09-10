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
import PageContainer from "../common/PageContainer";

import Transactions from "../Traces/Transactions/Transactions";
import Filter from "../common/HeaderFilter/HeaderFilter";
import AssetReusability from "./AssetReusability/AssetReusability";
import { Column, Grid, Tile } from "@carbon/react";
import LogTable from "./LogTable/LogTable";
import FrequencyOfUse from "./FrequencyOfUse/FrequencyOfUse";
import FrequencyOfUseTable from "./FrequencyOfUseTable/FrequencyOfUseTable";

const Monitoring = () => {
	
  const logTableRef = useRef();
  const frequencyOfUseRef = useRef();

  const [selectedDeployment, setSelectedDeployment] = useState(null);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedTimestampRange, setSelectedTimestampRange] = useState('last7days'); // Default value
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [numberOfDaysSelected, setNumberOfDaysSelected] = useState(null);

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
    
    if (logTableRef.current) {
      logTableRef.current.fetchLogTableData(selectedItem, selectedUser, startDate, endDate);
    }
    if (frequencyOfUseRef.current) {
      frequencyOfUseRef.current.fetchFrequencyData(selectedItem, selectedUser, startDate, endDate);
    }
  };


  useEffect(() => {
    if (logTableRef.current) {
      logTableRef.current.fetchLogTableData();
    }
    if (frequencyOfUseRef.current) {
      frequencyOfUseRef.current.fetchFrequencyData();
    }
  }, []);   


	return(
    <PageContainer
      className="monitoring-container"
      header={{
        title: "Traceability",
        subtitle: "Traceability data",
      }}
    >
      <Filter onFilterChange={handleFilterChange}/>
      <LogTable ref={logTableRef} selectedItem={selectedDeployment} selectedUser={selectedUser} startDate={startDate} endDate={endDate}/>
    </PageContainer>
	);
}

export default Monitoring;