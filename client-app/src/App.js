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
import React, { useEffect, useState } from 'react';
import {
  Routes,
  Route
} from 'react-router-dom';

// Styles --------------------------------------------------------------------->
import '@carbon/ibm-products/css/index.min.css';
import './App.scss';

// Components ----------------------------------------------------------------->
import Performance from './components/Performance';

import Auditing from './components/Auditing';
import Dashboard from './components/Dashboard';
import Metrics from './components/Metrics';
import Monitoring from './components/Monitoring';
import Navigation from './components/Navigation';

import Sessions from './components/Sessions';
import TraceAnalysis from './components/TraceAnalysis';
import Traces from './components/Traces';
import Metering from './components/Metering';
import CveWorkflows from './components/CveWorkflows';
import Maintenance from './components/Maintenance';

// Utils ----------------------------------------------------------------------->
/*
import { fetchAppData } from './appData';
import { getMetricsData } from './utils/metrics-utils';
import { useStoreContext } from './store';
*/


const ROUTES = [
  { path: '/', component: () => <Dashboard /> },
  { path: '/auditing', component: () => <Auditing /> },
  { path: '/metrics', component: () => <Metrics /> },
  { path: '/traceability', component: () => <Monitoring /> },
  { path: '/maintenance', component: () => <Maintenance /> },
  { path: '/performance', component: () => <Performance /> },
  { path: '/metering', component: () => <Metering /> },
  { path: '/sessions', component: () => <Sessions /> },
  { path: '/trace-analysis/:appName', component: () => <TraceAnalysis /> },
  { path: '/traces', component: () => <Traces /> },
  { path: '/cve', component: () => <CveWorkflows /> },
  { path: '/performance', component: () => <Performance /> }
];

function App() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8080');

    socket.onopen = () => {
      console.log('Connected to WebSocket server');
      //socket.send('getData');
    };

    /*socket.onmessage = (event) => {
      const newData = JSON.parse(event.data);
      setData(newData);
    };*/

    return () => {
      socket.close();
    };
  }, []);
  /*
  return (
    <div>
      <h1>Data from PostgreSQL Database</h1>
      <ul>
        {data.map((item, index) => (
          <li key={index}>{JSON.stringify(item)}</li>
        ))}
      </ul>
    </div>
  );*/
  return (
    <div className="App">
      <Navigation />
      <Routes>
        {ROUTES.map(({ path, component: Component }) =>
          <Route
            key={path}
            path={path}
            element={<Component />}
          />
        )}
      </Routes>
    </div>
  );
}

/*
function App() {
  const { state, setStore } = useStoreContext();

  useEffect(() => {
    fetchAppData(setStore);
  }, []);

  useEffect(() => {
    if (state.status === 'success') {
      const metricsData = getMetricsData();
      console.log('metricsData', metricsData);

      setStore('metrics', metricsData);
    }
  }, [state.status])

  return (
    <div className="App">
      <Navigation />
      <Routes>
        {ROUTES.map(({ path, component: Component }) =>
          <Route
            key={path}
            path={path}
            element={<Component />}
          />
        )}
      </Routes>
    </div>
  );
}
*/
export default App;
