"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  Link as LinkIcon, 
  CheckCircle2, 
  Users, 
  RefreshCw,
  Search,
  ServerCrash,
  FolderOpen,
  Zap,
  Loader2
} from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";

export default function MappingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState<string | null>(null);
  
  const [pmsSuppliers, setPmsSuppliers] = useState<any[]>([]);
  const [daftraSuppliers, setDaftraSuppliers] = useState<any[]>([]);
  const [pmsClients, setPmsClients] = useState<any[]>([]);
  const [daftraClients, setDaftraClients] = useState<any[]>([]);
  const [pmsProjects, setPmsProjects] = useState<any[]>([]);
  const [daftraCostCenters, setDaftraCostCenters] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<'suppliers' | 'clients' | 'projects'>('suppliers');

  const [hasConnectionError, setHasConnectionError] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setHasConnectionError(false);
    try {
      const token = localStorage.getItem("token");
      
      const [pmsRes, daftraRes, pmsClientsRes, daftraClientsRes, pmsProjectsRes, costCentersRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/v1/integration/daftra/pms-suppliers`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/v1/integration/daftra/suppliers`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/v1/integration/daftra/pms-clients`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/v1/integration/daftra/clients`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/v1/integration/daftra/pms-projects`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/v1/integration/daftra/cost-centers`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] })),
      ]);
      
      setPmsSuppliers(pmsRes.data);
      setDaftraSuppliers(daftraRes.data);
      setPmsClients(pmsClientsRes.data);
      setDaftraClients(daftraClientsRes.data);
      setPmsProjects(pmsProjectsRes.data);
      setDaftraCostCenters(costCentersRes.data);
    } catch (err) {
      console.error(err);
      setHasConnectionError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkSupplier = async (pmsId: string, daftraId: string | null) => {
    setIsSaving(pmsId);
    try {
      const token = localStorage.getItem(`token");
      await axios.post(`${API_BASE_URL}/v1/integration/daftra/link-supplier/${pmsId}`, 
        { daftraId }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state to reflect the checkmark immediately
      setPmsSuppliers(prev => prev.map(s => s.id === pmsId ? { ...s, daftraSupplierId: daftraId } : s));
    } catch (err: any) {
      alert(`حدث خطأ أثناء حفظ الربط. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsSaving(null);
    }
  };

  const handleLinkClient = async (pmsId: string, daftraId: string | null) => {
    setIsSaving(pmsId);
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_BASE_URL}/v1/integration/daftra/link-client/${pmsId}`, 
        { daftraId }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPmsClients(prev => prev.map(c => c.id === pmsId ? { ...c, daftraClientId: daftraId } : c));
    } catch (err: any) {
      alert(`حدث خطأ أثناء الربط.");
    } finally {
      setIsSaving(null);
    }
  };

  const handleLinkProject = async (pmsId: string, daftraCostCenterId: string | null) => {
    setIsSaving(pmsId);
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_BASE_URL}/v1/integration/daftra/link-project/${pmsId}`,
        { daftraCostCenterId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPmsProjects(prev => prev.map(p => p.id === pmsId ? { ...p, daftraCostCenterId } : p));
    } catch {
      alert(`حدث خطأ أثناء ربط المشروع.");
    } finally {
      setIsSaving(null);
    }
  };



  return (
    <div className="max-w-6xl mx-auto space-y-8 w-full animate-in fade-in zoom-in-95 duration-500 pb-12 relative">
      {/* Background glow */}
      <div className="absolute top-0 right-1/3 w-[600px] h-[600px] bg-emerald-600/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <button 
            onClick={() => router.back()} 
            className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-slate-300 hover:text-white transition-all shadow-lg hover:-translate-x-1"
          >
            <ArrowRight size={22} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3 drop-shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 flex items-center justify-center border border-emerald-500/20 shadow-lg">
                <LinkIcon className="text-emerald-400" size={24} />
              </div>
              لوحة المطابقة الذكية (Data Mapping)
            </h1>
            <p className="text-slate-400 text-sm mt-2 font-medium">
              توجيه آمن: اربط المعرفات بين نظام PMS ومنصة دفترة لمنع التكرار وأخطاء الخوادم (500).
            </p>
          </div>
        </div>

        <button 
          onClick={fetchData} 
          disabled={isLoading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all disabled:opacity-50"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          تحديث البيانات
        </button>
      </div>

      {hasConnectionError && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6 flex flex-col md:flex-row gap-4 items-center">
          <div className="w-12 h-12 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-500 shrink-0">
            <ServerCrash size={24} />
          </div>
          <div>
            <h3 className="text-rose-400 font-bold text-lg mb-1">فشل الاتصال بسيرفرات دفترة</h3>
            <p className="text-rose-300/70 text-sm">تأكد من إدخال "الدومين" و "مفتاح الربط API Key" بشكل صحيح في تبويب (إعدادات الربط) قبل الدخول هنا.</p>
          </div>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-dark border border-white/5 rounded-3xl p-6 sm:p-8 shadow-xl">
        
        <div className="flex border-b border-white/10 mb-8 w-fit gap-1 padding-1 bg-slate-900/50 rounded-xl p-1">
          <button 
            onClick={() => { setActiveTab(`suppliers'); setSearch(''); }}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'suppliers' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            مطابقة الموردين (Suppliers)
          </button>
          <button 
            onClick={() => { setActiveTab('clients'); setSearch(''); }}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'clients' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            مطابقة العملاء (Clients)
          </button>
          <button 
            onClick={() => { setActiveTab('projects'); setSearch(''); }}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'projects' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            🏗️ مراكز التكاليف (Projects)
          </button>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
             <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeTab === 'projects' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
               {activeTab === 'projects' ? <FolderOpen size={20} /> : <Users size={20} />}
             </div>
             <h2 className="text-xl font-bold text-white">
               {activeTab === 'suppliers' ? "مطابقة الموردين (Suppliers)" : activeTab === 'clients' ? "مطابقة العملاء (Clients)" : "ربط المشاريع بمراكز التكاليف"}
             </h2>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder={`ابحث عن ${activeTab === 'suppliers' ? 'مورد' : activeTab === 'clients' ? 'عميل' : 'مشروع'} في PMS...`}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2 px-10 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        <div className="bg-slate-950/50 rounded-2xl border border-white/5 overflow-hidden">
          {isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-3">
              <RefreshCw className="animate-spin text-emerald-500" size={32} />
              <p className="font-medium animate-pulse">جاري جلب القوائم من دفترة...</p>
            </div>
          ) : activeTab === 'projects' ? (
            // ── Projects Tab ───────────────────────────────────────────────
            pmsProjects.filter(p => p.name.includes(search)).length === 0 ? (
              <div className="p-12 text-center text-slate-500 font-medium">لا توجد مشاريع مسجلة في PMS بعد.</div>
            ) : (
              <div className="divide-y divide-white/5">
                <div className="hidden md:flex items-center gap-4 p-4 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-900/80">
                  <div className="flex-1 px-2">اسم المشروع (PMS)</div>
                  <div className="flex-[1.5] px-2 text-emerald-300">مركز التكاليف في دفترة</div>
                  <div className="w-28 text-center">الحالة</div>
                </div>
                {pmsProjects.filter(p => p.name.includes(search)).map((project) => (
                  <div key={project.id} className="flex flex-col md:flex-row items-center gap-4 p-4 hover:bg-white/[0.02] transition-colors group">
                    <div className="flex-1 w-full flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-900/40 flex items-center justify-center text-emerald-300 font-bold text-xs border border-emerald-500/20">
                        {project.name?.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-white block">{project.name}</span>
                        <span className="text-xs text-slate-500">{project.code || 'بدون كود'}</span>
                      </div>
                    </div>

                    <div className="flex-[1.5] w-full flex items-center gap-2 relative group/select">
                      {project.daftraCostCenterId ? (
                        <div className="flex items-center gap-2 w-full relative">
                          <select
                            value={project.daftraCostCenterId || ""}
                            onChange={(e) => handleLinkProject(project.id, e.target.value)}
                            disabled={isSaving === project.id}
                            className="flex-1 bg-emerald-500/5 border border-emerald-500/20 rounded-xl py-2.5 px-4 text-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all appearance-none disabled:opacity-50 pr-10"
                          >
                            {daftraCostCenters.map((cc: any) => (
                              <option key={cc.id} value={cc.id} className="bg-slate-900">
                                {cc.name || `مركز #${cc.id}`}
                              </option>
                            ))}
                          </select>
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-400 text-xs text-opacity-50">▼</div>
                          
                          {/* Unlink Button for Projects */}
                          <button 
                            onClick={() => handleLinkProject(project.id, "")}
                            disabled={isSaving === project.id}
                            title="فك الربط"
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition-colors opacity-0 group-hover/select:opacity-100 disabled:opacity-50"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 w-full relative group/select">
                          <select
                            value=""
                            onChange={(e) => e.target.value && handleLinkProject(project.id, e.target.value)}
                            disabled={isSaving === project.id}
                            className="flex-1 bg-slate-900/50 hover:bg-slate-900 border border-white/10 hover:border-emerald-500/30 rounded-xl py-2.5 px-4 text-slate-400 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all appearance-none disabled:opacity-50 pr-10"
                          >
                            <option value="">-- اختر مركز تكاليف موجود بدفترة لربطه --</option>
                            {daftraCostCenters.map((cc: any) => (
                              <option key={cc.id} value={cc.id} className="bg-slate-900 text-white">
                                {cc.name || `مركز #${cc.id}`}
                              </option>
                            ))}
                          </select>
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-400/50 text-xs">▼</div>
                        </div>
                      )}
                    </div>

                    <div className="w-full md:w-28 flex justify-end md:justify-center">
                      {isSaving === project.id || isCreating === project.id ? (
                        <RefreshCw size={20} className="text-emerald-400 animate-spin" />
                      ) : project.daftraCostCenterId ? (
                        <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-1.5">
                          <CheckCircle2 size={14} className="text-emerald-500" />
                          <span className="text-xs text-emerald-400 font-bold">مربوط #{project.daftraCostCenterId}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 bg-slate-800/50 border border-dashed border-slate-600 rounded-xl px-3 py-1.5">
                          <LinkIcon size={12} className="text-slate-600" />
                          <span className="text-xs text-slate-600 font-bold">غير مربوط</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (activeTab === 'suppliers' ? pmsSuppliers : pmsClients).length === 0 ? (
            <div className="p-12 text-center text-slate-500 font-medium">لا يوجد {activeTab === 'suppliers' ? 'موردين' : 'عملاء'} مسجلين في نظام PMS بعد.</div>
          ) : (
            <div className="divide-y divide-white/5">
              {/* Header */}
              <div className="hidden md:flex items-center gap-4 p-4 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-900/80">
                <div className="flex-1 px-2">{activeTab === 'suppliers' ? 'اسم المورد (PMS)' : 'اسم العميل (PMS)'}</div>
                <div className="flex-[1.5] px-2 text-indigo-300">مطابق لـ (Daftra Account)</div>
                <div className="w-12 text-center">الحالة</div>
              </div>

              {(activeTab === 'suppliers' ? pmsSuppliers : pmsClients).filter(item => item.name.includes(search)).map((item) => (
                <div key={item.id} className="flex flex-col md:flex-row items-center gap-4 p-4 hover:bg-white/[0.02] transition-colors group">
                  <div className="flex-1 w-full flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold text-xs border border-white/10">
                       {item.name?.charAt(0)}
                     </div>
                     <span className="font-bold text-white">{item.name}</span>
                  </div>

                  <div className="flex-[1.5] w-full relative group/select">
                    <select
                      value={activeTab === 'suppliers' ? (item.daftraSupplierId || "") : (item.daftraClientId || "")}
                      onChange={(e) => activeTab === 'suppliers' ? handleLinkSupplier(item.id, e.target.value) : handleLinkClient(item.id, e.target.value)}
                      disabled={isSaving === item.id}
                      className="w-full bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/20 rounded-xl py-2.5 px-4 text-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all appearance-none disabled:opacity-50 pr-10"
                    >
                      <option value="" disabled className="bg-slate-900" style={{ color: '#94a3b8' }}>-- غير مربوط (انقر للاختيار من دفترة) --</option>
                      {(activeTab === 'suppliers' ? daftraSuppliers : daftraClients).map(ds => (
                        <option key={ds.id} value={ds.id} className="bg-slate-900 text-white font-medium">
                          {ds.business_name || ds.name || `حساب #${ds.id}`}
                        </option>
                      ))}
                    </select>
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-400 text-xs">▼</div>
                    
                    {/* Unlink Button */}
                    {((activeTab === 'suppliers' && item.daftraSupplierId) || (activeTab === 'clients' && item.daftraClientId)) && (
                      <button 
                        onClick={() => activeTab === 'suppliers' ? handleLinkSupplier(item.id, "") : handleLinkClient(item.id, "")}
                        disabled={isSaving === item.id}
                        title="فك الربط"
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition-colors opacity-0 group-hover/select:opacity-100 disabled:opacity-50"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                      </button>
                    )}
                  </div>

                  <div className="w-full md:w-16 flex justify-end md:justify-center">
                    {isSaving === item.id ? (
                      <RefreshCw size={20} className="text-emerald-400 animate-spin" />
                    ) : (activeTab === 'suppliers' ? item.daftraSupplierId : item.daftraClientId) ? (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20" title="تم الربط بنجاح">
                           <CheckCircle2 size={16} />
                        </div>
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full border border-dashed border-slate-600 flex items-center justify-center text-slate-600" title="بانتظار الربط">
                         <LinkIcon size={14} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
