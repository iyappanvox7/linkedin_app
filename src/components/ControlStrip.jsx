import React, { useState } from 'react';
import { FileText, Briefcase, Play, Square, BookOpen } from 'lucide-react';
import { KEYWORD_LIBRARY } from '../config/constants';

export default function ControlStrip({
  searchQuery, onSearchQueryChange,
  intentFilter, onIntentFilterChange,
  statusFilter, onStatusFilterChange,
  leadTypeFilter, onLeadTypeFilterChange,
  keyword, onKeywordChange,
  location, onLocationChange,
  maxPosts, onMaxPostsChange,
  mode, onModeChange,
  isLoading, isConnected,
  onStartScanning, onStopScanning,
}) {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedKeyword, setSelectedKeyword] = useState('');

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);
    setSelectedKeyword('');
    onKeywordChange('');
  };

  const handleKeywordSelect = (e) => {
    const kw = e.target.value;
    setSelectedKeyword(kw);
    onKeywordChange(kw);
  };

  return (
    <div style={{
      background: '#fff',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      padding: '16px 24px',
      marginBottom: '20px'
    }}>
      
      {/* ROW 1: SCAN CONTROLS */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
        
        <div style={{ display: 'flex', border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
          <button 
            onClick={() => onModeChange('posts')}
            style={{
              padding: '8px 16px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: mode === 'posts' ? '#166534' : '#fff',
              color: mode === 'posts' ? '#fff' : '#475569',
              transition: 'all 0.2s'
            }}
          >
            <FileText size={16} /> Posts
          </button>
          <button 
            onClick={() => onModeChange('jobs')}
            style={{
              padding: '8px 16px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: mode === 'jobs' ? '#166534' : '#fff',
              color: mode === 'jobs' ? '#fff' : '#475569',
              transition: 'all 0.2s'
            }}
          >
            <Briefcase size={16} /> Jobs
          </button>
        </div>

        <input
          type="text"
          placeholder={mode === 'jobs' ? "Job Role (e.g. React Developer)" : "Keyword (e.g. hiring tamilnadu)"}
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          style={{ flex: 1.5, minWidth: '150px', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', outline: 'none' }}
        />

        {mode === 'jobs' && (
          <input
            type="text"
            placeholder="Location (e.g. Chennai)"
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
            style={{ flex: 1, minWidth: '120px', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', outline: 'none' }}
          />
        )}

        <select
          value={maxPosts}
          onChange={(e) => onMaxPostsChange(Number(e.target.value))}
          style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', background: '#fff', cursor: 'pointer' }}
        >
          <option value={3}>Max: 3</option>
          <option value={5}>Max: 5</option>
          <option value={10}>Max: 10</option>
          <option value={25}>Max: 25</option>
          <option value={50}>Max: 50</option>
        </select>

        <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
          <button
            onClick={onStartScanning}
            disabled={isLoading || !isConnected}
            style={{
              padding: '8px 20px',
              background: isLoading ? '#94a3b8' : '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              fontSize: '14px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {isLoading ? 'Scanning...' : <><Play size={16} /> Start Scan</>}
          </button>

          {isLoading && (
            <button
              onClick={onStopScanning}
              style={{
                padding: '8px 16px',
                background: '#ef4444',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Square size={16} /> Stop
            </button>
          )}
        </div>
      </div>

      {/* ROW 2: FILTER CONTROLS */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
        
        <input
          type="text"
          placeholder="Filter saved records..."
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          style={{ flex: 1, minWidth: '150px', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', outline: 'none' }}
        />

        <select
          value={intentFilter}
          onChange={(e) => onIntentFilterChange(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', background: '#fff', cursor: 'pointer', minWidth: '140px' }}
        >
          <option value="ALL">All Intents</option>
          <option value="HIGH">HIGH Priority</option>
          <option value="MEDIUM">MEDIUM Priority</option>
          <option value="LOW">LOW Priority</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', background: '#fff', cursor: 'pointer', minWidth: '140px' }}
        >
          <option value="ALL">All Stages</option>
          <option value="New">New</option>
          <option value="Contacted">Contacted</option>
          <option value="Qualified">Qualified</option>
          <option value="Closed Won">Won</option>
          <option value="Closed Lost">Lost</option>
        </select>

        <select
          value={leadTypeFilter}
          onChange={(e) => onLeadTypeFilterChange(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            fontSize: '14px',
            background: '#fff',
            cursor: 'pointer',
            minWidth: '120px'
          }}
        >
          <option value="ALL">All Types</option>
          <option value="Hiring">📢 Hiring</option>
          <option value="Information">📄 Info</option>
          <option value="General">General</option>
        </select>

        {/* 🟢 LIBRARY DROPDOWNS – HIDDEN IN POSTS MODE */}
        {mode !== 'posts' && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginLeft: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '500', color: '#475569' }}>
              <BookOpen size={14} /> Library:
            </div>
            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              style={{ padding: '8px 12px', border: '1px solid #94a3b8', borderRadius: '6px', fontSize: '13px', background: '#f8fafc', cursor: 'pointer', minWidth: '130px' }}
            >
              <option value="">Category...</option>
              {Object.keys(KEYWORD_LIBRARY).map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>

            {selectedCategory && (
              <select
                value={selectedKeyword}
                onChange={handleKeywordSelect}
                style={{ padding: '8px 12px', border: '1px solid #2563eb', borderRadius: '6px', fontSize: '13px', background: '#fff', cursor: 'pointer', minWidth: '180px' }}
              >
                <option value="">Select keyword...</option>
                {KEYWORD_LIBRARY[selectedCategory].map((kw, idx) => <option key={idx} value={kw}>{kw}</option>)}
              </select>
            )}
          </div>
        )}
      </div>
    </div>
  );
}