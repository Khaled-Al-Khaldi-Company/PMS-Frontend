"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Building2, Save, ArrowRight, Loader2 } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    fetchData();
  }, [projectId]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const [clientsRes, projectRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/v1/contacts/clients`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/v1/projects/${projectId}`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      setClients(clientsRes.data);
      
      const prj = projectRes.data;
      setFormData({
        name: prj.name,
        code: prj.code,
        description: prj.description || "",
        status: prj.status,
        clientId: prj.clientId || "",
        startDate: prj.startDate ? new Date(prj.startDate).toISOString().split('T')[0] : "",
        endDate: prj.endDate ? new Date(prj.endDate).toISOString().split('T')[0] : ""
      });
    } catch (err) {
      setError("تعذر جلب بيانات المشروع");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${API_BASE_URL}/v1/projects/${projectId}`,
        {
          ...formData,
          startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
          endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      router.push(`/dashboard/projects/${projectId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "حدث خطأ أثناء تحديث المشروع.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
         <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
         <p className="text-slate-400 font-bold">جاري تحميل بيانات المشروع...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 w-full animate-in fade-in zoom-in-95 duration-500 pb-12">
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
            تعديل بيانات المشروع
          </h1>
        </div>
      </div>

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
              <label className="text-sm font-medium text-slate-300">اسم المشروع</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">كود المشروع</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={e => setFormData({...formData, code: e.target.value})}
                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                dir="ltr"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-300">الجهة المالكة</label>
              <select
                required
                value={formData.clientId}
                onChange={e => setFormData({...formData, clientId: e.target.value})}
                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              >
                <option value="" disabled>-- اختر جهة مالكة --</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-300">وصف نطاق العمل</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                rows={3}
                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">تاريخ البداية</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={e => setFormData({...formData, startDate: e.target.value})}
                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3 px-4 text-slate-300 focus:outline-none [color-scheme:dark]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">تاريخ التسليم</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={e => setFormData({...formData, endDate: e.target.value})}
                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3 px-4 text-slate-300 focus:outline-none [color-scheme:dark]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">حالة المشروع</label>
              <select
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value})}
                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              >
                <option value="PLANNING">قيد التخطيط والدراسة</option>
                <option value="ACTIVE">نشط وقيد التنفيذ</option>
                <option value="COMPLETED">مكتمل</option>
                <option value="ON_HOLD">متوقف</option>
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
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-2.5 rounded-xl font-medium bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              <span>حفظ التعديلات</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
