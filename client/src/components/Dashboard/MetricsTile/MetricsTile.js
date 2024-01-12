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

import graphImg from "../media/financial--gain.png";

const MetricsTile = () => {
  // Render
  return (
    <Tile className="infrastructure-components">
      <div className="infrastructure-components-content">
        <h5>Metrics</h5>
        <div className="types margin-1">
          All metrics around the GenAI tasks can be visualized here.
          <div className="graph-img">
            <img alt="graph" src={graphImg} />
          </div>
        </div>
      </div>
      <Button
        kind="ghost"
        className="bottom-link"
        href="#/metrics"
      >
        <span>Go to metrics</span>
      </Button>
    </Tile>
  );
};

export default MetricsTile;
