'use client';

import { useState, useEffect } from 'react';
import { DonutChart, TribeCard, PeopleTable, PersonEditModal, PaymentCalendar } from '../components';
import { calcTribeTotals, calcMonthlySalary } from '../lib/utils';

const ADMIN_FEE = 2000;
const SETUP_FEE = 1500;

export default function AdminPage() {
  const [people, setPeople] = useState([]);
  const [payments, setPayments] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [activeTribe, setActiveTribe] = useState('All');
  const [view, setView] = useState('spark');
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [teamRes, paymentsRes] = await Promise.all([
          fetch('/api/team'),
          fetch('/api/payments?fiscalYear=FY26'),
        ]);
        const [teamData, paymentsData] = await Promise.all([
          teamRes.json(),
          paymentsRes.json(),
        ]);
        setPeople(teamData);
        setPayments(paymentsData);
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

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

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8f9fa 0%, #f0f4f3 100%)',
      fontFamily: "'DM Sans', system-ui, sans-serif"
    }}>

      {loading && (
        <div style={{
          position: 'fixed', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(248,249,250,0.8)', zIndex: 50,
          fontSize: 14, color: '#888',
        }}>
          Loading…
        </div>
      )}

      {/* Header */}
      <Header view={view} onViewChange={setView} onAdd={() => setShowOnboarding(true)} />

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
              payments={payments}
              onPaymentChange={(month, status, allPayments) => {
                setPayments(allPayments);
                // TODO: Write status back to Airtable
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

// Header with view toggle
function Header({ view, onViewChange, onAdd }) {
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
      </div>

      {/* View toggle */}
      <div style={{
        display: 'flex',
        background: '#f0f0f0',
        borderRadius: 20,
        padding: 3,
        gap: 2,
      }}>
        {['spark', 'angela'].map(v => (
          <button
            key={v}
            onClick={() => onViewChange(v)}
            style={{
              padding: '6px 16px',
              borderRadius: 18,
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 500,
              transition: 'all 0.15s',
              background: view === v ? 'white' : 'transparent',
              color: view === v ? '#1a1a1a' : '#888',
              boxShadow: view === v ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            {v === 'spark' ? 'Spark' : 'Angela'}
          </button>
        ))}
      </div>

      <button onClick={onAdd} style={{
        width: 48, height: 48, borderRadius: '50%',
        background: '#00CEB4', border: 'none', color: '#04342C',
        fontSize: 24, cursor: 'pointer', display: 'flex',
        alignItems: 'center', justifyContent: 'center', fontWeight: 500,
        boxShadow: '0 4px 12px rgba(0, 206, 180, 0.3)',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}>+</button>
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
