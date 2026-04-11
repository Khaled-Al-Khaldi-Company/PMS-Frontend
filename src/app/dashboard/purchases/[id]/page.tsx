"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2, ArrowRight, Printer, CheckCircle2, Clock, Package } from "lucide-react";
import axios from "axios";

export default function ViewPurchaseOrderPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (orderId) fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:4000/v1/purchases/${orderId}`, {
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

  const handlePrint = () => {
    window.print();
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
          <button onClick={handlePrint} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] transition animate-pulse hover:-translate-y-1">
            <Printer size={18} /> معاينة وطباعة رسمية
          </button>
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
      <div className="hidden print:block print:!bg-white print:!text-black min-h-screen pt-32 pb-10 px-10 font-sans" dir="rtl">
        <div className="border-b-2 border-slate-900 pb-6 mb-8 flex justify-between items-end">
           <div>
             <h1 className="text-4xl font-black text-slate-900 mb-1">أمــر شــراء مواد</h1>
             <p className="text-lg font-bold text-slate-500 tracking-widest uppercase">Purchase Order (PO)</p>
           </div>
           <div className="text-left font-bold text-sm text-slate-600">
             <p className="text-2xl font-black text-indigo-700 mb-2">PMS Contracting Est.</p>
             <p>PO No: <span className="font-mono text-slate-900">#{order.poNumber}</span></p>
             <p>Issue Date: <span className="font-mono text-slate-900">{new Date(order.issueDate).toLocaleDateString('en-GB')}</span></p>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-10 text-sm break-inside-avoid">
           <div className="border-2 border-slate-800 rounded-xl p-5 bg-slate-50">
              <p className="text-slate-500 font-black mb-3 uppercase text-xs border-b-2 border-slate-200 pb-2">بيانات المورد (Supplier Details)</p>
              <p className="mb-2"><span className="font-bold w-24 inline-block text-slate-600">السادة / شركة:</span> <span className="font-black text-lg text-slate-900">{order.supplier?.name}</span></p>
              <p className="mb-2"><span className="font-bold w-24 inline-block text-slate-600">الرقم الضريبي:</span> <span className="font-mono font-bold text-slate-900">{order.supplier?.taxNumber || '-'}</span></p>
              <p className="mb-2"><span className="font-bold w-24 inline-block text-slate-600">الهاتف:</span> <span className="font-mono font-bold text-slate-900">{order.supplier?.phone || '-'}</span></p>
           </div>
           
           <div className="border-2 border-slate-800 rounded-xl p-5 bg-slate-50">
              <p className="text-slate-500 font-black mb-3 uppercase text-xs border-b-2 border-slate-200 pb-2">معلومات الإرسالية (Delivery Details)</p>
              <p className="mb-2"><span className="font-bold w-24 inline-block text-slate-600">المشروع:</span> <span className="font-black text-lg text-slate-900">{order.project?.name || 'مستودع الشركة العام'}</span></p>
              {order.project?.code && <p className="mb-2"><span className="font-bold w-24 inline-block text-slate-600">كود المشروع:</span> <span className="font-mono font-bold text-slate-900">{order.project.code}</span></p>}
              <p className="mb-2"><span className="font-bold w-24 inline-block text-slate-600">تاريخ التوريد:</span> <span className="font-mono font-bold text-slate-900">{order.expectedDate ? new Date(order.expectedDate).toLocaleDateString('en-GB') : 'ASAP (في أقرب وقت)'}</span></p>
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
          <div className="w-1/2 border-2 border-slate-900 rounded-lg overflow-hidden">
            <table className="w-full text-right border-collapse text-sm">
              <tbody>
                <tr className="border-b border-slate-400">
                   <td className="p-3 font-bold bg-slate-50 text-slate-600">المجموع الفرعي:</td>
                   <td className="p-3 font-mono font-black text-left text-slate-900">{Number(order.totalAmount).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                </tr>
                {Number(order.taxAmount) > 0 && (
                  <tr className="border-b border-slate-400">
                     <td className="p-3 font-bold bg-slate-50 text-slate-600">ضريبة القيمة المضافة (15%):</td>
                     <td className="p-3 font-mono font-black text-left text-slate-900">{Number(order.taxAmount).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  </tr>
                )}
                <tr className="bg-slate-200">
                   <td className="p-4 font-black text-slate-900 text-lg">الصافي المعتمد:</td>
                   <td className="p-4 font-mono font-black text-left text-lg text-slate-900">SAR {Number(order.netAmount).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8 text-center font-bold text-sm text-slate-700 px-6 pt-16 break-inside-avoid mt-20">
          <div>
            <p className="mb-10 text-slate-900">مسؤول المشتريات / المُعِد</p>
            <p className="border-t-2 border-slate-300 pt-2 text-slate-500 uppercase text-xs mx-4">الاسم والتوقيع</p>
          </div>
          <div>
            <p className="mb-10 text-slate-900">المدير المالي (Finance)</p>
            <p className="border-t-2 border-slate-300 pt-2 text-slate-500 uppercase text-xs mx-4">التوقيع / الختم</p>
          </div>
          <div>
            <p className="mb-10 text-slate-900">اعتماد الإدارة العليا (Approval)</p>
            <p className="border-t-2 border-slate-300 pt-2 text-slate-500 uppercase text-xs mx-4">الاعتماد النهائي</p>
          </div>
        </div>
        
        {/* Footer info absolute to page bottom */}
        <div className="fixed bottom-0 left-0 w-full text-center text-[10px] text-slate-400 pb-4 hidden print:block pointer-events-none">
          Document generated by PMS Contracting ERP System - Date: {new Date().toLocaleDateString('en-GB')}
        </div>
      </div>
    </>
  );
}
