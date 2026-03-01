"use client";
import { Search, MapPin, ArrowRight, Loader2 } from 'lucide-react';

export default function LeadForm({ niche, setNiche, city, setCity, onSearch, loading }) {
  return (
    <section className="bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-md rounded-3xl p-6 md:p-8 max-w-4xl shadow-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 ml-1">Business Niche</label>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-[#00F5D4] transition-colors" size={18} />
            <input 
              type="text" 
              value={niche}
              placeholder="e.g. Dental Clinics"
              className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-12 py-4 text-sm text-white focus:border-[#00F5D4]/50 outline-none transition-all placeholder:text-zinc-700"
              onChange={(e) => setNiche(e.target.value)}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 ml-1">Target City</label>
          <div className="relative group">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-[#00A8FF] transition-colors" size={18} />
            <input 
              type="text" 
              value={city}
              placeholder="e.g. Sarajevo"
              className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-12 py-4 text-sm text-white focus:border-[#00A8FF]/50 outline-none transition-all placeholder:text-zinc-700"
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
        </div>
      </div>

      <button 
        onClick={onSearch}
        disabled={loading || !niche || !city}
        className="w-full bg-gradient-to-r from-[#00F5D4] to-[#00A8FF] disabled:opacity-50 disabled:cursor-not-allowed text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all uppercase text-sm font-['Syne'] shadow-lg shadow-[#00F5D4]/10"
      >
        {loading ? <Loader2 className="animate-spin" size={20} /> : <><Search size={18} /> Find Hot Leads</>}
      </button>
    </section>
  );
}