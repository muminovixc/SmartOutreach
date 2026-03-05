"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LeadCardHeader from "./LeadCardHeader";
import LeadDetails from "./LeadDetails";
import AIComposerModal from "./AIComposerModal";
import { Bookmark, Loader2, Trash2 } from "lucide-react";

export default function LeadCard({ lead, isSavedPage = false, onDelete = null }) {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [foundEmail, setFoundEmail] = useState(lead.email || "");

  const saveLead = async () => {
    const userId = localStorage.getItem("user_id");
    if (!userId) return alert("Niste prijavljeni.");

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/leads/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          business_name: lead.title,
          business_category: lead.category || "General",
          address: lead.address || "No address",
          phone: lead.phone || "No phone",
          website: lead.website || "",
          rating: lead.rating || 0,
          email: foundEmail,
        }),
      });
      if (res.ok) setSaved(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.div className="group p-6 bg-zinc-900/30 border border-zinc-800 rounded-[2rem] hover:bg-zinc-900/50 hover:border-[#00F5D4]/30 transition-all duration-300 relative overflow-hidden font-sans">
        <LeadCardHeader 
            title={lead.title} 
            address={lead.address} 
            website={lead.website} 
            onReachOut={() => setIsModalOpen(true)} 
        />
        
        <LeadDetails rating={lead.rating} phone={lead.phone} />

        <div className="flex justify-end">
          {isSavedPage ? (
            <button onClick={onDelete} className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-600 hover:text-red-500 transition-all">
              <Trash2 size={18} />
            </button>
          ) : (
            <button onClick={saveLead} disabled={loading || saved} className={`p-3 rounded-xl border transition-all ${saved ? "bg-[#00F5D4]/20 text-[#00F5D4] border-[#00F5D4]/30" : "bg-zinc-950 border-zinc-800 text-zinc-500"}`}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Bookmark size={18} fill={saved ? "#00F5D4" : "none"} />}
            </button>
          )}
        </div>
        <div className="absolute -right-10 -top-10 w-24 h-24 bg-[#00F5D4]/5 blur-[60px] rounded-full pointer-events-none" />
      </motion.div>

      <AnimatePresence>
        {isModalOpen && (
          <AIComposerModal 
            lead={lead} 
            foundEmail={foundEmail} 
            setFoundEmail={setFoundEmail} 
            onClose={() => setIsModalOpen(false)} 
          />
        )}
      </AnimatePresence>
    </>
  );
}