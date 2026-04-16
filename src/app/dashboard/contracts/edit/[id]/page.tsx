"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  FileSignature, Save, ArrowRight, Loader2, PlusCircle,
  Crown, HardHat, Building2, Edit3, AlertTriangle, Plus
} from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";

export default function EditContractPage() {
  const router = useRouter();
  const params = useParams();
  const contractId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [contract, setContract] = useState<any>(null);

  const [formData, setFormData] = useState({
    referenceNumber: "",
    totalValue: 0,
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
        referenceNumber: c.referenceNumber || "",
        totalValue: Number(c.totalValue) || 0,
        retentionPercent: Number(c.retentionPercent) || 5,
        advancePayment: Number(c.advancePayment) || 10,
        scope: c.scope || "",
      });
    } catch (err) {
      alert("لم يتم العثور على العقد.");
      router.push("/dashboard/contracts");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${API_BASE_URL}/v1/contracts/${contractId}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      router.push("/dashboard/contracts");
    } catch (err: any) {
      alert(`خطأ أثناء حفظ التعديلات: ${err.response?.data?.message || err.message}`);
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

  const isMain = contract?.type === "MAIN_CONTRACT";
  const partyName = isMain
    ? (contract?.project?.client?.name || "الجهة المالكة (قيد التجهيز)")
    : (contract?.subcontractor?.name || "—");

  return (
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
      {contract?.invoices?.length > 0 && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-300 font-bold text-sm">تنبيه: هذا العقد يحتوي على {contract.invoices.length} مستخلص مسجل</p>
            <p className="text-slate-400 text-xs mt-1">
              تعديل القيمة الإجمالية أو نسب الاحتجاز قد يؤثر على حسابات المستخلصات المستقبلية فقط، ولن يُعدل المستخلصات المعتمدة مسبقاً.
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

            {/* Total Value */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                القيمة الإجمالية للعقد (SAR)
              </label>
              <input
                type="number"
                required
                min="0"
                step="any"
                value={formData.totalValue}
                onChange={e => setFormData({ ...formData, totalValue: Number(e.target.value) })}
                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-mono"
              />
              {isMain && (
                <p className="text-xs text-indigo-400">
                  💡 تعديل القيمة للعقد الرئيسي قد يؤثر على ميزانية المشروع المستهدفة
                </p>
              )}
            </div>

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
                   </tr>
                 ))
               )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
