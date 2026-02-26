import React from 'react';
import { Zap } from 'lucide-react';

const NavItem = ({ children, href }) => (
  <a href={href} className="text-[11px] font-medium tracking-[0.15em] text-zinc-500 hover:text-white transition-colors uppercase">
    {children}
  </a>
);

export const Navbar = () => (
  <nav className="fixed top-0 w-full z-50 border-b border-zinc-900 bg-[#050505]/80 backdrop-blur-md">
    <div className="max-w-[1400px] mx-auto flex items-center justify-between h-16 px-8">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Zap size={18} className="text-white" fill="white" />
          <span className="text-sm font-bold tracking-tighter text-white uppercase">SmartReach AI</span>
        </div>
        <div className="hidden md:flex gap-8 ml-10">
          <NavItem href="#engine">Engine</NavItem>
          <NavItem href="#stack">Stack</NavItem>
          <NavItem href="#docs">Docs</NavItem>
        </div>
      </div>
      <div className="flex items-center gap-4 font-mono text-[12px]">
        <button onClick={() => window.location.href = '/login'} className="text-zinc-500 hover:text-white transition-colors tracking-tighter">LOG IN</button>
        <button onClick={() => window.location.href = '/register'} className="bg-white text-black px-4 py-1.5 font-bold hover:bg-zinc-200 transition-all uppercase tracking-tighter">
          Register
        </button>
      </div>
    </div>
  </nav>
);