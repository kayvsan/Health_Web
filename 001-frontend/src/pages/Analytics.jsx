import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { dashboardService } from '../services/api';
import useMonitorStore from '../stores/monitorStore';

export default function Analytics() {
  const [statusData, setStatusData] = useState([]);
  const [responseTimeData, setResponseTimeData] = useState([]);
  const [healthData, setHealthData] = useState([]);
  const [selectedMonitor, setSelectedMonitor] = useState('all');
  const [selectedCode, setSelectedCode] = useState('all');
  const [selectedHealth, setSelectedHealth] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  
  const { monitors, fetchMonitors } = useMonitorStore();

  useEffect(() => {
    fetchMonitors();
  }, [fetchMonitors]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statusResult, responseResult, healthResult] = await Promise.all([
          dashboardService.getStatusDistribution(selectedMonitor, startDate, endDate),
          dashboardService.getResponseChart('', selectedMonitor, startDate, endDate),
          dashboardService.getHealthDistribution(selectedMonitor, startDate, endDate)
        ]);
        setStatusData(statusResult);
        setResponseTimeData(responseResult);
        setHealthData(healthResult);
      } catch (error) {
        console.error('Failed to fetch status distribution', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedMonitor, startDate, endDate]);

  const statusCodes = useMemo(() => {
    if (!statusData || statusData.length === 0) return [];
    const keys = new Set();
    statusData.forEach(item => {
      Object.keys(item).forEach(key => {
        if (key !== 'time' && key !== 'total') keys.add(key);
      });
    });
    return Array.from(keys).sort();
  }, [statusData]);

  const monitorNames = useMemo(() => {
    if (!responseTimeData || responseTimeData.length === 0) return [];
    const keys = new Set();
    responseTimeData.forEach(item => {
      Object.keys(item).forEach(key => {
        if (key !== 'time' && !key.endsWith('_max')) keys.add(key);
      });
    });
    return Array.from(keys);
  }, [responseTimeData]);

  const healthStatuses = useMemo(() => {
    if (!healthData || healthData.length === 0) return [];
    const keys = new Set();
    healthData.forEach(item => {
      Object.keys(item).forEach(key => {
        if (key !== 'time' && key !== 'unknown') keys.add(key);
      });
    });
    return Array.from(keys).sort();
  }, [healthData]);

  const getColorForHealth = (status) => {
    if (status === 'up') return '#2ecc71';
    if (status === 'degraded') return '#f39c12';
    if (status === 'down') return '#e74c3c';
    return '#95a5a6';
  };

  const getColorForCode = (code) => {
    const colorMap = {
      '200': '#2ecc71',
      '201': '#27ae60',
      '301': '#3498db',
      '302': '#2980b9',
      '400': '#f1c40f',
      '401': '#f39c12',
      '403': '#e67e22',
      '404': '#e74c3c',
      '500': '#c0392b',
      '502': '#c0392b',
      '503': '#e74c3c',
      'Timeout_Error': '#f800e8ff'
    };
    if (colorMap[code]) return colorMap[code];
    if (code.startsWith('2')) return '#2ecc71';
    if (code.startsWith('4')) return '#f39c12';
    if (code.startsWith('5')) return '#c0392b';
    return '#9b59b6';
  };

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-xl)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
        <div>
          <h1 className="heading-lg" style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>Analytics</h1>
          <p className="body-md" style={{ marginTop: 'var(--space-xs)' }}>Hourly distribution of HTTP status codes and performance metrics.</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
          <input 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)}
            style={{
              padding: '8px 12px',
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--hairline)',
              borderRadius: 'var(--rounded-sm)',
              outline: 'none',
              colorScheme: 'dark'
            }}
          />
          <input 
            type="date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)}
            style={{
              padding: '8px 12px',
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--hairline)',
              borderRadius: 'var(--rounded-sm)',
              outline: 'none',
              colorScheme: 'dark'
            }}
          />
          <select 
            value={selectedMonitor} 
            onChange={(e) => setSelectedMonitor(e.target.value)}
            style={{
              padding: '8px 12px',
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--hairline)',
              borderRadius: 'var(--rounded-sm)',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Monitors</option>
            {monitors.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
          <h3 className="card-title" style={{ textTransform: 'uppercase', margin: 0 }}>HTTP Code Count</h3>
          
          <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
            <select 
              value={selectedCode} 
              onChange={(e) => setSelectedCode(e.target.value)}
              style={{
                padding: '8px 12px',
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-primary)',
                border: '1px solid var(--hairline)',
                borderRadius: 'var(--rounded-sm)',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Status Codes</option>
              {statusCodes.map(c => (
                <option key={c} value={c}>{c === 'Timeout_Error' ? 'Timeout / Error' : c}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ width: '100%', height: '400px' }}>
          {loading ? (
            <div className="body-md" style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              Loading data...
            </div>
          ) : statusData.length === 0 ? (
            <div className="body-md" style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              No data available for the selected period.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--hairline-strong)" vertical={false} />
                <XAxis dataKey="time" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--hairline)', borderRadius: 'var(--rounded-sm)', color: 'var(--text-primary)' }}
                  itemStyle={{ fontSize: '12px' }}
                  formatter={(value, name, props) => {
                    const payload = props.payload;
                    let total = 0;
                    Object.keys(payload).forEach(key => {
                      if (key !== 'time' && typeof payload[key] === 'number') {
                        total += payload[key];
                      }
                    });
                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                    return [`${value} (${percentage}%)`, name];
                  }}
                />
                <Legend iconType="circle" />
                {statusCodes
                  .filter(code => selectedCode === 'all' || code === selectedCode)
                  .map(code => (
                  <Bar 
                    key={code} 
                    dataKey={code} 
                    name={code === 'Timeout_Error' ? 'Timeout / Network Error' : `Status ${code}`} 
                    stackId="a" 
                    fill={getColorForCode(code)} 
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
      <div className="panel" style={{ marginTop: 'var(--space-xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
          <h3 className="card-title" style={{ textTransform: 'uppercase', margin: 0 }}>Health Status Count</h3>
          
          <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
            <select 
              value={selectedHealth} 
              onChange={(e) => setSelectedHealth(e.target.value)}
              style={{
                padding: '8px 12px',
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-primary)',
                border: '1px solid var(--hairline)',
                borderRadius: 'var(--rounded-sm)',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Statuses</option>
              {healthStatuses.map(c => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ width: '100%', height: '400px' }}>
          {loading ? (
            <div className="body-md" style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              Loading data...
            </div>
          ) : healthData.length === 0 ? (
            <div className="body-md" style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              No data available for the selected period.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={healthData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--hairline-strong)" vertical={false} />
                <XAxis dataKey="time" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--hairline)', borderRadius: 'var(--rounded-sm)', color: 'var(--text-primary)' }}
                  itemStyle={{ fontSize: '12px' }}
                  formatter={(value, name, props) => {
                    const payload = props.payload;
                    let total = 0;
                    Object.keys(payload).forEach(key => {
                      if (key !== 'time' && typeof payload[key] === 'number') {
                        total += payload[key];
                      }
                    });
                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                    return [`${value} (${percentage}%)`, name.charAt(0).toUpperCase() + name.slice(1)];
                  }}
                />
                <Legend iconType="circle" formatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)} />
                {healthStatuses
                  .filter(status => selectedHealth === 'all' || status === selectedHealth)
                  .map(status => (
                  <Bar 
                    key={status} 
                    dataKey={status} 
                    name={status} 
                    stackId="a" 
                    fill={getColorForHealth(status)} 
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
      <div className="panel" style={{ marginTop: 'var(--space-xl)' }}>
        <h3 className="card-title" style={{ textTransform: 'uppercase', marginBottom: 'var(--space-lg)' }}>Average Response Time (ms)</h3>
        <div style={{ width: '100%', height: '400px' }}>
          {loading ? (
            <div className="body-md" style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              Loading data...
            </div>
          ) : responseTimeData.length === 0 ? (
            <div className="body-md" style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              No data available for the selected period.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={responseTimeData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--hairline-strong)" vertical={false} />
                <XAxis dataKey="time" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--hairline)', borderRadius: 'var(--rounded-sm)', color: 'var(--text-primary)' }}
                  itemStyle={{ fontSize: '12px' }}
                  formatter={(value) => `${value} ms`}
                />
                <Legend iconType="circle" />
                {monitorNames.map((name, index) => {
                  const colors = ['var(--primary)', '#3498db', '#f1c40f', '#e74c3c', '#9b59b6'];
                  const color = colors[index % colors.length];
                  return (
                    <Line 
                      key={name} 
                      type="monotone" 
                      dataKey={name} 
                      stroke={color} 
                      strokeWidth={2} 
                      dot={false}
                      activeDot={{ r: 4, fill: color, stroke: 'var(--bg-panel)' }} 
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
