import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, RadioReceiver, Activity, FileText, Settings, BarChart2 } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/monitors', label: 'Monitors', icon: RadioReceiver },
  { path: '/analytics', label: 'Analytics', icon: BarChart2 },
  // { path: '/performance', label: 'Performance', icon: Activity },
  // { path: '/content-changes', label: 'Content Changes', icon: FileText },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="w-[250px] h-screen fixed top-0 left-0 flex flex-col py-6 bg-panel border-r border-hairline z-50">
      <div className="flex items-center gap-3 px-6 mb-8">
        <div className="w-4 h-4 bg-primary"></div>
        <h2 className="text-[20px] font-bold text-white m-0 tracking-wide">HealthWeb</h2>
      </div>
      
      <nav className="flex flex-col gap-1 px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `flex items-center gap-3 px-3 py-3 rounded-sm font-medium text-[14px] transition-all border-l-4 ${
                isActive 
                  ? 'bg-panel-hover text-white border-primary' 
                  : 'text-[#a7a7a7] border-transparent hover:bg-panel-hover hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-primary' : ''} />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
