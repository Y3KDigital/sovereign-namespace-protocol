'use client';

import { useEffect, useState } from 'react';

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

export function GenesisCountdown() {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false,
  });

  useEffect(() => {
    const genesisDate = new Date('2026-01-16T23:00:00Z');

    const updateCountdown = () => {
      const now = new Date();
      const diff = genesisDate.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          expired: true,
        });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining({ days, hours, minutes, seconds, expired: false });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  if (timeRemaining.expired) {
    return (
      <div className="text-center">
        <div className="text-2xl md:text-3xl font-bold text-green-400 mb-4">
          Genesis Ceremony In Progress
        </div>
        <div className="text-gray-400">
          The canonical genesis ceremony is currently being executed.
        </div>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="text-sm md:text-base text-gray-400 mb-4">
        Genesis execution begins in:
      </div>
      <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto">
        <div className="p-4 md:p-6 rounded-xl bg-white/5 border border-white/10">
          <div className="text-3xl md:text-5xl font-bold gradient-text mb-2">
            {String(timeRemaining.days).padStart(2, '0')}
          </div>
          <div className="text-xs md:text-sm text-gray-400">Days</div>
        </div>
        <div className="p-4 md:p-6 rounded-xl bg-white/5 border border-white/10">
          <div className="text-3xl md:text-5xl font-bold gradient-text mb-2">
            {String(timeRemaining.hours).padStart(2, '0')}
          </div>
          <div className="text-xs md:text-sm text-gray-400">Hours</div>
        </div>
        <div className="p-4 md:p-6 rounded-xl bg-white/5 border border-white/10">
          <div className="text-3xl md:text-5xl font-bold gradient-text mb-2">
            {String(timeRemaining.minutes).padStart(2, '0')}
          </div>
          <div className="text-xs md:text-sm text-gray-400">Minutes</div>
        </div>
        <div className="p-4 md:p-6 rounded-xl bg-white/5 border border-white/10">
          <div className="text-3xl md:text-5xl font-bold gradient-text mb-2">
            {String(timeRemaining.seconds).padStart(2, '0')}
          </div>
          <div className="text-xs md:text-sm text-gray-400">Seconds</div>
        </div>
      </div>
      <div className="mt-6 text-sm text-gray-500">
        January 16, 2026 • 20:00:00 UTC (3:00 PM EST)
      </div>
    </div>
  );
}
