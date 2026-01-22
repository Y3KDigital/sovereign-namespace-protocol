export type ConfidenceLevel = 'none' | 'client_session' | 'biometric_verified' | 'cryptographic_signature';

export interface HistoryEvent {
  id: string;
  timestamp: string;
  action: string;
  actor: string; // 'user' | 'system' | specific Identity
  details: Record<string, any>;
  confidence: ConfidenceLevel;
  hash?: string; // Optional cryptographic binding
}

export const emitHistory = (
  action: string, 
  details: Record<string, any>, 
  confidence: ConfidenceLevel = 'client_session',
  actor: string = 'user'
): HistoryEvent => {
  if (typeof window === 'undefined') {
    // Server-side stub or integration
    return {
        id: 'server-gen',
        timestamp: new Date().toISOString(),
        action,
        details,
        confidence,
        actor
    };
  }

  const event: HistoryEvent = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    action,
    details,
    confidence,
    actor
  };

  // Persist to LocalStorage for V1 (Client-Side)
  try {
    const existing = JSON.parse(localStorage.getItem('claim_history') || '[]');
    const updated = [...existing, event];
    localStorage.setItem('claim_history', JSON.stringify(updated));
    
    // Dispatch event so UI updates immediately
    window.dispatchEvent(new Event('history-updated'));
  } catch (e) {
    console.warn("History storage failed", e);
  }
  
  return event;
};

export const getHistory = (): HistoryEvent[] => {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem('claim_history') || '[]');
  } catch {
    return [];
  }
};

export const clearHistory = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('claim_history'); 
        window.dispatchEvent(new Event('history-updated'));
    }
}
