'use client';

import { useState } from 'react';

export default function SignInModal({ isOpen, onClose }) {
  const [step, setStep] = useState('email'); // 'email' | 'passcode'
  const [email, setEmail] = useState('');
  const [passcode, setPasscode] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGetPasscode = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // TODO: Call API to send passcode email
    // await fetch('/api/auth/send-passcode', { method: 'POST', body: JSON.stringify({ email }) });
    
    setTimeout(() => {
      setLoading(false);
      setStep('passcode');
    }, 800);
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // TODO: Call API to verify passcode
    // await fetch('/api/auth/verify-passcode', { method: 'POST', body: JSON.stringify({ email, passcode }) });
    
    setTimeout(() => {
      setLoading(false);
      // TODO: Redirect to dashboard on success
    }, 800);
  };

  const handleClose = () => {
    setStep('email');
    setEmail('');
    setPasscode('');
    onClose();
  };

  return (
    <div
      onClick={handleClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'white',
          borderRadius: 16,
          padding: 40,
          width: '100%',
          maxWidth: 380,
          textAlign: 'center',
          position: 'relative',
        }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'none',
            border: 'none',
            fontSize: 20,
            color: '#999',
            cursor: 'pointer',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ×
        </button>

        {step === 'email' ? (
          <form onSubmit={handleGetPasscode}>
            <h2
              style={{
                fontFamily: "'Basic Sans', system-ui, sans-serif",
                fontSize: 28,
                fontWeight: 600,
                color: '#584E9F',
                margin: '0 0 12px',
              }}
            >
              Hello
            </h2>
            <p
              style={{
                fontSize: 14,
                color: '#666',
                margin: '0 0 28px',
              }}
            >
              Where shall we send your passcode?
            </p>

            <div style={{ marginBottom: 24 }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '1px solid #E8E8EC',
                  borderRadius: 8,
                  fontSize: 15,
                  boxSizing: 'border-box',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              style={{
                width: '100%',
                background: loading || !email ? '#ccc' : '#00CEB4',
                color: '#fff',
                border: 'none',
                padding: 14,
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 500,
                cursor: loading || !email ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {loading ? 'Sending…' : 'Get a passcode'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignIn}>
            <h2
              style={{
                fontFamily: "'Basic Sans', system-ui, sans-serif",
                fontSize: 28,
                fontWeight: 600,
                color: '#584E9F',
                margin: '0 0 12px',
              }}
            >
              Ready?
            </h2>
            <p
              style={{
                fontSize: 14,
                color: '#666',
                margin: '0 0 28px',
              }}
            >
              Just enter your passcode to sign in
            </p>

            <div style={{ marginBottom: 24 }}>
              <input
                type="text"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value.toLowerCase())}
                placeholder="brave otter"
                required
                style={{
                  width: '100%',
                  padding: 14,
                  border: '1px solid #E8E8EC',
                  borderRadius: 8,
                  fontSize: 18,
                  fontWeight: 500,
                  boxSizing: 'border-box',
                  outline: 'none',
                  textAlign: 'center',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !passcode}
              style={{
                width: '100%',
                background: loading || !passcode ? '#ccc' : '#00CEB4',
                color: '#fff',
                border: 'none',
                padding: 14,
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 500,
                cursor: loading || !passcode ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        )}

        {/* Footer */}
        <div
          style={{
            marginTop: 32,
            paddingTop: 20,
            borderTop: '1px solid #E8E8EC',
          }}
        >
          <img
            src="/inside_voice_Logo.png"
            alt="Inside Voice"
            style={{
              height: 20,
              opacity: 0.4,
            }}
          />
        </div>
      </div>
    </div>
  );
}
