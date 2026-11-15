import React, { useState } from 'react';
import { UserRole } from '../../types/auth';
import { useAppStore } from '../../store/useAppStore';
import { Delete, KeyRound, AlertCircle, Sparkles } from 'lucide-react';
import { DEFAULT_PINS } from '../../utils/seedData';

interface PasscodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetRole?: UserRole;
}

export const PasscodeModal: React.FC<PasscodeModalProps> = ({
  isOpen,
  onClose,
  targetRole = 'SENIOR',
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(targetRole);
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const loginWithPasscode = useAppStore((state) => state.loginWithPasscode);

  if (!isOpen) return null;

  const pinLength = selectedRole === 'SENIOR' ? 4 : 6;

  const handleDigit = (digit: string) => {
    if (enteredPin.length < pinLength) {
      const nextPin = enteredPin + digit;
      setEnteredPin(nextPin);
      setErrorMsg(null);

      // Auto submit when full length reached
      if (nextPin.length === pinLength) {
        attemptLogin(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    setEnteredPin((prev) => prev.slice(0, -1));
    setErrorMsg(null);
  };

  const handleClear = () => {
    setEnteredPin('');
    setErrorMsg(null);
  };

  const attemptLogin = async (pinToTry: string) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const result = await loginWithPasscode(selectedRole, pinToTry);
      if (result.success) {
        setEnteredPin('');
        onClose();
      } else {
        setErrorMsg(result.error || 'Authentication failed. Please verify your PIN.');
        setEnteredPin('');
      }
    } catch {
      setErrorMsg('An unexpected error occurred during authentication.');
      setEnteredPin('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchRole = (newRole: UserRole) => {
    setSelectedRole(newRole);
    setEnteredPin('');
    setErrorMsg(null);
  };

  const autofillDemoPin = () => {
    const demoPin = DEFAULT_PINS[selectedRole];
    setEnteredPin(demoPin);
    attemptLogin(demoPin);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="passcode-modal-title"
    >
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-3xl shadow-2xl max-w-md w-full p-6 md:p-8 flex flex-col items-center">
        {/* Header Icon */}
        <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
          <KeyRound className="w-8 h-8" />
        </div>

        <h2
          id="passcode-modal-title"
          className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white text-center"
        >
          Profile Access
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base text-center mt-1 mb-6">
          Enter authorized PIN for secure healthcare profile access
        </p>

        {/* Role Selector Tabs */}
        <div className="flex gap-2 w-full p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-6">
          {(['SENIOR', 'CARETAKER', 'FAMILY'] as UserRole[]).map((role) => (
            <button
              key={role}
              onClick={() => switchRole(role)}
              className={`flex-1 py-3 px-2 rounded-xl font-bold text-xs md:text-sm transition-all min-h-[48px] ${
                selectedRole === role
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {role === 'SENIOR' ? 'Elderly (4-digit)' : role === 'CARETAKER' ? 'Caretaker (6-digit)' : 'Family (6-digit)'}
            </button>
          ))}
        </div>

        {/* PIN Dots Display */}
        <div className="flex gap-4 justify-center items-center my-4">
          {Array.from({ length: pinLength }).map((_, i) => (
            <div
              key={i}
              className={`w-5 h-5 rounded-full border-2 transition-all ${
                i < enteredPin.length
                  ? 'bg-blue-600 border-blue-600 scale-110 shadow-sm'
                  : 'bg-transparent border-slate-400 dark:border-slate-600'
              }`}
            />
          ))}
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="flex items-center gap-2 p-3 my-2 bg-red-50 dark:bg-red-950/50 border border-red-300 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm w-full">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Numpad Grid */}
        <div className="grid grid-cols-3 gap-3 w-full my-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
            <button
              key={digit}
              onClick={() => handleDigit(digit.toString())}
              disabled={isSubmitting}
              className="min-h-[58px] text-2xl font-bold rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700 transition-transform flex items-center justify-center focus:ring-4 focus:ring-blue-300 outline-none"
              aria-label={`Digit ${digit}`}
            >
              {digit}
            </button>
          ))}

          <button
            onClick={handleClear}
            disabled={isSubmitting || enteredPin.length === 0}
            className="min-h-[58px] text-sm font-bold rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 flex items-center justify-center focus:ring-4 focus:ring-blue-300 outline-none"
            aria-label="Clear all entered digits"
          >
            Clear
          </button>

          <button
            onClick={() => handleDigit('0')}
            disabled={isSubmitting}
            className="min-h-[58px] text-2xl font-bold rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700 transition-transform flex items-center justify-center focus:ring-4 focus:ring-blue-300 outline-none"
            aria-label="Digit 0"
          >
            0
          </button>

          <button
            onClick={handleBackspace}
            disabled={isSubmitting || enteredPin.length === 0}
            className="min-h-[58px] rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center focus:ring-4 focus:ring-blue-300 outline-none"
            aria-label="Backspace"
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>

        {/* Demo Fast Autofill Bar */}
        <div className="w-full flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500">
          <span>Demo PIN: <strong>{DEFAULT_PINS[selectedRole]}</strong></span>
          <button
            onClick={autofillDemoPin}
            className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold hover:underline min-h-[36px]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Autofill & Login
          </button>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="mt-4 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-sm font-semibold min-h-[44px]"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
