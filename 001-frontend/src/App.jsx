import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { initSocketListeners, disconnectSocket } from './services/socket';

// Import Pages
import Dashboard from './pages/Dashboard';
import Monitors from './pages/Monitors';
import MonitorDetail from './pages/MonitorDetail';
import Performance from './pages/Performance';
import ContentChanges from './pages/ContentChanges';
import Settings from './pages/Settings';
import Analytics from './pages/Analytics';

function App() {
  useEffect(() => {
    initSocketListeners();
    return () => disconnectSocket();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="monitors" element={<Monitors />  } />
          <Route path="monitors/:id" element={<MonitorDetail />} />
          <Route path="performance" element={<Performance />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="content-changes" element={<ContentChanges />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
