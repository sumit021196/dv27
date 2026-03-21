"use client";

import { useEffect, useState } from "react";

interface TickerProps {
  text?: string;
  speed?: number;
  className?: string;
}

export default function Ticker({ text, speed = 30, className = "" }: TickerProps) {
  const [tickerText, setTickerText] = useState(text);

  useEffect(() => {
    if (!text) {
      fetch('/api/settings')
        .then(res => res.json())
        .then(data => {
          if (data.settings?.ticker_text) {
            setTickerText(data.settings.ticker_text);
          }
        })
        .catch(err => console.error("Failed to load ticker text", err));
    }
  }, [text]);

  if (!tickerText) return null;

  // Split by bullet point or use as is
  const messages = tickerText.split('•').map(m => m.trim());

  return (
    <div className={`overflow-hidden bg-black py-2 border-y border-white/10 ${className}`}>
      <div className="flex animate-ticker whitespace-nowrap w-max">
        <div className="flex items-center gap-8 px-4">
          {messages.map((m, i) => (
            <span key={i} className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-white">
              {m}
              {i < messages.length - 1 && <span className="ml-8 text-brand-accent">•</span>}
            </span>
          ))}
          <span className="ml-8 text-brand-accent">•</span>
        </div>
        {/* Duplicate for seamless scrolling */}
        <div className="flex items-center gap-8 px-4">
          {messages.map((m, i) => (
            <span key={`dup-${i}`} className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-white">
              {m}
              {i < messages.length - 1 && <span className="ml-8 text-brand-accent">•</span>}
            </span>
          ))}
          <span className="ml-8 text-brand-accent">•</span>
        </div>
      </div>
    </div>
  );
}
