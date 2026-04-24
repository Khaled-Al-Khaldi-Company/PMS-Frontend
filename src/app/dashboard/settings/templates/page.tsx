"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutTemplate, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  X, 
  Loader2, 
  FileText, 
  ScrollText, 
  CheckCircle2, 
  AlertCircle,
  ArrowLeft
} from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";
import Link from "next/link";

export default function QuotationTemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    technicalOffer: "",
    termsConditions: ""
  });

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/v1/quotation-templates`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTemplates(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    try {
      const token = localStorage.getItem("token");
      if (editingId) {
        await axios.patch(`${API_BASE_URL}/v1/quotation-templates/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessage({type: 'success', text: 'تم تحديث القالب بنجاح'});
      } else {
        await axios.post(`${API_BASE_URL}/v1/quotation-templates`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessage({type: 'success', text: 'تم إنشاء القالب بنجاح'});
      }
      setFormData({ name: "", technicalOffer: "", termsConditions: "" });
      setIsFormOpen(false);
      setEditingId(null);
      fetchTemplates();
    } catch (err: any) {
      setMessage({type: 'error', text: err.response?.data?.message || 'فشل الحفظ'});
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (template: any) => {
    setFormData({
      name: template.name,
      technicalOffer: template.technicalOffer || "",
      termsConditions: template.termsConditions || ""
    });
    setEditingId(template.id);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا القالب؟')) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/v1/quotation-templates/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTemplates();
    } catch (err) {
      alert('فشل الحذف');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-8 min-h-screen pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/settings" className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 shadow-lg">
                <LayoutTemplate className="text-indigo-400" size={28} />
              </div>
              قوالب عروض الأسعار
            </h1>
          </div>
          <p className="text-slate-400 font-medium mr-12">أدر القوالب الجاهزة للمواصفات والشروط لسرعة إنشاء عروض الأسعار.</p>
        </div>

        <button 
          onClick={() => {
            setIsFormOpen(true);
            setEditingId(null);
            setFormData({ name: "", technicalOffer: "", termsConditions: "" });
          }}
          className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-2xl font-bold shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5 active:scale-95"
        >
          <Plus size={20} />
          إنشاء قالب جديد
        </button>
      </div>

      {message && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-2xl flex items-center gap-3 border ${
            message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span className="font-bold">{message.text}</span>
        </motion.div>
      )}

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 gap-4 text-slate-500">
            <Loader2 size={40} className="animate-spin text-indigo-500" />
            <p className="font-bold tracking-widest uppercase text-xs">جارٍ تحميل القوالب...</p>
          </div>
        ) : templates.length === 0 ? (
          <div className="col-span-full glass-dark border border-white/5 rounded-3xl p-12 text-center space-y-4">
             <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto text-slate-600">
               <LayoutTemplate size={40} />
             </div>
             <div className="space-y-1">
               <h3 className="text-xl font-bold text-white">لا توجد قوالب حالياً</h3>
               <p className="text-slate-500">ابدأ بإنشاء أول قالب لتسهيل عمل فريق المبيعات.</p>
             </div>
          </div>
        ) : (
          templates.map((template) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              key={template.id}
              className="glass-dark border border-white/5 rounded-3xl p-6 hover:border-indigo-500/30 transition-all group relative overflow-hidden flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">{template.name}</h3>
                  <p className="text-xs text-slate-500 font-mono">ID: {template.id.slice(0,8)}</p>
                </div>
                <div className="flex gap-1">
                   <button onClick={() => handleEdit(template)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all" title="تعديل">
                     <Edit3 size={18} />
                   </button>
                   <button onClick={() => handleDelete(template.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all" title="حذف">
                     <Trash2 size={18} />
                   </button>
                </div>
              </div>

              <div className="space-y-3 mt-2 flex-1">
                <div className="p-3 bg-slate-900/50 rounded-xl border border-white/5 space-y-1">
                   <div className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                     <FileText size={10} /> العرض الفني
                   </div>
                   <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                     {template.technicalOffer || 'لا يوجد نص'}
                   </p>
                </div>
                <div className="p-3 bg-slate-900/50 rounded-xl border border-white/5 space-y-1">
                   <div className="flex items-center gap-2 text-[10px] font-black text-blue-400 uppercase tracking-widest">
                     <ScrollText size={10} /> الشروط والأحكام
                   </div>
                   <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                     {template.termsConditions || 'لا يوجد نص'}
                   </p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-4xl glass-dark border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <div className="p-8 space-y-8">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-black text-white flex items-center gap-3">
                      {editingId ? <Edit3 className="text-indigo-400" /> : <Plus className="text-indigo-400" />}
                      {editingId ? 'تعديل قالب' : 'إنشاء قالب جديد'}
                    </h2>
                    <p className="text-slate-400 text-sm">أدخل البيانات الأساسية للقالب لاستخدامها لاحقاً.</p>
                  </div>
                  <button onClick={() => setIsFormOpen(false)} className="p-3 bg-slate-900 text-slate-400 hover:text-white rounded-2xl border border-white/5 transition-all">
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-2">اسم القالب</label>
                    <input 
                      type="text" 
                      required
                      placeholder="مثل: قالب أعمال الواجهات، قالب السباكة..."
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 px-6 text-white text-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-2 flex items-center gap-2">
                        <FileText size={14} className="text-indigo-400" /> نص العرض الفني / المواصفات
                      </label>
                      <textarea 
                        rows={8}
                        value={formData.technicalOffer}
                        onChange={e => setFormData({...formData, technicalOffer: e.target.value})}
                        className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:border-indigo-500 transition-all shadow-inner resize-none"
                        placeholder="أدخل المواصفات الفنية الافتراضية هنا..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-2 flex items-center gap-2">
                        <ScrollText size={14} className="text-blue-400" /> نص الشروط والأحكام
                      </label>
                      <textarea 
                        rows={8}
                        value={formData.termsConditions}
                        onChange={e => setFormData({...formData, termsConditions: e.target.value})}
                        className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:border-indigo-500 transition-all shadow-inner resize-none"
                        placeholder="أدخل الشروط والأحكام الافتراضية هنا..."
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex gap-4">
                    <button 
                      type="button" 
                      onClick={() => setIsFormOpen(false)}
                      className="flex-1 py-4 bg-slate-900 text-slate-300 font-bold rounded-2xl border border-white/5 hover:bg-slate-800 transition-all"
                    >
                      إلغاء
                    </button>
                    <button 
                      type="submit" 
                      disabled={isSaving}
                      className="flex-[2] py-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />}
                      <span>{editingId ? 'تحديث القالب' : 'حفظ القالب الجديد'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
