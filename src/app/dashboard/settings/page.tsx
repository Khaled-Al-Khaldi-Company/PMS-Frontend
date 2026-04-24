"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Settings, Link as LinkIcon, Database, ArrowLeftRight, 
  CheckCircle2, Server, Key, Save, AlertCircle, RefreshCcw, LayoutTemplate,
  Trash2, ShieldAlert, AlertTriangle, X, Loader2
} from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [domain, setDomain] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{type: 'idle' | 'success' | 'error', message: string}>({type: 'idle', message: ''});
  const [isLoading, setIsLoading] = useState(true);

  // Reset state
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/v1/settings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setApiKey(data["DAFTRA_API_KEY"] || "");
          setDomain(data["DAFTRA_DOMAIN"] || "");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleDomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    // Auto-clean pasted URLs: "https://gkke.daftra.com/" -> "gkke"
    val = val.replace(/^https?:\/\//i, ''); // remove http:// or https://
    val = val.replace(/\.daftra\.com.*/i, ''); // remove .daftra.com and anything after
    val = val.replace(/[\/]/g, ''); // remove any slashes
    setDomain(val);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/v1/settings`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          DAFTRA_API_KEY: apiKey,
          DAFTRA_DOMAIN: domain
        })
      });
      if (res.ok) {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`فشل الحفظ: ${errorData.message || res.statusText}`);
      }
    } catch (err: any) {
      console.error(err);
      alert(`خطأ في الشبكة أثناء الحفظ: ${err.message}`);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncStatus({type: 'idle', message: ''});
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/v1/integration/daftra/sync/cost-centers`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setSyncStatus({type: 'success', message: 'تمت مزامنة مراكز التكلفة والمشاريع مع دفترة بنجاح!'});
      } else {
        const errorData = await res.json().catch(() => ({}));
        let extMsg = errorData.message || 'فشل الاتصال بـ دفترة، يرجى التحقق من المفتاح والدومين.';
        if (Array.isArray(extMsg)) extMsg = extMsg[0];
        setSyncStatus({type: 'error', message: typeof extMsg === 'string' ? extMsg : 'فشل مجهول.'});
      }
    } catch (err: any) {
      console.error(err);
      setSyncStatus({type: 'error', message: `مشكلة في الاتصال: ${err.message || String(err)}`});
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncStatus({type: 'idle', message: ''}), 6000);
    }
  };

  const handleReset = async () => {
    if (resetConfirmText !== 'تصفير') return;
    setIsResetting(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_BASE_URL}/v1/settings/reset-data`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResetDone(true);
      setShowResetModal(false);
      setResetConfirmText("");
      setTimeout(() => setResetDone(false), 5000);
    } catch (err: any) {
      alert(err.response?.data?.message || "فشل التصفير. يرجى المحاولة مجدداً.");
    } finally {
      setIsResetting(false);
    }
  };

  const syncModules = [
    {
      title: "مستخلصات الدفع (Invoices)",
      pms: "نظام إدارة المشاريع (PMS)",
      daftra: "فواتير شراء مركز التكلفة (Bills)",
      status: "متزامن",
      desc: "أي مستخلص يُعتمد يتم إرساله إلى دفترة كفاتورة مشتريات وتوجيهها لمركز تكلفة المشروع.",
      styles: {
        badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        borderHover: "hover:border-emerald-500/30",
        gradientLine: "from-transparent via-emerald-500/50 to-transparent",
        pmsColor: "text-emerald-300"
      }
    },
    {
      title: "العقود والمقاولين (Contracts)",
      pms: "سجل المقاولين في PMS",
      daftra: "دليل الموردين الذكي (Vendors)",
      status: "قيد المزامنة",
      desc: "تُسجّل بيانات الموردين والمقاولين من PMS إلى دفترة لإدارة الحسابات بصورة مركزية.",
      styles: {
        badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        borderHover: "hover:border-blue-500/30",
        gradientLine: "from-transparent via-blue-500/50 to-transparent",
        pmsColor: "text-blue-300"
      }
    },
    {
      title: "تتبع المشاريع (Projects)",
      pms: "المشروع وتفاصيله (PMS)",
      daftra: "مراكز التكلفة (Cost Centers)",
      status: "متزامن",
      desc: "لضمان فصل الإيرادات والمصروفات، يُنشأ لكل مشروع (مركز تكلفة) موازٍ في دفترة.",
      styles: {
        badge: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
        borderHover: "hover:border-indigo-500/30",
        gradientLine: "from-transparent via-indigo-500/50 to-transparent",
        pmsColor: "text-indigo-300"
      }
    },
    {
      title: "أوامر الشراء (Purchase Orders)",
      pms: "طلبات الشراء P.O (PMS)",
      daftra: "أوامر الشراء الرسمية (Daftra)",
      status: "مخطط",
      desc: "تحويل طلبات الإمداد الميدانية إلى دورة محاسبية نظامية في دفترة للموافقات والدفع.",
      styles: {
        badge: "bg-orange-500/10 text-orange-400 border-orange-500/20",
        borderHover: "hover:border-orange-500/30",
        gradientLine: "from-transparent via-orange-500/50 to-transparent",
        pmsColor: "text-orange-300"
      }
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 w-full animate-in fade-in zoom-in-95 duration-500 pb-12 relative">
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-slate-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3 drop-shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-600/20 to-slate-500/10 flex items-center justify-center border border-slate-500/20 shadow-lg">
              <Settings className="text-slate-400" size={24} />
            </div>
            الإعدادات العـامة وربط الـ ERP
          </h1>
          <p className="text-slate-400 text-sm mt-2 font-medium">لوحة التحكم السحابية لربط نظام PMS مع منصة دفترة المحاسبية.</p>
        </div>
        
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          <CheckCircle2 size={18} />
          <span className="font-bold text-sm">الاتصال نشط (Connected)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Connection Form Space */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-dark border border-white/5 rounded-3xl p-6 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-emerald-500 to-transparent" />
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
                <LinkIcon size={20} />
              </div>
              <h2 className="text-xl font-bold text-white">بيانات الـ API (دفترة)</h2>
            </div>
            
            <form onSubmit={handleSave} className="space-y-5" autoComplete="off">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-300 flex items-center gap-2">
                    <Server size={14} className="text-emerald-400" /> الدومين الفرعي (Subdomain)
                  </label>
                  {domain.includes('@') && (
                    <span className="text-xs text-rose-400 font-medium animate-pulse">
                      يرجى إدخال اسم الدومين فقط وليس الإيميل
                    </span>
                  )}
                </div>
                <div className="relative flex items-center bg-slate-900/60 border border-white/10 rounded-xl focus-within:border-emerald-500/50 transition-colors" dir="ltr">
                  <input 
                    type="text" 
                    placeholder="companyname" 
                    value={domain}
                    onChange={handleDomainChange}
                    className="flex-1 bg-transparent py-3 pl-4 pr-1 text-white font-mono text-sm focus:outline-none focus:ring-0"
                    dir="ltr"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                  />
                  <span className="text-slate-500 font-mono text-sm pr-4 pl-1 pointer-events-none">.daftra.com</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300 flex items-center gap-2">
                  <Key size={14} className="text-emerald-400" /> مفتاح الربط (API Token)
                </label>
                <input 
                  type="password" 
                  placeholder="••••••••••••••••••••••••" 
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-3 px-4 text-emerald-400 font-mono text-sm tracking-widest focus:outline-none focus:border-emerald-500/50"
                  dir="ltr"
                  autoComplete="new-password"
                />
              </div>

              <div className="pt-2">
                <button type="submit" className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                  {isSaved ? <CheckCircle2 size={18} className="animate-in zoom-in" /> : <Save size={18} />}
                  <span>{isSaved ? "تم الحفظ بنجاح" : "حفظ الإعدادات"}</span>
                </button>
              </div>
            </form>

            <div className="mt-6 p-4 rounded-xl bg-slate-800/40 border border-white/5 text-sm text-slate-400 flex items-start gap-3">
              <AlertCircle size={18} className="text-amber-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">تأكد من السماح بصلاحيات الـ API للمستخلصات والفواتير من لوحة تحكم حسابك في دفترة.</p>
            </div>

            <div className="mt-6">
              <a href="/dashboard/settings/mappings" className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 to-indigo-500/5 hover:from-indigo-500/20 hover:to-indigo-500/10 border border-indigo-500/20 hover:border-indigo-500/40 transition-all text-indigo-300 group shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center shadow-inner">
                    <ArrowLeftRight size={20} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white mb-0.5">لوحة المطابقة اليدوية الذكية</h3>
                    <p className="text-xs text-slate-400">اربط معرفات الموردين لمنع أخطاء الترحيل</p>
                  </div>
                </div>
                <div className="text-slate-500 group-hover:text-white transition-colors bg-white/5 p-1.5 rounded-lg group-hover:-translate-x-1 duration-300">
                  <LayoutTemplate size={16} />
                </div>
              </a>

              <a href="/dashboard/settings/templates" className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 hover:from-emerald-500/20 hover:to-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/40 transition-all text-emerald-300 group shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center shadow-inner">
                    <LayoutTemplate size={20} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white mb-0.5">قوالب عروض الأسعار</h3>
                    <p className="text-xs text-slate-400">تحكم بنصوص المواصفات والشروط الجاهزة</p>
                  </div>
                </div>
                <div className="text-slate-500 group-hover:text-white transition-colors bg-white/5 p-1.5 rounded-lg group-hover:-translate-x-1 duration-300">
                  <Save size={16} />
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Sync Logic Flow */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-dark border border-white/5 rounded-3xl p-6 relative overflow-hidden shadow-2xl">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8 pb-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">
                  <Database size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">خريطة مزامنة البيانات</h2>
                  <p className="text-sm text-slate-400 mt-1">توضح كيف يتم ترحيل التكاليف والإيرادات للبرنامج المالي.</p>
                </div>
              </div>
              <button 
                onClick={handleSync}
                disabled={isSyncing}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 text-sm font-bold transition-all disabled:opacity-50"
              >
                <RefreshCcw size={16} className={isSyncing ? "animate-spin" : ""} />
                مزامنة قسرية للبيانات
              </button>
            </div>

            {syncStatus.type !== 'idle' && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl border mb-6 flex items-start gap-3 ${
                  syncStatus.type === 'success' 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                    : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                }`}
              >
                {syncStatus.type === 'success' ? <CheckCircle2 size={20} className="shrink-0" /> : <AlertCircle size={20} className="shrink-0" />}
                <p className="font-bold text-sm leading-relaxed">{syncStatus.message}</p>
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {syncModules.map((mod, i) => (
               <motion.div 
                 key={i}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: i * 0.1 }}
                 className={`p-5 rounded-2xl bg-slate-900/50 border border-white/5 ${mod.styles.borderHover} transition-all flex flex-col justify-between group relative overflow-hidden`}
               >
                 <div className={`absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r ${mod.styles.gradientLine} opacity-0 group-hover:opacity-100 transition-opacity`} />
                 
                 <div className="mb-4">
                   <div className="flex justify-between items-start mb-2">
                     <h3 className="font-bold text-white text-base">{mod.title}</h3>
                     <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-md font-bold border ${mod.styles.badge}`}>
                       {mod.status}
                     </span>
                   </div>
                   <p className="text-sm text-slate-400 leading-relaxed">{mod.desc}</p>
                 </div>

                 <div className="flex flex-col gap-2 mt-auto">
                   <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-white/5">
                     <span className="text-xs text-slate-300 font-medium">نظام PMS</span>
                     <span className={`text-xs font-bold font-mono ${mod.styles.pmsColor}`}>{mod.pms}</span>
                   </div>
                   <div className="flex justify-center -my-3 relative z-10">
                     <div className="bg-slate-900 p-1 border border-white/10 rounded-full">
                       <ArrowLeftRight size={14} className="text-slate-500" />
                     </div>
                   </div>
                   <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/80 border border-white/10 shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)]">
                     <span className="text-xs text-slate-300 font-medium">برنامج دفترة</span>
                     <span className="text-xs font-bold text-emerald-400">{mod.daftra}</span>
                   </div>
                 </div>
               </motion.div>
              ))}
            </div>

          </div>
        </div>
      </div>

      {/* ─── DANGER ZONE ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative overflow-hidden rounded-3xl border border-rose-500/30 bg-rose-950/20 p-6 shadow-[0_0_40px_rgba(239,68,68,0.08)]"
      >
        {/* Top red bar */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500 to-transparent" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0 mt-0.5">
              <ShieldAlert size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-rose-400 flex items-center gap-2">
                <AlertTriangle size={18} className="animate-pulse" />
                منطقة الخطر – تصفير البيانات
              </h2>
              <p className="text-sm text-rose-300/60 mt-1 max-w-xl leading-relaxed">
                سيتم حذف <strong className="text-rose-300">جميع البيانات التشغيلية</strong> بشكل نهائي وغير قابل للاسترداد:
                المشاريع، العقود، المستخلصات، الموردين، المواد، طلبات الشراء، والعروض السعرية.
                <br />
                <span className="text-rose-400/80 font-bold">يُحتفظ بـ: المستخدمين، الأدوار، وإعدادات النظام.</span>
              </p>
            </div>
          </div>

          <button
            id="btn-reset-data"
            onClick={() => { setShowResetModal(true); setResetConfirmText(""); }}
            className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 hover:border-rose-500/70 text-rose-400 hover:text-rose-300 text-sm font-black transition-all shadow-lg hover:shadow-rose-500/20 whitespace-nowrap group"
          >
            <Trash2 size={18} className="group-hover:animate-bounce" />
            تصفير بيانات النظام
          </button>
        </div>

        {/* Success banner after reset */}
        <AnimatePresence>
          {resetDone && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
            >
              <CheckCircle2 size={20} className="shrink-0" />
              <p className="font-bold text-sm">✅ تم تصفير جميع البيانات بنجاح! النظام جاهز للاختبار من الصفر.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ─── RESET CONFIRM MODAL ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showResetModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.7)' }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowResetModal(false); }}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="relative w-full max-w-lg bg-slate-950 border border-rose-500/40 rounded-3xl p-8 shadow-[0_0_80px_rgba(239,68,68,0.25)]"
            >
              {/* Top glow */}
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500 to-transparent rounded-t-3xl" />
              
              {/* Close btn */}
              <button
                onClick={() => setShowResetModal(false)}
                className="absolute top-4 left-4 p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={18} />
              </button>

              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-rose-500/10 border-2 border-rose-500/30 flex items-center justify-center text-rose-500">
                    <AlertTriangle size={36} />
                  </div>
                  <div className="absolute inset-0 rounded-full animate-ping bg-rose-500/10" />
                </div>
              </div>

              <h3 className="text-2xl font-black text-center text-white mb-2">تأكيد نهائي للتصفير</h3>
              <p className="text-center text-slate-400 text-sm mb-6 leading-relaxed">
                هذا الإجراء <strong className="text-rose-400">لا يمكن التراجع عنه</strong>.
                سيتم حذف جميع المشاريع والعقود والمستخلصات والموردين والمواد وطلبات الشراء نهائياً.
              </p>

              {/* What will be deleted */}
              <div className="mb-6 p-4 rounded-2xl bg-rose-950/40 border border-rose-500/20 space-y-1.5">
                {['المشاريع وبنود الكميات (BOQ)', 'العقود والمستخلصات', 'الموردين والعملاء', 'طلبات الشراء والمواد', 'العروض السعرية'].map(item => (
                  <div key={item} className="flex items-center gap-2 text-sm text-rose-300/80">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>

              {/* Confirm input */}
              <div className="space-y-2 mb-6">
                <label className="text-sm font-bold text-slate-300">
                  اكتب <span className="text-rose-400 font-black font-mono bg-rose-500/10 px-2 py-0.5 rounded-lg">تصفير</span> للتأكيد:
                </label>
                <input
                  id="reset-confirm-input"
                  type="text"
                  value={resetConfirmText}
                  onChange={e => setResetConfirmText(e.target.value)}
                  placeholder="اكتب: تصفير"
                  className="w-full bg-slate-900 border border-rose-500/30 focus:border-rose-500/70 rounded-xl py-3 px-4 text-white font-mono text-center text-lg tracking-wider focus:outline-none transition-colors"
                  autoComplete="off"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 font-bold transition-all"
                >
                  إلغاء
                </button>
                <button
                  id="btn-confirm-reset"
                  onClick={handleReset}
                  disabled={resetConfirmText !== 'تصفير' || isResetting}
                  className="flex-1 py-3 rounded-xl font-black text-white transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-rose-700 to-red-600 hover:from-rose-600 hover:to-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] disabled:shadow-none"
                >
                  {isResetting ? (
                    <><Loader2 size={18} className="animate-spin" /> جارٍ التصفير...</>
                  ) : (
                    <><Trash2 size={18} /> تأكيد التصفير النهائي</>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
