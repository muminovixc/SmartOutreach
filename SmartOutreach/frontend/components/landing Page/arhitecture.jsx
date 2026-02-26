import React from 'react';
import { Code2, Terminal } from 'lucide-react';

export const Architecture = () => (
  <section id="stack" className="py-32 px-8">
    <div className="max-w-6xl mx-auto border border-zinc-900 rounded-sm bg-zinc-950/50 p-8">
      <div className="flex items-center gap-3 mb-12">
        <Code2 size={18} className="text-blue-500" />
        <h2 className="text-[11px] font-bold tracking-[0.3em] uppercase text-zinc-400">System Architecture</h2>
      </div>
      
      <div className="grid md:grid-cols-2 gap-16">
        <div className="space-y-8 font-mono text-[12px]">
          <div className="border-l-2 border-zinc-800 pl-4">
            <p className="text-white mb-1 uppercase tracking-tighter">PostgreSQL Schema</p>
            <p className="text-zinc-600">Managed via Supabase</p>
          </div>
          <div className="space-y-2 text-zinc-400">
            <div className="flex justify-between py-1 border-b border-zinc-900 italic">
              <span>leads_table</span>
              <span className="text-zinc-600">JSONB Signals</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-900 italic">
              <span>campaign_status</span>
              <span className="text-zinc-600">ENUM (Scheduled)</span>
            </div>
          </div>
        </div>
        
        <div className="rounded border border-zinc-800 bg-black p-6 shadow-2xl">
           <div className="flex items-center gap-2 mb-4">
             <Terminal size={14} className="text-zinc-500" />
             <span className="text-[10px] font-mono text-zinc-500 uppercase">Prompt_Engine_V1</span>
           </div>
           <p className="text-zinc-400 font-mono text-[12px] leading-relaxed italic">
            "Identify management changes within TechFlow Inc. Connect the signal to our Cloud-Native solution."
           </p>
           <div className="mt-8">
              <div className="flex justify-between text-[10px] font-mono text-blue-500 mb-2 uppercase">
                <span>Confidence_Score</span>
                <span>85%</span>
              </div>
              <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
                <div className="w-[85%] h-full bg-blue-600" />
              </div>
           </div>
        </div>
      </div>
    </div>
  </section>
);