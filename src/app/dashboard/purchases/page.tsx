"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ShoppingCart, 
  Search, 
  PlusCircle, 
  ArrowUpRight,
  Package,
  Loader2,
  Clock,
  CheckCircle2,
  Wallet,
  Activity,
  FileBox,
  TrendingUp,
  Receipt,
  Trash2,
  Edit
} from "lucide-react";
import axios from "axios";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";

export default function PurchasesPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  
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
    fetchOrders();
  }, []);

  const hasPermission = (perm: string) => {
    if (userRole === "Admin" || userRole === "System Admin") return true;
    return userPerms.includes(perm);
  };

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/v1/purchases`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    } catch (err) {}
    setIsLoading(false);
  };

  const statusMap: Record<string, { label: string, color: string, icon: any }> = {
    PENDING: { label: "قيد المراجعة", color: "text-amber-500 bg-amber-500/10 border-amber-500/20", icon: Clock },
    APPROVED: { label: "معتمد (Approved)", color: "text-blue-500 bg-blue-500/10 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.2)]", icon: CheckCircle2 },
    DELIVERED: { label: "تم استلام الموقع", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]", icon: Package },
  };

  const totalSpend = orders.filter(o => o.status !== 'REJECTED').reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
  const pendingCount = orders.filter(o => o.status === 'PENDING').length;
  const approvedCount = orders.filter(o => o.status === 'APPROVED' || o.status === 'DELIVERED').length;

  return (
    <div className="space-y-6 w-full animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <ShoppingCart className="text-indigo-400" size={28} />
            إدارة المشتريات والمواد (PO)
          </h1>
          <p className="text-slate-400 text-sm">تتبع طلبات الاستعاضة للمواد وربط التكاليف ببند التنفيذ الذاتي.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {hasPermission('PO_CREATE') && (
            <Link href="/dashboard/purchases/create" className="relative flex items-center gap-2 font-black py-3 px-6 rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] group bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white overflow-hidden hover:-translate-y-1">
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <PlusCircle size={20} className="group-hover:rotate-90 transition-transform relative z-10" />
              <span className="relative z-10 text-sm">إنشاء طلب شراء (PO)</span>
            </Link>
          )}
        </div>
      </div>

      {/* Top Value Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/20 p-6 flex items-center justify-between group shadow-xl">
           <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
           <div>
             <p className="text-indigo-400 font-bold mb-1 flex items-center gap-2">
               <Wallet size={16} /> إجمالي المشتريات المعتمدة
             </p>
             <h2 className="text-3xl font-black text-white font-mono">{totalSpend.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span className="text-sm text-slate-500">SAR</span></h2>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30 shadow-inner group-hover:scale-110 transition-transform">
             <Receipt size={28} />
           </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-900/40 to-slate-900 border border-amber-500/20 p-6 flex items-center justify-between group shadow-xl">
           <div className="absolute inset-0 bg-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
           <div>
             <p className="text-amber-400 font-bold mb-1 flex items-center gap-2">
               <Clock size={16} /> طلبات قيد المراجعة
             </p>
             <h2 className="text-3xl font-black text-white font-mono">{pendingCount} <span className="text-sm text-slate-500">طلبات شراء</span></h2>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400 border border-amber-500/30 shadow-inner group-hover:scale-110 transition-transform">
             <Activity size={28} />
           </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900/40 to-slate-900 border border-emerald-500/20 p-6 flex items-center justify-between group shadow-xl">
           <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
           <div>
             <p className="text-emerald-400 font-bold mb-1 flex items-center gap-2">
               <CheckCircle2 size={16} /> طلبات مكتملة وموردة
             </p>
             <h2 className="text-3xl font-black text-white font-mono">{approvedCount} <span className="text-sm text-slate-500">طلبات شراء</span></h2>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30 shadow-inner group-hover:scale-110 transition-transform">
             <FileBox size={28} />
           </div>
        </div>
      </div>

      <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 p-3 rounded-2xl flex items-center gap-4 shadow-lg">
        <div className="relative flex-1 group">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="بحث برقم الطلب (PO)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-2.5 pr-12 pl-4 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          />
        </div>
      </div>

      <div className="rounded-3xl glass border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-900/50 text-slate-400 border-b border-white/5 uppercase font-medium">
              <tr>
                <th className="px-6 py-4">رقم الـ PO</th>
                <th className="px-6 py-4">المشروع</th>
                <th className="px-6 py-4">المورد / المورد المحتمل</th>
                <th className="px-6 py-4 text-indigo-400">الإجمالي (SAR)</th>
                <th className="px-6 py-4">تاريخ الطلب</th>
                <th className="px-6 py-4 text-center">حالة الطلب</th>
                <th className="px-6 py-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {isLoading ? (
                <tr>
                   <td colSpan={7} className="px-6 py-12 text-center text-slate-400"><Loader2 className="animate-spin mx-auto text-indigo-500" size={24} /></td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                   <td colSpan={7} className="px-6 py-12 text-center text-slate-400 glass">لا توجد طلبات شراء مسجلة بعد.</td>
                </tr>
              ) : (
                orders.filter(o => o.poNumber.includes(search)).map((ord, i) => (
                  <motion.tr 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    key={ord.id} 
                    onClick={() => router.push(`/dashboard/purchases/${ord.id}`)}
                    className="hover:bg-indigo-500/[0.03] transition-colors cursor-pointer group border-b border-white/5 active:bg-indigo-500/10"
                  >
                    <td className="px-6 py-5 font-mono font-bold text-white"><span className="text-indigo-400">#</span>{ord.poNumber}</td>
                    <td className="px-6 py-5 font-bold text-white">{ord.project?.name || "عام (بدون مشروع)"}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-700 font-bold text-xs shadow-inner">
                           {ord.supplier?.name?.charAt(0) || '?'}
                        </div> 
                        <span className="font-semibold text-slate-300">{ord.supplier?.name || "مورد غير محدد"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-indigo-500 text-lg border-x border-white/5 bg-slate-900/40">
                      {Number(ord.totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-5 text-slate-400 font-medium font-mono text-xs">{new Date(ord.issueDate).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year:'numeric' })}</td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center">
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${statusMap[ord.status]?.color || statusMap['PENDING'].color}`}>
                          {(() => {
                            const IconComp = statusMap[ord.status]?.icon || Clock;
                            return <IconComp size={14} />;
                          })()}
                          {statusMap[ord.status]?.label || ord.status}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      {ord.status === 'PENDING' ? (
                        <div className="flex items-center justify-center gap-2">
                          {hasPermission('PO_APPROVE') && (
                            <button 
                              onClick={async (e) => {
                                e.stopPropagation();
                                if(!confirm("هل أنت متأكد من اعتماد طلب الشراء؟ (سيتم ترحيله إلى دفترة)")) return;
                                try {
                                  await axios.patch(`${API_BASE_URL}/v1/purchases/${ord.id}/approve`, {}, {
                                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                                  });
                                  fetchOrders();
                                } catch(err: any) {
                                  const errData = err.response?.data || err.message;
                                  alert(typeof errData === 'object' ? JSON.stringify(errData, null, 2) : errData);
                                }
                              }}
                              title="اعتماد وترحيل الشراء"
                              className="p-2.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-xl transition-all shadow-sm"
                            >
                              <CheckCircle2 size={18} />
                            </button>
                          )}

                          {hasPermission('PO_CREATE') && (
                            <>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  alert('شاشة التعديل قيد التطوير وستتوفر قريباً!');
                                }}
                                title="تعديل طلب الشراء"
                                className="p-2.5 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white rounded-xl transition-all shadow-sm"
                              >
                                <Edit size={18} />
                              </button>
                              
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  if(!confirm("هل أنت متأكد من حذف وإلغاء طلب الشراء بشكل نهائي؟")) return;
                                  try {
                                    await axios.delete(`${API_BASE_URL}/v1/purchases/${ord.id}`, {
                                      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                                    });
                                    fetchOrders();
                                  } catch(err: any) {
                                    alert("فشل الحذف. قد يكون الطلب معتمداً مسبقاً.");
                                  }
                                }}
                                title="إلغاء وحذف الطلب"
                                className="p-2.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all shadow-sm"
                              >
                                <Trash2 size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="flex justify-center">
                           <span className="text-slate-500 text-xs font-bold bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 shadow-inner opacity-50">مكتمل ✅</span>
                        </div>
                      )}
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
