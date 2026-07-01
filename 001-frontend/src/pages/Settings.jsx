import React, { useState, useEffect } from 'react';
import { Save, Bell, Globe, ShieldAlert, MessageCircle, CheckCircle, XCircle, Plus, Edit, Trash2, X, Info } from 'lucide-react';
import { telegramService } from '../services/api';

export default function Settings() {
  const [configs, setConfigs] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  
  // UI State
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    label: '',
    botToken: '',
    chatId: '',
    isActive: true,
    alertOnDown: true,
    alertOnDegraded: true,
    alertOnRecovery: true,
  });

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      const data = await telegramService.getConfigs();
      setConfigs(data || []);
    } catch (err) {
      console.error('Failed to load telegram configs', err);
    }
  };

  const resetForm = () => {
    setFormData({
      label: '',
      botToken: '',
      chatId: '',
      isActive: true,
      alertOnDown: true,
      alertOnDegraded: true,
      alertOnRecovery: true,
    });
    setEditingId(null);
    setShowForm(false);
    setTestResult(null);
  };

  const handleEdit = (config) => {
    setFormData({
      ...config,
      botToken: config.botToken // Will be masked ••••••••...
    });
    setEditingId(config.id);
    setShowForm(true);
    setTestResult(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this Telegram recipient?')) return;
    
    try {
      await telegramService.deleteConfig(id);
      await loadConfigs();
    } catch (err) {
      alert('Failed to delete config');
    }
  };

  const handleTelegramChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveTelegram = async () => {
    setIsSaving(true);
    try {
      if (editingId) {
        await telegramService.updateConfig(editingId, formData);
      } else {
        await telegramService.addConfig(formData);
      }
      await loadConfigs();
      alert('Telegram settings saved successfully');
      resetForm();
    } catch (err) {
      alert('Error saving settings');
    }
    setIsSaving(false);
  };

  const handleTestTelegram = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const data = await telegramService.testConnection({
        id: editingId,
        botToken: formData.botToken,
        chatId: formData.chatId
      });
      if (data.success) {
        setTestResult({ success: true, message: 'Message sent successfully!' });
      } else {
        setTestResult({ success: false, message: data.error || 'Failed to send message' });
      }
    } catch (err) {
      setTestResult({ success: false, message: 'Network error occurred' });
    }
    setIsTesting(false);
  };

  return (
    <div>
      {/* Header Area */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-[24px] font-bold text-white uppercase tracking-wide m-0 leading-tight">System Settings</h2>
          <p className="text-[#a7a7a7] text-[14px] mt-1">Configure global application parameters and default behaviors</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Settings Column (Takes up 2/3 of space on large screens) */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* General Configuration */}
          {/* <div className="bg-panel border border-hairline rounded-sm p-6 relative">
            <div className="absolute top-0 left-0 w-3 h-3 bg-primary"></div>
            <div className="flex items-center gap-2 mb-6">
              <Globe size={20} className="text-primary" />
              <h3 className="text-[16px] font-bold text-white uppercase tracking-wide">General Defaults</h3>
            </div>
            
            <form className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[12px] font-bold text-[#a7a7a7] uppercase tracking-wide mb-2">Default Check Interval</label>
                  <select className="w-full bg-black border border-hairline rounded-sm p-3 text-white text-[14px] focus:border-primary focus:outline-none transition-colors">
                    <option value="60">1 Minute (60s)</option>
                    <option value="300">5 Minutes (300s)</option>
                    <option value="900">15 Minutes (900s)</option>
                    <option value="3600">1 Hour (3600s)</option>
                  </select>
                  <p className="text-[11px] text-[#757575] mt-2">Applies to all new monitors unless specified otherwise.</p>
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-[#a7a7a7] uppercase tracking-wide mb-2">Default Request Timeout</label>
                  <select className="w-full bg-black border border-hairline rounded-sm p-3 text-white text-[14px] focus:border-primary focus:outline-none transition-colors">
                    <option value="5000">5 Seconds</option>
                    <option value="10000">10 Seconds</option>
                    <option value="30000">30 Seconds</option>
                  </select>
                  <p className="text-[11px] text-[#757575] mt-2">Maximum wait time before marking as offline.</p>
                </div>
              </div>
              
              <div>
                <label className="block text-[12px] font-bold text-[#a7a7a7] uppercase tracking-wide mb-2">Data Retention Policy</label>
                <select className="w-full bg-black border border-hairline rounded-sm p-3 text-white text-[14px] focus:border-primary focus:outline-none transition-colors">
                  <option value="7">7 Days</option>
                  <option value="30">30 Days</option>
                  <option value="90">90 Days</option>
                  <option value="365">1 Year</option>
                </select>
              </div>
            </form>
          </div> */}

          {/* Telegram Integration */}
          <div className="bg-panel border border-hairline rounded-sm p-6 relative">
            <div className="absolute top-0 left-0 w-3 h-3 bg-[#0088cc]"></div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <MessageCircle size={20} className="text-[#0088cc]" />
                <h3 className="text-[16px] font-bold text-white uppercase tracking-wide">Telegram Integration</h3>
              </div>
              {!showForm && (
                <button 
                  onClick={() => setShowForm(true)}
                  className="bg-[rgba(0,136,204,0.1)] text-[#0088cc] hover:bg-[#0088cc] hover:text-white border border-[#0088cc] font-bold text-[12px] py-1.5 px-3 rounded-sm transition-colors flex items-center gap-1"
                >
                  <Plus size={14} /> ADD RECIPIENT
                </button>
              )}
            </div>
            
            {showForm ? (
              <div className="flex flex-col gap-6 border border-[#333] p-5 rounded-sm bg-[#0a0a0a]">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-[14px] font-bold text-white">{editingId ? 'Edit Recipient' : 'Add New Recipient'}</h4>
                  <button onClick={resetForm} className="text-[#a7a7a7] hover:text-white">
                    <X size={18} />
                  </button>
                </div>

                <div className="bg-[rgba(0,136,204,0.05)] border border-[#0088cc] border-opacity-30 p-4 rounded-sm">
                  <h5 className="text-[13px] font-bold text-[#0088cc] mb-2 flex items-center gap-2">
                    <Info size={14} /> Panduan Integrasi Telegram:
                  </h5>
                  <ol className="text-[12px] text-[#a7a7a7] list-decimal pl-4 space-y-1.5 m-0">
                    <li>Buka aplikasi Telegram dan cari <strong>@BotFather</strong>.</li>
                    <li>Kirim perintah <code className="bg-black px-1.5 py-0.5 rounded text-[#0088cc] border border-[#333] font-mono">/newbot</code> dan ikuti instruksi pembuatan bot.</li>
                    <li>Salin <strong>Bot Token</strong> yang diberikan oleh BotFather.</li>
                    <li>Kirim pesan apa saja ke bot Anda (klik Start) atau tambahkan bot ke dalam Grup Telegram Anda.</li>
                    <li>Untuk mendapatkan <strong>Chat ID</strong>, cari dan gunakan bot <strong>@userinfobot</strong> atau <strong>@getmyid_bot</strong>, lalu teruskan (forward) pesan dari bot/grup Anda ke bot tersebut.</li>
                  </ol>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-[12px] font-bold text-[#a7a7a7] uppercase tracking-wide mb-2">Label / Name</label>
                    <input 
                      type="text" 
                      name="label"
                      value={formData.label}
                      onChange={handleTelegramChange}
                      placeholder="e.g., DevOps Team, Management" 
                      className="w-full bg-black border border-hairline rounded-sm p-3 text-white text-[14px] focus:border-[#0088cc] focus:outline-none transition-colors" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[12px] font-bold text-[#a7a7a7] uppercase tracking-wide mb-2">Bot Token</label>
                    <input 
                      type="password" 
                      name="botToken"
                      value={formData.botToken}
                      onChange={handleTelegramChange}
                      placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz" 
                      className="w-full bg-black border border-hairline rounded-sm p-3 text-white text-[14px] focus:border-[#0088cc] focus:outline-none transition-colors" 
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-[#a7a7a7] uppercase tracking-wide mb-2">Chat ID</label>
                    <input 
                      type="text" 
                      name="chatId"
                      value={formData.chatId}
                      onChange={handleTelegramChange}
                      placeholder="-1001234567890" 
                      className="w-full bg-black border border-hairline rounded-sm p-3 text-white text-[14px] focus:border-[#0088cc] focus:outline-none transition-colors" 
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleTelegramChange} className="w-4 h-4 accent-[#0088cc]" />
                      <span className="text-[14px] text-white">Active</span>
                    </label>
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-[#a7a7a7] uppercase tracking-wide mb-3">Alert When:</label>
                  <div className="flex flex-col gap-3">
                    <label className="flex items-center gap-3 cursor-pointer w-max">
                      <input type="checkbox" name="alertOnDown" checked={formData.alertOnDown} onChange={handleTelegramChange} className="w-4 h-4 accent-[#0088cc]" />
                      <span className="text-[14px] text-white">Monitor Down (Critical)</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer w-max">
                      <input type="checkbox" name="alertOnDegraded" checked={formData.alertOnDegraded} onChange={handleTelegramChange} className="w-4 h-4 accent-[#0088cc]" />
                      <span className="text-[14px] text-white">Performance Degraded (Warning)</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer w-max">
                      <input type="checkbox" name="alertOnRecovery" checked={formData.alertOnRecovery} onChange={handleTelegramChange} className="w-4 h-4 accent-[#0088cc]" />
                      <span className="text-[14px] text-white">Monitor Recovered (Resolved)</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-2 pt-4 border-t border-[#333]">
                  <button 
                    onClick={handleTestTelegram}
                    disabled={isTesting || !formData.botToken || !formData.chatId}
                    className="bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-[#333] text-white font-bold text-[13px] py-2 px-6 rounded-sm transition-colors disabled:opacity-50"
                  >
                    {isTesting ? 'TESTING...' : 'TEST CONNECTION'}
                  </button>
                  <button 
                    onClick={handleSaveTelegram}
                    disabled={isSaving}
                    className="bg-[#0088cc] hover:bg-[#0077b3] text-white font-bold text-[13px] py-2 px-6 rounded-sm transition-colors flex items-center gap-2 ml-auto"
                  >
                    <Save size={16} />
                    {isSaving ? 'SAVING...' : 'SAVE CONFIG'}
                  </button>
                </div>

                {testResult && (
                  <div className={`p-4 mt-2 border rounded-sm flex items-start gap-3 ${testResult.success ? 'bg-[rgba(0,136,204,0.1)] border-[#0088cc]' : 'bg-[rgba(229,32,32,0.1)] border-status-danger'}`}>
                    {testResult.success ? <CheckCircle size={20} className="text-[#0088cc] shrink-0" /> : <XCircle size={20} className="text-status-danger shrink-0" />}
                    <p className={`text-[14px] m-0 ${testResult.success ? 'text-[#0088cc]' : 'text-status-danger'}`}>{testResult.message}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {configs.length === 0 ? (
                  <div className="text-center p-8 border border-dashed border-[#333] rounded-sm">
                    <MessageCircle size={32} className="text-[#333] mx-auto mb-3" />
                    <p className="text-[#a7a7a7] text-[14px]">Belum ada penerima Telegram.<br/>Klik "+ Add Recipient" untuk mulai.</p>
                  </div>
                ) : (
                  configs.map(config => (
                    <div key={config.id} className={`flex items-start justify-between p-4 border rounded-sm ${config.isActive ? 'border-[#333] bg-[#0a0a0a]' : 'border-hairline bg-[#050505] opacity-60'}`}>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[15px] font-bold text-white">{config.label}</span>
                          {config.isActive ? (
                            <span className="text-[10px] font-bold bg-[#0088cc] bg-opacity-20 text-[#0088cc] px-2 py-0.5 rounded-sm">ACTIVE</span>
                          ) : (
                            <span className="text-[10px] font-bold bg-[#333] text-[#a7a7a7] px-2 py-0.5 rounded-sm">INACTIVE</span>
                          )}
                        </div>
                        <span className="text-[13px] text-[#a7a7a7] font-mono">{config.chatId}</span>
                        <div className="flex gap-3 mt-1">
                          <span className={`text-[12px] flex items-center gap-1 ${config.alertOnDown ? 'text-white' : 'text-[#555]'}`}>
                            {config.alertOnDown ? <CheckCircle size={12} className="text-status-danger" /> : <XCircle size={12}/>} Down
                          </span>
                          <span className={`text-[12px] flex items-center gap-1 ${config.alertOnDegraded ? 'text-white' : 'text-[#555]'}`}>
                            {config.alertOnDegraded ? <CheckCircle size={12} className="text-status-warning" /> : <XCircle size={12}/>} Degraded
                          </span>
                          <span className={`text-[12px] flex items-center gap-1 ${config.alertOnRecovery ? 'text-white' : 'text-[#555]'}`}>
                            {config.alertOnRecovery ? <CheckCircle size={12} className="text-status-success" /> : <XCircle size={12}/>} Recovery
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEdit(config)} className="p-2 text-[#a7a7a7] hover:text-white bg-[#1a1a1a] rounded-sm transition-colors">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(config.id)} className="p-2 text-[#a7a7a7] hover:text-status-danger bg-[#1a1a1a] rounded-sm transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Other Notifications */}
          {/* <div className="bg-panel border border-hairline rounded-sm p-6 relative">
            <div className="absolute top-0 left-0 w-3 h-3 bg-primary"></div>
            <div className="flex items-center gap-2 mb-6">
              <Bell size={20} className="text-primary" />
              <h3 className="text-[16px] font-bold text-white uppercase tracking-wide">Other Alert Preferences</h3>
            </div>
            
            <div className="flex flex-col gap-4">
              <label className="flex items-start gap-4 p-4 border border-hairline rounded-sm bg-[#0a0a0a] cursor-pointer hover:border-[#5e5e5e] transition-colors">
                <input type="checkbox" defaultChecked className="mt-1 w-4 h-4 accent-primary" />
                <div>
                  <span className="block text-[14px] font-bold text-white mb-1">Email Notifications</span>
                  <span className="block text-[13px] text-[#a7a7a7]">Receive immediate alerts when a monitor goes down or recovers.</span>
                </div>
              </label>
              
              <label className="flex items-start gap-4 p-4 border border-hairline rounded-sm bg-[#0a0a0a] cursor-pointer hover:border-[#5e5e5e] transition-colors">
                <input type="checkbox" className="mt-1 w-4 h-4 accent-primary" />
                <div>
                  <span className="block text-[14px] font-bold text-white mb-1">Webhook Integration (Slack/Discord)</span>
                  <span className="block text-[13px] text-[#a7a7a7]">Forward JSON payloads to custom webhooks on status change events.</span>
                  <input type="url" placeholder="https://hooks.slack.com/services/..." className="mt-3 w-full bg-black border border-hairline rounded-sm p-2.5 text-white text-[13px] focus:border-primary focus:outline-none transition-colors" />
                </div>
              </label>
            </div>
          </div> */}
          
        </div>

        {/* Sidebar Settings Column */}
        <div className="flex flex-col gap-8">
          
          {/* Danger Zone */}
          {/* <div className="bg-[#1a0a0a] border border-status-danger rounded-sm p-6 relative">
            <div className="absolute top-0 left-0 w-3 h-3 bg-status-danger"></div>
            <div className="flex items-center gap-2 mb-6">
              <ShieldAlert size={20} className="text-status-danger" />
              <h3 className="text-[16px] font-bold text-white uppercase tracking-wide">Danger Zone</h3>
            </div>
            
            <p className="text-[13px] text-[#a7a7a7] mb-6 leading-relaxed">
              Actions in this section are irreversible. Proceed with extreme caution.
            </p>
            
            <div className="flex flex-col gap-4">
              <button className="w-full bg-transparent border border-status-danger text-status-danger font-bold text-[13px] py-3 rounded-sm hover:bg-[rgba(229,32,32,0.1)] transition-colors">
                CLEAR ALL LOGS
              </button>
              <button className="w-full bg-status-danger text-black font-bold text-[13px] py-3 rounded-sm hover:opacity-90 transition-opacity">
                FACTORY RESET SYSTEM
              </button>
            </div>
          </div>
           */}
        </div>
        
      </div>
    </div>
  );
}
