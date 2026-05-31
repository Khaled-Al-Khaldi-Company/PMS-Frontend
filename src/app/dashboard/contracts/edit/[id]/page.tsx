"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  FileSignature, Save, ArrowRight, Loader2, PlusCircle,
  Crown, HardHat, Building2, Edit3, AlertTriangle, Plus, Printer, Trash2
} from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/apiErrors";
import { useDownloadPdf } from "@/hooks/useDownloadPdf";
import PrintLetterhead from "@/app/dashboard/components/PrintLetterhead";

export default function EditContractPage() {
  const router = useRouter();
  const params = useParams();
  const contractId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [contract, setContract] = useState<any>(null);

  const { pdfRef, downloadPdf } = useDownloadPdf();
  const [projectBoq, setProjectBoq] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [showBoqSelector, setShowBoqSelector] = useState(false);

  const [formData, setFormData] = useState({
    projectId: "",
    type: "MAIN_CONTRACT",
    referenceNumber: "",
    retentionPercent: 5,
    advancePayment: 10,
    scope: "",
  });

  useEffect(() => {
    if (contractId) fetchContract();
  }, [contractId]);

  const fetchContract = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/v1/contracts/${contractId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const c = res.data;
      setContract(c);
      setFormData({
        projectId: c.projectId || "",
        type: c.type || "MAIN_CONTRACT",
        referenceNumber: c.referenceNumber || "",
        retentionPercent: Number(c.retentionPercent) || 5,
        advancePayment: Number(c.advancePayment) || 10,
        scope: c.scope || "",
      });

      // Map existing items
      if (c.items && c.items.length > 0) {
        setSelectedItems(c.items.map((it: any) => ({
          boqItemId: it.boqItemId,
          description: it.boqItem?.description || "",
          unit: it.boqItem?.unit || "",
          assignedQty: Number(it.assignedQty),
          unitPrice: Number(it.unitPrice),
        })));
      }

      if (c.projectId) {
        fetchProjectBoq(c.projectId);
      }
    } catch (err) {
      alert("لم يتم العثور على العقد.");
      router.push("/dashboard/contracts");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProjectBoq = async (pid: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/v1/projects/${pid}/boq`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjectBoq(res.data);
    } catch (err) {}
  };

  const handleAddItem = (item: any) => {
    if (selectedItems.find(it => it.boqItemId === item.id)) return;
    
    const committedToOthers = (item.contractItems || [])
      .filter((ci: any) => ci.contract?.type === formData.type && ci.contractId !== contractId)
      .reduce((acc: any, ci: any) => acc + Number(ci.assignedQty), 0);
    const remaining = Math.max(0, item.quantity - committedToOthers);

    const defaultPrice = formData.type === "SUBCONTRACT" ? (item.subcontractorPrice || 0) : item.unitPrice;

    setSelectedItems([...selectedItems, {
      boqItemId: item.id,
      description: item.description,
      unit: item.unit,
      assignedQty: remaining,
      unitPrice: defaultPrice, 
    }]);
    setShowBoqSelector(false);
  };

  const removeItem = (id: string) => {
    setSelectedItems(selectedItems.filter(it => it.boqItemId !== id));
  };

  const updateItemValue = (id: string, field: string, value: string) => {
    setSelectedItems(prev => prev.map(it => 
      it.boqItemId === id ? { ...it, [field]: value } : it
    ));
  };

  const calculatedTotal = selectedItems.reduce((acc, it) => acc + (Number(it.assignedQty) * Number(it.unitPrice)), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      const payload: Record<string, unknown> = {
        referenceNumber: formData.referenceNumber,
        retentionPercent: formData.retentionPercent,
        advancePayment: formData.advancePayment,
        totalValue: calculatedTotal,
      };
      if (!hasInvoices) {
        payload.items = selectedItems;
      }

      await axios.patch(
        `${API_BASE_URL}/v1/contracts/${contractId}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      router.push("/dashboard/contracts");
    } catch (err: unknown) {
      alert(getApiErrorMessage(err, "خطأ أثناء حفظ التعديلات على العقد."));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-orange-500" size={48} />
      </div>
    );
  }

  const hasInvoices = (contract?.invoices?.length || 0) > 0;
  const isMain = contract?.type === "MAIN_CONTRACT";
  const partyName = isMain
    ? (contract?.project?.client?.name || "الجهة المالكة (قيد التجهيز)")
    : (contract?.subcontractor?.name || "—");

  return (
    <>
    <div className="max-w-3xl mx-auto space-y-6 w-full animate-in fade-in zoom-in-95 duration-500 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/dashboard/contracts")}
          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
        >
          <ArrowRight size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Edit3 className={isMain ? "text-indigo-400" : "text-amber-400"} size={24} />
            تعديل العقد
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            تعديل البيانات المالية والمرجعية للعقد
          </p>
        </div>
        <button type="button" onClick={() => downloadPdf(`Contract_${contract?.referenceNumber || 'draft'}.pdf`)} className="flex items-center gap-2 px-5 py-2.5 bg-rose-800 hover:bg-rose-700 text-rose-300 rounded-xl transition-colors border border-rose-700 shadow-lg font-medium mr-auto">
          <Printer size={18} /> PDF
        </button>
      </div>

      {/* Contract Info Banner */}
      <div className={`rounded-2xl border p-4 flex items-center gap-4 ${
        isMain
          ? "bg-indigo-500/5 border-indigo-500/20"
          : "bg-amber-500/5 border-amber-500/20"
      }`}>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
          isMain
            ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
            : "bg-amber-500/10 border-amber-500/20 text-amber-400"
        }`}>
          {isMain ? <Crown size={22} /> : <HardHat size={22} />}
        </div>
        <div>
          <div className={`text-xs font-bold mb-1 flex items-center gap-1.5 ${
            isMain ? "text-indigo-300" : "text-amber-300"
          }`}>
            {isMain ? "عقد رئيسي مع المالك — المستخلصات تُعد إيراداً" : "عقد مقاول باطن — المستخلصات تُعد تكلفة"}
          </div>
          <div className="flex items-center gap-2">
            {isMain ? <Building2 size={15} className="text-slate-400" /> : <HardHat size={15} className="text-slate-400" />}
            <span className="font-bold text-white">{partyName}</span>
            <span className="text-slate-500 font-mono text-sm">| REF: {contract?.referenceNumber}</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            المشروع: {contract?.project?.name} ({contract?.project?.code})
          </p>
        </div>
      </div>

      {/* Warning if has invoices */}
      {hasInvoices && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-300 font-bold text-sm">
              هذا العقد مرتبط بـ {contract.invoices.length} مستخلص — تعديل البنود غير مسموح
            </p>
            <p className="text-slate-400 text-xs mt-1">
              يمكنك تعديل الرقم المرجعي، نسبة الضمان، والدفعة المقدمة فقط. لحفظ بنود العقد يجب عدم وجود أي مستخلص.
            </p>
          </div>
        </div>
      )}

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-dark border border-white/5 rounded-3xl p-6 sm:p-8"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Reference Number */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">رقم العقد المرجعي (REF)</label>
              <input
                type="text"
                required
                value={formData.referenceNumber}
                onChange={e => setFormData({ ...formData, referenceNumber: e.target.value })}
                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-mono"
                dir="ltr"
              />
            </div>

            {/* No manual Total Value Input - Replaced by auto-calculation later */}

            {/* Retention */}
            <div className="space-y-2 border border-white/5 p-5 rounded-2xl bg-slate-900/40">
              <label className="text-sm font-bold text-rose-400 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                نسبة الاحتجاز / الضمان (%)
              </label>
              <input
                type="number"
                required
                min="0"
                max="100"
                value={formData.retentionPercent}
                onChange={e => setFormData({ ...formData, retentionPercent: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all font-mono"
              />
            </div>

            {/* Advance Payment */}
            <div className="space-y-2 border border-white/5 p-5 rounded-2xl bg-slate-900/40">
              <label className="text-sm font-bold text-amber-400 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                نسبة الدفعة المقدمة (%)
              </label>
              <input
                type="number"
                required
                min="0"
                max="100"
                value={formData.advancePayment}
                onChange={e => setFormData({ ...formData, advancePayment: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-mono"
              />
            </div>

            {/* Scope */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-300">نطاق العمل / وصف العقد</label>
              <textarea
                rows={4}
                value={formData.scope}
                onChange={e => setFormData({ ...formData, scope: e.target.value })}
                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all resize-y min-h-[100px]"
                placeholder="اكتب وصفاً لنطاق أعمال هذا العقد..."
              />
            </div>
          </div>

          {/* BOQ Selection Section */}
          <div className="space-y-4 border border-blue-500/30 p-5 rounded-3xl bg-blue-500/5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold text-blue-400 flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                 بنود وجدول كميات العقد (Scope of Work)
              </label>
              <button 
                type="button"
                disabled={hasInvoices}
                onClick={() => setShowBoqSelector(true)}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="text-lg">+</span> إضافة بند من المشروع
              </button>
            </div>

            {selectedItems.length === 0 ? (
              <div className="py-10 text-center text-slate-500 border-2 border-dashed border-white/5 rounded-2xl">
                لم يتم إضافة بنود للعقد بعد. اضغط على زر الإضافة لاختيار مهام من جدول كميات المشروع.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs text-slate-300">
                  <thead className="border-b border-white/10 uppercase font-bold text-[10px] text-slate-500">
                    <tr>
                      <th className="pb-3 pr-2">وصف البند</th>
                      <th className="pb-3 text-center">الكمية المسندة</th>
                      <th className="pb-3 text-center">السعر (الوحدة)</th>
                      <th className="pb-3 text-left">إجمالي البند</th>
                      <th className="pb-3 text-center w-10">#</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {selectedItems.map((it) => (
                      <tr key={it.boqItemId} className="group transition-colors hover:bg-white/5">
                        <td className="py-4 pr-2">
                          <p className="font-bold text-white mb-0.5">{it.description}</p>
                          <p className="text-[10px] text-slate-500 font-mono italic">Unit: {it.unit}</p>
                        </td>
                        <td className="py-4 text-center">
                          <input 
                            type="number" 
                            disabled={hasInvoices}
                            value={it.assignedQty} 
                            onChange={e => updateItemValue(it.boqItemId, 'assignedQty', e.target.value)}
                            className="w-20 bg-slate-900 border border-slate-700 rounded-lg text-center py-1.5 font-mono text-emerald-400 focus:outline-none focus:border-emerald-500/50 transition-all disabled:opacity-50"
                          />
                        </td>
                        <td className="py-4 text-center">
                          <input 
                            type="number" 
                            disabled={hasInvoices}
                            value={it.unitPrice} 
                            onChange={e => updateItemValue(it.boqItemId, 'unitPrice', e.target.value)}
                            className="w-24 bg-slate-900 border border-slate-700 rounded-lg text-center py-1.5 font-mono text-blue-400 focus:outline-none focus:border-blue-500/50 transition-all disabled:opacity-50"
                          />
                        </td>
                        <td className="py-4 text-left font-mono font-bold text-white text-[13px]">
                          {(Number(it.assignedQty) * Number(it.unitPrice)).toLocaleString(undefined, {minimumFractionDigits: 2})}
                        </td>
                        <td className="py-4 text-center">
                          <button type="button" disabled={hasInvoices} onClick={() => removeItem(it.boqItemId)} className="p-1.5 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-blue-500/20">
                      <td colSpan={3} className="py-5 text-left font-bold text-slate-400">إجمالي قيمة العقد (تلقائي):</td>
                      <td className="py-5 text-left font-mono font-black text-blue-400 text-xl">
                        <span className="text-xs text-slate-500 mr-1">SAR</span>
                        {calculatedTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* BOQ Selector Modal */}
          {showBoqSelector && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-slate-900 border border-white/10 w-full max-w-3xl rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] -z-10" />
                
                <div className="flex justify-between items-center mb-8">
                  <div>
                      <h3 className="text-2xl font-black text-white">جدول كميات المشروع</h3>
                      <p className="text-sm text-slate-400 mt-1">اختر البنود التي تود إسنادها لهذا المقاول</p>
                  </div>
                  <button type="button" onClick={() => setShowBoqSelector(false)} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/5 text-slate-400 hover:text-white transition-colors">✕</button>
                </div>
                
                <div className="max-h-[450px] overflow-y-auto space-y-3 pr-4 custom-scrollbar">
                  {projectBoq.length === 0 ? (
                    <div className="text-center py-20 text-slate-500 flex flex-col items-center gap-4">
                       <div className="p-4 rounded-full bg-white/5"><Loader2 className="animate-spin text-slate-400" /></div>
                       <p>لا توجد بنود متاحة حالياً في المشروع.</p>
                    </div>
                  ) : (
                    projectBoq.map(it => {
                      const committed = (it.contractItems || [])
                        .filter((ci: any) => ci.contract?.type === formData.type && ci.contractId !== contractId)
                        .reduce((acc: number, ci: any) => acc + ci.assignedQty, 0);
                      const remaining = it.quantity - committed;
                      const isFullyAssigned = remaining <= 0;

                      return (
                        <div 
                          key={it.id} 
                          onClick={() => !isFullyAssigned && handleAddItem(it)}
                          className={`p-5 rounded-[1.5rem] border transition-all cursor-pointer flex justify-between items-center group ${
                            selectedItems.find(sel => sel.boqItemId === it.id) || isFullyAssigned
                              ? "bg-slate-800/30 border-slate-700/50 opacity-30 grayscale pointer-events-none" 
                              : "bg-slate-800/80 border-white/5 hover:border-blue-500/50 hover:bg-slate-700/50 hover:scale-[1.01]"
                          }`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                                <span className="px-2 py-0.5 rounded-md bg-slate-700 text-slate-400 font-mono text-[10px] uppercase">{it.itemCode}</span>
                                <p className="text-white font-bold text-base">{it.description}</p>
                                {isFullyAssigned && <span className="bg-rose-500/10 text-rose-500 text-[10px] px-2 py-0.5 rounded-full border border-rose-500/20">تم إسناده بالكامل</span>}
                            </div>
                            
                            <div className="flex items-center gap-4 mt-2">
                              <div className="text-[10px] text-slate-500">
                                 إجمالي المشروع: <span className="text-white font-mono">{it.quantity}</span>
                              </div>
                              <div className="text-[10px] text-amber-500/70">
                                 تم إسناده لمقاولين آخرين: <span className="text-amber-500 font-mono">{committed}</span>
                              </div>
                              <div className="text-[10px] text-emerald-500/70">
                                 المتاح للإسناد: <span className="text-emerald-500 font-mono font-bold">{remaining}</span>
                              </div>
                            </div>
                          </div>
                          <div className="mr-4">
                             {!isFullyAssigned && (
                               <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-soft font-bold text-xl">+</div>
                             )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            </div>
          )}

          <div className="pt-6 border-t border-white/5 flex gap-4 justify-end">
            <button
              type="button"
              onClick={() => router.push("/dashboard/contracts")}
              className="px-6 py-2.5 rounded-xl font-medium bg-white/5 hover:bg-white/10 text-slate-300 transition-all"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className={`flex items-center gap-2 px-8 py-2.5 rounded-xl font-bold transition-all disabled:opacity-50 text-white shadow-lg ${
                isMain
                  ? "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/30"
                  : "bg-orange-600 hover:bg-orange-500 shadow-orange-500/30"
              }`}
            >
              {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              حفظ التعديلات
            </button>
          </div>
        </form>
      </motion.div>

      {/* Change Orders Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-dark border border-white/5 rounded-3xl p-6 sm:p-8 relative"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-3 text-white">
               <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
                 <FileSignature size={20} />
               </div>
               الملاحق والأوامر التغييرية
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              إدارة التعديلات المالية على هذا العقد من زيادات (Variation Orders) أو تنزيلات
            </p>
          </div>
          
          <button
            onClick={() => router.push(`/dashboard/contracts/${contractId}/change-orders/create`)}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-lg shadow-emerald-500/30 hover:-translate-y-0.5 transition-all w-full sm:w-auto"
          >
            <PlusCircle size={20} />
            إنشاء ملحق جديد
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/5 bg-slate-900/30">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-white/10">
              <tr>
                <th className="px-4 py-4 whitespace-nowrap">المرجع</th>
                <th className="px-4 py-4">العنوان</th>
                <th className="px-4 py-4">النوع</th>
                <th className="px-4 py-4 whitespace-nowrap">القيمة (SAR)</th>
                <th className="px-4 py-4">تاريخ الإصدار</th>
                <th className="px-4 py-4 text-center">الحالة</th>
                <th className="px-4 py-4 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
               {(!contract?.changeOrders || contract.changeOrders.length === 0) ? (
                 <tr>
                    <td colSpan={6} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-500 gap-3">
                        <FileSignature size={36} className="opacity-20" />
                        <p>لا توجد ملاحق مسجلة لهذا العقد حتى الآن.</p>
                      </div>
                    </td>
                 </tr>
               ) : (
                  contract.changeOrders.map((co: any) => (
                    <tr key={co.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-4 font-mono font-bold text-white">#{co.orderNumber}</td>
                      <td className="px-4 py-4 font-medium max-w-[200px] truncate" title={co.title}>{co.title}</td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${co.type === 'ADDITION' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                          {co.type === 'ADDITION' ? 'بند إضافي (+)' : 'خصم متفق (-)'}
                        </span>
                      </td>
                      <td className={`px-4 py-4 font-mono font-bold ${co.type === 'DEDUCTION' ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {co.type === 'DEDUCTION' ? '-' : ''}{Number(co.amount).toLocaleString('en-US')}
                      </td>
                      <td className="px-4 py-4 font-mono text-slate-400">
                        {new Date(co.issueDate).toLocaleDateString('ar-SA')}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${co.status === 'APPROVED' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-slate-800 text-slate-300 border border-slate-700'}`}>
                          {co.status === 'APPROVED' ? 'معتمد ومؤثر' : 'مسودة'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              if (confirm(`حذف الملحق #${co.orderNumber}؟ سيتم عكس قيمته على العقد.`)) {
                                const token = localStorage.getItem("token");
                                axios.delete(`${API_BASE_URL}/v1/contracts/${contractId}/change-orders/${co.id}`, {
                                  headers: { Authorization: `Bearer ${token}` }
                                }).then(() => fetchContract())
                                  .catch(() => alert("فشل حذف الملحق"));
                              }
                            }}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                            title="حذف الملحق"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                 ))
               )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>

      {/* Print View */}
      <div ref={pdfRef} className="hidden print:block print-on-letterhead text-black font-sans bg-white" dir="rtl">
        <PrintLetterhead />
        <div className="pt-20 mb-6">
          <div className="inline-block bg-slate-50 p-3 rounded-lg border border-slate-200">
            <p className="text-sm font-bold text-slate-800">رقم العقد (Ref): <span className="font-mono text-indigo-700">{contract?.referenceNumber}</span></p>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-3">
            {isMain ? 'عقد رئيسي - Main Contract' : 'عقد مقاول باطن - Subcontract'}
          </h1>
        </div>
        <div className="grid grid-cols-2 gap-6 mb-6 text-sm">
          <div className="bg-white p-4 border-2 border-slate-200 rounded-lg shadow-sm">
            <p className="text-slate-500 font-bold mb-2 uppercase text-xs tracking-wider border-b border-slate-100 pb-2">الطرف الثاني (Party):</p>
            <p className="font-black text-lg text-slate-900">{partyName}</p>
          </div>
          <div className="bg-white p-4 border-2 border-slate-200 rounded-lg shadow-sm">
            <p className="text-slate-500 font-bold mb-2 uppercase text-xs tracking-wider border-b border-slate-100 pb-2">المشروع (Project):</p>
            <p className="font-bold text-lg text-slate-900">{contract?.project?.name}</p>
            <p className="font-mono text-sm text-slate-500">{contract?.project?.code}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
          <div className="bg-slate-50 p-3 rounded border border-slate-200">
            <span className="font-bold text-slate-500">قيمة العقد: </span>
            <span className="font-mono font-black">{calculatedTotal.toLocaleString()} SAR</span>
          </div>
          <div className="bg-slate-50 p-3 rounded border border-slate-200">
            <span className="font-bold text-slate-500">نسبة الضمان: </span>
            <span className="font-mono font-black">{formData.retentionPercent}%</span>
          </div>
          <div className="bg-slate-50 p-3 rounded border border-slate-200">
            <span className="font-bold text-slate-500">الدفعة المقدمة: </span>
            <span className="font-mono font-black">{formData.advancePayment}%</span>
          </div>
        </div>
        {selectedItems.length > 0 && (
          <div className="mb-6">
            <h3 className="font-bold text-slate-800 text-sm mb-2 border-b border-slate-200 pb-1">بنود العقد (Contract Items):</h3>
            <table className="w-full text-right text-sm border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="p-2 border border-slate-900">البيان</th>
                  <th className="p-2 border border-slate-900 text-center w-16">الوحدة</th>
                  <th className="p-2 border border-slate-900 text-center w-20">الكمية</th>
                  <th className="p-2 border border-slate-900 text-center w-24">سعر الوحدة</th>
                  <th className="p-2 border border-slate-900 text-center w-28">الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                {selectedItems.map((item, i) => (
                  <tr key={i} className="border-b border-slate-300">
                    <td className="p-2 border-x border-slate-300 font-bold">{item.description}</td>
                    <td className="p-2 border-x border-slate-300 text-center">{item.unit}</td>
                    <td className="p-2 border-x border-slate-300 text-center font-mono">{item.assignedQty}</td>
                    <td className="p-2 border-x border-slate-300 text-center font-mono">{Number(item.unitPrice).toLocaleString()}</td>
                    <td className="p-2 border-x border-slate-300 text-center font-mono font-black">{(Number(item.assignedQty) * Number(item.unitPrice)).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-900 text-white font-bold">
                  <td colSpan={4} className="p-2 border border-slate-900 text-left">الإجمالي الكلي</td>
                  <td className="p-2 border border-slate-900 text-center font-mono">{calculatedTotal.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
        {formData.scope && (
          <div className="mb-6">
            <h3 className="font-bold text-slate-800 text-sm mb-2 border-b border-slate-200 pb-1">نطاق العمل (Scope):</h3>
            <p className="text-sm text-slate-700 whitespace-pre-wrap bg-slate-50 p-3 rounded border border-slate-200">{formData.scope}</p>
          </div>
        )}

      </div>
    </>
  );
}
