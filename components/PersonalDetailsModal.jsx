'use client';

import { useState } from 'react';

/**
 * PersonalDetailsModal - Employee self-service form for updating personal info
 * Sends data to Airtable and emails Angela
 */
export default function PersonalDetailsModal({ person, isOpen, onClose, onSave }) {
  const [firstName, setFirstName] = useState(person?.firstName || person?.name?.split(' ')[0] || '');
  const [lastName, setLastName] = useState(person?.lastName || person?.name?.split(' ').slice(1).join(' ') || '');
  const [email, setEmail] = useState(person?.email || '');
  const [address, setAddress] = useState(person?.address || '');
  const [dateOfBirth, setDateOfBirth] = useState(person?.dateOfBirth || '');
  const [mobile, setMobile] = useState(person?.mobile || '');
  const [bankAccount, setBankAccount] = useState(person?.bankAccount || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const updatedData = {
      firstName,
      lastName,
      email,
      address,
      dateOfBirth,
      mobile,
      bankAccount,
    };

    try {
      const res = await fetch('/api/team/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      
      if (!res.ok) {
        throw new Error('Failed to save');
      }

      const updated = await res.json();
      onSave?.({ ...person, ...updated, personalDetailsComplete: true });
      onClose();
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-[520px] max-h-[90vh] overflow-auto shadow-2xl"
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-0 flex justify-between items-start">
          <h2 className="font-heading text-[28px] font-semibold text-gray-900">
            Your details
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 pt-6 space-y-5">
          {/* Name */}
          <div>
            <label className="label text-teal">Your name</label>
            <p className="text-sm text-gray-400 mb-2 text-right">First and last name</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  required
                  className="input"
                />
                <p className="text-xs text-gray-400 mt-1">required</p>
              </div>
              <div>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  required
                  className="input"
                />
                <p className="text-xs text-gray-400 mt-1">required</p>
              </div>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="label text-teal">
              Your email <span className="font-normal normal-case text-gray-400">(required)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              required
              className="input"
            />
            <p className="text-sm text-gray-400 mt-1 text-right">This is where we'll send your payslip</p>
          </div>

          {/* Address */}
          <div>
            <label className="label text-teal">
              Your home address <span className="font-normal normal-case text-gray-400">(required)</span>
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Street Name, Suburb, City"
              required
              className="input"
            />
            <p className="text-sm text-gray-400 mt-1 text-right">We need this for tax reasons</p>
          </div>

          {/* Date of Birth */}
          <div>
            <label className="label text-teal">Your date of birth</label>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="input"
            />
            <p className="text-sm text-gray-400 mt-1 text-right">Also for tax reasons</p>
          </div>

          {/* Mobile */}
          <div>
            <label className="label text-teal">Your mobile number</label>
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="021 123 4567"
              className="input"
            />
            <p className="text-sm text-gray-400 mt-1 text-right">In case we have any questions</p>
          </div>

          {/* Bank Account */}
          <div>
            <label className="label text-teal">Your bank acct number</label>
            <input
              type="text"
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
              placeholder="00-0000-0000000-00"
              className="input"
            />
          </div>

          {/* Footer */}
          <div className="border-t border-teal/20 -mx-8 px-8 py-5 mt-8 bg-teal/5 flex justify-between items-center">
            {error && <p className="text-sm text-red-500">{error}</p>}
            {!error && <div />}
            
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                type="button"
                className="px-6 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !firstName || !lastName || !email || !address}
                className="px-8 py-3 rounded-xl bg-gold text-gold-dark text-base font-semibold hover:bg-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending…' : 'Save'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
