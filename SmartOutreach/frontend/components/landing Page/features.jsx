import React from 'react';
import { Search, Fingerprint, Mail } from 'lucide-react';

const TechBadge = ({ children }) => (
  <span className="px-2 py-1 rounded-sm border border-zinc-800 bg-zinc-950 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
    {children}
  </span>
);

export const Features = () => (
  <section id="engine" className="py-24 px-8 border-y border-zinc-900 bg-[#080808]">
    <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-1px bg-zinc-900 border border-zinc-900">
      
      {/* Step 1 */}
      <div className="bg-[#080808] p-10">
        <Search className="text-zinc-600 mb-6" size={20} />
        <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-4">01. Signal Extraction</h3>
        <p className="text-zinc-500 text-sm leading-relaxed mb-6 font-light">
          Asynchronous scraping of LinkedIn activities and Google Search results.
        </p>
        <div className="flex flex-wrap gap-2">
          <TechBadge>Proxycurl</TechBadge>
          <TechBadge>SerpApi</TechBadge>
        </div>
      </div>

      {/* Step 2 */}
      <div className="bg-[#080808] p-10">
        <Fingerprint className="text-zinc-600 mb-6" size={20} />
        <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-4">02. Neural Reasoning</h3>
        <p className="text-zinc-500 text-sm leading-relaxed mb-6 font-light">
          Gemini 1.5 Pro analyzes ICP alignment and strategic signals.
        </p>
        <div className="flex flex-wrap gap-2">
          <TechBadge>Gemini 1.5</TechBadge>
          <TechBadge>FastAPI</TechBadge>
        </div>
      </div>

      {/* Step 3 */}
      <div className="bg-[#080808] p-10">
        <Mail className="text-zinc-600 mb-6" size={20} />
        <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-4">03. Automated Delivery</h3>
        <p className="text-zinc-500 text-sm leading-relaxed mb-6 font-light">
          Dynamic email routing via Resend API with built-in throttling.
        </p>
        <div className="flex flex-wrap gap-2">
          <TechBadge>Resend</TechBadge>
          <TechBadge>Webhooks</TechBadge>
        </div>
      </div>

    </div>
  </section>
);