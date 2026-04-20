"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  Search, 
  PlusCircle, 
  ArrowUpRight,
  Calculator,
  Download,
  BadgeCheck,
  Clock,
  Loader2,
  Wallet,
  ShieldAlert,
  Percent,
  RefreshCw,
  Eye,
  Printer,
  Edit3,
  Trash2
} from "lucide-react";
import axios from "axios";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";

export default function InvoicesPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  
  const [contracts, setContracts] = useState<any[]>([]);
  const [selectedContractId, setSelectedContractId] = useState<string>("");
  const [selectedContract, setSelectedContract] = useState<any>(null);
  
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) fetchContracts(selectedProjectId);
    else { setContracts([]); setSelectedContractId(""); setSelectedContract(null); }
  }, [selectedProjectId]);

  useEffect(() => {
    if (selectedContractId) {
      const contract = contracts.find(c => c.id === selectedContractId);
      setSelectedContract(contract);
      fetchInvoices(selectedContractId);
    } else {
      setInvoices([]);
      setSelectedContract(null);
    }
  }, [selectedContractId]);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/v1/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(res.data);
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        router.push("/");
      }
    }
  };

  const fetchContracts = async (projectId: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/v1/contracts/project/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContracts(res.data);
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        router.push("/");
      }
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("هل أنت متأكد من حذف المستخلص؟ ستتم استعادة جميع الكميات التي تم احتسابها في هذا المستخلص.")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/v1/invoices/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (selectedContractId) fetchInvoices(selectedContractId);
    } catch (err: any) {
      alert(err.response?.data?.message || "حدث خطأ أثناء الحذف.");
    }
  };

  const fetchInvoices = async (contractId: string) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/v1/invoices/contract/${contractId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInvoices(res.data);
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        router.push("/");
      }
    }
    setIsLoading(false);
  };

  const statusMap: Record<string, { label: string, color: string, bg: string, icon: any }> = {
    DRAFT: { label: "مسودة غير معتمدة", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", icon: Clock },
    CERTIFIED: { label: "مستخلص معتمد", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", icon: FileText },
    PAID: { label: "تم دفع المستخلص", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", icon: BadgeCheck },
  };

  // Calculate Aggregated Metrics
  const totalValue = selectedContract?.totalValue || 0;
  const totalInvoiced = invoices.reduce((sum, inv) => sum + Number(inv.netAmount || 0), 0);
  const totalRetention = invoices.reduce((sum, inv) => sum + Number(inv.retentionAmount || 0), 0);
  const totalGross = invoices.reduce((sum, inv) => sum + Number(inv.grossAmount || 0), 0);
  const completionPercent = totalValue > 0 ? ((totalGross / totalValue) * 100).toFixed(1) : "0.0";

  const handlePrint = (e: React.MouseEvent, invoiceId: string) => {
    e.stopPropagation();
    // Logic to open print view or generate PDF
    alert("جارٍ تجهيز ملف الطباعة...");
  };

  return (
    <div className="space-y-8 w-full animate-in fade-in zoom-in-95 duration-500 relative">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200 mb-2 flex items-center gap-3 drop-shadow-lg">
            <Calculator className="text-emerald-400" size={36} />
            إدارة المستخلصات
          </h1>
          <p className="text-slate-400 text-base max-w-xl leading-relaxed">
            التحكم الشامل في مستخلصات الإيرادات (الجهات المالكة) ومستخلصات التكاليف (مقاولين الباطن)، وتتبع الدفعات ونسب الإنجاز والمحتجزات لحظياً.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => selectedContractId && fetchInvoices(selectedContractId)}
            className="flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-800/50 border border-white/5 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            title="تحديث البيانات"
          >
            <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
          </button>
          
          <Link 
            href={selectedContractId ? `/dashboard/invoices/create?contract=${selectedContractId}&project=${selectedProjectId}` : "#"}
            className={`flex items-center gap-2 font-bold py-3 px-6 rounded-2xl transition-all group relative overflow-hidden ${
              selectedContractId 
                ? "bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] hover:-translate-y-1 cursor-pointer" 
                : "bg-slate-800/50 text-slate-500 cursor-not-allowed border border-white/5"
            }`}
            title={!selectedContractId ? "يجب اختيار العقد أدناه أولاً" : "ارفع مستخلص جديد"}
          >
            {selectedContractId && <div className="absolute inset-0 bg-white/20 w-0 group-hover:w-full transition-all duration-300 ease-out" />}
            <PlusCircle size={22} className={`relative z-10 ${selectedContractId ? "group-hover:rotate-90 transition-transform duration-300" : ""}`} />
            <span className="relative z-10">إنشاء مستخلص جديد</span>
          </Link>
        </div>
      </div>

      {/* Filters Section */}
      <div className="glass-dark border border-white/10 p-5 rounded-3xl flex flex-col lg:flex-row items-center justify-between gap-5 relative overflow-hidden shadow-2xl">
        <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-emerald-500 to-teal-500" />
        
        <div className="flex flex-1 flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <div className="relative flex-1 group">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-400 transition-colors" size={20} />
            <input
              type="text"
              placeholder="ابحث برقم المستخلص..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-2xl py-3 pr-12 pl-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-medium text-sm"
            />
          </div>

          <div className="w-full sm:w-[180px] relative">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-900/80 text-white text-sm font-medium outline-none px-4 py-3 rounded-2xl border border-slate-700/50 appearance-none cursor-pointer focus:border-emerald-500/50 transition-all hover:bg-slate-800/80"
            >
              <option value="ALL" className="bg-slate-900">جميع الحالات</option>
              <option value="DRAFT" className="bg-slate-900 text-amber-500">مسودة غير معتمدة</option>
              <option value="CERTIFIED" className="bg-slate-900 text-blue-500">مستخلص معتمد</option>
              <option value="PAID" className="bg-slate-900 text-emerald-500">تم الدفع</option>
            </select>
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
          <div className="flex-1 sm:flex-none relative">
            <select 
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full sm:w-[220px] bg-slate-900/80 text-white text-sm font-bold outline-none px-4 py-3 rounded-2xl border border-slate-700/50 appearance-none cursor-pointer focus:border-emerald-500/50 transition-all hover:bg-slate-800/80"
            >
              <option value="" disabled className="bg-slate-900 text-slate-400">⚡ حدد المشروع أولاً</option>
              {projects.map(p => <option key={p.id} value={p.id} className="bg-slate-900">{p.name}</option>)}
            </select>
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
          </div>

          <div className="flex-1 sm:flex-none relative">
            <select 
              value={selectedContractId}
              onChange={(e) => setSelectedContractId(e.target.value)}
              disabled={!selectedProjectId || contracts.length === 0}
              className="w-full sm:w-[260px] bg-slate-900/80 text-emerald-400 text-sm font-bold outline-none px-4 py-3 rounded-2xl border border-slate-700/50 appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed focus:border-emerald-500/50 transition-all hover:bg-slate-800/80"
            >
              <option value="" disabled className="bg-slate-900 text-slate-500">📄 حدد العقد (إيراد / تكلفة)</option>
              {contracts.map(c => {
                const name = c.type === 'MAIN_CONTRACT' ? 'عقد رئيسي (إيراد)' : (c.subcontractor?.name || 'مقاول باطن');
                return <option key={c.id} value={c.id} className="bg-slate-900">{name} - {c.referenceNumber}</option>;
              })}
            </select>
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-500/50">▼</div>
          </div>
        </div>
      </div>

      {/* Statistics Dashboard */}
      <AnimatePresence>
        {selectedContractId && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <div className="glass p-5 rounded-3xl border border-white/5 relative overflow-hidden group hover:border-blue-500/30 transition-colors">
              <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-all" />
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400"><Wallet size={20} /></div>
                <h3 className="text-slate-400 font-medium text-sm">إجمالي قيمة العقد</h3>
              </div>
              <p className="text-2xl font-mono font-bold text-white">
                <span className="text-sm font-sans text-slate-500 mr-1">SAR</span>
                {totalValue.toLocaleString('en-US')}
              </p>
            </div>

            <div className="glass p-5 rounded-3xl border border-white/5 relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
              <div className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all" />
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400"><BadgeCheck size={20} /></div>
                <h3 className="text-slate-400 font-medium text-sm">صافي المستخلصات المعتمدة</h3>
              </div>
              <p className="text-2xl font-mono font-bold text-emerald-400">
                <span className="text-sm font-sans text-emerald-500/50 mr-1">SAR</span>
                {totalInvoiced.toLocaleString('en-US')}
              </p>
            </div>

            <div className="glass p-5 rounded-3xl border border-white/5 relative overflow-hidden group hover:border-rose-500/30 transition-colors">
              <div className="absolute -right-4 -top-4 w-16 h-16 bg-rose-500/10 rounded-full blur-xl group-hover:bg-rose-500/20 transition-all" />
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400"><ShieldAlert size={20} /></div>
                <h3 className="text-slate-400 font-medium text-sm">إجمالي المحتجزات</h3>
              </div>
              <p className="text-2xl font-mono font-bold text-rose-400">
                <span className="text-sm font-sans text-rose-500/50 mr-1">SAR</span>
                {totalRetention.toLocaleString('en-US')}
              </p>
            </div>

            <div className="glass p-5 rounded-3xl border border-white/5 relative overflow-hidden group hover:border-indigo-500/30 transition-colors flex flex-col justify-center">
              <div className="absolute -right-4 -top-4 w-16 h-16 bg-indigo-500/10 rounded-full blur-xl group-hover:bg-indigo-500/20 transition-all" />
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400"><Percent size={20} /></div>
                <h3 className="text-slate-400 font-medium text-sm">نسبة الإنجاز المالي</h3>
              </div>
              <div className="flex items-end gap-3">
                <p className="text-3xl font-mono font-bold text-white">{completionPercent}%</p>
                <div className="flex-1 h-2 bg-slate-800 rounded-full mb-2 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${completionPercent}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Table */}
      <div className="rounded-3xl glass-dark border border-white/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-900/80 text-slate-300 border-b border-white/10 uppercase font-semibold">
              <tr>
                <th className="px-6 py-5 whitespace-nowrap">رقم المستخلص</th>
                <th className="px-6 py-5 text-center whitespace-nowrap">النوع</th>
                <th className="px-6 py-5">المشروع</th>
                <th className="px-6 py-5">تاريخ الإصدار</th>
                <th className="px-6 py-5 text-emerald-400 whitespace-nowrap">الصافي المستحق (SAR)</th>
                <th className="px-6 py-5 text-rose-400 whitespace-nowrap">قيمة المحتجز (SAR)</th>
                <th className="px-6 py-5 text-center">الحالة الرقابية</th>
                <th className="px-6 py-5 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {isLoading ? (
                [...Array(3)].map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-6 py-6"><div className="h-4 bg-slate-800 rounded w-16"></div></td>
                    <td className="px-6 py-6"><div className="h-4 bg-slate-800 rounded w-12 mx-auto"></div></td>
                    <td className="px-6 py-6"><div className="h-4 bg-slate-800 rounded w-24"></div></td>
                    <td className="px-6 py-6"><div className="h-4 bg-slate-800 rounded w-20"></div></td>
                    <td className="px-6 py-6"><div className="h-5 bg-slate-800/80 rounded w-24"></div></td>
                    <td className="px-6 py-6"><div className="h-4 bg-slate-800 rounded w-20"></div></td>
                    <td className="px-6 py-6"><div className="h-6 bg-slate-800 rounded-lg w-28 mx-auto"></div></td>
                    <td className="px-6 py-6"><div className="h-8 w-24 bg-slate-800 rounded-full mx-auto"></div></td>
                  </tr>
                ))
              ) : invoices.length === 0 ? (
                <tr>
                   <td colSpan={8} className="px-6 py-20 text-center">
                     <div className="flex flex-col items-center justify-center text-slate-500 space-y-4">
                       <FileText size={48} className="opacity-20" />
                       <p className="text-lg">
                         {!selectedContractId 
                           ? "يرجى تحديد العقد من القائمة العلوية لعرض المستخلصات المرتبطة به." 
                           : "لا توجد مستخلصات مسجلة لهذا العقد حتى الآن."}
                       </p>
                     </div>
                   </td>
                </tr>
              ) : (
                invoices
                  .filter(i => i.invoiceNumber.includes(search))
                  .filter(i => statusFilter === "ALL" || i.status === statusFilter)
                  .map((inv, i) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={inv.id} 
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    <td className="px-6 py-5 font-mono font-bold text-white text-base">#{inv.invoiceNumber}</td>
                    <td className="px-6 py-5 text-center">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${inv.contract?.type === 'MAIN_CONTRACT' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                        {inv.contract?.type === 'MAIN_CONTRACT' ? 'إيراد (مالكة)' : 'تكلفة (باطن)'}
                      </span>
                    </td>
                    <td className="px-6 py-5 font-medium">{inv.project?.name || "غير محدد"}</td>
                    <td className="px-6 py-5 font-mono text-slate-400">{new Date(inv.issueDate).toLocaleDateString('ar-SA')}</td>
                    <td className="px-6 py-5 font-mono font-bold text-lg text-emerald-400 bg-emerald-500/5 relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-px bg-emerald-500/20" />
                      {Number(inv.netAmount).toLocaleString('en-US')}
                    </td>
                    <td className="px-6 py-5 font-mono font-medium text-rose-400 bg-rose-500/5 relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-px bg-rose-500/20" />
                      {Number(inv.retentionAmount).toLocaleString('en-US')}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center">
                        <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold border ${statusMap[inv.status]?.color || statusMap['DRAFT'].color} ${statusMap[inv.status]?.bg || statusMap['DRAFT'].bg} shadow-soft`}>
                          {(() => {
                            const IconComp = statusMap[inv.status]?.icon || Clock;
                            return <IconComp size={14} className="opacity-80" />;
                          })()}
                          {statusMap[inv.status]?.label || inv.status}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        <Link href={`/dashboard/invoices/${inv.id}`} title="عرض المستخلص" className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all border border-blue-500/20">
                          <Eye size={16} />
                        </Link>
                        <button onClick={(e) => handlePrint(e, inv.id)} title="طباعة المستخلص" className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-700/50 text-slate-300 hover:bg-emerald-500 hover:text-white transition-all border border-slate-600/50 hover:border-emerald-500">
                          <Printer size={16} />
                        </button>
                        {inv.status === 'DRAFT' && (
                          <>
                            <Link href={`/dashboard/invoices/${inv.id}/edit`} title="تعديل (مسودة)" className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white transition-all border border-amber-500/20">
                              <Edit3 size={16} />
                            </Link>
                            <button onClick={(e) => handleDelete(e, inv.id)} title="حذف المستخلص" className="flex items-center justify-center w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20">
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

