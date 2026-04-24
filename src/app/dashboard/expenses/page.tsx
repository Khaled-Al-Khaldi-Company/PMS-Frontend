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
  Printer,
  FileSpreadsheet
} from "lucide-react";
import { exportToCsv } from "@/lib/exportUtils";
import PrintHeader from "../components/PrintHeader";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [userPerms, setUserPerms] = useState<string[]>([]);
  const [userRole, setUserRole] = useState("");

  // Form
  const [form, setForm] = useState({
    projectId: "",
    description: "",
    amount: "",
    category: "SITE_MATERIALS",
    requestedBy: "مدير الموقع"
  });

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        setUserPerms(u.permissions || []);
        setUserRole(u.role || "");
      } catch (e) {}
    }
    fetchExpenses();
    fetchProjects();
  }, []);

  const hasPermission = (perm: string) => {
    if (userRole === "Admin" || userRole === "System Admin") return true;
    return userPerms.includes(perm);
  };

  const fetchExpenses = async () => {
    setIsLoading(true);
    try {
       const token = localStorage.getItem("token");
       const res = await axios.get(`${API_BASE_URL}/v1/expenses`, {
         headers: { Authorization: `Bearer ${token}` }
       });
       setExpenses(res.data);
    } catch (e) {
       console.error("Failed to load expenses.");
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
    if(!confirm("هل أنت متأكد من تسجيل هذه العهدة؟")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_BASE_URL}/v1/expenses`, form, {
         headers: { Authorization: `Bearer ${token}` }
      });
      setIsFormOpen(false);
      fetchExpenses();
    } catch (e: any) {
      alert("حدث خطأ في التسجيل");
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
      alert("فشل الحذف.");
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
  const currentDate = new Date().toLocaleDateString('ar-SA');

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
            onClick={() => {
              const exportData = expenses.map((exp, idx) => ({
                "م": idx + 1,
                "المرجع": exp.expenseNo,
                "التاريخ": new Date(exp.date).toLocaleDateString('en-US'),
                "المشروع": exp.project?.name || "عام",
                "التصنيف": categoryMap[exp.category] || exp.category,
                "البيان": exp.description,
                "المبلغ": exp.amount
              }));
              exportToCsv(`Expenses_PettyCash_${new Date().toISOString().split('T')[0]}.csv`, exportData);
            }}
            className="flex items-center gap-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-bold px-5 py-3 rounded-xl transition-all border border-indigo-500/30 shadow-lg"
          >
            <FileSpreadsheet size={20} /> تصدير Excel
          </button>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-5 py-3 rounded-xl font-bold transition-all border border-white/10 shadow-lg"
          >
            <Printer size={20} /> كشف تسوية عهدة
          </button>
          {!isFormOpen && hasPermission('EXPENSE_CREATE') && (
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
                       {hasPermission('EXPENSE_APPROVE') && (
                         <button onClick={() => handleDelete(exp.id)} title="حذف" className="p-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded-lg transition-colors border border-rose-500/20 shadow-sm mx-auto flex items-center justify-center">
                           <Trash2 size={16} />
                         </button>
                       )}
                    </td>
                 </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    {/* Print View (Professional Document) */}
    <div className="hidden print:block print:!bg-white print:!text-black min-h-screen pt-8 pb-10 px-8 font-sans" dir="rtl">
      {/* Professional Header */}
      <div className="flex justify-between items-start border-b-4 border-slate-900 pb-6 mb-8 relative">
         <div className="absolute top-0 right-0 w-full h-1 bg-emerald-600 rounded-t"></div>
         <div className="flex flex-col gap-1 mt-2 text-right">
           <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">كشف تسوية عُهدة نقدية ومصروفات</h1>
           <h2 className="text-xl font-bold text-slate-500 uppercase tracking-widest mb-4">Petty Cash Settlement Report</h2>
           
           <div className="bg-slate-100 p-3 rounded-lg border border-slate-200 inline-block text-right">
             <p className="text-sm font-bold text-slate-800">تاريخ الكشف (Date): <span className="font-mono text-emerald-700">{currentDate}</span></p>
             <p className="text-sm font-bold text-slate-800 mt-1">الرقم المرجعي (Ref): <span className="font-mono">PC-{Date.now().toString().slice(-6)}</span></p>
           </div>
         </div>
         
          <PrintHeader />
      </div>

      <table className="w-full text-right border-collapse mb-8 print:w-full">
        <thead>
          <tr className="bg-slate-900 border-2 border-slate-900 text-white font-black text-xs uppercase">
            <th className="p-3 border border-slate-900 w-12 text-center text-slate-200">م</th>
            <th className="p-3 border border-slate-900 text-slate-200">التاريخ</th>
            <th className="p-3 border border-slate-900 text-slate-200">المشروع</th>
            <th className="p-3 border border-slate-900 text-slate-200">التصنيف</th>
            <th className="p-3 border border-slate-900 w-1/3 text-slate-200">البيان والتفاصيل</th>
            <th className="p-3 border border-slate-900 text-left text-slate-200">المبلغ (SAR)</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((exp, idx) => (
            <tr key={exp.id} className="border border-slate-300 text-black break-inside-avoid">
              <td className="p-3 border border-slate-300 text-center font-bold text-sm text-slate-600">{idx + 1}</td>
              <td className="p-3 border border-slate-300 text-sm font-bold font-mono text-slate-800">{new Date(exp.date).toLocaleDateString('en-US')}</td>
              <td className="p-3 border border-slate-300 font-bold text-sm text-slate-900">{exp.project?.name || "عام (مشتريات إدارة)"}</td>
              <td className="p-3 border border-slate-300 font-bold text-sm text-slate-700">{categoryMap[exp.category] || exp.category}</td>
              <td className="p-3 border border-slate-300 text-sm text-slate-900 font-medium">{exp.description}</td>
              <td className="p-3 border border-slate-300 text-left font-black text-sm text-slate-900 bg-slate-50" dir="ltr">{Number(exp.amount).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="flex justify-end mb-16 break-inside-avoid">
        <div className="w-1/2 border-2 border-slate-900 rounded-lg overflow-hidden shadow-md">
           <table className="w-full">
             <tbody>
                <tr className="bg-slate-900 text-white font-black text-lg break-inside-avoid">
                  <td className="p-4 text-right uppercase tracking-widest">الإجمالي الكلي للمصروفات (Total Expenses)</td>
                  <td className="p-4 text-left font-mono text-2xl" dir="ltr">SAR {totalAmount.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                </tr>
             </tbody>
           </table>
        </div>
      </div>

      <div className="mt-16 pt-8 break-inside-avoid border-t-2 border-slate-100 text-black">
        <h3 className="font-black text-lg mb-10 border-b-2 border-slate-800 pb-2 w-max text-slate-800 uppercase tracking-widest">التوقيعات والاعتمادات (Approvals):</h3>
        <div className="grid grid-cols-3 gap-8 text-center text-sm">
          <div className="flex flex-col items-center">
            <p className="font-bold text-slate-800 mb-4 uppercase tracking-widest text-xs">إعداد / صاحب العهدة (Prepared By)</p>
            <div className="border-2 border-slate-200 bg-slate-50 text-slate-700 p-2 rounded-xl inline-block text-center shadow-sm w-48 relative overflow-hidden">
              <div className="absolute inset-0 bg-slate-100 opacity-50"></div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1 border-b border-slate-200 pb-1 relative z-10">مُسجل إلكترونياً (E-Prepared)</p>
              <p className="text-xs font-black mt-1 relative z-10">{(typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}').name : '') || 'مسؤول المصروفات'}</p>
              <p className="text-[9px] font-mono mt-1 relative z-10">{new Date().toLocaleDateString('en-GB')}</p>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <p className="font-bold text-slate-800 mb-16 uppercase tracking-widest text-xs">المراجعة (قسم الحسابات / Finance)</p>
            <p className="text-slate-400 w-full border-b-2 border-dashed border-slate-400 mt-auto"></p>
          </div>
          <div className="flex flex-col items-center">
            <p className="font-bold text-slate-800 mb-16 uppercase tracking-widest text-xs">اعتماد الإدارة العليا (General Manager)</p>
            <p className="text-slate-400 w-full border-b-2 border-dashed border-slate-400 mt-auto"></p>
          </div>
        </div>
      </div>
      
      {/* Print Footer */}
      <div className="fixed bottom-0 left-0 w-full text-center text-[10px] text-slate-400 font-medium py-4 border-t border-slate-200 bg-white">
        <p>This is a computer generated document. No signature is required if sent electronically.</p>
        <p className="mt-1">© {new Date().getFullYear()} PMS Contracting. All rights reserved.</p>
      </div>
    </div>
    </>
  );
}
