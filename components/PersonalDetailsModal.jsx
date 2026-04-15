'use client';

import { useState, useEffect } from 'react';

/**
 * Format bank account as XX-XXXX-XXXXXXX-XX
 */
function formatBankAccount(value) {
  const digits = value.replace(/\D/g, '');
  let formatted = '';
  if (digits.length > 0) formatted += digits.slice(0, 2);
  if (digits.length > 2) formatted += '-' + digits.slice(2, 6);
  if (digits.length > 6) formatted += '-' + digits.slice(6, 13);
  if (digits.length > 13) formatted += '-' + digits.slice(13, 15);
  return formatted;
}

/**
 * Validate NZ bank account format
 */
function isValidBankAccount(value) {
  if (!value) return true;
  const pattern = /^\d{2}-\d{4}-\d{7}-\d{2}$/;
  return pattern.test(value);
}

/**
 * PersonalDetailsModal - Employee self-service form for updating personal info
 * Sends data to Airtable and emails Angela (with bank account)
 */
export default function PersonalDetailsModal({ person, isOpen, onClose, onSave }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [suburbCity, setSuburbCity] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [mobile, setMobile] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset form when person changes or modal opens
  useEffect(() => {
    if (person && isOpen) {
      setFirstName(person.firstName || person.name?.split(' ')[0] || '');
      setLastName(person.lastName || person.name?.split(' ').slice(1).join(' ') || '');
      setEmail(person.email || '');
      setStreetAddress(person.streetAddress || person.address?.split(',')[0]?.trim() || '');
      setSuburbCity(person.suburbCity || person.address?.split(',').slice(1).join(',').trim() || '');
      setDateOfBirth(person.dateOfBirth || '');
      setMobile(person.mobile || '');
      setBankAccount(''); // Never pre-pop for security
      setError('');
    }
  }, [person?.id, isOpen]);

  if (!isOpen) return null;

  const handleBankAccountChange = (e) => {
    const formatted = formatBankAccount(e.target.value);
    setBankAccount(formatted);
  };

  // Input wrapper with straight gold left border when empty and required
  const InputWrapper = ({ children, value, required = true }) => {
    const showBorder = required && !value;
    return (
      <div className="relative">
        {showBorder && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gold rounded-l-xl" />
        )}
        {children}
      </div>
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (bankAccount && !isValidBankAccount(bankAccount)) {
      setError('Please enter a valid bank account number');
      return;
    }
    
    setLoading(true);
    setError('');

    const updatedData = {
      firstName,
      lastName,
      email,
      address: [streetAddress, suburbCity].filter(Boolean).join(', '),
      dateOfBirth,
      mobile,
      bankAccount, // Sent to API but NOT stored — only emailed to Angela
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
        className="bg-white rounded-2xl w-full max-w-[520px] max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
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

        {/* Form - scrollable */}
        <div className="overflow-auto flex-1 p-8 pt-6 space-y-5">
          {/* Name */}
          <div>
            <label className="label text-teal">Your name</label>
            <div className="grid grid-cols-2 gap-3">
              <InputWrapper value={firstName}>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  required
                  className="input"
                />
              </InputWrapper>
              <InputWrapper value={lastName}>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  required
                  className="input"
                />
              </InputWrapper>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="label text-teal">Your email</label>
            <InputWrapper value={email}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                required
                className="input"
              />
            </InputWrapper>
            <p className="text-sm text-gray-400 mt-1 text-right">This is where we'll send your payslip</p>
          </div>

          {/* Address - Two fields */}
          <div>
            <label className="label text-teal">Your home address</label>
            <div className="space-y-3">
              <InputWrapper value={streetAddress}>
                <input
                  type="text"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="Street address"
                  required
                  className="input"
                />
              </InputWrapper>
              <InputWrapper value={suburbCity}>
                <input
                  type="text"
                  value={suburbCity}
                  onChange={(e) => setSuburbCity(e.target.value)}
                  placeholder="Suburb, City"
                  required
                  className="input"
                />
              </InputWrapper>
            </div>
            <p className="text-sm text-gray-400 mt-1 text-right">We need this for tax reasons</p>
          </div>

          {/* Date of Birth */}
          <div>
            <label className="label text-teal">Your date of birth</label>
            <InputWrapper value={dateOfBirth}>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                required
                className="input"
              />
            </InputWrapper>
            <p className="text-sm text-gray-400 mt-1 text-right">Also for tax reasons</p>
          </div>

          {/* Mobile */}
          <div>
            <label className="label text-teal">Your mobile number</label>
            <InputWrapper value={mobile}>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="021 123 4567"
                required
                className="input"
              />
            </InputWrapper>
            <p className="text-sm text-gray-400 mt-1 text-right">In case we have any questions</p>
          </div>

          {/* Bank Account */}
          <div>
            <label className="label text-teal">Your bank account number</label>
            <InputWrapper value={bankAccount}>
              <input
                type="text"
                value={bankAccount}
                onChange={handleBankAccountChange}
                placeholder="00-0000-0000000-00"
                maxLength={18}
                required
                className={`input ${bankAccount && !isValidBankAccount(bankAccount) ? 'border-red-300 focus:border-red-500' : ''}`}
              />
            </InputWrapper>
            <p className="text-sm text-gray-400 mt-1 text-right">To pay your salary</p>
          </div>
        </div>

        {/* Footer - outside scrollable area */}
        <div className="border-t border-teal/20 px-8 py-5 bg-teal/5 flex justify-between items-center rounded-b-2xl">
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
              onClick={handleSubmit}
              disabled={loading || !firstName || !lastName || !email || !streetAddress || !suburbCity || !dateOfBirth || !mobile || !bankAccount || !isValidBankAccount(bankAccount)}
              className="px-8 py-3 rounded-xl bg-gold text-gold-dark text-base font-semibold hover:bg-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending…' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
