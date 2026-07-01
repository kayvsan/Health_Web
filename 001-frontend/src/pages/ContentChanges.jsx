import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, FileText, ExternalLink } from 'lucide-react';
import { contentChanges } from '../data/mockData';

export default function ContentChanges() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(contentChanges[0]?.id || null);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div>
      {/* Header Area */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-[24px] font-bold text-white uppercase tracking-wide m-0 leading-tight">Content Differ</h2>
          <p className="text-[#a7a7a7] text-[14px] mt-1">Track modifications on monitored HTML selectors over time</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-panel border border-hairline p-4 rounded-sm flex justify-between items-center mb-6">
        <div className="relative w-[300px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-hairline-strong" />
          <input 
            type="text" 
            placeholder="Search diff logs..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black border border-hairline rounded-sm py-1.5 pr-3 pl-9 text-white text-[13px] transition-colors focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      {/* Timeline Layout */}
      <div className="bg-panel border border-hairline rounded-sm p-6 relative">
        <div className="absolute top-0 left-0 w-3 h-3 bg-primary"></div>
        <h3 className="text-[16px] font-bold text-white uppercase tracking-wide mb-8">Global Change Log</h3>
        
        <div className="border-l-2 border-hairline ml-4 pl-8 py-2 flex flex-col gap-10">
          {contentChanges.map((change) => {
            const isExpanded = expandedId === change.id;
            
            return (
              <div key={change.id} className="relative group">
                {/* Timeline Dot */}
                <div className="absolute -left-[41px] top-1.5 w-4 h-4 bg-black border-2 border-primary rounded-full group-hover:bg-primary transition-colors"></div>
                
                {/* Timestamp */}
                <span className="text-[12px] text-[#757575] font-bold tracking-wide uppercase">
                  {new Date(change.timestamp).toLocaleString()}
                </span>
                
                {/* Card Container */}
                <div className="mt-3 bg-black border border-hairline rounded-sm transition-colors group-hover:border-hairline-strong">
                  
                  {/* Card Header (Clickable) */}
                  <div 
                    className="p-4 flex items-start justify-between cursor-pointer"
                    onClick={() => toggleExpand(change.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-[#1a1a1a] rounded-sm text-primary mt-1">
                        <FileText size={20} />
                      </div>
                      <div>
                        <h4 className="text-[15px] font-bold text-white mb-1 flex items-center gap-2">
                          {change.monitorName}
                          <a href="#" className="text-primary hover:text-white" onClick={(e) => e.stopPropagation()}>
                            <ExternalLink size={12} />
                          </a>
                        </h4>
                        <p className="text-[13px] text-[#a7a7a7] leading-relaxed">
                          {change.diffSummary}
                        </p>
                      </div>
                    </div>
                    <button className="text-[#757575] hover:text-white mt-1">
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>
                  
                  {/* Diff Viewer (Collapsible) */}
                  {isExpanded && (
                    <div className="border-t border-hairline bg-[#0a0a0a]">
                      <div className="flex bg-[#111] px-4 py-2 border-b border-hairline justify-between text-[11px] font-bold uppercase tracking-wide text-[#757575]">
                        <span>Diff: Document Body</span>
                        <span>-1 line / +1 line</span>
                      </div>
                      <div className="p-4 font-mono text-[13px] leading-relaxed overflow-x-auto whitespace-pre">
                        <div className="text-[#757575] pl-4">  &lt;div className="container"&gt;</div>
                        <div className="text-[#757575] pl-4">    &lt;nav&gt;...&lt;/nav&gt;</div>
                        
                        {/* Red (Deleted) */}
                        <div className="text-status-danger bg-[rgba(229,32,32,0.1)] -mx-4 px-4 border-l-4 border-status-danger flex">
                          <span className="w-8 text-[#757575] select-none text-right pr-4">12</span>
                          <span>−   &lt;h1&gt;{change.monitorName} Original Site&lt;/h1&gt;</span>
                        </div>
                        
                        {/* Green (Added) */}
                        <div className="text-status-success bg-[rgba(118,185,0,0.1)] -mx-4 px-4 border-l-4 border-status-success flex">
                          <span className="w-8 text-[#757575] select-none text-right pr-4">12</span>
                          <span>+   &lt;h1&gt;{change.monitorName} Revised Layout&lt;/h1&gt;</span>
                        </div>
                        
                        <div className="text-[#757575] pl-4">    &lt;main&gt;...&lt;/main&gt;</div>
                        <div className="text-[#757575] pl-4">  &lt;/div&gt;</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
