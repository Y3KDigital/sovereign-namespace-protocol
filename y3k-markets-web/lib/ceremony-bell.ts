// Ceremony Bell - Plays when someone claims
export function playBell() {
  if (typeof window !== 'undefined') {
    const audio = document.getElementById('bell-sound') as HTMLAudioElement;
    if (audio) {
      audio.volume = 0.5;
      audio.play().catch(e => console.log('Audio play prevented:', e));
    }
  }
}

// Show notification toast
export function showClaimNotification(namespace: string) {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      new Notification('🔔 New Claim!', {
        body: `${namespace} was just claimed`,
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      });
    }
  }
}

// Request notification permission
export function requestNotifications() {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    Notification.requestPermission();
  }
}
