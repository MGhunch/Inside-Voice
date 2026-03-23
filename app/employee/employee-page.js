'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { TRIBE_CONFIG, COLORS } from '../../lib/utils';
import { PersonalDetailsModal } from '../../components';

/**
 * EmployeePage - The contractor's personal dashboard
 * Shows their info, quick actions, and onboarding progress
 * Supports ?viewAs=[id] for admin preview mode
 */
export default function EmployeePage() {
  const searchParams = useSearchParams();
  const { data: session } = useSession() ?? {};
  const viewAsId = searchParams.get('viewAs');
  const isAdminPreview = viewAsId && session?.user?.access === 'iv_admin';

  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [expandedItem, setExpandedItem] = useState(null);

  useEffect(() => {
    async function loadPerson() {
      try {
        if (isAdminPreview) {
          // Admin viewing as specific team member - fetch all team and find by id
          const res = await fetch('/api/team');
          if (res.ok) {
            const team = await res.json();
            const found = team.find(p => p.id === viewAsId);
            if (found) {
              setPerson(found);
            } else {
              console.error('Person not found:', viewAsId);
            }
          }
        } else {
          // Normal flow - fetch current user's data
          const res = await fetch('/api/team/me');
          if (res.ok) {
            const data = await res.json();
            setPerson(data);
          } else {
            // For demo, use mock data
            setPerson({
              id: '1',
              name: 'Sarah Chen',
              firstName: 'Sarah',
              lastName: 'Chen',
              tribe: 'Customer',
              jobTitle: 'CX Specialist',
              chapterLead: 'Mike Thompson',
              startDate: '2026-03-12',
              email: '',
              address: '',
              mobile: '',
              bankAccount: '',
              dateOfBirth: '',
              personalDetailsComplete: true,
              irdComplete: false,
              kiwiSaverComplete: false,
            });
          }
        }
      } catch (err) {
        console.error('Failed to fetch person:', err);
        // Use mock data on error
        setPerson({
          id: '1',
          name: 'Sarah Chen',
          tribe: 'Customer',
          jobTitle: 'CX Specialist',
          chapterLead: 'Mike Thompson',
          startDate: '2026-03-12',
          personalDetailsComplete: true,
          irdComplete: false,
          kiwiSaverComplete: false,
        });
      } finally {
        setLoading(false);
      }
    }
    loadPerson();
  }, [viewAsId, isAdminPreview]);

  const handleSaveDetails = (updatedPerson) => {
    setPerson({ ...person, ...updatedPerson, personalDetailsComplete: true });
  };

  // Calculate onboarding progress
  const onboardingItems = person ? [
    { key: 'personal', label: 'Personal details', complete: person.personalDetailsComplete },
    { key: 'ird', label: 'IRD forms', complete: person.irdComplete },
    { key: 'kiwisaver', label: 'KiwiSaver', complete: person.kiwiSaverComplete },
  ] : [];
  
  const completedCount = onboardingItems.filter(i => i.complete).length;
  const allComplete = completedCount === onboardingItems.length;
  const nextItem = onboardingItems.find(i => !i.complete);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8f9fa 0%, #f0f4f3 100%)',
        fontFamily: "'DM Sans', system-ui, sans-serif",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <img src="/inside_voice_Logo.png" alt="Inside Voice" style={{ height: 28, opacity: 0.2 }} />
      </div>
    );
  }

  const tribeConfig = TRIBE_CONFIG[person?.tribe] || { color: '#888' };
  const tribeTextColor = person?.tribe === 'Business' ? '#BA7517' : tribeConfig.color;

  // Format start date
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8f9fa 0%, #f0f4f3 100%)',
      fontFamily: "'DM Sans', system-ui, sans-serif",
    }}>
      {/* Header */}
      <header style={{
        padding: '32px 48px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <img src="/inside_voice_Logo.png" alt="Inside Voice" style={{ height: 28, opacity: 0.7 }} />
          <div style={{ width: 1, height: 32, background: '#e0e0e0' }} />
          <h1 style={{ fontSize: 28, fontWeight: 600, margin: 0, color: '#1a1a1a' }}>Spark</h1>
        </div>
      </header>

      {/* Admin preview banner */}
      {isAdminPreview && person && (
        <div style={{
          background: '#584E9F',
          color: 'white',
          padding: '10px 48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 13,
          fontWeight: 500,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Viewing as {person.name}
            <span style={{ opacity: 0.7 }}>— Team member</span>
          </div>
          <Link
            href="/dashboard"
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: 6,
              padding: '4px 10px',
              color: 'white',
              fontSize: 12,
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            ← Back to dashboard
          </Link>
        </div>
      )}

      {/* Main content */}
      <main style={{ padding: '0 48px 48px', maxWidth: 720, margin: '0 auto' }}>
        
        {/* Hero Card */}
        <div style={{
          background: 'white',
          borderRadius: 24,
          padding: 40,
          boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
          marginBottom: 16,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: 28,
          }}>
            <div>
              <p style={{
                fontSize: 11,
                fontWeight: 500,
                color: '#888',
                margin: '0 0 8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                Welcome back
              </p>
              <h2 style={{
                fontSize: 32,
                fontWeight: 600,
                color: '#1a1a1a',
                margin: 0,
                fontFamily: "'Outfit', system-ui, sans-serif",
              }}>
                {person?.name}
              </h2>
            </div>
            {/* Tribe badge */}
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              fontWeight: 500,
              color: tribeTextColor,
              background: `${tribeConfig.color}15`,
              padding: '5px 10px',
              borderRadius: 16,
            }}>
              <span style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: tribeConfig.color,
              }} />
              {person?.tribe}
            </span>
          </div>

          {/* Info row */}
          <div style={{
            display: 'flex',
            gap: 40,
            paddingTop: 24,
            borderTop: '1px solid #f0f0f0',
          }}>
            <InfoField label="Chapter lead" value={person?.chapterLead} />
            <InfoField label="Started" value={formatDate(person?.startDate)} />
            <InfoField label="Role" value={person?.jobTitle} />
          </div>
        </div>

        {/* Action Tiles */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
          marginBottom: 16,
        }}>
          {/* My Details */}
          <ActionTile
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            }
            iconBg={COLORS.gold}
            title="My details"
            subtitle="Update your info"
            onClick={() => setShowDetailsModal(true)}
          />

          {/* Book Leave */}
          <ActionTile
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            }
            iconBg={COLORS.purple}
            title="Book leave"
            subtitle="Talk to your chapter lead"
          />
        </div>

        {/* Getting Started Card - hides when complete */}
        {!allComplete && (
          <div style={{
            background: 'white',
            borderRadius: 24,
            padding: 28,
            boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 20,
            }}>
              <p style={{ fontSize: 17, fontWeight: 600, color: '#1a1a1a', margin: 0 }}>
                Getting started
              </p>
              <span style={{ fontSize: 13, color: COLORS.teal, fontWeight: 500 }}>
                {completedCount} of {onboardingItems.length}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {onboardingItems.map((item) => (
                <OnboardingItem
                  key={item.key}
                  item={item}
                  isNext={nextItem?.key === item.key}
                  isExpanded={expandedItem === item.key}
                  onToggle={() => setExpandedItem(expandedItem === item.key ? null : item.key)}
                  onOpenModal={item.key === 'personal' ? () => setShowDetailsModal(true) : undefined}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        padding: '32px 48px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <img src="/inside_voice_Logo.png" alt="Inside Voice" style={{ height: 32, opacity: 0.3 }} />
      </footer>

      {/* Personal Details Modal */}
      <PersonalDetailsModal
        person={person}
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        onSave={handleSaveDetails}
      />
    </div>
  );
}

// Info field component
function InfoField({ label, value }) {
  return (
    <div>
      <p style={{
        fontSize: 11,
        fontWeight: 500,
        color: '#888',
        margin: '0 0 6px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      }}>
        {label}
      </p>
      <p style={{ fontSize: 15, color: '#1a1a1a', margin: 0, fontWeight: 500 }}>
        {value || '—'}
      </p>
    </div>
  );
}

// Action tile component
function ActionTile({ icon, iconBg, title, subtitle, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'white',
        borderRadius: 24,
        padding: 28,
        boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.08)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.04)';
      }}
    >
      <div style={{
        width: 44,
        height: 44,
        background: iconBg,
        borderRadius: 14,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        boxShadow: `0 2px 8px ${iconBg}50`,
      }}>
        {icon}
      </div>
      <p style={{ fontSize: 17, fontWeight: 600, color: '#1a1a1a', margin: '0 0 4px' }}>
        {title}
      </p>
      <p style={{ fontSize: 13, color: '#888', margin: 0 }}>
        {subtitle}
      </p>
    </div>
  );
}

// Onboarding checklist item
function OnboardingItem({ item, isNext, isExpanded, onToggle, onOpenModal }) {
  const { key, label, complete } = item;

  // Completed state
  if (complete) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '16px 18px',
        background: '#fafafa',
        borderRadius: 16,
      }}>
        <div style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: COLORS.teal,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: `0 2px 8px ${COLORS.teal}50`,
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2.5 7L5.5 10L11.5 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p style={{
          fontSize: 14,
          fontWeight: 500,
          margin: 0,
          color: '#888',
          textDecoration: 'line-through',
          flex: 1,
        }}>
          {label}
        </p>
        <span style={{ fontSize: 12, color: COLORS.teal, fontWeight: 500 }}>Done</span>
      </div>
    );
  }

  // Next up (highlighted)
  if (isNext) {
    return (
      <div>
        <div
          onClick={key === 'personal' ? onOpenModal : onToggle}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '16px 18px',
            background: `${COLORS.gold}12`,
            borderRadius: isExpanded ? '16px 16px 0 0' : 16,
            outline: `1.5px solid ${COLORS.gold}60`,
            cursor: 'pointer',
          }}
        >
          <div style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: COLORS.gold,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: `0 2px 8px ${COLORS.gold}50`,
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>
              {key === 'ird' ? '2' : key === 'kiwisaver' ? '3' : '1'}
            </span>
          </div>
          <p style={{ fontSize: 14, fontWeight: 500, margin: 0, color: '#1a1a1a', flex: 1 }}>
            {label}
          </p>
          {key !== 'personal' && (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#BA7517"
              strokeWidth="2"
              strokeLinecap="round"
              style={{
                transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s',
              }}
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          )}
        </div>
        
        {/* Expanded content for IRD/KiwiSaver */}
        {isExpanded && key !== 'personal' && (
          <div style={{
            padding: '16px 18px',
            background: `${COLORS.gold}08`,
            borderRadius: '0 0 16px 16px',
            borderTop: 'none',
            outline: `1.5px solid ${COLORS.gold}60`,
            outlineOffset: -1.5,
          }}>
            <p style={{ fontSize: 14, color: '#666', margin: '0 0 12px' }}>
              Please complete this form and return it to Angela
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <a
                href={key === 'ird' ? '/forms/ird-form.pdf' : '/forms/kiwisaver-form.pdf'}
                download
                style={{
                  padding: '10px 16px',
                  borderRadius: 10,
                  border: '1px solid #E8E8EC',
                  background: 'white',
                  fontSize: 13,
                  fontWeight: 500,
                  color: '#1a1a1a',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download form
              </a>
              <a
                href={`mailto:angela@hunch.co.nz?subject=${key === 'ird' ? 'IRD' : 'KiwiSaver'} Form — ${label}&body=Hi Angela,%0A%0APlease find my completed ${key === 'ird' ? 'IRD' : 'KiwiSaver'} form attached.%0A%0AThanks!`}
                style={{
                  padding: '10px 16px',
                  borderRadius: 10,
                  background: COLORS.teal,
                  fontSize: 13,
                  fontWeight: 500,
                  color: COLORS.tealDark,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                Email to Angela
              </a>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Pending (greyed out)
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '16px 18px',
      background: '#fafafa',
      borderRadius: 16,
    }}>
      <div style={{
        width: 28,
        height: 28,
        borderRadius: '50%',
        border: '2px solid #d0d0d0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: '#888' }}>
          {key === 'ird' ? '2' : '3'}
        </span>
      </div>
      <p style={{ fontSize: 14, fontWeight: 500, margin: 0, color: '#888', flex: 1 }}>
        {label}
      </p>
    </div>
  );
}
