import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLeads } from '../hooks/useLeads.jsx';
import Header from '../components/Header';
import ControlStrip from '../components/ControlStrip';
import LeadsTable from '../components/LeadsTable';
import UserPreferences from '../components/UserPreferences';
import CustomKeywordsManager from '../components/CustomKeywordsManager';
import { checkScrapingStatus, api } from '../api/client';
import { KEYWORD_LIBRARY } from '../config/constants';

export default function Dashboard() {
  const {
    leads,
    isConnected,
    isLoading,
    setIsLoading,
    initialLoading,
    addLeads,
    removeLead,
    connectAccount,
    disconnectAccount,
    loadLeads,
    checkConnectionStatus,
  } = useLeads();

  const { logout, user } = useAuth();

  const [keyword, setKeyword] = useState('hiring tamilnadu');
  const [maxPosts, setMaxPosts] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [mode, setMode] = useState('posts');
  const [location, setLocation] = useState('');
  const [intentFilter, setIntentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [leadTypeFilter, setLeadTypeFilter] = useState('ALL');

  const [showScrapingOverlay, setShowScrapingOverlay] = useState(false);
  const [checkingInterval, setCheckingInterval] = useState(null);

  useEffect(() => {
    if (user) {
      checkConnectionStatus();
      checkScrapingStatus().then(data => {
        if (data.running) {
          setShowScrapingOverlay(true);
          const interval = setInterval(async () => {
            const res = await checkScrapingStatus();
            if (!res.running) {
              setShowScrapingOverlay(false);
              clearInterval(interval);
            }
          }, 5000);
          setCheckingInterval(interval);
        }
      });
    } else {
      if (checkingInterval) {
        clearInterval(checkingInterval);
        setCheckingInterval(null);
      }
    }
  }, [user, checkConnectionStatus]);

  const handleStartScanning = async () => {
    if (!keyword.trim()) { return alert("Please type a keyword!"); }
    if (mode === 'jobs' && !location.trim()) { return alert("Please type a location!"); }
    await addLeads(keyword, maxPosts, mode, location);
  };

  const handleStopScanning = async () => {
    try {
      await api.post('/stop-scanning');
      if (window.activePollingTimerKey) clearInterval(window.activePollingTimerKey);
      if (window.activeBatchPollingTimerKey) {
        clearInterval(window.activeBatchPollingTimerKey);
        window.activeBatchPollingTimerKey = null;
      }
      setIsLoading(false);
      setShowScrapingOverlay(false);
      if (checkingInterval) {
        clearInterval(checkingInterval);
        setCheckingInterval(null);
      }
    } catch (err) {
      console.error("Failed to stop scanning:", err);
    }
  };

  const exportToCSV = () => {
    if (filteredLeads.length === 0) return alert("No leads to export!");
    const headers = ['Job Title', 'Company', 'Location', 'Skills', 'Email', 'Phone', 'Experience', 'Sales Intent', 'AI Summary', 'Role'];
    const csvRows = filteredLeads.map(lead => [
      `"${String(lead.job_title || 'N/A').replace(/"/g, '""')}"`,
      `"${String(lead.company_name || 'N/A').replace(/"/g, '""')}"`,
      `"${String(lead.job_location || 'N/A').replace(/"/g, '""')}"`,
      `"${String(lead.skills_required ? (Array.isArray(lead.skills_required) ? lead.skills_required.join('; ') : lead.skills_required) : '').replace(/"/g, '""')}"`,
      `"${String(lead.contact_email_or_link || 'N/A').replace(/"/g, '""')}"`,
      `"${String(lead.contact_phone || 'N/A').replace(/"/g, '""')}"`,
      `"${String(lead.experience_required || 'N/A').replace(/"/g, '""')}"`,
      `"${String(lead.sales_intent || 'LOW').replace(/"/g, '""')}"`,
      `"${String(lead.ai_summary || 'N/A').replace(/"/g, '""')}"`,
      `"${String(lead.role_or_project || lead.job_title || 'N/A').replace(/"/g, '""')}"`
    ]);
    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Leads_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ✅ FIXED: Convert fields to strings before using .toLowerCase()
  const filteredLeads = useMemo(() => {
    let filtered = leads.filter(lead => {
      const role = String(lead.role_or_project || '');
      const company = String(lead.company_name || '');
      const matchesMode = (!lead.source || lead.source === mode);
      const matchesSearch = role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            company.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesMode && matchesSearch;
    });
    if (intentFilter !== 'ALL') {
      filtered = filtered.filter(lead => lead.sales_intent === intentFilter);
    }
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(lead => lead.status === statusFilter);
    }
    if (leadTypeFilter !== 'ALL') {
      filtered = filtered.filter(lead => lead.lead_type === leadTypeFilter);
    }
    return filtered;
  }, [leads, searchQuery, mode, intentFilter, statusFilter, leadTypeFilter]);

  const handleAppLogout = () => {
    if (window.confirm("Are you sure you want to log out of the application?")) {
      logout();
    }
  };

  // 🟢 Full-page loading spinner
  if (initialLoading) {
    return (
      <div style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f1f5f9'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #e2e8f0',
            borderTopColor: '#166534',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#475569', fontSize: '16px' }}>Loading your dashboard...</p>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', minHeight: '100vh', padding: '30px 40px', backgroundColor: '#f1f5f9', boxSizing: 'border-box' }}>
      <Header leadsCount={leads.length} onLogout={handleAppLogout} onExport={exportToCSV} />

      {showScrapingOverlay && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          backdropFilter: 'blur(6px)'
        }}>
          <div style={{
            background: '#fff',
            padding: '40px 50px',
            borderRadius: '16px',
            maxWidth: '500px',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <h2 style={{ marginTop: 0, color: '#1e293b' }}>🔄 Scraping in Progress</h2>
            <p style={{ fontSize: '16px', color: '#475569', lineHeight: 1.6 }}>
              Your scraping engine is running in the background.<br/>
              Do you want to stop it?
            </p>
            <button
              onClick={handleStopScanning}
              style={{
                background: '#dc2626',
                color: '#fff',
                border: 'none',
                padding: '12px 30px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                marginTop: '20px',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = '#b91c1c'}
              onMouseLeave={(e) => e.target.style.background = '#dc2626'}
            >
              🛑 Stop Scraping
            </button>
          </div>
        </div>
      )}

      {!isConnected && (
        <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', padding: '16px 20px', borderRadius: '12px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ fontWeight: 600, color: '#b45309', margin: '0 0 4px 0', fontSize: '16px' }}>⚠️ LinkedIn Authentication Disconnected</h4>
            <p style={{ color: '#d97706', margin: 0, fontSize: '14px' }}>Your browser session file is missing. Click below to reconnect.</p>
          </div>
          <button onClick={connectAccount} style={{ background: '#d97706', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>🔒 Securely Connect Account</button>
        </div>
      )}

      {mode === 'posts' && (
        <>
          <CustomKeywordsManager onKeywordAdded={() => {
            window.location.reload();
          }} />
          <UserPreferences />
        </>
      )}

      <ControlStrip
        searchQuery={searchQuery} onSearchQueryChange={setSearchQuery}
        intentFilter={intentFilter} onIntentFilterChange={setIntentFilter}
        statusFilter={statusFilter} onStatusFilterChange={setStatusFilter}
        leadTypeFilter={leadTypeFilter} onLeadTypeFilterChange={setLeadTypeFilter}
        keyword={keyword} onKeywordChange={setKeyword}
        location={location} onLocationChange={setLocation}
        maxPosts={maxPosts} onMaxPostsChange={setMaxPosts}
        mode={mode} onModeChange={setMode}
        isLoading={isLoading} isConnected={isConnected}
        onStartScanning={handleStartScanning} onStopScanning={handleStopScanning}
      />

      <LeadsTable filteredLeads={filteredLeads} onRemoveLead={removeLead} mode={mode} refreshLeads={loadLeads} />
    </div>
  );
}