"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileSignature, 
  Search, 
  Plus, 
  Wallet,
  Users,
  ShieldAlert,
  Loader2,
  ArrowUpRight,
  Receipt,
  TrendingUp,
  TrendingDown,
  Landmark,
  Activity,
  FileBox,
  Building2,
  HardHat,
  Edit3,
  Crown,
  Trash2
} from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";

export default function ContractsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [contracts, setContracts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) fetchContracts(selectedProjectId);
    else setContracts([]);
  }, [selectedProjectId]);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/v1/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(res.data);
      if (res.data.length > 0) setSelectedProjectId(res.data[0].id);
    } catch (err) {}
  };

  const fetchContracts = async (projectId: string) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/v1/contracts/project/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContracts(res.data);
    } catch (err) {}
    setIsLoading(false);
  };

  const deleteContract = async (id: string) => {
    if (!confirm("هل أنت متأكد من رغبتك في حذف هذا العقد؟ لا يمكن التراجع عن هذه الخطوة.")) return;
    
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/v1/contracts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (selectedProjectId) fetchContracts(selectedProjectId);
    } catch (err: any) {
      alert(err.response?.data?.message || "فشل حذف العقد");
    }
  };

  const filteredContracts = contracts.filter(c => c.referenceNumber.includes(search));
  
  const mainContracts = filteredContracts.filter(c => c.type === 'MAIN_CONTRACT');
  const subContracts = filteredContracts.filter(c => c.type !== 'MAIN_CONTRACT');
  
  const mainContractsValue = mainContracts.reduce((sum, c) => sum + Number(c.totalValue), 0);
  const mainInvoicedValue = mainContracts.reduce((sum, c) => sum + (c.invoices?.reduce((isum: number, inv: any) => isum + Number(inv.grossAmount), 0) || 0), 0);

  const subContractsValue = subContracts.reduce((sum, c) => sum + Number(c.totalValue), 0);
  const subInvoicedValue = subContracts.reduce((sum, c) => sum + (c.invoices?.reduce((isum: number, inv: any) => isum + Number(inv.grossAmount), 0) || 0), 0);

  const totalRetention = filteredContracts.reduce((sum, c) => {
    const retTotal = c.invoices?.reduce((rsum: number, inv: any) => rsum + Number(inv.retentionAmount), 0) || 0;
    return sum + retTotal;
  }, 0);

  return (
    <div className="space-y-6 w-full animate-in fade-in zoom-in-95 duration-500 relative">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <FileSignature className="text-orange-500" size={28} />
            إدارة العقود والمقاولين
          </h1>
          <p className="text-slate-400 text-sm">العقود الرئيسية (إيرادات) وعقود مقاولي الباطن (تكاليف) للمشاريع.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link href="/dashboard/contracts/create" className="relative flex items-center gap-2 font-black py-3 px-6 rounded-xl transition-all shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:shadow-[0_0_30px_rgba(249,115,22,0.6)] group bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white overflow-hidden hover:-translate-y-1">
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <Plus size={20} className="group-hover:rotate-90 transition-transform relative z-10" />
            <span className="relative z-10 text-sm">تأسيس عقد جديد</span>
          </Link>
        </div>
      </div>

      {/* Top Value Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Contracts Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/20 p-6 flex flex-col justify-between group shadow-xl">
           <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
           <p className="text-indigo-400 font-bold mb-3 flex items-center justify-between gap-2">
             <span className="flex items-center gap-2"><Crown size={18} /> العقود الرئيسية (إيرادات)</span>
             <span className="font-mono text-sm">{mainContractsValue > 0 ? ((mainInvoicedValue/mainContractsValue)*100).toFixed(1) : 0}%</span>
           </p>
           <h2 className="text-3xl font-black text-white font-mono">{mainContractsValue.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span className="text-xs text-slate-500 uppercase">SAR</span></h2>
           <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-end">
             <div>
               <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">المنجز (مستخلصات)</p>
               <p className="text-sm font-bold text-indigo-300 font-mono">{mainInvoicedValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
             </div>
             <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30">
               <TrendingUp size={20} />
             </div>
           </div>
        </div>

        {/* Subcontracts Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-900/40 to-slate-900 border border-amber-500/20 p-6 flex flex-col justify-between group shadow-xl">
           <div className="absolute inset-0 bg-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
           <p className="text-amber-400 font-bold mb-3 flex items-center justify-between gap-2">
             <span className="flex items-center gap-2"><HardHat size={18} /> عقود الباطن (تكاليف)</span>
             <span className="font-mono text-sm">{subContractsValue > 0 ? ((subInvoicedValue/subContractsValue)*100).toFixed(1) : 0}%</span>
           </p>
           <h2 className="text-3xl font-black text-white font-mono">{subContractsValue.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span className="text-xs text-slate-500 uppercase">SAR</span></h2>
           <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-end">
             <div>
               <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">المصروف (مستخلصات)</p>
               <p className="text-sm font-bold text-amber-300 font-mono">{subInvoicedValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
             </div>
             <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 border border-amber-500/30">
               <TrendingDown size={20} />
             </div>
           </div>
        </div>

        {/* Retention Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-900/40 to-slate-900 border border-rose-500/20 p-6 flex items-center justify-between group shadow-xl">
           <div className="absolute inset-0 bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
           <div>
             <p className="text-rose-400 font-bold mb-1 flex items-center gap-2">
               <ShieldAlert size={16} /> المحتجزات النقدية (Retention)
             </p>
             <h2 className="text-3xl font-black text-white font-mono">{totalRetention.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span className="text-sm text-slate-500">SAR</span></h2>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-rose-500/20 flex items-center justify-center text-rose-400 border border-rose-500/30 shadow-inner group-hover:scale-110 transition-transform">
             <Landmark size={28} />
           </div>
        </div>
      </div>

      <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 p-3 rounded-2xl flex items-center justify-between gap-4 flex-wrap shadow-lg">
        <div className="relative flex-1 min-w-[200px] max-w-md group">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="بحث برقم العقد أو المقاول..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-2.5 pr-12 pl-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <label className="text-slate-400 text-sm font-medium">فرز حسب المشروع:</label>
          <div className="flex items-center border border-white/10 bg-slate-900/80 rounded-xl px-2">
            <select 
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-transparent text-white text-sm font-medium outline-none px-3 py-2 cursor-pointer w-48 appearance-none"
            >
              <option value="" disabled className="bg-slate-900">-- اختر مشروعاً --</option>
              {projects.map(p => (
                <option key={p.id} value={p.id} className="bg-slate-900">{p.name} ({p.code})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-slate-400"><Loader2 className="animate-spin mx-auto text-orange-500" size={24} /></div>
        ) : contracts.filter(c => c.referenceNumber.includes(search)).length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 glass rounded-3xl border border-white/5">
            لا توجد عقود مسجلة لهذا المشروع.
          </div>
        ) : (
          contracts.filter(c => c.referenceNumber.includes(search)).map((contract, i) => {
            const isMain = contract.type === 'MAIN_CONTRACT';
            const accentColor = isMain ? 'indigo' : 'amber';
            const invoicedAmount = contract.invoices?.reduce((s: number, inv: any) => s + Number(inv.grossAmount), 0) || 0;
            const progressPct = contract.totalValue > 0 ? Math.min((invoicedAmount / contract.totalValue) * 100, 100) : 0;

            return (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                key={contract.id}
                className={`rounded-3xl glass border transition-all group overflow-hidden relative flex flex-col ${
                  isMain 
                    ? 'border-indigo-500/20 hover:border-indigo-500/50'
                    : 'border-amber-500/20 hover:border-amber-500/40'
                }`}
              >
                {/* Top accent bar */}
                <div className={`h-1 w-full bg-gradient-to-r ${
                  isMain ? 'from-indigo-500 via-blue-500 to-cyan-500' : 'from-amber-500 to-orange-500'
                }`} />

                <div className="p-6 flex-1 flex flex-col">
                  {/* Header Badge */}
                  <div className="flex justify-between items-start mb-4">
                    <div className={`px-3 py-1.5 text-xs font-bold rounded-xl border flex items-center gap-1.5 ${
                      isMain
                        ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                        : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                    }`}>
                      {isMain ? <Crown size={12} /> : <HardHat size={12} />}
                      {isMain ? 'عقد رئيسي مع المالك (إيراد)' : 'عقد مقاول باطن (تكلفة)'}
                    </div>
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/dashboard/contracts/edit/${contract.id}`}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                        title="تعديل العقد"
                      >
                        <Edit3 size={15} />
                      </Link>
                      <button
                        onClick={() => deleteContract(contract.id)}
                        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-all border border-transparent hover:border-rose-500/40"
                        title="حذف العقد"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Party name */}
                  <div className="flex items-center gap-2 mb-1">
                    {isMain 
                      ? <Building2 size={16} className="text-indigo-400 shrink-0" />
                      : <HardHat size={16} className="text-amber-400 shrink-0" />}
                    <h3 className="text-lg font-bold text-white line-clamp-1">
                      {isMain 
                        ? (contract.project?.client?.name || 'الجهة المالكة (غير مسجلة)')
                        : (contract.subcontractor?.name || 'مقاول غير محدد')}
                    </h3>
                  </div>

                  <p className="text-sm font-mono text-slate-500 mb-5 bg-slate-900/50 w-max px-2 py-0.5 rounded-md border border-white/5">
                    REF: {contract.referenceNumber}
                  </p>

                  {/* Financial summary */}
                  <div className="bg-slate-900/40 rounded-2xl p-4 border border-white/5 mb-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500 flex items-center gap-1"><Wallet size={11}/> قيمة العقد</span>
                      <span className="font-mono font-bold text-white text-sm">SAR {Number(contract.totalValue).toLocaleString('en-US')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        {isMain ? <TrendingUp size={11} className="text-emerald-400" /> : <TrendingDown size={11} className="text-rose-400" />}
                        {isMain ? 'إيراد محصّل' : 'تكلفة مصروفة'}
                      </span>
                      <span className={`font-mono font-bold text-sm ${isMain ? 'text-emerald-400' : 'text-rose-400'}`}>
                        SAR {invoicedAmount.toLocaleString('en-US')}
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                        <span>الإنجاز المالي</span>
                        <span className="font-mono">{progressPct.toFixed(1)}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPct}%` }}
                          transition={{ duration: 1.2, ease: 'easeOut' }}
                          className={`h-full rounded-full bg-gradient-to-r ${
                            isMain ? 'from-indigo-500 to-cyan-400' : 'from-amber-500 to-orange-400'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Mini stats */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-slate-900/40 border border-white/5 rounded-xl p-2.5 text-center">
                      <p className="text-[10px] text-slate-500 mb-0.5">المحتجز</p>
                      <p className="font-mono text-rose-400 font-bold text-sm">%{contract.retentionPercent}</p>
                    </div>
                    <div className="bg-slate-900/40 border border-white/5 rounded-xl p-2.5 text-center">
                      <p className="text-[10px] text-slate-500 mb-0.5">دفعة مقدمة</p>
                      <p className="font-mono text-amber-400 font-bold text-sm">%{contract.advancePayment}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-auto flex gap-2">
                    <Link 
                      href={`/dashboard/invoices?contractId=${contract.id}`} 
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl transition-all font-medium text-sm border ${
                        isMain
                          ? 'bg-indigo-500/10 hover:bg-indigo-500 text-indigo-300 hover:text-white border-indigo-500/20 hover:border-indigo-500'
                          : 'bg-amber-500/10 hover:bg-amber-500 text-amber-300 hover:text-white border-amber-500/20 hover:border-amber-500'
                      }`}
                    >
                      <Receipt size={15} /> 
                      {isMain ? 'مستخلصات الإيراد' : 'مستخلصات التكلفة'}
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
