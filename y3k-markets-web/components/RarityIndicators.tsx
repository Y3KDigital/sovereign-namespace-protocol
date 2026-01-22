'use client';

import { useEffect, useState } from 'react';

interface RarityBadgeProps {
  tier: string;
  remaining: number;
  total: number;
}

export function RarityBadge({ tier, remaining, total }: RarityBadgeProps) {
  const percentage = (remaining / total) * 100;
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (percentage < 10) {
      const interval = setInterval(() => setPulse(p => !p), 1000);
      return () => clearInterval(interval);
    }
  }, [percentage]);

  const getColor = () => {
    if (remaining === 0) return 'bg-red-500';
    if (percentage < 10) return 'bg-red-500 animate-pulse';
    if (percentage < 30) return 'bg-orange-500';
    if (percentage < 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getLabel = () => {
    if (remaining === 0) return 'SOLD OUT';
    if (percentage < 5) return 'ALMOST GONE';
    if (percentage < 20) return 'LIMITED';
    return 'AVAILABLE';
  };

  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${pulse ? 'border-red-500 animate-pulse' : 'border-slate-600'}`}>
      <div className={`w-2 h-2 rounded-full ${getColor()}`} />
      <span className="text-sm font-semibold text-white">{getLabel()}</span>
      <span className="text-xs text-slate-400">{remaining}/{total}</span>
    </div>
  );
}

export function LiveCounter({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    if (displayValue !== value) {
      const duration = 1000;
      const steps = 30;
      const stepValue = (value - displayValue) / steps;
      let currentStep = 0;

      const interval = setInterval(() => {
        currentStep++;
        if (currentStep >= steps) {
          setDisplayValue(value);
          clearInterval(interval);
        } else {
          setDisplayValue(prev => prev + stepValue);
        }
      }, duration / steps);

      return () => clearInterval(interval);
    }
  }, [value, displayValue]);

  return (
    <span className="font-mono text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
      {Math.floor(displayValue)}
    </span>
  );
}
