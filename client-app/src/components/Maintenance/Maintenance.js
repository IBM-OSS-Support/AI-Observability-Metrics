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
import React, { useEffect, useRef } from "react";
import { Column, Grid, Tile } from "@carbon/react";

// Globals -------------------------------------------------------------------->
import HeaderFilter from "../common/HeaderFilter/HeaderFilter";
import MaintenanceTable from "./MaintenanceTable";
import PageContainer from "../common/PageContainer";
import FrequencyOfUse from "../Monitoring/FrequencyOfUse/FrequencyOfUse";

const Maintenance = () => {
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

  return (
    <PageContainer
      className="maintenance-container"
      header={{
        title: "Maintenance",
        subtitle: "Maintenance Graphs",
      }}
    >
      <div className="home-container">
        
        <MaintenanceTable ref={maintenanceTableRef} />
        <div className="chart-tile_wrap">
          <Tile className="chart-tile-maintenance">
            <FrequencyOfUse ref={frequencyOfUseRef} />
          </Tile>
        </div>
      </div>
    </PageContainer>
  );
};

export default Maintenance;
