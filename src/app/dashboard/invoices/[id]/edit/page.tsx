"use client";

import { useState, useEffect, Suspense } from "react";
import { API_BASE_URL } from "@/lib/api";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calculator, Save, ArrowRight, Loader2, Edit3, 
  Percent, Wallet, Clock, Tag, RefreshCcw, LayoutTemplate,
  Sliders, ToggleLeft
} from "lucide-react";
import axios from "axios";

export default function EditInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [boqItems, setBoqItems] = useState<any[]>([]);
  const [executionData, setExecutionData] = useState<Record<string, number>>({});
  const [contractDetails, setContractDetails] = useState<any>(null);
  const [invoice, setInvoice] = useState<any>(null);

  // Financial Options
  const [advanceDeduction, setAdvanceDeduction] = useState<number>(0);
  const [delayPenalty, setDelayPenalty] = useState<number>(0);
  const [otherDeductions, setOtherDeductions] = useState<number>(0);
  const [taxPercent, setTaxPercent] = useState<number>(15);
  const [deductionTiming, setDeductionTiming] = useState<'BEFORE_VAT' | 'AFTER_VAT'>('AFTER_VAT');
  const [deferDeductions, setDeferDeductions] = useState<boolean>(false);

  const [draftQuantities, setDraftQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    if (invoiceId) fetchInvoiceAndData();
  }, [invoiceId]);

  const fetchInvoiceAndData = async () => {
    try {
      const token = localStorage.getItem("token");
      const resInvoice = await axios.get(`${API_BASE_URL}/v1/invoices/${invoiceId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const fetchedInvoice = resInvoice.data;
      
      if (!fetchedInvoice || fetchedInvoice.status !== 'DRAFT') {
        alert("لا يمكن تعديل هذا المستخلص لأنه مسجل كمعتمد.");
        router.push("/dashboard/invoices");
        return;
      }

      setInvoice(fetchedInvoice);
      setContractDetails(fetchedInvoice.contract);
      setAdvanceDeduction(Number(fetchedInvoice.advanceDeduction) || 0);
      setDelayPenalty(Number(fetchedInvoice.delayPenalty) || 0);
      setOtherDeductions(Number(fetchedInvoice.otherDeductions) || 0);
      setTaxPercent(Number(fetchedInvoice.taxPercent) || 0);
      setDeductionTiming(fetchedInvoice.deductionTiming || 'AFTER_VAT');
      setDeferDeductions(fetchedInvoice.deferDeductions || false);

      const draftMap: Record<string, number> = {};
      const execMap: Record<string, number> = {};
      fetchedInvoice.details.forEach((detail: any) => {
        draftMap[detail.boqItemId] = Number(detail.currentQty);
        execMap[detail.boqItemId] = Number(detail.currentQty);
      });
      setDraftQuantities(draftMap);
      setExecutionData(execMap);

      const resBoq = await axios.get(`${API_BASE_URL}/v1/projects/${fetchedInvoice.projectId}/boq`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBoqItems(resBoq.data);
      
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء تحميل المستخلص.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQtyChange = (itemId: string, val: string) => {
    let parsed = parseFloat(val);
    if (isNaN(parsed)) parsed = 0;
    setExecutionData(prev => ({ ...prev, [itemId]: parsed }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payloadData = Object.keys(executionData)
      .filter(id => executionData[id] > 0)
      .map(id => ({ boqItemId: id, currentQty: executionData[id] }));

    if (payloadData.length === 0) {
      alert("الرجاء إدخال كمية منفذة واحدة على الأقل.");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_BASE_URL}/v1/invoices/${invoiceId}`,
        { executionData: payloadData, taxPercent, advanceDeduction, delayPenalty, otherDeductions, deductionTiming, deferDeductions },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      router.push(`/dashboard/invoices/${invoiceId}`);
    } catch (err: any) {
      alert(err.response?.data?.message || "حدث خطأ أثناء الحفظ.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-amber-500/20 rounded-full animate-ping absolute top-0 right-0"></div>
          <Loader2 className="animate-spin text-amber-500 relative z-10" size={80} strokeWidth={1.5} />
        </div>
        <p className="text-slate-400 mt-6 text-lg font-medium animate-pulse">جاري تجهيز بيئة التعديل الفائقة...</p>
      </div>
    );
  }

  const currentGross = boqItems.reduce((acc, item) => acc + ((executionData[item.id] || 0) * item.unitPrice), 0);
  const retentionPercent = contractDetails?.retentionPercent || 0;
  const retentionAmount = currentGross * (retentionPercent / 100);
  
  const totalDeductions = retentionAmount + Number(advanceDeduction) + Number(delayPenalty) + Number(otherDeductions);
  const taxableAmount = currentGross - retentionAmount - Number(advanceDeduction) - Number(delayPenalty) - Number(otherDeductions);
  const taxAmount = Math.max(0, taxableAmount * (taxPercent / 100));
  const expectedNet = currentGross - totalDeductions + taxAmount;

  return (
    <div className="max-w-[1500px] mx-auto space-y-8 w-full animate-in fade-in zoom-in-95 duration-500 pb-12 relative">
      {/* Absolute Glow */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <button onClick={() => router.back()} className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-slate-300 hover:text-white transition-all shadow-lg hover:-translate-x-1">
            <ArrowRight size={22} />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-l from-amber-400 to-orange-300 flex items-center gap-3 drop-shadow-sm">
              <Edit3 className="text-amber-500" size={28} />
              تعديل المستخلص #{invoice?.invoiceNumber}
            </h1>
            <p className="text-slate-400 text-sm mt-1.5 font-medium flex items-center gap-2">
              <LayoutTemplate size={14} className="text-slate-500" />
              شاشة الاحترافية لإدارة الكميات واستقطاعات المقاولين
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Table Area (Takes 3 columns on large screens) */}
        <div className="lg:col-span-3 glass-dark border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col bg-slate-900/60 relative">
          <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-amber-500 via-orange-400 to-transparent" />
          
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <RefreshCcw size={18} className="text-amber-500" /> 
              جدول حصر الأعمال المنفذة (BOQ)
            </h2>
          </div>

          <form id="edit-invoice-form" onSubmit={handleSubmit} className="flex-1 overflow-auto">
            <div className="w-full">
              <table className="w-full text-right text-sm">
                <thead className="bg-slate-900/80 sticky top-0 z-10 shadow-md backdrop-blur-md">
                  <tr>
                    <th colSpan={6} className="px-4 py-3 text-center border-b border-white/5 text-slate-300 font-semibold text-xs uppercase tracking-wider">بيانات عقد المشروع المعتمدة</th>
                    <th colSpan={2} className="px-4 py-3 text-center border-b border-r border-white/5 bg-slate-800/30 text-slate-400 font-semibold text-xs tracking-wider">الأعمال السابقة</th>
                    <th colSpan={2} className="px-4 py-3 text-center border-b border-r border-amber-500/20 bg-amber-500/10 text-amber-400 font-bold text-xs shadow-inner">المنفذ حالياً (للتعديل)</th>
                    <th colSpan={2} className="px-4 py-3 text-center border-b border-r border-white/5 bg-indigo-900/20 text-indigo-300 font-semibold text-xs tracking-wider">الإجمالي التراكمي</th>
                  </tr>
                  <tr className="bg-slate-900/50 text-[11px] text-slate-400 border-b border-white/5 uppercase tracking-widest font-mono">
                    <th className="px-3 py-2.5 text-center w-10">#</th>
                    <th className="px-4 py-2.5">وصف البند</th>
                    <th className="px-2 py-2.5 text-center">الوحدة</th>
                    <th className="px-3 py-2.5 text-center">الكمية</th>
                    <th className="px-3 py-2.5 text-center">الفئة (SAR)</th>
                    <th className="px-3 py-2.5 text-center">الإجمالي</th>

                    <th className="px-3 py-2.5 text-center border-r border-white/5">ك.سابقة</th>
                    <th className="px-3 py-2.5 text-center">ق.سابقة</th>

                    <th className="px-3 py-2.5 text-center border-r border-amber-500/20 text-amber-500/70">ك.حالية</th>
                    <th className="px-3 py-2.5 text-center text-amber-500/70">ق.حالية</th>

                    <th className="px-3 py-2.5 text-center border-r border-white/5 text-indigo-300/70">ك.إجمالي</th>
                    <th className="px-3 py-2.5 text-center text-indigo-300/70">ق.إجمالي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300 font-medium tracking-tight">
                  {boqItems.map((item, i) => {
                    const originalDraftQty = draftQuantities[item.id] || 0;
                    const previousQty = item.executedQty - originalDraftQty;
                    const previousValue = previousQty * item.unitPrice;

                    const currentQty = executionData[item.id] || 0;
                    const currentValue = currentQty * item.unitPrice;

                    const totalQty = previousQty + currentQty;
                    const totalValue = totalQty * item.unitPrice;

                    const contractTotal = item.quantity * item.unitPrice;
                    
                    // Highlights row if currently typing a quantity greater than 0
                    const isCompleted = previousQty >= item.quantity;
                    const isActive = currentQty > 0;

                    return (
                      <tr 
                        key={item.id} 
                        className={`transition-all duration-300 group ${
                          isCompleted ? 'bg-slate-900/50 opacity-40 grayscale-50 backdrop-blur-sm' : 
                          isActive ? 'bg-amber-500/[0.03] shadow-[inset_2px_0_0_rgba(245,158,11,0.5)]' : 
                          'hover:bg-white/[0.02]'
                        }`}
                      >
                        <td className="px-3 py-4 text-center text-slate-600 font-mono text-xs">
                           {isCompleted ? <div className="w-5 h-5 bg-slate-700 rounded-full mx-auto flex items-center justify-center text-[8px] text-slate-400">DONE</div> : i+1}
                        </td>
                        <td className="px-4 py-4 w-[260px]">
                          <div className="flex flex-col gap-1">
                            <span className={`truncate block leading-tight ${isCompleted ? 'text-slate-500' : isActive ? 'text-amber-100 font-semibold' : 'text-slate-200'}`} title={item.description}>
                              {item.description}
                              {isCompleted && <span className="mr-2 text-[9px] bg-slate-700 text-slate-300 px-1 rounded uppercase font-bold tracking-tighter">منتهي</span>}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono tracking-wider">{item.itemCode || 'BOQ-ITEM'}</span>
                          </div>
                        </td>
                        <td className="px-2 py-4 text-center text-slate-400">{item.unit}</td>
                        <td className="px-3 py-4 text-center font-mono text-slate-300">{item.quantity}</td>
                        <td className="px-3 py-4 text-center font-mono text-slate-400">{Number(item.unitPrice).toLocaleString()}</td>
                        <td className="px-3 py-4 text-center font-mono text-slate-500">{contractTotal.toLocaleString()}</td>

                        <td className="px-3 py-4 text-center font-mono text-slate-400 border-r border-white/5 bg-slate-900/30">{previousQty}</td>
                        <td className="px-3 py-4 text-center font-mono text-slate-500 bg-slate-900/30">{previousValue.toLocaleString()}</td>

                        {/* EDITABLE CELL - PROFESSIONAL STYLE */}
                        <td className={`px-2 py-3 text-center border-r border-amber-500/20 ${isCompleted ? 'bg-black/20' : isActive ? 'bg-amber-500/10' : 'bg-slate-900/50 group-hover:bg-slate-800/80'} transition-colors relative`}>
                          <div className="flex justify-center">
                            <input 
                              type="number" min="0" max={item.quantity - previousQty} step="any"
                              value={executionData[item.id] === undefined ? '' : executionData[item.id]}
                              onChange={(e) => handleQtyChange(item.id, e.target.value)}
                              disabled={isCompleted}
                              className={`w-16 h-8 bg-black/40 border border-slate-700/50 rounded-md text-center font-mono text-sm focus:outline-none transition-all font-bold placeholder-slate-700 ${
                                isCompleted ? 'cursor-not-allowed text-slate-600 opacity-20' : 'text-amber-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 hover:border-amber-500/30'
                              }`}
                              placeholder={isCompleted ? "DONE" : "0"}
                            />
                          </div>
                        </td>
                        <td className={`px-3 py-4 text-center font-mono font-bold ${isCompleted ? 'text-slate-700' : isActive ? 'text-amber-400 bg-amber-500/5' : 'text-slate-600 bg-slate-900/50'}`}>
                          {currentValue > 0 ? currentValue.toLocaleString() : '-'}
                        </td>

                        <td className="px-3 py-4 text-center font-mono text-indigo-300 border-r border-white/5 bg-indigo-900/10">{totalQty}</td>
                        <td className="px-3 py-4 text-center font-mono text-indigo-200 font-semibold bg-indigo-900/10">{totalValue.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </form>
        </div>

        {/* Sidebar settings */}
        <div className="lg:col-span-1 space-y-6 flex flex-col">
          
          <div className="glass-dark border border-white/10 rounded-3xl overflow-hidden shadow-xl">
            <div className="p-5 border-b border-white/5 bg-slate-900/40">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Tag size={18} className="text-emerald-400" />
                الاستقطاعات والضرائب
              </h3>
            </div>
            
            <div className="p-5 space-y-5">
              <div className="relative group">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
                  <Percent size={12} /> نسبة الضريبة (VAT)
                </label>
                <div className="relative">
                  <input 
                    type="number" min="0" max="100" 
                    value={taxPercent} 
                    onChange={e => setTaxPercent(parseFloat(e.target.value) || 0)} 
                    className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl py-2.5 px-4 text-white font-mono focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all shadow-inner group-hover:border-slate-600" 
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-mono">%</div>
                </div>
              </div>

              <div className="relative group">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
                  <Wallet size={12} /> استقطاع الدفعة المقدمة
                </label>
                <div className="relative">
                  <input 
                    type="number" min="0" step="any"
                    value={advanceDeduction} 
                    onChange={e => setAdvanceDeduction(parseFloat(e.target.value) || 0)} 
                    className="w-full bg-slate-900/80 border border-amber-500/20 rounded-xl py-2.5 px-4 text-amber-400 font-mono focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all shadow-inner group-hover:border-amber-500/40" 
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500/40 font-mono text-xs">SAR</div>
                </div>
              </div>

              <div className="relative group">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
                  <Clock size={12} /> غرامات تأخير وإخرى
                </label>
                <div className="relative">
                  <input 
                    type="number" min="0" step="any"
                    value={delayPenalty} 
                    onChange={e => setDelayPenalty(parseFloat(e.target.value) || 0)} 
                    className="w-full bg-slate-900/80 border border-rose-500/20 rounded-xl py-2.5 px-4 text-rose-400 font-mono focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 transition-all shadow-inner group-hover:border-rose-500/40" 
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-500/40 font-mono text-xs">SAR</div>
                </div>
              </div>

              {/* Deduction Timing Control */}
              <div className="pt-2 border-t border-white/5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  <Sliders size={12} /> توقيت احتساب الخصومات
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeductionTiming('BEFORE_VAT')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                      deductionTiming === 'BEFORE_VAT'
                        ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                        : 'bg-slate-900/50 border-slate-700/50 text-slate-500 hover:border-slate-600'
                    }`}
                  >
                    قبل الضريبة
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeductionTiming('AFTER_VAT')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                      deductionTiming === 'AFTER_VAT'
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                        : 'bg-slate-900/50 border-slate-700/50 text-slate-500 hover:border-slate-600'
                    }`}
                  >
                    بعد الضريبة
                  </button>
                </div>
                <p className="text-[10px] text-slate-600 mt-1.5">
                  {deductionTiming === 'BEFORE_VAT' ? '✓ الضريبة تُحسب على الصافي بعد الخصومات' : '✓ الضريبة تُحسب على الإجمالي قبل الخصومات'}
                </p>
              </div>

              {/* Defer Deductions */}
              <div className="pt-2 border-t border-white/5">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div
                    onClick={() => setDeferDeductions(!deferDeductions)}
                    className={`relative w-11 h-6 rounded-full border-2 transition-all cursor-pointer ${
                      deferDeductions
                        ? 'bg-orange-500/30 border-orange-500/60'
                        : 'bg-slate-800 border-slate-600'
                    }`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${
                      deferDeductions ? 'right-0.5 bg-orange-400' : 'left-0.5 bg-slate-500'
                    }`} />
                  </div>
                  <div>
                    <p className={`text-xs font-bold ${deferDeductions ? 'text-orange-400' : 'text-slate-400'}`}>
                      تأجيل الخصومات للمستخلص القادم
                    </p>
                    <p className="text-[10px] text-slate-600">لا تُرسل الخصومات لدفترة الآن</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="glass-dark border border-amber-500/20 rounded-3xl p-6 sticky top-24 shadow-[0_0_40px_rgba(245,158,11,0.08)]">
             <h3 className="text-sm font-bold text-amber-400 mb-5 flex items-center justify-center gap-2 uppercase tracking-wide">
               <Calculator size={16} /> ملخص الحساب النهائي الحسابي
             </h3>
             
             <div className="space-y-3.5 mb-8">
               <div className="flex justify-between items-center text-sm bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
                 <span className="text-slate-400">إجمالي كميات المستخلص</span>
                 <span className="font-mono text-white font-bold">SAR {currentGross.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
               </div>
               
               <div className="flex justify-between items-center text-sm px-2">
                 <span className="text-rose-400 flex items-center gap-1.5">محتجز أعمال ({retentionPercent}%)</span>
                 <span className="font-mono text-rose-400">- {retentionAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
               </div>

               {advanceDeduction > 0 && (
                 <div className="flex justify-between items-center text-sm px-2">
                   <span className="text-rose-300">خصم دفعة مقدمة</span>
                   <span className="font-mono text-rose-300">- {advanceDeduction.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                 </div>
               )}

               {(delayPenalty > 0 || otherDeductions > 0) && (
                 <div className="flex justify-between items-center text-sm px-2">
                   <span className="text-rose-300">أي غرامات مسجلة</span>
                   <span className="font-mono text-rose-300">- {(delayPenalty + otherDeductions).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                 </div>
               )}

               <div className="flex justify-between items-center text-sm px-2 py-2 border-y border-white/10 mt-2">
                 <span className="text-blue-400 font-medium">ضريبة القيمة المضافة</span>
                 <span className="font-mono text-blue-400 font-bold">+ {taxAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
               </div>

               <div className="pt-2 flex flex-col gap-1 text-center">
                 <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">إجمالي المستحق للمقاول</span>
                 <span className="font-mono text-emerald-400 font-black text-2xl drop-shadow-[0_0_10px_rgba(16,185,129,0.3)] bg-emerald-500/10 py-2 rounded-xl border border-emerald-500/20">
                   SAR {expectedNet.toLocaleString(undefined, {minimumFractionDigits: 2})}
                 </span>
               </div>
             </div>

             <button 
                type="submit" 
                form="edit-invoice-form"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center gap-2 px-6 py-4 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-900 shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-all hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} className="group-hover:scale-110 transition-transform" />}
                حفظ تعديلات المسودة
              </button>
          </div>
        </div>
      </div>
    </div>
  );
}
