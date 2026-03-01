"use client";
import React from 'react';
import Sidebar from '../../../components/sidebar';
import { motion } from 'framer-motion';
import { 
  Users, 
  Send, 
  Target, 
  TrendingUp, 
  ArrowUpRight,
  Zap
} from 'lucide-react';

export default function DashboardOverview() {
  // Statistički podaci (kasnije ćemo ih vući iz baze)
  const stats = [
    { label: "Total Leads", value: "1,284", icon: Users, color: "text-[#00F5D4]", trend: "+12%" },
    { label: "Emails Sent", value: "852", icon: Send, color: "text-blue-400", trend: "+5.4%" },
    { label: "Conversion", value: "3.2%", icon: Target, color: "text-purple-400", trend: "+1.2%" },
  ];

  return (
    <div className="flex min-h-screen bg-[#020408] text-white">
      <Sidebar />

      <main className="flex-1 p-6 md:p-10 pt-24 lg:pt-10 overflow-y-auto">
        {/* HEADER */}
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="font-['Syne'] text-4xl md:text-5xl font-black uppercase italic tracking-tighter">
              System <span className="text-[#00F5D4]">Overview</span>
            </h1>
            <p className="text-zinc-500 text-sm mt-2 font-medium italic">Your outreach performance at a glance.</p>
          </motion.div>
          
          <button className="bg-zinc-900 border border-zinc-800 px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:border-[#00F5D4]/50 transition-all flex items-center gap-2">
            Download Report <ArrowUpRight size={14} />
          </button>
        </header>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-[2rem] relative overflow-hidden group hover:border-[#00F5D4]/30 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl bg-zinc-950 border border-zinc-800 ${stat.color}`}>
                  <stat.icon size={20} />
                </div>
                <span className="text-[10px] font-black text-[#00F5D4] bg-[#00F5D4]/10 px-2 py-1 rounded-lg">
                  {stat.trend}
                </span>
              </div>
              <div className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">{stat.label}</div>
              <div className="text-3xl font-['Syne'] font-black italic">{stat.value}</div>
              
              {/* Suptilni gradient u pozadini kartice */}
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-[#00F5D4]/5 blur-3xl rounded-full group-hover:bg-[#00F5D4]/10 transition-all" />
            </motion.div>
          ))}
        </div>

        {/* RECENT ACTIVITY & MINI CHART PLACEHOLDER */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="bg-zinc-900/20 border border-zinc-800 rounded-[2.5rem] p-8">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 mb-8">Recent Campaign Activity</h2>
            <div className="space-y-6">
              {stats.map((item) => (
                <div key={item} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center text-[#00F5D4]">
                    <Zap size={16} fill="#00F5D4" />
                  </div>
                  <div className="flex-1 border-b border-zinc-900 pb-4">
                    <div className="text-sm font-bold uppercase tracking-tighter italic">Dental Clinics Sarajevo</div>
                    <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-1">Status: Sending • 42% Completed</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-zinc-900/20 border border-dashed border-zinc-800 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-zinc-950 rounded-full flex items-center justify-center mb-4 border border-zinc-800">
              <TrendingUp size={24} className="text-blue-400" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-widest mb-2 italic">Analytics Coming Soon</h3>
            <p className="text-zinc-600 text-[10px] uppercase font-bold tracking-tighter max-w-[200px]">
              We are finalizing your custom AI performance charts.
            </p>
          </section>
        </div>
      </main>

      {/* BACKGROUND GLOW */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] -z-10 rounded-full" />
    </div>
  );
}