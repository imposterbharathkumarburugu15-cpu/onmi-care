import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { UserRole } from '../../types/auth';
import { Users, Shield, HeartHandshake, Lock } from 'lucide-react';
import { PasscodeModal } from './PasscodeModal';

export const RoleSwitcher: React.FC = () => {
  const activeRole = useAppStore((state) => state.activeRole);
  const [modalRole, setModalRole] = useState<UserRole | null>(null);

  const rolesConfig: { role: UserRole; label: string; icon: React.ReactNode; color: string }[] = [
    {
      role: 'SENIOR',
      label: 'Senior (Eleanor)',
      icon: <Users className="w-4 h-4" />,
      color: 'bg-emerald-600 text-white',
    },
    {
      role: 'CARETAKER',
      label: 'Caretaker (Nurse)',
      icon: <Shield className="w-4 h-4" />,
      color: 'bg-blue-600 text-white',
    },
    {
      role: 'FAMILY',
      label: 'Family Member',
      icon: <HeartHandshake className="w-4 h-4" />,
      color: 'bg-purple-600 text-white',
    },
  ];

  return (
    <>
      <div className="flex items-center gap-1.5 p-1 bg-slate-200 dark:bg-slate-800 rounded-2xl">
        {rolesConfig.map((item) => (
          <button
            key={item.role}
            onClick={() => {
              if (item.role !== activeRole) {
                setModalRole(item.role);
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs md:text-sm font-bold transition-all min-h-[44px] ${
              activeRole === item.role
                ? item.color + ' shadow-md'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
            }`}
            title={`Switch to ${item.label}`}
          >
            {item.icon}
            <span className="hidden sm:inline">{item.label}</span>
            {activeRole !== item.role && <Lock className="w-3 h-3 opacity-60 ml-0.5" />}
          </button>
        ))}
      </div>

      {modalRole && (
        <PasscodeModal
          isOpen={true}
          onClose={() => setModalRole(null)}
          targetRole={modalRole}
        />
      )}
    </>
  );
};
