import React from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Search, User } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard Overview';
    if (path.startsWith('/monitors')) return 'Monitors Management';
    if (path === '/performance') return 'Performance Analytics';
    if (path === '/content-changes') return 'Content Differ';
    if (path === '/settings') return 'System Settings';
    return 'Dashboard';
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-panel border-b border-hairline shrink-0">
      <div>
        <h1 className="text-base font-bold text-white m-0 uppercase tracking-wide">{getPageTitle()}</h1>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="relative flex items-center">
          <Search size={16} className="absolute left-3 text-hairline-strong" />
          <input 
            type="text" 
            placeholder="Search resources..." 
            className="bg-black border border-hairline rounded-sm py-1.5 pr-3 pl-9 text-white text-[13px] w-60 transition-colors focus:border-primary focus:outline-none" 
          />
        </div>
        
        <button className="bg-transparent border-none text-[#a7a7a7] cursor-pointer relative flex items-center transition-colors hover:text-white">
          <Bell size={18} />
          <span className="absolute -top-[2px] -right-[2px] w-1.5 h-1.5 bg-status-danger rounded-none"></span>
        </button>
        
        <div className="flex items-center gap-2 cursor-pointer text-[#a7a7a7] transition-colors hover:text-white">
          <User size={18} />
          <span className="font-semibold text-[13px]">Administrator</span>
        </div>
      </div>
    </header>
  );
}
