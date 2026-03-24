'use client';

import { useState, useEffect, Suspense } from 'react';
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
  return (
    <Suspense fallback={<PageLoading />}>
      <EmployeePageContent />
    </Suspense>
  );
}

// Loading state component
function PageLoading() {
  return (
    <div className="min-h-screen bg-page flex items-center justify-center">
      <img src="/inside_voice_Logo.png" alt="Inside Voice" className="h-7 opacity-20" />
    </div>
  );
}

function EmployeePageContent() {
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
          const res = await fetch('/api/team');
          if (res.ok) {
            const team = await res.json();
            const found = team.find(p => p.id === viewAsId);
            if (found) setPerson(found);
            else console.error('Person not found:', viewAsId);
          }
        } else {
          const res = await fetch('/api/team/me');
          if (res.ok) {
            const data = await res.json();
            setPerson(data);
          } else {
            // Demo fallback
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

  if (loading) return <PageLoading />;

  const tribeConfig = TRIBE_CONFIG[person?.tribe] || { color: '#888' };
  const tribeTextColor = person?.tribe === 'Business' ? '#BA7517' : tribeConfig.color;

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-page font-body">
      {/* Header */}
      <header className="px-12 py-8 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <img src="/inside_voice_Logo.png" alt="Inside Voice" className="h-7 opacity-70" />
          <div className="w-px h-8 bg-gray-300" />
          <h1 className="text-[28px] font-semibold text-gray-900">Spark</h1>
        </div>
      </header>

      {/* Admin preview banner */}
      {isAdminPreview && person && (
        <div className="bg-purple text-white px-12 py-2.5 flex items-center justify-between text-[13px] font-medium">
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Viewing as {person.name}
            <span className="opacity-70">— Team member</span>
          </div>
          <Link
            href="/dashboard"
            className="bg-white/20 rounded-md px-2.5 py-1 text-xs font-medium hover:bg-white/30 transition-colors"
          >
            ← Back to dashboard
          </Link>
        </div>
      )}

      {/* Main content */}
      <main className="px-12 pb-12 max-w-[720px] mx-auto">
        
        {/* Hero Card */}
        <div className="card p-10 mb-4">
          <div className="flex items-start justify-between mb-7">
            <div>
              <p className="label mb-2">Welcome back</p>
              <h2 className="text-[32px] font-semibold text-gray-900 font-heading">
                {person?.name}
              </h2>
            </div>
            {/* Tribe badge */}
            <span 
              className="badge"
              style={{ 
                color: tribeTextColor,
                background: `${tribeConfig.color}15`,
              }}
            >
              <span 
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: tribeConfig.color }}
              />
              {person?.tribe}
            </span>
          </div>

          {/* Info row */}
          <div className="flex gap-10 pt-6 border-t border-gray-100">
            <InfoField label="Chapter lead" value={person?.chapterLead} />
            <InfoField label="Started" value={formatDate(person?.startDate)} />
            <InfoField label="Role" value={person?.jobTitle} />
          </div>
        </div>

        {/* Action Tiles */}
        <div className="grid grid-cols-2 gap-4 mb-4">
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

        {/* Getting Started Card */}
        {!allComplete && (
          <div className="card p-7">
            <div className="flex items-center justify-between mb-5">
              <p className="text-[17px] font-semibold text-gray-900">Getting started</p>
              <span className="text-[13px] text-teal font-medium">
                {completedCount} of {onboardingItems.length}
              </span>
            </div>

            <div className="flex flex-col gap-2.5">
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
      <footer className="py-8 flex justify-center">
        <img src="/inside_voice_Logo.png" alt="Inside Voice" className="h-8 opacity-30" />
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
      <p className="label mb-1.5">{label}</p>
      <p className="text-[15px] text-gray-900 font-medium">{value || '—'}</p>
    </div>
  );
}

// Action tile component
function ActionTile({ icon, iconBg, title, subtitle, onClick }) {
  return (
    <div
      onClick={onClick}
      className="card card-hover p-7 cursor-pointer"
    >
      <div 
        className="w-11 h-11 rounded-[14px] flex items-center justify-center mb-4"
        style={{ 
          background: iconBg,
          boxShadow: `0 2px 8px ${iconBg}50`,
        }}
      >
        {icon}
      </div>
      <p className="text-[17px] font-semibold text-gray-900 mb-1">{title}</p>
      <p className="text-[13px] text-gray-500">{subtitle}</p>
    </div>
  );
}

// Onboarding checklist item
function OnboardingItem({ item, isNext, isExpanded, onToggle, onOpenModal }) {
  const { key, label, complete } = item;
  const stepNumber = key === 'personal' ? '1' : key === 'ird' ? '2' : '3';

  // Completed state
  if (complete) {
    return (
      <div className="flex items-center gap-3.5 px-4 py-4 bg-gray-bg rounded-xl">
        <div 
          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
          style={{ 
            background: COLORS.teal,
            boxShadow: `0 2px 8px ${COLORS.teal}50`,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2.5 7L5.5 10L11.5 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="text-sm font-medium text-gray-500 line-through flex-1">{label}</p>
        <span className="text-xs text-teal font-medium">Done</span>
      </div>
    );
  }

  // Next up (highlighted)
  if (isNext) {
    return (
      <div>
        <div
          onClick={key === 'personal' ? onOpenModal : onToggle}
          className={`flex items-center gap-3.5 px-4 py-4 cursor-pointer ${
            isExpanded ? 'rounded-t-xl' : 'rounded-xl'
          }`}
          style={{
            background: `${COLORS.gold}12`,
            outline: `1.5px solid ${COLORS.gold}60`,
          }}
        >
          <div 
            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
            style={{ 
              background: COLORS.gold,
              boxShadow: `0 2px 8px ${COLORS.gold}50`,
            }}
          >
            <span className="text-[13px] font-semibold text-gray-900">{stepNumber}</span>
          </div>
          <p className="text-sm font-medium text-gray-900 flex-1">{label}</p>
          {key !== 'personal' && (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#BA7517"
              strokeWidth="2"
              strokeLinecap="round"
              className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          )}
        </div>
        
        {/* Expanded content for IRD/KiwiSaver */}
        {isExpanded && key !== 'personal' && (
          <div 
            className="px-4 py-4 rounded-b-xl"
            style={{
              background: `${COLORS.gold}08`,
              outline: `1.5px solid ${COLORS.gold}60`,
              outlineOffset: -1.5,
            }}
          >
            <p className="text-sm text-gray-600 mb-3">
              Please complete this form and return it to Angela
            </p>
            <div className="flex gap-3">
              <a
                href={key === 'ird' ? '/forms/ird-form.pdf' : '/forms/kiwisaver-form.pdf'}
                download
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[10px] border border-gray-light bg-white text-[13px] font-medium text-gray-900 hover:bg-gray-50 transition-colors"
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
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[10px] bg-teal text-[13px] font-medium text-teal-dark hover:brightness-95 transition-all"
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
    <div className="flex items-center gap-3.5 px-4 py-4 bg-gray-bg rounded-xl">
      <div className="w-7 h-7 rounded-full border-2 border-gray-300 flex items-center justify-center shrink-0">
        <span className="text-[13px] font-medium text-gray-500">{stepNumber}</span>
      </div>
      <p className="text-sm font-medium text-gray-500 flex-1">{label}</p>
    </div>
  );
}
