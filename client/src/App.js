import React from 'react';
import {
  Routes,
  Route
} from 'react-router-dom';

import Navigation from './components/Navigation';

import './App.scss';

const ROUTES = [
  { path: '/home', component: () => <div>Home</div> }
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
