/**
 * Web Speech API Vocalization Engine for Elderly Accessibility.
 * Speaks medication instructions and alerts at a steady, senior-accessible 0.85x speed.
 */

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function stopSpeaking(): void {
  if (isSpeechSynthesisSupported()) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignored in non-browser envs
    }
  }
}

/**
 * Speaks an arbitrary text string using Web Speech API at 0.85x rate.
 */
export function speakText(text: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (!isSpeechSynthesisSupported()) {
      resolve(false);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85; // Elder-friendly steady cadence
      utterance.pitch = 1.0;
      utterance.lang = 'en-US';

      utterance.onend = () => resolve(true);
      utterance.onerror = () => resolve(false);

      window.speechSynthesis.speak(utterance);
    } catch {
      resolve(false);
    }
  });
}

/**
 * Vocalizes upcoming medication dose with clear elderly guidance.
 */
export function vocalizeDose(
  patientName: string,
  medName: string,
  dosage: string,
  scheduledTime: string,
  instructions?: string
): Promise<boolean> {
  const message = `Hello ${patientName}. At ${scheduledTime}, it is time to take ${medName}, ${dosage}. ${
    instructions ? instructions : 'Please take with a full glass of water.'
  }`;
  return speakText(message);
}

/**
 * Vocalizes positive reinforcement upon taking medication.
 */
export function vocalizeConfirmation(medName: string, streak: number): Promise<boolean> {
  const message = `Great job! ${medName} marked as taken. Your current healthy streak is ${streak} days!`;
  return speakText(message);
}

/**
 * Vocalizes an upcoming doctor appointment.
 */
export function vocalizeAppointment(
  doctorName: string,
  timeString: string,
  clinic: string
): Promise<boolean> {
  const message = `You have an appointment with Doctor ${doctorName} at ${timeString}, located at ${clinic}.`;
  return speakText(message);
}
