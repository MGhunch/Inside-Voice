'use client';

import { useState } from 'react';

const TRIBE_COLORS = {
  Brand: { bg: '#00CEB4', text: '#04342C' },
  Customer: { bg: '#584E9F', text: '#ffffff' },
  Business: { bg: '#FEC514', text: '#412402' },
};

export default function NewPersonModal({ isOpen, onClose, onSave, chapterLeads = [] }) {
  // Personal details
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  
  // Contract details
  const [jobTitle, setJobTitle] = useState('');
  const [tribe, setTribe] = useState('Brand');
  const [chapterLead, setChapterLead] = useState('');
  const [startDate, setStartDate] = useState('');
  const [status, setStatus] = useState('Ongoing');
  const [endDate, setEndDate] = useState('');
  
  // Money
  const [salary, setSalary] = useState(90000);
  const [hours, setHours] = useState(40);
  const [kiwiSaver, setKiwiSaver] = useState(true);
  const [allowances, setAllowances] = useState(0);
  const [marginPercent, setMarginPercent] = useState(5);
  
  // Options
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true);
  
  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Calculations (allowances in base per the fix)
  const ratio = hours / 40;
  const monthlySalary = Math.round((salary / 12) * ratio);
  const base = monthlySalary + allowances;
  const kiwiSaverAmount = kiwiSaver ? Math.round(base * 0.035) : 0;
  const marginAmount = Math.round(base * (marginPercent / 100));
  const totalBillable = base + kiwiSaverAmount + marginAmount;

  const handleSave = async () => {
    if (!firstName || !lastName || !email) {
      setError('Name and email are required');
      return;
    }

    setLoading(true);
    setError('');

    const newPerson = {
      name: `${firstName} ${lastName}`,
      firstName,
      lastName,
      email,
      mobile,
      jobTitle,
      tribe,
      chapterLead,
      startDate,
      status,
      endDate: status === 'Fixed Term' ? endDate : '',
      salary,
      hours,
      kiwiSaver,
      allowances,
      marginPercent,
      sendWelcomeEmail,
    };

    try {
      await onSave?.(newPerson);
      onClose();
    } catch (err) {
      setError('Failed to save. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-[820px] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 pt-7 pb-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <AvatarCircle firstName={firstName} lastName={lastName} tribe={tribe} />
              <h1 className="text-[32px] font-medium tracking-tight leading-none font-body text-purple">
                Add someone new
              </h1>
            </div>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-2">
          
          {/* Left — Personal + Contract */}
          <div className="p-6 border-r border-gray-200 space-y-4">
            
            {/* Name */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label text-teal">First name</label>
                <input 
                  type="text" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Sarah"
                  className="input"
                />
              </div>
              <div>
                <label className="label text-teal">Last name</label>
                <input 
                  type="text" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Chen"
                  className="input"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="label text-teal">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sarah.chen@spark.co.nz"
                className="input"
              />
              <p className="text-xs text-gray-400 mt-1 text-right">Unlocks their sign-in access</p>
            </div>

            {/* Mobile */}
            <div>
              <label className="label text-teal">Mobile</label>
              <input 
                type="tel" 
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="021 123 4567"
                className="input"
              />
            </div>

            <hr className="border-gray-100 my-2" />

            {/* Job title */}
            <div>
              <label className="label text-teal">Job title</label>
              <input 
                type="text" 
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="In-house Creative"
                className="input"
              />
            </div>
            
            {/* Tribe + Status */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label text-teal">Tribe</label>
                <select 
                  value={tribe}
                  onChange={(e) => setTribe(e.target.value)}
                  className="input bg-white"
                >
                  <option>Brand</option>
                  <option>Customer</option>
                  <option>Business</option>
                </select>
              </div>
              <div>
                <label className="label text-teal">Status</label>
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="input bg-white"
                >
                  <option>Ongoing</option>
                  <option>Fixed Term</option>
                </select>
              </div>
            </div>
            
            {/* Chapter Lead */}
            <div>
              <label className="label text-teal">Chapter lead</label>
              <input 
                type="text" 
                value={chapterLead}
                onChange={(e) => setChapterLead(e.target.value)}
                placeholder="Mike Kevan"
                className="input"
              />
            </div>
            
            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label text-teal">Start date</label>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input"
                />
              </div>
              {status === 'Fixed Term' && (
                <div>
                  <label className="label text-teal">End date</label>
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="input"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right — Money */}
          <div className="p-6 bg-gray-50 space-y-4">
            
            {/* Salary */}
            <div>
              <label className="label text-teal">Annual salary (FTE)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input 
                  type="number" 
                  value={salary}
                  onChange={(e) => setSalary(Number(e.target.value))}
                  className="input pl-7"
                />
              </div>
            </div>
            
            {/* Hours */}
            <div>
              <label className="label text-teal">Hours per week</label>
              <div className="flex gap-2">
                {[40, 32, 24, 20].map(h => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setHours(h)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      hours === h 
                        ? 'bg-teal/20 text-teal-dark border border-teal/40' 
                        : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>
            
            {/* KiwiSaver */}
            <div className="flex items-center justify-between py-2">
              <div>
                <label className="label text-teal mb-0">KiwiSaver</label>
                <p className="text-xs text-gray-400">3.5% employer contribution</p>
              </div>
              <button
                type="button"
                onClick={() => setKiwiSaver(!kiwiSaver)}
                className={`w-12 h-7 rounded-full transition-colors ${
                  kiwiSaver ? 'bg-teal' : 'bg-gray-200'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-1 ${
                  kiwiSaver ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>
            
            {/* Allowances */}
            <div>
              <label className="label text-teal">Allowances</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input 
                  type="number" 
                  value={allowances}
                  onChange={(e) => setAllowances(Number(e.target.value))}
                  className="input pl-7"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Phone, travel, etc — per month</p>
            </div>
            
            {/* Margin */}
            <div>
              <label className="label text-teal">Margin</label>
              <div className="flex gap-2">
                {[5, 10].map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMarginPercent(m)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      marginPercent === m 
                        ? 'bg-teal/20 text-teal-dark border border-teal/40' 
                        : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {m}%
                  </button>
                ))}
              </div>
            </div>

            {/* Calculation breakdown */}
            <div className="bg-white rounded-xl p-4 mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Monthly salary</span>
                <span className="font-medium">${monthlySalary.toLocaleString()}</span>
              </div>
              {allowances > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Allowances</span>
                  <span className="font-medium">+${allowances.toLocaleString()}</span>
                </div>
              )}
              {kiwiSaver && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">KiwiSaver (3.5%)</span>
                  <span className="font-medium">+${kiwiSaverAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Margin ({marginPercent}%)</span>
                <span className="font-medium">+${marginAmount.toLocaleString()}</span>
              </div>
              <hr className="border-gray-100" />
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">Billable</span>
                <span className="text-lg font-semibold text-teal">${totalBillable.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-teal/20 px-8 py-5 bg-teal/5 flex justify-between items-center">
          <label className="flex items-center gap-3 cursor-pointer">
            <div 
              onClick={() => setSendWelcomeEmail(!sendWelcomeEmail)}
              className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors cursor-pointer ${
                sendWelcomeEmail 
                  ? 'bg-teal border-teal' 
                  : 'bg-white border-gray-300 hover:border-teal/50'
              }`}
            >
              {sendWelcomeEmail && (
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className="text-sm font-medium text-gray-700">Send welcome email</span>
          </label>

          <div className="flex items-center gap-3">
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading || !firstName || !lastName || !email}
              className="px-8 py-3 rounded-xl bg-gold text-gold-dark text-base font-semibold hover:bg-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving…' : 'Add person'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AvatarCircle({ firstName, lastName, tribe, size = 56 }) {
  const hasName = firstName || lastName;
  const initials = hasName 
    ? [firstName?.[0], lastName?.[0]].filter(Boolean).join('').toUpperCase()
    : 'NP';
  const config = TRIBE_COLORS[tribe] || { bg: '#888', text: '#fff' };
  
  return (
    <div 
      className="rounded-full flex items-center justify-center font-semibold flex-shrink-0 border-[3px]"
      style={{
        width: size,
        height: size,
        background: 'white',
        borderColor: config.bg,
        color: config.bg,
        fontSize: size * 0.325,
      }}
    >
      {initials}
    </div>
  );
}
