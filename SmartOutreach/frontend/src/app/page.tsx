"use client";

import { Navbar } from '../../components/landing Page/navbar';
import { Hero } from '../../components/landing Page/hero';
import { Features } from '../../components/landing Page/features';
import { Architecture } from '../../components/landing Page/arhitecture';
import { Zap } from 'lucide-react';

export default function SmartReachLanding() {
  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 selection:bg-blue-500/30 antialiased font-sans">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Architecture />
      </main>

      <footer className="py-20 px-8 border-t border-zinc-900">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Zap size={16} fill="white" className="text-white" />
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-white">SmartReach</span>
            </div>
            <p className="text-zinc-600 text-xs max-w-xs leading-relaxed uppercase tracking-widest">
              Engineered for precision B2B growth. Powered by Gemini 1.5 Pro.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-16 text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-500">
            <div className="flex flex-col gap-3">
              <span className="text-zinc-300 underline underline-offset-4 decoration-zinc-800">Product</span>
              <a href="#" className="hover:text-white transition-colors">Pricing</a>
              <a href="#" className="hover:text-white transition-colors">API Docs</a>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-zinc-300 underline underline-offset-4 decoration-zinc-800">Legal</span>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Security</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}