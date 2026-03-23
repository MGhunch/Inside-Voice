'use client';

import { useState } from 'react';
import { COLORS } from '../lib/utils';

/**
 * PersonalDetailsModal - Employee self-service form for updating personal info
 * Sends data to Airtable and emails Angela
 */
export default function PersonalDetailsModal({ person, isOpen, onClose, onSave }) {
  const [firstName, setFirstName] = useState(person?.firstName || person?.name?.split(' ')[0] || '');
  const [lastName, setLastName] = useState(person?.lastName || person?.name?.split(' ').slice(1).join(' ') || '');
  const [email, setEmail] = useState(person?.email || '');
  const [address, setAddress] = useState(person?.address || '');
  const [dateOfBirth, setDateOfBirth] = useState(person?.dateOfBirth || '');
  const [mobile, setMobile] = useState(person?.mobile || '');
  const [bankAccount, setBankAccount] = useState(person?.bankAccount || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const updatedData = {
      firstName,
      lastName,
      email,
      address,
      dateOfBirth,
      mobile,
      bankAccount,
    };

    try {
      const res = await fetch('/api/team/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      
      if (!res.ok) {
        throw new Error('Failed to save');
      }

      const updated = await res.json();
      onSave?.({ ...person, ...updated, personalDetailsComplete: true });
      onClose();
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    border: '1px solid #E8E8EC',
    borderRadius: 12,
    fontSize: 15,
    fontFamily: "'DM Sans', system-ui, sans-serif",
    outline: 'none',
    transition: 'border-color 0.15s',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    fontSize: 11,
    fontWeight: 500,
    color: '#1a1a1a',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    display: 'block',
    marginBottom: 6,
  };

  const hintStyle = {
    fontSize: 13,
    color: '#888',
    margin: '4px 0 10px',
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'white',
          borderRadius: 24,
          width: '100%',
          maxWidth: 520,
          maxHeight: '90vh',
          overflow: 'auto',
          position: 'relative',
          boxShadow: '0 24px 64px rgba(0,0,0,0.12)',
        }}
      >
        {/* Header */}
        <div style={{ padding: '32px 32px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h2 style={{
            fontFamily: "'Outfit', system-ui, sans-serif",
            fontSize: 28,
            fontWeight: 600,
            color: '#1a1a1a',
            margin: 0,
          }}>
            Personal details
          </h2>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#f0f0f0',
              border: 'none',
              cursor: 'pointer',
              fontSize: 18,
              color: '#888',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: 32 }}>
          {/* Name */}
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Your name</label>
            <p style={hintStyle}>First and last name</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  required
                  style={inputStyle}
                />
                <p style={{ fontSize: 12, color: '#888', margin: '6px 0 0' }}>required</p>
              </div>
              <div>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  required
                  style={inputStyle}
                />
                <p style={{ fontSize: 12, color: '#888', margin: '6px 0 0' }}>required</p>
              </div>
            </div>
          </div>

          {/* Email */}
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Your email <span style={{ fontWeight: 400, textTransform: 'none', color: '#888' }}>(required)</span></label>
            <p style={hintStyle}>This is where we'll send your payslip.</p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              required
              style={inputStyle}
            />
          </div>

          {/* Address */}
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Your home address <span style={{ fontWeight: 400, textTransform: 'none', color: '#888' }}>(required)</span></label>
            <p style={hintStyle}>We need this for tax reasons</p>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Street Name, Suburb, City"
              required
              style={inputStyle}
            />
          </div>

          {/* Date of Birth */}
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Your date of birth</label>
            <p style={hintStyle}>Also for tax reasons.</p>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Mobile */}
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Your mobile number</label>
            <p style={hintStyle}>In case we have any questions.</p>
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="021 123 4567"
              style={inputStyle}
            />
          </div>

          {/* Bank Account */}
          <div style={{ marginBottom: 32 }}>
            <label style={labelStyle}>Your bank acct number</label>
            <input
              type="text"
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
              placeholder="00-0000-0000000-00"
              style={inputStyle}
            />
          </div>

          {/* Error */}
          {error && (
            <p style={{ fontSize: 14, color: COLORS.red, marginBottom: 16 }}>{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !firstName || !lastName || !email || !address}
            style={{
              padding: '14px 28px',
              borderRadius: 12,
              border: '1px solid #E8E8EC',
              background: loading ? '#f0f0f0' : 'white',
              fontSize: 15,
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: "'DM Sans', system-ui, sans-serif",
              transition: 'all 0.15s',
            }}
          >
            {loading ? 'Sending…' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}
