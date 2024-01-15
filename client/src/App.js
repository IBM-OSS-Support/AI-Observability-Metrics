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
import React from 'react';
import {
  Routes,
  Route
} from 'react-router-dom';

import Navigation from './components/Navigation';

// Styles --------------------------------------------------------------------->
import '@carbon/ibm-products/css/index.min.css';
import './App.scss';
import Dashboard from './components/Dashboard';
import Traces from './components/Traces';
import Metrics from './components/Metrics';
import TraceAnalysis from './components/TraceAnalysis';
import Sessions from './components/Sessions';

const ROUTES = [
  { path: '/', component: () => <Dashboard /> },
  { path: '/traces', component: () => <Traces /> },
  { path: '/sessions', component: () => <Sessions /> },
  { path: '/metrics', component: () => <Metrics /> },
  { path: '/trace-analysis/:id', component: () => <TraceAnalysis /> },
];

function App() {
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

export default App;
