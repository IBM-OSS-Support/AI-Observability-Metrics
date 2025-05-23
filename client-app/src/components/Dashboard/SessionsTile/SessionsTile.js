/* ******************************************************************************
 * IBM Confidential
 *
 * OCO Source Materials
 *
 *  Copyright IBM Corp. 2023  All Rights Reserved.
 *
 * The source code for this program is not published or otherwise divested
 * of its trade secrets, irrespective of what has been deposited with
 * the U.S. Copyright Office.
 ****************************************************************************** */
import React from "react";

// Components ----------------------------------------------------------------->
import { Button, Tile } from "@carbon/react";

const SessionsTile = () => {
  // Render
  return (
    <Tile className="infrastructure-components">
      <div className="infrastructure-components-content">
        <h5>
          Sessions <span className="count">(1)</span>
        </h5>
        <div className="types">
          <Button
            className="type"
            kind="ghost"
            // href={getPath("#/infrastructure-manager", "?type=Engines")}
          >
            <div className="title">
              <div className="indicator engines" />
              <span>Transactions</span>
            </div>
            <h2>2</h2>
          </Button>
          <Button
            className="type"
            kind="ghost"
            // href={getPath("#/infrastructure-manager", "?type=Catalogs")}
          >
            <div className="title">
              <div className="indicator catalogs" />
              <span>Deployment</span>
            </div>
            <h2>5</h2>
          </Button>
          <Button
            className="type"
            kind="ghost"
            // href={getPath("#/infrastructure-manager", "?type=Buckets")}
          >
            <div className="title">
              <div className="indicator buckets" />
              <span>Users</span>
            </div>
            <h2>5</h2>
          </Button>
          {/* <Button
            className="type"
            kind="ghost"
            // href={getPath("#/infrastructure-manager", "?type=Databases")}
          >
            <div className="title">
              <div className="indicator databases" />
              <span>Deployments</span>
            </div>
            <h2>6</h2>
          </Button> */}
        </div>
      </div>
      <Button
        kind="ghost"
        className="bottom-link"
        href="#/sessions"
      >
        <span>Go to sessions</span>
      </Button>
    </Tile>
  );
};

export default SessionsTile;
