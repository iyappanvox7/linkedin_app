import React, { useState, useEffect } from 'react';
import { getUserPreferences, updateUserPreferences } from '../api/client';
import { getCustomKeywords } from '../api/client';
import { KEYWORD_LIBRARY } from '../config/constants';

export default function UserPreferences() {
  const [category, setCategory] = useState('');
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [customKeywords, setCustomKeywords] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showModal, setShowModal] = useState(false);

  // Combined category list with "⭐ Custom"
  const getCategories = () => {
    const cats = Object.keys(KEYWORD_LIBRARY);
    if (customKeywords.length > 0) {
      return [...cats, '⭐ Custom'];
    }
    return cats;
  };

  // Get keywords for a given category
  const getKeywordsForCategory = (cat) => {
    if (cat === '⭐ Custom') {
      return customKeywords;
    }
    return KEYWORD_LIBRARY[cat] || [];
  };

  useEffect(() => {
    loadPreferences();
  }, [refreshTrigger]);

  const loadPreferences = async () => {
    try {
      const [prefsRes, customRes] = await Promise.all([
        getUserPreferences(),
        getCustomKeywords()
      ]);
      
      if (prefsRes.data && prefsRes.data.category) {
        setCategory(prefsRes.data.category);
        setKeyword(prefsRes.data.keyword);
      }
      setCustomKeywords(customRes.data || []);
    } catch (err) {
      console.error('Failed to load preferences:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!category || !keyword) {
      setMessage('Please select both category and keyword.');
      return;
    }
    // If category is "⭐ Custom", use the keyword as the category for storage
    const actualCategory = category === '⭐ Custom' ? '⭐ Custom' : category;
    setSaving(true);
    setMessage('');
    try {
      await updateUserPreferences({ category: actualCategory, keyword });
      setMessage('✅ Preferences saved successfully!');
      setShowModal(true);
    } catch (err) {
      setMessage('❌ Failed to save preferences.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleCustomKeywordAdded = () => {
    // Refresh custom keywords
    setRefreshTrigger(prev => prev + 1);
  };

  if (loading) return <div>Loading preferences...</div>;

  const categories = getCategories();
  const availableKeywords = getKeywordsForCategory(category);

  return (
    <div style={{
      background: '#fff',
      borderRadius: '12px',
      padding: '20px 24px',
      marginBottom: '20px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
    }}>
      <h3 style={{ margin: '0 0 12px 0', color: '#0f172a' }}>🔧 Your Auto‑Scrape Settings</h3>
      <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 16px 0' }}>
        Set your preferred category and keyword. The system will scrape LinkedIn automatically every 15 minutes.
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
        <div style={{ flex: '1 1 200px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Category</label>
          <select
            value={category}
            onChange={(e) => {
              const cat = e.target.value;
              setCategory(cat);
              setKeyword('');
            }}
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
          >
            <option value="">Select a category...</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div style={{ flex: '1 1 200px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Keyword</label>
          <select
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            disabled={!category}
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
          >
            <option value="">Select a keyword...</option>
            {availableKeywords.map((kw) => (
              <option key={kw} value={kw}>{kw}</option>
            ))}
          </select>
        </div>

        <div style={{ flex: '0 0 auto', alignSelf: 'flex-end' }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '8px 24px',
              background: '#166534',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.6 : 1
            }}
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>

      {message && <div style={{ marginTop: '12px', fontSize: '14px', fontWeight: '500' }}>{message}</div>}

      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            textAlign: 'center',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: '#dcfce7',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '30px',
              margin: '0 auto 16px auto'
            }}>
              📬
            </div>
            <h4 style={{ margin: '0 0 8px 0', color: '#0f172a', fontSize: '18px', fontWeight: '700' }}>Preferences Saved</h4>
            <p style={{ margin: '0 0 24px 0', color: '#64748b', fontSize: '14px', lineHeight: '1.5' }}>
              You will receive your leads daily at 4:30 PM.
            </p>
            <button
              onClick={() => setShowModal(false)}
              style={{
                width: '100%',
                padding: '10px 16px',
                backgroundColor: '#166534',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}