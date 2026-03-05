"use client";
import React from 'react';
import Link from 'next/link';
import { Zap, Github, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#020408] border-t border-zinc-900 py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        
        {/* Brand & Copyright */}
        <div className="flex flex-col items-center md:items-start gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <Zap size={20} className="text-[#00F5D4]" fill="#00F5D4" />
            <span className="font-['Syne'] font-bold uppercase italic tracking-tighter text-white text-lg">
              SmartReach AI
            </span>
          </Link>
          <p className="text-zinc-500 text-xs font-medium uppercase tracking-widest">
            © {currentYear} All rights reserved.
          </p>
        </div>

        {/* Links Navigation */}
        <div className="flex flex-wrap justify-center gap-8 text-[10px] font-bold uppercase tracking-[0.2em]">
          <Link href="/dashboard" className="text-zinc-400 hover:text-[#00F5D4] transition-colors">
            Dashboard
          </Link>
          <Link href="/privacy-and-policy" className="text-zinc-400 hover:text-[#00F5D4] transition-colors border-b border-[#00F5D4]/20 pb-1">
            Privacy & Policy
          </Link>
          <Link href="#" className="text-zinc-400 hover:text-[#00F5D4] transition-colors">
            Terms of Service
          </Link>
          <Link href="mailto:support@smartreach.ai" className="text-zinc-400 hover:text-[#00F5D4] transition-colors">
            Support
          </Link>
        </div>

        {/* Social Icons */}
        <div className="flex gap-5 text-zinc-500">
          <a href="#" className="hover:text-white transition-colors"><Twitter size={18} /></a>
          <a href="#" className="hover:text-white transition-colors"><Github size={18} /></a>
          <a href="#" className="hover:text-white transition-colors"><Linkedin size={18} /></a>
        </div>

      </div>
      
      {/* Decorative Blur */}
      <div className="mt-12 text-center">
        <div className="inline-block h-px w-24 bg-gradient-to-r from-transparent via-zinc-800 to-transparent"></div>
      </div>
    </footer>
  );
}