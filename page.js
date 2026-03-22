'use client';

import { useState } from 'react';
import { SignInModal } from '../components';

export default function HomePage() {
  const [showSignIn, setShowSignIn] = useState(false);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F8F8FA',
        fontFamily: "'DM Sans', system-ui, sans-serif",
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <header
        style={{
          background: '#fff',
          padding: '16px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #E8E8EC',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              background: '#00CEB4',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ color: '#fff', fontWeight: 500, fontSize: 14 }}>S</span>
          </div>
          <span style={{ fontWeight: 500, fontSize: 18, color: '#1a1a1a' }}>Spark</span>
        </div>
        <button
          onClick={() => setShowSignIn(true)}
          style={{
            background: '#00CEB4',
            color: '#fff',
            border: 'none',
            padding: '10px 24px',
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Sign in
        </button>
      </header>

      {/* Hero */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 32px',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontFamily: "'Basic Sans', system-ui, sans-serif",
            fontSize: 42,
            fontWeight: 500,
            color: '#1a1a1a',
            margin: '0 0 16px',
          }}
        >
          Welcome to Spark
        </h1>
        <p
          style={{
            fontSize: 18,
            color: '#666',
            margin: '0 0 40px',
            maxWidth: 480,
          }}
        >
          Your contractor portal. Manage your details, view your contract, and stay connected with your team.
        </p>

        <button
          onClick={() => setShowSignIn(true)}
          style={{
            background: '#00CEB4',
            color: '#fff',
            border: 'none',
            padding: '14px 32px',
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 500,
            cursor: 'pointer',
            marginBottom: 12,
            fontFamily: 'inherit',
          }}
        >
          Get started
        </button>
        <p style={{ fontSize: 13, color: '#999' }}>
          Already have an account? Sign in above
        </p>
      </main>

      {/* Footer */}
      <footer
        style={{
          padding: '20px 32px',
          textAlign: 'center',
        }}
      >
        <img
          src="/inside_voice_Logo.png"
          alt="Inside Voice"
          style={{ height: 24, opacity: 0.3 }}
        />
      </footer>

      {/* Sign In Modal */}
      <SignInModal isOpen={showSignIn} onClose={() => setShowSignIn(false)} />
    </div>
  );
}
