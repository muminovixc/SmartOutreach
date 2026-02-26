"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Send, 
  Users, 
  Settings, 
  LogOut, 
  Zap,
  TrendingUp,
  Mail
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const stats = [
    { label: 'Total Emails', value: '1,284', icon: Mail, color: 'text-blue-400' },
    { label: 'Avg Open Rate', value: '42.8%', icon: TrendingUp, color: 'text-[#00F5D4]' },
    { label: 'Leads Found', value: '852', icon: Users, color: 'text-purple-400' },
  ];

  return (
    <div className="min-h-screen bg-[#020408] text-white flex font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-zinc-900 flex flex-col p-6 gap-8">
        <div className="flex items-center gap-2 px-2">
          <Zap size={20} className="text-[#00F5D4]" fill="#00F5D4" />
          <span className="font-['Syne'] font-bold uppercase italic tracking-tighter">SmartReach</span>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarItem icon={LayoutDashboard} label="Overview" active />
          <SidebarItem icon={Send} label="Campaigns" />
          <SidebarItem icon={Users} label="Leads" />
          <SidebarItem icon={Settings} label="Settings" />
        </nav>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 text-zinc-500 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest"
        >
          <LogOut size={18} /> Logout
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-10">
        <header className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="font-['Syne'] text-4xl font-extrabold uppercase italic">Dashboard</h1>
            <p className="text-zinc-500 text-sm mt-2">Welcome back. Here's what's happening today.</p>
          </div>
          <button className="bg-[#00F5D4] text-black px-6 py-2 rounded-full font-bold text-xs uppercase tracking-widest hover:scale-105 transition-transform">
            + New Campaign
          </button>
        </header>

        {/* STATS GRID */}
        <div className="grid grid-cols-3 gap-6 mb-12">
          {stats.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl"
            >
              <stat.icon className={`${stat.color} mb-4`} size={24} />
              <div className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em]">{stat.label}</div>
              <div className="text-3xl font-['Syne'] font-bold mt-1">{stat.value}</div>
            </motion.div>
          ))}
        </div>

        {/* PLACEHOLDER FOR CHART/TABLE */}
        <div className="w-full h-64 bg-zinc-900/20 border border-dashed border-zinc-800 rounded-3xl flex items-center justify-center">
          <p className="text-zinc-700 font-bold uppercase tracking-tighter italic">Chart Data Coming Soon...</p>
        </div>
      </main>

      {/* BACKGROUND GLOW */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/5 blur-[120px] -z-10 rounded-full" />
    </div>
  );
}

function SidebarItem({ icon: Icon, label, active = false }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${
      active ? 'bg-[#00F5D4]/10 text-[#00F5D4]' : 'text-zinc-500 hover:bg-zinc-900 hover:text-white'
    }`}>
      <Icon size={18} />
      <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
    </div>
  );
} 