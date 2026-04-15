"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";
import { 
  Banknote, 
  Search, 
  PlusCircle, 
  Trash2,
  Loader2,
  Building,
  Calendar,
  AlertCircle,
  Printer
} from "lucide-react";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form
  const [form, setForm] = useState({
    projectId: "",
    description: "",
    amount: "",
    category: "SITE_MATERIALS",
    requestedBy: "مدير الموقع"
  });

  useEffect(() => {
    fetchExpenses();
    fetchProjects();
  }, []);

  const fetchExpenses = async () => {
    setIsLoading(true);
    try {
       const token = localStorage.getItem("token");
       const res = await axios.get(`${API_BASE_URL}/v1/expenses`, {
         headers: { Authorization: `Bearer ${token}` }
       });
       setExpenses(res.data);
    } catch (e) {
       console.error(`Failed to load expenses.");
    } finally {
       setIsLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
       const token = localStorage.getItem("token");
       const res = await axios.get(`${API_BASE_URL}/v1/projects`, {
         headers: { Authorization: `Bearer ${token}` }
       });
       setProjects(res.data);
    } catch (e) {}
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!confirm(`هل أنت متأكد من تسجيل هذه العهدة؟")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_BASE_URL}/v1/expenses`, form, {
         headers: { Authorization: `Bearer ${token}` }
      });
      setIsFormOpen(false);
      fetchExpenses();
    } catch (e: any) {
      alert(`حدث خطأ في التسجيل");
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("احذر: هل أنت متأكد من حذف هذه العهدة/المصروف بشكل نهائي؟")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/v1/expenses/${id}`, {
         headers: { Authorization: `Bearer ${token}` }
      });
      fetchExpenses();
    } catch (e) {
      alert(`فشل الحذف.");
    }
  };

  const categoryMap: Record<string, string> = {
    "SITE_MATERIALS": "مواد موقع نثرية",
    "FUEL": "وقود ومحروقات",
    "FOOD": "إعاشة وضيافة",
    "LOGISTICS": "شحن ونقل وتفريغ",
    "OTHER": "مصروفات أخرى"
  };

  const totalAmount = expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const currentDate = new Date().toLocaleDateString(`ar-SA');

  return (
    <>
    {/* Screen View */}
    <div className="space-y-6 w-full animate-in fade-in zoom-in-95 duration-500 print:hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-3xl border border-white/5 shadow-2xl">
        <div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 flex items-center gap-3">
            <Banknote size={32} className="text-emerald-500" /> إدارة العهد والمصروفات
          </h1>
          <p className="text-slate-400 mt-2 text-sm">تسجيل المصاريف النثرية للمواقع ومتابعة العهد.</p>
        </div>
        <div className="flex items-center gap-3 print:hidden">
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-bold transition-all border border-white/10"
          >
            <Printer size={20} /> طباعة كشف تسوية
          </button>
          {!isFormOpen && (
            <button 
              onClick={() => setIsFormOpen(true)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all"
            >
              <PlusCircle size={20} /> تسجيل مصروف / عهدة
            </button>
          )}
        </div>
      </div>

      {isFormOpen && (
        <div className="bg-slate-900/80 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-6">نموذج قيد المصروف</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
               <label className="text-sm text-slate-400 font-bold">المشروع التابع له (اختياري)</label>
               <select 
                 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none"
                 value={form.projectId}
                 onChange={e => setForm({...form, projectId: e.target.value})}
               >
                 <option value="">مصروف عام بدون مشروع</option>
                 {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
               </select>
             </div>
             <div className="space-y-2">
               <label className="text-sm text-slate-400 font-bold">التصنيف</label>
               <select 
                 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none"
                 value={form.category}
                 onChange={e => setForm({...form, category: e.target.value})}
               >
                 {Object.entries(categoryMap).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
               </select>
             </div>
             <div className="space-y-2">
               <label className="text-sm text-slate-400 font-bold">المبلغ (SAR)</label>
               <input 
                 required type="number" 
                 min="0.1" step="0.1"
                 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none"
                 placeholder="مثال: 150.00"
                 value={form.amount} onChange={e => setForm({...form, amount: e.target.value})}
               />
             </div>
             <div className="space-y-2">
               <label className="text-sm text-slate-400 font-bold">البيان والتفاصيل</label>
               <input 
                 required type="text" 
                 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none"
                 placeholder="شراء مسامير ومعدات للموقع..."
                 value={form.description} onChange={e => setForm({...form, description: e.target.value})}
               />
             </div>
             
             <div className="md:col-span-2 pt-4 flex justify-end gap-3 border-t border-white/5">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-6 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition-colors">إلغاء</button>
                <button type="submit" className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold hover:brightness-110 shadow-lg flex items-center gap-2">
                   حفظ المصروف
                </button>
             </div>
          </form>
        </div>
      )}

      {/* List */}
      <div className="bg-slate-900/40 rounded-3xl border border-white/5 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-900/80 text-slate-400 border-b border-white/5 uppercase font-medium">
              <tr>
                <th className="px-6 py-4">المرجع</th>
                <th className="px-6 py-4">التاريخ</th>
                <th className="px-6 py-4">المشروع</th>
                <th className="px-6 py-4">التصنيف</th>
                <th className="px-6 py-4">البيان</th>
                <th className="px-6 py-4 text-left">المبلغ (SAR)</th>
                <th className="px-6 py-4 text-center print:hidden">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {isLoading ? (
                 <tr>
                   <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                     <Loader2 className="animate-spin mx-auto text-emerald-500" size={24} />
                   </td>
                 </tr>
              ) : expenses.length === 0 ? (
                 <tr>
                   <td colSpan={7} className="px-6 py-12 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
                     <AlertCircle size={32} className="opacity-50" />
                     لا يوجد مصاريف مقيدة.
                   </td>
                 </tr>
              ) : expenses.map(exp => (
                 <tr key={exp.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4 font-mono font-bold text-slate-400 text-xs">{exp.expenseNo}</td>
                    <td className="px-6 py-4 font-mono text-xs">{new Date(exp.date).toLocaleDateString('en-US')}</td>
                    <td className="px-6 py-4 font-bold text-white">{exp.project?.name || <span className="text-slate-500 font-normal">عام (نثرية أصول)</span>}</td>
                    <td className="px-6 py-4"><span className="bg-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-300 border border-slate-700">{categoryMap[exp.category] || exp.category}</span></td>
                    <td className="px-6 py-4 truncate max-w-[200px]" title={exp.description}>{exp.description}</td>
                    <td className="px-6 py-4 font-mono font-black text-rose-400 text-left" dir="ltr">- {Number(exp.amount).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                    <td className="px-6 py-4 text-center print:hidden">
                       <button onClick={() => handleDelete(exp.id)} title="حذف" className="p-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded-lg transition-colors border border-rose-500/20 shadow-sm mx-auto flex items-center justify-center">
                         <Trash2 size={16} />
                       </button>
                    </td>
                 </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    {/* Print View (Professional Document) */}
    <div className="hidden print:block print:!bg-white print:!text-black min-h-screen pt-32 pb-10 px-8 font-sans" dir="rtl">
      {/* 
        pt-32 (128px) top margin to allow for official company letterhead (ورق مروس).
      */}
      <div className="text-center mb-8 border-b-2 border-gray-800 pb-4">
        <h1 className="text-3xl font-bold uppercase tracking-wider mb-2">كشف تسوية عُهدة نقدية ومصروفات</h1>
        <p className="text-gray-600 font-bold uppercase tracking-widest text-sm">Petty Cash Settlement Report</p>
      </div>

      <div className="flex justify-between items-center mb-6 font-bold text-lg">
        <div>التاريخ: {currentDate}</div>
        <div>رقم الكشف: {Date.now().toString().slice(-6)}</div>
      </div>

      <table className="w-full text-right border-collapse mb-8 print:w-full">
        <thead>
          <tr className="bg-gray-100 border-2 border-gray-800 text-black">
            <th className="p-3 border-2 border-gray-800 w-12 text-center text-sm font-black">م</th>
            <th className="p-3 border-2 border-gray-800 text-sm font-black">التاريخ</th>
            <th className="p-3 border-2 border-gray-800 text-sm font-black">المشروع</th>
            <th className="p-3 border-2 border-gray-800 text-sm font-black">التصنيف</th>
            <th className="p-3 border-2 border-gray-800 w-1/3 text-sm font-black">البيان والتفاصيل</th>
            <th className="p-3 border-2 border-gray-800 text-left text-sm font-black">المبلغ (ريال)</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((exp, idx) => (
            <tr key={exp.id} className="border-2 border-gray-800 text-black break-inside-avoid">
              <td className="p-3 border-2 border-gray-800 text-center font-bold text-sm">{idx + 1}</td>
              <td className="p-3 border-2 border-gray-800 text-sm font-bold font-mono">{new Date(exp.date).toLocaleDateString('en-US')}</td>
              <td className="p-3 border-2 border-gray-800 font-bold text-sm">{exp.project?.name || "عام (مشتريات إدارة)"}</td>
              <td className="p-3 border-2 border-gray-800 font-bold text-sm">{categoryMap[exp.category] || exp.category}</td>
              <td className="p-3 border-2 border-gray-800 text-sm">{exp.description}</td>
              <td className="p-3 border-2 border-gray-800 text-left font-black text-sm" dir="ltr">{Number(exp.amount).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
            </tr>
          ))}
          {/* Total Row */}
          <tr className="bg-gray-200 border-2 border-gray-800 text-black font-black text-lg break-inside-avoid">
            <td colSpan={5} className="p-4 border-2 border-gray-800 text-left">الإجمالي الكلي للمصروفات (Total Expenses)</td>
            <td className="p-4 border-2 border-gray-800 text-left text-xl" dir="ltr">{totalAmount.toLocaleString('en-US', {minimumFractionDigits: 2})} <span className="text-sm text-gray-700">SAR</span></td>
          </tr>
        </tbody>
      </table>

      <div className="mt-20 pt-8 break-inside-avoid">
        <h3 className="font-bold text-xl mb-16">التوقيعات والاعتمادات:</h3>
        <div className="grid grid-cols-3 gap-8 text-center">
          <div>
            <p className="font-bold text-gray-700 mb-12">إعداد / صاحب العهدة</p>
            <p className="text-gray-400">.......................................</p>
          </div>
          <div>
            <p className="font-bold text-gray-700 mb-12">المراجعة (قسم الحسابات)</p>
            <p className="text-gray-400">.......................................</p>
          </div>
          <div>
            <p className="font-bold text-gray-700 mb-12">موافقة المدير المالي / الإدارة</p>
            <p className="text-gray-400">.......................................</p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
