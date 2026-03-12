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
  TrendingUp,
  ChevronDown,
  MessageSquare,
  Filter,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../../../../components/sidebar";

export default function CampaignsPage() {
  const [replyText, setReplyText] = useState("");
  const [generatingAI, setGeneratingAI] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // "all" | "replied" | "sent"
  const [expandedId, setExpandedId] = useState(null);
  const [threadLoading, setThreadLoading] = useState(false);
  const [currentThread, setCurrentThread] = useState([]);

  const fetchCampaigns = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/campaigns/history?t=${Date.now()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) setCampaigns(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateAIDraft = async (leadMessage, initialContent, campaignId) => {
  setGeneratingAI(true);
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/campaigns/${campaignId}/generate-reply`, {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({ 
        lead_message: leadMessage, 
        initial_content: initialContent 
      }),
    });

    if (res.ok) {
      const data = await res.json();
      setReplyText(data.suggestion);
    }
  } catch (err) {
    console.error("AI Error:", err);
  } finally {
    setGeneratingAI(false);
  }
};

  const handleSync = async () => {
    setSyncing(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/campaigns/sync-all`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok)
        setTimeout(() => {
          fetchCampaigns();
          setSyncing(false);
        }, 3000);
      else setSyncing(false);
    } catch (err) {
      console.error(err);
      setSyncing(false);
    }
  };

  const fetchThreadMessages = async (campaignId) => {
    setThreadLoading(true);
    setCurrentThread([]);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/campaigns/${campaignId}/thread`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) setCurrentThread(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setThreadLoading(false);
    }
  };

  const handleSendReply = async (campaignId) => {
    if (!replyText.trim()) return;
    setSendingReply(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/campaigns/${campaignId}/reply`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: replyText }),
        },
      );

      if (res.ok) {
        setReplyText("");
        // Osvježi thread da se vidi nova poruka
        fetchThreadMessages(campaignId);
      }
    } catch (err) {
      console.error("Reply error:", err);
    } finally {
      setSendingReply(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const toggleExpand = (id) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      fetchThreadMessages(id);
    }
  };

  // --- FILTRIRANJE LOGIKA ---
  const filteredCampaigns = campaigns.filter((camp) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      camp.lead_name?.toLowerCase().includes(searchLower) ||
      camp.target_email?.toLowerCase().includes(searchLower);

    const matchesStatus =
      filterStatus === "all" || camp.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const totalSent = campaigns.length;
  const totalReplied = campaigns.filter((c) => c.status === "replied").length;
  const replyRate =
    totalSent > 0 ? ((totalReplied / totalSent) * 100).toFixed(0) : 0;

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
            <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Track and sync performance</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl flex items-center gap-4">
              <TrendingUp size={20} className="text-[#00F5D4]" />
              <div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Reply Rate</p>
                <p className="text-xl font-bold font-['Syne']">{replyRate}%</p>
              </div>
            </div>
            <button 
              onClick={handleSync} 
              disabled={syncing} 
              className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl hover:bg-zinc-800 transition-colors"
            >
              <RefreshCcw size={20} className={`text-[#00F5D4] ${syncing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Filter & Search Bar Section */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 outline-none text-sm focus:border-[#00F5D4]/50 transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex bg-zinc-900/50 border border-zinc-800 p-1.5 rounded-2xl h-fit">
            {[
              { id: "all", label: "All" },
              { id: "replied", label: "Replied" },
              { id: "sent", label: "Sent" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                  filterStatus === tab.id 
                    ? "bg-[#00F5D4] text-black shadow-[0_0_15px_rgba(0,245,212,0.3)]" 
                    : "text-zinc-500 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center p-20"><Loader2 className="animate-spin text-[#00F5D4]" size={32} /></div>
          ) : filteredCampaigns.length === 0 ? (
            <div className="text-center py-20 text-zinc-600 uppercase font-bold text-xs tracking-widest border border-dashed border-zinc-800 rounded-3xl italic">
              No results found for "{searchTerm}"
            </div>
          ) : (
            filteredCampaigns.map((camp) => (
              <div key={camp.id} className="bg-zinc-900/30 border border-zinc-800 rounded-[2rem] overflow-hidden transition-all hover:border-zinc-700">
                <div onClick={() => toggleExpand(camp.id)} className="p-6 cursor-pointer flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${camp.status === "replied" ? "bg-[#00F5D4] text-black" : "bg-zinc-800 text-zinc-400"}`}>
                      <Mail size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{camp.lead_name || "Unknown Lead"}</h3>
                      <p className="text-xs text-zinc-500 font-medium">{camp.target_email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${camp.status === "replied" ? "border-[#00F5D4] text-[#00F5D4] bg-[#00F5D4]/10" : "border-zinc-700 text-zinc-500 bg-zinc-800/50"}`}>
                      {camp.status}
                    </span>
                    <ChevronDown size={20} className={`text-zinc-600 transition-transform duration-300 ${expandedId === camp.id ? "rotate-180" : ""}`} />
                  </div>
                </div>

                <AnimatePresence>
                  {expandedId === camp.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-zinc-800 bg-black/40">
                      <div className="p-6 space-y-6">
                        {threadLoading ? (
                          <div className="flex flex-col items-center justify-center p-10 gap-3">
                            <Loader2 className="animate-spin text-[#00F5D4]" />
                            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Fetching Gmail Thread...</p>
                          </div>
                        ) : (
                          <>
                            {/* MESSAGES DISPLAY */}
                            <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                              {currentThread.length > 0 ? (
                                currentThread.map((msg, idx) => (
                                  <div key={idx} className={`flex w-full ${msg.is_me ? "justify-end" : "justify-start"}`}>
                                    <div className={`max-w-[85%] p-5 rounded-3xl ${msg.is_me ? "bg-[#00F5D4]/10 border border-[#00F5D4]/20 rounded-tr-none" : "bg-zinc-900 border border-zinc-800 rounded-tl-none shadow-xl"}`}>
                                      <div className={`flex items-center gap-2 mb-2 ${msg.is_me ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <p className={`text-[10px] font-black uppercase tracking-widest ${msg.is_me ? "text-[#00F5D4]" : "text-zinc-500"}`}>
                                          {msg.is_me ? "You" : camp.lead_name || "Lead"}
                                        </p>
                                        <span className="text-[9px] text-zinc-600 font-bold uppercase">{msg.date} • {msg.time}</span>
                                      </div>
                                      <p className={`text-sm leading-relaxed whitespace-pre-wrap ${msg.is_me ? "text-zinc-200" : "text-zinc-300"}`}>
                                        {msg.body}
                                      </p>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
                                  <p className="text-[10px] text-zinc-500 font-bold uppercase mb-2 text-center tracking-widest italic">Viewing local archive</p>
                                  <p className="text-sm text-zinc-300 whitespace-pre-wrap">{camp.content}</p>
                                </div>
                              )}
                            </div>

                            {/* CHAT INPUT AREA */}
                            <div className="relative group mt-6 pt-4 border-t border-zinc-800/50">
                              <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder={`Reply to ${camp.lead_name}...`}
                                className="w-full bg-black/40 border border-zinc-800 rounded-3xl py-5 pl-6 pr-28 outline-none text-sm focus:border-[#00F5D4]/50 transition-all resize-none min-h-[120px] shadow-inner"
                              />

                              <div className="absolute right-3 top-7 flex flex-col gap-2">
                                {/* AI GENERATE BUTTON */}
                                <button
                                  onClick={() => {
                                    // Pronađi zadnju poruku od leada u threadu
                                    const lastLeadMsg = [...currentThread].reverse().find(m => !m.is_me);
                                    const leadContent = lastLeadMsg ? lastLeadMsg.body : "No lead reply yet";
                                    generateAIDraft(leadContent, camp.content, camp.id);
                                  }}
                                  disabled={generatingAI}
                                  title="Generate AI Response"
                                  className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-[#00F5D4] hover:bg-[#00F5D4] hover:text-black transition-all group/ai"
                                >
                                  {generatingAI ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} className="group-hover/ai:animate-pulse" />}
                                </button>

                                {/* SEND BUTTON */}
                                <button
                                  onClick={() => handleSendReply(camp.id)}
                                  disabled={sendingReply || !replyText.trim()}
                                  className={`p-3 rounded-xl transition-all ${
                                    replyText.trim() 
                                      ? "bg-[#00F5D4] text-black shadow-[0_0_20px_rgba(0,245,212,0.4)]" 
                                      : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                                  }`}
                                >
                                  {sendingReply ? <Loader2 size={18} className="animate-spin" /> : <MessageSquare size={18} />}
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
