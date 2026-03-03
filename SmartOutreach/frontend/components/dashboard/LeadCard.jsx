"use client";
import React, { useState } from "react";
import {
  Globe,
  Phone,
  Star,
  Bookmark,
  Loader2,
  Trash2,
  Linkedin,
  Search,
  Send,
} from "lucide-react";
import { motion } from "framer-motion";

export default function LeadCard({
  lead,
  isSavedPage = false,
  onDelete = null,
}) {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [linkedinUrl, setLinkedinUrl] = useState(lead.linkedin_url || null); // Inicijalno uzimamo iz lead-a ako postoji
  const [searchingLinkedin, setSearchingLinkedin] = useState(false);

  // Funkcija koja se poziva na klik dugmeta
  const handleLinkedinClick = async (e) => {
    // Ako već imamo URL, pusti browser da otvori link normalno
    if (linkedinUrl) return;

    // Spreči otvaranje praznog linka dok traje pretraga
    e.preventDefault();

    if (!lead.title || searchingLinkedin) return;

    setSearchingLinkedin(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/leads/find-linkedin`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            company_name: lead.title,
            city: lead.address, // ili lead.city, zavisi kako ti objekat 'lead' čuva lokaciju
          }),
        },
      );
      const data = await res.json();

      if (data.status === "success" && data.linkedin_url !== "no link") {
        setLinkedinUrl(data.linkedin_url);
        // Opciono: Automatski otvori link nakon što ga pronađe
        window.open(data.linkedin_url, "_blank", "noopener,noreferrer");
      } else {
        alert("LinkedIn profil nije pronađen za ovu kompaniju.");
      }
    } catch (err) {
      console.error("LinkedIn search error:", err);
    } finally {
      setSearchingLinkedin(false);
    }
  };

  const saveLead = async () => {
    const userId = localStorage.getItem("user_id");
    if (!userId) {
      alert("Niste prijavljeni.");
      return;
    }

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
          linkedin_url: linkedinUrl,
        }),
      });

      if (res.ok) {
        setSaved(true);
      }
    } catch (err) {
      console.error("Greška pri slanju:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      layout
      className="group p-6 bg-zinc-900/30 border border-zinc-800 rounded-[2rem] hover:bg-zinc-900/50 hover:border-[#00F5D4]/30 transition-all duration-300 relative overflow-hidden"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-1">
          <h3 className="font-['Syne'] font-bold text-xl text-white italic uppercase tracking-tighter group-hover:text-[#00F5D4] transition-colors line-clamp-1">
            {lead.title}
          </h3>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed max-w-[200px]">
            {lead.address}
          </p>
        </div>

        {lead.rating > 0 && (
          <div className="flex items-center gap-1 bg-zinc-950 px-2 py-1 rounded-lg border border-zinc-800">
            <Star size={10} className="text-yellow-500 fill-yellow-500" />
            <span className="text-[10px] font-bold text-white">
              {lead.rating}
            </span>
          </div>
        )}
      </div>

      <div className="h-[1px] w-full bg-zinc-800/50 mb-6" />

      <div className="flex flex-wrap items-center gap-3">
        {lead.website && (
          <a
            href={lead.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all"
          >
            <Globe size={14} className="text-[#00F5D4]" /> Website
          </a>
        )}

        <button
          onClick={() => {
            const subject = encodeURIComponent(`Interested in ${lead.title}`);
            window.location.href = `mailto:?subject=${subject}`;
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00F5D4]/10 to-[#00F5D4]/5 hover:from-[#00F5D4]/20 hover:to-[#00F5D4]/15 text-[#00F5D4] border border-[#00F5D4]/30 hover:border-[#00F5D4]/60 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all duration-300"
        >
          <Send size={13} /> Reach Out
    
        </button>

        {lead.phone && lead.phone !== "No phone" && (
          <div className="flex items-center gap-2 px-3 py-2 bg-zinc-800/30 text-zinc-400 rounded-xl text-[10px] font-bold uppercase tracking-widest">
            <Phone size={14} /> {lead.phone}
          </div>
        )}

        {isSavedPage ? (
          <button
            onClick={(e) => {
              e.preventDefault();
              if (onDelete) onDelete();
            }}
            className="ml-auto p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-600 hover:text-red-500 hover:border-red-500/50 transition-all"
          >
            <Trash2 size={18} />
          </button>
        ) : (
          <button
            onClick={saveLead}
            disabled={loading || saved}
            className={`ml-auto p-3 rounded-xl transition-all ${
              saved
                ? "bg-[#00F5D4]/20 text-[#00F5D4] border border-[#00F5D4]/30"
                : "bg-zinc-950 border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-700"
            }`}
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Bookmark size={18} fill={saved ? "#00F5D4" : "none"} />
            )}
          </button>
        )}
      </div>

      <div className="absolute -right-10 -top-10 w-24 h-24 bg-[#00F5D4]/5 blur-[60px] rounded-full pointer-events-none" />
    </motion.div>
  );
}
