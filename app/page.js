'use client';

import { useState } from 'react';
import { SignInModal } from '@/components';

export default function HomePage() {
  const [showSignIn, setShowSignIn] = useState(false);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F8F8FA',
        fontFamily: "'DM Sans', system-ui, sans-serif",
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Blurred dashboard background */}
      <div
        style={{
          position: 'absolute',
          top: 100,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '90%',
          maxWidth: 900,
          filter: 'blur(8px)',
          opacity: 0.5,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            background: '#fff',
            borderRadius: 12,
            padding: 24,
            border: '1px solid #E8E8EC',
          }}
        >
          {/* Nav tabs */}
          <div
            style={{
              display: 'flex',
              gap: 24,
              marginBottom: 24,
              borderBottom: '1px solid #E8E8EC',
              paddingBottom: 12,
            }}
          >
            <div style={{ width: 60, height: 12, background: '#00CEB4', borderRadius: 4 }} />
            <div style={{ width: 50, height: 12, background: '#E8E8EC', borderRadius: 4 }} />
            <div style={{ width: 70, height: 12, background: '#E8E8EC', borderRadius: 4 }} />
          </div>
          {/* Stats row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 16,
              marginBottom: 24,
            }}
          >
            {[
              { color: '#00CEB4' },
              { color: '#584E9F' },
              { color: '#FEC514' },
              { color: '#00CEB4' },
            ].map((stat, i) => (
              <div key={i} style={{ background: '#F8F8FA', padding: 16, borderRadius: 8 }}>
                <div style={{ width: 40 + i * 5, height: 8, background: '#ccc', borderRadius: 4, marginBottom: 8 }} />
                <div style={{ width: 50 + i * 10, height: 16, background: stat.color, borderRadius: 4 }} />
              </div>
            ))}
          </div>
          {/* Table rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {['#00CEB4', '#584E9F', '#FEC514'].map((color, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: 16,
                  padding: 12,
                  background: '#F8F8FA',
                  borderRadius: 6,
                  alignItems: 'center',
                }}
              >
                <div style={{ width: 32, height: 32, background: color, borderRadius: '50%' }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ width: 100 + i * 20, height: 10, background: '#ccc', borderRadius: 4 }} />
                  <div style={{ width: 70 + i * 10, height: 8, background: '#ddd', borderRadius: 4 }} />
                </div>
                <div style={{ width: 60, height: 20, background: '#E8E8EC', borderRadius: 4 }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Header */}
      <header
        style={{
          background: '#fff',
          padding: '16px 32px',
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          borderBottom: '1px solid #E8E8EC',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <img
          src="/inside_voice_Logo.png"
          alt="Inside Voice"
          style={{ height: 28, opacity: 0.4 }}
        />
      </header>

      {/* Hero */}
      <main
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '120px 32px 80px',
          textAlign: 'center',
          minHeight: 'calc(100vh - 61px)',
        }}
      >
        {/* Frosted glass card */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderRadius: 16,
            padding: '48px 56px',
            maxWidth: 480,
          }}
        >
          <h1
            style={{
              fontFamily: "'Basic Sans', system-ui, sans-serif",
              fontSize: 48,
              fontWeight: 600,
              color: '#584E9F',
              margin: '0 0 16px',
            }}
          >
            Hello
          </h1>
          <p
            style={{
              fontSize: 17,
              color: '#666',
              margin: '0 0 32px',
              lineHeight: 1.5,
            }}
          >
            Just remind us who you are and dive right in.
          </p>

          <button
            onClick={() => setShowSignIn(true)}
            style={{
              background: '#00CEB4',
              color: '#fff',
              border: 'none',
              padding: '14px 36px',
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Get started
          </button>
        </div>
      </main>

      {/* Sign In Modal */}
      <SignInModal isOpen={showSignIn} onClose={() => setShowSignIn(false)} />
    </div>
  );
}
