"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, 
  ArrowRight, 
  Calendar,
  User,
  Activity,
  HardHat,
  CheckCircle2,
  Clock,
  Wallet,
  FileSignature,
  ClipboardList,
  PieChart,
  Loader2,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  Plus,
  X
} from "lucide-react";
import Link from "next/link";

export default function ProjectDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'BOQ' | 'CONTRACTS' | 'DAFTRA'>('OVERVIEW');

  // BOQ ADD STATE
  const [isBoqModalOpen, setIsBoqModalOpen] = useState(false);
  const [isSubmittingBoq, setIsSubmittingBoq] = useState(false);
  const [newBoq, setNewBoq] = useState({ itemCode: '', description: '', unit: 'م٢', quantity: 1, unitPrice: 0 });

  useEffect(() => {
    if (projectId) fetchProjectDetails();
  }, [projectId]);

  const fetchProjectDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/v1/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProject(res.data);
    } catch (err) {
      console.error(err);
      alert(`استحالة الوصول للمشروع، الرجاء المحاولة مجدداً.");
      router.push(`/dashboard/projects');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBoq = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingBoq(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_BASE_URL}/v1/projects/${projectId}/boq`, newBoq, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsBoqModalOpen(false);
      setNewBoq({ itemCode: `', description: '', unit: 'م٢', quantity: 1, unitPrice: 0 });
      fetchProjectDetails(); // Refresh the table automatically
    } catch (err) {
      console.error(err);
      alert(`حدث خطأ أثناء إضافة بند الكميات.");
    } finally {
      setIsSubmittingBoq(false);
    }
  };

  const statusMap: Record<string, any> = {
    PLANNING: { label: "قيد التخطيط", color: "text-amber-400", border: "border-amber-500/30", bg: "bg-amber-500/10", glow: "from-amber-500/20", icon: Clock },
    ACTIVE: { label: "نشط (قيد التنفيذ)", color: "text-blue-400", border: "border-blue-500/30", bg: "bg-blue-500/10", glow: "from-blue-500/20", icon: HardHat },
    COMPLETED: { label: "مكتمل", color: "text-emerald-400", border: "border-emerald-500/30", bg: "bg-emerald-500/10", glow: "from-emerald-500/20", icon: CheckCircle2 },
    ON_HOLD: { label: "متوقف", color: "text-rose-400", border: "border-rose-500/30", bg: "bg-rose-500/10", glow: "from-rose-500/20", icon: Activity },
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-500/20 rounded-full animate-ping absolute top-0 right-0"></div>
          <Loader2 className="animate-spin text-blue-500 relative z-10" size={64} strokeWidth={1.5} />
        </div>
        <p className="text-slate-400 mt-6 text-sm font-bold tracking-wider uppercase animate-pulse">جاري تحميل لوحة تحكم المشروع...</p>
      </div>
    );
  }

  if (!project) return null;

  const stat = statusMap[project.status] || statusMap['PLANNING'];
  const StatusIcon = stat.icon;

  // Calculators
  const totalBoqValue = project.boqItems?.reduce((acc: number, curr: any) => acc + (curr.quantity * curr.unitPrice), 0) || 0;
  const executedValue = project.boqItems?.reduce((acc: number, curr: any) => acc + (curr.executedQty * curr.unitPrice), 0) || 0;
  const progressPercent = totalBoqValue > 0 ? (executedValue / totalBoqValue) * 100 : 0;
  // Separate contracts calculation
  const subContractsValue = project.contracts
    ?.filter((c: any) => c.type !== 'MAIN_CONTRACT')
    .reduce((acc: number, curr: any) => acc + Number(curr.totalValue), 0) || 0;
    
  const mainContractValue = project.contracts
    ?.find((c: any) => c.type === 'MAIN_CONTRACT')?.totalValue || project.budget || totalBoqValue;
  // Real revenue = sum of certified invoice gross amounts
  const totalCertifiedRevenue = project.invoices
    ?.filter((inv: any) => inv.status === 'CERTIFIED')
    .reduce((acc: number, inv: any) => acc + Number(inv.grossAmount || 0), 0) || 0;

  // Real cost = sum of certified invoice net amounts (what we pay to subcontractors)
  const totalCertifiedCost = project.invoices
    ?.filter((inv: any) => inv.status === 'CERTIFIED')
    .reduce((acc: number, inv: any) => acc + Number(inv.netAmount || 0), 0) || 0;

  const certifiedInvoicesCount = project.invoices?.filter((inv: any) => inv.status === 'CERTIFIED').length || 0;

  return (
    <div className="space-y-8 w-full block animate-in fade-in zoom-in-95 duration-500 max-w-[1600px] mx-auto pb-12 relative">
      {/* Dynamic Glow Background */}
      <div className={`absolute top-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-bl ${stat.glow} to-transparent rounded-full blur-[150px] pointer-events-none -z-10`} />

      {/* Hero Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <button onClick={() => router.push('/dashboard/projects')} className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-slate-300 hover:text-white transition-all shadow-lg hover:-translate-x-1">
            <ArrowRight size={22} />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
               <h1 className="text-4xl font-black text-white tracking-tight drop-shadow-sm line-clamp-1">
                 {project.name}
               </h1>
               <div className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold tracking-wider rounded-lg border ${stat.border} ${stat.bg} ${stat.color}`}>
                 <StatusIcon size={14} /> {stat.label}
               </div>
            </div>
            <div className="flex items-center gap-4 text-sm font-medium">
              <span className="text-slate-400 bg-slate-900/50 px-2.5 py-1 rounded-md border border-slate-800 font-mono uppercase tracking-widest text-[11px] shadow-inner">
                كود: {project.code}
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <Building2 size={14} className="text-blue-500" />
                {project.client?.name || "عميل النظام الداخلي"}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <Link href={`/dashboard/contracts/create?project=${project.id}`} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all shadow-lg text-sm">
            <FileSignature size={18} /> عقد جديد
          </Link>
          <Link href={`/dashboard/invoices/create?project=${project.id}`} className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:-translate-y-1 text-sm">
            <Wallet size={18} /> مستخلص جديد
          </Link>
        </div>
      </div>

      {/* Smart Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
        {[
          { id: 'OVERVIEW', label: 'اللوحة الرئيسية', icon: PieChart },
          { id: 'BOQ', label: 'بنود الأعمال (BOQ)', icon: ClipboardList, badge: project.boqItems?.length },
          { id: 'CONTRACTS', label: 'العقود (رئيسي / باطن)', icon: FileSignature, badge: project.contracts?.length },
          { id: 'DAFTRA', label: 'مزامنة دفترة (ERP)', icon: Activity, badge: 'Live' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all relative ${
              activeTab === tab.id 
                ? tab.id === 'DAFTRA' ? 'text-white bg-emerald-500/10 border-emerald-500/30' : 'text-white bg-blue-500/10 border-blue-500/20' 
                : 'text-slate-400 hover:text-white hover:bg-white/5 border-transparent'
            } border flex-1 sm:flex-none whitespace-nowrap`}
          >
            <tab.icon size={18} className={activeTab === tab.id ? (tab.id === 'DAFTRA' ? 'text-emerald-400 animate-pulse' : 'text-blue-400') : ''} />
            {tab.label}
            {tab.badge !== undefined && (
              <span className={`px-2 py-0.5 rounded-md text-[10px] ml-1 uppercase tracking-wider ${
                activeTab === tab.id 
                  ? tab.id === 'DAFTRA' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-blue-500/20 text-blue-300' 
                  : 'bg-slate-800 text-slate-500 font-mono'
              }`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
           key={activeTab}
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -10 }}
           transition={{ duration: 0.2 }}
        >
          
          {/* OVERVIEW TAB */}
          {activeTab === 'OVERVIEW' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Financial Progress Card */}
              <div className="lg:col-span-2 glass-dark border border-white/5 rounded-3xl p-8 relative overflow-hidden shadow-2xl flex flex-col justify-between">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />
                 
                 <div className="relative z-10 flex justify-between items-start mb-10">
                   <div>
                     <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                       <Wallet size={20} className="text-emerald-400" /> الحالة المالية والحصر للمشروع
                     </h3>
                     <p className="text-sm text-slate-400">يعكس هذا المؤشر حجم الأعمال المنفذة مقابل إجمالي الكميات المقررة (BOQ).</p>
                   </div>
                   <div className="text-right">
                     <p className="text-3xl font-black text-emerald-400 tracking-tight drop-shadow-sm">{progressPercent.toFixed(1)}%</p>
                     <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">نسبة الإنجاز المالي</p>
                   </div>
                 </div>

                 <div className="relative z-10 space-y-6">
                   {/* Progress Bar Component */}
                   <div>
                     <div className="flex justify-between text-xs font-bold mb-3 uppercase tracking-wider">
                       <span className="text-emerald-400">المنفذ الفعلي: SAR {executedValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                       <span className="text-slate-400">الإجمالي: SAR {totalBoqValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                     </div>
                     <div className="h-4 bg-slate-900/80 border border-white/5 rounded-full overflow-hidden flex shadow-inner">
                       <motion.div 
                         initial={{ width: 0 }} 
                         animate={{ width: `${progressPercent}%` }} 
                         transition={{ duration: 1.5, ease: "easeOut" }}
                         className="h-full bg-gradient-to-l from-emerald-400 to-teal-500 shadow-[0_0_10px_rgba(52,211,153,0.5)] relative"
                       >
                         <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]" style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)' }} />
                       </motion.div>
                     </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                     <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
                       <p className="text-xs text-slate-500 mb-1 font-bold uppercase tracking-wider">الميزانية أو قيمة العقد الأساسي</p>
                       <p className="text-xl font-black text-amber-300">SAR {mainContractValue ? Number(mainContractValue).toLocaleString() : '---'}</p>
                     </div>
                     <div className="bg-indigo-500/[0.02] border border-indigo-500/10 p-4 rounded-2xl">
                       <p className="text-xs text-indigo-400/70 mb-1 font-bold uppercase tracking-wider mt-1 flex items-center gap-1"><FileSignature size={12}/> ترسيات مقاولي الباطن</p>
                       <p className="text-xl font-black text-indigo-300">SAR {subContractsValue.toLocaleString()}</p>
                     </div>
                   </div>
                 </div>
              </div>

              {/* Quick Info & People Card */}
              <div className="space-y-6">
                <div className="glass-dark border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 h-1 w-full bg-gradient-to-l from-blue-500 via-indigo-500 to-transparent opacity-50" />
                  <h3 className="text-sm font-bold text-slate-300 mb-6 uppercase tracking-wider border-b border-white/5 pb-3">الإدارة والمواعيد</h3>
                  
                  <div className="space-y-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                        <User size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">مدير المشروع الأساسي</p>
                        <p className="text-sm font-bold text-white mt-0.5">{project.manager ? `${project.manager.firstName} ${project.manager.lastName}` : "لم يتم التعيين"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                        <Calendar size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">تاريخ الانطلاق</p>
                        <p className="text-sm font-bold text-white mt-0.5">{project.startDate ? new Date(project.startDate).toLocaleDateString('ar-SA') : "غير مجدول"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                        <AlertCircle size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">التسليم المتوقع</p>
                        <p className="text-sm font-bold text-rose-200 mt-0.5">{project.endDate ? new Date(project.endDate).toLocaleDateString('ar-SA') : "مفتوح - جاري التنفيذ"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass-dark border border-white/5 rounded-3xl p-6 shadow-xl flex items-center gap-4 cursor-pointer hover:bg-white/[0.02] transition-colors group">
                  <div className="w-12 h-12 rounded-full border border-indigo-500/30 bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                     {project.contracts?.length || 0}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">إجمالي العقود المرتبطة</h4>
                    <p className="text-xs text-slate-400 mt-1">اضغط للتفاصيل في التبويب المخصص</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BOQ TAB */}
          {activeTab === 'BOQ' && (
            <div className="glass-dark border border-white/5 rounded-3xl overflow-hidden shadow-2xl bg-slate-900/60">
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <ClipboardList size={20} className="text-blue-500" />
                  جداول الكميات المعتمدة للمشروع (BOQ)
                </h2>
                <div className="flex items-center gap-4">
                  <span className="text-xs font-mono text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                    الإجمالي: SAR {totalBoqValue.toLocaleString()}
                  </span>
                  <button 
                    onClick={() => {
                      setNewBoq({ itemCode: String((project.boqItems?.length || 0) + 1).padStart(2, '0'), description: '', unit: 'م٢', quantity: 1, unitPrice: 0 });
                      setIsBoqModalOpen(true);
                    }}
                    className="flex items-center gap-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-lg transition"
                  >
                    <Plus size={14} /> إضافة بند جديد
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto w-full">
                <table className="w-full text-right text-sm">
                  <thead className="bg-slate-900/80 sticky top-0 shadow-sm">
                    <tr className="text-xs uppercase tracking-widest text-slate-400 font-bold border-b border-white/5">
                      <th className="px-6 py-4">وصف التوريد / التركيب</th>
                      <th className="px-4 py-4 text-center">الوحدة</th>
                      <th className="px-4 py-4 text-center font-mono text-emerald-500/70">متوقع</th>
                      <th className="px-4 py-4 text-center font-mono text-blue-400/70">منفذ</th>
                      <th className="px-4 py-4 text-center">الفئة (SAR)</th>
                      <th className="px-6 py-4 text-center">إجمالي المتوقع</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {project.boqItems?.length > 0 ? project.boqItems.map((item: any) => (
                      <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-6 py-4 font-semibold text-slate-200">
                          <span className="block">{item.description}</span>
                          <span className="text-[10px] text-slate-500 font-mono tracking-wider">{item.itemCode || '---'}</span>
                        </td>
                        <td className="px-4 py-4 text-center text-slate-400">{item.unit}</td>
                        <td className="px-4 py-4 text-center font-mono font-bold text-emerald-400/80 bg-emerald-500/[0.02]">{item.quantity}</td>
                        <td className="px-4 py-4 text-center font-mono font-bold text-blue-400 bg-blue-500/[0.02]">{item.executedQty}</td>
                        <td className="px-4 py-4 text-center font-mono text-slate-300">{Number(item.unitPrice).toLocaleString()}</td>
                        <td className="px-6 py-4 text-center font-mono font-bold text-slate-200">{(item.quantity * item.unitPrice).toLocaleString()}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={6} className="py-16 text-center text-slate-500 text-sm">لا توجد بنود كميات مسجلة لهذا المشروع بعد.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CONTRACTS TAB */}
          {activeTab === 'CONTRACTS' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {project.contracts?.length > 0 ? project.contracts.map((contract: any, i: number) => {
                const isMain = contract.type === 'MAIN_CONTRACT';
                return (
                <div key={contract.id} className={`glass border border-white/5 rounded-3xl p-6 transition-all duration-300 group cursor-pointer ${isMain ? 'hover:border-amber-500/30' : 'hover:border-indigo-500/30'}`} onClick={() => router.push(`/dashboard/contracts/edit/${contract.id}`)}>
                  <div className="flex justify-between items-start mb-4 border-b border-white/5 pb-4">
                    {isMain ? (
                      <div className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-lg flex items-center gap-1.5">
                        <Building2 size={12} /> عقد رئيسي مع المالك
                      </div>
                    ) : (
                      <div className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-lg flex items-center gap-1.5">
                        <HardHat size={12} /> عقد مقاول باطن
                      </div>
                    )}
                    <span className={`text-slate-500 transition-colors ${isMain ? 'group-hover:text-amber-400' : 'group-hover:text-indigo-400'}`}>
                      <ArrowRight size={18} className="-rotate-45" />
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">
                    {isMain ? (project.client?.name || 'مجهول (جهة مالكة)') : (contract.subcontractor?.name || 'مجهول')}
                  </h3>
                  <p className="text-sm font-mono text-slate-400 mb-6">Ref: {contract.referenceNumber}</p>
                  
                  <div className="bg-slate-900/50 rounded-2xl p-4 border border-white/5 shadow-inner">
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">إجمالي العقد المتفق عليه</p>
                    <p className={`text-lg font-black font-mono ${isMain ? 'text-amber-300' : 'text-indigo-300'}`}>
                      SAR {Number(contract.totalValue).toLocaleString()}
                    </p>
                  </div>
                </div>
                );
              }) : (
                <div className="col-span-full min-h-[40vh] flex flex-col items-center justify-center text-slate-500 glass-dark rounded-3xl border border-white/5 px-4 text-center">
                  <FileSignature size={48} className="mb-4 opacity-50 text-indigo-500" />
                  <p className="text-lg font-bold text-slate-300 mb-1">لا توجد عقود لتنفيذ المشروع بعد</p>
                  <p className="text-sm">يمكنك البدء بإرساء بنود الأعمال وإصدار عقود لمقاولي الباطن.</p>
                </div>
              )}
            </div>
          )}

          {/* DAFTRA TAB */}
          {activeTab === 'DAFTRA' && (
            <div className="space-y-6">
               <div className="glass-dark border border-white/5 rounded-3xl p-6 relative overflow-hidden shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />
                 <div>
                   <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                     <Activity size={24} className="text-emerald-400" /> المركز المالي في دفترة (ERP Sync)
                   </h3>
                   <p className="text-sm text-slate-400">ملخص حي لتكاليف وإيرادات المشروع المُسجلة رسمياً كفواتير وقيود يومية في برنامج دفترة.</p>
                 </div>
                 <div className="bg-emerald-500/10 border border-emerald-500/30 px-6 py-3 rounded-2xl flex items-center gap-3">
                   <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-emerald-400 font-bold font-mono tracking-wide">متصل - مزامنة حية</span>
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Revenue Card */}
                  <div className="glass p-6 rounded-3xl border border-white/5 relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
                     <div className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all" />
                     <h3 className="text-slate-400 font-bold text-sm mb-3 uppercase tracking-wider">إجمالي الإيرادات (مستخلصات معتمدة)</h3>
                     <p className="text-3xl font-mono font-black text-white mb-1"><span className="text-sm text-emerald-500 mr-1">SAR</span>{totalCertifiedRevenue.toLocaleString('en-US', {maximumFractionDigits:0})}</p>
                     {certifiedInvoicesCount > 0 ? (
                       <p className="text-xs text-emerald-400 font-bold flex items-center gap-1"><TrendingUp size={14} /> {certifiedInvoicesCount} مستخلص معتمد</p>
                     ) : (
                       <p className="text-xs text-slate-500 font-bold">لا توجد مستخلصات معتمدة بعد</p>
                     )}
                  </div>

                  {/* Cost Card */}
                  <div className="glass p-6 rounded-3xl border border-white/5 relative overflow-hidden group hover:border-rose-500/30 transition-colors">
                     <div className="absolute -right-4 -top-4 w-16 h-16 bg-rose-500/10 rounded-full blur-xl group-hover:bg-rose-500/20 transition-all" />
                     <h3 className="text-slate-400 font-bold text-sm mb-3 uppercase tracking-wider">تكاليف المقاولين (فواتير مشتريات)</h3>
                     <p className="text-3xl font-mono font-black text-white mb-1"><span className="text-sm text-rose-500 mr-1">SAR</span>{totalCertifiedCost.toLocaleString('en-US', {maximumFractionDigits:0})}</p>
                     <p className="text-xs text-rose-400 font-bold flex items-center gap-1"><TrendingDown size={14} /> -مصاريف مقاولي الباطن</p>
                  </div>

                  {/* Profitability Card */}
                  <div className="glass p-6 rounded-3xl border border-white/5 relative overflow-hidden group hover:border-blue-500/30 transition-colors flex flex-col justify-center bg-blue-500/[0.02]">
                     <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-all" />
                     <h3 className="text-slate-400 font-bold text-sm mb-3 uppercase tracking-wider">الربحية الإجمالية الحالية</h3>
                     <p className="text-4xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300 drop-shadow-sm mb-1">
                       <span className="text-sm text-blue-500 mr-1">SAR</span>
                       {Math.max(0, totalCertifiedRevenue - totalCertifiedCost).toLocaleString('en-US', {maximumFractionDigits:0})}
                     </p>
                     <p className="text-xs text-slate-500 font-bold uppercase">مركز التكلفة: {project.code}</p>
                  </div>
               </div>

               <div className="glass-dark border border-white/5 rounded-3xl overflow-hidden shadow-2xl mt-6 pb-6">
                 <div className="p-6 border-b border-white/5 flex items-center justify-between">
                   <h3 className="text-lg font-bold text-white">سجل القيود المالية المرفوعة</h3>
                   <span className="text-xs text-slate-500 font-mono bg-slate-900 px-3 py-1 rounded-full border border-white/5">Auto-Synced</span>
                 </div>
                 
                 <div className="flex flex-col items-center justify-center min-h-[30vh] text-center px-4">
                   <div className="relative mb-6">
                     <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                       <CheckCircle2 size={32} className="text-emerald-400" />
                     </div>
                     <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center border border-white/10 shadow-lg">
                       <Activity size={14} className="text-blue-400" />
                     </div>
                   </div>
                   <h4 className="text-xl font-bold text-white mb-2">الدورة المستندية مطابقة تماماً</h4>
                   <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                     بمجرد اعتماد أي مستخلص دفع في هذا المشروع، يقوم النظام بتوليد فاتورة شراء وتوجيهها لمركز تكلفة المشروع في دفترة أوتوماتيكياً.
                   </p>
                 </div>
               </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>

      {/* BOQ ADD MODAL */}
      <AnimatePresence>
        {isBoqModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Plus size={20} className="text-blue-400" />
                  إضافة بند كميات (BOQ) مباشر
                </h2>
                <button onClick={() => setIsBoqModalOpen(false)} className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleAddBoq} className="p-6 space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-300">م (رقم البند)</label>
                  <input required value={newBoq.itemCode} onChange={e => setNewBoq({...newBoq, itemCode: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono" placeholder="01" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-300">وصف دقيق للأعمال</label>
                  <input required value={newBoq.description} onChange={e => setNewBoq({...newBoq, description: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="مثال: توريد وتركيب أجهزة..." />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-300">الوحدة</label>
                    <input required value={newBoq.unit} onChange={e => setNewBoq({...newBoq, unit: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-center" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-300">الكمية</label>
                    <input type="number" required min="1" step="any" value={newBoq.quantity} onChange={e => setNewBoq({...newBoq, quantity: Number(e.target.value)})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-emerald-400 font-bold font-mono focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-center" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-300">السعر (SAR)</label>
                    <input type="number" required min="0" step="any" value={newBoq.unitPrice} onChange={e => setNewBoq({...newBoq, unitPrice: Number(e.target.value)})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-blue-400 font-bold font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-center" />
                  </div>
                </div>

                <div className="pt-2">
                  <div className="w-full bg-slate-900/50 border border-slate-700 p-4 rounded-xl flex justify-between items-center text-sm">
                    <span className="text-slate-400 font-bold">الإجمالي المعتمد للمشروع:</span>
                    <span className="font-mono text-white text-lg font-black">SAR {(newBoq.quantity * newBoq.unitPrice).toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-8 pt-4 flex gap-4">
                  <button type="button" onClick={() => setIsBoqModalOpen(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 rounded-xl transition-colors">
                    إلغاء
                  </button>
                  <button type="submit" disabled={isSubmittingBoq} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-50 flex justify-center items-center gap-2">
                    {isSubmittingBoq ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />} إضافة واعتماد البند
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
