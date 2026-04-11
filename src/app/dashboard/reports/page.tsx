"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { 
  Printer, 
  Filter, 
  Calendar, 
  Building, 
  PieChart, 
  Briefcase, 
  ShoppingCart,
  Download,
  Loader2,
  TrendingUp,
  Wallet
} from "lucide-react";

export default function ReportsPage() {
  const [reportType, setReportType] = useState('FINANCIAL_SUMMARY');
  const [projectId, setProjectId] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  
  const [projects, setProjects] = useState<any[]>([]);
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchProjects();
    fetchReport();
  }, []);

  useEffect(() => {
    fetchReport();
  }, [reportType, projectId, dateRange]);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:4000/v1/projects", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      let url = `http://localhost:4000/v1/reports?reportType=${reportType}&projectId=${projectId}`;
      if (dateRange.start) url += `&startDate=${dateRange.start}`;
      if (dateRange.end) url += `&endDate=${dateRange.end}`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReportData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 w-full animate-in fade-in zoom-in-95 duration-500 max-w-[1500px] mx-auto pb-12 print:bg-white print:text-black">
      {/* Hidden print styles injected */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          #printable-report, #printable-report * { visibility: visible; }
          #printable-report { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 20px; color: black !important; }
          .print-hide { display: none !important; }
          .print-border { border: 1px solid #ddd !important; }
          .print-text-black { color: #000 !important; }
        }
      `}} />

      {/* Header & Controls (Hidden in Print) */}
      <div className="print-hide flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/60 p-6 rounded-3xl border border-white/5 shadow-2xl">
        <div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 flex items-center gap-3">
            <PieChart size={32} className="text-blue-500" /> مركز التقارير المتقدمة
          </h1>
          <p className="text-slate-400 mt-2 text-sm">استخراج، طباعة ومراقبة أداء المشاريع بأعلى معايير الدقة.</p>
        </div>

        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all"
        >
          <Printer size={18} /> طباعة التقرير
        </button>
      </div>

      {/* Filters Base (Hidden in Print) */}
      <div className="print-hide grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/40 p-4 rounded-2xl border border-white/5 space-y-2">
           <label className="text-slate-400 text-xs font-bold flex items-center gap-2"><Filter size={14}/> نوع التقرير</label>
           <div className="flex flex-col gap-2">
             <button onClick={() => setReportType('FINANCIAL_SUMMARY')} className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${reportType === 'FINANCIAL_SUMMARY' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-slate-800 text-slate-400 border border-white/5 hover:bg-slate-700'}`}>
               <TrendingUp size={16}/> الكفاءة المالية
             </button>
             <button onClick={() => setReportType('BOQ_PROGRESS')} className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${reportType === 'BOQ_PROGRESS' ? 'bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30' : 'bg-slate-800 text-slate-400 border border-white/5 hover:bg-slate-700'}`}>
               <Filter size={16}/> حصر وإنجاز الكميات (BOQ)
             </button>
             <button onClick={() => setReportType('PURCHASES')} className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${reportType === 'PURCHASES' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400 border border-white/5 hover:bg-slate-700'}`}>
               <ShoppingCart size={16}/> المشتريات والتكاليف
             </button>
             <button onClick={() => setReportType('SUBCONTRACTORS')} className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${reportType === 'SUBCONTRACTORS' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-400 border border-white/5 hover:bg-slate-700'}`}>
               <Briefcase size={16}/> حالة مقاولي الباطن
             </button>
           </div>
        </div>

        <div className="md:col-span-3 bg-slate-900/40 p-5 rounded-2xl border border-white/5 grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="space-y-3">
              <label className="text-slate-400 text-xs font-bold flex items-center gap-2"><Building size={14}/> فلترة بالمشروع</label>
              <select 
                value={projectId} 
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none"
              >
                <option value="all">جميع المشاريع التابعة للشركة</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
           </div>
           
           <div className="space-y-3">
              <label className="text-slate-400 text-xs font-bold flex items-center gap-2"><Calendar size={14}/> من تاريخ</label>
              <input 
                type="date" 
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-300 focus:border-blue-500 outline-none"
              />
           </div>

           <div className="space-y-3">
              <label className="text-slate-400 text-xs font-bold flex items-center gap-2"><Calendar size={14}/> إلى تاريخ</label>
              <input 
                type="date" 
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-300 focus:border-blue-500 outline-none"
              />
           </div>
        </div>
      </div>

      {/* PRINTABLE AREA */}
      <div id="printable-report" className="bg-slate-900/40 print:bg-white rounded-3xl border border-white/5 print:border-none p-8 min-h-[500px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 opacity-50">
            <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
            <p className="text-slate-400 print-hide">جاري تحليل وبناء التقرير...</p>
          </div>
        ) : reportData ? (
          <>
            <div className="mb-8 border-b border-white/10 print:border-black/20 pb-6 text-center print:text-right">
               <h2 className="text-2xl font-black text-white print-text-black uppercase">
                 {reportType === 'FINANCIAL_SUMMARY' ? 'تقرير الكفاءة المالية الموحد' : 
                  reportType === 'PURCHASES' ? 'تقرير المشتريات وتحليل الموردين' : 
                  reportType === 'BOQ_PROGRESS' ? 'تقرير حصر وإنجاز الكميات (BOQ التفصيلي)' :
                  'تقرير مستخلصات مقاولي الباطن'}
               </h2>
               <p className="text-slate-400 print:text-slate-600 mt-2">
                 تاريخ الإصدار: {new Date().toLocaleDateString('ar-SA')} | 
                 المشروع: {projectId === 'all' ? 'كافة المشاريع' : projects.find(p=>p.id === projectId)?.name}
               </p>
            </div>

            {/* Smart Summary Widgets */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
               {reportType === 'FINANCIAL_SUMMARY' && (
                 <>
                   <div className="p-4 bg-slate-800/50 print-border rounded-xl">
                     <p className="text-xs text-slate-400 print:text-black mb-1">إجمالي الإيرادات (الملاك)</p>
                     <p className="text-xl font-bold text-emerald-400 print-text-black">SAR {Number(reportData.summary?.totalRevenue || 0).toLocaleString()}</p>
                   </div>
                   <div className="p-4 bg-slate-800/50 print-border rounded-xl">
                     <p className="text-xs text-slate-400 print:text-black mb-1">إجمالي التكاليف والصرف</p>
                     <p className="text-xl font-bold text-rose-400 print-text-black">SAR {Number(reportData.summary?.totalCosts || 0).toLocaleString()}</p>
                   </div>
                   <div className="p-4 bg-slate-800/50 print-border rounded-xl">
                     <p className="text-xs text-slate-400 print:text-black mb-1">صافي الربح التقديري</p>
                     <p className="text-xl font-bold text-indigo-400 print-text-black">SAR {Number(reportData.summary?.profit || 0).toLocaleString()}</p>
                   </div>
                   <div className="p-4 bg-slate-800/50 print-border rounded-xl">
                     <p className="text-xs text-slate-400 print:text-black mb-1">هامش الربح</p>
                     <p className="text-xl font-bold text-white print-text-black">{Number(reportData.summary?.margin || 0).toFixed(1)}%</p>
                   </div>
                 </>
               )}
               {reportType === 'PURCHASES' && (
                 <>
                   <div className="p-4 bg-slate-800/50 print-border rounded-xl">
                     <p className="text-xs text-slate-400 print:text-black mb-1">إجمالي أوامر الشراء المنفذة</p>
                     <p className="text-xl font-bold text-blue-400 print-text-black">{reportData.summary?.totalOrders || 0} أمر شراء</p>
                   </div>
                   <div className="p-4 bg-slate-800/50 print-border rounded-xl">
                     <p className="text-xs text-slate-400 print:text-black mb-1">حجم الصرف الإجمالي</p>
                     <p className="text-xl font-bold text-rose-400 print-text-black">SAR {Number(reportData.summary?.totalSpent || 0).toLocaleString()}</p>
                   </div>
                 </>
               )}
               {reportType === 'SUBCONTRACTORS' && (
                 <>
                   <div className="p-4 bg-slate-800/50 print-border rounded-xl">
                     <p className="text-xs text-slate-400 print:text-black mb-1">إجمالي المستحقات (معتمدة)</p>
                     <p className="text-xl font-bold text-amber-400 print-text-black">SAR {Number(reportData.summary?.totalDue || 0).toLocaleString()}</p>
                   </div>
                   <div className="p-4 bg-slate-800/50 print-border rounded-xl">
                     <p className="text-xs text-slate-400 print:text-black mb-1">المدفوع والمسدد (من المالية)</p>
                     <p className="text-xl font-bold text-emerald-400 print-text-black">SAR {Number(reportData.summary?.totalPaid || 0).toLocaleString()}</p>
                   </div>
                   <div className="p-4 bg-slate-800/50 print-border rounded-xl">
                     <p className="text-xs text-slate-400 print:text-black mb-1">الجاري الصرف / المتأخرات</p>
                     <p className="text-xl font-bold text-rose-400 print-text-black">SAR {Number(reportData.summary?.remaining || 0).toLocaleString()}</p>
                   </div>
                 </>
               )}
               {reportType === 'BOQ_PROGRESS' && (
                 <>
                   <div className="p-4 bg-slate-800/50 print-border rounded-xl">
                     <p className="text-xs text-slate-400 print:text-black mb-1">إجمالي قيمة المشروع (المخطط)</p>
                     <p className="text-xl font-bold text-blue-400 print-text-black">SAR {Number(reportData.summary?.totalPlannedValue || 0).toLocaleString()}</p>
                   </div>
                   <div className="p-4 bg-slate-800/50 print-border rounded-xl">
                     <p className="text-xs text-slate-400 print:text-black mb-1">قيمة المنفذ الفعلي</p>
                     <p className="text-xl font-bold text-emerald-400 print-text-black">SAR {Number(reportData.summary?.totalExecutedValue || 0).toLocaleString()}</p>
                   </div>
                   <div className="p-4 bg-slate-800/50 print-border rounded-xl">
                     <p className="text-xs text-slate-400 print:text-black mb-1">القيمة المتبقية كمياً</p>
                     <p className="text-xl font-bold text-amber-400 print-text-black">SAR {Number(reportData.summary?.remainingValue || 0).toLocaleString()}</p>
                   </div>
                   <div className="p-4 bg-slate-800/50 print-border rounded-xl">
                     <p className="text-xs text-slate-400 print:text-black mb-1">نسبة الإنجاز الإجمالية للمشروع</p>
                     <p className="text-xl font-bold text-white print-text-black">{reportData.summary?.overallProgress || 0}%</p>
                   </div>
                 </>
               )}
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto print:overflow-visible">
              <table className="w-full text-right text-sm print:text-xs">
                <thead className="bg-slate-900/80 print:bg-slate-100 text-slate-400 print:text-black border-b border-white/10 print:border-black/20">
                  <tr>
                    {reportType === 'BOQ_PROGRESS' ? (
                      <>
                        <th className="px-4 py-3 font-bold">بند الأعمال / الكود</th>
                        <th className="px-4 py-3 font-bold">المشروع</th>
                        <th className="px-4 py-3 font-bold text-center">الكمية المقدرة</th>
                        <th className="px-4 py-3 font-bold text-center">المنفذ الفعلي</th>
                        <th className="px-4 py-3 font-bold text-center">المتبقي</th>
                        <th className="px-4 py-3 font-bold">القيمة الحالية (SAR)</th>
                        <th className="px-4 py-3 font-bold">نسبة إنجاز البند</th>
                      </>
                    ) : (
                      <>
                        <th className="px-4 py-3 font-bold">التاريخ</th>
                        <th className="px-4 py-3 font-bold">المشروع</th>
                        {reportType === 'FINANCIAL_SUMMARY' && (
                          <>
                            <th className="px-4 py-3 font-bold">نوع العملية</th>
                            <th className="px-4 py-3 font-bold text-left">التدفق (SAR)</th>
                          </>
                        )}
                        {reportType === 'PURCHASES' && (
                          <>
                            <th className="px-4 py-3 font-bold">المورد</th>
                            <th className="px-4 py-3 font-bold">الضريبة</th>
                            <th className="px-4 py-3 font-bold text-left">التكلفة (SAR)</th>
                          </>
                        )}
                        {reportType === 'SUBCONTRACTORS' && (
                          <>
                            <th className="px-4 py-3 font-bold">مقاول الباطن</th>
                            <th className="px-4 py-3 font-bold">الحالة المالية</th>
                            <th className="px-4 py-3 font-bold text-left">المستحق (SAR)</th>
                          </>
                        )}
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 print:divide-black/10 text-slate-300 print-text-black">
                  {reportData.data?.length > 0 ? reportData.data.map((row: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-800/30 print:hover:bg-transparent">
                      {reportType === 'BOQ_PROGRESS' ? (
                        <>
                          <td className="px-4 py-3">
                             <div className="font-bold text-white print-text-black truncate max-w-[200px]" title={row.description}>{row.description}</div>
                             <div className="text-xs text-slate-500 font-mono">{row.itemCode}</div>
                          </td>
                          <td className="px-4 py-3 font-bold text-xs">{row.project}</td>
                          <td className="px-4 py-3 font-mono text-center">{row.plannedQty}</td>
                          <td className="px-4 py-3 font-mono text-center font-bold text-emerald-400 print-text-black">{row.executedQty}</td>
                          <td className="px-4 py-3 font-mono text-center text-rose-400 print-text-black">{row.remainingQty}</td>
                          <td className="px-4 py-3 font-mono font-bold text-white print-text-black">{Number(row.executedValue).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                          <td className="px-4 py-3 font-mono text-xs">
                             <div className="flex items-center gap-2">
                               <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden print-hide">
                                 <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(Number(row.completionPercentage), 100)}%` }} />
                               </div>
                               <span className={Number(row.completionPercentage) >= 100 ? 'text-emerald-400' : ''}>{row.completionPercentage}%</span>
                             </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-3 font-mono">{new Date(row.date).toLocaleDateString('ar-SA')}</td>
                          <td className="px-4 py-3 font-bold">{row.project || '-'}</td>
                          
                          {reportType === 'FINANCIAL_SUMMARY' && (
                            <>
                              <td className="px-4 py-3">{row.type}</td>
                              <td className={`px-4 py-3 font-mono font-bold text-left ${row.amount > 0 ? 'text-emerald-400 print-text-black' : 'text-rose-400 print-text-black'}`}>
                                {row.amount > 0 ? '+' : ''}{Number(row.amount).toLocaleString()}
                              </td>
                            </>
                          )}
                          
                          {reportType === 'PURCHASES' && (
                            <>
                              <td className="px-4 py-3">{row.supplier}</td>
                              <td className="px-4 py-3 font-mono text-slate-400">{Number(row.taxAmount).toLocaleString()}</td>
                              <td className="px-4 py-3 font-mono font-bold text-rose-400 print-text-black text-left">{Number(row.total).toLocaleString()}</td>
                            </>
                          )}

                          {reportType === 'SUBCONTRACTORS' && (
                            <>
                              <td className="px-4 py-3">{row.subcontractor}</td>
                              <td className="px-4 py-3 text-xs font-bold">
                                <span className={row.paymentStatus === 'PAID' ? 'text-emerald-400 print-text-black' : row.paymentStatus === 'PARTIAL' ? 'text-amber-400 print-text-black' : 'text-rose-400 print-text-black'}>
                                  {row.paymentStatus === 'PAID' ? 'مسدد' : row.paymentStatus === 'PARTIAL' ? 'جزئي' : 'قيد الانتظار'}
                                </span>
                              </td>
                              <td className="px-4 py-3 font-mono font-bold text-white print-text-black text-left">{Number(row.netAmount).toLocaleString()}</td>
                            </>
                          )}
                        </>
                      )}
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-slate-500 print:text-black">لا توجد بيانات مطابقة لهذه الفلاتر</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="mt-12 pt-8 border-t border-dashed border-white/20 print:border-black/20 flex justify-between items-center print-text-black">
              <p className="text-xs text-slate-500 print-text-black">تم إصدار هذا التقرير من نظام PMS الآلي</p>
              <div className="flex gap-12 text-sm font-bold text-slate-400 print-text-black">
                <span>توقيع المراجعة: _________________</span>
                <span>الاعتماد: _________________</span>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
