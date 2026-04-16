"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  FilePlus, 
  Save, 
  ArrowRight, 
  Loader2, 
  Plus,
  Trash2,
  ListOrdered,
  Printer,
  Building2,
  FileSignature,
  FileText,
  ScrollText,
  Wand2,
  CheckCircle2
} from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";

export default function EditQuotationPage() {
  const router = useRouter();
  const params = useParams();
  const quotationId = params.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [printMeta, setPrintMeta] = useState({ date: "", ref: "" });
  
  const [formData, setFormData] = useState({
    title: "",
    clientName: "",
    hasVat: false,
    technicalOffer: "",
    termsConditions: "",
    status: "DRAFT",
    projectId: null as string | null,
    items: [{ itemCode: "01", description: "", unit: "م٢", quantity: 1, unitPrice: 0 }]
  });

  useEffect(() => {
    if (quotationId) {
      fetchQuotation();
    }
  }, [quotationId]);

  const fetchQuotation = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/v1/quotations/${quotationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const q = res.data;
      setFormData({
        title: q.title || "",
        clientName: q.client?.name || "",
        hasVat: q.hasVat || false,
        technicalOffer: q.technicalOffer || "",
        termsConditions: q.termsConditions || "",
        status: q.status || "DRAFT",
        projectId: q.projectId || null,
        items: q.items?.length > 0 ? q.items.map((i: any) => ({
          itemCode: i.itemCode,
          description: i.description,
          unit: i.unit,
          quantity: i.quantity,
          unitPrice: i.unitPrice
        })) : [{ itemCode: "01", description: "", unit: "م٢", quantity: 1, unitPrice: 0 }]
      });

      setPrintMeta({
        date: new Date(q.createdAt || new Date()).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' }),
        ref: q.quotationNumber
      });
    } catch (err) {
      console.error(err);
      alert("تعذر جلب بيانات عرض السعر.");
      router.push("/dashboard/quotations");
    } finally {
      setIsFetching(false);
    }
  };

  const calculateSubTotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const calculateVat = () => {
    return formData.hasVat ? calculateSubTotal() * 0.15 : 0;
  };

  const calculateTotal = () => {
    return calculateSubTotal() + calculateVat();
  };

  const handleAddItem = () => {
    const nextCode = (formData.items.length + 1).toString().padStart(2, '0');
    setFormData({
      ...formData,
      items: [...formData.items, { itemCode: nextCode, description: "", unit: "م٢", quantity: 1, unitPrice: 0 }]
    });
  };

  const handleRemoveItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    const reindexedItems = newItems.map((item, i) => ({
      ...item,
      itemCode: (i + 1).toString().padStart(2, '0')
    }));
    setFormData({ ...formData, items: reindexedItems });
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${API_BASE_URL}/v1/quotations/${quotationId}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("تم تحديث عرض السعر بنجاح!");
    } catch (err: any) {
      alert("حدث خطأ أثناء الرفع والتعديل.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConvertToProject = async () => {
    if (!confirm("هل أنت متأكد من تحويل عرض السعر لاعتماد وإنشاء مشروع تنفيذي؟")) return;
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_BASE_URL}/v1/quotations/${quotationId}/convert`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("🎉 تم إنشاء المشروع بنجاح من عرض السعر!");
      fetchQuotation();
    } catch (err) {
      alert("فشل تحويل عرض السعر لمشروع.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] print:hidden">
         <Loader2 className="animate-spin text-pink-500 mb-4" size={48} />
         <p className="text-slate-400 font-bold tracking-widest text-sm">جاري جلب عرض السعر...</p>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-[1600px] mx-auto space-y-8 w-full animate-in fade-in zoom-in-95 duration-500 pb-12 print:hidden relative">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none -z-10" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <button onClick={() => router.back()} className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-slate-300 hover:text-white transition-all shadow-lg hover:-translate-x-1">
              <ArrowRight size={22} />
            </button>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3 drop-shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-blue-500/10 flex items-center justify-center border border-indigo-500/20 shadow-lg">
                  <FileText className="text-indigo-400" size={24} />
                </div>
                مراجعة وتعديل عرض السعر
              </h1>
              <p className="text-slate-400 text-sm mt-2 font-medium flex items-center gap-2 font-mono">
                {printMeta.ref} - {formData.clientName}
                {formData.projectId && (
                  <span className="bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full text-xs font-bold border border-emerald-500/20 flex items-center gap-1">
                    <CheckCircle2 size={14} /> تم تحويله لمشروع
                  </span>
                )}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-3 bg-slate-900/50 p-1.5 rounded-xl border border-white/5">
              <span className="text-sm font-bold text-slate-400 mr-2">حالة العرض:</span>
              <select 
                value={formData.status} 
                onChange={e => setFormData({...formData, status: e.target.value})}
                disabled={!!formData.projectId}
                className={`bg-slate-950 border rounded-lg px-3 py-1.5 text-sm font-bold outline-none transition-colors appearance-none cursor-pointer ${
                  formData.status === 'APPROVED' ? 'text-emerald-400 border-emerald-500/30' : 
                  formData.status === 'REJECTED' ? 'text-rose-400 border-rose-500/30' : 
                  formData.status === 'SUBMITTED' ? 'text-blue-400 border-blue-500/30' : 
                  'text-slate-300 border-slate-700'
                }`}
              >
                <option value="DRAFT">مسودة (Draft)</option>
                <option value="SUBMITTED">مُرسل للعميل (Submitted)</option>
                <option value="APPROVED">معتمد (Approved)</option>
                <option value="REJECTED">مرفوض (Rejected)</option>
              </select>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {formData.status === 'APPROVED' && !formData.projectId && (
                <button type="button" onClick={handleConvertToProject} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-black bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] transition-all animate-pulse text-sm">
                  <Wand2 size={18} /> تحويل لمشروع تنفيذي
                </button>
              )}
              <button type="button" onClick={handlePrint} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-bold transition-all shadow-lg text-sm">
                <Printer size={18} /> معاينة وطباعة PDF
              </button>
              <button onClick={handleSubmit} disabled={isLoading} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] transition-all hover:-translate-y-1 text-sm disabled:opacity-50">
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} تحديث البيانات
              </button>
            </div>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-dark border border-white/5 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-teal-400 opacity-50" />
          
          <form className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-900/40 p-6 rounded-2xl border border-white/5 shadow-inner">
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Building2 size={14} className="text-indigo-400" />
                  العميل / الجهة المالكة المستهدفة
                </label>
                <input 
                  type="text" 
                  required 
                  value={formData.clientName} 
                  onChange={e => setFormData({...formData, clientName: e.target.value})} 
                  className="w-full bg-slate-950/50 border border-slate-700/80 rounded-xl py-3.5 px-4 text-white text-base placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all shadow-inner" 
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <FileSignature size={14} className="text-indigo-400" />
                  وصف المشروع أو عنوان عرض السعر
                </label>
                <input 
                  type="text" 
                  required 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  className="w-full bg-slate-950/50 border border-slate-700/80 rounded-xl py-3.5 px-4 text-white text-base placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all shadow-inner" 
                />
              </div>

              <div className="md:col-span-2 space-y-3 pt-2">
                <label className="flex items-center gap-3 bg-slate-950/80 border border-slate-800 p-4 rounded-xl cursor-pointer hover:border-indigo-500/30 transition-colors w-max">
                  <input 
                    type="checkbox" 
                    checked={formData.hasVat} 
                    onChange={e => setFormData({...formData, hasVat: e.target.checked})}
                    className="w-5 h-5 rounded accent-indigo-500 border-slate-700" 
                  />
                  <span className="font-bold text-white text-sm">تطبيق ضريبة القيمة المضافة 15% 🇸🇦</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-900/40 p-6 rounded-2xl border border-white/5 shadow-inner">
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <FileText size={14} className="text-indigo-400" />
                  العرض الفني / نطاق العمل
                </label>
                <textarea 
                  rows={4}
                  value={formData.technicalOffer} 
                  onChange={e => setFormData({...formData, technicalOffer: e.target.value})} 
                  className="w-full bg-slate-950/50 border border-slate-700/80 rounded-xl py-3.5 px-4 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all shadow-inner resize-y min-h-[120px]" 
                  placeholder="مثال: يختص هذا العرض بتوريد وتركيب الأنظمة الموضحة بالجدول بموجب المواصفات العالمية المعتمدة..." 
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <ScrollText size={14} className="text-indigo-400" />
                  الشروط والأحكام / شروط العقد
                </label>
                <textarea 
                  rows={4}
                  value={formData.termsConditions} 
                  onChange={e => setFormData({...formData, termsConditions: e.target.value})} 
                  className="w-full bg-slate-950/50 border border-slate-700/80 rounded-xl py-3.5 px-4 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all shadow-inner resize-y min-h-[120px]" 
                  placeholder="مثال: مدة التنفيذ 45 يوماً من تاريخ استلام الدفعة المقدمة. الدفعة المقدمة 50%..." 
                />
              </div>
            </div>

            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <h3 className="font-extrabold text-xl text-white flex items-center gap-2 drop-shadow-sm">
                  <ListOrdered className="text-indigo-400" size={24} />
                  جداول التكلفة التفصيلية
                </h3>
                <button type="button" onClick={handleAddItem} className="flex items-center gap-2 text-sm font-bold text-indigo-400 hover:text-white bg-indigo-500/10 hover:bg-indigo-500 border border-indigo-500/20 hover:border-indigo-500 px-4 py-2 rounded-xl transition-all shadow-lg hover:shadow-[0_0_15px_rgba(79,70,229,0.5)]">
                  <Plus size={18} /> إدراج بند جديد
                </button>
              </div>

              <div className="hidden lg:grid grid-cols-12 gap-4 px-4 pb-2 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">
                <div className="col-span-1">بند رقم</div>
                <div className="col-span-4 text-right">وصف تفصيلي للأعمال</div>
                <div className="col-span-2">الوحدة</div>
                <div className="col-span-1">الكمية</div>
                <div className="col-span-2">سعر الإفراد (SAR)</div>
                <div className="col-span-2 text-left">القيمة الإجمالية (SAR)</div>
              </div>

              <div className="space-y-3">
                {formData.items.map((item, index) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={index} 
                    className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 p-4 lg:p-3 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-2xl items-center transition-colors group relative"
                  >
                    <div className="col-span-1">
                       <input type="text" value={item.itemCode} onChange={e => handleItemChange(index, "itemCode", e.target.value)} className="w-full bg-slate-900/80 border border-slate-700/50 rounded-lg py-2.5 px-3 text-sm text-center text-slate-500 font-mono font-bold" readOnly />
                    </div>
                    <div className="col-span-1 lg:col-span-4">
                       <input type="text" required value={item.description} onChange={e => handleItemChange(index, "description", e.target.value)} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg py-2.5 px-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium" />
                    </div>
                    <div className="col-span-1 lg:col-span-2">
                       <input type="text" required value={item.unit} onChange={e => handleItemChange(index, "unit", e.target.value)} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg py-2.5 px-3 text-sm text-center text-slate-300 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all" />
                    </div>
                    <div className="col-span-1">
                       <input type="number" required min="1" step="any" value={item.quantity || ''} onChange={e => handleItemChange(index, "quantity", Number(e.target.value))} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg py-2.5 px-2 text-sm text-center text-emerald-300 font-mono font-bold focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all" />
                    </div>
                    <div className="col-span-1 lg:col-span-2">
                       <input type="number" required min="0" step="any" value={item.unitPrice || ''} onChange={e => handleItemChange(index, "unitPrice", Number(e.target.value))} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg py-2.5 px-3 text-sm text-center text-rose-300 font-mono font-bold focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all" />
                    </div>
                    <div className="col-span-1 lg:col-span-2 flex items-center gap-2">
                      <div className="flex-1 bg-slate-900/80 py-2.5 px-3 rounded-lg text-left font-black text-white font-mono text-sm border border-slate-700/50 shadow-inner group-hover:bg-slate-800 transition-colors">
                        {(item.quantity * item.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <button type="button" onClick={() => handleRemoveItem(index)} className="p-2.5 text-rose-500 hover:text-white hover:bg-rose-500 rounded-lg transition-all" title="حذف البند">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 md:px-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden space-y-4">
               <div className="absolute inset-0 bg-indigo-500/5 mix-blend-overlay" />
               <div className="relative z-10 flex justify-between items-center border-b border-white/5 pb-4">
                 <span className="text-slate-400 font-bold">المجموع الفرعي (Subtotal)</span>
                 <span className="font-mono text-xl text-white">{calculateSubTotal().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SAR</span>
               </div>
               {formData.hasVat && (
                 <div className="relative z-10 flex justify-between items-center border-b border-white/5 pb-4">
                   <span className="text-slate-400 font-bold text-indigo-400">ضريبة القيمة المضافة (VAT 15%)</span>
                   <span className="font-mono text-xl text-indigo-400">{calculateVat().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SAR</span>
                 </div>
               )}
               <div className="relative z-10 flex justify-between items-center flex-col md:flex-row gap-4 pt-2">
                 <div>
                   <h4 className="text-xl font-bold text-white mb-1">المبلغ الإجمالي المستحق</h4>
                   <p className="text-sm text-slate-400">Net Total Amount</p>
                 </div>
                 <div className="flex items-baseline gap-2">
                   <span className="text-slate-400 font-bold tracking-widest text-sm">SAR</span>
                   <span className="font-mono text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-white drop-shadow-[0_0_15px_rgba(79,70,229,0.5)]">
                     {calculateTotal().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                   </span>
                 </div>
               </div>
            </div>
          </form>
        </motion.div>
      </div>

      {/* PRINT ONLY */}
      <div className="hidden print:block print:!bg-white print:!text-black w-full min-h-screen pt-32 pb-10 px-8 font-sans" dir="rtl">
        <div className="border-b-2 border-slate-900 pb-6 mb-8 flex justify-between items-end">
           <div>
             <h1 className="text-4xl font-black text-slate-900 mb-1 tracking-tight">عــرض ســعــر</h1>
             <p className="text-lg font-bold text-slate-500">QUOTATION</p>
           </div>
           <div className="text-left font-bold text-sm text-slate-600">
             <p className="text-xl font-bold text-indigo-700 mb-2">PMS Contracting Est.</p>
             <p>Date: <span className="font-mono text-slate-900">{printMeta.date}</span></p>
             <p>Ref: <span className="font-mono text-slate-900">{printMeta.ref}</span></p>
           </div>
        </div>

        <div className="mb-10 grid grid-cols-2 gap-8 text-sm">
           <div className="bg-slate-50 p-4 border-l-4 border-indigo-600 rounded-r-lg">
              <p className="text-slate-500 font-bold mb-1 uppercase text-xs">مقدم إلى العميل (Billed To):</p>
              <h2 className="text-xl font-black text-slate-900">{formData.clientName || '_______________'}</h2>
           </div>
           <div className="bg-slate-50 p-4 border-r-4 border-indigo-600 rounded-l-lg text-left text-right" dir="rtl">
              <p className="text-slate-500 font-bold mb-1 uppercase text-xs">المشروع / البيان (Subject):</p>
              <h2 className="text-lg font-bold text-slate-900">{formData.title || '_______________'}</h2>
           </div>
        </div>

         {formData.technicalOffer && (
           <div className="mb-8 pl-2">
             <h3 className="text-sm font-black text-slate-800 mb-2 border-b-2 border-slate-200 inline-block pb-1">نطاق العمل / العرض الفني:</h3>
             <div className="text-xs text-slate-700 leading-relaxed font-bold whitespace-pre-wrap">
               {formData.technicalOffer}
             </div>
           </div>
         )}

        <table className="w-full text-right text-sm border-collapse mb-10">
          <thead>
            <tr className="bg-slate-900 text-white font-bold text-xs uppercase">
              <th className="border border-slate-900 py-3 px-2 text-center w-12 text-slate-200">م</th>
              <th className="border border-slate-900 py-3 px-4 text-slate-200">البيان ومواصفات الأعمال</th>
              <th className="border border-slate-900 py-3 px-2 text-center text-slate-200">الوحدة</th>
              <th className="border border-slate-900 py-3 px-2 text-center text-slate-200">الكمية</th>
              <th className="border border-slate-900 py-3 px-3 text-center text-slate-200">سعر الوحدة</th>
              <th className="border border-slate-900 py-3 px-3 text-center text-slate-200">الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            {formData.items.map((item, index) => (
              <tr key={index} className="border-b border-slate-300">
                <td className="border-x border-slate-300 py-3 px-2 text-center font-bold text-slate-500">{item.itemCode}</td>
                <td className="border-x border-slate-300 py-3 px-4 text-slate-900 font-bold">{item.description || '-'}</td>
                <td className="border-x border-slate-300 py-3 px-2 text-center text-slate-600">{item.unit || '-'}</td>
                <td className="border-x border-slate-300 py-3 px-2 text-center font-mono font-bold text-slate-900">{item.quantity}</td>
                <td className="border-x border-slate-300 py-3 px-3 text-center font-mono text-slate-900">{Number(item.unitPrice).toLocaleString()}</td>
                <td className="border-x border-slate-300 py-3 px-3 text-center font-mono font-bold text-slate-900 bg-slate-50">
                  {(item.quantity * item.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mb-16">
          <div className="w-2/3 rounded-lg border-2 border-slate-900 overflow-hidden text-sm">
            <div className="bg-slate-50 flex justify-between px-4 py-3 border-b border-slate-900 font-bold">
              <span className="text-slate-600">المجموع الفرعي (Subtotal)</span>
              <span className="font-mono text-slate-900">{calculateSubTotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            {formData.hasVat && (
              <div className="bg-slate-100 flex justify-between px-4 py-3 border-b border-slate-900 font-bold">
                <span className="text-slate-600">ضريبة القيمة المضافة (VAT 15%)</span>
                <span className="font-mono text-slate-900">{calculateVat().toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="bg-slate-900 flex justify-between items-center px-4 py-4 text-white">
              <span className="font-black text-lg">صافي المبلغ المستحق (Net Total)</span>
              <span className="font-mono font-black text-xl">SAR {calculateTotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {formData.termsConditions && (
          <div className="mb-10 bg-slate-50 p-6 border-2 border-slate-200 rounded-xl break-inside-avoid">
            <h3 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-2">
              الشروط والأحكام (Terms & Conditions):
            </h3>
            <div className="text-xs text-slate-800 leading-loose font-bold whitespace-pre-wrap">
              {formData.termsConditions}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-20 text-center font-bold text-sm text-slate-900 px-10 border-t-2 border-slate-200 pt-10 break-inside-avoid mt-8">
          <div>
            <p className="mb-12">المدير العام (General Manager)</p>
            <p className="border-t border-slate-900 border-dashed pt-2 mx-6">التوقيع والختم</p>
          </div>
          <div>
            <p className="mb-12">موافقة العميل (Client Approval)</p>
            <p className="border-t border-slate-900 border-dashed pt-2 mx-6">Signature / Stamp</p>
          </div>
        </div>
      </div>
    </>
  );
}
