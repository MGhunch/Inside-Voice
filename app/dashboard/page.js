'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { DonutChart, TribeCard, PeopleTable, PersonEditModal, PaymentCalendar, ActionMenu } from '../../components';
import { calcTribeTotals, calcMonthlySalary, calcBillable } from '../../lib/utils';

export const dynamic = 'force-dynamic';

const ADMIN_FEE = 2000;
const SETUP_FEE = 1500;

export default function AdminPage() {
  const { data: session } = useSession() ?? {};
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTeam() {
      try {
        const res = await fetch('/api/team');
        if (res.ok) {
          const data = await res.json();
          setPeople(data);
        } else {
          console.error('Failed to fetch team:', res.status);
        }
      } catch (err) {
        console.error('Failed to fetch team:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTeam();
  }, []);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [activeTribe, setActiveTribe] = useState('All');
  const [previewMode, setPreviewMode] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Determine view based on role and preview mode
  const userRole = session?.user?.access || 'employee';
  const effectiveRole = previewMode || userRole;
  // 'angela' view = iv_admin seeing full details, 'spark' view = spark_admin/chapter_lead seeing client view
  const view = effectiveRole === 'iv_admin' ? 'angela' : 'spark';

  // Calculate data
  const tribeData = calcTribeTotals(people);
  const totalBillable = tribeData.reduce((sum, t) => sum + t.value, 0);
  const totalSalaryCost = people.reduce((sum, p) => sum + calcMonthlySalary(p), 0);
  const totalMargin = totalBillable - totalSalaryCost;

  // Fees
  const now = new Date();
  const newStarters = people.filter(p => {
    if (!p.startDate) return false;
    const d = new Date(p.startDate);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const setupTotal = newStarters * SETUP_FEE;
  const totalToBill = totalBillable + ADMIN_FEE + setupTotal;

  const handleSave = (updatedPerson) => {
    setPeople(people.map(p =>
      p.id === updatedPerson.id ? { ...p, ...updatedPerson } : p
    ));
    setSelectedPerson(null);
  };

  const handleTribeClick = (tribe) => {
    setActiveTribe(prev => prev === tribe ? 'All' : tribe);
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8f9fa 0%, #f0f4f3 100%)',
        fontFamily: "'DM Sans', system-ui, sans-serif",
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <img src="/inside_voice_Logo.png" alt="Inside Voice" style={{ height: 28, opacity: 0.2 }} />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8f9fa 0%, #f0f4f3 100%)',
      fontFamily: "'DM Sans', system-ui, sans-serif"
    }}>
      {/* Header */}
      <Header 
        userRole={userRole}
        previewMode={previewMode}
        onPreviewAs={setPreviewMode}
        onAdd={() => setShowOnboarding(true)} 
      />

      {/* Main Dashboard */}
      <main style={{ padding: '0 48px 48px' }}>

        {/* Billing Summary */}
        <BillingSummary
          tribeData={tribeData}
          total={totalBillable}
          totalToBill={totalToBill}
          activeTribe={activeTribe}
          onTribeClick={handleTribeClick}
        />

        {/* People Table */}
        <PeopleTable
          people={people}
          onPersonClick={setSelectedPerson}
          activeTribe={activeTribe}
          onTribeChange={setActiveTribe}
          view={view}
        />

        {/* Fees Summary */}
        <FeesSummary
          view={view}
          totalBillable={totalBillable}
          totalMargin={totalMargin}
          totalToBill={totalToBill}
          newStarters={newStarters}
          setupTotal={setupTotal}
          activeTribe={activeTribe}
          tribeData={tribeData}
          totalSalaryCost={totalSalaryCost}
          people={people}
        />

        {/* Payment Calendar — Angela view only */}
        {view === 'angela' && (
          <div style={{ marginTop: 24 }}>
            <PaymentCalendar
              fiscalYear="FY26"
              onPaymentChange={(month, status, allPayments) => {
                console.log('Payment updated:', month, status);
                // TODO: Write to Airtable
              }}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ padding: '32px 48px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <img src="/inside_voice_Logo.png" alt="Inside Voice" style={{ height: 32, opacity: 0.3 }} />
      </footer>

      {/* Edit Modal */}
      {selectedPerson && (
        <PersonEditModal
          person={selectedPerson}
          isOpen={true}
          onSave={handleSave}
          onClose={() => setSelectedPerson(null)}
          view={view}
        />
      )}

      {/* Onboarding Modal */}
      {showOnboarding && (
        <OnboardingModal onClose={() => setShowOnboarding(false)} />
      )}

    </div>
  );
}

// Onboarding coming soon modal
function OnboardingModal({ onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'white',
          borderRadius: 24,
          padding: '48px 40px',
          maxWidth: 360,
          width: '90%',
          textAlign: 'center',
          boxShadow: '0 24px 64px rgba(0,0,0,0.12)',
          position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 20, right: 20,
            background: '#f0f0f0', border: 'none', borderRadius: '50%',
            width: 32, height: 32, cursor: 'pointer',
            fontSize: 16, color: '#888', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}
        >✕</button>

        <img
          src="/inside_voice_Logo.png"
          alt="Inside Voice"
          style={{ height: 32, marginBottom: 28 }}
        />

        <h2 style={{
          fontSize: 22, fontWeight: 600,
          color: '#1a1a1a', margin: '0 0 8px',
        }}>Onboarding journey</h2>

        <p style={{ fontSize: 14, color: '#999', margin: '0 0 24px' }}>
          Email journey for new starters
        </p>

        <div style={{
          display: 'inline-block',
          background: '#00CEB4',
          color: '#04342C',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '1px',
          textTransform: 'uppercase',
          padding: '4px 14px',
          borderRadius: 20,
        }}>Coming soon</div>
      </div>
    </div>
  );
}

// View label config — all teal for consistency
const VIEW_OPTIONS = [
  { role: 'iv_admin', label: 'Admin', color: '#00CEB4' },
  { role: 'spark_admin', label: 'Spark', color: '#00CEB4' },
  { role: 'chapter_lead', label: 'Chapter Lead', color: '#00CEB4' },
  { role: 'employee', label: 'Team', color: '#00CEB4' },
];

const VIEW_LABELS = Object.fromEntries(VIEW_OPTIONS.map(v => [v.role, v]));

// Header with ActionMenu
function Header({ userRole, previewMode, onPreviewAs, onAdd }) {
  const [showViewDropdown, setShowViewDropdown] = useState(false);
  const dropdownRef = useRef(null);
  
  const effectiveRole = previewMode || userRole;
  const viewConfig = VIEW_LABELS[effectiveRole] || VIEW_LABELS.employee;
  const isAdmin = userRole === 'iv_admin';

  // Close dropdown on outside click
  useEffect(() => {
    if (!showViewDropdown) return;
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowViewDropdown(false);
      }
    };
    const timer = setTimeout(() => document.addEventListener('click', handleClick), 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClick);
    };
  }, [showViewDropdown]);

  const handleViewSelect = (role) => {
    if (role === userRole) {
      onPreviewAs(null); // Back to own view
    } else {
      onPreviewAs(role);
    }
    setShowViewDropdown(false);
  };

  return (
    <header style={{
      padding: '32px 48px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <img src="/inside_voice_Logo.png" alt="Inside Voice" style={{ height: 28, opacity: 0.7 }} />
        <div style={{ width: 1, height: 32, background: '#e0e0e0' }} />
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 600, margin: 0, color: '#1a1a1a' }}>Spark</h1>
        </div>
        <div style={{ width: 1, height: 32, background: '#e0e0e0' }} />
        
        {/* View switcher - dropdown for admins, static label for others */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            onClick={() => isAdmin && setShowViewDropdown(s => !s)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: `${viewConfig.color}15`,
              padding: '6px 14px',
              borderRadius: 20,
              border: 'none',
              cursor: isAdmin ? 'pointer' : 'default',
              transition: 'all 0.15s',
            }}
          >
            <div style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: viewConfig.color,
            }} />
            <span style={{ fontSize: 13, fontWeight: 500, color: viewConfig.color }}>
              {viewConfig.label}
            </span>
            {isAdmin && (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginLeft: 2 }}>
                <path d="M3 5L6 8L9 5" stroke={viewConfig.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>

          {showViewDropdown && isAdmin && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: 8,
              background: 'white',
              borderRadius: 12,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              padding: '6px 0',
              minWidth: 160,
              zIndex: 100,
            }}>
              {VIEW_OPTIONS.map(option => (
                <button
                  key={option.role}
                  onClick={() => handleViewSelect(option.role)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    width: '100%',
                    padding: '10px 16px',
                    border: 'none',
                    background: effectiveRole === option.role ? `${option.color}10` : 'transparent',
                    textAlign: 'left',
                    fontSize: 13,
                    fontWeight: 500,
                    color: '#1a1a1a',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                  onMouseEnter={e => e.target.style.background = `${option.color}10`}
                  onMouseLeave={e => e.target.style.background = effectiveRole === option.role ? `${option.color}10` : 'transparent'}
                >
                  <div style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: option.color,
                  }} />
                  {option.label}
                  {effectiveRole === option.role && (
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ marginLeft: 'auto' }}>
                      <path d="M3.5 8.5L6.5 11.5L12.5 5.5" stroke={option.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <ActionMenu
        userRole={userRole}
        previewMode={previewMode}
        onAddPerson={onAdd}
        onPreviewAs={onPreviewAs}
      />
    </header>
  );
}

// Billing summary — donut shows totalToBill, date in center
function BillingSummary({ tribeData, total, totalToBill, activeTribe, onTribeClick }) {
  return (
    <div style={{
      background: 'white', borderRadius: 24, padding: 40,
      boxShadow: '0 4px 24px rgba(0,0,0,0.04)', marginBottom: 24,
    }}>
      <div style={{ display: 'flex', gap: 48, alignItems: 'center' }}>
        <DonutChart data={tribeData} total={total} centerTotal={totalToBill} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
          {tribeData.map(item => (
            <TribeCard
              key={item.tribe}
              tribe={item.tribe}
              color={item.color}
              value={item.value}
              count={item.count}
              isActive={activeTribe === item.tribe}
              onClick={() => onTribeClick(item.tribe)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Fees summary — different columns per view
function FeesSummary({ view, totalBillable, totalMargin, totalToBill, newStarters, setupTotal, activeTribe, tribeData, totalSalaryCost, people }) {
  const numTribes = tribeData.length || 3;
  const feeShare = Math.round((ADMIN_FEE + setupTotal) / numTribes);
  const tribeFiltered = activeTribe !== 'All' ? tribeData.find(t => t.tribe === activeTribe) : null;
  const activeBillable = tribeFiltered ? tribeFiltered.value : totalBillable;
  const activeSalaryCost = tribeFiltered
    ? people.filter(p => p.tribe === activeTribe).reduce((sum, p) => sum + calcMonthlySalary(p), 0)
    : totalSalaryCost;
  const activeMargin = activeBillable - activeSalaryCost;
  const activeFees = tribeFiltered ? feeShare : ADMIN_FEE + setupTotal;
  const activeTotal = activeBillable + activeFees;
  const totalLabel = activeTribe !== 'All' ? `${activeTribe} total` : 'March total';

  const sparkCols = tribeFiltered ? [
    { label: 'Fee share', value: feeShare, sub: '1/3 of monthly fees', highlight: false },
    { label: totalLabel, value: activeTotal, sub: 'incl. fee share', highlight: true },
  ] : [
    { label: 'Admin fee', value: ADMIN_FEE, sub: 'monthly flat fee', highlight: false },
    { label: 'Set up fees', value: setupTotal, sub: newStarters > 0 ? `${newStarters} new ${newStarters === 1 ? 'starter' : 'starters'} × $${SETUP_FEE.toLocaleString()}` : 'no new starters', highlight: false },
    { label: totalLabel, value: totalToBill, sub: 'incl. all fees', highlight: true },
  ];

  const angelaCols = tribeFiltered ? [
    { label: 'Margin', value: activeMargin, sub: 'billable minus costs', highlight: false },
    { label: totalLabel, value: activeTotal, sub: 'incl. fee share', highlight: true },
  ] : [
    { label: 'Margin', value: totalMargin, sub: 'billable minus costs', highlight: false },
    { label: 'Fees', value: ADMIN_FEE + setupTotal, sub: `admin + ${newStarters} ${newStarters === 1 ? 'start up' : 'start ups'}`, highlight: false },
    { label: totalLabel, value: totalToBill, sub: 'all inclusive', highlight: true },
  ];

  const cols = view === 'spark' ? sparkCols : angelaCols;

  return (
    <div style={{
      background: 'white',
      borderRadius: 24,
      overflow: 'hidden',
      boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
      marginTop: 24,
      display: 'flex',
    }}>
      {cols.map((col, i) => (
        <div key={col.label} style={{
          flex: 1,
          padding: '28px 32px',
          borderLeft: i > 0 ? '1px solid #f0f0f0' : 'none',
          background: 'white',
        }}>
          <p style={{ fontSize: 11, fontWeight: 500, color: '#888', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {col.label}
          </p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <p style={{ fontSize: 28, fontWeight: 600, margin: '0 0 6px', color: col.highlight ? '#00CEB4' : '#1a1a1a' }}>
              ${col.value.toLocaleString()}
            </p>
            {col.highlight && (
              <span style={{ fontSize: 15, fontWeight: 500, color: '#00CEB4', marginBottom: 6 }}>+GST</span>
            )}
          </div>
          <p style={{ fontSize: 13, color: '#bbb', margin: 0 }}>{col.sub}</p>
        </div>
      ))}
    </div>
  );
}
