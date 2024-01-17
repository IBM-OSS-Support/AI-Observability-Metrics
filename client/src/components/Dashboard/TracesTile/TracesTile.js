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
import React, { useEffect, useState } from "react";
import moment from "moment";

// Components ----------------------------------------------------------------->
import { Button, Tile } from "@carbon/react";
import { getAppData } from "../../../appData";
import { useStoreContext } from "../../../store";
import { formatCount } from "../../../utils/data-utils";

const defaultData = {
  apps: 0,
  avgLatency: 0,
  users: 0,
  operations: 0,
  models: 0
}

const TracesTile = () => {

  const [ data, setData ] = useState(defaultData);
  const { state } = useStoreContext();

  useEffect(() => {
    if (state.status === 'success'){
      const appData = getAppData();
      const _data = appData.map(({ data: app }) => {
        const appName = app['application-name'];
        const operations = app.spans.length;
        const rootSpanId = app.spans?.[0]?.context?.root_span_id;
        const root = app.spans.find(span => span.span_id === rootSpanId);
        const startUs = Number(root.start_us) / 1000;
        const endUs = Number(root.end_us) / 1000;
        const latency = endUs - startUs;
        // const latency = moment.duration(endUs - startUs).asSeconds();
        const users = app.spans.map(({tags}) => {
            return tags.find(tag => tag.key === 'user').value
          });
        const models = app.spans.filter(({params}) => !!params && params.length && params.some(p => p.name === 'model'))
          .map(({params}) => {
            return params.find(param => param.name === 'model').value
          });
        
        return {
          operations,
          latency,
          appName,
          models,
          users
        }
      });

      const newData = {
        apps: _data.length,
        avgLatency: _data.reduce((sum, {latency}) => sum + latency, 0) / _data.length,
        users: new Set(_data.reduce((arr, {users}) => arr.concat(users), [])).size,
        operations: _data.reduce((sum, {operations}) => sum + operations, 0),
        models: new Set(_data.reduce((arr, {models}) => arr.concat(models), [])).size
      };

      setData(newData);
    } else {
      setData(defaultData);
    }
  }, [state.status])

  // Render
  return (
    <Tile className="infrastructure-components">
      <div className="infrastructure-components-content">
        <h5>
          AI applications <span className="count">({data.apps})</span>
        </h5>
        <div className="types">
          <Button
            className="type"
            kind="ghost"
            // href={getPath("#/infrastructure-manager", "?type=Engines")}
          >
            <div className="title">
              <div className="indicator engines" />
              <span>Average latency</span>
            </div>
            <h2>{moment.duration(data.avgLatency).asSeconds().toFixed(1)} s</h2>
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
            <h2>{formatCount(data.users)}</h2>
          </Button>
          <Button
            className="type"
            kind="ghost"
            // href={getPath("#/infrastructure-manager", "?type=Catalogs")}
          >
            <div className="title">
              <div className="indicator catalogs" />
              <span>Total operations</span>
            </div>
            <h2>{formatCount(data.operations)}</h2>
          </Button>
          <Button
            className="type"
            kind="ghost"
            // href={getPath("#/infrastructure-manager", "?type=Databases")}
          >
            <div className="title">
              <div className="indicator databases" />
              <span>Models used </span>
            </div>
            <h2>{formatCount(data.models)}</h2>
          </Button>
        </div>
      </div>
      <Button kind="ghost" className="bottom-link" href="#/traces">
        <span>Go to AI applications</span>
      </Button>
    </Tile>
  );
};

export default TracesTile;
