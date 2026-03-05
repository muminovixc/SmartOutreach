"use client";
import React, { useState } from "react";
import {
  Globe,
  Phone,
  Star,
  Bookmark,
  Loader2,
  Trash2,
  Send,
  X,
  Sparkles,
  Copy,
  Check,
  Mail,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LeadCard({
  lead,
  isSavedPage = false,
  onDelete = null,
}) {
  const [loading, setLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [generationStep, setGenerationStep] = useState("form");
  const [foundEmail, setFoundEmail] = useState(lead.email || "");

  // Form & AI States
  const [service, setService] = useState("");
  const [language, setLanguage] = useState("English");

  // Razdvojeni editable states
  const [editableSubject, setEditableSubject] = useState("");
  const [editableBody, setEditableBody] = useState("");

  const [copied, setCopied] = useState(false);

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
          email: foundEmail, // Spremamo i email ako je pronađen
        }),
      });

      if (res.ok) {
        setSaved(true);
      } else {
        alert("Greška pri spremanju lead-a.");
      }
    } catch (err) {
      console.error("Greška pri slanju:", err);
    } finally {
      setLoading(false);
    }
  };

  const generateAIEmail = async () => {
    if (!service) return alert("Please enter the service you offer.");

    const name = localStorage.getItem("user_name") || "";
    const surname = localStorage.getItem("user_surname") || "";
    const fullName = `${name} ${surname}`.trim() || "Our Team";

    setGenerationStep("loading");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/leads/generate-email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            website_url: lead.website || "No website",
            service_offered: service,
            company_name: lead.title,
            language: language,
            sender_name: fullName,
          }),
        },
      );

      const data = await res.json();
      if (data.status === "success") {
        // Logika za email sa backenda
        if (data.lead_email && data.lead_email !== "no email") {
            setFoundEmail(data.lead_email);
        }

        const content = data.email_content;
        const subjectMatch = content.match(/Subject: (.*)/i);
        const bodyText = content.replace(/Subject: .*/i, "").trim();

        setEditableSubject(
          subjectMatch ? subjectMatch[1] : `Partnership with ${lead.title}`,
        );
        setEditableBody(bodyText);
        setGenerationStep("result");
      } else {
        alert("AI Error: " + data.message);
        setGenerationStep("form");
      }
    } catch (err) {
      console.error(err);
      setGenerationStep("form");
    }
  };

  const sendEmailViaGmail = async () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Please log in again.");
    
    const targetEmail = foundEmail || lead.email;
    if (!targetEmail || targetEmail === "no email") {
        return alert("No recipient email found. Please enter it manually or check the website.");
    }

    setIsSending(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/campaigns/send`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            target_email: targetEmail,
            subject: editableSubject,
            content: editableBody,
          }),
        },
      );

      if (res.ok) {
        alert("Email sent!");
        setIsModalOpen(false);
      } else {
        alert("Failed to send.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const copyToClipboard = () => {
    const fullText = `Subject: ${editableSubject}\n\n${editableBody}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Kartica Lead-a (Zadržan tvoj originalni dizajn) */}
      <motion.div className="group p-6 bg-zinc-900/30 border border-zinc-800 rounded-[2rem] hover:bg-zinc-900/50 hover:border-[#00F5D4]/30 transition-all duration-300 relative overflow-hidden font-sans">
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-1 flex-1">
            <h3 className="font-['Syne'] font-bold text-xl text-white italic uppercase tracking-tighter group-hover:text-[#00F5D4] transition-colors line-clamp-1">
              {lead.title}
            </h3>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed max-w-[200px]">
              {lead.address}
            </p>
          </div>
          <div className="flex flex-col gap-2 ml-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#00F5D4]/10 text-[#00F5D4] border border-[#00F5D4]/30 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-[#00F5D4]/20 transition-all"
            >
              <Sparkles size={13} /> Reach Out
            </button>
            {lead.website && (
              <a
                href={lead.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-zinc-700 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all"
              >
                <Globe size={13} className="text-[#00F5D4]" /> Website
              </a>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          {lead.rating > 0 && (
            <div className="flex items-center gap-1 bg-zinc-950 px-2 py-1 rounded-lg border border-zinc-800">
              <Star size={10} className="text-yellow-500 fill-yellow-500" />
              <span className="text-[10px] font-bold text-white">
                {lead.rating}
              </span>
            </div>
          )}
          {lead.phone && lead.phone !== "No phone" && (
            <div className="flex items-center gap-2 px-3 py-1 bg-zinc-800/30 text-zinc-400 rounded-lg text-[10px] font-bold uppercase tracking-widest">
              <Phone size={12} /> {lead.phone}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          {isSavedPage ? (
            <button
              onClick={(e) => {
                e.preventDefault();
                if (onDelete) onDelete();
              }}
              className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-600 hover:text-red-500 hover:border-red-500/50 transition-all"
            >
              <Trash2 size={18} />
            </button>
          ) : (
            <button
              onClick={saveLead}
              disabled={loading || saved}
              className={`p-3 rounded-xl transition-all ${
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

      {/* MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-sm bg-black/80">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-xl bg-[#0c0e12] border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden font-sans"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 text-zinc-500 hover:text-white"
              >
                <X size={20} />
              </button>

              <div className="mb-6">
                <h2 className="font-['Syne'] text-2xl font-bold text-white uppercase italic tracking-tighter flex items-center gap-2">
                  <Sparkles size={20} className="text-[#00F5D4]" /> AI Composer
                </h2>
                <div className="flex items-center gap-2 mt-1">
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                    Target: {lead.title}
                    </p>
                    {foundEmail && foundEmail !== "no email" && (
                        <span className="text-[#00F5D4] text-[9px] font-bold uppercase px-2 py-0.5 bg-[#00F5D4]/10 rounded-full border border-[#00F5D4]/20 flex items-center gap-1">
                            <Mail size={10} /> {foundEmail}
                        </span>
                    )}
                </div>
              </div>

              {generationStep === "form" && (
                <div className="space-y-5">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-[#00F5D4] outline-none transition-all"
                  >
                    <option value="English">English</option>
                    <option value="German">German</option>
                    <option value="Bosanski">Bosanski</option>
                    <option value="Српски">Српски</option>
                    <option value="hrvatski">Hrvatski</option>
                    <option value="македонски">Македонски</option>
                    <option value="Русский">Русский</option>
                    <option value="中文">中文</option>
                    <option value="Español">Español</option>
                    <option value="Français">Français</option>
                    <option value="العربية">العربية</option>
                    <option value="Türkçe">Türkçe</option>
                  </select>
                  <textarea
                    placeholder="Describe your service..."
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className="w-full h-32 bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-4 text-sm text-white focus:border-[#00F5D4] outline-none resize-none transition-all"
                  />
                  <button
                    onClick={generateAIEmail}
                    className="w-full py-4 bg-[#00F5D4] text-black font-bold uppercase font-['Syne'] rounded-2xl hover:bg-[#00f5d4ef] transition-all flex items-center justify-center gap-2"
                  >
                    Generate Draft <Send size={16} />
                  </button>
                </div>
              )}

              {generationStep === "loading" && (
                <div className="py-20 flex flex-col items-center gap-4">
                  <Loader2 className="text-[#00F5D4] animate-spin" size={40} />
                  <p className="text-white text-xs font-bold uppercase tracking-widest animate-pulse">
                    Scanning website & drafting...
                  </p>
                </div>
              )}

              {generationStep === "result" && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-zinc-500 tracking-widest ml-1">
                      Subject Line
                    </label>
                    <input
                      type="text"
                      value={editableSubject}
                      onChange={(e) => setEditableSubject(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-[#00F5D4] font-medium focus:border-[#00F5D4] outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-zinc-500 tracking-widest ml-1">
                      Email Body
                    </label>
                    <textarea
                      value={editableBody}
                      onChange={(e) => setEditableBody(e.target.value)}
                      className="w-full h-64 bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-4 text-sm text-zinc-300 leading-relaxed focus:border-[#00F5D4] outline-none resize-none transition-all scrollbar-hide"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setGenerationStep("form")}
                      className="flex-1 py-4 border border-zinc-800 rounded-xl text-zinc-500 font-bold uppercase text-[10px] tracking-widest hover:bg-zinc-900 transition-all"
                    >
                      Reset
                    </button>
                    <button
                      onClick={sendEmailViaGmail}
                      disabled={isSending}
                      className="flex-[2] py-4 bg-gradient-to-r from-[#00F5D4] to-[#00A8FF] text-black font-bold uppercase text-[10px] tracking-widest rounded-xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all"
                    >
                      {isSending ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <>
                          <Send size={14} /> Send Now
                        </>
                      )}
                    </button>
                  </div>
                  <button onClick={copyToClipboard} className="w-full text-[9px] uppercase tracking-[0.3em] text-zinc-600 hover:text-[#00F5D4] transition-colors flex items-center justify-center gap-2">
                    {copied ? <Check size={12}/> : <Copy size={12}/>} {copied ? "Copied" : "Copy to clipboard"}
                  </button>
                </div>
              )}
              {/* Dekorativni blur unutar modala */}
              <div className="absolute -left-20 -bottom-20 w-40 h-40 bg-[#00F5D4]/5 blur-[80px] rounded-full pointer-events-none" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}