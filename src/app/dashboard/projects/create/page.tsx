"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Building2, Save, ArrowRight, Loader2, ExternalLink } from "lucide-react";
import axios from "axios";
import Link from "next/link";

export default function CreateProjectPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [clients, setClients] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    status: "PLANNING",
    clientId: "",
    startDate: "",
    endDate: ""
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:4000/v1/contacts/clients", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClients(res.data);
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:4000/v1/projects",
        {
          ...formData,
          startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
          endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      router.push("/dashboard/projects");
    } catch (err: any) {
      setError(err.response?.data?.message || "حدث خطأ أثناء حفظ المشروع. تأكد من أن كود المشروع غير مستخدم مسبقاً.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 w-full animate-in fade-in zoom-in-95 duration-500 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.back()}
          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
        >
          <ArrowRight size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Building2 className="text-blue-500" size={24} />
            إنشاء مشروع جديد
          </h1>
          <p className="text-slate-400 text-sm mt-1">قم بتعبئة التفاصيل الأساسية لاعتماد المشروع في النظام.</p>
        </div>
      </div>

      {/* Form Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-dark border border-white/5 rounded-3xl p-6 sm:p-8"
      >
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">اسم المشروع <span className="text-rose-500">*</span></label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                placeholder="مثال: إنشاءات مستشفى العليا..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">كود المشروع المرجعي <span className="text-rose-500">*</span></label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={e => setFormData({...formData, code: e.target.value})}
                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                placeholder="مثال: PRJ-2026-001"
                dir="ltr"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <div className="flex justify-between items-end">
                <label className="text-sm font-medium text-slate-300">الجهة المالكة (عميل المشروع) <span className="text-rose-500">*</span></label>
                <Link href="/dashboard/contacts" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
                  <ExternalLink size={12} /> إدارة وإضافة عملاء
                </Link>
              </div>
              <select
                required
                value={formData.clientId}
                onChange={e => setFormData({...formData, clientId: e.target.value})}
                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all cursor-pointer"
              >
                <option value="" disabled>-- اختر جهة مالكة من دليل العملاء --</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name} {client.daftraClientId ? '🟢 (مربوط بدفترة)' : '🔴 (غير مربوط)'}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-300">وصف نطاق العمل</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                rows={3}
                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                placeholder="تفاصيل موجزة عن المشروع والموقع..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">تاريخ البداية (المخطط)</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={e => setFormData({...formData, startDate: e.target.value})}
                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3 px-4 text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all [color-scheme:dark]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">تاريخ التسليم المتوقع</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={e => setFormData({...formData, endDate: e.target.value})}
                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3 px-4 text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all [color-scheme:dark]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">حالة المشروع المبدئية</label>
              <select
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value})}
                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none cursor-pointer"
              >
                <option value="PLANNING">قيد التخطيط والدراسة</option>
                <option value="ACTIVE">نشط وقيد التنفيذ</option>
                <option value="ON_HOLD">ترسية متوقفة</option>
              </select>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 flex gap-4 justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2.5 rounded-xl font-medium text-slate-300 hover:bg-white/5 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-8 py-2.5 rounded-xl font-medium bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all disabled:opacity-50"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              <span>حفظ المشروع واعتماده</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
