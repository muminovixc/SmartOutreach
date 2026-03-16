"use client";
import React, { useEffect, useState } from "react";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import Sidebar from "../../../components/sidebar";
import jsPDF from "jspdf";
import { toPng } from 'html-to-image';
import { motion } from "framer-motion";
import {
  Users,
  Send,
  Target,
  TrendingUp,
  ArrowUpRight,
  Zap,
  Loader2,
} from "lucide-react";
import Footer from "../../../components/footer";

export default function DashboardOverview() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // STATE ZA PODATKE
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    const userId = searchParams.get("user_id");

    if (tokenFromUrl && userId) {
      localStorage.setItem("token", tokenFromUrl);
      localStorage.setItem("user_id", userId);
      localStorage.setItem("user_email", searchParams.get("user_email"));
      localStorage.setItem("user_name", searchParams.get("user_name"));
      localStorage.setItem("user_surname", searchParams.get("user_surname"));
      router.replace("/dashboard");
    }

    // 2. FETCH STATISTIKE IZ TVOJE RUTE
    const getStats = async () => {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/leads/stats`;
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setStatsData(data);
        }
      } catch (error) {
        console.error("Greška pri učitavanju statistike:", error);
      } finally {
        setLoading(false);
      }
    };

    getStats();
  }, [searchParams, router]);

  useEffect(() => {
    const fetchActivity = async () => {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/leads/activity`;
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setActivities(data);
        }
      } catch (err) {
        console.error("Activity fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
    // Opcionalno: Refreshuj svakih 30 sekundi
    const interval = setInterval(fetchActivity, 30000);
    return () => clearInterval(interval);
  }, []);

  const downloadPDF = async () => {
  const element = document.getElementById('dashboard-content');
  
  try {
    // Generisanje slike visokog kvaliteta (bez pucanja na lab bojama)
    const dataUrl = await toPng(element, { 
      quality: 1, 
      backgroundColor: '#020408',
      cacheBust: true 
    });
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (element.offsetHeight * pdfWidth) / element.offsetWidth;

    pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('SmartReach-AI-Report.pdf');
  } catch (err) {
    console.error('Greška pri PDF generisanju:', err);
  }
};

  // Mapiranje podataka za tvoj UI
  const displayStats = [
    {
      label: "Total Outreach",
      value: statsData?.total_outreach || "0",
      icon: Users,
      color: "text-[#00F5D4]",
      trend: "LIVE",
    },
    {
      label: "Replies Received",
      value: statsData?.replied_count || "0",
      icon: Send,
      color: "text-blue-400",
      trend: statsData?.response_rate || "0%",
    },
    {
      label: "Pending Followups",
      value: statsData?.pending_followups || "0",
      icon: Target,
      color: "text-purple-400",
      trend: "Active",
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#020408] text-white">
      <Sidebar />

      <main id="dashboard-content" className="flex-1 p-6 md:p-10 pt-24 lg:pt-10 overflow-y-auto">
        {/* HEADER */}
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="font-['Syne'] text-4xl md:text-5xl font-black uppercase italic tracking-tighter">
              System <span className="text-[#00F5D4]">Overview</span>
            </h1>
            <p className="text-zinc-500 text-sm mt-2 font-medium italic">
              Your outreach performance at a glance.
            </p>
          </motion.div>

          
          <button
            onClick={downloadPDF}
            className="bg-zinc-900 border border-zinc-800 px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:border-[#00F5D4]/50 transition-all flex items-center gap-2"
          >
            Download Report <ArrowUpRight size={14} />
          </button>
        </header>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="animate-spin text-[#00F5D4]" size={32} />
          </div>
        ) : (
          <>
            {/* STATS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {displayStats.map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-[2rem] relative overflow-hidden group hover:border-[#00F5D4]/30 transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div
                      className={`p-3 rounded-xl bg-zinc-950 border border-zinc-800 ${stat.color}`}
                    >
                      <stat.icon size={20} />
                    </div>
                    <span className="text-[10px] font-black text-[#00F5D4] bg-[#00F5D4]/10 px-2 py-1 rounded-lg">
                      {stat.trend}
                    </span>
                  </div>
                  <div className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">
                    {stat.label}
                  </div>
                  <div className="text-3xl font-['Syne'] font-black italic">
                    {stat.value}
                  </div>
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-[#00F5D4]/5 blur-3xl rounded-full group-hover:bg-[#00F5D4]/10 transition-all" />
                </motion.div>
              ))}
            </div>

            {/* RECENT ACTIVITY & CHART */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              <div
                onClick={() => redirect("/dashboard/campaigns")}
                className="space-y-6"
              >
                {activities.length > 0 ? (
                  activities.map((item, i) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 group"
                    >
                      <div className="w-10 h-10 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center text-[#00F5D4] group-hover:border-[#00F5D4]/50 transition-all">
                        <Zap
                          size={16}
                          fill={
                            item.status === "Interested" ? "#00F5D4" : "none"
                          }
                          className={
                            item.status === "Interested" ? "animate-pulse" : ""
                          }
                        />
                      </div>
                      <div className="flex-1 border-b border-zinc-800/50 pb-4">
                        <div className="flex justify-between items-start">
                          <div className="text-sm font-bold uppercase tracking-tighter italic text-white">
                            {item.name}
                          </div>
                          <div className="text-[9px] text-[#00F5D4] font-black uppercase bg-[#00F5D4]/10 px-2 py-0.5 rounded">
                            {/* Koristimo date-fns za "2m ago" */}
                            {new Date(item.time).toLocaleTimeString([], {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                        <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-1">
                          {item.action} •{" "}
                          <span className="text-zinc-400">{item.status}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-zinc-600 text-[10px] uppercase font-bold">
                    No recent activity detected.
                  </p>
                )}
              </div>
              <section className="bg-zinc-900/20 border border-dashed border-zinc-800 rounded-[2.5rem] p-8 flex flex-col items-start text-left overflow-hidden relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-zinc-950 rounded-full flex items-center justify-center border border-zinc-800">
                    <TrendingUp size={14} className="text-[#00F5D4]" />
                  </div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white italic">
                    AI Neural Logs
                  </h3>
                </div>

                <div className="w-full font-mono space-y-3">
                  {/* AI Writing Lines */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[#00F5D4] text-[10px] tracking-widest font-black">
                        SYSTEM:
                      </span>
                      <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-tighter">
                        Initializing response engine...
                      </span>
                    </div>

                    <div className="flex items-center gap-2 border-l border-zinc-800 pl-4 py-1">
                      <span className="text-blue-400 text-[10px] font-black">
                        AI_THOUGHT:
                      </span>
                      <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-tighter leading-relaxed">
                        Analyzing lead sentiment:{" "}
                        <span className="text-[#00F5D4]">
                          "Interested in clinical trial"
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 border-l border-zinc-800 pl-4 py-1">
                      <span className="text-purple-400 text-[10px] font-black">
                        DRAFTING:
                      </span>
                      <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-tighter italic">
                        Crafting high-conversion reply via Gemini-Pro-3...
                      </p>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <div className="h-1 w-1 bg-[#00F5D4] rounded-full animate-ping" />
                      <span className="text-[9px] font-black text-[#00F5D4] uppercase tracking-widest">
                        Engine Standby • Ready to dispatch
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dekorativni kodni elementi u pozadini */}
                <div className="absolute -bottom-6 -right-6 opacity-5 pointer-events-none select-none text-[80px] font-black italic text-[#00F5D4]">
                  AI
                </div>
              </section>
            </div>
          </>
        )}

        <Footer />
      </main>

      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] -z-10 rounded-full" />
    </div>
  );
}
