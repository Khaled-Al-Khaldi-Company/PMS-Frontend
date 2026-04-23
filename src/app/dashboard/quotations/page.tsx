"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  FileCheck2, 
  Search, 
  PlusCircle,
  Loader2,
  FileText,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  Trash2
} from "lucide-react";
import axios from "axios";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();

  const [userPerms, setUserPerms] = useState<string[]>([]);
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        setUserPerms(u.permissions || []);
        setUserRole(u.role || "");
      } catch (e) {}
    }
    fetchQuotations();
  }, []);

  const hasPermission = (perm: string) => {
    if (userRole === "Admin" || userRole === "System Admin") return true;
    return userPerms.includes(perm);
  };

  const fetchQuotations = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/v1/quotations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuotations(res.data);
    } catch (err) {}
    setIsLoading(false);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("هل أنت متأكد من رغبتك في حذف العرض السعري بالكامل؟")) return;
    
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/v1/quotations/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchQuotations();
    } catch (err: any) {
      alert(err.response?.data?.message || "حدث خطأ أثناء الحذف.");
    }
  };

  const handleConvert = async (id: string) => {
    if (!confirm("هل أنت متأكد من الموافقة على العرض وتحويله إلى مشروع تنفيذي وبدء دورة المستخلصات؟")) return;
    
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_BASE_URL}/v1/quotations/${id}/convert`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`مبروك! تم التحويل بنجاح. رقم المشروع الجديد: ${res.data.code}`);
      fetchQuotations();
    } catch (err: any) {
      alert(err.response?.data?.message || "حدث خطأ أثناء الاعتماد.");
    }
  };

  const statusMap: Record<string, { label: string, color: string, icon: any }> = {
    DRAFT: { label: "مسودة عرض", color: "text-slate-400 bg-slate-500/10 border-slate-500/20", icon: FileText },
    SUBMITTED: { label: "مقدم للعميل", color: "text-amber-500 bg-amber-500/10 border-amber-500/20", icon: Clock },
    APPROVED: { label: "معتمد (قيد التنفيذ)", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle2 },
  };

  return (
    <div className="space-y-6 w-full animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <FileCheck2 className="text-pink-500" size={28} />
            عروض الأسعار (Quotations)
          </h1>
          <p className="text-slate-400 text-sm">إرسال التسعيرات وتحويل العرض المعتمد إلى مشروع تنفيذي وجداول كميات تلقائياً.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {hasPermission('QUOTATION_CREATE') && (
            <Link href="/dashboard/quotations/create" className="flex items-center gap-2 font-medium py-2.5 px-5 rounded-xl transition-all shadow-[0_0_15px_rgba(236,72,153,0.4)] group bg-pink-600 hover:bg-pink-500 text-white">
              <PlusCircle size={18} className="group-hover:rotate-90 transition-transform" />
              <span>تسعير جديد</span>
            </Link>
          )}
        </div>
      </div>

      <div className="glass-dark border border-white/5 p-4 rounded-2xl flex items-center gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-pink-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="بحث بالرقم (Q-)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-2.5 pr-12 pl-4 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all"
          />
        </div>
      </div>

      <div className="rounded-3xl glass border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-900/50 text-slate-400 border-b border-white/5 uppercase font-medium">
              <tr>
                <th className="px-6 py-4">المرجع</th>
                <th className="px-6 py-4">وصف العرض</th>
                <th className="px-6 py-4">الجهة المالكة (العميل)</th>
                <th className="px-6 py-4 text-pink-400">إجمالي السعر (SAR)</th>
                <th className="px-6 py-4 text-center">الحالة</th>
                <th className="px-6 py-4 text-center">ترسية واعتماد</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {isLoading ? (
                <tr>
                   <td colSpan={6} className="px-6 py-12 text-center text-slate-400"><Loader2 className="animate-spin mx-auto text-pink-500" size={24} /></td>
                </tr>
              ) : quotations.length === 0 ? (
                <tr>
                   <td colSpan={6} className="px-6 py-12 text-center text-slate-400 glass">لا توجد عروض أسعار حتى الآن.</td>
                </tr>
              ) : (
                quotations.filter(q => q.quotationNumber.includes(search)).map((quote, i) => (
                  <motion.tr 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={quote.id} 
                    onClick={() => router.push(`/dashboard/quotations/${quote.id}`)}
                    className="hover:bg-white/[0.04] transition-colors cursor-pointer group relative"
                  >
                    {/* Hover Glow line */}
                    <td className="px-6 py-4 font-mono font-medium text-white group-hover:text-pink-400 transition-colors relative">
                      <div className="absolute inset-y-0 right-0 w-1 bg-gradient-to-b from-pink-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      #{quote.quotationNumber}
                    </td>
                    <td className="px-6 py-4 truncate max-w-[200px]">{quote.title}</td>
                    <td className="px-6 py-4 font-medium text-slate-300">{quote.client?.name}</td>
                    <td className="px-6 py-4 font-mono font-black text-lg text-pink-400 bg-pink-500/5 group-hover:bg-pink-500/10 border-x border-pink-500/10 transition-colors">
                      {Number(quote.totalAmount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-widest border ${statusMap[quote.status]?.color || statusMap['DRAFT'].color}`}>
                          {(() => {
                            const IconComp = statusMap[quote.status]?.icon || Clock;
                            return <IconComp size={14} />;
                          })()}
                          {statusMap[quote.status]?.label || quote.status}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center border-l border-white/5">
                      <div className="flex items-center justify-center gap-2">
                        {quote.status !== 'APPROVED' ? (
                          <>
                            {hasPermission('QUOTATION_APPROVE') && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleConvert(quote.id); }}
                                className="flex items-center justify-center gap-1 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-xl transition-all font-bold border border-emerald-500/20 hover:border-emerald-500 hover:shadow-[0_0_15px_rgba(52,211,153,0.4)]"
                                title="اعتماد وتحويل لمشروع"
                              >
                                <CheckCircle2 size={16} />
                              </button>
                            )}
                            {hasPermission('QUOTATION_CREATE') && (
                              <button 
                                className="flex items-center justify-center gap-1 px-3 py-1.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded-xl transition-all font-bold border border-rose-500/20 hover:border-rose-500 hover:shadow-[0_0_15px_rgba(244,63,94,0.4)]"
                                onClick={(e) => handleDelete(e, quote.id)}
                                title="حذف العرض"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </>
                        ) : (
                          <span className="text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 mx-auto w-max shadow-sm">
                            متصل بمشروع <ArrowUpRight size={14} />
                          </span>
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
