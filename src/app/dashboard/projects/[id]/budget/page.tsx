"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  AlertCircle,
  Loader2,
  DollarSign,
  BriefcaseBusiness,
  CreditCard,
  Building2,
  FileCheck2,
  RefreshCcw,
  Target
} from "lucide-react";
import axios from "axios";

export default function ProjectBudgetDashboard() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (projectId) fetchBudget();
  }, [projectId]);

  const fetchBudget = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const res = await axios.get(`${API_BASE_URL}/v1/projects/${projectId}/budget-report`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء تحميل بيانات الموازنة.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-indigo-500/20 rounded-full animate-ping absolute top-0 right-0"></div>
          <Loader2 className="animate-spin text-indigo-500 relative z-10" size={96} strokeWidth={1} />
        </div>
        <p className="text-slate-400 mt-6 text-xl font-bold animate-pulse">جاري جمع البيانات المالية للمشروع...</p>
      </div>
    );
  }

  if (!data) return null;

  const { project, estimatedBudget, targetRevenue, actualTotalCost, actualRevenue, breakdown, variances, boqAnalysis } = data;

  const expectedProfit = targetRevenue - estimatedBudget;
  const expectedProfitMargin = targetRevenue > 0 ? (expectedProfit / targetRevenue) * 100 : 0;
  
  const currentProfit = actualRevenue - actualTotalCost;
  const currentProfitMargin = actualRevenue > 0 ? (currentProfit / actualRevenue) * 100 : 0;

  const costSpentPercent = estimatedBudget > 0 ? Math.min(100, (actualTotalCost / estimatedBudget) * 100) : 0;
  const isOverBudget = actualTotalCost > estimatedBudget;

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 w-full animate-in fade-in zoom-in-95 duration-500 pb-12 relative">
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <button onClick={() => router.back()} className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-slate-300 hover:text-white transition-all shadow-lg hover:-translate-x-1">
            <ArrowRight size={22} />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3 drop-shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-blue-500/10 flex items-center justify-center border border-indigo-500/20 shadow-lg">
                <PieChart className="text-indigo-400" size={24} />
              </div>
              الموازنة والتحكم بالتكاليف
            </h1>
            <p className="text-slate-400 text-sm mt-2 font-medium flex items-center gap-2">
              <Building2 size={14} className="text-slate-500" />
              مشروع: <span className="text-indigo-300 mx-1">{project.name}</span> ({project.code})
            </p>
          </div>
        </div>
        
        <button onClick={fetchBudget} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all">
          <RefreshCcw size={16} /> تحديث مباشر
        </button>
      </div>

      {/* Macro Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue Card */}
        <div className="glass-dark border border-white/5 p-6 rounded-3xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all" />
           <p className="text-slate-400 font-bold text-sm mb-4 flex items-center gap-2 uppercase tracking-wide">
             <Target size={18} className="text-blue-400" /> الإيرادات (Revenue)
           </p>
           <div className="space-y-4 relative z-10">
              <div>
                 <p className="text-[10px] text-slate-500 font-black tracking-widest uppercase">الإيراد المستهدف (قيمة العقد)</p>
                 <p className="text-2xl font-mono font-black text-white">SAR {targetRevenue.toLocaleString()}</p>
              </div>
              <div className="h-px w-full bg-white/10" />
              <div>
                 <p className="text-[10px] text-slate-500 font-black tracking-widest uppercase">تم تحقيقه عبر المستخلصات</p>
                 <p className="text-lg font-mono font-bold text-blue-400">SAR {actualRevenue.toLocaleString()}</p>
                 <p className="text-xs text-blue-500/70 mt-1 font-mono">{targetRevenue > 0 ? ((actualRevenue/targetRevenue)*100).toFixed(1) : 0}% من المستهدف</p>
              </div>
           </div>
        </div>

        {/* Budget/Cost Card */}
        <div className={`glass-dark border p-6 rounded-3xl relative overflow-hidden group transition-all ${isOverBudget ? 'border-rose-500/30' : 'border-emerald-500/20'}`}>
           <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl transition-all ${isOverBudget ? 'bg-rose-500/10 group-hover:bg-rose-500/20' : 'bg-emerald-500/10 group-hover:bg-emerald-500/20'}`} />
           <p className="text-slate-400 font-bold text-sm mb-4 flex items-center gap-2 uppercase tracking-wide">
             <Wallet size={18} className={isOverBudget ? "text-rose-400" : "text-emerald-400"} /> التكلفة (Cost & Budget)
           </p>
           <div className="space-y-4 relative z-10">
              <div>
                 <p className="text-[10px] text-slate-500 font-black tracking-widest uppercase">الموازنة المخططة (الإنفاق المسموح)</p>
                 <p className="text-2xl font-mono font-black text-white">SAR {estimatedBudget.toLocaleString()}</p>
              </div>
              <div className="h-px w-full bg-white/10" />
              <div>
                 <p className="text-[10px] text-slate-500 font-black tracking-widest uppercase mb-1">الإنفاق الفعلي إلى الآن</p>
                 <div className="flex items-end gap-2">
                    <p className={`text-xl font-mono font-black ${isOverBudget ? 'text-rose-400' : 'text-emerald-400'}`}>SAR {actualTotalCost.toLocaleString()}</p>
                    {isOverBudget && <AlertCircle size={14} className="text-rose-500 mb-1" title="تجاوز الميزانية!" />}
                 </div>
                 
                 <div className="mt-3 bg-slate-900/80 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div className={`h-full rounded-full transition-all duration-1000 ${isOverBudget ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${costSpentPercent}%` }} />
                 </div>
                 <p className="text-xs text-slate-500 mt-1.5 flex justify-between font-mono">
                    <span>{costSpentPercent.toFixed(1)}% تم إنفاقه</span>
                    <span className={variances.costVariance < 0 ? 'text-rose-400' : 'text-emerald-400'}>المتبقي: {Math.max(0, variances.costVariance).toLocaleString()}</span>
                 </p>
              </div>
           </div>
        </div>

        {/* Expected Net Profit */}
        <div className="glass-dark border border-white/5 p-6 rounded-3xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all" />
           <p className="text-amber-400 font-bold text-sm mb-4 flex items-center gap-2 uppercase tracking-wide">
             <TrendingUp size={18} /> الأرباح المخططة (Expected)
           </p>
           <div className="space-y-4 relative z-10">
              <div>
                 <p className="text-[10px] text-slate-500 font-black tracking-widest uppercase">إجمالي الربح المتوقع</p>
                 <p className="text-3xl font-mono font-black text-amber-500">
                    {expectedProfit > 0 ? '+' : ''}{expectedProfit.toLocaleString()}
                 </p>
              </div>
              <div className="bg-amber-500/10 py-3 px-4 rounded-xl border border-amber-500/20">
                 <p className="text-[10px] text-amber-500/80 font-black tracking-widest uppercase mb-1">نسبة هامش الربح المتوقع</p>
                 <p className="text-xl font-mono font-black text-amber-400">{expectedProfitMargin.toFixed(2)}%</p>
                 <p className="text-[10px] text-amber-500/50 mt-1">تُحسب بناءً على الأسعار والموازنة الابتدائية</p>
              </div>
           </div>
        </div>

        {/* Current Net Profit */}
        <div className="glass-dark border border-white/5 p-6 rounded-3xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all" />
           <p className="text-indigo-400 font-bold text-sm mb-4 flex items-center gap-2 uppercase tracking-wide">
             <DollarSign size={18} /> الأرباح الفعلية حالياً
           </p>
           <div className="space-y-4 relative z-10">
              <div>
                 <p className="text-[10px] text-slate-500 font-black tracking-widest uppercase">المركز المالي الحالي (مدخول - مصروف)</p>
                 <p className={`text-3xl font-mono font-black ${currentProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {currentProfit > 0 ? '+' : ''}{currentProfit.toLocaleString()}
                 </p>
              </div>
              <div className={`py-3 px-4 rounded-xl border ${currentProfit >= 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
                 <p className={`text-[10px] font-black tracking-widest uppercase mb-1 ${currentProfit >= 0 ? 'text-emerald-500/80' : 'text-rose-500/80'}`}>هامش الربح الفعلي حالياً</p>
                 <p className={`text-xl font-mono font-black ${currentProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {currentProfitMargin.toFixed(2)}%
                 </p>
                 <p className={`text-[10px] mt-1 ${currentProfit >= 0 ? 'text-emerald-500/50' : 'text-rose-500/50'}`}>يبدأ بالاستقرار مع تقدم التنفيذ والمطالبات</p>
              </div>
           </div>
        </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Costs Breakdown */}
         <div className="lg:col-span-1 glass-dark border border-white/5 rounded-3xl p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
              <PieChart size={20} className="text-purple-400" /> تحليل التكاليف الفعلية
            </h3>

            <div className="space-y-4">
               {/* Materials / POs */}
               <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                     <BriefcaseBusiness size={20} />
                  </div>
                  <div className="w-full">
                     <p className="text-slate-400 text-xs font-bold mb-1">تكلفة توريد المواد (مشتريات)</p>
                     <p className="text-lg font-mono font-black text-white">SAR {breakdown.poCost.toLocaleString()}</p>
                     <p className="text-[10px] text-slate-500 uppercase flex justify-between mt-1">
                        <span>أوامر الشراء المعتمدة</span>
                        <span className="font-mono text-purple-400">{actualTotalCost > 0 ? ((breakdown.poCost/actualTotalCost)*100).toFixed(0) : 0}%</span>
                     </p>
                  </div>
               </div>

               {/* Subcontractors */}
               <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                     <FileCheck2 size={20} />
                  </div>
                  <div className="w-full">
                     <p className="text-slate-400 text-xs font-bold mb-1">مقاولون الباطن (مصنعيات / شامل)</p>
                     <p className="text-lg font-mono font-black text-white">SAR {breakdown.subcontractorCosts.toLocaleString()}</p>
                     <p className="text-[10px] text-slate-500 uppercase flex justify-between mt-1">
                        <span>مستخلصات المقاولين المعتمدة</span>
                        <span className="font-mono text-orange-400">{actualTotalCost > 0 ? ((breakdown.subcontractorCosts/actualTotalCost)*100).toFixed(0) : 0}%</span>
                     </p>
                  </div>
               </div>

               {/* Petty Cash */}
               <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                     <CreditCard size={20} />
                  </div>
                  <div className="w-full">
                     <p className="text-slate-400 text-xs font-bold mb-1">المصروفات النثرية واللوجستية</p>
                     <p className="text-lg font-mono font-black text-white">SAR {breakdown.expensesCost.toLocaleString()}</p>
                     <p className="text-[10px] text-slate-500 flex justify-between mt-1">
                        <span>الإعاشة، المحروقات، ونثريات الموقع</span>
                        <span className="font-mono text-emerald-400">{actualTotalCost > 0 ? ((breakdown.expensesCost/actualTotalCost)*100).toFixed(0) : 0}%</span>
                     </p>
                  </div>
               </div>
            </div>
         </div>

         {/* BOQ Analysis Table */}
         <div className="lg:col-span-2 glass-dark border border-white/5 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
              <TrendingDown size={20} className="text-indigo-400" /> تحليل ربحية بنود دراسة الجدوى (BOQ)
            </h3>
            
            <div className="flex-1 overflow-auto custom-scrollbar">
               <table className="w-full text-right text-sm">
                  <thead className="bg-slate-900/80 sticky top-0 z-10 backdrop-blur-md">
                     <tr>
                        <th className="px-4 py-3 text-slate-400 font-bold text-xs uppercase w-12 border-b border-white/5">كود</th>
                        <th className="px-4 py-3 text-slate-400 font-bold text-xs uppercase border-b border-white/5">بيان الأعمال</th>
                        <th className="px-4 py-3 text-slate-400 font-bold text-xs uppercase border-b border-white/5 text-center">تكلفة الوحدة (مقَدر)</th>
                        <th className="px-4 py-3 text-slate-400 font-bold text-xs uppercase border-b border-white/5 text-center bg-indigo-500/5">سعر بيع الوحدة</th>
                        <th className="px-4 py-3 text-slate-400 font-bold text-xs uppercase border-b border-white/5 text-left bg-indigo-500/10">الربح للوحدة</th>
                        <th className="px-4 py-3 text-slate-400 font-bold text-xs uppercase border-b border-white/5 text-left">قيمة البند المتوقعة</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                     {boqAnalysis.map((item: any, i: number) => {
                       const profitPerUnit = item.unitPrice - item.estimatedUnitCost;
                       const isLoss = profitPerUnit < 0;
                       
                       return (
                         <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                            <td className="px-4 py-3 font-mono text-xs text-slate-500">{item.itemCode || i+1}</td>
                            <td className="px-4 py-3 min-w-[200px]">
                               <p className="font-bold text-white text-xs" title={item.description}>{item.description}</p>
                            </td>
                            <td className="px-4 py-3 font-mono text-center text-amber-400">{item.estimatedUnitCost.toLocaleString()}</td>
                            <td className="px-4 py-3 font-mono text-center text-blue-400 bg-indigo-500/5 font-bold border-r border-white/5">{item.unitPrice.toLocaleString()}</td>
                            <td className="px-4 py-3 font-mono text-left bg-indigo-500/10 font-bold border-r border-white/5">
                              <span className={isLoss ? 'text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded' : 'text-emerald-400'}>
                                 {isLoss ? '' : '+'}{profitPerUnit.toLocaleString()}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-mono text-left font-bold border-r border-white/5">{item.totalValue.toLocaleString()}</td>
                         </tr>
                       );
                     })}
                  </tbody>
               </table>
            </div>
            <div className="pt-4 border-t border-white/5 mt-4 text-xs font-medium text-slate-500 text-center">
              تعرض هذه القائمة تحليل الربحية الأساسي المبني على (عروض الأسعار المعتمدة).
            </div>
         </div>
      </div>
    </div>
  );
}
