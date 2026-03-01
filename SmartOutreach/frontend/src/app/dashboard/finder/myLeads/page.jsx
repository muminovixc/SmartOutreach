"use client";
import React, { useEffect, useState } from 'react';
import Sidebar from '../../../../../components/sidebar';
import LeadCard from '../../../../../components/dashboard/LeadCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark } from 'lucide-react';

export default function MyLeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  // Funkcija za dohvatanje
  const fetchLeads = async () => {
    const userId = localStorage.getItem('user_id');
    if (!userId) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/leads/my-leads?user_id=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setLeads(data);
      }
    } catch (error) {
      console.error("Greška pri dohvatanju leadova:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // FUNKCIJA ZA UKLANJANJE
  const handleDelete = async (leadId) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/leads/delete/${leadId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        // Mičemo lead iz state-a odmah da UI bude brz
        setLeads(leads.filter(lead => lead.id !== leadId));
      }
    } catch (error) {
      console.error("Greška pri brisanju:", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#020408] text-white">
      <Sidebar />
      <main className="flex-1 p-6 md:p-10 pt-24 lg:pt-10">
        <header className="mb-12">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-2">
               <div className="p-2 bg-[#00F5D4]/10 rounded-lg">
                  <Bookmark className="text-[#00F5D4]" size={20} />
               </div>
               <h2 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">Collection</h2>
            </div>
            <h1 className="font-['Syne'] text-4xl md:text-5xl font-black uppercase italic tracking-tighter">
              My <span className="text-[#00F5D4]">Saved Leads</span>
            </h1>
          </motion.div>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {leads.map((i) => (
              <div key={i} className="h-48 bg-zinc-900/50 rounded-[2rem] border border-zinc-800" />
            ))}
          </div>
        ) : leads.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {leads.map((lead) => (
                <LeadCard 
                  key={lead.id} 
                  lead={lead} 
                  isSavedPage={true} 
                  onDelete={() => handleDelete(lead.id)} 
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="py-20 text-center border-2 border-dashed border-zinc-900 rounded-[3rem]">
            <p className="font-['Syne'] uppercase italic font-bold text-zinc-700 tracking-widest">
              You haven't saved any leads yet.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}