import React, { useState, useEffect } from 'react';
import { Search, Plus, MoreVertical, Play, Pause, Edit, Trash2 } from 'lucide-react';
import useMonitorStore from '../stores/monitorStore';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';

export default function Monitors() {
  const { monitors, fetchMonitors, createMonitor, updateMonitor, deleteMonitor, toggleMonitor, triggerCheck } = useMonitorStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [editingId, setEditingId] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({ name: '', url: '', interval: 60 });

  useEffect(() => {
    fetchMonitors();
  }, [fetchMonitors]);

  // Filter monitors
  const filteredMonitors = monitors.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.url.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' ? true : m.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await updateMonitor(editingId, formData);
      } else {
        await createMonitor(formData);
      }
      setIsModalOpen(false);
      setFormData({ name: '', url: '', interval: 60 });
      setEditingId(null);
    } catch (e) {
      alert(`Failed to ${editingId ? 'update' : 'create'} monitor`);
    }
  };

  return (
    <div>
      {/* Header Area */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-[24px] font-bold text-white uppercase tracking-wide m-0 leading-tight">Monitors Management</h2>
          <p className="text-[#a7a7a7] text-[14px] mt-1">Manage and configure your endpoint tracking</p>
        </div>
        <button
          onClick={() => {
            setFormData({ name: '', url: '', interval: 60 });
            setEditingId(null);
            setIsModalOpen(true);
          }}
          className="bg-primary hover:bg-primary-dark text-black font-bold text-[14px] py-2 px-4 rounded-sm flex items-center gap-2 transition-colors"
        >
          <Plus size={16} strokeWidth={3} />
          ADD MONITOR
        </button>
      </div>

      {/* Toolbar: Search & Filters */}
      <div className="bg-panel border border-hairline p-4 rounded-sm flex justify-between items-center mb-6">
        <div className="relative w-[300px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-hairline-strong" />
          <input
            type="text"
            placeholder="Search by name or URL..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black border border-hairline rounded-sm py-1.5 pr-3 pl-9 text-white text-[13px] transition-colors focus:border-primary focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[#757575] text-[12px] uppercase font-bold tracking-wide mr-2">Filter Status:</span>
          {['all', 'up', 'down', 'degraded'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 text-[12px] font-bold uppercase rounded-sm border transition-colors ${filter === f
                  ? 'bg-[#1a1a1a] border-primary text-primary'
                  : 'bg-transparent border-hairline text-[#a7a7a7] hover:border-hairline-strong hover:text-white'
                }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Monitors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMonitors.map(monitor => (
          <div key={monitor.id} className="bg-panel border border-hairline rounded-sm p-5 relative group transition-colors hover:border-hairline-strong">
            {/* Status Strip (Left Border equivalent) */}
            <div className={`absolute top-0 left-0 w-1 h-full rounded-l-sm ${monitor.status === 'up' ? 'bg-status-success' :
                monitor.status === 'down' ? 'bg-status-danger' : 'bg-status-warning'
              }`}></div>

            <div className="flex justify-between items-start mb-4">
              <div className="pl-2">
                <h3 className="text-[16px] font-bold text-white leading-tight mb-1">{monitor.name}</h3>
                <a href={monitor.url} target="_blank" rel="noreferrer" className="text-[12px] text-primary hover:underline">
                  {monitor.url}
                </a>
              </div>
              <div className="relative">
                <button 
                  onClick={() => setOpenDropdown(openDropdown === monitor.id ? null : monitor.id)}
                  className="text-[#757575] hover:text-white transition-colors p-1"
                >
                  <MoreVertical size={18} />
                </button>

                {openDropdown === monitor.id && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setOpenDropdown(null)}
                    ></div>
                    <div className="absolute right-0 mt-1 w-36 bg-[#1a1a1a] border border-hairline rounded-sm shadow-lg z-20 overflow-hidden">
                      <button 
                        onClick={() => {
                          setOpenDropdown(null);
                          setFormData({ name: monitor.name, url: monitor.url, interval: monitor.interval || 60 });
                          setEditingId(monitor.id);
                          setIsModalOpen(true);
                        }}
                        className="w-full text-left px-3 py-2.5 text-[12px] font-bold text-white hover:bg-[#2a2a2a] flex items-center gap-2 transition-colors border-b border-hairline"
                      >
                        <Edit size={14} />
                        EDIT
                      </button>
                      <button 
                        onClick={() => {
                          setOpenDropdown(null);
                          deleteMonitor(monitor.id);
                        }}
                        className="w-full text-left px-3 py-2.5 text-[12px] font-bold text-status-danger hover:bg-[rgba(229,32,32,0.1)] flex items-center gap-2 transition-colors"
                      >
                        <Trash2 size={14} />
                        DELETE
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-5 pl-2">
              <div>
                <span className="text-[#757575] text-[10px] uppercase font-bold tracking-wide block mb-1">Status</span>
                <StatusBadge status={monitor.status} />
              </div>
              <div>
                <span className="text-[#757575] text-[10px] uppercase font-bold tracking-wide block mb-1">Uptime</span>
                <span className="text-white font-bold text-[14px]">{monitor.uptime}%</span>
              </div>
              <div>
                <span className="text-[#757575] text-[10px] uppercase font-bold tracking-wide block mb-1">Response</span>
                <span className="text-white font-bold text-[14px]">{monitor.responseTime > 0 ? `${monitor.responseTime}ms` : '-'}</span>
              </div>
              <div>
                <span className="text-[#757575] text-[10px] uppercase font-bold tracking-wide block mb-1">Interval</span>
                <span className="text-white font-bold text-[14px]">{monitor.interval}s</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-hairline pl-2">
              <button onClick={() => triggerCheck(monitor.id)} className="flex-1 bg-transparent border border-hairline text-white text-[12px] font-bold py-1.5 rounded-sm flex items-center justify-center gap-1 hover:border-primary hover:text-primary transition-colors">
                <Play size={12} />
                CHECK
              </button>
              <button onClick={() => toggleMonitor(monitor.id)} className="flex-1 bg-transparent border border-hairline text-white text-[12px] font-bold py-1.5 rounded-sm flex items-center justify-center gap-1 hover:border-[#a7a7a7] transition-colors">
                {monitor.isActive ? <Pause size={12} /> : <Play size={12} />}
                {monitor.isActive ? 'PAUSE' : 'RESUME'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredMonitors.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-hairline-strong rounded-sm bg-[rgba(255,255,255,0.01)] mt-6">
          <Search size={48} className="text-hairline-strong mb-4" />
          <h3 className="text-[20px] font-bold text-white mb-2">No Monitors Found</h3>
          <p className="text-[#a7a7a7] text-[14px]">Try adjusting your search query or filters.</p>
        </div>
      )}

      {/* Add / Edit Monitor Modal */}
      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingId(null); setFormData({ name: '', url: '', interval: 60 }); }} title={editingId ? "Edit Monitor" : "Add New Monitor"}>
        <form className="flex flex-col gap-5">
          <div>
            <label className="block text-[12px] font-bold text-[#a7a7a7] uppercase tracking-wide mb-2">Friendly Name</label>
            <input type="text" placeholder="e.g. Production API" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black border border-hairline rounded-sm p-2.5 text-white text-[14px] focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="block text-[12px] font-bold text-[#a7a7a7] uppercase tracking-wide mb-2">Endpoint URL</label>
            <input type="url" placeholder="https://api.example.com/health" value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} className="w-full bg-black border border-hairline rounded-sm p-2.5 text-white text-[14px] focus:border-primary focus:outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-bold text-[#a7a7a7] uppercase tracking-wide mb-2">Check Interval</label>
              <select value={formData.interval} onChange={e => setFormData({...formData, interval: Number(e.target.value)})} className="w-full bg-black border border-hairline rounded-sm p-2.5 text-white text-[14px] focus:border-primary focus:outline-none">
                <option value={30}>Every 30 seconds</option>
                <option value={60}>Every 1 minute</option>
                <option value={300}>Every 5 minutes</option>
                <option value={900}>Every 15 minutes</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-bold text-[#a7a7a7] uppercase tracking-wide mb-2">Timeout</label>
              <select className="w-full bg-black border border-hairline rounded-sm p-2.5 text-white text-[14px] focus:border-primary focus:outline-none">
                <option value="5000">5 seconds</option>
                <option value="10000">10 seconds</option>
                <option value="30000">30 seconds</option>
              </select>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-hairline flex justify-end gap-3">
            <button type="button" onClick={() => { setIsModalOpen(false); setEditingId(null); setFormData({ name: '', url: '', interval: 60 }); }} className="px-4 py-2 bg-transparent border border-[#757575] text-[#a7a7a7] font-bold text-[13px] rounded-sm hover:text-white hover:border-white transition-colors">
              CANCEL
            </button>
            <button type="button" onClick={handleSubmit} className="px-4 py-2 bg-primary text-black font-bold text-[13px] rounded-sm hover:bg-primary-dark transition-colors">
              {editingId ? 'SAVE CHANGES' : 'SAVE MONITOR'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
