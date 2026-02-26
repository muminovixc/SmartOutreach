"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, Github, ShieldCheck } from 'lucide-react';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#020408] text-white flex flex-col justify-center items-center px-6 py-20 font-sans">
      
      {/* Logo / Back to Home */}
      <Link href="/" className="absolute top-12 left-12 flex items-center gap-2 group">
        <div className="bg-zinc-900 p-2 rounded border border-zinc-800 group-hover:border-[#00F5D4] transition-colors">
          <Zap size={18} className="text-white" fill="white" />
        </div>
        <span className="font-['Syne'] font-bold uppercase tracking-tighter text-sm italic">SmartReach AI</span>
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[450px]"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-['Syne'] text-4xl md:text-5xl font-extrabold uppercase italic leading-[0.9] mb-4">
            Start <br /> Scaling.
          </h1>
          <p className="text-zinc-500 text-sm">
            Create your account and start generating personalized outreach.
          </p>
        </div>

        {/* Register Form */}
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2 ml-1">
                Full Name
              </label>
              <input 
                type="text" 
                placeholder="John Doe"
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00F5D4] transition-colors placeholder:text-zinc-700 font-medium"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2 ml-1">
                Company Name
              </label>
              <input 
                type="text" 
                placeholder="TechFlow Inc."
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00F5D4] transition-colors placeholder:text-zinc-700 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2 ml-1">
              Work Email
            </label>
            <input 
              type="email" 
              placeholder="john@company.com"
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00F5D4] transition-colors placeholder:text-zinc-700 font-medium"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2 ml-1">
              Password
            </label>
            <input 
              type="password" 
              placeholder="Min. 8 characters"
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00F5D4] transition-colors placeholder:text-zinc-700 font-medium"
            />
          </div>

          <div className="flex items-start gap-3 py-2 px-1">
             <ShieldCheck size={16} className="text-[#00F5D4] mt-0.5" />
             <p className="text-[10px] text-zinc-500 leading-relaxed uppercase tracking-tighter">
                By signing up, you agree to our <span className="text-zinc-300 underline cursor-pointer">Terms</span> and our data processing <span className="text-zinc-300 underline cursor-pointer">Security Protocol</span>.
             </p>
          </div>

          <button className="w-full mt-4 py-4 rounded-xl bg-gradient-to-r from-[#00F5D4] to-[#00A8FF] text-black font-bold uppercase font-['Syne'] text-sm shadow-[0_0_25px_rgba(0,245,212,0.25)] hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
            Create Account <ArrowRight size={18} />
          </button>
        </form>

        {/* Social Register */}
        <div className="relative my-8 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-900"></div>
          </div>
          <span className="relative px-4 bg-[#020408] text-[10px] font-bold uppercase tracking-widest text-zinc-600">
            Rapid Setup
          </span>
        </div>

        <button className="w-full py-3 rounded-xl border border-zinc-800 bg-zinc-900/20 text-white font-semibold text-sm hover:bg-zinc-800 transition-colors flex items-center justify-center gap-3">
          <Github size={18} /> Sign up with GitHub
        </button>

        {/* Footer Link */}
        <p className="mt-8 text-center text-zinc-500 text-xs uppercase tracking-tighter">
          Already a member? {' '}
          <Link href="/login" className="text-white font-bold hover:text-[#00F5D4] transition-colors">
            Login here
          </Link>
        </p>
      </motion.div>

      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/5 blur-[120px] -z-10 rounded-full" />
    </div>
  );
}