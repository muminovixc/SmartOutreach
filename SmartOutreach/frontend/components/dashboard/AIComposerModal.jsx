import { useState } from "react";
import { motion } from "framer-motion";
import { X, Sparkles, Mail, Loader2, Send, Copy, Check } from "lucide-react";

export default function AIComposerModal({ lead, foundEmail, setFoundEmail, onClose }) {
  const [generationStep, setGenerationStep] = useState("form");
  const [service, setService] = useState("");
  const [language, setLanguage] = useState("English");
  const [editableSubject, setEditableSubject] = useState("");
  const [editableBody, setEditableBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateAIEmail = async () => {
    if (!service) return alert("Please enter service.");
    setGenerationStep("loading");
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/leads/generate-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          website_url: lead.website || "No website",
          service_offered: service,
          company_name: lead.title,
          language: language,
          sender_name: `${localStorage.getItem("user_name")} ${localStorage.getItem("user_surname")}`,
        }),
      });
      const data = await res.json();
      if (data.status === "success") {
        if (data.lead_email && data.lead_email !== "no email") setFoundEmail(data.lead_email);
        const subjectMatch = data.email_content.match(/Subject: (.*)/i);
        setEditableSubject(subjectMatch ? subjectMatch[1] : `Partnership with ${lead.title}`);
        setEditableBody(data.email_content.replace(/Subject: .*/i, "").trim());
        setGenerationStep("result");
      }
    } catch (err) {
      setGenerationStep("form");
    }
  };

  const sendEmailViaGmail = async () => {
    const targetEmail = foundEmail || lead.email;
    if (!targetEmail || targetEmail === "no email") return alert("No email found.");

    setIsSending(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/campaigns/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          target_email: targetEmail,
          subject: editableSubject,
          content: editableBody,
        }),
      });
      if (res.ok) {
        alert("Email sent!");
        onClose();
      }
    } finally {
      setIsSending(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`Subject: ${editableSubject}\n\n${editableBody}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-sm bg-black/80">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-xl bg-[#0c0e12] border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl">
        <button onClick={onClose} className="absolute top-6 right-6 text-zinc-500 hover:text-white"><X size={20} /></button>
        
        <div className="mb-6">
          <h2 className="font-['Syne'] text-2xl font-bold text-white uppercase italic tracking-tighter flex items-center gap-2">
            <Sparkles size={20} className="text-[#00F5D4]" /> AI Composer
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Target: {lead.title}</p>
            {foundEmail && <span className="text-[#00F5D4] text-[9px] font-bold uppercase px-2 py-0.5 bg-[#00F5D4]/10 rounded-full border border-[#00F5D4]/20 flex items-center gap-1"><Mail size={10} /> {foundEmail}</span>}
          </div>
        </div>

        {generationStep === "form" && (
          <div className="space-y-5">
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white">
              <option value="English">English</option>
              <option value="Bosanski">Bosanski</option>
              {/* Ostale opcije... */}
            </select>
            <textarea placeholder="Describe your service..." value={service} onChange={(e) => setService(e.target.value)} className="w-full h-32 bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-4 text-sm text-white resize-none" />
            <button onClick={generateAIEmail} className="w-full py-4 bg-[#00F5D4] text-black font-bold uppercase font-['Syne'] rounded-2xl flex items-center justify-center gap-2">Generate Draft <Send size={16} /></button>
          </div>
        )}

        {generationStep === "loading" && (
          <div className="py-20 flex flex-col items-center gap-4">
            <Loader2 className="text-[#00F5D4] animate-spin" size={40} />
            <p className="text-white text-xs font-bold uppercase tracking-widest animate-pulse">Scanning website & drafting...</p>
          </div>
        )}

        {generationStep === "result" && (
          <div className="space-y-4">
            <input type="text" value={editableSubject} onChange={(e) => setEditableSubject(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-[#00F5D4]" />
            <textarea value={editableBody} onChange={(e) => setEditableBody(e.target.value)} className="w-full h-64 bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-4 text-sm text-zinc-300 leading-relaxed resize-none" />
            <div className="flex gap-3 pt-2">
              <button onClick={() => setGenerationStep("form")} className="flex-1 py-4 border border-zinc-800 rounded-xl text-zinc-500 text-[10px] font-bold uppercase">Reset</button>
              <button onClick={sendEmailViaGmail} disabled={isSending} className="flex-[2] py-4 bg-gradient-to-r from-[#00F5D4] to-[#00A8FF] text-black font-bold uppercase text-[10px] rounded-xl flex items-center justify-center gap-2">
                {isSending ? <Loader2 size={16} className="animate-spin" /> : <><Send size={14} /> Send Now</>}
              </button>
            </div>
            <button onClick={copyToClipboard} className="w-full text-[9px] uppercase text-zinc-600 hover:text-[#00F5D4] flex items-center justify-center gap-2">
              {copied ? <Check size={12}/> : <Copy size={12}/>} {copied ? "Copied" : "Copy to clipboard"}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}