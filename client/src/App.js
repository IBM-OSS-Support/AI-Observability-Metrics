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
import Traces from './components/Traces';
import Metrics from './components/Metrics';

const ROUTES = [
  { path: '/', component: () => <Traces /> },
  { path: '/metrics', component: () => <Metrics /> }
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