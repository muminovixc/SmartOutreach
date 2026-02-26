"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, Github } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Spremi token u localStorage (ili bolje u Cookies)
        localStorage.setItem('token', data.access_token);
        router.push('/dashboard'); // Prebaci ga na dashboard
      } else {
        setError(data.detail || 'Login failed');
      }
    } catch (err) {
      setError('Mrežna greška. Provjeri backend.');
    }
  };

  return (
    <div className="min-h-screen bg-[#020408] text-white flex flex-col justify-center items-center px-6 font-sans">
      <Link href="/" className="absolute top-12 left-12 flex items-center gap-2 group">
        <div className="bg-zinc-900 p-2 rounded border border-zinc-800 group-hover:border-[#00F5D4] transition-colors">
          <Zap size={18} className="text-white" fill="white" />
        </div>
        <span className="font-['Syne'] font-bold uppercase tracking-tighter text-sm italic">SmartReach AI</span>
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[400px]">
        <div className="text-center mb-10">
          <h1 className="font-['Syne'] text-4xl font-extrabold uppercase italic leading-none mb-4">Welcome <br /> Back.</h1>
          <p className="text-zinc-500 text-sm">Enter your credentials to access your dashboard.</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && <p className="text-red-500 text-xs text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20">{error}</p>}
          
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2 ml-1">Email Address</label>
            <input 
              type="email" 
              required
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="name@company.com"
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00F5D4] transition-colors placeholder:text-zinc-700"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2 ml-1">Password</label>
            <input 
              type="password" 
              required
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder="••••••••"
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00F5D4] transition-colors placeholder:text-zinc-700"
            />
          </div>

          <button type="submit" className="w-full mt-6 py-4 rounded-xl bg-gradient-to-r from-[#00F5D4] to-[#00A8FF] text-black font-bold uppercase font-['Syne'] text-sm shadow-[0_0_20px_rgba(0,245,212,0.2)] hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
            Sign In <ArrowRight size={18} />
          </button>
        </form>

        <div className="relative my-8 text-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-900"></div></div>
          <span className="relative px-4 bg-[#020408] text-[10px] font-bold uppercase tracking-widest text-zinc-600">Or continue with</span>
        </div>

        <button className="w-full py-3 rounded-xl border border-zinc-800 bg-zinc-900/20 text-white font-semibold text-sm hover:bg-zinc-800 transition-colors flex items-center justify-center gap-3">
          <Github size={18} /> GitHub
        </button>

        <p className="mt-8 text-center text-zinc-500 text-xs uppercase tracking-tighter">
          Don't have an account? {' '}
          <Link href="/register" className="text-white font-bold hover:text-[#00F5D4] transition-colors">
            Sign up for free
          </Link>
        </p>
      </motion.div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-blue-600/10 blur-[100px] -z-10 rounded-full" />
    </div>
  );
}