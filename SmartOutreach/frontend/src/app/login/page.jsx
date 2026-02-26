"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, Github } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#020408] text-white flex flex-col justify-center items-center px-6 font-sans">
      
      {/* Logo / Back to Home */}
      <Link href="/" className="absolute top-12 left-12 flex items-center gap-2 group">
        <div className="bg-zinc-900 p-2 rounded border border-zinc-800 group-hover:border-blue-500 transition-colors">
          <Zap size={18} className="text-white" fill="white" />
        </div>
        <span className="font-['Syne'] font-bold uppercase tracking-tighter text-sm">SmartReach AI</span>
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[400px]"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-['Syne'] text-4xl font-extrabold uppercase italic leading-none mb-4">
            Welcome <br /> Back.
          </h1>
          <p className="text-zinc-500 text-sm">
            Enter your credentials to access your dashboard.
          </p>
        </div>

        {/* Login Form */}
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2 ml-1">
              Email Address
            </label>
            <input 
              type="email" 
              placeholder="name@company.com"
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder:text-zinc-700"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2 ml-1">
              Password
            </label>
            <input 
              type="password" 
              placeholder="••••••••"
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder:text-zinc-700"
            />
          </div>

          <button className="w-full mt-6 py-4 rounded-xl bg-gradient-to-r from-[#00F5D4] to-[#00A8FF] text-black font-bold uppercase font-['Syne'] text-sm shadow-[0_0_20px_rgba(0,245,212,0.2)] hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
            Sign In <ArrowRight size={18} />
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-8 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-900"></div>
          </div>
          <span className="relative px-4 bg-[#020408] text-[10px] font-bold uppercase tracking-widest text-zinc-600">
            Or continue with
          </span>
        </div>

        {/* Social Login */}
        <button className="w-full py-3 rounded-xl border border-zinc-800 bg-zinc-900/20 text-white font-semibold text-sm hover:bg-zinc-800 transition-colors flex items-center justify-center gap-3">
          <Github size={18} /> GitHub
        </button>

        {/* Footer Link */}
        <p className="mt-8 text-center text-zinc-500 text-xs">
          Don't have an account? {' '}
          <Link href="/register" className="text-white font-bold hover:text-[#00F5D4] transition-colors">
            Sign up for free
          </Link>
        </p>
      </motion.div>

      {/* Background Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-blue-600/10 blur-[100px] -z-10 rounded-full" />
    </div>
  );
}