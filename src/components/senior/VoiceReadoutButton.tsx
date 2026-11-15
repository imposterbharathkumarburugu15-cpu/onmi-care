import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { speakText, stopSpeaking } from '../../services/speechService';

interface VoiceReadoutButtonProps {
  textToSpeak: string;
  label?: string;
  size?: 'normal' | 'senior';
  className?: string;
}

export const VoiceReadoutButton: React.FC<VoiceReadoutButtonProps> = ({
  textToSpeak,
  label = 'Read Aloud',
  size = 'normal',
  className = '',
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    await speakText(textToSpeak);
    setIsSpeaking(false);
  };

  const isSenior = size === 'senior';

  return (
    <button
      onClick={handleSpeak}
      className={`inline-flex items-center gap-2 rounded-2xl font-bold transition-all shadow-sm ${
        isSenior
          ? 'px-5 py-3 text-lg bg-sky-100 hover:bg-sky-200 text-sky-950 border-2 border-sky-400 min-h-[56px]'
          : 'px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 min-h-[44px]'
      } ${isSpeaking ? 'ring-4 ring-sky-300 animate-pulse bg-sky-200' : ''} ${className}`}
      aria-label={`Voice readout: ${textToSpeak}`}
      title="Hear text spoken aloud at senior-accessible pace"
    >
      {isSpeaking ? (
        <>
          <VolumeX className={isSenior ? 'w-6 h-6 text-sky-900' : 'w-4 h-4 text-sky-600'} />
          <span>Stop Audio</span>
        </>
      ) : (
        <>
          <Volume2 className={isSenior ? 'w-6 h-6 text-sky-900' : 'w-4 h-4 text-sky-600'} />
          <span>{label}</span>
        </>
      )}
    </button>
  );
};
