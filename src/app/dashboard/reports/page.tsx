"use client";

import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/lib/api";
import axios from "axios";
import { 
  Printer, 
  Filter, 
  Calendar, 
  Building, 
  PieChart, 
  Briefcase, 
  ShoppingCart,
  Loader2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CheckCircle2,
  Users,
  FileText,
  Layers,
  ChevronDown,
  ChevronUp,
  Award,
  Wallet,
  Activity,
  FileSpreadsheet
} from "lucide-react";

export default function ReportsPage() {
  const [reportType, setReportType] = useState('FINANCIAL_SUMMARY');
  const [projectId, setProjectId] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  
  const [projects, setProjects] = useState<any[]>([]);
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedInvoiceId, setExpandedInvoiceId] = useState<string | null>(null);

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
      const res = await axios.get(`${API_BASE_URL}/v1/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchReport = async () => {
    setIsLoading(true);
    setExpandedInvoiceId(null);
    try {
      const token = localStorage.getItem("token");
      let url = `${API_BASE_URL}/v1/reports?reportType=${reportType}&projectId=${projectId}`;
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

  const toggleInvoiceDetails = (id: string) => {
    if (expandedInvoiceId === id) {
      setExpandedInvoiceId(null);
    } else {
      setExpandedInvoiceId(id);
    }
  };

  return (
    <div className="space-y-6 w-full animate-in fade-in zoom-in-95 duration-500 max-w-[1600px] mx-auto pb-12 print:bg-white print:text-black">
      {/* Hidden print styles injected */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          #printable-report, #printable-report * { visibility: visible; }
          #printable-report { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 15px; color: black !important; }
          .print-hide { display: none !important; }
          .print-border { border: 1px solid #000 !important; }
          .print-bg-gray { background-color: #f3f4f6 !important; }
          .print-text-black { color: #000 !important; }
          table { width: 100% !important; border-collapse: collapse !important; }
          th, td { border: 1px solid #ddd !important; padding: 8px !important; }
          th { background-color: #f3f4f6 !important; color: black !important; }
        }
      `}} />

      {/* Header & Controls (Hidden in Print) */}
      <div className="print-hide flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/60 p-6 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 flex items-center gap-3">
            <PieChart size={32} className="text-blue-500" /> مركز التقارير الشامل والموحد
          </h1>
          <p className="text-slate-400 mt-2 text-sm">شاشة ذكية لاستخراج، تحليل وطباعة التقارير المالية والتعاقدية ومحاضر الإنجاز.</p>
        </div>

        <button 
          onClick={handlePrint}
          className="relative z-10 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all"
        >
          <Printer size={18} /> طباعة التقرير / تصدير PDF
        </button>
      </div>

      {/* Interactive Filters Panel (Hidden in Print) */}
      <div className="print-hide grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Tabs */}
        <div className="bg-slate-900/40 p-5 rounded-2xl border border-white/5 space-y-4 max-h-[80vh] overflow-y-auto">
           <label className="text-slate-400 text-xs font-bold flex items-center gap-2 mb-1"><Filter size={14}/> تصفية حسب نوع التقرير</label>
           
           {/* Group 1: General Reports */}
           <div className="space-y-1.5">
             <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold px-2 mb-1">التقارير العامة</div>
             <button onClick={() => setReportType('FINANCIAL_SUMMARY')} className={`w-full px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold flex items-center justify-between transition-all ${reportType === 'FINANCIAL_SUMMARY' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-black' : 'bg-slate-800/50 text-slate-400 border border-white/5 hover:bg-slate-800'}`}>
               <span className="flex items-center gap-2"><DollarSign size={16}/> الأرباح والخسائر (P&L)</span>
               <TrendingUp size={14} className="opacity-60"/>
             </button>
             <button onClick={() => setReportType('BOQ_PROGRESS')} className={`w-full px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold flex items-center justify-between transition-all ${reportType === 'BOQ_PROGRESS' ? 'bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30 font-black' : 'bg-slate-800/50 text-slate-400 border border-white/5 hover:bg-slate-800'}`}>
               <span className="flex items-center gap-2"><Layers size={16}/> كميات BOQ والمنجز</span>
               <Activity size={14} className="opacity-60"/>
             </button>
           </div>

           {/* Group 2: Client Reports */}
           <div className="space-y-1.5 pt-2 border-t border-white/5">
             <div className="text-[10px] uppercase tracking-wider text-blue-400 font-bold px-2 mb-1">تقارير العملاء</div>
             <button onClick={() => setReportType('CLIENT_CONTRACTS')} className={`w-full px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold flex items-center justify-between transition-all ${reportType === 'CLIENT_CONTRACTS' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 font-black' : 'bg-slate-800/50 text-slate-400 border border-white/5 hover:bg-slate-800'}`}>
               <span className="flex items-center gap-2"><Briefcase size={16}/> عقود الملاك (العملاء)</span>
               <Award size={14} className="opacity-60"/>
             </button>
             <button onClick={() => setReportType('CLIENT_ACHIEVEMENT_RECORDS')} className={`w-full px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold flex items-center justify-between transition-all ${reportType === 'CLIENT_ACHIEVEMENT_RECORDS' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black' : 'bg-slate-800/50 text-slate-400 border border-white/5 hover:bg-slate-800'}`}>
               <span className="flex items-center gap-2"><FileText size={16}/> محاضر إنجاز الملاك</span>
               <CheckCircle2 size={14} className="opacity-60"/>
             </button>
             <button onClick={() => setReportType('CLIENT_CONTACTS')} className={`w-full px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold flex items-center justify-between transition-all ${reportType === 'CLIENT_CONTACTS' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 font-black' : 'bg-slate-800/50 text-slate-400 border border-white/5 hover:bg-slate-800'}`}>
               <span className="flex items-center gap-2"><Users size={16}/> حركة العملاء المالية</span>
               <Users size={14} className="opacity-60"/>
             </button>
           </div>

           {/* Group 3: Supplier Reports */}
           <div className="space-y-1.5 pt-2 border-t border-white/5">
             <div className="text-[10px] uppercase tracking-wider text-rose-400 font-bold px-2 mb-1">تقارير الموردين</div>
             <button onClick={() => setReportType('SUBCONTRACTOR_CONTRACTS')} className={`w-full px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold flex items-center justify-between transition-all ${reportType === 'SUBCONTRACTOR_CONTRACTS' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 font-black' : 'bg-slate-800/50 text-slate-400 border border-white/5 hover:bg-slate-800'}`}>
               <span className="flex items-center gap-2"><Briefcase size={16}/> عقود مقاولي الباطن</span>
               <Award size={14} className="opacity-60"/>
             </button>
             <button onClick={() => setReportType('SUBCONTRACTOR_ACHIEVEMENT_RECORDS')} className={`w-full px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold flex items-center justify-between transition-all ${reportType === 'SUBCONTRACTOR_ACHIEVEMENT_RECORDS' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black' : 'bg-slate-800/50 text-slate-400 border border-white/5 hover:bg-slate-800'}`}>
               <span className="flex items-center gap-2"><FileText size={16}/> محاضر إنجاز المقاولين</span>
               <CheckCircle2 size={14} className="opacity-60"/>
             </button>
             <button onClick={() => setReportType('SUPPLIER_CONTACTS')} className={`w-full px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold flex items-center justify-between transition-all ${reportType === 'SUPPLIER_CONTACTS' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 font-black' : 'bg-slate-800/50 text-slate-400 border border-white/5 hover:bg-slate-800'}`}>
               <span className="flex items-center gap-2"><Users size={16}/> حركة الموردين المالية</span>
               <Users size={14} className="opacity-60"/>
             </button>
             <button onClick={() => setReportType('PURCHASES')} className={`w-full px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold flex items-center justify-between transition-all ${reportType === 'PURCHASES' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 font-black' : 'bg-slate-800/50 text-slate-400 border border-white/5 hover:bg-slate-800'}`}>
               <span className="flex items-center gap-2"><ShoppingCart size={16}/> المشتريات والتكاليف</span>
               <ShoppingCart size={14} className="opacity-60"/>
             </button>
           </div>
        </div>

        {/* Filters Details */}
        <div className="lg:col-span-3 bg-slate-900/40 p-6 rounded-2xl border border-white/5 grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="space-y-2">
              <label className="text-slate-400 text-xs font-bold flex items-center gap-2"><Building size={14}/> فرز حسب المشروع</label>
              <select 
                value={projectId} 
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none"
              >
                <option value="all">جميع المشاريع</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
           </div>
           
           <div className="space-y-2">
              <label className="text-slate-400 text-xs font-bold flex items-center gap-2"><Calendar size={14}/> تاريخ البداية</label>
              <input 
                type="date" 
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-300 focus:border-blue-500 outline-none"
              />
           </div>

           <div className="space-y-2">
              <label className="text-slate-400 text-xs font-bold flex items-center gap-2"><Calendar size={14}/> تاريخ النهاية</label>
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
      <div id="printable-report" className="bg-[#0f1015]/60 backdrop-blur-xl print:bg-white rounded-3xl border border-white/5 print:border-none p-8 min-h-[500px] shadow-2xl relative">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 opacity-50">
            <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
            <p className="text-slate-400 print-hide">جاري استدعاء البيانات وتحليل المعطيات...</p>
          </div>
        ) : reportData ? (
          <>
            {/* Header of Report Document */}
            <div className="mb-8 border-b border-white/10 print:border-black/20 pb-6 text-center print:text-right flex flex-col md:flex-row justify-between items-center gap-4">
               <div className="text-right">
                 <h2 className="text-2xl font-black text-white print-text-black uppercase">
                   {reportType === 'FINANCIAL_SUMMARY' ? 'تقرير الأرباح والخسائر للمشاريع (P&L)' : 
                    reportType === 'CONTRACTS' ? 'تقرير عقود المشاريع ومقاولي الباطن' :
                    reportType === 'CLIENT_CONTRACTS' ? 'تقرير عقود الملاك (العملاء)' :
                    reportType === 'SUBCONTRACTOR_CONTRACTS' ? 'تقرير عقود مقاولي الباطن' :
                    reportType === 'BOQ_PROGRESS' ? 'تقرير حصر كميات وبنود تعاقد BOQ المنجزة' :
                    reportType === 'ACHIEVEMENT_RECORDS' ? 'سجل محاضر الإنجاز المعتمدة والمستخلصات' :
                    reportType === 'CLIENT_ACHIEVEMENT_RECORDS' ? 'سجل محاضر إنجاز الملاك (العملاء)' :
                    reportType === 'SUBCONTRACTOR_ACHIEVEMENT_RECORDS' ? 'سجل محاضر إنجاز مقاولي الباطن' :
                    reportType === 'CONTACTS' ? 'تقرير حركة جهات الاتصال (العملاء والموردين) المالي' :
                    reportType === 'CLIENT_CONTACTS' ? 'تقرير حركة جهات الاتصال (العملاء) المالي' :
                    reportType === 'SUPPLIER_CONTACTS' ? 'تقرير حركة جهات الاتصال (الموردين) المالي' :
                    reportType === 'PURCHASES' ? 'تقرير المشتريات والتكاليف العامة' :
                    'تقرير المشتريات والتكاليف العامة'}
                 </h2>
                 <p className="text-slate-400 print:text-slate-600 mt-2 text-sm">
                   المشروع المحدد: <span className="font-bold text-white print-text-black">{projectId === 'all' ? 'كافة المشاريع النشطة' : projects.find(p=>p.id === projectId)?.name}</span>
                 </p>
                 {(dateRange.start || dateRange.end) && (
                   <p className="text-xs text-indigo-400 print:text-black mt-1">
                     الفترة الزمنية: {dateRange.start ? `من ${dateRange.start}` : ''} {dateRange.end ? `إلى ${dateRange.end}` : ''}
                   </p>
                 )}
               </div>
               <div className="text-center md:text-left text-xs text-slate-500 print-text-black">
                 <p>تاريخ استخراج التقرير</p>
                 <p className="font-mono text-sm text-slate-300 print-text-black mt-1">{new Date().toLocaleString('ar-SA')}</p>
               </div>
            </div>

            {/* Smart Summary Cards based on Report Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
               {reportType === 'FINANCIAL_SUMMARY' && (
                 <>
                   <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-800/80 rounded-2xl border border-white/5 print-border print:bg-white">
                     <p className="text-xs text-slate-400 print:text-black mb-1">إجمالي الإيرادات (المستخلصات المعتمدة)</p>
                     <p className="text-2xl font-black text-emerald-400 print-text-black">SAR {Number(reportData.summary?.totalRevenue || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                   </div>
                   <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-800/80 rounded-2xl border border-white/5 print-border print:bg-white">
                     <p className="text-xs text-slate-400 print:text-black mb-1">إجمالي التكاليف (مقاولين + شراء + نثريات)</p>
                     <p className="text-2xl font-black text-rose-400 print-text-black">SAR {Number(reportData.summary?.totalCosts || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                   </div>
                   <div className={`p-5 bg-gradient-to-br rounded-2xl border border-white/5 print-border print:bg-white ${reportData.summary?.profit >= 0 ? 'from-emerald-950/20 to-slate-900' : 'from-rose-950/20 to-slate-900'}`}>
                     <p className="text-xs text-slate-400 print:text-black mb-1">صافي الربح / الخسارة</p>
                     <p className={`text-2xl font-black ${reportData.summary?.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'} print-text-black`}>SAR {Number(reportData.summary?.profit || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                   </div>
                   <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-800/80 rounded-2xl border border-white/5 print-border print:bg-white">
                     <p className="text-xs text-slate-400 print:text-black mb-1">هامش الربح الإجمالي</p>
                     <p className="text-2xl font-black text-indigo-400 print-text-black">{Number(reportData.summary?.margin || 0).toFixed(2)}%</p>
                   </div>
                 </>
               )}

               {reportType === 'CLIENT_CONTRACTS' && (
                 <>
                   <div className="p-5 bg-slate-900/60 rounded-2xl border border-white/5 print-border print:bg-white">
                     <p className="text-xs text-slate-400 print:text-black mb-1">إجمالي قيمة عقود الملاك</p>
                     <p className="text-xl font-bold text-blue-400 print-text-black">SAR {Number(reportData.summary?.totalValue || 0).toLocaleString()}</p>
                     <span className="text-[10px] text-slate-500">العدد: {reportData.summary?.totalContracts || 0}</span>
                   </div>
                   <div className="p-5 bg-slate-900/60 rounded-2xl border border-white/5 print-border print:bg-white">
                     <p className="text-xs text-slate-400 print:text-black mb-1">المستخلصات المعتمدة</p>
                     <p className="text-xl font-bold text-emerald-400 print-text-black">SAR {Number(reportData.summary?.totalInvoiced || 0).toLocaleString()}</p>
                   </div>
                   <div className="p-5 bg-slate-900/60 rounded-2xl border border-white/5 print-border print:bg-white">
                     <p className="text-xs text-slate-400 print:text-black mb-1">المحصل فعلياً</p>
                     <p className="text-xl font-bold text-white print-text-black">SAR {Number(reportData.summary?.totalPaid || 0).toLocaleString()}</p>
                   </div>
                   <div className="p-5 bg-slate-900/60 rounded-2xl border border-white/5 print-border print:bg-white">
                     <p className="text-xs text-slate-400 print:text-black mb-1">المتبقي للتحصيل</p>
                     <p className="text-xl font-bold text-rose-400 print-text-black">SAR {Number(reportData.summary?.remaining || 0).toLocaleString()}</p>
                   </div>
                 </>
               )}

               {reportType === 'SUBCONTRACTOR_CONTRACTS' && (
                 <>
                   <div className="p-5 bg-slate-900/60 rounded-2xl border border-white/5 print-border print:bg-white">
                     <p className="text-xs text-slate-400 print:text-black mb-1">إجمالي عقود مقاولي الباطن</p>
                     <p className="text-xl font-bold text-rose-400 print-text-black">SAR {Number(reportData.summary?.totalValue || 0).toLocaleString()}</p>
                     <span className="text-[10px] text-slate-500">العدد: {reportData.summary?.totalContracts || 0}</span>
                   </div>
                   <div className="p-5 bg-slate-900/60 rounded-2xl border border-white/5 print-border print:bg-white">
                     <p className="text-xs text-slate-400 print:text-black mb-1">المستخلصات المعتمدة للمقاولين</p>
                     <p className="text-xl font-bold text-emerald-400 print-text-black">SAR {Number(reportData.summary?.totalInvoiced || 0).toLocaleString()}</p>
                   </div>
                   <div className="p-5 bg-slate-900/60 rounded-2xl border border-white/5 print-border print:bg-white">
                     <p className="text-xs text-slate-400 print:text-black mb-1">المسدد فعلياً للمقاولين</p>
                     <p className="text-xl font-bold text-white print-text-black">SAR {Number(reportData.summary?.totalPaid || 0).toLocaleString()}</p>
                   </div>
                   <div className="p-5 bg-slate-900/60 rounded-2xl border border-white/5 print-border print:bg-white">
                     <p className="text-xs text-slate-400 print:text-black mb-1">المتبقي للدفع للمقاولين</p>
                     <p className="text-xl font-bold text-rose-400 print-text-black">SAR {Number(reportData.summary?.remaining || 0).toLocaleString()}</p>
                   </div>
                 </>
               )}

               {reportType === 'BOQ_PROGRESS' && (
                 <>
                   <div className="p-5 bg-slate-900/60 rounded-2xl border border-white/5 print-border print:bg-white">
                     <p className="text-xs text-slate-400 print:text-black mb-1">القيمة المخططة الإجمالية</p>
                     <p className="text-xl font-bold text-blue-400 print-text-black">SAR {Number(reportData.summary?.totalPlannedValue || 0).toLocaleString()}</p>
                   </div>
                   <div className="p-5 bg-slate-900/60 rounded-2xl border border-white/5 print-border print:bg-white">
                     <p className="text-xs text-slate-400 print:text-black mb-1">قيمة الأعمال المنفذة فعلياً</p>
                     <p className="text-xl font-bold text-emerald-400 print-text-black">SAR {Number(reportData.summary?.totalExecutedValue || 0).toLocaleString()}</p>
                   </div>
                   <div className="p-5 bg-slate-900/60 rounded-2xl border border-white/5 print-border print:bg-white">
                     <p className="text-xs text-slate-400 print:text-black mb-1">القيمة المتبقية كمياً</p>
                     <p className="text-xl font-bold text-amber-400 print-text-black">SAR {Number(reportData.summary?.remainingValue || 0).toLocaleString()}</p>
                   </div>
                   <div className="p-5 bg-slate-900/60 rounded-2xl border border-white/5 print-border print:bg-white">
                     <p className="text-xs text-slate-400 print:text-black mb-1">نسبة الإنجاز الإجمالية للمشروع</p>
                     <p className="text-xl font-bold text-white print-text-black">{reportData.summary?.overallProgress || 0}%</p>
                   </div>
                 </>
               )}

               {(reportType === 'ACHIEVEMENT_RECORDS' || reportType === 'CLIENT_ACHIEVEMENT_RECORDS' || reportType === 'SUBCONTRACTOR_ACHIEVEMENT_RECORDS') && (
                 <>
                   <div className="p-5 bg-slate-900/60 rounded-2xl border border-white/5 print-border print:bg-white">
                     <p className="text-xs text-slate-400 print:text-black mb-1">عدد محاضر الإنجاز المعتمدة</p>
                     <p className="text-xl font-bold text-indigo-400 print-text-black">{reportData.summary?.totalRecords || 0} محضر</p>
                     {reportType === 'ACHIEVEMENT_RECORDS' && (
                       <span className="text-[10px] text-slate-500">ملاك: {reportData.summary?.mainContractsRecordsCount || 0} | مقاولين: {reportData.summary?.subcontractsRecordsCount || 0}</span>
                     )}
                   </div>
                   <div className="p-5 bg-slate-900/60 rounded-2xl border border-white/5 print-border print:bg-white">
                     <p className="text-xs text-slate-400 print:text-black mb-1">القيمة المعتمدة قبل الخصميات</p>
                     <p className="text-xl font-bold text-emerald-400 print-text-black">SAR {Number(reportData.summary?.totalCertifiedGross || 0).toLocaleString()}</p>
                   </div>
                   <div className="p-5 bg-slate-900/60 rounded-2xl border border-white/5 print-border print:bg-white">
                     <p className="text-xs text-slate-400 print:text-black mb-1">صافي المستحقات المعتمدة للجهات</p>
                     <p className="text-xl font-bold text-white print-text-black">SAR {Number(reportData.summary?.totalCertifiedNet || 0).toLocaleString()}</p>
                   </div>
                 </>
               )}

               {(reportType === 'CONTACTS' || reportType === 'CLIENT_CONTACTS' || reportType === 'SUPPLIER_CONTACTS') && (
                 <>
                   <div className="p-5 bg-slate-900/60 rounded-2xl border border-white/5 print-border print:bg-white">
                     <p className="text-xs text-slate-400 print:text-black mb-1">إجمالي عدد جهات الاتصال</p>
                     <p className="text-xl font-bold text-indigo-400 print-text-black">{reportData.summary?.totalContacts || 0} جهة اتصال</p>
                     {reportType === 'CONTACTS' && (
                       <span className="text-[10px] text-slate-500">عملاء: {reportData.summary?.clientsCount || 0} | موردين: {reportData.summary?.suppliersCount || 0}</span>
                     )}
                   </div>
                   {(reportType === 'CONTACTS' || reportType === 'CLIENT_CONTACTS') && (
                     <div className="p-5 bg-slate-900/60 rounded-2xl border border-white/5 print-border print:bg-white">
                       <p className="text-xs text-slate-400 print:text-black mb-1">حجم تعاملات العملاء والمبيعات</p>
                       <p className="text-xl font-bold text-emerald-400 print-text-black">SAR {Number(reportData.summary?.totalClientVolume || 0).toLocaleString()}</p>
                     </div>
                   )}
                   {(reportType === 'CONTACTS' || reportType === 'SUPPLIER_CONTACTS') && (
                     <div className="p-5 bg-slate-900/60 rounded-2xl border border-white/5 print-border print:bg-white">
                       <p className="text-xs text-slate-400 print:text-black mb-1">حجم تعاملات الموردين ومقاولي الباطن</p>
                       <p className="text-xl font-bold text-rose-400 print-text-black">SAR {Number(reportData.summary?.totalSupplierVolume || 0).toLocaleString()}</p>
                     </div>
                   )}
                 </>
               )}

               {reportType === 'PURCHASES' && (
                 <>
                   <div className="p-5 bg-slate-900/60 rounded-2xl border border-white/5 print-border print:bg-white">
                     <p className="text-xs text-slate-400 print:text-black mb-1">عدد أوامر الشراء</p>
                     <p className="text-xl font-bold text-indigo-400 print-text-black">{reportData.summary?.totalOrders || 0} أمر</p>
                   </div>
                   <div className="p-5 bg-slate-900/60 rounded-2xl border border-white/5 print-border print:bg-white">
                     <p className="text-xs text-slate-400 print:text-black mb-1">إجمالي قيمة المشتريات</p>
                     <p className="text-xl font-bold text-rose-400 print-text-black">SAR {Number(reportData.summary?.totalSpent || 0).toLocaleString()}</p>
                   </div>
                 </>
               )}
            </div>

            {/* Report Details Table */}
            <div className="overflow-x-auto bg-slate-900/30 rounded-2xl border border-white/5 p-4 print:p-0 print:border-none">
              <table className="w-full text-right text-sm">
                <thead>
                  <tr className="bg-slate-900/50 print:bg-slate-100 text-slate-400 print:text-black border-b border-white/10 print:border-black">
                    {reportType === 'FINANCIAL_SUMMARY' && (
                       <>
                         <th className="px-4 py-3.5 font-bold">التاريخ</th>
                         <th className="px-4 py-3.5 font-bold">المشروع</th>
                         <th className="px-4 py-3.5 font-bold">العملية المالية</th>
                         <th className="px-4 py-3.5 font-bold text-left">المبلغ التدفق (SAR)</th>
                       </>
                    )}
 
                    {(reportType === 'CONTRACTS' || reportType === 'CLIENT_CONTRACTS' || reportType === 'SUBCONTRACTOR_CONTRACTS') && (
                       <>
                         <th className="px-4 py-3.5 font-bold">رقم العقد/المرجع</th>
                         <th className="px-4 py-3.5 font-bold">نوع العقد</th>
                         <th className="px-4 py-3.5 font-bold">المشروع</th>
                         <th className="px-4 py-3.5 font-bold">
                           {reportType === 'CLIENT_CONTRACTS' ? 'العميل (المالك)' : reportType === 'SUBCONTRACTOR_CONTRACTS' ? 'المقاول الطرف الثاني' : 'الطرف الآخر'}
                         </th>
                         <th className="px-4 py-3.5 font-bold text-center">قيمة العقد (SAR)</th>
                         <th className="px-4 py-3.5 font-bold text-center">المستخلصات المعتمدة</th>
                         <th className="px-4 py-3.5 font-bold text-center">المسدد فعلياً</th>
                         <th className="px-4 py-3.5 font-bold text-left">المتبقي</th>
                       </>
                    )}
 
                    {reportType === 'BOQ_PROGRESS' && (
                       <>
                         <th className="px-4 py-3.5 font-bold">بند الأعمال / الكود</th>
                         <th className="px-4 py-3.5 font-bold">المشروع</th>
                         <th className="px-4 py-3.5 font-bold text-center">سعر الوحدة</th>
                         <th className="px-4 py-3.5 font-bold text-center">الكمية المقدرة</th>
                         <th className="px-4 py-3.5 font-bold text-center">المنفذ الفعلي</th>
                         <th className="px-4 py-3.5 font-bold text-center">الكمية المتبقية</th>
                         <th className="px-4 py-3.5 font-bold text-center">قيمة الإنجاز المالي</th>
                         <th className="px-4 py-3.5 font-bold text-left">نسبة التقدم</th>
                       </>
                    )}
 
                    {(reportType === 'ACHIEVEMENT_RECORDS' || reportType === 'CLIENT_ACHIEVEMENT_RECORDS' || reportType === 'SUBCONTRACTOR_ACHIEVEMENT_RECORDS') && (
                       <>
                         <th className="px-3 py-3.5 font-bold print-hide"></th>
                         <th className="px-4 py-3.5 font-bold">رقم المحضر</th>
                         <th className="px-4 py-3.5 font-bold">المشروع</th>
                         <th className="px-4 py-3.5 font-bold">نوع العقد</th>
                         <th className="px-4 py-3.5 font-bold">الطرف الثاني</th>
                         <th className="px-4 py-3.5 font-bold">تاريخ الاعتماد</th>
                         <th className="px-4 py-3.5 font-bold">المعتمد</th>
                         <th className="px-4 py-3.5 font-bold text-center">القيمة الإجمالية</th>
                         <th className="px-4 py-3.5 font-bold text-left">صافي المستحق</th>
                       </>
                    )}
 
                    {(reportType === 'CONTACTS' || reportType === 'CLIENT_CONTACTS' || reportType === 'SUPPLIER_CONTACTS') && (
                       <>
                         <th className="px-4 py-3.5 font-bold">الاسم</th>
                         <th className="px-4 py-3.5 font-bold">السجل التجاري</th>
                         {reportType === 'CONTACTS' && <th className="px-4 py-3.5 font-bold">نوع جهة الاتصال</th>}
                         <th className="px-4 py-3.5 font-bold text-center">الهاتف والبريد</th>
                         <th className="px-4 py-3.5 font-bold text-center">عدد المشاريع</th>
                         <th className="px-4 py-3.5 font-bold text-center">
                           {reportType === 'CLIENT_CONTACTS' ? 'عدد العقود' : 'العقود وأوامر الشراء'}
                         </th>
                         <th className="px-4 py-3.5 font-bold text-left">إجمالي حجم التعامل المالي (SAR)</th>
                       </>
                    )}

                    {reportType === 'PURCHASES' && (
                       <>
                         <th className="px-4 py-3.5 font-bold">التاريخ</th>
                         <th className="px-4 py-3.5 font-bold">رقم الـ PO</th>
                         <th className="px-4 py-3.5 font-bold">المشروع</th>
                         <th className="px-4 py-3.5 font-bold">المورد</th>
                         <th className="px-4 py-3.5 font-bold">قيمة الضريبة</th>
                         <th className="px-4 py-3.5 font-bold text-left">التكلفة الإجمالية (SAR)</th>
                       </>
                    )}

                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 print:divide-black/10 text-slate-300 print-text-black">
                  {reportData.data?.length > 0 ? reportData.data.map((row: any, i: number) => (
                    <>
                      <tr key={row.id || i} className="hover:bg-slate-800/30 print:hover:bg-transparent">
                        
                        {reportType === 'FINANCIAL_SUMMARY' && (
                          <>
                            <td className="px-4 py-3.5 font-mono text-xs">{new Date(row.date).toLocaleDateString('ar-SA')}</td>
                            <td className="px-4 py-3.5 font-bold">{row.project || 'عام'}</td>
                            <td className="px-4 py-3.5">{row.type}</td>
                            <td className={`px-4 py-3.5 font-mono font-bold text-left ${row.amount > 0 ? 'text-emerald-400 print-text-black' : 'text-rose-400 print-text-black'}`}>
                              {row.amount > 0 ? '+' : ''}{Number(row.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}
                            </td>
                          </>
                        )}

                        {(reportType === 'CONTRACTS' || reportType === 'CLIENT_CONTRACTS' || reportType === 'SUBCONTRACTOR_CONTRACTS') && (
                          <>
                            <td className="px-4 py-3.5 font-mono font-bold text-xs text-white print-text-black">{row.referenceNumber}</td>
                            <td className="px-4 py-3.5 text-xs">
                              <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${row.type === 'MAIN_CONTRACT' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                                {row.type === 'MAIN_CONTRACT' ? 'عقد المالك' : 'عقد مقاول باطن'}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 font-bold text-xs">{row.project}</td>
                            <td className="px-4 py-3.5 font-bold">{row.partyName}</td>
                            <td className="px-4 py-3.5 font-mono text-center">{Number(row.totalValue).toLocaleString()}</td>
                            <td className="px-4 py-3.5 font-mono text-center text-emerald-400 print-text-black font-semibold">{Number(row.totalInvoiced).toLocaleString()}</td>
                            <td className="px-4 py-3.5 font-mono text-center text-blue-400 print-text-black">{Number(row.totalPaid).toLocaleString()}</td>
                            <td className="px-4 py-3.5 font-mono font-bold text-rose-400 print-text-black text-left">{Number(row.remaining).toLocaleString()}</td>
                          </>
                        )}

                        {reportType === 'BOQ_PROGRESS' && (
                          <>
                            <td className="px-4 py-3.5">
                               <div className="font-bold text-white print-text-black truncate max-w-[200px]" title={row.description}>{row.description}</div>
                               <div className="text-[10px] text-slate-500 font-mono">{row.itemCode}</div>
                            </td>
                            <td className="px-4 py-3.5 font-bold text-xs">{row.project}</td>
                            <td className="px-4 py-3.5 font-mono text-center text-xs">SAR {Number(row.unitPrice).toLocaleString()}</td>
                            <td className="px-4 py-3.5 font-mono text-center font-bold">{row.plannedQty}</td>
                            <td className="px-4 py-3.5 font-mono text-center text-emerald-400 print-text-black font-bold">{row.executedQty}</td>
                            <td className="px-4 py-3.5 font-mono text-center text-rose-400 print-text-black">{row.remainingQty}</td>
                            <td className="px-4 py-3.5 font-mono text-center text-white print-text-black font-semibold">{Number(row.executedValue).toLocaleString(undefined, {minimumFractionDigits: 1})}</td>
                            <td className="px-4 py-3.5 font-mono text-xs text-left">
                               <div className="flex items-center gap-2 justify-end">
                                 <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden print-hide">
                                   <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(Number(row.completionPercentage), 100)}%` }} />
                                 </div>
                                 <span className={Number(row.completionPercentage) >= 100 ? 'text-emerald-400 font-bold' : ''}>{row.completionPercentage}%</span>
                               </div>
                            </td>
                          </>
                        )}

                        {(reportType === 'ACHIEVEMENT_RECORDS' || reportType === 'CLIENT_ACHIEVEMENT_RECORDS' || reportType === 'SUBCONTRACTOR_ACHIEVEMENT_RECORDS') && (
                          <>
                            <td className="px-3 py-3.5 print-hide">
                              <button 
                                onClick={() => toggleInvoiceDetails(row.id)}
                                className="p-1 rounded-md hover:bg-slate-800 text-slate-400 transition-colors"
                              >
                                {expandedInvoiceId === row.id ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                              </button>
                            </td>
                            <td className="px-4 py-3.5 font-mono font-bold text-white print-text-black text-xs">{row.invoiceNumber}</td>
                            <td className="px-4 py-3.5 font-bold text-xs">{row.project}</td>
                            <td className="px-4 py-3.5 text-xs">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${row.contractType === 'MAIN_CONTRACT' ? 'bg-blue-500/10 text-blue-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                {row.contractType === 'MAIN_CONTRACT' ? 'عقد المالك' : 'عقد مقاول باطن'}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 font-bold">{row.partyName}</td>
                            <td className="px-4 py-3.5 font-mono text-xs">{row.approvedAt ? new Date(row.approvedAt).toLocaleDateString('ar-SA') : new Date(row.issueDate).toLocaleDateString('ar-SA')}</td>
                            <td className="px-4 py-3.5 text-xs font-semibold">{row.approvedBy}</td>
                            <td className="px-4 py-3.5 font-mono text-center text-slate-400">{Number(row.grossAmount).toLocaleString(undefined, {minimumFractionDigits: 1})}</td>
                            <td className="px-4 py-3.5 font-mono font-bold text-emerald-400 print-text-black text-left">{Number(row.netAmount).toLocaleString(undefined, {minimumFractionDigits: 1})}</td>
                          </>
                        )}

                        {(reportType === 'CONTACTS' || reportType === 'CLIENT_CONTACTS' || reportType === 'SUPPLIER_CONTACTS') && (
                          <>
                            <td className="px-4 py-3.5">
                              <div className="font-bold text-white print-text-black">{row.name}</div>
                              <div className="text-[10px] text-slate-500">{row.contactPerson !== '-' ? `مسؤول: ${row.contactPerson}` : ''}</div>
                            </td>
                            <td className="px-4 py-3.5 font-mono text-xs">{row.commercialName}</td>
                            {reportType === 'CONTACTS' && (
                              <td className="px-4 py-3.5 text-xs">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${row.type === 'CLIENT' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                                  {row.type === 'CLIENT' ? 'عميل / مالك' : 'مورد / مقاول'}
                                </span>
                              </td>
                            )}
                            <td className="px-4 py-3.5 text-center font-mono text-xs">
                              <div>{row.phone}</div>
                              <div className="text-[10px] text-slate-500">{row.email}</div>
                            </td>
                            <td className="px-4 py-3.5 font-mono text-center font-semibold">{row.projectsCount}</td>
                            <td className="px-4 py-3.5 font-mono text-center text-slate-400">{row.contractsCount}</td>
                            <td className="px-4 py-3.5 font-mono font-bold text-left text-white print-text-black">{Number(row.volume).toLocaleString()}</td>
                          </>
                        )}

                        {reportType === 'PURCHASES' && (
                          <>
                            <td className="px-4 py-3.5 font-mono text-xs">{new Date(row.date).toLocaleDateString('ar-SA')}</td>
                            <td className="px-4 py-3.5 font-mono text-xs font-bold text-white print-text-black">{row.poNumber}</td>
                            <td className="px-4 py-3.5 font-bold text-xs">{row.project || 'عام'}</td>
                            <td className="px-4 py-3.5">{row.supplier}</td>
                            <td className="px-4 py-3.5 font-mono text-slate-400 text-center">{Number(row.taxAmount).toLocaleString()}</td>
                            <td className="px-4 py-3.5 font-mono font-bold text-rose-400 print-text-black text-left">{Number(row.total).toLocaleString()}</td>
                          </>
                        )}

                      </tr>

                      {/* Expandable details list for Certified Achievement Record */}
                      {(reportType === 'ACHIEVEMENT_RECORDS' || reportType === 'CLIENT_ACHIEVEMENT_RECORDS' || reportType === 'SUBCONTRACTOR_ACHIEVEMENT_RECORDS') && expandedInvoiceId === row.id && (
                        <tr className="bg-slate-900/80 print:bg-slate-50">
                          <td colSpan={9} className="p-4 border-t border-b border-indigo-500/20">
                            <div className="space-y-3">
                              <h4 className="text-xs font-bold text-indigo-400 print-text-black flex items-center gap-2">
                                <Award size={14} /> تفاصيل البنود والكميات المنجزة في هذا المحضر:
                              </h4>
                              <div className="overflow-x-auto">
                                <table className="w-full text-right text-xs bg-slate-950/50 print:bg-white rounded-lg overflow-hidden border border-white/5 print:border-black/20">
                                  <thead>
                                    <tr className="bg-slate-900/50 print:bg-slate-200 text-slate-400 print:text-black">
                                      <th className="px-3 py-2">البند / التفاصيل</th>
                                      <th className="px-3 py-2 text-center">الوحدة</th>
                                      <th className="px-3 py-2 text-center">سعر الفئة</th>
                                      <th className="px-3 py-2 text-center">كمية سابق</th>
                                      <th className="px-3 py-2 text-center font-bold text-indigo-400 print-text-black">كمية حالي</th>
                                      <th className="px-3 py-2 text-center">كمية إجمالي</th>
                                      <th className="px-3 py-2 text-left">القيمة الحالية (SAR)</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-white/5 print:divide-black/10">
                                    {row.details.map((detail: any, dIdx: number) => (
                                      <tr key={dIdx} className="hover:bg-slate-900">
                                        <td className="px-3 py-2">
                                          <span className="font-bold text-white print-text-black">{detail.description}</span>
                                          <span className="block text-[9px] text-slate-500 font-mono">{detail.itemCode}</span>
                                        </td>
                                        <td className="px-3 py-2 text-center text-slate-400">{detail.unit}</td>
                                        <td className="px-3 py-2 text-center font-mono">SAR {Number(detail.unitPrice).toLocaleString()}</td>
                                        <td className="px-3 py-2 text-center font-mono">{detail.previousQty}</td>
                                        <td className="px-3 py-2 text-center font-mono font-bold text-indigo-400 print-text-black">{detail.currentQty}</td>
                                        <td className="px-3 py-2 text-center font-mono">{detail.totalQty}</td>
                                        <td className="px-3 py-2 text-left font-mono font-bold text-white print-text-black">SAR {Number(detail.currentValue).toLocaleString()}</td>
                                      </tr>
                                    ))}
                                    {row.details.length === 0 && (
                                      <tr>
                                        <td colSpan={7} className="px-3 py-4 text-center text-slate-600">لا توجد تفاصيل بنود مسجلة لهذا المستخلص</td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  )) : (
                    <tr>
                      <td colSpan={10} className="px-4 py-12 text-center text-slate-500 print:text-black">لا توجد بيانات مطابقة لهذه الفلاتر</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Signature & Certified blocks at the bottom of the printed report */}
            <div className="mt-12 pt-8 border-t border-dashed border-white/20 print:border-black/20 flex flex-col sm:flex-row justify-between items-center gap-6 print-text-black">
              <p className="text-xs text-slate-500 print-text-black">تم إصدار هذا التقرير آلياً من نظام إدارة المشاريع PMS contracting</p>
              <div className="flex gap-12 text-xs md:text-sm font-bold text-slate-400 print-text-black">
                <span>توقيع المراجعة المالي: _________________</span>
                <span>اعتماد الإدارة والمشروع: _________________</span>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
