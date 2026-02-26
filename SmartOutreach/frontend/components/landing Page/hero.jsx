import React from 'react';
import { ArrowRight } from 'lucide-react';

const StatItem = ({ value, label }) => (
  <div className="flex flex-col items-center md:items-start">
    <span className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-[#00F5D4] to-[#00A8FF] mb-2">
      {value}
    </span>
    <span className="text-zinc-500 uppercase tracking-widest text-xs font-bold font-sans">
      {label}
    </span>
  </div>
);

export const Hero = () => (
  <section className="min-h-screen bg-[#020408] text-white flex flex-col items-center justify-center px-6 py-20 font-['Syne',sans-serif]">
    <div className="max-w-5xl text-center mb-12">
      <h1 className="text-5xl md:text-8xl font-extrabold leading-[1.1] tracking-tight uppercase italic">
        Sales email <br />
        that sounds <br />
        <span className="text-[#00F5D4]">human.</span> <br />
        Written by AI.
      </h1>
    </div>

    <p className="max-w-2xl text-center text-zinc-400 text-lg md:text-xl mb-12 leading-relaxed font-sans">
      SmartReach AI analyzes public company data and generates 
      highly personalized outreach messages — automatically, in seconds.
    </p>

    <div className="flex flex-col sm:flex-row gap-4 mb-24">
      <button className="relative group overflow-hidden px-8 py-4 rounded-xl bg-gradient-to-r from-[#00F5D4] to-[#00A8FF] text-black font-bold flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(0,245,212,0.3)]">
        Request Early Access <ArrowRight size={20} />
      </button>
      <button className="px-8 py-4 rounded-xl border border-zinc-800 bg-zinc-900/30 text-white font-semibold hover:bg-zinc-800 transition-colors">
        View Features
      </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-32 border-t border-zinc-900 pt-16 w-full max-w-5xl">
      <StatItem value="3X" label="Higher Reply Rate" />
      <StatItem value="<30s" label="Email Generation" />
      <StatItem value="100%" label="Personalized" />
    </div>
  </section>
);