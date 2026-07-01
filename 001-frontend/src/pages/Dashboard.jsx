import React, { useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Clock, AlertTriangle, Monitor } from 'lucide-react';
import useDashboardStore from '../stores/dashboardStore';
import useMonitorStore from '../stores/monitorStore';
import { uptimeHistory } from '../data/mockData';
import StatusBadge from '../components/common/StatusBadge';
import StatCard from '../components/common/StatCard';

export default function Dashboard() {
  const { summary, incidents, chartData, fetchSummary, fetchIncidents, fetchChartData } = useDashboardStore();
  const { monitors, fetchMonitors } = useMonitorStore();
  const [chartRange, setChartRange] = React.useState('24h');

  useEffect(() => {
    fetchSummary();
    fetchIncidents();
    fetchMonitors();
  }, [fetchSummary, fetchIncidents, fetchMonitors]);

  useEffect(() => {
    fetchChartData(chartRange);
  }, [fetchChartData, chartRange]);

  // Generate colors for lines
  const getLineColor = (index) => {
    const colors = ['var(--primary)', '#0046a4', 'var(--status-warning)', 'var(--status-danger)', '#8e44ad', '#2ecc71', '#e67e22'];
    return colors[index % colors.length];
  };

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <h1 className="heading-lg" style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>System Overview</h1>
        <p className="body-md" style={{ marginTop: 'var(--space-xs)' }}>Real-time monitoring status of your registered infrastructure.</p>
      </div>

      {/* Metric Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
        <StatCard title="Total Monitors" value={summary.totalMonitors} icon={Monitor} />
        <StatCard title="Overall Uptime" value={`${summary.overallUptime}%`} icon={Activity} color={summary.overallUptime > 99 ? 'var(--primary)' : 'var(--status-warning)'} />
        <StatCard title="Avg Response" value={`${summary.avgResponseTime}ms`} icon={Clock} />
        <StatCard title="Active Incidents" value={summary.activeIncidents} icon={AlertTriangle} color={summary.activeIncidents > 0 ? "var(--status-danger)" : "var(--primary)"} borderColor={summary.activeIncidents > 0 ? "var(--status-danger)" : "var(--hairline)"} />
      </div>

      {/* Middle Row: Charts & Incidents */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-xl)', marginBottom: 'var(--space-xl)' }}>
        
        {/* Chart Panel */}
        <div className="panel" style={{ gridColumn: '1 / 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
            <h3 className="card-title" style={{ textTransform: 'uppercase', margin: 0 }}>Response Time History</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['24h', '7d', '30d'].map(range => (
                <button 
                  key={range}
                  onClick={() => setChartRange(range)}
                  style={{
                    padding: '4px 8px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    borderRadius: 'var(--rounded-sm)',
                    border: '1px solid',
                    borderColor: chartRange === range ? 'var(--primary)' : 'var(--hairline)',
                    backgroundColor: chartRange === range ? 'rgba(0, 255, 170, 0.1)' : 'transparent',
                    color: chartRange === range ? 'var(--primary)' : 'var(--text-secondary)',
                    cursor: 'pointer'
                  }}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          <div style={{ width: '100%', height: '300px' }}>
            {chartData.length === 0 ? (
              <div className="body-md" style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                Waiting for sufficient log data...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 100, height: 100 }}>
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--hairline-strong)" vertical={false} />
                  <XAxis dataKey="time" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}ms`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--hairline)', borderRadius: 'var(--rounded-sm)', color: 'var(--text-primary)' }}
                    itemStyle={{ fontSize: '12px' }}
                  />
                  {monitors.map((m, index) => (
                    <React.Fragment key={m.id}>
                      <Line type="monotone" dataKey={m.name} name={`${m.name} (Avg)`} stroke={getLineColor(index)} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                      {chartRange !== '24h' && (
                        <Line type="monotone" dataKey={`${m.name}_max`} name={`${m.name} (Max)`} stroke={getLineColor(index)} strokeDasharray="3 4" strokeOpacity={0.5} strokeWidth={1} dot={false} activeDot={false} />
                      )}
                    </React.Fragment>
                  ))}
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right Column: Active Incidents */}
        <div className="panel" style={{ gridColumn: '2 / 3' }}>
          <h3 className="card-title" style={{ textTransform: 'uppercase', marginBottom: 'var(--space-lg)' }}>Recent Incidents</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {incidents.length === 0 ? (
              <p className="body-md" style={{ textAlign: 'center', padding: 'var(--space-lg) 0' }}>No active incidents.</p>
            ) : (
              incidents.slice(0, 4).map(incident => (
                <div key={incident.id} style={{
                  padding: 'var(--space-md)',
                  borderLeft: `3px solid ${incident.type === 'down' ? 'var(--status-danger)' : 'var(--status-warning)'}`,
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  borderRadius: '0 var(--rounded-sm) var(--rounded-sm) 0'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span className="body-strong" style={{ fontSize: '13px' }}>{incident.monitor?.name || 'Unknown Monitor'}</span>
                    <span className="body-md" style={{ fontSize: '11px' }}>{new Date(incident.startedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <p className="body-md" style={{ fontSize: '13px', lineHeight: '1.4' }}>{incident.message}</p>
                  <div style={{ marginTop: '8px' }}>
                    <span style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', color: incident.status === 'active' ? 'var(--status-danger)' : 'var(--text-secondary)' }}>
                      {incident.status === 'active' ? '● BELUM SELESAI' : '✓ SELESAI'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row: Monitors List */}
      <div className="panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
          <h3 className="card-title" style={{ textTransform: 'uppercase' }}>Monitored Endpoints</h3>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {monitors.slice(0, 5).map(monitor => (
            <div key={monitor.id} style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
              padding: 'var(--space-md)', 
              border: '1px solid var(--hairline)', 
              borderRadius: 'var(--rounded-sm)',
              backgroundColor: 'rgba(255,255,255,0.02)'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                  <span className="body-strong">{monitor.name}</span>
                  <StatusBadge status={monitor.status} />
                </div>
                <span className="body-md" style={{ fontSize: '12px' }}>{monitor.url}</span>
              </div>
              
              <div style={{ textAlign: 'right' }}>
                <div className="body-strong">{monitor.status === 'unknown' ? '-' : `${monitor.responseTime || 0}ms`}</div>
                <div className="body-md" style={{ fontSize: '12px' }}>Uptime: {monitor.uptime}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
