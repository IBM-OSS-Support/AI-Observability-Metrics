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

const Maintenance = () => {

  const maintenanceTableRef = useRef();

  useEffect(() => {
    if (maintenanceTableRef.current) {
      maintenanceTableRef.current.sendMessageToServerLog();
    }
  }, []);   


  return (
    <PageContainer
      className="monitoring-container"
      header={{
        title: "Maintenance",
        subtitle: "Maintenance Graphs",
      }}
    >
      <div className="home-container">
        <HeaderFilter />
        <Grid fullWidth narrow id="body" className="page-content body">
          <Column
            max={16}
            xlg={16}
            lg={16}
            md={8}
            sm={4}
            className="content-tile"
          >
            <Tile className="chart-tile">
              <MaintenanceTable ref={maintenanceTableRef}/>
            </Tile>
          </Column>
          
        </Grid>
      </div>
    </PageContainer>
  );
}

export default Maintenance;