import React, { useEffect, useState } from 'react';
import { RotateCcw, X } from 'lucide-react';

interface ToastProps {
  message: string;
  durationSeconds?: number;
  onUndo?: () => void;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  durationSeconds = 10,
  onUndo,
  onClose,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(durationSeconds);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onClose();
      return;
    }
    const timer = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft, onClose]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl border-2 border-slate-700 max-w-lg w-[90%] md:w-auto animate-bounce-in"
    >
      <div className="flex-1 text-base md:text-lg font-medium">
        {message}
      </div>

      {onUndo && (
        <button
          onClick={() => {
            onUndo();
            onClose();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-base transition-colors min-h-[44px]"
          aria-label="Undo last action"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Undo ({secondsLeft}s)</span>
        </button>
      )}

      <button
        onClick={onClose}
        className="p-2 text-slate-400 hover:text-white rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
        aria-label="Close notification"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};
