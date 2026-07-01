import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function Layout() {
  const location = useLocation();
  
  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      <main className="flex-1 ml-[250px] flex flex-col h-screen">
        <Navbar />
        <div className="flex-1 overflow-y-auto bg-black">
          <div key={location.pathname} className="max-w-[1400px] mx-auto p-6 w-full opacity-0 animate-fadeIn">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
