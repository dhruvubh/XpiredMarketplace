import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import Navbar from './components/Navbar';
import AdminDashboard from './components/AdminDashboard';
import NonprofitPortal from './components/NonprofitPortal';
import CustomerApp from './components/CustomerApp';
import StoreConsole from './components/StoreConsole';
import ImpactDashboard from './components/ImpactDashboard';
import Home from './components/Home';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/nonprofit" element={<NonprofitPortal />} />
          <Route path="/customer" element={<CustomerApp />} />
          <Route path="/store" element={<StoreConsole />} />
          <Route path="/impact" element={<ImpactDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
