'use client';

/**
 * app/login/page.js
 * Magic link login page
 */

import { useState } from 'react';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn('resend', {
      email,
      redirect: false,
      callbackUrl: '/',
    });

    if (result?.error) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
    // On success, NextAuth redirects to /check-email automatically
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8f9fa',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'DM Sans', system-ui, sans-serif",
    }}>
      <div style={{
        background: 'white',
        borderRadius: 24,
        padding: '48px 40px',
        width: '100%',
        maxWidth: 380,
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
      }}>
        <img
          src="/inside_voice_Logo.png"
          alt="Inside Voice"
          style={{ height: 28, marginBottom: 32, opacity: 0.8 }}
        />

        <h1 style={{ fontSize: 22, fontWeight: 600, margin: '0 0 8px', color: '#1a1a1a' }}>
          Sign in
        </h1>
        <p style={{ fontSize: 14, color: '#999', margin: '0 0 32px' }}>
          Enter your email and we'll send you a link.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@spark.co.nz"
            required
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: 15,
              border: '1px solid #e0e0e0',
              borderRadius: 12,
              outline: 'none',
              marginBottom: 16,
              boxSizing: 'border-box',
              fontFamily: 'inherit',
            }}
          />

          {error && (
            <p style={{ fontSize: 13, color: '#E24B4A', margin: '0 0 16px' }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !email}
            style={{
              width: '100%',
              padding: '13px',
              background: loading || !email ? '#ccc' : '#00CEB4',
              color: loading || !email ? '#fff' : '#04342C',
              border: 'none',
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 600,
              cursor: loading || !email ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              transition: 'background 0.15s',
            }}
          >
            {loading ? 'Sending…' : 'Send magic link'}
          </button>
        </form>

        <p style={{ fontSize: 12, color: '#ccc', margin: '24px 0 0', textAlign: 'center' }}>
          Only registered users can sign in.
        </p>
      </div>
    </div>
  );
}
