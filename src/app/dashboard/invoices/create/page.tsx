"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Calculator, Save, ArrowRight, Loader2, PlusCircle, 
  Percent, Wallet, Clock, Tag, RefreshCcw, LayoutTemplate
} from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";
import { useLanguage } from "@/lib/i18n/context";
import {
  lineContractTotal,
  progressPercentToQty,
  qtyToProgressPercent,
  resolveBillingMode,
} from "@/lib/billingMode";

function InvoiceCreateContent() {
  const router = useRouter();
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const contractId = searchParams.get("contract");
  const projectId = searchParams.get("project");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [boqItems, setBoqItems] = useState<any[]>([]);
  const [qtyInputs, setQtyInputs] = useState<Record<string, number>>({});
  const [percentInputs, setPercentInputs] = useState<Record<string, number>>({});
  const [valueInputs, setValueInputs] = useState<Record<string, number>>({});
  const [contractDetails, setContractDetails] = useState<any>(null);
  const [coItems, setCoItems] = useState<any[]>([]);
  const [coQtyInputs, setCoQtyInputs] = useState<Record<string, number>>({});

  // Financial Options
  const [advanceDeduction, setAdvanceDeduction] = useState<number>(0);
  const [delayPenalty, setDelayPenalty] = useState<number>(0);
  const [otherDeductions, setOtherDeductions] = useState<number>(0);
  const [taxPercent, setTaxPercent] = useState<number>(15);

  useEffect(() => {
    if (!contractId || !projectId) {
      router.push("/dashboard/invoices");
      return;
    }
    fetchData();
  }, [contractId, projectId]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const resContract = await axios.get(`${API_BASE_URL}/v1/contracts/${contractId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContractDetails(resContract.data);

      const contractInvoices = resContract.data?.invoices || [];
      const executedQtyMap: Record<string, number> = {};
      contractInvoices.forEach((inv: any) => {
        const details = inv.details || [];
        details.forEach((det: any) => {
          executedQtyMap[det.boqItemId] = (executedQtyMap[det.boqItemId] || 0) + (det.currentQty || 0);
        });
      });

      if (resContract.data?.items && resContract.data.items.length > 0) {
        const mappedItems = resContract.data.items.map((ci: any) => ({
          id: ci.boqItemId,
          itemCode: ci.boqItem?.itemCode,
          description: ci.boqItem?.description,
          unit: ci.boqItem?.unit,
          billingMode: ci.boqItem?.billingMode,
          quantity: ci.assignedQty,
          unitPrice: ci.unitPrice,
          executedQty: executedQtyMap[ci.boqItemId] || 0
        }));
        setBoqItems(mappedItems);
      } else {
        const resBoq = await axios.get(`${API_BASE_URL}/v1/projects/${projectId}/boq`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const mappedItems = resBoq.data.map((item: any) => ({
          ...item,
          executedQty: executedQtyMap[item.id] || 0
        }));
        setBoqItems(mappedItems);
      }

      // Extract approved change order items not linked to BOQ items
      const changeOrders = resContract.data?.changeOrders || [];
      const standaloneCoItems: any[] = [];
      for (const co of changeOrders) {
        if (co.status === 'APPROVED') {
          for (const item of co.items || []) {
            if (!item.boqItemId) {
              standaloneCoItems.push({
                id: item.id,
                description: item.description,
                unitPrice: item.unitPrice,
                quantity: item.quantityChange,
                coTitle: co.title,
                coOrderNumber: co.orderNumber,
              });
            }
          }
        }
      }
      setCoItems(standaloneCoItems);
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء تحميل البيانات.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQtyChange = (itemId: string, val: string) => {
    let parsed = parseFloat(val);
    if (isNaN(parsed)) parsed = 0;
    setQtyInputs(prev => ({ ...prev, [itemId]: parsed }));
  };

  const handlePercentChange = (item: any, val: string) => {
    let parsed = parseFloat(val);
    if (isNaN(parsed)) parsed = 0;
    const lineTotal = lineContractTotal(item.quantity, item.unitPrice);
    setPercentInputs(prev => ({ ...prev, [item.id]: parsed }));
    setValueInputs(prev => ({
      ...prev,
      [item.id]: lineTotal > 0 ? (parsed / 100) * lineTotal : 0,
    }));
  };

  const handleValueChange = (item: any, val: string) => {
    let parsed = parseFloat(val);
    if (isNaN(parsed)) parsed = 0;
    const lineTotal = lineContractTotal(item.quantity, item.unitPrice);
    setValueInputs(prev => ({ ...prev, [item.id]: parsed }));
    setPercentInputs(prev => ({
      ...prev,
      [item.id]: lineTotal > 0 ? (parsed / lineTotal) * 100 : 0,
    }));
  };

  const buildExecutionPayload = () => {
    const rows: any[] = [];
    for (const item of boqItems) {
      const mode = resolveBillingMode(item);
      if (mode === 'LUMP_SUM_PROGRESS') {
        const pct = percentInputs[item.id] || 0;
        const val = valueInputs[item.id] || 0;
        if (pct > 0) {
          rows.push({ boqItemId: item.id, currentPercent: pct, entryMode: 'PERCENT' });
        } else if (val > 0) {
          rows.push({ boqItemId: item.id, currentValue: val, entryMode: 'VALUE' });
        }
      } else {
        const q = qtyInputs[item.id] || 0;
        if (q > 0) {
          rows.push({ boqItemId: item.id, currentQty: q, entryMode: 'QTY' });
        }
      }
    }
    return rows;
  };

  const buildCoExecutionPayload = () => {
    const rows: any[] = [];
    for (const item of coItems) {
      const q = coQtyInputs[item.id] || 0;
      if (q > 0) {
        rows.push({ changeOrderItemId: item.id, currentQty: q });
      }
    }
    return rows;
  };

  const getCurrentLineValue = (item: any) => {
    const mode = resolveBillingMode(item);
    const lineTotal = lineContractTotal(item.quantity, item.unitPrice);
    if (mode === 'LUMP_SUM_PROGRESS') {
      const pct = percentInputs[item.id] || 0;
      const val = valueInputs[item.id] || 0;
      if (pct > 0) return (pct / 100) * lineTotal;
      if (val > 0) return val;
      return 0;
    }
    return (qtyInputs[item.id] || 0) * item.unitPrice;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payloadData = buildExecutionPayload();

    if (payloadData.length === 0) {
      alert("الرجاء إدخال إنجاز واحد على الأقل (كمية أو نسبة أو قيمة) لإنشاء المستخلص.");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const coPayload = buildCoExecutionPayload();
      const res = await axios.post(
        `${API_BASE_URL}/v1/invoices/${contractId}/generate`,
        { 
          executionData: payloadData,
          changeOrderExecutions: coPayload,
          taxPercent,
          advanceDeduction,
          delayPenalty,
          otherDeductions
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      router.push(`/dashboard/invoices/${res.data.id}`);
    } catch (err: any) {
      alert(err.response?.data?.message || "حدث خطأ أثناء إنشاء المستخلص.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-emerald-500/20 rounded-full animate-ping absolute top-0 right-0"></div>
          <Loader2 className="animate-spin text-emerald-500 relative z-10" size={80} strokeWidth={1.5} />
        </div>
        <p className="text-slate-400 mt-6 text-lg font-medium animate-pulse">{t("common.loading")}</p>
      </div>
    );
  }

  const currentGross = boqItems.reduce((acc, item) => acc + getCurrentLineValue(item), 0)
    + coItems.reduce((acc, item) => acc + ((coQtyInputs[item.id] || 0) * item.unitPrice), 0);
  const retentionPercent = contractDetails?.retentionPercent || 0;
  const retentionAmount = currentGross * (retentionPercent / 100);
  
  const totalDeductions = retentionAmount + Number(advanceDeduction) + Number(delayPenalty) + Number(otherDeductions);
  const taxableAmount = currentGross - retentionAmount - Number(advanceDeduction) - Number(delayPenalty) - Number(otherDeductions);
  const taxAmount = Math.max(0, taxableAmount * (taxPercent / 100));
  const expectedNet = currentGross - totalDeductions + taxAmount;

  return (
    <div className="max-w-[1500px] mx-auto space-y-8 w-full animate-in fade-in zoom-in-95 duration-500 pb-12 relative">
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <button onClick={() => router.back()} className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-slate-300 hover:text-white transition-all shadow-lg hover:-translate-x-1">
            <ArrowRight size={22} />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-l from-emerald-400 to-teal-300 flex items-center gap-3 drop-shadow-sm">
              <PlusCircle className="text-emerald-500" size={28} />
              {t("invoice.create")}
            </h1>
            <p className="text-slate-400 text-sm mt-1.5 font-medium flex items-center gap-2">
              <LayoutTemplate size={14} className="text-slate-500" />
              {t("invoice.createSubtitle") || "شاشة احترافية لإدارة إنجازات المقاولين بصورة شفافة"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Table Area (Takes 3 columns on large screens) */}
        <div className="lg:col-span-3 glass-dark border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col bg-slate-900/60 relative">
          <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-emerald-500 via-teal-400 to-transparent" />
          
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <RefreshCcw size={18} className="text-emerald-500" /> 
              {t("invoice.boqTableTitle") || "جدول حصر الأعمال المنفذة (BOQ)"}
            </h2>
          </div>

          <form id="create-invoice-form" onSubmit={handleSubmit} className="flex-1 overflow-auto">
            <div className="w-full">
              <table className="w-full text-right text-sm">
                <thead className="bg-slate-900/80 sticky top-0 z-10 shadow-md backdrop-blur-md">
                  <tr>
                    <th colSpan={6} className="px-4 py-3 text-center border-b border-white/5 text-slate-300 font-semibold text-xs uppercase tracking-wider">{t("invoice.boqTable.contractData") || "بيانات عقد المشروع المعتمدة"}</th>
                    <th colSpan={2} className="px-4 py-3 text-center border-b border-r border-white/5 bg-slate-800/30 text-slate-400 font-semibold text-xs tracking-wider">{t("invoice.boqTable.previous")}</th>
                    <th colSpan={2} className="px-4 py-3 text-center border-b border-r border-emerald-500/20 bg-emerald-500/10 text-emerald-400 font-bold text-xs shadow-inner">{t("invoice.boqTable.current")}</th>
                    <th colSpan={2} className="px-4 py-3 text-center border-b border-r border-white/5 bg-indigo-900/20 text-indigo-300 font-semibold text-xs tracking-wider">{t("invoice.boqTable.total")}</th>
                  </tr>
                  <tr className="bg-slate-900/50 text-[11px] text-slate-400 border-b border-white/5 uppercase tracking-widest font-mono">
                    <th className="px-3 py-2.5 text-center w-10">#</th>
                    <th className="px-4 py-2.5">{t("invoice.boqTable.item")}</th>
                    <th className="px-2 py-2.5 text-center">{t("invoice.boqTable.unit") || "الوحدة"}</th>
                    <th className="px-3 py-2.5 text-center">{t("invoice.boqTable.qty") || "الكمية"}</th>
                    <th className="px-3 py-2.5 text-center">{t("invoice.boqTable.category")}</th>
                    <th className="px-3 py-2.5 text-center">{t("invoice.boqTable.total")}</th>

                    <th className="px-3 py-2.5 text-center border-r border-white/5">{t("invoice.boqTable.prevQty") || "ك.سابقة"}</th>
                    <th className="px-3 py-2.5 text-center">{t("invoice.boqTable.prevValue") || "ق.سابقة"}</th>

                    <th className="px-3 py-2.5 text-center border-r border-emerald-500/20 text-emerald-500/70">{t("invoice.boqTable.currentQty") || "ك.حالية"}</th>
                    <th className="px-3 py-2.5 text-center text-emerald-500/70">{t("invoice.boqTable.currentValue")}</th>

                    <th className="px-3 py-2.5 text-center border-r border-white/5 text-indigo-300/70">{t("invoice.boqTable.totalQty") || "ك.إجمالي"}</th>
                    <th className="px-3 py-2.5 text-center text-indigo-300/70">{t("invoice.boqTable.totalValue") || "ق.إجمالي"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300 font-medium tracking-tight">
                  {boqItems.map((item, i) => {
                    const billingMode = resolveBillingMode(item);
                    const isLumpSum = billingMode === 'LUMP_SUM_PROGRESS';
                    const contractTotal = lineContractTotal(item.quantity, item.unitPrice);

                    const previousQty = item.executedQty;
                    const previousValue = previousQty * item.unitPrice;
                    const previousPercent = qtyToProgressPercent(previousQty, item.quantity);

                    const currentQty = isLumpSum
                      ? progressPercentToQty(percentInputs[item.id] || 0, item.quantity)
                      : (qtyInputs[item.id] || 0);
                    const currentValue = getCurrentLineValue(item);

                    const totalQty = previousQty + currentQty;
                    const totalValue = previousQty * item.unitPrice + currentValue;
                    const totalPercent = qtyToProgressPercent(totalQty, item.quantity);
                    const remainingPercent = Math.max(0, 100 - previousPercent);
                    
                    const isCompleted = previousQty >= item.quantity - 1e-9;
                    const isActive = currentValue > 0;

                    return (
                      <tr 
                        key={item.id} 
                        className={`transition-all duration-300 group ${
                          isCompleted ? 'bg-slate-900/50 opacity-40 grayscale-50 backdrop-blur-sm' : 
                          isActive ? 'bg-emerald-500/[0.03] shadow-[inset_2px_0_0_rgba(16,185,129,0.5)]' : 
                          'hover:bg-white/[0.02]'
                        }`}
                      >
                        <td className="px-3 py-4 text-center text-slate-600 font-mono text-xs">
                          {isCompleted ? <div className="w-5 h-5 bg-slate-700 rounded-full mx-auto flex items-center justify-center text-[8px] text-slate-400">DONE</div> : i+1}
                        </td>
                        <td className="px-4 py-4 w-[260px]">
                          <div className="flex flex-col gap-1">
                            <span className={`truncate block leading-tight ${isCompleted ? 'text-slate-500' : isActive ? 'text-emerald-100 font-semibold' : 'text-slate-200'}`} title={item.description}>
                              {item.description}
                              {isCompleted && <span className="mr-2 text-[9px] bg-slate-700 text-slate-300 px-1 rounded uppercase font-bold tracking-tighter">{t("common.completed") || "منتهي"}</span>}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono tracking-wider">{item.itemCode || 'BOQ-ITEM'}</span>
                          </div>
                        </td>
                        <td className="px-2 py-4 text-center text-slate-400">
                          {item.unit}
                          {isLumpSum && (
                            <span className="block text-[9px] text-amber-400/80 mt-0.5">{t("invoice.lumpSum") || "مقطوعية"}</span>
                          )}
                        </td>
                        <td className="px-3 py-4 text-center font-mono text-slate-300">{item.quantity}</td>
                        <td className="px-3 py-4 text-center font-mono text-slate-400">{Number(item.unitPrice).toLocaleString()}</td>
                        <td className="px-3 py-4 text-center font-mono text-slate-500">{contractTotal.toLocaleString()}</td>

                        <td className="px-3 py-4 text-center font-mono text-slate-400 border-r border-white/5 bg-slate-900/30">
                          {isLumpSum ? `${previousPercent.toFixed(1)}%` : previousQty}
                        </td>
                        <td className="px-3 py-4 text-center font-mono text-slate-500 bg-slate-900/30">{previousValue.toLocaleString()}</td>

                        {/* EDITABLE CELL */}
                        <td className={`px-2 py-3 text-center border-r border-emerald-500/20 ${isCompleted ? 'bg-black/20' : isActive ? 'bg-emerald-500/10' : 'bg-slate-900/50 group-hover:bg-slate-800/80'} transition-colors relative`}>
                          <div className="flex justify-center">
                            {isLumpSum ? (
                              <div className="flex flex-col gap-1 items-center">
                                <input
                                  type="number"
                                  min="0"
                                  max={remainingPercent}
                                  step="any"
                                  value={percentInputs[item.id] === undefined ? '' : percentInputs[item.id]}
                                  onChange={(e) => handlePercentChange(item, e.target.value)}
                                  disabled={isCompleted}
                                  className="w-14 h-7 bg-black/40 border border-slate-700/50 rounded-md text-center font-mono text-xs text-emerald-400 focus:border-emerald-500 focus:outline-none"
                                  placeholder="%"
                                  title="نسبة الإنجاز الحالية"
                                />
                                <input
                                  type="number"
                                  min="0"
                                  max={contractTotal - previousValue}
                                  step="any"
                                  value={valueInputs[item.id] === undefined ? '' : valueInputs[item.id]}
                                  onChange={(e) => handleValueChange(item, e.target.value)}
                                  disabled={isCompleted}
                                  className="w-20 h-7 bg-black/40 border border-slate-700/50 rounded-md text-center font-mono text-[10px] text-teal-300 focus:border-teal-500 focus:outline-none"
                                  placeholder="قيمة"
                                  title="قيمة المستخلص الحالية"
                                />
                              </div>
                            ) : (
                              <input 
                                type="number" min="0" max={item.quantity - previousQty} step="any"
                                value={qtyInputs[item.id] === undefined ? '' : qtyInputs[item.id]}
                                onChange={(e) => handleQtyChange(item.id, e.target.value)}
                                disabled={isCompleted}
                                className={`w-16 h-8 bg-black/40 border border-slate-700/50 rounded-md text-center font-mono text-sm focus:outline-none transition-all font-bold placeholder-slate-700 ${
                                  isCompleted ? 'cursor-not-allowed text-slate-600 opacity-20' : 'text-emerald-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 hover:border-emerald-500/30'
                                }`}
                                placeholder={isCompleted ? "DONE" : "0"}
                              />
                            )}
                          </div>
                        </td>
                        <td className={`px-3 py-4 text-center font-mono font-bold ${isCompleted ? 'text-slate-700' : isActive ? 'text-emerald-400 bg-emerald-500/5' : 'text-slate-600 bg-slate-900/50'}`}>
                          {currentValue > 0 ? currentValue.toLocaleString() : '-'}
                        </td>

                        <td className="px-3 py-4 text-center font-mono text-indigo-300 border-r border-white/5 bg-indigo-900/10">
                          {isLumpSum ? `${totalPercent.toFixed(1)}%` : totalQty}
                        </td>
                        <td className="px-3 py-4 text-center font-mono text-indigo-200 font-semibold bg-indigo-900/10">{totalValue.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                  {coItems.length > 0 && (
                    <tr className="bg-amber-500/5 border-t-2 border-amber-500/30">
                      <td colSpan={12} className="px-4 py-3 text-amber-400 font-bold text-sm flex items-center gap-2">
                        <span className="inline-block w-2 h-2 bg-amber-400 rounded-full" />
                        {t("invoice.changeOrders") || "أعمال الأوامر التغييرية (Change Orders) المعتمدة"}
                      </td>
                    </tr>
                  )}
                  {coItems.map((item, i) => {
                    const coQty = coQtyInputs[item.id] || 0;
                    const coValue = coQty * item.unitPrice;
                    const isActive = coQty > 0;

                    return (
                      <tr key={item.id} className={`transition-all duration-300 group ${isActive ? 'bg-amber-500/[0.03]' : 'hover:bg-white/[0.02]'}`}>
                        <td className="px-3 py-4 text-center text-amber-600 font-mono text-xs">CO{i+1}</td>
                        <td className="px-4 py-4 w-[260px]">
                          <div className="flex flex-col gap-1">
                            <span className="truncate block leading-tight text-amber-100 font-semibold" title={item.description}>
                              {item.description}
                            </span>
                            <span className="text-[10px] text-amber-500/60 font-mono tracking-wider">{item.coOrderNumber} - {item.coTitle}</span>
                          </div>
                        </td>
                        <td className="px-2 py-4 text-center text-slate-400">---</td>
                        <td className="px-3 py-4 text-center font-mono text-amber-300">{item.quantity}</td>
                        <td className="px-3 py-4 text-center font-mono text-amber-400">{Number(item.unitPrice).toLocaleString()}</td>
                        <td className="px-3 py-4 text-center font-mono text-amber-500">{(item.quantity * item.unitPrice).toLocaleString()}</td>
                        <td className="px-3 py-4 text-center font-mono text-slate-500 border-r border-white/5 bg-slate-900/30">0</td>
                        <td className="px-3 py-4 text-center font-mono text-slate-500 bg-slate-900/30">0</td>
                        <td className="px-2 py-3 text-center border-r border-amber-500/20 bg-amber-500/5">
                          <div className="flex justify-center">
                            <input
                              type="number" min="0" max={item.quantity} step="any"
                              value={coQtyInputs[item.id] === undefined ? '' : coQtyInputs[item.id]}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                setCoQtyInputs(prev => ({ ...prev, [item.id]: val }));
                              }}
                              className="w-16 h-8 bg-black/40 border border-amber-500/30 rounded-md text-center font-mono text-sm text-amber-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                              placeholder="0"
                            />
                          </div>
                        </td>
                        <td className={`px-3 py-4 text-center font-mono font-bold ${isActive ? 'text-amber-400 bg-amber-500/5' : 'text-slate-600 bg-slate-900/50'}`}>
                          {coValue > 0 ? coValue.toLocaleString() : '-'}
                        </td>
                        <td className="px-3 py-4 text-center font-mono text-amber-300 border-r border-white/5 bg-amber-900/10">{coQty}</td>
                        <td className="px-3 py-4 text-center font-mono text-amber-200 font-semibold bg-amber-900/10">{coValue.toLocaleString()}</td>
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
                {t("invoice.deductionsAndTax") || "الاستقطاعات والضرائب"}
              </h3>
            </div>
            
            <div className="p-5 space-y-5">
              <div className="relative group">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
                  <Percent size={12} /> {t("invoice.taxPercent") || "نسبة الضريبة (VAT)"}
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
                  <Wallet size={12} /> {t("invoice.advanceDeduction") || "استقطاع الدفعة المقدمة"}
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
                  <Clock size={12} /> {t("invoice.delayPenalty") || "غرامات تأخير وإخرى"}
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
            </div>
          </div>

          <div className="glass-dark border border-emerald-500/20 rounded-3xl p-6 sticky top-24 shadow-[0_0_40px_rgba(16,185,129,0.08)]">
             <h3 className="text-sm font-bold text-emerald-400 mb-5 flex items-center justify-center gap-2 uppercase tracking-wide">
                <Calculator size={16} /> {t("invoice.financialSummary.gross") || "ملخص الحساب المبدئي"}
              </h3>
             
             <div className="space-y-3.5 mb-8">
                <div className="flex justify-between items-center text-sm bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
                  <span className="text-slate-400">{t("invoice.financialSummary.gross") || "إجمالي كميات المستخلص"}</span>
                  <span className="font-mono text-white font-bold">SAR {currentGross.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                </div>
               
                <div className="flex justify-between items-center text-sm px-2">
                  <span className="text-rose-400 flex items-center gap-1.5">{t("invoice.financialSummary.retention") || `محتجز أعمال (${retentionPercent}%)`}</span>
                  <span className="font-mono text-rose-400">- {retentionAmount.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                </div>

                {advanceDeduction > 0 && (
                  <div className="flex justify-between items-center text-sm px-2">
                    <span className="text-rose-300">{t("invoice.advanceDeduction") || "خصم دفعة مقدمة"}</span>
                    <span className="font-mono text-rose-300">- {advanceDeduction.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                  </div>
                )}

                {(delayPenalty > 0 || otherDeductions > 0) && (
                  <div className="flex justify-between items-center text-sm px-2">
                    <span className="text-rose-300">{t("invoice.financialSummary.otherDeductions") || "أي غرامات مسجلة"}</span>
                    <span className="font-mono text-rose-300">- {(delayPenalty + otherDeductions).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-sm px-2 py-2 border-y border-white/10 mt-2">
                  <span className="text-blue-400 font-medium">{t("invoice.financialSummary.tax") || "ضريبة القيمة المضافة"}</span>
                  <span className="font-mono text-blue-400 font-bold">+ {taxAmount.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                </div>

                <div className="pt-2 flex flex-col gap-1 text-center">
                  <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">{t("invoice.financialSummary.net") || "إجمالي المستحق للمقاول"}</span>
                 <span className="font-mono text-emerald-400 font-black text-2xl drop-shadow-[0_0_10px_rgba(16,185,129,0.3)] bg-emerald-500/10 py-2 rounded-xl border border-emerald-500/20">
                   SAR {expectedNet.toLocaleString('en-US', {minimumFractionDigits: 2})}
                 </span>
               </div>
             </div>

             <button 
                type="submit" 
                form="create-invoice-form"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center gap-2 px-6 py-4 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-900 shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} className="group-hover:scale-110 transition-transform" />}
                {t("common.save")}
              </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InvoiceCreatePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="animate-spin text-emerald-500" size={48} /></div>}>
      <InvoiceCreateContent />
    </Suspense>
  );
}
