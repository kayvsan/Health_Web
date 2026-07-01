import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Play, Settings, ExternalLink, Activity, Clock, FileText } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { monitors, uptimeHistory } from '../data/mockData';
import StatusBadge from '../components/common/StatusBadge';
import StatCard from '../components/common/StatCard';

export default function MonitorDetail() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('uptime');
  
  // Find the specific monitor, fallback to first one if not found for mock purposes
  const monitor = monitors.find(m => m.id === id) || monitors[0];

  return (
    <div>
      {/* Back Button */}
      <Link to="/monitors" className="inline-flex items-center gap-2 text-[#a7a7a7] hover:text-white transition-colors text-[13px] font-bold mb-6">
        <ArrowLeft size={16} />
        BACK TO MONITORS
      </Link>

      {/* Header Info */}
      <div className="bg-panel border border-hairline rounded-sm p-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-[28px] font-bold text-white leading-tight m-0">{monitor.name}</h1>
            <StatusBadge status={monitor.status} />
          </div>
          <a href={monitor.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline text-[14px]">
            {monitor.url} <ExternalLink size={14} />
          </a>
          <p className="text-[#757575] text-[12px] mt-3">
            Last checked: {new Date(monitor.lastChecked).toLocaleString()} (Checks every {monitor.interval}s)
          </p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none bg-transparent border border-hairline text-white text-[13px] font-bold py-2 px-4 rounded-sm flex items-center justify-center gap-2 hover:border-primary hover:text-primary transition-colors">
            <Play size={14} />
            CHECK NOW
          </button>
          <button className="flex-1 md:flex-none bg-transparent border border-hairline text-white text-[13px] font-bold py-2 px-4 rounded-sm flex items-center justify-center gap-2 hover:border-[#a7a7a7] transition-colors">
            <Settings size={14} />
            CONFIGURE
          </button>
        </div>
      </div>

      {/* Mini Stat Cards Row */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <StatCard title="Uptime (24H)" value={`${monitor.uptime}%`} color={monitor.uptime > 99 ? 'var(--primary)' : 'var(--status-danger)'} />
        <StatCard title="Uptime (7D)" value="99.98%" color="var(--primary)" />
        <StatCard title="Uptime (30D)" value="99.95%" color="var(--primary)" />
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-hairline mb-8">
        <button 
          onClick={() => setActiveTab('uptime')}
          className={`px-6 py-3 text-[13px] font-bold uppercase tracking-wide flex items-center gap-2 transition-colors border-b-2 ${
            activeTab === 'uptime' ? 'border-primary text-primary' : 'border-transparent text-[#a7a7a7] hover:text-white'
          }`}
        >
          <Activity size={16} /> Uptime & Response
        </button>
        <button 
          onClick={() => setActiveTab('performance')}
          className={`px-6 py-3 text-[13px] font-bold uppercase tracking-wide flex items-center gap-2 transition-colors border-b-2 ${
            activeTab === 'performance' ? 'border-primary text-primary' : 'border-transparent text-[#a7a7a7] hover:text-white'
          }`}
        >
          <Clock size={16} /> Performance
        </button>
        <button 
          onClick={() => setActiveTab('content')}
          className={`px-6 py-3 text-[13px] font-bold uppercase tracking-wide flex items-center gap-2 transition-colors border-b-2 ${
            activeTab === 'content' ? 'border-primary text-primary' : 'border-transparent text-[#a7a7a7] hover:text-white'
          }`}
        >
          <FileText size={16} /> Content History
        </button>
      </div>

      {/* Tab Content Area */}
      <div className="bg-panel border border-hairline rounded-sm p-6 relative">
        <div className="absolute top-0 left-0 w-3 h-3 bg-primary"></div>
        
        {/* TAB: UPTIME */}
        {activeTab === 'uptime' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[16px] font-bold text-white uppercase tracking-wide">Response Time Chart</h3>
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-[#1a1a1a] text-white text-[11px] font-bold rounded-sm border border-hairline cursor-pointer">24H</span>
                <span className="px-2 py-1 bg-transparent text-[#757575] text-[11px] font-bold rounded-sm border border-transparent hover:text-white cursor-pointer">7D</span>
              </div>
            </div>
            <div className="w-full h-[300px] mb-8">
              <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 100, height: 100 }}>
                <LineChart data={uptimeHistory} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--hairline-strong)" vertical={false} />
                  <XAxis dataKey="time" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}ms`} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--hairline)', borderRadius: '2px', color: 'white' }} />
                  <Line type="monotone" dataKey={monitor.name} stroke="var(--primary)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <h3 className="text-[16px] font-bold text-white uppercase tracking-wide mb-4">Uptime Strip (Last 24 Hours)</h3>
            <div className="flex w-full h-8 gap-[2px]">
              {Array.from({length: 48}).map((_, i) => (
                <div 
                  key={i} 
                  className={`flex-1 rounded-sm ${Math.random() > 0.95 && monitor.id === 'm3' ? 'bg-status-danger' : 'bg-status-success'}`}
                  title={Math.random() > 0.95 && monitor.id === 'm3' ? 'Outage recorded' : '100% Uptime'}
                ></div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: PERFORMANCE */}
        {activeTab === 'performance' && (
          <div>
            <h3 className="text-[16px] font-bold text-white uppercase tracking-wide mb-6">Network Metrics</h3>
            <div className="grid grid-cols-4 gap-4 mb-8">
              <div className="p-4 border border-hairline rounded-sm bg-[#0a0a0a]">
                <span className="block text-[11px] text-[#a7a7a7] uppercase font-bold mb-1">DNS Lookup</span>
                <span className="text-[20px] font-bold text-white">12<span className="text-[12px] text-[#757575] ml-1">ms</span></span>
              </div>
              <div className="p-4 border border-hairline rounded-sm bg-[#0a0a0a]">
                <span className="block text-[11px] text-[#a7a7a7] uppercase font-bold mb-1">TCP Connection</span>
                <span className="text-[20px] font-bold text-white">35<span className="text-[12px] text-[#757575] ml-1">ms</span></span>
              </div>
              <div className="p-4 border border-hairline rounded-sm bg-[#0a0a0a]">
                <span className="block text-[11px] text-[#a7a7a7] uppercase font-bold mb-1">TLS Handshake</span>
                <span className="text-[20px] font-bold text-white">48<span className="text-[12px] text-[#757575] ml-1">ms</span></span>
              </div>
              <div className="p-4 border border-primary rounded-sm bg-[rgba(118,185,0,0.05)]">
                <span className="block text-[11px] text-primary uppercase font-bold mb-1">Time to First Byte (TTFB)</span>
                <span className="text-[20px] font-bold text-white">145<span className="text-[12px] text-primary ml-1">ms</span></span>
              </div>
            </div>
            <p className="text-[#a7a7a7] text-[13px]">Detailed breakdown waterfall chart will be implemented here during the backend integration phase.</p>
          </div>
        )}

        {/* TAB: CONTENT */}
        {activeTab === 'content' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[16px] font-bold text-white uppercase tracking-wide">Recent Content Diffs</h3>
              <span className="text-[12px] text-[#757575]">Tracking selector: <code className="bg-[#1a1a1a] px-2 py-1 rounded-sm text-primary border border-hairline">body</code></span>
            </div>
            
            <div className="border-l-2 border-hairline ml-2 pl-6 py-2 flex flex-col gap-8 relative">
              {/* Fake Diff Items */}
              {[1, 2].map((i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-[31px] top-1 w-3 h-3 bg-hairline-strong rounded-none"></div>
                  <span className="text-[11px] text-[#a7a7a7] font-bold">{i === 1 ? '2 hours ago' : '3 days ago'}</span>
                  <div className="mt-2 bg-[#0a0a0a] border border-hairline rounded-sm overflow-hidden">
                    <div className="bg-[#111] px-4 py-2 border-b border-hairline flex justify-between">
                      <span className="text-[12px] font-bold text-white">index.html</span>
                      <span className="text-[12px] text-[#757575]">File changed</span>
                    </div>
                    <div className="p-4 font-mono text-[12px] leading-relaxed">
                      {i === 1 ? (
                        <>
                          <div className="text-[#a7a7a7]">  &lt;div className="hero"&gt;</div>
                          <div className="text-status-danger bg-[rgba(229,32,32,0.1)] -mx-4 px-4">−   &lt;h1&gt;Welcome to {monitor.name}&lt;/h1&gt;</div>
                          <div className="text-status-success bg-[rgba(118,185,0,0.1)] -mx-4 px-4">+   &lt;h1&gt;Welcome to {monitor.name} - New Edition!&lt;/h1&gt;</div>
                          <div className="text-[#a7a7a7]">  &lt;/div&gt;</div>
                        </>
                      ) : (
                        <>
                          <div className="text-[#a7a7a7]">  &lt;footer&gt;</div>
                          <div className="text-status-danger bg-[rgba(229,32,32,0.1)] -mx-4 px-4">−   &copy; 2025 Company</div>
                          <div className="text-status-success bg-[rgba(118,185,0,0.1)] -mx-4 px-4">+   &copy; 2026 Company</div>
                          <div className="text-[#a7a7a7]">  &lt;/footer&gt;</div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
