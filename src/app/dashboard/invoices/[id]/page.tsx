"use client";

import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/lib/api";
import { useRouter, useParams } from "next/navigation";
import { 
  FileText, 
  ArrowRight,
  Printer,
  BadgeCheck,
  Clock,
  Wallet,
  Building,
  Calendar,
  ShieldAlert,
  Percent,
  Calculator,
  Loader2,
  AlertCircle,
  Edit3,
  RefreshCcw
} from "lucide-react";
import axios from "axios";
import { motion } from "framer-motion";

export default function InvoiceViewPage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;
  const [invoice, setInvoice] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (invoiceId) fetchInvoice();
  }, [invoiceId]);

  const fetchInvoice = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/v1/invoices/${invoiceId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInvoice(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncPayment = async () => {
    setIsSyncing(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_BASE_URL}/v1/invoices/${invoiceId}/sync-payment`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchInvoice();
      alert('تم تحديث حالة السداد من دفترة بنجاح!');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "خطأ مجهول";
      alert(`فشل المزامنة مع دفترة: ${msg}`);
      // If reverted to DRAFT, reload to show new status
      await fetchInvoice();
    } finally {
      setIsSyncing(false);
    }
  };



  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-emerald-500 mb-4" size={48} />
        <p className="text-slate-400">جاري تحميل بيانات المستخلص...</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle className="text-rose-500 mb-4" size={48} />
        <p className="text-slate-400">عذراً، المستخلص غير موجود أو حدث خطأ.</p>
        <button onClick={() => router.back()} className="mt-4 text-emerald-500 hover:underline">العودة للسابق</button>
      </div>
    );
  }

  const statusMap: Record<string, { label: string, color: string, bg: string, icon: any }> = {
    DRAFT: { label: "مسودة غير معتمدة", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", icon: Clock },
    CERTIFIED: { label: "مستخلص معتمد", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", icon: FileText },
    PAID: { label: "تم دفع المستخلص", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", icon: BadgeCheck },
  };

  const statusInfo = statusMap[invoice.status] || statusMap['DRAFT'];
  const StatusIcon = statusInfo.icon;
  const totalDeductions = Number(invoice.retentionAmount) + Number(invoice.advanceDeduction) + Number(invoice.delayPenalty) + Number(invoice.otherDeductions);

  const handleCertify = async () => {
    if (!confirm("هل أنت متأكد من رغبتك في اعتماد المستخلص؟ هذه الخطوة لا يمكن التراجع عنها وستقوم بإرساله لدفترة.")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(`${API_BASE_URL}/v1/invoices/${invoiceId}/certify`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const daftraId = response.data?.daftraExternalId || "N/A";
      alert(`تم اعتماد المستخلص بنجاح!\nرقم الربط في دفترة: ${daftraId}`);
      setInvoice({ ...invoice, status: 'CERTIFIED' });
    } catch (err: any) {
      const errData = err.response?.data || err.message;
      alert(`حدث خطأ أثناء المزامنة مع دفترة:\n${typeof errData === 'object' ? JSON.stringify(errData, null, 2) : errData}`);
    }
  };

  return (
    <>
    {/* Screen View */}
    <div className="space-y-8 w-full animate-in fade-in zoom-in-95 duration-500 relative max-w-[1400px] mx-auto pb-12 print:hidden">
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/dashboard/invoices')} className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors shadow-lg">
            <ArrowRight size={22} />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 mb-1 flex items-center gap-3">
              مستخلص رقم #{invoice.invoiceNumber}
            </h1>
            <p className="text-slate-400 text-sm flex items-center gap-2">
              <Calendar size={14} className="opacity-70" /> {new Date(invoice.issueDate).toLocaleDateString('ar-SA')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold border ${statusInfo.color} ${statusInfo.bg} shadow-soft`}>
            <StatusIcon size={18} className="opacity-80" />
            {statusInfo.label}
          </div>
          
          {invoice.status === 'DRAFT' && (
            <button 
              onClick={() => router.push(`/dashboard/invoices/${invoiceId}/edit`)}
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-white rounded-xl transition-all border border-amber-500/20 shadow-lg font-medium group"
            >
              <Edit3 size={18} className="group-hover:rotate-12 transition-transform" /> تعديل המסودة
            </button>
          )}

          {/* زر الاعتماد - يظهر للمسودات فقط */}
          {invoice.status === 'DRAFT' && (
            <button
              onClick={handleCertify}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white rounded-xl transition-all border border-emerald-500/20 shadow-lg font-bold group"
            >
              <BadgeCheck size={18} className="group-hover:scale-110 transition-transform" />
              اعتماد المستخلص رسمياً
            </button>
          )}

          {/* زر تحديث من دفترة - يظهر للمستخلصات المعتمدة المربوطة بدفترة */}
          {invoice.status === 'CERTIFIED' && invoice.daftraInvoiceId && (
            <button 
              onClick={handleSyncPayment}
              disabled={isSyncing}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white rounded-xl transition-all border border-blue-500/20 shadow-lg font-bold group disabled:opacity-50"
            >
              <RefreshCcw size={18} className={`transition-transform duration-500 ${isSyncing ? 'animate-spin' : 'group-hover:rotate-180'}`} /> 
              {isSyncing ? 'جاري التحديث...' : 'تحديث من دفترة'}
            </button>
          )}

          <button onClick={() => window.print()} className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors border border-slate-700 shadow-lg font-medium">
            <Printer size={18} /> طباعة رسمية
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info Cards */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-dark border border-white/5 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl" />
            
            <h3 className="text-lg font-bold text-white mb-6 border-b border-white/5 pb-4 flex items-center gap-2">
              <Building className="text-emerald-400" size={20} /> بيانات المشروع والعقد
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                <p className="text-xs text-slate-500 mb-1">المشروع</p>
                <p className="text-base font-bold text-white">{invoice.project?.name}</p>
                <p className="text-sm font-mono text-slate-400 mt-1 uppercase">{invoice.project?.code}</p>
              </div>
              
              <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                <p className="text-xs text-slate-500 mb-1">
                  {invoice.contract?.type === 'MAIN_CONTRACT' ? 'العميل (الجهة المالكة)' : 'المقاول (صاحب العقد)'}
                </p>
                <p className="text-base font-bold text-white">
                  {invoice.contract?.type === 'MAIN_CONTRACT' 
                    ? (invoice.project?.client?.name || "عميل غير مسجل") 
                    : (invoice.contract?.subcontractor?.name || "مقاول غير مسجل")}
                </p>
                <p className="text-sm font-mono text-slate-400 mt-1">Ref: {invoice.contract?.referenceNumber}</p>
              </div>
            </div>
          </div>

          <div className="glass-dark border border-white/5 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-6 border-b border-white/5 pb-4 flex items-center gap-2">
              <FileText className="text-emerald-400" size={20} /> تفاصيل بنود الأعمال المنفذة
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead className="bg-slate-900/60 text-slate-400 border-b border-white/10">
                  <tr>
                    <th className="px-4 py-3 font-medium">البند</th>
                    <th className="px-4 py-3 font-medium text-center">السابق</th>
                    <th className="px-4 py-3 font-medium text-center text-emerald-400">الحالي</th>
                    <th className="px-4 py-3 font-medium text-center">الإجمالي</th>
                    <th className="px-4 py-3 font-medium text-center">الفئة</th>
                    <th className="px-4 py-3 font-medium text-center">القيمة الحالية (SAR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {invoice.details?.map((detail: any, i: number) => (
                    <tr key={detail.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-4 w-[280px]">
                        <p className="font-semibold text-white mb-1 truncate" title={detail.boqItem?.description}>{detail.boqItem?.description}</p>
                        <p className="text-xs text-slate-500 font-mono">{detail.boqItem?.itemCode}</p>
                      </td>
                      <td className="px-4 py-4 text-center font-mono text-slate-400">{detail.previousQty}</td>
                      <td className="px-4 py-4 text-center font-mono font-bold text-emerald-400 bg-emerald-500/5">{detail.currentQty}</td>
                      <td className="px-4 py-4 text-center font-mono text-blue-400">{detail.totalQty}</td>
                      <td className="px-4 py-4 text-center font-mono">{Number(detail.unitPrice).toLocaleString()}</td>
                      <td className="px-4 py-4 text-center font-mono font-bold text-white">{Number(detail.currentValue).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="w-full space-y-6">
          <div className="glass-dark border border-white/5 rounded-3xl p-6 shadow-2xl sticky top-24">
             <h3 className="text-xl font-bold text-emerald-400 mb-6 border-b border-emerald-500/20 pb-4 flex items-center gap-2">
               <Calculator size={22} /> الملخص المالي
             </h3>
             
             <div className="space-y-5 mb-8">
               <div className="flex justify-between items-center text-base">
                 <span className="text-slate-300">إجمالي الأعمال الحالية</span>
                 <span className="font-mono text-white font-bold">SAR {Number(invoice.grossAmount).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
               </div>
               
               <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/50 space-y-3">
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-rose-400 flex items-center gap-1.5"><ShieldAlert size={14} /> محتجز ({invoice.retentionPercent}%)</span>
                   <span className="font-mono text-rose-400">- {Number(invoice.retentionAmount).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                 </div>
                 
                 {Number(invoice.advanceDeduction) > 0 && (
                   <div className="flex justify-between items-center text-sm">
                     <span className="text-amber-400 flex items-center gap-1.5"><Wallet size={14} /> دفعة مقدمة المستردة</span>
                     <span className="font-mono text-amber-400">- {Number(invoice.advanceDeduction).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                   </div>
                 )}

                 {Number(invoice.delayPenalty) > 0 && (
                   <div className="flex justify-between items-center text-sm">
                     <span className="text-rose-500 flex items-center gap-1.5"><Clock size={14} /> غرامات تأخير</span>
                     <span className="font-mono text-rose-500">- {Number(invoice.delayPenalty).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                   </div>
                 )}

                 {Number(invoice.otherDeductions) > 0 && (
                   <div className="flex justify-between items-center text-sm">
                     <span className="text-slate-400 flex items-center gap-1.5"><Percent size={14} /> خصومات أخرى</span>
                     <span className="font-mono text-slate-400">- {Number(invoice.otherDeductions).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                   </div>
                 )}
                 
                 <div className="pt-2 mt-2 border-t border-slate-800 flex justify-between items-center text-xs font-semibold">
                   <span className="text-slate-500">إجمالي الاستقطاعات</span>
                   <span className="font-mono text-rose-400 text-sm">SAR {totalDeductions.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                 </div>
               </div>

               <div className="flex justify-between items-center text-sm py-3 border-y border-white/5">
                 <span className="text-blue-400 flex items-center gap-2"><Percent size={16} /> ضريبة القيمة المضافة ({invoice.taxPercent}%)</span>
                 <span className="font-mono text-blue-400 font-bold">+ {Number(invoice.taxAmount).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
               </div>

               <div className="pt-4 flex flex-col gap-2">
                 <span className="text-emerald-400 font-black text-lg text-center bg-emerald-500/10 py-1 rounded-xl">المبلغ الصافي المستحق</span>
                 <span className="font-mono text-emerald-400 font-black text-3xl text-center">SAR {Number(invoice.netAmount).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
               </div>
             </div>

              {/* Payment Status Tracker Section */}
              <div className="mt-6 border-t border-white/10 pt-6 animate-in slide-in-from-bottom flex flex-col gap-4">
                <div className="flex justify-between items-center bg-slate-900/40 p-3 rounded-xl border border-slate-800">
                  <h4 className="text-slate-300 font-bold flex items-center gap-2">
                    <Wallet size={18} className="text-indigo-400" /> الإدارة المالية 
                  </h4>
                  {invoice.status === 'CERTIFIED' && (
                    <button 
                      onClick={handleSyncPayment}
                      disabled={isSyncing}
                      className="text-xs bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-50 hover:scale-105"
                    >
                      <RefreshCcw size={14} className={isSyncing ? "animate-spin" : ""} />
                      {isSyncing ? "جاري الاستشعار..." : "تحديث من دفترة"}
                    </button>
                  )}
                </div>

                <div className={`p-4 rounded-2xl flex flex-col gap-3 relative overflow-hidden border transition-all ${
                  invoice.paymentStatus === 'PAID' ? 'bg-emerald-500/10 border-emerald-500/30' : 
                  invoice.paymentStatus === 'PARTIAL' ? 'bg-amber-500/10 border-amber-500/30' : 
                  'bg-rose-500/10 border-rose-500/30'
                }`}>
                  <div className="flex justify-between items-center text-sm font-bold text-white mb-2">
                    <span className="opacity-80">حالة السداد الحالية:</span>
                    <span className={`px-3 py-1.5 rounded-lg border ${
                      invoice.paymentStatus === 'PAID' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 
                      invoice.paymentStatus === 'PARTIAL' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 
                      'bg-rose-500/20 text-rose-400 border-rose-500/30'
                    }`}>
                      {invoice.paymentStatus === 'PAID' ? 'مسدد بالكامل' : 
                       invoice.paymentStatus === 'PARTIAL' ? 'سداد جزئي' : 
                       'لم يُسدد بعد (بانتظار الصرف)'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center bg-slate-950/40 p-3 rounded-xl border border-white/5">
                    <span className="text-slate-400 text-xs font-bold w-1/2 text-center border-l border-white/10">المتبقي للصرف<br/>
                      <span className="text-white text-base">SAR {(Number(invoice.netAmount) - Number(invoice.paidAmount)).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                    </span>
                    <span className="text-slate-400 text-xs font-bold w-1/2 text-center">ما تم صرفه<br/>
                      <span className="text-emerald-400 text-base">SAR {Number(invoice.paidAmount).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                    </span>
                  </div>
                </div>
              </div>

             {invoice.status === 'DRAFT' && (
               <button 
                 onClick={handleCertify}
                 className="w-full mt-4 flex justify-center items-center gap-2 px-6 py-4 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] transition-all hover:-translate-y-1">
                 <BadgeCheck size={20} />
                 اعتماد المستخلص رسمياً
               </button>
             )}
          </div>
        </div>
      </div>
    </div>

    {/* Print View (Professional Certificate) */}
    <div className="hidden print:block print:!bg-white print:!text-black min-h-screen pt-32 pb-10 px-8 font-sans" dir="rtl">
      {/* Document Header */}
      <div className="text-center mb-10 border-b-2 border-slate-800 pb-4">
        <h1 className="text-3xl font-black uppercase mb-2">شهادة إنجاز ومستخلص أعمال</h1>
        <p className="text-slate-600 font-bold uppercase tracking-widest text-sm">Payment Certificate / Invoice</p>
      </div>

      {/* Meta Info */}
      <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
        <div className="border-2 border-slate-800 rounded-xl p-4">
          <p className="mb-2"><span className="font-bold text-slate-500 w-32 inline-block">المشروع (Project):</span> <span className="font-bold text-lg font-mono">{invoice.project?.code}</span> | {invoice.project?.name}</p>
          <p><span className="font-bold text-slate-500 w-32 inline-block">تاريخ المستخلص:</span> <span className="font-bold font-mono">{new Date(invoice.issueDate).toLocaleDateString('en-GB')}</span></p>
        </div>
        <div className="border-2 border-slate-800 rounded-xl p-4">
          <p className="mb-2"><span className="font-bold text-slate-500 w-32 inline-block">المقاول/الجهة:</span> <span className="font-bold text-lg">{invoice.contract?.type === 'MAIN_CONTRACT' ? invoice.project?.client?.name : invoice.contract?.subcontractor?.name}</span></p>
          <p className="mb-2"><span className="font-bold text-slate-500 w-32 inline-block">رقم العقد:</span> <span className="font-bold font-mono">{invoice.contract?.referenceNumber}</span></p>
          <p><span className="font-bold text-slate-500 w-32 inline-block">رقم المستخلص:</span> <span className="font-bold text-lg font-mono">#{invoice.invoiceNumber}</span></p>
        </div>
      </div>

      {/* BOQ Items Table */}
      <table className="w-full text-right border-collapse mb-8 print:w-full break-inside-auto">
        <thead>
          <tr className="bg-slate-100 border-2 border-slate-800 text-black">
            <th className="p-2 border-2 border-slate-800 text-center font-black text-xs">البند ومواصفات الأعمال</th>
            <th className="p-2 border-2 border-slate-800 text-center font-black text-xs w-16">سابق</th>
            <th className="p-2 border-2 border-slate-800 text-center font-black text-xs w-16">حالي</th>
            <th className="p-2 border-2 border-slate-800 text-center font-black text-xs w-16">إجمالي</th>
            <th className="p-2 border-2 border-slate-800 text-center font-black text-xs w-24">الفئة</th>
            <th className="p-2 border-2 border-slate-800 text-center font-black text-xs w-32">القيمة الحالية (SAR)</th>
          </tr>
        </thead>
        <tbody>
          {invoice.details?.map((detail: any) => (
            <tr key={detail.id} className="border-2 border-slate-800 text-sm break-inside-avoid">
              <td className="p-2 border-2 border-slate-800 font-bold">{detail.boqItem?.description}</td>
              <td className="p-2 border-2 border-slate-800 text-center font-mono">{detail.previousQty}</td>
              <td className="p-2 border-2 border-slate-800 text-center font-mono font-black">{detail.currentQty}</td>
              <td className="p-2 border-2 border-slate-800 text-center font-mono">{detail.totalQty}</td>
              <td className="p-2 border-2 border-slate-800 text-center font-mono">{Number(detail.unitPrice).toLocaleString()}</td>
              <td className="p-2 border-2 border-slate-800 text-left font-black font-mono">{Number(detail.currentValue).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Financial Summary */}
      <div className="flex justify-end mb-12 break-inside-avoid">
        <div className="w-1/2 border-2 border-slate-800 rounded-lg overflow-hidden">
          <table className="w-full text-right border-collapse">
            <tbody>
              <tr className="border-b border-slate-800">
                 <td className="p-3 font-bold bg-slate-100">إجمالي الأعمال الحالية:</td>
                 <td className="p-3 font-mono font-black text-left">{Number(invoice.grossAmount).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
              </tr>
              {Number(invoice.retentionAmount) > 0 && (
                <tr className="border-b border-slate-400 text-black">
                   <td className="p-3 font-bold">يخصم محتجز ضمان ({invoice.retentionPercent}%):</td>
                   <td className="p-3 font-mono font-black text-left">- {Number(invoice.retentionAmount).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                </tr>
              )}
              {totalDeductions > Number(invoice.retentionAmount) && (
                <tr className="border-b border-slate-400 text-black">
                   <td className="p-3 font-bold">خصومات واعتمادات أخرى:</td>
                   <td className="p-3 font-mono font-black text-left">- {(totalDeductions - Number(invoice.retentionAmount)).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                </tr>
              )}
              <tr className="border-b border-slate-800 text-black">
                 <td className="p-3 font-bold">يضاف ضريبة القيمة المضافة ({invoice.taxPercent}%):</td>
                 <td className="p-3 font-mono font-black text-left">+ {Number(invoice.taxAmount).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
              </tr>
              <tr className="bg-slate-200 text-lg">
                 <td className="p-4 font-black">الصافي المعتمـد للصرف:</td>
                 <td className="p-4 font-mono font-black text-left">SAR {Number(invoice.netAmount).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Signatures */}
      <div className="mt-16 pt-8 break-inside-avoid text-black">
        <h3 className="font-black text-lg mb-10 border-b-2 border-slate-800 pb-2 w-max text-slate-800">الاعتمادات والموافقات:</h3>
        <div className="grid grid-cols-4 gap-8 text-center text-sm">
          <div>
            <p className="font-bold text-slate-800 mb-12">المقاول المـُنفذ</p>
            <p className="text-slate-400">.......................................</p>
          </div>
          <div>
            <p className="font-bold text-slate-800 mb-12">مهندس الموقع (الاستلام)</p>
            <p className="text-slate-400">.......................................</p>
          </div>
          <div>
             <p className="font-bold text-slate-800 mb-12">مدير المشروع (Technical)</p>
             <p className="text-slate-400">.......................................</p>
          </div>
          <div>
            <p className="font-bold text-slate-800 mb-12">الإدارة والموافقة النهائية</p>
            <p className="text-slate-400">.......................................</p>
          </div>
        </div>
      </div>

    </div>
    </>
  );
}
