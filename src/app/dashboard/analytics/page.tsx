"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";
import { motion } from "framer-motion";
import { 
  TrendingUp, TrendingDown, DollarSign, Briefcase, 
  PieChart, Activity, AlertTriangle, CheckCircle2, FileSpreadsheet, Loader2, Building2
} from "lucide-react";
import { exportToCsv } from "@/lib/exportUtils";

export default function ProfitabilityAnalytics() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/v1/projects/dashboard/global`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    if (!data) return;
    const exportData = data.projects.map((p: any) => ({
      "المشروع": p.name,
      "الكود": p.code,
      "الحالة": p.status,
      "الإيراد التقديري (العقد)": p.targetRevenue,
      "الميزانية التقديرية": p.estimatedBudget,
      "الإيراد الفعلي (المستخلصات)": p.actualRevenue,
      "التكلفة الفعلية": p.actualCost,
      "الربح الإجمالي": p.actualRevenue - p.actualCost,
      "هامش الربح %": p.profitMargin.toFixed(2) + "%"
    }));
    exportToCsv(`Profitability_Report_${new Date().toISOString().split('T')[0]}.csv`, exportData);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
         <Loader2 className="animate-spin text-indigo-500 mb-4" size={48} />
         <p className="text-slate-400 font-bold">جاري تجميع البيانات المالية للمشاريع...</p>
      </div>
    );
  }

  if (!data) return <div className="p-8 text-center text-rose-500 font-bold">فشل في تحميل البيانات</div>;

  const { overview, costBreakdown, projects } = data;

  return (
    <div className="space-y-8 w-full animate-in fade-in zoom-in-95 duration-500 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0f1015]/80 p-8 rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 flex items-center gap-4">
            <PieChart size={36} className="text-indigo-500" /> تحليلات الأرباح والخسائر (P&L)
          </h1>
          <p className="text-slate-400 mt-3 text-lg">نظرة شاملة لربحية المشاريع ومقارنة التكاليف الفعلية بالإيرادات.</p>
        </div>
        <div className="relative z-10 flex gap-3">
           <button onClick={handleExport} className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-6 py-3 rounded-xl font-bold transition-all border border-emerald-500/30">
              <FileSpreadsheet size={20} /> تصدير التقرير Excel
           </button>
        </div>
      </div>

      {/* Global Overview KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{y: 20, opacity: 0}} animate={{y: 0, opacity: 1}} transition={{delay: 0.1}} className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-3xl border border-white/5 shadow-xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><DollarSign size={80}/></div>
           <p className="text-slate-400 font-bold mb-2">إجمالي الإيرادات الفعلية (المستخلصات)</p>
           <h3 className="text-3xl font-black text-white font-mono">SAR {overview.totalActualRevenue.toLocaleString(undefined, {minimumFractionDigits:2})}</h3>
        </motion.div>

        <motion.div initial={{y: 20, opacity: 0}} animate={{y: 0, opacity: 1}} transition={{delay: 0.2}} className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-3xl border border-white/5 shadow-xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-rose-500"><TrendingDown size={80}/></div>
           <p className="text-slate-400 font-bold mb-2">إجمالي التكاليف الفعلية</p>
           <h3 className="text-3xl font-black text-rose-400 font-mono">SAR {overview.totalActualCost.toLocaleString(undefined, {minimumFractionDigits:2})}</h3>
        </motion.div>

        <motion.div initial={{y: 20, opacity: 0}} animate={{y: 0, opacity: 1}} transition={{delay: 0.3}} className={`p-6 rounded-3xl border border-white/5 shadow-xl relative overflow-hidden group ${overview.grossProfit >= 0 ? 'bg-gradient-to-br from-emerald-900/40 to-slate-900' : 'bg-gradient-to-br from-rose-900/40 to-slate-900'}`}>
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-emerald-500"><TrendingUp size={80}/></div>
           <p className="text-slate-300 font-bold mb-2">إجمالي الربح / الخسارة</p>
           <h3 className={`text-3xl font-black font-mono ${overview.grossProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
             {overview.grossProfit >= 0 ? '+' : ''}SAR {overview.grossProfit.toLocaleString(undefined, {minimumFractionDigits:2})}
           </h3>
        </motion.div>

        <motion.div initial={{y: 20, opacity: 0}} animate={{y: 0, opacity: 1}} transition={{delay: 0.4}} className="bg-gradient-to-br from-indigo-900/40 to-slate-900 p-6 rounded-3xl border border-white/5 shadow-xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-indigo-500"><Activity size={80}/></div>
           <p className="text-slate-300 font-bold mb-2">متوسط هامش الربح الإجمالي</p>
           <h3 className="text-3xl font-black text-indigo-400 font-mono">
             {overview.overallMargin.toFixed(2)} %
           </h3>
        </motion.div>
      </div>

      {/* Projects List */}
      <h2 className="text-2xl font-black text-white mt-12 mb-6 flex items-center gap-3">
        <Building2 className="text-indigo-500" /> تحليل أداء المشاريع
      </h2>
      
      <div className="grid grid-cols-1 gap-6">
        {projects.map((p: any, idx: number) => {
          const isProfitable = p.actualRevenue >= p.actualCost;
          const progress = p.targetRevenue > 0 ? (p.actualRevenue / p.targetRevenue) * 100 : 0;
          
          return (
            <motion.div 
              initial={{opacity: 0, scale: 0.95}} 
              animate={{opacity: 1, scale: 1}} 
              transition={{delay: idx * 0.1}} 
              key={p.id} 
              className="bg-[#0f1015]/60 backdrop-blur-md p-6 lg:p-8 rounded-[2rem] border border-white/5 shadow-lg hover:border-indigo-500/30 transition-all group"
            >
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
                 <div>
                   <h3 className="text-2xl font-black text-white flex items-center gap-3">
                     {p.name} 
                     {isProfitable ? <CheckCircle2 className="text-emerald-500" size={24}/> : (p.actualCost > 0 && p.actualRevenue === 0) ? <AlertTriangle className="text-rose-500" size={24}/> : null}
                   </h3>
                   <span className="bg-slate-800 text-slate-300 text-xs px-3 py-1 rounded-full font-mono mt-2 inline-block font-bold">Ref: {p.code}</span>
                 </div>
                 <div className="flex gap-8">
                    <div className="text-center">
                       <p className="text-slate-500 text-xs font-bold uppercase mb-1">الربح الصافي</p>
                       <p className={`text-xl font-black font-mono ${isProfitable ? 'text-emerald-400' : 'text-rose-400'}`}>
                         {isProfitable ? '+' : ''}{(p.actualRevenue - p.actualCost).toLocaleString(undefined, {minimumFractionDigits: 0})}
                       </p>
                    </div>
                    <div className="text-center">
                       <p className="text-slate-500 text-xs font-bold uppercase mb-1">هامش الربح</p>
                       <p className={`text-xl font-black font-mono ${isProfitable ? 'text-emerald-400' : 'text-rose-400'}`}>
                         {p.profitMargin.toFixed(1)}%
                       </p>
                    </div>
                 </div>
              </div>

              {/* Progress Bars */}
              <div className="space-y-4">
                 {/* Revenue Bar */}
                 <div>
                   <div className="flex justify-between text-sm font-bold mb-2">
                     <span className="text-slate-300">الإيراد الفعلي (المستخلصات) مقابل المستهدف</span>
                     <span className="font-mono text-indigo-400">{p.actualRevenue.toLocaleString()} / {p.targetRevenue.toLocaleString()} SAR</span>
                   </div>
                   <div className="w-full bg-slate-900 rounded-full h-4 overflow-hidden border border-slate-800">
                     <div 
                       className="bg-gradient-to-r from-indigo-600 to-indigo-400 h-4 rounded-full transition-all duration-1000 ease-out" 
                       style={{width: `${Math.min(progress, 100)}%`}}
                     />
                   </div>
                 </div>
                 
                 {/* Cost Bar */}
                 <div>
                   <div className="flex justify-between text-sm font-bold mb-2">
                     <span className="text-slate-300">التكلفة الفعلية (المصروفات + المشتريات) مقابل الميزانية</span>
                     <span className="font-mono text-rose-400">{p.actualCost.toLocaleString()} / {p.estimatedBudget.toLocaleString()} SAR</span>
                   </div>
                   <div className="w-full bg-slate-900 rounded-full h-4 overflow-hidden border border-slate-800">
                     <div 
                       className="bg-gradient-to-r from-rose-600 to-rose-400 h-4 rounded-full transition-all duration-1000 ease-out" 
                       style={{width: `${Math.min(p.estimatedBudget > 0 ? (p.actualCost / p.estimatedBudget) * 100 : 0, 100)}%`}}
                     />
                   </div>
                 </div>
              </div>
            </motion.div>
          );
        })}
        {projects.length === 0 && (
          <div className="text-center py-20 text-slate-500 font-bold">لا يوجد مشاريع لعرض تحليلاتها</div>
        )}
      </div>
    </div>
  );
}
