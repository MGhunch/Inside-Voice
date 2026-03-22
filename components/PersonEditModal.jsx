'use client';

import { useState } from 'react';
import { COLORS } from '../lib/utils';

export default function PersonEditModal({ 
  person, 
  onSave, 
  onClose,
  isOpen = true,
  view = 'angela'
}) {
  const readOnly = view === 'spark';
  // Base values (what they started with)
  const baseSalary = person?.salary || 90000;
  const baseHours = person?.hours || 40;
  
  // Current form state
  const [jobTitle, setJobTitle] = useState(person?.jobTitle || '');
  const [tribe, setTribe] = useState(person?.tribe || 'Brand');
  const [status, setStatus] = useState(person?.status || 'Ongoing');
  const [chapterLead, setChapterLead] = useState(person?.chapterLead || '');
  const [startDate, setStartDate] = useState(person?.startDate || '');
  const [endDate, setEndDate] = useState(person?.endDate || '');
  const [salary, setSalary] = useState(baseSalary);
  const [hours, setHours] = useState(baseHours);
  const [kiwiSaver, setKiwiSaver] = useState(person?.kiwiSaver ?? true);
  const [allowances, setAllowances] = useState(person?.allowances || 0);
  const [marginPercent, setMarginPercent] = useState(person?.marginPercent || 5);
  const [holidayDays, setHolidayDays] = useState(0);
  
  // Effective dates for changes
  const [salaryEffective, setSalaryEffective] = useState('');
  const [hoursEffective, setHoursEffective] = useState('');
  
  // Calculations
  const ratio = hours / 40;
  const monthlySalary = Math.round((salary / 12) * ratio);
  const kiwiSaverAmount = kiwiSaver ? Math.round(monthlySalary * 0.035) : 0;
  const totalCost = monthlySalary + kiwiSaverAmount + allowances;
  const marginAmount = Math.round(monthlySalary * (marginPercent / 100));
  const totalBillable = totalCost + marginAmount;
  
  // Original billable for comparison
  const originalRatio = baseHours / 40;
  const originalMonthly = Math.round((baseSalary / 12) * originalRatio);
  const originalKS = kiwiSaver ? Math.round(originalMonthly * 0.035) : 0;
  const originalCost = originalMonthly + originalKS + (person?.allowances || 0);
  const originalMargin = Math.round(originalMonthly * (marginPercent / 100));
  const originalBillable = originalCost + originalMargin;
  
  const billableDiff = totalBillable - originalBillable;
  const salaryChanged = salary !== baseSalary;
  const hoursChanged = hours !== baseHours;
  
  // Holiday payout calculation (daily rate × days)
  const dailyRate = monthlySalary / 21.67; // average working days per month
  const holidayPayout = Math.round(holidayDays * dailyRate);
  
  const handleSave = () => {
    onSave?.({
      ...person,
      jobTitle,
      tribe,
      status,
      chapterLead,
      startDate,
      endDate,
      salary,
      hours,
      kiwiSaver,
      allowances,
      marginPercent,
      salaryEffective: salaryChanged ? salaryEffective : null,
      hoursEffective: hoursChanged ? hoursEffective : null,
      holidayDays: status === 'Finishing' ? holidayDays : null,
      holidayPayout: status === 'Finishing' ? holidayPayout : null,
      // Calculated values
      monthlySalary,
      kiwiSaverAmount,
      totalCost,
      marginAmount,
      totalBillable,
    });
  };
  
  if (!isOpen) return null;

  if (readOnly) {
    return (
      <SparkView
        person={person}
        tribe={tribe}
        jobTitle={jobTitle}
        status={status}
        chapterLead={chapterLead}
        startDate={startDate}
        endDate={endDate}
        hours={hours}
        salary={salary}
        kiwiSaver={kiwiSaver}
        allowances={allowances}
        marginPercent={marginPercent}
        monthlySalary={monthlySalary}
        kiwiSaverAmount={kiwiSaverAmount}
        totalCost={totalCost}
        totalBillable={totalBillable}
        onClose={onClose}
      />
    );
  }
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-[820px] overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="px-8 pt-7 pb-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <AvatarCircle name={person?.name} tribe={tribe} />
              <h1 
                className="text-[36px] font-medium tracking-tight leading-none"
                style={{ fontFamily: "'DM Sans', system-ui, sans-serif", color: COLORS.purple }}
              >
                {person?.name || 'New Person'}
              </h1>
            </div>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors mt-1"
            >
              ×
            </button>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-2">
          
          {/* Left - Details */}
          <div className="p-6 border-r border-gray-200">
            
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Job title</label>
                <input 
                  type="text" 
                  value={jobTitle}
                  onChange={(e) => !readOnly && setJobTitle(e.target.value)}
                  readOnly={readOnly}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
                  style={{ background: readOnly ? '#fafafa' : 'white', cursor: readOnly ? 'default' : 'text' }}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Tribe</label>
                  <select 
                    value={tribe}
                    onChange={(e) => !readOnly && setTribe(e.target.value)}
                    disabled={readOnly}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 bg-white"
                    style={{ paddingRight: 28, background: readOnly ? '#fafafa' : 'white' }}
                  >
                    <option>Brand</option>
                    <option>Customer</option>
                    <option>Business</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Status</label>
                  <select 
                    value={status}
                    onChange={(e) => !readOnly && setStatus(e.target.value)}
                    disabled={readOnly}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 bg-white"
                    style={{ paddingRight: 28, background: readOnly ? '#fafafa' : 'white' }}
                  >
                    <option>Ongoing</option>
                    <option>Fixed Term</option>
                    <option>Part-time</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="text-xs text-gray-500 block mb-1">Chapter lead</label>
                <input 
                  type="text" 
                  value={chapterLead}
                  onChange={(e) => !readOnly && setChapterLead(e.target.value)}
                  readOnly={readOnly}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
                  style={{ background: readOnly ? '#fafafa' : 'white', cursor: readOnly ? 'default' : 'text' }}
                />
              </div>
              
              {/* End Date + Holiday Payout - shows when Finishing */}
              {status === 'Finishing' && (
                <div className="rounded-lg p-4" style={{ backgroundColor: COLORS.redLight }}>
                  <label className="text-xs font-medium block mb-1" style={{ color: COLORS.red }}>End date</label>
                  <input 
                    type="text" 
                    value={endDate}
                    onChange={(e) => !readOnly && setEndDate(e.target.value)}
                    readOnly={readOnly}
                    placeholder="e.g. 30 June 2025"
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none mb-3"
                    style={{ borderColor: COLORS.red }}
                  />
                  <div className="pt-3 border-t border-red-200">
                    <label className="text-xs block mb-2" style={{ color: COLORS.red }}>Holiday payout</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        value={holidayDays || ''}
                        onChange={(e) => !readOnly && setHolidayDays(parseFloat(e.target.value) || 0)}
                        readOnly={readOnly}
                        placeholder="Days"
                        className="w-16 px-2 py-2 border rounded-lg text-sm focus:outline-none"
                        style={{ borderColor: COLORS.red }}
                      />
                      <span className="text-sm" style={{ color: COLORS.redDark }}>days =</span>
                      <span className="text-[15px] font-medium" style={{ color: COLORS.redDark }}>
                        ${holidayPayout.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Start date</label>
                  <input 
                    type="text" 
                    value={startDate}
                    onChange={(e) => !readOnly && setStartDate(e.target.value)}
                    readOnly={readOnly}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
                    style={{ background: readOnly ? '#fafafa' : 'white', cursor: readOnly ? 'default' : 'text' }}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">End date</label>
                  <input 
                    type="text"
                    value={endDate}
                    placeholder="Ongoing"
                    readOnly={readOnly}
                    onChange={(e) => {
                      if (readOnly) return;
                      setEndDate(e.target.value);
                      if (e.target.value) setStatus('Finishing');
                      else setStatus('Ongoing');
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
                    style={{ color: endDate ? '#1a1a1a' : '#aaa', background: readOnly ? '#fafafa' : 'white' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right - Money */}
          <div className="p-6 bg-gray-50">
            
            <div className="space-y-5">
              {/* Annual Salary */}
              <div>
                <label className="text-xs text-gray-500 block mb-1">Annual salary (FTE)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input 
                    type="text" 
                    value={salary.toLocaleString()}
                    onChange={(e) => {
                      if (readOnly) return;
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setSalary(parseInt(val) || 0);
                    }}
                    readOnly={readOnly}
                    className="w-full pl-6 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
                    style={{ background: readOnly ? '#f3f4f6' : 'white', cursor: readOnly ? 'default' : 'text' }}
                  />
                </div>
                
                {/* Salary Change Callout — angela only */}
                {!readOnly && salaryChanged && salary > 0 && (
                  <div className="mt-2 p-3 rounded-lg" style={{ backgroundColor: COLORS.gold }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm" style={{ color: '#633806' }}>${baseSalary.toLocaleString()}</span>
                      <span className="text-sm" style={{ color: '#633806' }}>→</span>
                      <span className="text-sm font-medium" style={{ color: COLORS.goldDark }}>${salary.toLocaleString()}</span>
                      <span className="text-xs ml-auto" style={{ color: '#633806' }}>
                        {salary > baseSalary ? '+' : ''}${(salary - baseSalary).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs" style={{ color: '#633806' }}>From</label>
                      <input 
                        type="date" 
                        value={salaryEffective}
                        onChange={(e) => setSalaryEffective(e.target.value)}
                        className="flex-1 px-2 py-1.5 border rounded text-sm focus:outline-none"
                        style={{ borderColor: '#BA7517', backgroundColor: '#FAEEDA' }}
                      />
                    </div>
                  </div>
                )}
              </div>
              
              {/* Hours Slider */}
              <div>
                <label className="text-xs text-gray-500 block mb-2">Hours per week</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="range" 
                    min="8" 
                    max="40" 
                    step="4"
                    value={hours}
                    onChange={(e) => !readOnly && setHours(parseInt(e.target.value))}
                    disabled={readOnly}
                    className="h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    style={{ accentColor: COLORS.teal, width: '85%', opacity: readOnly ? 0.6 : 1 }}
                  />
                  <span className="text-base font-medium" style={{ color: COLORS.teal }}>{hours}</span>
                </div>
                
                {/* Hours Change Callout — angela only */}
                {!readOnly && hoursChanged && (
                  <div className="mt-2 p-3 rounded-lg" style={{ backgroundColor: COLORS.gold }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm" style={{ color: '#633806' }}>{baseHours} hrs</span>
                      <span className="text-sm" style={{ color: '#633806' }}>→</span>
                      <span className="text-sm font-medium" style={{ color: COLORS.goldDark }}>{hours} hrs</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs" style={{ color: '#633806' }}>From</label>
                      <input 
                        type="date" 
                        value={hoursEffective}
                        onChange={(e) => setHoursEffective(e.target.value)}
                        className="flex-1 px-2 py-1.5 border rounded text-sm focus:outline-none"
                        style={{ borderColor: '#BA7517', backgroundColor: '#FAEEDA' }}
                      />
                    </div>
                  </div>
                )}
              </div>
              
              {/* KiwiSaver + Allowances */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">KiwiSaver</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={kiwiSaver}
                      onChange={(e) => setKiwiSaver(e.target.checked)}
                      className="w-4 h-4 rounded"
                      style={{ accentColor: COLORS.teal }}
                    />
                    <span className="text-sm text-gray-500">3.5%</span>
                    <span className="text-sm font-medium" style={{ color: COLORS.teal }}>
                      +${kiwiSaverAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Allowances</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input 
                      type="text" 
                      value={allowances}
                      onChange={(e) => setAllowances(parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0)}
                      className="w-full pl-6 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
                    />
                  </div>
                </div>
              </div>
              
              {/* Margin */}
              <div>
                <label className="text-xs text-gray-500 block mb-1">Margin</label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setMarginPercent(5)}
                    className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors"
                    style={{ 
                      backgroundColor: marginPercent === 5 ? `${COLORS.teal}18` : 'white',
                      color: marginPercent === 5 ? COLORS.teal : '#666',
                      border: `1px solid ${marginPercent === 5 ? `${COLORS.teal}40` : '#e5e5e5'}`
                    }}
                  >
                    5%
                  </button>
                  <button 
                    onClick={() => setMarginPercent(10)}
                    className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors"
                    style={{ 
                      backgroundColor: marginPercent === 10 ? `${COLORS.teal}18` : 'white',
                      color: marginPercent === 10 ? COLORS.teal : '#666',
                      border: `1px solid ${marginPercent === 10 ? `${COLORS.teal}40` : '#e5e5e5'}`
                    }}
                  >
                    10%
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Totals */}
        <div className="border-t border-gray-200 flex justify-between items-center"
          style={{ background: '#fafafa', padding: '20px 32px' }}
        >
          <div className="flex gap-3">
            {!readOnly && (
              <button 
                onClick={handleSave}
                className="rounded-lg font-medium transition-colors"
                style={{ padding: '12px 28px', fontSize: 15, backgroundColor: COLORS.teal, color: COLORS.tealDark, border: 'none', cursor: 'pointer' }}
              >
                Save
              </button>
            )}
            <button 
              onClick={onClose}
              style={{ padding: '12px 24px', fontSize: 15, borderRadius: 10, border: '1px solid #e0e0e0', background: 'white', cursor: 'pointer', fontWeight: 500 }}
            >
              {readOnly ? 'Close' : 'Cancel'}
            </button>
          </div>

          <div className="flex items-center gap-12">
            {/* Change Indicator — angela only */}
            {!readOnly && billableDiff !== 0 && (
              <>
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-gray-400 block mb-0.5">Change</span>
                  <span className="text-3xl font-medium" style={{ color: COLORS.gold }}>
                    {billableDiff > 0 ? '+' : ''}${Math.abs(billableDiff).toLocaleString()}
                  </span>
                </div>
                <div className="w-px h-10 bg-gray-200" />
              </>
            )}
            <div>
              <span className="text-[11px] uppercase tracking-wider text-gray-400 block mb-0.5">Salary</span>
              <span className="text-3xl font-medium text-gray-900">${totalCost.toLocaleString()}</span>
            </div>
            <div className="w-px h-10 bg-gray-200" />
            <div>
              <span className="text-[11px] uppercase tracking-wider text-gray-400 block mb-0.5">Billable</span>
              <span className="text-3xl font-medium" style={{ color: COLORS.teal }}>${totalBillable.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const TRIBE_COLORS = {
  Brand: { color: '#00CEB4', darkColor: '#04342C' },
  Customer: { color: '#584E9F', darkColor: '#ffffff' },
  Business: { color: '#FEC514', darkColor: '#BA7517' },
};

function AvatarCircle({ name, tribe, size = 56 }) {
  const initials = name
    ?.split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';
  const config = TRIBE_COLORS[tribe] || { color: '#888', darkColor: '#333' };
  const textColor = tribe === 'Business' ? '#BA7517' : config.color;
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: 'white',
      border: `3px solid ${config.color}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 600,
      fontSize: size * 0.325,
      color: textColor,
      flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

function SparkView({ person, tribe, jobTitle, status, chapterLead, startDate, endDate, hours, salary, kiwiSaver, allowances, marginPercent, monthlySalary, kiwiSaverAmount, totalCost, totalBillable, onClose }) {
  const [selectedMargin, setSelectedMargin] = useState(marginPercent);

  const calcBillableAtMargin = (m) => {
    const margin = Math.round(monthlySalary * (m / 100));
    return totalCost + margin;
  };

  const billableAtSelected = calcBillableAtMargin(selectedMargin);

  const Field = ({ label, value }) => (
    <div>
      <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#aaa', fontWeight: 500, margin: '0 0 4px' }}>{label}</p>
      <p style={{ fontSize: 15, color: '#1a1a1a', margin: 0, fontWeight: 500 }}>{value || '—'}</p>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-[820px] overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="px-8 pt-7 pb-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <AvatarCircle name={person?.name} tribe={tribe} />
              <h1
                className="text-[36px] font-medium tracking-tight leading-none"
                style={{ fontFamily: "'DM Sans', system-ui, sans-serif", color: COLORS.purple }}
              >
                {person?.name}
              </h1>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors mt-1"
            >
              ×
            </button>
          </div>
        </div>

        {/* Two column view */}
        <div className="grid grid-cols-2">

          {/* Left — Details */}
          <div className="p-6 border-r border-gray-200">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <Field label="Job title" value={jobTitle} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <Field label="Tribe" value={tribe} />
                <Field label="Status" value={status} />
              </div>
              <Field label="Chapter lead" value={chapterLead} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <Field label="Start date" value={startDate} />
                <Field label="End date" value={endDate || 'Ongoing'} />
              </div>
              <Field label="Hours per week" value={`${hours} hrs`} />
            </div>
          </div>

          {/* Right — Money */}
          <div className="p-6 bg-gray-50">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <Field label="Annual salary (FTE)" value={`$${salary.toLocaleString()}`} />
              <Field label="Monthly salary" value={`$${monthlySalary.toLocaleString()}`} />
              {kiwiSaver && <Field label="KiwiSaver (3.5%)" value={`+$${kiwiSaverAmount.toLocaleString()}`} />}
              {allowances > 0 && <Field label="Allowances" value={`+$${allowances.toLocaleString()}`} />}

              {/* Margin selector */}
              <div>
                <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#aaa', fontWeight: 500, margin: '0 0 8px' }}>Margin</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[5, 10].map(m => (
                    <button
                      key={m}
                      onClick={() => setSelectedMargin(m)}
                      style={{
                        flex: 1, padding: '12px', borderRadius: 10, fontSize: 14, fontWeight: 500,
                        border: `1px solid ${selectedMargin === m ? `${COLORS.teal}40` : '#e5e5e5'}`,
                        background: selectedMargin === m ? `${COLORS.teal}18` : 'white',
                        color: selectedMargin === m ? COLORS.teal : '#888',
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}
                    >
                      {m}%
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 flex justify-between items-center"
          style={{ background: '#fafafa', padding: '20px 32px' }}
        >
          <div style={{ display: 'flex', gap: 12 }}>
            <a
              href={`mailto:angela@insidevoice.co.nz?subject=Change request — ${person?.name}&body=Hi Angela,%0A%0AI'd like to request a change for ${person?.name}.%0A%0A`}
              style={{
                padding: '12px 24px', borderRadius: 10, fontSize: 15, fontWeight: 500,
                background: COLORS.teal, color: COLORS.tealDark, textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Make a change
            </a>
            <button
              onClick={onClose}
              style={{
                padding: '12px 24px', borderRadius: 10, fontSize: 15, fontWeight: 500,
                border: '1px solid #e0e0e0', background: 'white', cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div>
              <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#aaa', display: 'block', marginBottom: 2 }}>Salary</span>
              <span style={{ fontSize: 30, fontWeight: 600, color: '#1a1a1a' }}>${totalCost.toLocaleString()}</span>
            </div>
            <div style={{ width: 1, height: 40, background: '#f0f0f0' }} />
            <div>
              <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#aaa', display: 'block', marginBottom: 2 }}>Billable</span>
              <span style={{ fontSize: 30, fontWeight: 600, color: COLORS.teal }}>${billableAtSelected.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
