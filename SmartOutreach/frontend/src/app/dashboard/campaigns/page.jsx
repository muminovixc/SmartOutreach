"use client";
import React, { useEffect, useState } from "react";
import {
  Mail,
  Calendar,
  User,
  ExternalLink,
  Search,
  CheckCircle2,
  Loader2,
  RefreshCcw,
  Sparkles,
  TrendingUp
} from "lucide-react";
import { motion } from "framer-motion";
import Sidebar from "../../../../components/sidebar";

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Funkcija za dohvaćanje podataka
  const fetchCampaigns = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/campaigns/history`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data);
      }
    } catch (err) {
      console.error("Failed to fetch campaigns:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  // 2. Funkcija za sinkronizaciju odgovora s Gmaila
  const handleSync = async () => {
    setSyncing(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/campaigns/sync-all`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.ok) {
        console.log(res)
        // Sačekamo malo da background task na backendu odradi svoje
        setTimeout(() => {
          fetchCampaigns();
          setSyncing(false);
        }, 2000);
      }
    } catch (err) {
      console.error("Sync failed:", err);
      setSyncing(false);
    }
  };

  // 3. Filtriranje kampanja
  const filteredCampaigns = campaigns.filter((camp) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      camp.lead_name?.toLowerCase().includes(searchLower) ||
      camp.target_email?.toLowerCase().includes(searchLower) ||
      camp.subject?.toLowerCase().includes(searchLower)
    );
  });

  // Izračun statistike
  const totalSent = campaigns.length;
  const totalReplied = campaigns.filter(c => c.status === 'replied').length;
  const replyRate = totalSent > 0 ? ((totalReplied / totalSent) * 100).toFixed(0) : 0;

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans flex">
      <Sidebar />

      <div className="flex-1 max-w-6xl mx-auto ml-20 md:ml-64">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h1 className="font-['Syne'] text-4xl font-bold italic uppercase tracking-tighter mb-2">
              Email <span className="text-[#00F5D4]">History</span>
            </h1>
            <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">
              Track and sync your outreach performance
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl flex items-center gap-4">
                <div className="p-2 bg-[#00F5D4]/10 rounded-lg text-[#00F5D4]">
                    <TrendingUp size={20} />
                </div>
                <div>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Reply Rate</p>
                    <p className="text-xl font-bold font-['Syne']">{replyRate}%</p>
                </div>
            </div>
            
            <button
              onClick={handleSync}
              disabled={syncing}
              className="p-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-2xl transition-all group"
            >
              <RefreshCcw 
                size={20} 
                className={`text-[#00F5D4] ${syncing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} 
              />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
            size={18}
          />
          <input
            type="text"
            placeholder="Search leads, emails or subjects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-[#00F5D4]/50 transition-all text-sm"
          />
        </div>

        {/* List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-20 flex flex-col items-center gap-4">
              <Loader2 className="text-[#00F5D4] animate-spin" size={32} />
              <p className="text-zinc-500 animate-pulse uppercase font-bold text-[10px] tracking-widest">
                Loading history...
              </p>
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-zinc-800 rounded-[2rem] text-zinc-600 font-bold uppercase tracking-widest text-xs">
              {searchTerm ? "No matches found" : "No campaigns yet"}
            </div>
          ) : (
            filteredCampaigns.map((camp) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={camp.id}
                className="group p-6 bg-zinc-900/30 border border-zinc-800 rounded-[2rem] hover:bg-zinc-900/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-2xl ${camp.status === 'replied' ? 'bg-[#00F5D4] text-black' : 'bg-zinc-800 text-zinc-400'}`}>
                    <Mail size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white group-hover:text-[#00F5D4] transition-colors">
                      {camp.lead_name || "Unknown Lead"}
                    </h3>
                    <div className="flex flex-wrap gap-4 mt-1">
                      <span className="flex items-center gap-1 text-zinc-500 text-[11px] font-bold uppercase tracking-wider">
                        <User size={12} /> {camp.target_email}
                      </span>
                      <span className="flex items-center gap-1 text-zinc-500 text-[11px] font-bold uppercase tracking-wider">
                        <Calendar size={12} />{" "}
                        {new Date(camp.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="hidden lg:block text-right mr-4">
                    <p className="text-[10px] font-bold uppercase text-zinc-600 mb-1">
                      Subject
                    </p>
                    <p className="text-xs text-zinc-300 italic line-clamp-1 max-w-[180px]">
                      {camp.subject}
                    </p>
                  </div>
                  
                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-tighter ${
                      camp.status === "replied"
                        ? "bg-[#00F5D4]/20 text-[#00F5D4] border-[#00F5D4]/40 animate-pulse"
                        : "bg-zinc-800/50 text-zinc-500 border-zinc-700"
                    }`}
                  >
                    {camp.status === "replied" ? (
                      <>
                        <Sparkles size={12} /> Replied
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={12} /> Sent
                      </>
                    )}
                  </div>
                  
                  <button
                    onClick={() => alert(`Full Content:\n\n${camp.content}`)}
                    className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-all hover:border-[#00F5D4]/50"
                  >
                    <ExternalLink size={16} />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}