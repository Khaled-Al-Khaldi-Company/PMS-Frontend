"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  Briefcase, 
  Wallet,
  CheckCircle2,
  Users,
  Clock,
  LayoutTemplate,
  Activity,
  ArrowUpRight,
  ArrowRight
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState({
    totalProjects: 0,
    certifiedValue: 0,
    outstandingRetention: 0,
    totalSubcontractors: 0,
    chartData: [] as { month: string; value: number }[],
    recentActivities: [] as { id: string; title: string; subtitle: string; status: string }[]
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE_URL}/v1/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData({
          ...res.data,
          chartData: res.data.chartData || [],
          recentActivities: res.data.recentActivities || []
        });
      } catch (e: any) {
        // Handle 401 specifically without causing Next.js red screen
        if (e.response?.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
        } else {
          console.warn("Could not load stats. Server might be down or not returning data.", e.message);
        }
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, []);

  const stats = [
    { title: "إجمالي المشاريع النشطة", value: (data.totalProjects || 0).toString(), trend: "+12%", up: true, icon: Briefcase, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", glow: "from-blue-500/20 to-transparent" },
    { title: "إجمالي الإيرادات (المعتمدة)", value: `SAR ${((data.certifiedValue || 0) / 1000).toFixed(1)}K", trend: "+8.3%", up: true, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", glow: "from-emerald-500/20 to-transparent" },
    { title: "إجمالي التكاليف (مشتريات وباطن)", value: `SAR ${(((data as any).totalCosts || 0) / 1000).toFixed(1)}K", trend: "-2%", up: false, icon: Wallet, color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20", glow: "from-rose-500/20 to-transparent" },
    { title: "هامش الربح (Profit Margin)", value: `${((data as any).profitMargin || 0).toFixed(1)}%", trend: ((data as any).profitMargin || 0) >= 0 ? "إيجابي" : "سلبي", up: ((data as any).profitMargin || 0) >= 0, icon: Activity, color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20", glow: "from-indigo-500/20 to-transparent" }
  ];

  const maxChartValue = Math.max(...data.chartData.map(d => Math.max(d.revenue, d.cost)), 1000); 

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4" />
          <p className="text-slate-400 text-sm animate-pulse">جاري تحميل لوحة المؤشرات المتقدمة...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 block w-full max-w-[1600px] mx-auto pb-12 relative">
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-blue-500/10 flex items-center justify-center border border-indigo-500/20 shadow-lg">
            <LayoutTemplate className="text-indigo-400" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              المركز المالي للشركة (Command Center)
            </h1>
            <p className="text-slate-400 text-sm mt-1 flex items-center gap-2">
               <Activity size={14} className="text-emerald-500" />
               مراقبة حية للأرباح، التكاليف، والإيرادات مع دفترة.
            </p>
          </div>
        </div>
      </div>

      {/* Top Value Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, ease: "easeOut" }}
            className={`relative p-6 rounded-3xl backdrop-blur-md bg-slate-900/60 border ${stat.border} hover:border-white/20 transition-all group overflow-hidden shadow-xl`}
          >
            <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${stat.glow} rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity`} />
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-5">
                <div className={`p-3.5 rounded-2xl ${stat.bg} ${stat.color} shadow-inner group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon size={26} strokeWidth={2} />
                </div>
                <div className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-full ${stat.up ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : 'text-rose-400 bg-rose-500/10 border border-rose-500/20'}`}>
                  {stat.up ? <ArrowUpRight size={14} /> : <ArrowUpRight size={14} className="rotate-90" />}
                  {stat.trend}
                </div>
              </div>
              <p className="text-2xl lg:text-3xl font-black text-white tracking-tight mb-1">{stat.value}</p>
              <h3 className="text-slate-400 text-xs tracking-wide uppercase">{stat.title}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Area (Charts + Activities) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dynamic Financial Chart */}
        <div className="lg:col-span-2 p-6 md:p-8 rounded-3xl backdrop-blur-md bg-slate-900/60 border border-white/5 shadow-2xl relative min-h-[420px] flex flex-col">
          <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-5">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <TrendingUp className="text-emerald-500" size={22} /> الإيرادات والتكاليف (Revenue vs Cost)
              </h3>
              <p className="text-xs text-slate-400 mt-2 flex gap-4">
                 <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> الإيرادات </span>
                 <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-rose-500"></span> التكاليف </span>
              </p>
            </div>
            
            <div className="px-4 py-1.5 rounded-full bg-emerald-500/10 text-xs font-medium border border-emerald-500/20 text-emerald-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              تحديث مباشر 
            </div>
          </div>
          
          <div className="flex-1 flex items-end justify-between gap-1 w-full relative z-10 pt-10 px-2 lg:px-8">
            {/* Y-Axis scale lines (decorative) */}
            <div className="absolute inset-x-0 bottom-0 h-full flex flex-col justify-between pointer-events-none -z-10">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-full border-b border-white/[0.03] border-dashed" />
              ))}
            </div>

            {data.chartData.length > 0 ? data.chartData.map((d, i) => {
              const heightRevPercent = maxChartValue > 0 ? (d.revenue / maxChartValue) * 100 : 0;
              const heightCostPercent = maxChartValue > 0 ? (d.cost / maxChartValue) * 100 : 0;
              return (
                 <div key={i} className="relative flex-1 group flex flex-col items-center justify-end h-full px-2">
                   {/* Tooltip */}
                   <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-slate-800 border border-slate-700 text-white text-xs py-2 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 shadow-xl pointer-events-none flex flex-col gap-1">
                     <span className="text-emerald-400 font-bold">إيرادات: SAR {d.revenue.toLocaleString()}</span>
                     <span className="text-rose-400 font-bold">تكاليف: SAR {d.cost.toLocaleString()}</span>
                   </div>

                   <div className="flex gap-1 w-full max-w-[40px] items-end h-full">
                     <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.max(heightRevPercent, 2)}%` }}
                        transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                        className="w-1/2 bg-gradient-to-t from-emerald-700 via-emerald-500 to-teal-400 rounded-t-sm group-hover:brightness-125 transition-all shadow-[0_0_10px_rgba(16,185,129,0.2)]" 
                      />
                     <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.max(heightCostPercent, 2)}%` }}
                        transition={{ duration: 1, delay: i * 0.1 + 0.2, ease: "easeOut" }}
                        className="w-1/2 bg-gradient-to-t from-rose-700 via-rose-500 to-pink-400 rounded-t-sm group-hover:brightness-125 transition-all shadow-[0_0_10px_rgba(244,63,94,0.2)]" 
                      />
                   </div>
                    <div className="mt-4 text-center text-[10px] sm:text-xs font-bold text-slate-400 group-hover:text-emerald-400 transition-colors uppercase tracking-wider">
                      {d.month}
                    </div>
                 </div>
              );
            }) : (
              <div className="w-full flex items-center justify-center text-slate-500 text-sm h-full pb-10">
                لا توجد بيانات للأشهر الستة الماضية.
              </div>
            )}
          </div>
        </div>

        {/* Real Dynamic Recent Activities */}
        <div className="p-6 md:p-8 rounded-3xl backdrop-blur-md bg-slate-900/60 border border-white/5 shadow-2xl flex flex-col">
          <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
             <h3 className="text-xl font-bold text-white flex items-center gap-2">
               <Clock className="text-amber-500" size={22} /> سجل الإنجاز
             </h3>
             <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded-md">آخر العمليات</span>
          </div>

          <div className="flex-1 overflow-auto pr-2 space-y-4 custom-scrollbar">
            {data.recentActivities.length > 0 ? data.recentActivities.map((item, idx) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.15 }}
                key={`${item.id}-${idx}`} 
                onClick={() => {
                  if (item.type === 'PURCHASE') router.push(`/dashboard/purchases`);
                  else router.push(`/dashboard/invoices/${item.id}`);
                }}
                className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all cursor-pointer group"
              >
                <div className={`p-3 rounded-full flex shrink-0 border ${
                  item.type === 'REVENUE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                  item.type === 'PURCHASE' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                  'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}>
                  {item.type === 'REVENUE' ? <TrendingUp size={20} /> : <Wallet size={20} />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white mb-1 truncate group-hover:text-amber-400 transition-colors">{item.title}</p>
                  <p className="text-xs text-slate-400 truncate">{item.subtitle}</p>
                </div>
                <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight size={16} className="text-slate-500" />
                </div>
              </motion.div>
            )) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm min-h-[200px] text-center px-4">
                <LayoutTemplate className="mb-4 opacity-50" size={40} />
                <p>لا توجد تحركات مالية بعد في النظام.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
