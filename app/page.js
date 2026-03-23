'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import InsideVoiceLoader from '@/components/InsideVoiceLoader';

export default function HomePage() {
  const [step, setStep] = useState('email'); // 'email' | 'sending' | 'passcode'
  const [email, setEmail] = useState('');
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  const handleGetPasscode = async (e) => {
    e.preventDefault();
    setError('');
    setStep('sending');
    
    try {
      const res = await fetch('/api/auth/send-passcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error('Failed');
      setStep('passcode');
    } catch {
      setError('Something went wrong. Please try again.');
      setStep('email');
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    
    const result = await signIn('credentials', {
      email,
      code: passcode,
      redirect: false,
      callbackUrl: '/dashboard',
    });
    
    if (result?.error) {
      setError("That didn't work. Check your passcode and try again.");
    } else {
      window.location.href = result?.url || '/dashboard';
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#fff',
        fontFamily: "'DM Sans', system-ui, sans-serif",
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Floating shapes background */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        {/* Teal circles */}
        <circle cx="0%" cy="85%" r="200" fill="#00CEB4" opacity="0.12">
          <animate attributeName="cy" values="85%;88%;85%" dur="10s" repeatCount="indefinite" />
        </circle>
        <circle cx="92%" cy="25%" r="80" fill="#00CEB4" opacity="0.15">
          <animate attributeName="cy" values="25%;30%;25%" dur="8s" repeatCount="indefinite" />
          <animate attributeName="cx" values="92%;89%;92%" dur="12s" repeatCount="indefinite" />
        </circle>
        <circle cx="8%" cy="35%" r="35" fill="#00CEB4" opacity="0.18">
          <animate attributeName="cy" values="35%;40%;35%" dur="6s" repeatCount="indefinite" />
        </circle>

        {/* Purple squares */}
        <rect x="-80" y="-60" width="180" height="180" rx="16" fill="#584E9F" opacity="0.1" transform="rotate(-15, 10, 20)">
          <animate attributeName="y" values="-60;-50;-60" dur="11s" repeatCount="indefinite" />
        </rect>
        <rect x="88%" y="55%" width="100" height="100" rx="10" fill="#584E9F" opacity="0.12" transform="rotate(20)">
          <animate attributeName="y" values="55%;60%;55%" dur="9s" repeatCount="indefinite" />
        </rect>
        <rect x="25%" y="88%" width="50" height="50" rx="6" fill="#584E9F" opacity="0.14" transform="rotate(-8)">
          <animate attributeName="y" values="88%;85%;88%" dur="7s" repeatCount="indefinite" />
        </rect>

        {/* Yellow triangles */}
        <polygon points="750,0 850,180 650,180" fill="#FEC514" opacity="0.15">
          <animate attributeName="points" values="750,0 850,180 650,180; 750,20 850,200 650,200; 750,0 850,180 650,180" dur="10s" repeatCount="indefinite" />
        </polygon>
        <polygon points="680,520 740,620 620,620" fill="#FEC514" opacity="0.18">
          <animate attributeName="points" values="680,520 740,620 620,620; 680,535 740,635 620,635; 680,520 740,620 620,620" dur="8s" repeatCount="indefinite" />
        </polygon>
        <polygon points="60,280 95,350 25,350" fill="#FEC514" opacity="0.2">
          <animate attributeName="points" values="60,280 95,350 25,350; 60,295 95,365 25,365; 60,280 95,350 25,350" dur="6s" repeatCount="indefinite" />
        </polygon>
      </svg>



      {/* Logo */}
      <div
        style={{
          position: 'absolute',
          top: 28,
          left: 32,
          zIndex: 10,
        }}
      >
        <img
          src="/inside_voice_Logo.png"
          alt="Inside Voice"
          style={{ height: 28 }}
        />
      </div>

      {/* Main content */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '60px 24px',
        }}
      >
        {/* State 1: Email */}
        {step === 'email' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 40, maxWidth: 400 }}>
              <h1
                style={{
                  fontFamily: "'Outfit', system-ui, sans-serif",
                  fontSize: 42,
                  fontWeight: 600,
                  color: '#584E9F',
                  margin: '0 0 12px',
                  letterSpacing: -1,
                  lineHeight: 1.1,
                }}
              >
                Busy day?
              </h1>
              <p style={{ fontSize: 20, color: '#666', margin: 0 }}>
                We'll keep this quick
              </p>
            </div>

            <div
              style={{
                background: '#fff',
                borderRadius: 20,
                padding: '36px 32px',
                width: '100%',
                maxWidth: 360,
                boxShadow: '0 4px 24px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)',
              }}
            >
              <form onSubmit={handleGetPasscode}>
                <div style={{ marginBottom: 20 }}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="What's your email?"
                    required
                    style={{
                      width: '100%',
                      padding: '16px 18px',
                      fontSize: 16,
                      border: '1.5px solid #E8E8EC',
                      borderRadius: 12,
                      outline: 'none',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#00CEB4';
                      e.target.style.boxShadow = '0 0 0 3px rgba(0,206,180,0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#E8E8EC';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                {error && (
                  <p style={{ fontSize: 13, color: '#E24B4A', margin: '0 0 16px', textAlign: 'center' }}>
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={!email}
                  style={{
                    width: '100%',
                    padding: '16px 24px',
                    fontSize: 16,
                    fontWeight: 600,
                    color: '#fff',
                    background: email ? '#00CEB4' : '#ccc',
                    border: 'none',
                    borderRadius: 12,
                    cursor: email ? 'pointer' : 'not-allowed',
                    fontFamily: 'inherit',
                    transition: 'background 0.15s, transform 0.15s',
                  }}
                  onMouseOver={(e) => email && (e.target.style.background = '#00b8a0')}
                  onMouseOut={(e) => email && (e.target.style.background = '#00CEB4')}
                  onMouseDown={(e) => email && (e.target.style.background = '#584E9F')}
                  onMouseUp={(e) => email && (e.target.style.background = '#00b8a0')}
                >
                  Let me in
                </button>

                <p style={{ fontSize: 13, color: '#999', margin: '18px 0 0', textAlign: 'center' }}>
                  We'll send you a passcode
                </p>
              </form>
            </div>

            <p style={{ fontSize: 13, color: '#aaa', marginTop: 32 }}>
              First time here?{' '}
              <span style={{ color: '#00CEB4', cursor: 'pointer', fontWeight: 500 }}>
                Let's get you set up
              </span>
            </p>
          </>
        )}

        {/* State 2: Sending */}
        {step === 'sending' && (
          <div
            style={{
              background: '#fff',
              borderRadius: 20,
              padding: '48px 32px',
              width: '100%',
              maxWidth: 360,
              boxShadow: '0 4px 24px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <InsideVoiceLoader size={80} speed="fast" />
            <p style={{ fontSize: 15, color: '#999', margin: '20px 0 0' }}>
              We're on it.
            </p>
          </div>
        )}

        {/* State 3: Passcode */}
        {step === 'passcode' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 40, maxWidth: 400 }}>
              <h1
                style={{
                  fontFamily: "'Outfit', system-ui, sans-serif",
                  fontSize: 42,
                  fontWeight: 600,
                  color: '#584E9F',
                  margin: '0 0 12px',
                  letterSpacing: -1,
                  lineHeight: 1.1,
                }}
              >
                Check your email
              </h1>
              <p style={{ fontSize: 20, color: '#666', margin: 0 }}>
                We sent two words to you
              </p>
            </div>

            <div
              style={{
                background: '#fff',
                borderRadius: 20,
                padding: '36px 32px',
                width: '100%',
                maxWidth: 360,
                boxShadow: '0 4px 24px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)',
              }}
            >
              <form onSubmit={handleSignIn}>
                <div style={{ marginBottom: 20 }}>
                  <input
                    type="text"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value.toLowerCase())}
                    placeholder="brave otter"
                    required
                    autoFocus
                    style={{
                      width: '100%',
                      padding: '16px 18px',
                      fontSize: 16,
                      border: '1.5px solid #E8E8EC',
                      borderRadius: 12,
                      outline: 'none',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit',
                      textAlign: 'center',
                      letterSpacing: 0.5,
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#00CEB4';
                      e.target.style.boxShadow = '0 0 0 3px rgba(0,206,180,0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#E8E8EC';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                {error && (
                  <p style={{ fontSize: 13, color: '#E24B4A', margin: '0 0 16px', textAlign: 'center' }}>
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={!passcode}
                  style={{
                    width: '100%',
                    padding: '16px 24px',
                    fontSize: 16,
                    fontWeight: 600,
                    color: '#fff',
                    background: passcode ? '#00CEB4' : '#ccc',
                    border: 'none',
                    borderRadius: 12,
                    cursor: passcode ? 'pointer' : 'not-allowed',
                    fontFamily: 'inherit',
                    transition: 'background 0.15s, transform 0.15s',
                  }}
                  onMouseOver={(e) => passcode && (e.target.style.background = '#00b8a0')}
                  onMouseOut={(e) => passcode && (e.target.style.background = '#00CEB4')}
                  onMouseDown={(e) => passcode && (e.target.style.background = '#584E9F')}
                  onMouseUp={(e) => passcode && (e.target.style.background = '#00b8a0')}
                >
                  Let's go
                </button>

                <p style={{ fontSize: 13, color: '#999', margin: '18px 0 0', textAlign: 'center' }}>
                  Not found it? Check your junk
                </p>
              </form>
            </div>

            <p style={{ fontSize: 13, color: '#aaa', marginTop: 32 }}>
              Wrong email?{' '}
              <span
                onClick={() => {
                  setStep('email');
                  setPasscode('');
                  setError('');
                }}
                style={{ color: '#00CEB4', cursor: 'pointer', fontWeight: 500 }}
              >
                Start over
              </span>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
