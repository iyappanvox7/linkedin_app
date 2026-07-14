import React, { useState } from 'react';
import { api } from '../api/client';
import Lottie from 'lottie-react';
import loadingAnimation from '../assets/loading.json';

// 🟢 Helper: safely render any value as a string
const safeString = (value, fallback = '') => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
};

export default function LeadsTable({ filteredLeads, onRemoveLead, mode, refreshLeads }) {
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [selectedLead, setSelectedLead] = useState(null);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteEditingLead, setNoteEditingLead] = useState(null);
  const [tempNoteText, setTempNoteText] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const toggleSelection = (index) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredLeads.length) {
      setSelectedIds(new Set());
    } else {
      const allIndices = new Set(filteredLeads.map((_, idx) => idx));
      setSelectedIds(allIndices);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setIsDeleting(true);
    setSelectedIds(new Set());

    try {
      const indicesToDelete = Array.from(selectedIds).sort((a, b) => b - a);
      const deletePromises = indicesToDelete.map(async (idx) => {
        const lead = filteredLeads[idx];
        if (lead) {
          await onRemoveLead(lead.job_title, lead.company_name);
        }
      });
      await Promise.all(deletePromises);
    } catch (err) {
      console.error("Bulk delete error:", err);
      alert("Failed to delete some leads.");
    } finally {
      setIsDeleting(false);
    }
  };

  const openModal = (lead) => setSelectedLead(lead);
  const closeModal = () => setSelectedLead(null);

  if (filteredLeads.length === 0) {
    return (
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '60px 20px',
        textAlign: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>📭</div>
        <h3 style={{ fontSize: '20px', color: '#0f172a', margin: '0 0 8px 0' }}>No Leads Found</h3>
        <p style={{ color: '#64748b', margin: 0 }}>Adjust your filters or start a new scan.</p>
      </div>
    );
  }

  return (
    <div style={{
      width: '100%',
      background: '#fff',
      borderRadius: '16px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
      overflow: 'hidden'
    }}>
      {isDeleting && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'transparent',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          pointerEvents: 'none'
        }}>
          <Lottie animationData={loadingAnimation} style={{ width: 160, height: 160 }} />
        </div>
      )}

      {selectedIds.size > 0 && (
        <div style={{
          padding: '14px 24px',
          background: '#f0fdf4',
          borderBottom: '1px solid #dcfce7',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#166534' }}>
            {selectedIds.size} lead(s) selected
          </span>
          <button
            onClick={handleBulkDelete}
            style={{
              background: '#dc2626',
              color: '#fff',
              border: 'none',
              padding: '8px 20px',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = '#b91c1c'}
            onMouseLeave={(e) => e.target.style.background = '#dc2626'}
          >
            🗑️ Delete Selected
          </button>
        </div>
      )}

      {/* Notes Edit Modal */}
      {isNoteModalOpen && noteEditingLead && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.4)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1001,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            maxWidth: '500px',
            width: '90%',
            padding: '32px',
            position: 'relative',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
          }}>
            <h2 style={{ marginTop: '0', color: '#0f172a', fontSize: '20px', fontWeight: '700' }}>📝 Edit Lead Note</h2>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '16px' }}>
              Add internal notes for <strong>{safeString(noteEditingLead.job_title, 'Unknown')}</strong> at <strong>{safeString(noteEditingLead.company_name, 'Unknown')}</strong>
            </p>

            <textarea
              value={tempNoteText}
              onChange={(e) => setTempNoteText(e.target.value)}
              placeholder="Enter your conversation history or follow-up notes..."
              style={{
                width: '100%',
                minHeight: '120px',
                padding: '12px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'vertical',
                marginBottom: '16px'
              }}
            />

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setIsNoteModalOpen(false)}
                style={{
                  padding: '10px 20px',
                  background: '#e2e8f0',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                disabled={isSavingNote}
                onClick={async () => {
                  setIsSavingNote(true);
                  try {
                    await api.put(`/update-lead-notes?job_title=${encodeURIComponent(safeString(noteEditingLead.job_title))}&company_name=${encodeURIComponent(safeString(noteEditingLead.company_name))}&notes=${encodeURIComponent(tempNoteText)}`);
                    setIsNoteModalOpen(false);
                    await refreshLeads();
                  } catch (err) {
                    console.error("Error saving note:", err);
                    alert("Failed to save the note. Please try again.");
                  } finally {
                    setIsSavingNote(false);
                  }
                }}
                style={{
                  padding: '10px 20px',
                  background: isSavingNote ? '#94a3b8' : '#166534',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: isSavingNote ? 'not-allowed' : 'pointer'
                }}
              >
                {isSavingNote ? 'Saving...' : 'Save Note'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lead Details Modal */}
      {selectedLead && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.4)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '32px',
            position: 'relative',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
          }}>
            <button
              onClick={closeModal}
              style={{
                position: 'absolute',
                top: '16px',
                right: '20px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#64748b',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.color = '#0f172a'}
              onMouseLeave={(e) => e.target.style.color = '#64748b'}
            >
              ✕
            </button>

            <h2 style={{ marginTop: '0', color: '#0f172a', fontSize: '24px', fontWeight: '700' }}>📄 Lead Details</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {selectedLead.image_url && (
                <div style={{ textAlign: 'center', marginBottom: '4px' }}>
                  <div
                    style={{
                      display: 'inline-block',
                      position: 'relative',
                      cursor: 'pointer',
                      transition: 'transform 0.2s'
                    }}
                    onClick={() => window.open(selectedLead.image_url, '_blank')}
                  >
                    <img
                      src={selectedLead.image_url}
                      alt="Post Banner"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '300px',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      bottom: '12px',
                      right: '12px',
                      background: 'rgba(0,0,0,0.75)',
                      color: '#fff',
                      padding: '6px 14px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      backdropFilter: 'blur(4px)'
                    }}>
                      <span style={{ fontSize: '14px' }}>🔍</span> View Full
                    </div>
                  </div>
                </div>
              )}

              <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
                <h3 style={{ margin: '0 0 6px 0', color: '#0f172a', fontSize: '20px', fontWeight: '600' }}>
                  {safeString(selectedLead.role_or_project || selectedLead.job_title, 'Untitled')}
                </h3>
                <span style={{
                  background: '#f0fdf4',
                  color: '#166534',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  {safeString(selectedLead.company_name, 'Independent')}
                </span>
                <div style={{ marginTop: '8px', color: '#475569', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>📍</span> {safeString(selectedLead.job_location, 'Not Specified')}
                </div>
              </div>

              <div>
                <h4 style={{ color: '#0f172a', margin: '0 0 6px 0', fontSize: '16px', fontWeight: '600' }}>📝 AI Summary</h4>
                <p style={{ color: '#475569', lineHeight: '1.6', margin: '0' }}>
                  {safeString(selectedLead.ai_summary, 'No summary generated yet.')}
                </p>
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                <h4 style={{ color: '#0f172a', margin: '0 0 10px 0', fontSize: '16px', fontWeight: '600' }}>📞 Contact</h4>
                {selectedLead.contact_email_or_link ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                    {selectedLead.contact_email_or_link.includes('@') ? (
                      <a href={`mailto:${selectedLead.contact_email_or_link}`} style={{ color: '#2563eb', fontWeight: '600', textDecoration: 'none' }}>
                        ✉️ {safeString(selectedLead.contact_email_or_link)}
                      </a>
                    ) : (
                      <a href={selectedLead.contact_email_or_link} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', fontWeight: '600', textDecoration: 'none' }}>
                        🔗 {safeString(selectedLead.contact_email_or_link)}
                      </a>
                    )}
                    {selectedLead.contact_phone && selectedLead.contact_phone !== 'null' && (
                      <a href={`tel:${selectedLead.contact_phone}`} style={{ color: '#16a34a', fontWeight: '600', textDecoration: 'none' }}>
                        📞 {safeString(selectedLead.contact_phone)}
                      </a>
                    )}
                  </div>
                ) : (
                  <span style={{ color: '#94a3b8' }}>No Contact Provided</span>
                )}
              </div>

              {selectedLead.skills_required && selectedLead.skills_required.length > 0 && (
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                  <h4 style={{ color: '#0f172a', margin: '0 0 10px 0', fontSize: '16px', fontWeight: '600' }}>🛠️ Required Skills</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {selectedLead.skills_required.map((skill, idx) => (
                      <span key={idx} style={{
                        background: '#f0fdf4',
                        color: '#166534',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '13px'
                      }}>
                        {safeString(skill)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', fontSize: '13px', color: '#94a3b8' }}>
                <p style={{ margin: '0 0 4px 0' }}>
                  <strong>Extracted:</strong> {selectedLead.extracted_timestamp ? new Date(selectedLead.extracted_timestamp).toLocaleString() : 'Unknown'}
                </p>
                <p style={{ margin: '0' }}>
                  <strong>Category:</strong> {safeString(selectedLead.category || selectedLead.sales_intent, 'General')}
                </p>
              </div>

              <button
                onClick={closeModal}
                style={{
                  marginTop: '8px',
                  width: '100%',
                  padding: '12px',
                  background: '#166534',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '16px',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = '#14532d'}
                onMouseLeave={(e) => e.target.style.background = '#166534'}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px', border: '1px solid #cbd5e1' }}>
        <thead>
          <tr style={{ backgroundColor: '#166534', color: '#fff' }}>
            <th style={{ padding: '14px 12px', textAlign: 'center', width: '40px', border: '1px solid #cbd5e1' }}>
              <input
                type="checkbox"
                checked={selectedIds.size === filteredLeads.length && filteredLeads.length > 0}
                onChange={toggleSelectAll}
                style={{ transform: 'scale(1.1)', cursor: 'pointer', accentColor: '#22c55e' }}
              />
            </th>
            <th style={{ padding: '14px 12px', textAlign: 'center', width: '50px', fontWeight: '600', letterSpacing: '0.5px', fontSize: '13px', border: '1px solid #cbd5e1' }}>
              #
            </th>
            <th style={{ padding: '14px 12px', fontWeight: '600', letterSpacing: '0.5px', fontSize: '13px', border: '1px solid #cbd5e1' }}>Job Title</th>
            <th style={{ padding: '14px 12px', fontWeight: '600', letterSpacing: '0.5px', fontSize: '13px', border: '1px solid #cbd5e1' }}>Company</th>
            <th style={{ padding: '14px 12px', fontWeight: '600', letterSpacing: '0.5px', fontSize: '13px', width: '160px', minWidth: '140px', border: '1px solid #cbd5e1' }}>Location</th>
            <th style={{ padding: '14px 12px', fontWeight: '600', letterSpacing: '0.5px', fontSize: '13px', width: '120px', border: '1px solid #cbd5e1' }}>Pipeline</th>

            {mode === 'jobs' && (
              <>
                <th style={{ padding: '14px 12px', fontWeight: '600', letterSpacing: '0.5px', fontSize: '13px', border: '1px solid #cbd5e1' }}>Job URL</th>
                <th style={{ padding: '14px 12px', fontWeight: '600', letterSpacing: '0.5px', fontSize: '13px', width: '100px', border: '1px solid #cbd5e1' }}>Posted</th>
              </>
            )}

            <th style={{ padding: '14px 12px', fontWeight: '600', letterSpacing: '0.5px', fontSize: '13px', minWidth: '160px', border: '1px solid #cbd5e1' }}>Skills</th>
            <th style={{ padding: '14px 12px', fontWeight: '600', letterSpacing: '0.5px', fontSize: '13px', minWidth: '120px', border: '1px solid #cbd5e1' }}>Experience</th>
            <th style={{ padding: '14px 12px', fontWeight: '600', letterSpacing: '0.5px', fontSize: '13px', minWidth: '160px', border: '1px solid #cbd5e1' }}>Contacts</th>
            <th style={{ padding: '14px 12px', fontWeight: '600', letterSpacing: '0.5px', fontSize: '13px', width: '120px', border: '1px solid #cbd5e1' }}>Notes</th>
            <th style={{ padding: '14px 12px', fontWeight: '600', letterSpacing: '0.5px', fontSize: '13px', minWidth: '250px', width: '35%', border: '1px solid #cbd5e1' }}>AI Summary</th>
            <th style={{ padding: '14px 12px', textAlign: 'center', width: '60px', border: '1px solid #cbd5e1' }}>Manage</th>
          </tr>
        </thead>
        <tbody>
          {filteredLeads.map((lead, index) => (
            <tr
              key={index}
              style={{
                borderBottom: '1px solid #e2e8f0',
                backgroundColor: index % 2 === 0 ? '#ffffff' : '#f4fbf7',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f0fdf4'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#f4fbf7'; }}
            >
              <td style={{ padding: '14px 12px', textAlign: 'center', border: '1px solid #cbd5e1' }}>
                <input type="checkbox" checked={selectedIds.has(index)} onChange={() => toggleSelection(index)} style={{ transform: 'scale(1.1)', cursor: 'pointer', accentColor: '#22c55e' }} />
              </td>
              <td style={{ padding: '14px 12px', textAlign: 'center', fontWeight: '500', color: '#475569', fontSize: '14px', border: '1px solid #cbd5e1' }}>
                {index + 1}
              </td>
              <td style={{ padding: '14px 12px', fontWeight: '600', color: '#0f172a', fontSize: '14px', minWidth: '160px', border: '1px solid #cbd5e1' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{safeString(lead.role_or_project || lead.job_title, 'General Role')}</span>
                  {lead.lead_type === 'Hiring' && (
                    <span style={{
                      background: '#dcfce7',
                      color: '#166534',
                      padding: '2px 10px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '700',
                      letterSpacing: '0.3px',
                      textTransform: 'uppercase',
                      border: '1px solid #bbf7d0',
                      whiteSpace: 'nowrap'
                    }}>Hiring</span>
                  )}
                  {lead.lead_type === 'Information' && (
                    <span style={{
                      background: '#dbeafe',
                      color: '#1e40af',
                      padding: '2px 10px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '700',
                      letterSpacing: '0.3px',
                      textTransform: 'uppercase',
                      border: '1px solid #bfdbfe',
                      whiteSpace: 'nowrap'
                    }}>Info</span>
                  )}
                  {(!lead.lead_type || lead.lead_type === 'General') && (
                    <span style={{
                      background: '#f1f5f9',
                      color: '#475569',
                      padding: '2px 10px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '600',
                      letterSpacing: '0.3px',
                      textTransform: 'uppercase',
                      whiteSpace: 'nowrap'
                    }}>General</span>
                  )}
                </div>
              </td>
              <td style={{ padding: '14px 12px', minWidth: '130px', border: '1px solid #cbd5e1' }}>
                <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: '500' }}>
                  {safeString(lead.company_name, 'Independent')}
                </span>
              </td>

              <td style={{ padding: '14px 12px', color: '#334155', fontSize: '13px', maxWidth: '160px', wordBreak: 'break-word', lineHeight: '1.4', border: '1px solid #cbd5e1' }}>
                📍 {safeString(lead.job_location, 'N/A')}
              </td>

              <td style={{ padding: '14px 12px', border: '1px solid #cbd5e1' }}>
                <select
                  value={safeString(lead.status, 'New')}
                  onChange={async (e) => {
                    const newStatus = e.target.value;
                    await api.put(`/update-lead-status?job_title=${encodeURIComponent(safeString(lead.job_title))}&company_name=${encodeURIComponent(safeString(lead.company_name))}&status=${newStatus}`);
                    await refreshLeads();
                  }}
                  style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', cursor: 'pointer', background: '#fff' }}
                >
                  <option value="New">🆕 New</option>
                  <option value="Contacted">📞 Contacted</option>
                  <option value="Qualified">🌟 Qualified</option>
                  <option value="Closed Won">✅ Won</option>
                  <option value="Closed Lost">❌ Lost</option>
                </select>
              </td>

              {mode === 'jobs' && (
                <>
                  <td style={{ padding: '14px 12px', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', border: '1px solid #cbd5e1' }}>
                    {lead.job_url ? (
                      <a href={lead.job_url} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', fontSize: '12px', textDecoration: 'underline' }}>
                        🔗 View Original
                      </a>
                    ) : (
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>N/A</span>
                    )}
                  </td>
                  <td style={{ padding: '14px 12px', color: '#475569', fontSize: '13px', border: '1px solid #cbd5e1' }}>
                    {safeString(lead.posted_time, 'N/A')}
                  </td>
                </>
              )}

              <td style={{ padding: '14px 12px', minWidth: '140px', border: '1px solid #cbd5e1' }}>
                {lead.skills_required && lead.skills_required.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {lead.skills_required.map((skill, idx) => (
                      <span key={idx} style={{ background: '#dcfce7', color: '#166534', padding: '2px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '500', marginBottom: '2px' }}>
                        {safeString(skill)}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>N/A</span>
                )}
              </td>

              <td style={{ padding: '14px 12px', color: '#475569', fontSize: '14px', minWidth: '100px', border: '1px solid #cbd5e1' }}>
                {safeString(lead.experience_required, 'Not Specified')}
              </td>

              {/* Contacts Column */}
              <td style={{ padding: '14px 12px', minWidth: '140px', border: '1px solid #cbd5e1' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'flex-start' }}>
                  {lead.contact_email_or_link &&
                   lead.contact_email_or_link !== 'N/A' &&
                   lead.contact_email_or_link !== 'null' &&
                   lead.contact_email_or_link.trim() !== '' && (
                    <a
                      href={lead.contact_email_or_link.includes('@') ? `mailto:${lead.contact_email_or_link}` : lead.contact_email_or_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#2563eb', fontSize: '12px', fontWeight: '500', textDecoration: 'underline', textUnderlineOffset: '2px' }}
                    >
                      ✉️{safeString(lead.contact_email_or_link).length > 25 ? safeString(lead.contact_email_or_link).substring(0, 25) + '...' : safeString(lead.contact_email_or_link)}
                    </a>
                  )}

                  {lead.contact_phone && lead.contact_phone !== 'null' && lead.contact_phone !== 'N/A' && (
                    <a href={`tel:${lead.contact_phone}`} style={{ color: '#16a34a', fontSize: '12px', fontWeight: '500', textDecoration: 'underline', textUnderlineOffset: '2px' }}>
                      📞 {safeString(lead.contact_phone)}
                    </a>
                  )}

                  {lead.apply_url &&
                   lead.apply_url !== 'N/A' &&
                   lead.apply_url !== 'null' &&
                   lead.apply_url.trim() !== '' && (
                    <a
                      href={lead.apply_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#8b5cf6', fontSize: '12px', fontWeight: '500', textDecoration: 'underline', textUnderlineOffset: '2px' }}
                    >
                      📄 Apply Here
                    </a>
                  )}

                  {(!lead.contact_email_or_link || lead.contact_email_or_link === 'N/A' || lead.contact_email_or_link === 'null') &&
                   (!lead.contact_phone || lead.contact_phone === 'null' || lead.contact_phone === 'N/A') &&
                   (!lead.apply_url || lead.apply_url === 'N/A' || lead.apply_url === 'null') && (
                    <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '500' }}>No Contact</span>
                  )}
                </div>
              </td>

              {/* Notes Column */}
              <td style={{ padding: '14px 12px', minWidth: '150px', border: '1px solid #cbd5e1' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      fontSize: '14px', fontWeight: '500', color: lead.notes ? '#1e293b' : '#94a3b8',
                      fontStyle: lead.notes ? 'normal' : 'italic', maxWidth: '130px', overflow: 'hidden',
                      textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'default'
                    }}
                    title={safeString(lead.notes, 'No notes yet')}
                  >
                    {safeString(lead.notes, 'No notes')}
                  </span>
                  <button
                    onClick={() => { setNoteEditingLead(lead); setTempNoteText(lead.notes || ''); setIsNoteModalOpen(true); }}
                    style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b', padding: '4px 6px', borderRadius: '6px', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => { e.target.style.color = '#166534'; e.target.style.background = '#dcfce7'; }}
                    onMouseLeave={(e) => { e.target.style.color = '#64748b'; e.target.style.background = 'transparent'; }}
                    title="Edit note"
                  >
                    ✏️
                  </button>
                </div>
              </td>

              <td style={{ padding: '14px 12px', color: '#1f2937', fontSize: '14px', minWidth: '0px', width: '30%', border: '1px solid #cbd5e1' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ display: '-webkit-box', WebkitLineClamp: 5, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: '1.6', wordBreak: 'break-word' }} title={safeString(lead.ai_summary, '')}>
                    {safeString(lead.ai_summary, 'No summary')}
                  </div>
                  {lead.image_url && (
                    <button onClick={() => window.open(lead.image_url, '_blank')} style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '22px', cursor: 'pointer', padding: '4px', flexShrink: 0, marginTop: '2px', borderRadius: '6px', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.target.style.color = '#166534'; e.target.style.background = '#dcfce7'; }} onMouseLeave={(e) => { e.target.style.color = '#94a3b8'; e.target.style.background = 'transparent'; }} title="View Post Image">
                      🖼️
                    </button>
                  )}
                </div>
              </td>

              {/* Single Delete */}
              <td style={{ padding: '14px 12px', textAlign: 'center', border: '1px solid #cbd5e1' }}>
                <button
                  onClick={async () => {
                    setIsDeleting(true);
                    try {
                      await onRemoveLead(lead.job_title, lead.company_name);
                    } catch (err) {
                      alert("Failed to delete the lead.");
                    } finally {
                      setIsDeleting(false);
                    }
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ef4444',
                    fontSize: '18px',
                    cursor: 'pointer',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'}
                  onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}