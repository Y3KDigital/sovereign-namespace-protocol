"use client";

import { useEffect, useState } from "react";

export function LiveCounter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Simulate counting (in production, fetch from API)
    const interval = setInterval(() => {
      setCount(prev => prev + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-12 px-4 bg-gradient-to-r from-purple-900/10 to-blue-900/10 border-y border-white/5">
      <div className="max-w-7xl mx-auto text-center">
        <div className="text-sm text-gray-400 mb-2">LIVE NAMESPACE COUNT</div>
        <div className="text-5xl md:text-6xl font-bold gradient-text animate-pulse-slow">
          {count.toLocaleString()}
        </div>
        <div className="text-sm text-gray-400 mt-2">
          Cryptographically unique namespaces generated
        </div>
      </div>
    </section>
  );
}
