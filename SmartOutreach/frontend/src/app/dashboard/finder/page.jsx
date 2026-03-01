"use client";
import React, { useState } from 'react';
import Sidebar from '../../../../components/sidebar';
import LeadForm from '../../../../components/dashboard/leadForm';
import LeadCard from '../../../../components/dashboard/LeadCard';
import { motion, AnimatePresence } from 'framer-motion';

export default function LeadFinderPage() {
  const [niche, setNiche] = useState('');
  const [city, setCity] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/leads/search?niche=${niche}&city=${city}`
      );
      const data = await response.json();
      setResults(data);
      console.log("Search results:", data);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#020408] text-zinc-100">
      <Sidebar />

      <main className="flex-1 p-6 md:p-10 pt-24 lg:pt-10 overflow-y-auto">
        <header className="mb-10">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="font-['Syne'] text-4xl md:text-5xl font-black uppercase italic tracking-tighter">
              Lead <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F5D4] to-[#00A8FF]">Finder</span>
            </h1>
            <p className="text-zinc-500 text-sm mt-2 font-medium">Powering your outreach with real-time business data.</p>
          </motion.div>
        </header>

        <LeadForm 
          niche={niche} setNiche={setNiche} 
          city={city} setCity={setCity} 
          onSearch={handleSearch} loading={loading} 
        />

        <div className="mt-12">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-600">Results</h2>
            <div className="h-[1px] flex-1 bg-zinc-900" />
            <span className="text-[10px] font-bold text-zinc-800">{results.length} leads found</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence>
              {results.length > 0 ? (
                results.map((lead, idx) => <LeadCard key={idx} lead={lead} />)
              ) : !loading && (
                <div className="col-span-full py-20 text-center border-2 border-dashed border-zinc-900 rounded-3xl">
                  <p className="text-zinc-700 font-['Syne'] uppercase italic font-bold tracking-widest">No leads searched yet</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-[#00F5D4]/5 blur-[120px] -z-10 rounded-full" />
    </div>
  );
}