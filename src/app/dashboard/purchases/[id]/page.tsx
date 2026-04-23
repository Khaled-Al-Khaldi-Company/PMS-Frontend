"use client";

import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/lib/api";
import { useRouter, useParams } from "next/navigation";
import { Loader2, ArrowRight, Printer, CheckCircle2, Clock, Package, RefreshCcw, FileSpreadsheet } from "lucide-react";
import axios from "axios";
import { exportToCsv } from "@/lib/exportUtils";

export default function ViewPurchaseOrderPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

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

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    if (!order?.items) return;
    const exportData = order.items.map((item: any, i: number) => ({
      "م": i + 1,
      "الصنف / الوصف": item.material?.name || 'مادة بدون اسم',
      "الكمية": item.quantity,
      "السعر الإفرادي": item.unitPrice,
      "الإجمالي": item.totalPrice
    }));
    exportToCsv(`PO_${order.poNumber}.csv`, exportData);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] print:hidden">
         <Loader2 className="animate-spin text-indigo-500 mb-4" size={48} />
         <p className="text-slate-400 font-bold">جاري تحميل أمر الشراء...</p>
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
                أمر شراء (PO) #{order.poNumber}
              </h1>
              <p className="text-slate-400 mt-1 font-bold tracking-wider">المشروع: {order.project?.name || 'تخزين عام (بدون مشروع)'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {order.status === 'APPROVED' && order.daftraId && (
              <button
                onClick={handleSyncFromDaftra}
                disabled={isSyncing}
                className="flex items-center gap-2 px-5 py-3 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white rounded-xl font-bold border border-blue-500/30 transition disabled:opacity-50"
              >
                <RefreshCcw size={18} className={isSyncing ? 'animate-spin' : 'group-hover:rotate-180'} />
                {isSyncing ? 'جاري التحقق...' : 'تحديث من دفترة'}
              </button>
            )}
            <button onClick={handleExportExcel} className="flex items-center gap-2 px-5 py-3 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-xl font-bold border border-emerald-500/30 transition shadow-lg text-sm">
               <FileSpreadsheet size={18} /> Excel
            </button>
            <button onClick={handlePrint} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] transition hover:-translate-y-1">
              <Printer size={18} /> معاينة وطباعة رسمية
            </button>
          </div>
        </div>

        <div className="glass-dark border border-white/5 p-12 rounded-3xl text-center shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-1/2 translate-x-1/2 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
           <p className="text-8xl mb-6">🖨️</p>
           <h2 className="text-3xl font-black text-white mb-4">نموذج أمر الشراء جاهز للطباعة</h2>
           <p className="text-slate-400 max-w-lg mx-auto text-lg leading-relaxed">
             اضغط على زر (الطباعة الرسمية) بالأعلى لمعاينة النموذج الورقي المعتمد بشكله الاحترافي والأنيق مع التوقيعات الدفترية.
           </p>
        </div>
      </div>

      {/* PRINT VIEW (Professional PO) */}
      <div className="hidden print:block print:!bg-white print:!text-black min-h-screen pt-8 pb-10 px-8 font-sans" dir="rtl">
        {/* Professional Header */}
        <div className="flex justify-between items-start border-b-4 border-slate-900 pb-6 mb-8 relative">
           <div className="absolute top-0 right-0 w-full h-1 bg-rose-600 rounded-t"></div>
           <div className="flex flex-col gap-1 mt-2 text-right">
             <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">أمــر شــراء</h1>
             <h2 className="text-xl font-bold text-slate-500 uppercase tracking-widest mb-4">Purchase Order (PO)</h2>
             
             <div className="bg-slate-100 p-3 rounded-lg border border-slate-200 inline-block text-right">
               <p className="text-sm font-bold text-slate-800">رقم الأمر (PO No): <span className="font-mono text-rose-700">#{order.poNumber}</span></p>
               <p className="text-sm font-bold text-slate-800 mt-1">تاريخ الإصدار (Date): <span className="font-mono">{new Date(order.issueDate).toLocaleDateString('en-GB')}</span></p>
             </div>
           </div>
           
           <div className="text-left flex flex-col items-end">
             <div className="w-48 h-16 bg-slate-50 border-2 border-slate-200 rounded flex items-center justify-center mb-3 shadow-sm">
               <span className="font-black text-xl text-slate-400 tracking-wider">LOGO</span>
             </div>
             <h3 className="font-black text-xl text-slate-900 uppercase">PMS Contracting Est.</h3>
             <p className="text-xs text-slate-600 font-bold mt-1">مؤسسة إدارة المشاريع للمقاولات</p>
             <p className="text-xs text-slate-500 mt-1">شارع العليا، الرياض، المملكة العربية السعودية</p>
             <div className="mt-2 text-xs text-slate-600 font-bold grid grid-cols-1 gap-1 text-right" dir="ltr">
               <p>VAT No: <span className="font-mono">300000000000003</span></p>
               <p>CR No: <span className="font-mono">1010101010</span></p>
             </div>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-10 text-sm break-inside-avoid">
           <div className="bg-white p-4 border-2 border-slate-200 rounded-lg shadow-sm">
              <p className="text-slate-500 font-black mb-3 uppercase text-xs tracking-wider border-b border-slate-100 pb-2">عناية المورد (Supplier Details)</p>
              <p className="mb-2"><span className="font-bold w-28 inline-block text-slate-600">السادة / شركة:</span> <span className="font-black text-lg text-slate-900">{order.supplier?.name}</span></p>
              <p className="mb-2"><span className="font-bold w-28 inline-block text-slate-600">الرقم الضريبي:</span> <span className="font-mono font-bold text-slate-900">{order.supplier?.taxNumber || '-'}</span></p>
              <p className="mb-2"><span className="font-bold w-28 inline-block text-slate-600">رقم التواصل:</span> <span className="font-mono font-bold text-slate-900">{order.supplier?.phone || '-'}</span></p>
           </div>
           
           <div className="bg-white p-4 border-2 border-slate-200 rounded-lg shadow-sm">
              <p className="text-slate-500 font-black mb-3 uppercase text-xs tracking-wider border-b border-slate-100 pb-2">معلومات التوصيل (Delivery Details)</p>
              <p className="mb-2"><span className="font-bold w-28 inline-block text-slate-600">الموقع/المشروع:</span> <span className="font-black text-lg text-slate-900">{order.project?.name || 'مستودع الشركة العام'}</span></p>
              {order.project?.code && <p className="mb-2"><span className="font-bold w-28 inline-block text-slate-600">رمز المشروع:</span> <span className="font-mono font-bold text-slate-900">{order.project.code}</span></p>}
              <p className="mb-2"><span className="font-bold w-28 inline-block text-slate-600">تاريخ التوريد:</span> <span className="font-mono font-bold text-slate-900">{order.expectedDate ? new Date(order.expectedDate).toLocaleDateString('en-GB') : 'ASAP (في أقرب وقت)'}</span></p>
           </div>
        </div>

        <h3 className="font-black text-slate-900 mb-3 px-2 text-lg">قـائمة المـواد المطلوبة (Items List):</h3>
        <table className="w-full text-right text-sm border-collapse mb-10">
          <thead>
            <tr className="bg-slate-200 border-2 border-slate-900 text-slate-900 text-xs font-black uppercase">
              <th className="p-3 border-2 border-slate-900 text-center w-12">م</th>
              <th className="p-3 border-2 border-slate-900">الصنف / الوصف الدقيق</th>
              <th className="p-3 border-2 border-slate-900 text-center w-20">الكمية</th>
              <th className="p-3 border-2 border-slate-900 text-center w-28">السعر الإفرادي</th>
              <th className="p-3 border-2 border-slate-900 text-center w-32">الإجمالي (SAR)</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item: any, i: number) => (
               <tr key={item.id} className="border border-slate-300">
                 <td className="p-2 border border-slate-900 text-center font-bold text-slate-600">{i + 1}</td>
                 <td className="p-2 border border-slate-900 font-bold text-slate-900 text-base">{item.material?.name || 'مادة بدون اسم'}</td>
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
                   <td className="p-4 font-bold bg-slate-50 text-slate-700">المجموع الفرعي (Subtotal):</td>
                   <td className="p-4 font-mono font-black text-left text-slate-900">{Number(order.totalAmount).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                </tr>
                {Number(order.taxAmount) > 0 && (
                  <tr className="border-b border-slate-200">
                     <td className="p-4 font-bold bg-slate-50 text-slate-700">ضريبة القيمة المضافة (VAT 15%):</td>
                     <td className="p-4 font-mono font-black text-left text-slate-900">{Number(order.taxAmount).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  </tr>
                )}
                <tr className="bg-slate-900 text-white">
                   <td className="p-5 font-black uppercase tracking-widest text-lg">الصافي المعتمد (Net Total):</td>
                   <td className="p-5 font-mono font-black text-left text-2xl">SAR {Number(order.netAmount).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-16 pt-8 break-inside-avoid border-t-2 border-slate-100 text-black">
          <h3 className="font-black text-lg mb-10 border-b-2 border-slate-800 pb-2 w-max text-slate-800 uppercase tracking-widest">الاعتمادات والموافقات (Approvals):</h3>
          <div className="grid grid-cols-3 gap-8 text-center text-sm">
            <div>
              <p className="font-bold text-slate-800 mb-16 uppercase tracking-widest text-xs">مُعِد الطلب / المشتريات (Procurement)</p>
              <p className="text-slate-400">.......................................</p>
            </div>
            <div>
              <p className="font-bold text-slate-800 mb-16 uppercase tracking-widest text-xs">المدير المالي (Finance Manager)</p>
              <p className="text-slate-400">.......................................</p>
            </div>
            <div>
               <p className="font-bold text-slate-800 mb-16 uppercase tracking-widest text-xs">الاعتماد النهائي (General Manager)</p>
               <p className="text-slate-400">.......................................</p>
            </div>
          </div>
        </div>
        
        {/* Print Footer */}
        <div className="fixed bottom-0 left-0 w-full text-center text-[10px] text-slate-400 font-medium py-4 border-t border-slate-200 bg-white">
          <p>This is a computer generated document. No signature is required if sent electronically.</p>
          <p className="mt-1">© {new Date().getFullYear()} PMS Contracting. All rights reserved.</p>
        </div>
      </div>
    </>
  );
}
