import { Sparkles, Globe } from "lucide-react";

export default function LeadCardHeader({ title, address, website, onReachOut }) {
  return (
    <div className="flex justify-between items-start mb-4">
      <div className="space-y-1 flex-1">
        <h3 className="font-['Syne'] font-bold text-xl text-white italic uppercase tracking-tighter group-hover:text-[#00F5D4] transition-colors line-clamp-1">
          {title}
        </h3>
        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed max-w-[200px]">
          {address}
        </p>
      </div>
      <div className="flex flex-col gap-2 ml-4">
        <button onClick={onReachOut} className="flex items-center gap-2 px-4 py-2 bg-[#00F5D4]/10 text-[#00F5D4] border border-[#00F5D4]/30 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-[#00F5D4]/20 transition-all">
          <Sparkles size={13} /> Reach Out
        </button>
        {website && (
          <a href={website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-zinc-700 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all">
            <Globe size={13} className="text-[#00F5D4]" /> Website
          </a>
        )}
      </div>
    </div>
  );
}