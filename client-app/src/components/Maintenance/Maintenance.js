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
import { Column, Grid, Tile } from "@carbon/react";

// Globals -------------------------------------------------------------------->
import HeaderFilter from "../common/HeaderFilter/HeaderFilter";
import MaintenanceTable from "./MaintenanceTable";
import PageContainer from "../common/PageContainer";
import FrequencyOfUse from "../Monitoring/FrequencyOfUse/FrequencyOfUse";
import Filter from "../common/HeaderFilter/HeaderFilter";

const Maintenance = () => {
  const [selectedDeployment, setSelectedDeployment] = useState(null);
  const [selectedUser, setSelectedUser] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const maintenanceTableRef = useRef();
  const frequencyOfUseRef = useRef();
  useEffect(() => {
    if (maintenanceTableRef.current) {
      maintenanceTableRef.current.sendMessageToServerLog();
    }
    if (frequencyOfUseRef.current) {
      frequencyOfUseRef.current.fetchFrequencyData();
    }
  }, []);

  // Handle filter changes
  const handleFilterChange = (
    selectedItem,
    selectedUser,
    startDate,
    endDate
  ) => {
    setSelectedDeployment(selectedItem);
    setSelectedUser(selectedUser);
    setStartDate(startDate);
    setEndDate(endDate);

    // Send filter data to table and other components
    if (maintenanceTableRef.current) {
      maintenanceTableRef.current.sendMessageToServerLog(
        selectedItem,
        selectedUser,
        startDate,
        endDate
      );
    }
    if (frequencyOfUseRef.current) {
      frequencyOfUseRef.current.fetchFrequencyData(
        selectedItem,
        selectedUser,
        startDate,
        endDate
      );
    }
  };

  return (
    <PageContainer
      className="maintenance-container"
      header={{
        title: "Maintenance",
        subtitle: "Maintenance Graphs",
      }}
    >
      <div className="home-container">
        <Filter onFilterChange={handleFilterChange} />
        <MaintenanceTable
          ref={maintenanceTableRef}
          selectedItem={selectedDeployment}
          selectedUser={selectedUser}
          startDate={startDate}
          endDate={endDate}
        />
        <div className="chart-tile_wrap">
          <Tile className="chart-tile-maintenance">
            <FrequencyOfUse
              ref={frequencyOfUseRef}
              selectedItem={selectedDeployment}
              selectedUser={selectedUser}
              startDate={startDate}
              endDate={endDate}
            />
          </Tile>
        </div>
      </div>
    </PageContainer>
  );
};

export default Maintenance;
