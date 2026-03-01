"use client";
import React, { useState } from 'react';
import { LayoutDashboard, Send, Users, Settings, LogOut, Zap, Search, Menu, X, Bookmark } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: "Overview", path: "/dashboard" },
    { 
      icon: Search, 
      label: "Lead Finder", 
      path: "/dashboard/finder",
      // Dodajemo subItems za podnavigaciju
      subItems: [
        { icon: Bookmark, label: "Saved Leads", path: "/dashboard/finder/myLeads" }
      ]
    },
    { icon: Send, label: "Campaigns", path: "/dashboard/campaigns" },
    { icon: Users, label: "My Leads", path: "/dashboard/leads" },
    { icon: Settings, label: "Settings", path: "/dashboard/settings" },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const NavContent = () => (
    <>
      <div className="flex items-center gap-2 px-2 mb-8">
        <Zap size={20} className="text-[#00F5D4]" fill="#00F5D4" />
        <span className="font-['Syne'] font-bold uppercase italic tracking-tighter text-white">SmartReach AI</span>
      </div>

      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => (
          <div key={item.path}>
            {/* Glavna stavka menija */}
            <div
              onClick={() => {
                router.push(item.path);
                setIsOpen(false);
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${
                pathname === item.path 
                ? 'bg-[#00F5D4]/10 text-[#00F5D4] border border-[#00F5D4]/20' 
                : 'text-zinc-500 hover:bg-zinc-900/50 hover:text-white'
              }`}
            >
              <item.icon size={18} />
              <span className="text-xs font-bold uppercase tracking-widest">{item.label}</span>
            </div>

            {/* Rendering podnavigacije (ako postoji) */}
            {item.subItems && item.subItems.map((sub) => (
              <div
                key={sub.path}
                onClick={() => {
                  router.push(sub.path);
                  setIsOpen(false);
                }}
                className={`flex items-center gap-3 ml-6 mt-1 px-4 py-2 rounded-xl cursor-pointer transition-all ${
                  pathname === sub.path 
                  ? 'text-[#00F5D4] bg-[#00F5D4]/5' 
                  : 'text-zinc-600 hover:text-zinc-300'
                }`}
              >
                <sub.icon size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">{sub.label}</span>
              </div>
            ))}
          </div>
        ))}
      </nav>

      <button 
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-3 text-zinc-600 hover:text-red-400 transition-colors text-xs font-bold uppercase tracking-widest mt-auto border-t border-zinc-900 pt-6"
      >
        <LogOut size={18} /> Logout
      </button>
    </>
  );

  return (
    <>
      {/* MOBILNI TOP BAR */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-[#020408] border-b border-zinc-900 p-4 flex justify-between items-center z-50">
        <div className="flex items-center gap-2">
          <Zap size={18} className="text-[#00F5D4]" fill="#00F5D4" />
          <span className="font-['Syne'] font-bold text-xs uppercase italic text-white">SmartReach</span>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="text-white p-1">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex w-64 border-r border-zinc-900 flex-col p-6 gap-2 bg-[#020408] h-screen sticky top-0">
        <NavContent />
      </aside>

      {/* MOBILNI OVERLAY MENI */}
      <div className={`
        lg:hidden fixed inset-0 bg-[#020408] z-40 p-6 flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="mt-16 flex flex-col h-full">
           <NavContent />
        </div>
      </div>
    </>
  );
}