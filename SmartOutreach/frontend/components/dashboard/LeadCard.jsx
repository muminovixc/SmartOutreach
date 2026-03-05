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
  Edit3,
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

  // Form & AI States
  const [service, setService] = useState("");
  const [language, setLanguage] = useState("English");

  // Razdvojeni editable states
  const [editableSubject, setEditableSubject] = useState("");
  const [editableBody, setEditableBody] = useState("");

  const [copied, setCopied] = useState(false);

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
        // Pretpostavljamo da backend vraća "Subject: ... \n\n Body: ..."
        // Ili još bolje, razdvojena polja ako prepraviš backend (vidi korak 2)
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
            target_email: lead.email || "recipient@example.com",
            subject: editableSubject, // Šaljemo izmijenjeni subject
            content: editableBody, // Šaljemo izmijenjeni body
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

  return (
    <>
      {/* Kartica Lead-a (Nepromijenjena) */}
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

        {/* Rating i Phone Info */}
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

        {/* Decorative Element */}
        <div className="absolute -right-10 -top-10 w-24 h-24 bg-[#00F5D4]/5 blur-[60px] rounded-full pointer-events-none" />
      </motion.div>

      {/* MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-sm bg-black/80">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative w-full max-w-xl bg-[#0c0e12] border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="mb-6 flex justify-between items-start">
                <div>
                  <h2 className="font-['Syne'] text-2xl font-bold text-white uppercase italic italic tracking-tighter">
                    AI Composer
                  </h2>
                  <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">
                    Target: {lead.title}
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-zinc-500 hover:text-white"
                >
                  <X size={20} />
                </button>
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
                    <option value="Bosnian/Serbian/Croatian">
                      Bosnian/Serbian/Croatian
                    </option>
                  </select>
                  <textarea
                    placeholder="Describe your service..."
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className="w-full h-32 bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-4 text-sm text-white focus:border-[#00F5D4] outline-none resize-none transition-all"
                  />
                  <button
                    onClick={generateAIEmail}
                    className="w-full py-4 bg-[#00F5D4] text-black font-bold uppercase font-['Syne'] rounded-2xl hover:bg-[#00f5d4ef] transition-all"
                  >
                    Generate Draft
                  </button>
                </div>
              )}

              {generationStep === "loading" && (
                <div className="py-20 flex flex-col items-center gap-4">
                  <Loader2 className="text-[#00F5D4] animate-spin" size={40} />
                  <p className="text-white text-xs font-bold uppercase tracking-widest animate-pulse">
                    Drafting Email...
                  </p>
                </div>
              )}

              {generationStep === "result" && (
                <div className="space-y-4">
                  {/* EDITABLE SUBJECT */}
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

                  {/* EDITABLE BODY */}
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

                  {/* Actions */}
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
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
