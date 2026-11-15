/**
 * Vitest environment setup and browser API mocks for happy-dom.
 */

// Polyfill SpeechSynthesis if not present in test runner
if (typeof window !== 'undefined' && !('speechSynthesis' in window)) {
  const mockSpeech = {
    speak: (utterance: { onend?: () => void }) => {
      setTimeout(() => {
        if (utterance.onend) utterance.onend();
      }, 5);
    },
    cancel: () => {},
  };
  Object.defineProperty(window, 'speechSynthesis', {
    value: mockSpeech,
    writable: true,
  });

  (globalThis as unknown as { SpeechSynthesisUtterance: unknown }).SpeechSynthesisUtterance = class {
    text: string;
    rate: number = 0.85;
    pitch: number = 1;
    lang: string = 'en-US';
    onend: (() => void) | null = null;
    onerror: (() => void) | null = null;
    constructor(text: string) {
      this.text = text;
    }
  };
}

// Polyfill Web Audio API AudioContext if not present
if (typeof window !== 'undefined' && !('AudioContext' in window)) {
  class MockAudioContext {
    currentTime: number = 0;
    state: string = 'running';
    createOscillator() {
      return {
        type: 'sine',
        frequency: {
          setValueAtTime: () => {},
          exponentialRampToValueAtTime: () => {},
          linearRampToValueAtTime: () => {},
        },
        connect: () => {},
        start: () => {},
        stop: () => {},
      };
    }
    createGain() {
      return {
        gain: {
          setValueAtTime: () => {},
          exponentialRampToValueAtTime: () => {},
        },
        connect: () => {},
      };
    }
    destination = {};
    resume() {
      return Promise.resolve();
    }
  }

  Object.defineProperty(window, 'AudioContext', {
    value: MockAudioContext,
    writable: true,
  });
}
