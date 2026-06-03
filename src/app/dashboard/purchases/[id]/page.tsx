"use client";

import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/lib/api";
import { useRouter, useParams } from "next/navigation";
import { Loader2, ArrowRight, Printer, CheckCircle2, Clock, Package, RefreshCcw, FileSpreadsheet, Upload, BadgeCheck } from "lucide-react";
import axios from "axios";
import { exportToCsv } from "@/lib/exportUtils";
import { useDownloadPdf } from "@/hooks/useDownloadPdf";
import { useLanguage } from "@/lib/i18n/context";
import PrintLetterhead from "../../components/PrintLetterhead";

export default function ViewPurchaseOrderPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const { pdfRef, downloadPdf } = useDownloadPdf();

  useEffect(() => {
    if (orderId) fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/v1/purchases/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrder(res.data);
    } catch (err) {
      alert("تعذر جلب بيانات أمر الشراء");
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncFromDaftra = async () => {
    if (!order.daftraId) {
      alert('أمر الشراء هذا غير مربوط بدفترة بعد.');
      return;
    }
    setIsSyncing(true);
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_BASE_URL}/v1/purchases/${orderId}/sync-daftra`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('تم التحقق من دفترة - أمر الشراء موجود ومتزامن.');
      await fetchOrder();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'خطأ مجهول';
      alert(msg);
      // إعادة تحميل الصفحة لعرض الحالة الجديدة (PENDING) إذا تم الحذف من دفترة
      await fetchOrder();
    } finally {
      setIsSyncing(false);
    }
  };

  const handleApprove = async () => {
    if (!confirm("هل أنت متأكد من اعتماد طلب الشراء؟")) return;
    setIsApproving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_BASE_URL}/v1/purchases/${orderId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('تم اعتماد طلب الشراء بنجاح.');
      await fetchOrder();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'خطأ مجهول';
      alert(msg);
    } finally {
      setIsApproving(false);
    }
  };

  const handlePostToDaftra = async () => {
    if (!confirm("هل أنت متأكد من ترحيل طلب الشراء إلى دفترة؟")) return;
    setIsPosting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/v1/purchases/${orderId}/post`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('تم ترحيل طلب الشراء إلى دفترة بنجاح.');
      await fetchOrder();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'خطأ مجهول';
      alert(msg);
    } finally {
      setIsPosting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    if (!order?.items) return;
    const exportData = order.items.map((item: any, i: number) => ({
      [t("common.no") || "م"]: i + 1,
      [t("purchase.itemName") || "الصنف / الوصف"]: item.material?.name || t("purchase.itemPlaceholder"),
      [t("purchase.quantity") || "الكمية"]: item.quantity,
      [t("purchase.unitPrice") || "السعر الإفرادي"]: item.unitPrice,
      [t("purchase.itemTotal") || "الإجمالي"]: item.totalPrice
    }));
    exportToCsv(`PO_${order.poNumber}.csv`, exportData);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] print:hidden">
         <Loader2 className="animate-spin text-indigo-500 mb-4" size={48} />
         <p className="text-slate-400 font-bold">{t("purchase.loadingPO")}</p>
      </div>
    );
  }

  if (!order) return null;

  return (
    <>
      {/* Screen View */}
      <div className="max-w-5xl mx-auto space-y-6 w-full animate-in fade-in zoom-in-95 duration-500 pb-12 print:hidden relative">
        <div className="flex items-center justify-between bg-slate-900/50 p-6 rounded-3xl border border-white/5 shadow-lg">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl transition">
              <ArrowRight size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-black text-white flex items-center gap-3">
                {t("purchase.viewTitle").replace("{poNumber}", order.poNumber)}
              </h1>
              <p className="text-slate-400 mt-1 font-bold tracking-wider">{t("purchase.viewProject").replace("{project}", order.project?.name || t("purchase.viewGeneralStorage"))}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {order.status === 'PENDING' && (
              <button
                onClick={handleApprove}
                disabled={isApproving}
                className="flex items-center gap-2 px-5 py-3 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-xl font-bold border border-emerald-500/30 transition disabled:opacity-50"
              >
                <BadgeCheck size={18} className={isApproving ? 'animate-spin' : ''} />
                {isApproving ? t("purchase.approving") : t("purchase.approve")}
              </button>
            )}
            {order.status === 'APPROVED' && !order.daftraId && (
              <button
                onClick={handlePostToDaftra}
                disabled={isPosting}
                className="flex items-center gap-2 px-5 py-3 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white rounded-xl font-bold border border-blue-500/30 transition disabled:opacity-50"
              >
                <Upload size={18} className={isPosting ? 'animate-pulse' : ''} />
                {isPosting ? t("purchase.posting") : t("purchase.postToDaftra")}
              </button>
            )}
            {order.status === 'APPROVED' && order.daftraId && (
              <button
                onClick={handleSyncFromDaftra}
                disabled={isSyncing}
                className="flex items-center gap-2 px-5 py-3 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white rounded-xl font-bold border border-blue-500/30 transition disabled:opacity-50"
              >
                <RefreshCcw size={18} className={isSyncing ? 'animate-spin' : 'group-hover:rotate-180'} />
                {isSyncing ? t("purchase.syncing") : t("purchase.updateFromDaftra")}
              </button>
            )}
            <button onClick={handleExportExcel} className="flex items-center gap-2 px-5 py-3 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-xl font-bold border border-emerald-500/30 transition shadow-lg text-sm">
               <FileSpreadsheet size={18} /> Excel
            </button>
            <button onClick={() => downloadPdf(`PO_${order?.poNumber || 'draft'}.pdf`)} className="flex items-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold shadow-lg transition hover:-translate-y-1">
              <Printer size={18} /> PDF
            </button>
            <button onClick={handlePrint} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] transition hover:-translate-y-1">
               <Printer size={18} /> {t("purchase.printPreview")}
            </button>
          </div>
        </div>

        <div className="glass-dark border border-white/5 p-12 rounded-3xl text-center shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-1/2 translate-x-1/2 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
           <p className="text-8xl mb-6">🖨️</p>
           <h2 className="text-3xl font-black text-white mb-4">{t("purchase.printReadyTitle")}</h2>
           <p className="text-slate-400 max-w-lg mx-auto text-lg leading-relaxed">
             {t("purchase.printReadyDesc")}
           </p>
        </div>
      </div>

      {/* PRINT VIEW */}
      <div ref={pdfRef} className="hidden print:block print-on-letterhead text-black font-sans bg-white" dir="rtl">
        {/* ===== الورقة الرسمية كخلفية ===== */}
        <PrintLetterhead />

        {/* ===== البيانات فوق الورقة ===== */}
        <div className="pt-20 mb-8">
          <div className="inline-block bg-slate-50 p-3 rounded-lg border border-slate-200 text-right">
            <p className="text-sm font-bold text-slate-800">{t("purchase.print.poNumber")} <span className="font-mono text-rose-700">#{order.poNumber}</span></p>
            <p className="text-sm font-bold text-slate-800 mt-1">{t("purchase.print.issueDate")} <span className="font-mono">{new Date(order.issueDate).toLocaleDateString('en-GB')}</span></p>
          </div>
          <h1 className="text-3xl font-black text-slate-900 mt-3">{t("purchase.print.title")}</h1>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-10 text-sm break-inside-avoid">
           <div className="bg-white p-4 border-2 border-slate-200 rounded-lg shadow-sm">
              <p className="text-slate-500 font-black mb-3 uppercase text-xs tracking-wider border-b border-slate-100 pb-2">{t("purchase.print.supplierTitle")}</p>
              <p className="mb-2"><span className="font-bold w-28 inline-block text-slate-600">{t("purchase.print.companyLabel")}</span> <span className="font-black text-lg text-slate-900">{order.supplier?.name}</span></p>
              <p className="mb-2"><span className="font-bold w-28 inline-block text-slate-600">{t("purchase.print.taxNumberLabel")}</span> <span className="font-mono font-bold text-slate-900">{order.supplier?.taxNumber || '-'}</span></p>
              <p className="mb-2"><span className="font-bold w-28 inline-block text-slate-600">{t("purchase.print.phoneLabel")}</span> <span className="font-mono font-bold text-slate-900">{order.supplier?.phone || '-'}</span></p>
           </div>
           
           <div className="bg-white p-4 border-2 border-slate-200 rounded-lg shadow-sm">
              <p className="text-slate-500 font-black mb-3 uppercase text-xs tracking-wider border-b border-slate-100 pb-2">{t("purchase.print.deliveryTitle")}</p>
              <p className="mb-2"><span className="font-bold w-28 inline-block text-slate-600">{t("purchase.print.locationLabel")}</span> <span className="font-black text-lg text-slate-900">{order.project?.name || t("purchase.print.generalStorage")}</span></p>
              {order.project?.code && <p className="mb-2"><span className="font-bold w-28 inline-block text-slate-600">{t("purchase.print.projectCodeLabel")}</span> <span className="font-mono font-bold text-slate-900">{order.project.code}</span></p>}
              <p className="mb-2"><span className="font-bold w-28 inline-block text-slate-600">{t("purchase.print.deliveryDateLabel")}</span> <span className="font-mono font-bold text-slate-900">{order.expectedDate ? new Date(order.expectedDate).toLocaleDateString('en-GB') : t("purchase.print.asap")}</span></p>
           </div>
        </div>

        <h3 className="font-black text-slate-900 mb-3 px-2 text-lg">{t("purchase.print.itemsTitle")}</h3>
        <table className="w-full text-right text-sm border-collapse mb-10">
          <thead>
            <tr className="bg-slate-200 border-2 border-slate-900 text-slate-900 text-xs font-black uppercase">
              <th className="p-3 border-2 border-slate-900 text-center w-12">{t("purchase.print.columnNo")}</th>
              <th className="p-3 border-2 border-slate-900">{t("purchase.print.columnItem")}</th>
              <th className="p-3 border-2 border-slate-900 text-center w-20">{t("purchase.print.columnQty")}</th>
              <th className="p-3 border-2 border-slate-900 text-center w-28">{t("purchase.print.columnUnitPrice")}</th>
              <th className="p-3 border-2 border-slate-900 text-center w-32">{t("purchase.print.columnTotal")}</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item: any, i: number) => (
               <tr key={item.id} className="border border-slate-300">
                 <td className="p-2 border border-slate-900 text-center font-bold text-slate-600">{i + 1}</td>
                 <td className="p-2 border border-slate-900 font-bold text-slate-900 text-base">{item.material?.name || t("purchase.noName")}</td>
                 <td className="p-2 border border-slate-900 text-center font-mono font-black text-slate-900 text-base">{item.quantity}</td>
                 <td className="p-2 border border-slate-900 text-center font-mono text-slate-800">{Number(item.unitPrice).toLocaleString()}</td>
                 <td className="p-2 border border-slate-900 text-center font-mono font-black text-slate-900 bg-slate-50">{Number(item.totalPrice).toLocaleString()}</td>
               </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mb-16 break-inside-avoid">
          <div className="w-1/2 border-2 border-slate-900 rounded-lg overflow-hidden shadow-md">
            <table className="w-full text-right border-collapse text-sm">
              <tbody>
                <tr className="border-b border-slate-200">
                   <td className="p-4 font-bold bg-slate-50 text-slate-700">{t("purchase.print.subtotal")}</td>
                   <td className="p-4 font-mono font-black text-left text-slate-900">{Number(order.totalAmount).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                </tr>
                {Number(order.taxAmount) > 0 && (
                  <tr className="border-b border-slate-200">
                     <td className="p-4 font-bold bg-slate-50 text-slate-700">{t("purchase.print.vat")}</td>
                     <td className="p-4 font-mono font-black text-left text-slate-900">{Number(order.taxAmount).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  </tr>
                )}
                <tr className="bg-slate-900 text-white">
                   <td className="p-5 font-black uppercase tracking-widest text-lg">{t("purchase.print.netTotal")}</td>
                   <td className="p-5 font-mono font-black text-left text-2xl">SAR {Number(order.netAmount).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-16 pt-8 break-inside-avoid border-t-2 border-slate-100 text-black">
          <h3 className="font-black text-lg mb-10 border-b-2 border-slate-800 pb-2 w-max text-slate-800 uppercase tracking-widest">{t("purchase.print.approvals")}</h3>
          <div className="grid grid-cols-3 gap-8 text-center text-sm">
            <div className="flex flex-col items-center">
              <p className="font-bold text-slate-800 mb-4 uppercase tracking-widest text-xs">{t("purchase.print.preparedBy")}</p>
              <div className="border-2 border-slate-200 bg-slate-50 text-slate-700 p-2 rounded-xl inline-block text-center shadow-sm w-48 relative overflow-hidden">
                <div className="absolute inset-0 bg-slate-100 opacity-50"></div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1 border-b border-slate-200 pb-1 relative z-10">{t("purchase.print.ePrepared")}</p>
                <p className="text-xs font-black mt-1 relative z-10">{order.createdBy || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}').name : '') || t("purchase.print.procurementOfficer")}</p>
                <p className="text-[9px] font-mono mt-1 relative z-10">{new Date(order.createdAt).toLocaleDateString('en-GB')}</p>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <p className="font-bold text-slate-800 mb-16 uppercase tracking-widest text-xs">{t("purchase.print.financeManager")}</p>
              <p className="text-slate-400 w-full border-b-2 border-dashed border-slate-400 mt-auto"></p>
            </div>
            <div className="flex flex-col items-center">
               <p className="font-bold text-slate-800 mb-4 uppercase tracking-widest text-xs">{t("purchase.print.generalManager")}</p>
               {order.status === 'APPROVED' ? (
                 <div className="border-2 border-emerald-500 bg-emerald-50 text-emerald-800 p-2 rounded-xl inline-block text-center shadow-md w-56 relative overflow-hidden transform -rotate-2 mt-2">
                   <div className="absolute inset-0 bg-emerald-500 opacity-5"></div>
                   <p className="text-[10px] font-black uppercase tracking-widest mb-1 border-b border-emerald-200 pb-1 relative z-10 text-emerald-600">{t("purchase.print.eApproved")}</p>
                   <p className="text-sm font-black mt-1 relative z-10">{order.approvedBy || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}').name : '') || t("purchase.print.generalManagerName")}</p>
                   <p className="text-[9px] font-mono mt-1 relative z-10">{order.approvedAt ? new Date(order.approvedAt).toLocaleString('en-GB') : new Date(order.updatedAt).toLocaleString('en-GB')}</p>
                 </div>
               ) : (
                 <p className="text-slate-400 w-full border-b-2 border-dashed border-slate-400 mt-auto"></p>
               )}
            </div>
          </div>
        </div>
        

      </div>
    </>
  );
}
