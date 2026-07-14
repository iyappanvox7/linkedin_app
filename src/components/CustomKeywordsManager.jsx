import React, { useState, useEffect } from 'react';
import { getCustomKeywords, addCustomKeyword, removeCustomKeyword } from '../api/client';

export default function CustomKeywordsManager({ onKeywordAdded }) {
  const [customKeywords, setCustomKeywords] = useState([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadCustomKeywords();
  }, []);

  const loadCustomKeywords = async () => {
    try {
      const res = await getCustomKeywords();
      setCustomKeywords(res.data || []);
    } catch (err) {
      console.error('Failed to load custom keywords:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddKeyword = async () => {
    if (!newKeyword.trim()) {
      setMessage('Please enter a keyword.');
      return;
    }
    try {
      await addCustomKeyword(newKeyword.trim());
      setMessage(`✅ Added: "${newKeyword.trim()}"`);
      setNewKeyword('');
      await loadCustomKeywords();
      // Notify parent component to refresh the keyword dropdown
      if (onKeywordAdded) onKeywordAdded();
    } catch (err) {
      setMessage('❌ Failed to add keyword.');
      console.error(err);
    }
  };

  const handleRemoveKeyword = async (keyword) => {
    if (!window.confirm(`Remove "${keyword}" from your custom keywords?`)) return;
    try {
      await removeCustomKeyword(keyword);
      await loadCustomKeywords();
      if (onKeywordAdded) onKeywordAdded();
    } catch (err) {
      setMessage('❌ Failed to remove keyword.');
      console.error(err);
    }
  };

  if (loading) return <div>Loading custom keywords...</div>;

  return (
    <div style={{
      background: '#fff',
      borderRadius: '12px',
      padding: '20px 24px',
      marginBottom: '20px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      border: '1px solid #e2e8f0'
    }}>
      <h3 style={{ margin: '0 0 8px 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
        ⭐ Custom Keywords
      </h3>
      <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 16px 0' }}>
        Add your own keywords that aren't in the library. They will appear in the dropdown under "⭐ Custom".
      </p>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Enter your search keyword..."
          value={newKeyword}
          onChange={(e) => setNewKeyword(e.target.value)}
          style={{
            flex: '1 1 300px',
            padding: '10px 14px',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none'
          }}
          onKeyPress={(e) => { if (e.key === 'Enter') handleAddKeyword(); }}
        />
        <button
          onClick={handleAddKeyword}
          style={{
            padding: '10px 24px',
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '14px',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
          onMouseEnter={(e) => e.target.style.background = '#1d4ed8'}
          onMouseLeave={(e) => e.target.style.background = '#2563eb'}
        >
          ➕ Add Keyword
        </button>
      </div>

      {message && (
        <div style={{
          marginTop: '12px',
          fontSize: '14px',
          fontWeight: '500',
          color: message.includes('✅') ? '#166534' : '#dc2626'
        }}>
          {message}
        </div>
      )}

      {customKeywords.length > 0 && (
        <div style={{ marginTop: '16px' }}>
          <p style={{ fontSize: '13px', fontWeight: '600', color: '#475569', margin: '0 0 8px 0' }}>
            Your Custom Keywords:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {customKeywords.map((kw, idx) => (
              <span
                key={idx}
                style={{
                  background: '#eff6ff',
                  color: '#1e40af',
                  padding: '4px 12px 4px 16px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  border: '1px solid #bfdbfe'
                }}
              >
                {kw}
                <button
                  onClick={() => handleRemoveKeyword(kw)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px',
                    color: '#94a3b8',
                    padding: '0 2px',
                    lineHeight: 1
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#dc2626'}
                  onMouseLeave={(e) => e.target.style.color = '#94a3b8'}
                  title="Remove keyword"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}