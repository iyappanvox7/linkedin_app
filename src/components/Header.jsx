import React from 'react';
// 🟢 Import icons
import { Zap, UploadCloud, LogOut } from 'lucide-react';

export default function Header({ leadsCount, onLogout, onExport }) {
  return (
    <header style={{ background: '#fff', padding: '20px 30px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <h1 style={{ margin: '0 0 5px 0', fontSize: '24px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Zap size={24} color="#f59e0b" fill="#f59e0b" /> {/* Replaces ⚡ */}
          Recruiter Lead Platform
        </h1>
        <p style={{ color: '#64748b', margin: 0, fontSize: '13px' }}>Full-Stack AI Sales Lead Dashboard</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div style={{ textAlign: 'right', borderRight: '1px solid #e2e8f0', paddingRight: '15px' }}>
          <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#2563eb', display: 'block' }}>{leadsCount}</span>
          <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '600' }}>CLOUD RECORDS</div>
        </div>

        <button onClick={onExport} style={{ background: 'transparent', color: '#16a34a', border: '1px solid #16a34a', padding: '8px 16px', borderRadius: '6px', fontWeight: '600', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}
          onMouseEnter={(e) => { e.target.style.background = '#16a34a'; e.target.style.color = '#fff'; }}
          onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#16a34a'; }}
        >
          <UploadCloud size={16} /> {/* Replaces 📥 */}
          Export CSV
        </button>

        <button onClick={onLogout} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: '600', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <LogOut size={16} /> {/* Replaces 🚪 */}
          LOG OUT
        </button>
      </div>
    </header>
  );
}