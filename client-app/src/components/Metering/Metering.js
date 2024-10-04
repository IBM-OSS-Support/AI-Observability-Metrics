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
import PageContainer from '../common/PageContainer/PageContainer';
import CallCountGraph from "../Performance/CallCountGraph/CallCountGraph";
import TokenCountGraph from "../Performance/TokenCountGraph/TokenCountGraph";
import CostGraph from "./CostGraph/CostGraph";
import HeaderFilter from "../common/HeaderFilter/HeaderFilter";
import AverageToken from "./AverageToken/AverageToken";
import UserSatisfaction from "./UserSatisfaction/UserSatisfaction";
import LatencyGraph from "../Performance/LatencyGraph/LatencyGraph";

const Performance = () => {

  const [selectedDeployment, setSelectedDeployment] = useState(null);
  const [selectedUser, setSelectedUser] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);


  const costGraphRef = useRef();

  const handleFilterChange = (selectedItem, selectedUser, startDate, endDate) => {
    setSelectedDeployment(selectedItem);
    setSelectedUser(selectedUser);
    setStartDate(startDate);
    setEndDate(endDate);
    
    if (costGraphRef.current) {
      costGraphRef.current.sendMessageToServerCost(selectedItem, selectedUser, startDate, endDate);
    }
  };

  useEffect(() => {
    if (costGraphRef.current) {
      costGraphRef.current.sendMessageToServerCost();
    }
  }, []);   


  return (
    <PageContainer
      className="page-container metering-page"
      header={{
        title: "Metering & Billing",
        subtitle: "Metering & Billing graphs",
      }}
    >
      <div className="home-container">
        <HeaderFilter onFilterChange={handleFilterChange}/>
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
              <CostGraph ref={costGraphRef} selectedItem={selectedDeployment} selectedUser={selectedUser} startDate={startDate} endDate={endDate}/>
            </Tile>
          </Column>
        </Grid>
      </div>
    </PageContainer>
  );
}

export default Performance;