import React, { useState, useEffect } from 'react';

export default function TaskManagerApp({ windows = [], onCloseWindow }) {
  const [activeTab, setActiveTab] = useState('processes'); // 'processes' | 'performance'
  const [selectedWinId, setSelectedWinId] = useState(null);
  const [cpuUsage, setCpuUsage] = useState(12);

  useEffect(() => {
    const timer = setInterval(() => {
      setCpuUsage(Math.floor(8 + Math.random() * 15));
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'Tahoma, sans-serif' }}>
      {/* Tab Header */}
      <div
        style={{
          display: 'flex',
          backgroundColor: '#ece9d8',
          borderBottom: '1px solid #716f64',
          padding: '4px 6px 0 6px',
          gap: '4px',
          fontSize: '11px',
        }}
      >
        <button
          onClick={() => setActiveTab('processes')}
          style={{
            padding: '4px 12px',
            backgroundColor: activeTab === 'processes' ? '#ffffff' : '#ece9d8',
            border: '1px solid #716f64',
            borderBottom: activeTab === 'processes' ? '1px solid #ffffff' : '1px solid #716f64',
            borderTopLeftRadius: '3px',
            borderTopRightRadius: '3px',
            cursor: 'pointer',
            fontWeight: activeTab === 'processes' ? 'bold' : 'normal',
          }}
        >
          Applications / Processes
        </button>
        <button
          onClick={() => setActiveTab('performance')}
          style={{
            padding: '4px 12px',
            backgroundColor: activeTab === 'performance' ? '#ffffff' : '#ece9d8',
            border: '1px solid #716f64',
            borderBottom: activeTab === 'performance' ? '1px solid #ffffff' : '1px solid #716f64',
            borderTopLeftRadius: '3px',
            borderTopRightRadius: '3px',
            cursor: 'pointer',
            fontWeight: activeTab === 'performance' ? 'bold' : 'normal',
          }}
        >
          Performance
        </button>
      </div>

      {/* Tab Body */}
      {activeTab === 'processes' ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '8px', backgroundColor: '#ece9d8' }}>
          {/* Process List Table */}
          <div
            style={{
              flex: 1,
              backgroundColor: '#ffffff',
              border: '2px inset #999',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Table Header */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr',
                backgroundColor: '#ece9d8',
                borderBottom: '1px solid #999',
                padding: '4px 8px',
                fontWeight: 'bold',
                fontSize: '11px',
              }}
            >
              <div>Task Name</div>
              <div>Status</div>
              <div>CPU %</div>
              <div>Mem Usage</div>
            </div>

            {/* System Kernel Process */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr',
                padding: '4px 8px',
                fontSize: '11px',
                borderBottom: '1px solid #f0f0f0',
              }}
            >
              <div>🧠 System Kernel</div>
              <div style={{ color: '#008000' }}>Running</div>
              <div>2%</div>
              <div>32,450 K</div>
            </div>

            {/* Open Windows / Apps */}
            {windows.map((w) => {
              const isSelected = selectedWinId === w.id;
              return (
                <div
                  key={w.id}
                  onClick={() => setSelectedWinId(w.id)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr 1fr',
                    padding: '4px 8px',
                    fontSize: '11px',
                    backgroundColor: isSelected ? '#316ac5' : '#ffffff',
                    color: isSelected ? '#ffffff' : '#000000',
                    cursor: 'pointer',
                    borderBottom: '1px solid #f0f0f0',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>{w.icon}</span>
                    <span>{w.title}</span>
                  </div>
                  <div>Running</div>
                  <div>1%</div>
                  <div>14,280 K</div>
                </div>
              );
            })}
          </div>

          {/* Action Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button
              disabled={!selectedWinId}
              onClick={() => {
                if (selectedWinId && onCloseWindow) {
                  onCloseWindow(selectedWinId);
                  setSelectedWinId(null);
                }
              }}
              style={{
                padding: '4px 16px',
                backgroundColor: '#ece9d8',
                border: '1px solid #716f64',
                borderRadius: '2px',
                fontSize: '11px',
                cursor: selectedWinId ? 'pointer' : 'default',
                opacity: selectedWinId ? 1 : 0.6,
              }}
            >
              End Task
            </button>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, padding: '12px', backgroundColor: '#ece9d8', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* CPU History Graph */}
          <div style={{ backgroundColor: '#000000', border: '2px inset #999', padding: '8px', color: '#00ff00' }}>
            <div style={{ fontSize: '11px', marginBottom: '4px' }}>CPU Usage: {cpuUsage}%</div>
            <div
              style={{
                height: '80px',
                display: 'flex',
                alignItems: 'flex-end',
                gap: '4px',
                backgroundColor: '#001a00',
                border: '1px solid #005500',
                padding: '2px',
              }}
            >
              {[15, 20, 10, 8, 12, 14, 25, 18, 12, 16, 22, cpuUsage].map((val, idx) => (
                <div
                  key={idx}
                  style={{
                    flex: 1,
                    height: `${val}%`,
                    backgroundColor: '#00ff00',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Memory Usage */}
          <div style={{ backgroundColor: '#000000', border: '2px inset #999', padding: '8px', color: '#00ff00' }}>
            <div style={{ fontSize: '11px', marginBottom: '4px' }}>Memory Usage: 168 MB / 512 MB</div>
            <div
              style={{
                height: '18px',
                backgroundColor: '#001a00',
                border: '1px solid #005500',
                position: 'relative',
              }}
            >
              <div style={{ width: '33%', height: '100%', backgroundColor: '#00ff00' }} />
            </div>
          </div>
        </div>
      )}

      {/* Status Bar */}
      <div
        style={{
          height: '20px',
          backgroundColor: '#ece9d8',
          borderTop: '1px solid #d0ccb8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 8px',
          fontSize: '11px',
          color: '#333333',
        }}
      >
        <span>Processes: {windows.length + 1}</span>
        <span>CPU Usage: {cpuUsage}%</span>
        <span>Physical Memory: 33%</span>
      </div>
    </div>
  );
}
