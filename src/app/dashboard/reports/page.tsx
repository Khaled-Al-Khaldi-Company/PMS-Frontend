"use client";

import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/lib/api";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
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
  FileSpreadsheet,
  Search,
  ArrowUpDown,
  FileDown,
  BarChart3
} from "lucide-react";
import { useCompany } from "@/context/CompanyContext";
import { useDownloadPdf } from "@/hooks/useDownloadPdf";
import { useLanguage } from "@/lib/i18n/context";

// ==========================================
// 1. Custom SVG Charts Components (Arabic Support)
// ==========================================

// Bar chart comparing Revenue & Costs per Project/Month
const FinancialBarChart = ({ data, t }: { data: any[]; t: (key: string) => string }) => {
  if (!data || data.length === 0) {
    return <div className="text-slate-500 text-xs text-center py-12">{t("reports.noDataVisual")}</div>;
  }
  const maxVal = Math.max(...data.map(d => Math.max(d.revenue, d.cost)), 1000);
  
  return (
    <div className="w-full h-64 flex flex-col justify-between">
      <div className="flex-1 flex items-end gap-5 px-2 mt-4">
        {data.map((item, index) => {
          const revHeight = `${(item.revenue / maxVal) * 80}%`;
          const costHeight = `${(item.cost / maxVal) * 80}%`;
          return (
            <div key={index} className="flex-1 flex flex-col items-center group h-full justify-end">
              <div className="flex gap-1.5 items-end h-full w-full justify-center">
                {/* Revenue Bar */}
                <motion.div 
                  initial={{ height: 0 }} 
                  animate={{ height: revHeight }} 
                  transition={{ duration: 0.8, ease: "easeOut", delay: index * 0.05 }}
                  className="w-3 md:w-4 bg-gradient-to-t from-emerald-600 to-emerald-400 hover:to-emerald-300 rounded-t transition-all relative group-hover:shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-950/90 text-emerald-400 text-[9px] px-2 py-0.5 rounded border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20 font-mono">
                    {Number(item.revenue).toLocaleString()} SAR
                  </div>
                </motion.div>
                {/* Cost Bar */}
                <motion.div 
                  initial={{ height: 0 }} 
                  animate={{ height: costHeight }} 
                  transition={{ duration: 0.8, ease: "easeOut", delay: index * 0.05 + 0.1 }}
                  className="w-3 md:w-4 bg-gradient-to-t from-rose-600 to-rose-400 hover:to-rose-300 rounded-t transition-all relative group-hover:shadow-[0_0_12px_rgba(244,63,94,0.4)]"
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-950/90 text-rose-400 text-[9px] px-2 py-0.5 rounded border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20 font-mono">
                    {Number(item.cost).toLocaleString()} SAR
                  </div>
                </motion.div>
              </div>
              <span className="text-[10px] text-slate-400 print:text-slate-800 mt-2 truncate w-full text-center block font-bold" title={item.name}>{item.name}</span>
            </div>
          );
        })}
      </div>
      <div className="flex justify-center gap-6 mt-4 border-t border-white/5 print:border-slate-200 pt-3">
        <div className="flex items-center gap-2 text-[10px] text-slate-400 print:text-slate-700">
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded" /> {t("reports.revenues")}
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-400 print:text-slate-700">
          <div className="w-2.5 h-2.5 bg-rose-500 rounded" /> {t("reports.costs")}
        </div>
      </div>
    </div>
  );
};

// Donut chart showing Cost distribution
const ExpensesDonutChart = ({ data, t }: { data: any[]; t: (key: string) => string }) => {
  if (!data || data.length === 0) {
    return <div className="text-slate-500 text-xs text-center py-12">{t("reports.noExpenses")}</div>;
  }
  
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  
  return (
    <div className="w-full flex flex-col md:flex-row items-center gap-6 justify-center">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r={radius} fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="16" />
          {data.map((item, index) => {
            const strokeDashoffset = circumference - (item.percentage / 100) * circumference;
            const strokeDasharray = `${circumference} ${circumference}`;
            const rotation = data.slice(0, index).reduce((sum, d) => sum + d.percentage, 0) * 3.6;
            
            return (
              <motion.circle
                key={index}
                cx="70"
                cy="70"
                r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth="16"
                strokeDasharray={strokeDasharray}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.2, ease: "easeOut", delay: index * 0.1 }}
                transform={`rotate(${rotation} 70 70)`}
                className="transition-all duration-300 hover:stroke-[18px] cursor-pointer"
                style={{ strokeLinecap: 'round' }}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[9px] text-slate-500 print:text-slate-700 uppercase">{t("reports.totalCost")}</span>
          <span className="text-xs font-black text-white print:text-black font-mono">
            {Number(data.reduce((sum, d) => sum + d.value, 0)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
          <span className="text-[8px] text-slate-400 print:text-slate-600">SAR</span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            <div className="text-[11px] leading-none">
              <span className="text-slate-300 print:text-slate-800 font-bold ml-1">{item.name}:</span>
              <span className="text-slate-400 print:text-slate-700 font-mono ml-1">{item.percentage.toFixed(1)}%</span>
              <span className="text-[9px] text-slate-500 print:text-slate-600 font-mono">({Number(item.value).toLocaleString()} SAR)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Radial Ring & Top Items for BOQ Progress
const BoqProgressChart = ({ summary, items, t }: { summary: any, items: any[], t: (key: string) => string }) => {
  const progress = Number(summary?.overallProgress || 0);
  const radius = 55;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(progress, 100) / 100) * circumference;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 bg-slate-900/60 print:bg-slate-50 p-6 rounded-3xl border border-white/5 print:border-slate-200 shadow-xl backdrop-blur-md">
      <div className="flex flex-col items-center justify-center border-l border-white/5 print:border-slate-200 py-2">
        <h4 className="text-xs font-bold text-slate-400 print:text-slate-800 mb-4">{t("reports.overallProgressTitle")}</h4>
        <div className="relative w-36 h-36">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r={radius} fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="10" />
            <motion.circle 
              cx="70" 
              cy="70" 
              r={radius} 
              fill="transparent" 
              stroke="#a855f7" 
              strokeWidth="10" 
              strokeDasharray={`${circumference} ${circumference}`} 
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              style={{ strokeLinecap: 'round', filter: 'drop-shadow(0 0 4px rgba(168,85,247,0.3))' }} 
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-white print:text-black font-mono">{progress}%</span>
            <span className="text-[9px] text-slate-400 print:text-slate-600 mt-0.5">{t("reports.contractuallyCompleted")}</span>
          </div>
        </div>
      </div>
      <div className="md:col-span-2 flex flex-col justify-between py-2">
        <h4 className="text-xs font-bold text-slate-400 print:text-slate-800 mb-3">{t("reports.topBoqItems")}</h4>
        <div className="space-y-3.5">
          {items.slice(0, 4).map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-300 print:text-slate-800 font-bold truncate max-w-[280px]">{item.description}</span>
                <span className="text-indigo-400 print:text-indigo-700 font-mono font-semibold">{Number(item.executedValue).toLocaleString()} SAR ({item.completionPercentage}%)</span>
              </div>
              <div className="w-full h-2 bg-slate-950 print:bg-slate-200 rounded-full overflow-hidden border border-white/5 print:border-slate-300">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(Number(item.completionPercentage), 100)}%` }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" 
                />
              </div>
            </div>
          ))}
          {items.length === 0 && <div className="text-slate-500 text-xs text-center py-6">{t("reports.noBoqItems")}</div>}
        </div>
      </div>
    </div>
  );
};

// Stacked Progress Bar for Contracts
const ContractsStackedBar = ({ summary, t }: { summary: any; t: (key: string) => string }) => {
  const total = Number(summary?.totalValue || 0);
  const invoiced = Number(summary?.totalInvoiced || 0);
  const paid = Number(summary?.totalPaid || 0);
  
  if (total === 0) return null;
  
  const paidPercent = (paid / total) * 100;
  const unpaidInvoicedPercent = ((invoiced - paid) / total) * 100;
  const remainingPercent = ((total - invoiced) / total) * 100;
  
  return (
    <div className="bg-slate-900/60 print:bg-slate-50 p-6 rounded-3xl border border-white/5 print:border-slate-200 shadow-xl mb-8 backdrop-blur-md">
      <h4 className="text-xs font-bold text-slate-400 print:text-slate-800 mb-4">{t("reports.cumulativeFinancialAnalysis")}</h4>
      <div className="w-full h-6 bg-slate-950 print:bg-slate-200 rounded-xl overflow-hidden flex border border-white/5 print:border-slate-300 p-0.5">
        {paid > 0 && (
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${paidPercent}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-l-lg relative group cursor-pointer"
          >
            <div className="absolute top-8 right-0 bg-slate-950 text-emerald-400 text-[10px] px-2 py-0.5 rounded border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
              {t("reports.paid")}: {paid.toLocaleString()} SAR ({paidPercent.toFixed(1)}%)
            </div>
          </motion.div>
        )}
        {invoiced - paid > 0 && (
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${unpaidInvoicedPercent}%` }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            className="h-full bg-gradient-to-r from-blue-600 to-blue-500 relative group cursor-pointer"
          >
            <div className="absolute top-8 right-0 bg-slate-950 text-blue-400 text-[10px] px-2 py-0.5 rounded border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
              {t("reports.certifiedUnpaid")}: {(invoiced - paid).toLocaleString()} SAR ({unpaidInvoicedPercent.toFixed(1)}%)
            </div>
          </motion.div>
        )}
        {total - invoiced > 0 && (
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${remainingPercent}%` }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
            className="h-full bg-slate-800 print:bg-slate-300 rounded-r-lg relative group cursor-pointer"
          >
            <div className="absolute top-8 left-0 bg-slate-950 text-slate-400 text-[10px] px-2 py-0.5 rounded border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
              {t("reports.remainingContractValue")}: {(total - invoiced).toLocaleString()} SAR ({remainingPercent.toFixed(1)}%)
            </div>
          </motion.div>
        )}
      </div>
      
      <div className="flex flex-wrap justify-between items-center gap-4 mt-6 border-t border-white/5 print:border-slate-200 pt-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2 text-[10px] text-slate-400 print:text-slate-700">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded" /> {t("reports.collected")} ({paidPercent.toFixed(1)}%)
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-400 print:text-slate-700">
            <div className="w-2.5 h-2.5 bg-blue-500 rounded" /> {t("reports.certifiedUnpaidPercent")} ({unpaidInvoicedPercent.toFixed(1)}%)
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-400 print:text-slate-700">
            <div className="w-2.5 h-2.5 bg-slate-800 print:bg-slate-300 rounded" /> {t("reports.remainingUninvoiced")} ({remainingPercent.toFixed(1)}%)
          </div>
        </div>
        <div className="text-[11px] text-slate-400 print:text-slate-800 font-bold">
          {t("reports.collectionRatio")}: <span className="font-bold text-emerald-400 print:text-emerald-600 font-mono">{invoiced > 0 ? ((paid / invoiced) * 100).toFixed(1) : 0}%</span> {t("reports.ofTotalCertified")}
        </div>
      </div>
    </div>
  );
};

// Bar chart comparing top contacts by volume
const TopContactsChart = ({ data, t }: { data: any[]; t: (key: string) => string }) => {
  const sorted = [...data].sort((a, b) => b.volume - a.volume).slice(0, 5);
  if (sorted.length === 0) return null;
  const maxVolume = Math.max(...sorted.map(d => d.volume), 1);
  
  return (
    <div className="bg-slate-900/60 print:bg-slate-50 p-6 rounded-3xl border border-white/5 print:border-slate-200 shadow-xl mb-8 backdrop-blur-md">
      <h4 className="text-xs font-bold text-slate-400 print:text-slate-800 mb-4 flex items-center gap-2">
        <Users size={14} className="text-indigo-400 print:text-indigo-700" /> {t("reports.top5Entities")}
      </h4>
      <div className="space-y-4">
        {sorted.map((item, idx) => {
          const width = `${(item.volume / maxVolume) * 100}%`;
          return (
            <div key={idx} className="space-y-1 group">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 print:text-slate-800 font-bold">
                  {item.name} <span className="text-[10px] text-slate-500 print:text-slate-600 font-normal">({item.type === 'CLIENT' ? t("reports.client") : t("reports.supplierContractor")})</span>
                </span>
                <span className="text-emerald-400 print:text-emerald-600 font-mono font-bold">{Number(item.volume).toLocaleString()} SAR</span>
              </div>
              <div className="w-full h-3 bg-slate-950 print:bg-slate-200 rounded-full overflow-hidden border border-white/5 print:border-slate-300 flex">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width }}
                  transition={{ duration: 1.2, ease: "easeOut", delay: idx * 0.05 }}
                  className={`h-full rounded-full ${item.type === 'CLIENT' ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' : 'bg-gradient-to-r from-amber-600 to-amber-400'}`} 
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ==========================================
// 2. Main Page Component
// ==========================================

export default function ReportsPage() {
  const { company } = useCompany();
  const { pdfRef, downloadPdf } = useDownloadPdf();
  const { t } = useLanguage();
  const [reportType, setReportType] = useState('FINANCIAL_SUMMARY');
  const [projectId, setProjectId] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  
  const [projects, setProjects] = useState<any[]>([]);
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedInvoiceId, setExpandedInvoiceId] = useState<string | null>(null);

  // Redesign state additions
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showCharts, setShowCharts] = useState(true);

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
    setSearchTerm('');
    setSortField(null);
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

  useEffect(() => {
    fetchProjects();
    fetchReport();
  }, []);

  useEffect(() => {
    fetchReport();
  }, [reportType, projectId, dateRange]);

  const handlePrint = () => {
    window.print();
  };

  // CSV Export with Arabic Support BOM (\uFEFF)
  const exportToExcel = () => {
    if (!reportData || !reportData.data || reportData.data.length === 0) return;
    
    let headers: string[] = [];
    let rows: string[][] = [];
    
    const targetData = getFilteredAndSortedData();
    
    switch (reportType) {
      case 'FINANCIAL_SUMMARY':
        headers = [t("reports.date"), t("reports.project"), t("reports.transactionType"), t("common.amount") + ' (SAR)'];
        rows = targetData.map((row: any) => [
          new Date(row.date).toLocaleDateString('ar-SA'),
          row.project || t("reports.general"),
          row.type,
          row.amount.toString()
        ]);
        break;
      case 'CLIENT_CONTRACTS':
      case 'SUBCONTRACTOR_CONTRACTS':
      case 'CONTRACTS':
        headers = [t("reports.contractRef"), t("reports.contractType"), t("reports.project"), t("reports.secondParty"), t("reports.contractValue"), t("reports.certifiedInvoicesLabel") + ' (SAR)', t("reports.actuallyPaid") + ' (SAR)', t("reports.remaining") + ' (SAR)'];
        rows = targetData.map((row: any) => [
          row.referenceNumber,
          row.type === 'MAIN_CONTRACT' ? t("reports.ownerContract") : t("reports.subContract"),
          row.project,
          row.partyName,
          row.totalValue.toString(),
          row.totalInvoiced.toString(),
          row.totalPaid.toString(),
          row.remaining.toString()
        ]);
        break;
      case 'BOQ_PROGRESS':
        headers = [t("reports.boqItem"), t("reports.project"), t("reports.unitPrice") + ' (SAR)', t("reports.plannedQty"), t("reports.executedQty"), t("reports.remainingQty"), t("reports.executedValue") + ' (SAR)', t("reports.completionPercent")];
        rows = targetData.map((row: any) => [
          row.description,
          row.project,
          row.unitPrice.toString(),
          row.plannedQty.toString(),
          row.executedQty.toString(),
          row.remainingQty.toString(),
          row.executedValue.toString(),
          row.completionPercentage.toString()
        ]);
        break;
      case 'ACHIEVEMENT_RECORDS':
      case 'CLIENT_ACHIEVEMENT_RECORDS':
      case 'SUBCONTRACTOR_ACHIEVEMENT_RECORDS':
        headers = [t("reports.recordNumber"), t("reports.project"), t("reports.contractType"), t("reports.secondParty"), t("reports.approvalDate"), t("reports.approvedBy"), t("reports.grossAmount") + ' (SAR)', t("reports.netAmount") + ' (SAR)'];
        rows = targetData.map((row: any) => [
          row.invoiceNumber,
          row.project,
          row.contractType === 'MAIN_CONTRACT' ? t("reports.ownerContract") : t("reports.subContract"),
          row.partyName,
          row.approvedAt ? new Date(row.approvedAt).toLocaleDateString('ar-SA') : new Date(row.issueDate).toLocaleDateString('ar-SA'),
          row.approvedBy,
          row.grossAmount.toString(),
          row.netAmount.toString()
        ]);
        break;
      case 'CONTACTS':
      case 'CLIENT_CONTACTS':
      case 'SUPPLIER_CONTACTS':
        headers = [t("reports.entityName"), t("reports.commercialReg"), t("reports.contactType"), t("common.phone"), t("common.email"), t("reports.projects"), t("reports.contractsOrders"), t("reports.totalVolume")];
        rows = targetData.map((row: any) => [
          row.name,
          row.commercialName,
          row.type === 'CLIENT' ? t("reports.clientType") : t("reports.supplierType"),
          row.phone,
          row.email,
          row.projectsCount.toString(),
          row.contractsCount.toString(),
          row.volume.toString()
        ]);
        break;
      case 'PURCHASES':
        headers = [t("reports.date"), t("reports.poNumber"), t("reports.project"), t("reports.supplier"), t("reports.taxAmount") + ' (SAR)', t("reports.totalCostSar")];
        rows = targetData.map((row: any) => [
          new Date(row.date).toLocaleDateString('ar-SA'),
          row.poNumber,
          row.project || t("reports.general"),
          row.supplier,
          row.taxAmount.toString(),
          row.total.toString()
        ]);
        break;
      default:
        headers = [t("common.item")];
        rows = targetData.map((row: any) => [JSON.stringify(row)]);
    }
    
    // Construct CSV
    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(","))
    ].join('\n');
    
    // Add BOM for Microsoft Excel Arabic Support
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    
    const formattedType = reportType.toLowerCase().replace(/_/g, '-');
    link.setAttribute("download", `pms-report-${formattedType}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const renderSortHeader = (field: string, label: string) => {
    const isActive = sortField === field;
    return (
      <th 
        onClick={() => handleSort(field)}
        className="px-4 py-3.5 font-bold cursor-pointer hover:bg-slate-800/40 select-none group transition-all text-right print:bg-slate-100 font-bold"
      >
        <div className="flex items-center gap-1.5 justify-start">
          <span>{label}</span>
          <ArrowUpDown size={12} className={`transition-colors print:hidden ${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-400'}`} />
        </div>
      </th>
    );
  };

  // Client Side Search and Sorting Logic
  const getFilteredAndSortedData = () => {
    if (!reportData || !reportData.data) return [];
    let list = [...reportData.data];
    
    // 1. Search Filter
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase().trim();
      list = list.filter((row: any) => {
        return Object.values(row).some((val: any) => {
          if (val === null || val === undefined) return false;
          if (typeof val === 'object') return false;
          return String(val).toLowerCase().includes(term);
        });
      });
    }
    
    // 2. Column Sorting
    if (sortField) {
      list.sort((a: any, b: any) => {
        let valA = a[sortField];
        let valB = b[sortField];
        
        // Handle dates
        if (sortField === 'date' || sortField === 'approvedAt' || sortField === 'issueDate') {
          valA = new Date(valA).getTime();
          valB = new Date(valB).getTime();
        }
        
        // Convert to numbers if numerical
        if (typeof valA === 'string' && !isNaN(Number(valA))) valA = Number(valA);
        if (typeof valB === 'string' && !isNaN(Number(valB))) valB = Number(valB);
        
        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    return list;
  };

  // Grouping algorithms for visual charts
  const getFinancialChartData = () => {
    if (!reportData || !reportData.data) return [];
    const projectsMap: { [key: string]: { revenue: number, cost: number } } = {};
    
    reportData.data.forEach((row: any) => {
      const projName = row.project || 'عام';
      if (!projectsMap[projName]) {
        projectsMap[projName] = { revenue: 0, cost: 0 };
      }
      if (row.amount > 0) {
        projectsMap[projName].revenue += row.amount;
      } else {
        projectsMap[projName].cost += Math.abs(row.amount);
      }
    });
    
    return Object.keys(projectsMap).map(name => ({
      name,
      revenue: projectsMap[name].revenue,
      cost: projectsMap[name].cost
    })).slice(0, 6);
  };

  const getCostBreakdown = () => {
    if (!reportData || !reportData.data) return [];
    let purchases = 0;
    let expenses = 0;
    let subcontracts = 0;
    
    reportData.data.forEach((row: any) => {
      if (row.amount < 0) {
        const amt = Math.abs(row.amount);
        if (row.type.includes('شراء') || row.type.includes('PO')) {
          purchases += amt;
        } else if (row.type.includes('مصروف') || row.type.includes('نثر')) {
          expenses += amt;
        } else {
          subcontracts += amt;
        }
      }
    });
    
    const total = purchases + expenses + subcontracts;
    if (total === 0) return [];
    
    return [
      { name: t("reports.materialsPurchases"), value: purchases, percentage: (purchases/total)*100, color: '#f43f5e' },
      { name: t("reports.pettyExpenses"), value: expenses, percentage: (expenses/total)*100, color: '#eab308' },
      { name: t("reports.subcontractorContracts"), value: subcontracts, percentage: (subcontracts/total)*100, color: '#a855f7' }
    ].filter(item => item.value > 0);
  };

  const toggleInvoiceDetails = (id: string) => {
    if (expandedInvoiceId === id) {
      setExpandedInvoiceId(null);
    } else {
      setExpandedInvoiceId(id);
    }
  };

  const filteredAndSortedData = getFilteredAndSortedData();

  return (
    <div className="space-y-6 w-full animate-in fade-in zoom-in-95 duration-500 max-w-[1600px] mx-auto pb-12 print:bg-white print:text-black">
      {/* Hidden print styles injected */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          #printable-report, #printable-report * { visibility: visible; }
          #printable-report { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 15px; color: black !important; background: white !important; }
          .print-hide { display: none !important; }
          .print-border { border: 1px solid #000 !important; }
          .print-bg-gray { background-color: #f3f4f6 !important; }
          .print-text-black { color: #000 !important; }
          table { width: 100% !important; border-collapse: collapse !important; margin-top: 15px; }
          th, td { border: 1px solid #ddd !important; padding: 10px !important; text-align: right !important; color: black !important; }
          th { background-color: #f3f4f6 !important; color: black !important; font-weight: bold !important; }
        }
      `}} />

      {/* Header & Controls (Hidden in Print) */}
      <div className="print-hide flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-slate-900/60 p-6 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 flex items-center gap-3">
            <PieChart size={32} className="text-blue-500" /> {t("reports.title")}
          </h1>
          <p className="text-slate-400 mt-2 text-sm">{t("reports.subtitle")}</p>
        </div>

        <div className="relative z-10 flex flex-wrap gap-3">
          {reportData && reportData.data?.length > 0 && (
            <>
              <button 
                onClick={() => setShowCharts(!showCharts)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold border shadow-lg transition-all text-xs cursor-pointer ${showCharts ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20' : 'bg-slate-800 text-slate-400 border-white/5 hover:bg-slate-700'}`}
              >
                <BarChart3 size={16} /> {showCharts ? t("reports.hideCharts") : t("reports.showCharts")}
              </button>
              
              <button 
                onClick={exportToExcel}
                className="flex items-center gap-2 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 px-5 py-3 rounded-xl font-bold shadow-lg transition-all text-xs cursor-pointer"
              >
                <FileSpreadsheet size={16} /> {t("reports.exportExcel")}
              </button>
            </>
          )}

          <button 
            onClick={() => downloadPdf(`Report_${reportType}_${new Date().toISOString().split('T')[0]}.pdf`)}
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all text-xs cursor-pointer"
          >
            <Printer size={16} /> PDF
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all text-xs cursor-pointer"
          >
            <Printer size={16} /> {t("reports.printReport")}
          </button>
        </div>
      </div>

      {/* Interactive Filters Panel (Hidden in Print) */}
      <div className="print-hide grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Tabs */}
        <div className="bg-[#0f1015]/60 backdrop-blur-md p-5 rounded-3xl border border-white/5 space-y-4 max-h-[80vh] overflow-y-auto shadow-2xl">
           <label className="text-slate-400 text-xs font-bold flex items-center gap-2 mb-1"><Filter size={14}/> {t("reports.filterByReportType")}</label>
           
           {/* Group 1: General Reports */}
           <div className="space-y-1.5">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold px-2 mb-1">{t("reports.generalReports")}</div>
              <button onClick={() => setReportType('FINANCIAL_SUMMARY')} className={`w-full px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold flex items-center justify-between transition-all cursor-pointer ${reportType === 'FINANCIAL_SUMMARY' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-black' : 'bg-slate-850/50 text-slate-400 border border-white/5 hover:bg-slate-805'}`}>
                <span className="flex items-center gap-2"><DollarSign size={16}/> {t("reports.profitLoss")}</span>
                <TrendingUp size={14} className="opacity-60"/>
              </button>
              <button onClick={() => setReportType('BOQ_PROGRESS')} className={`w-full px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold flex items-center justify-between transition-all cursor-pointer ${reportType === 'BOQ_PROGRESS' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30 font-black' : 'bg-slate-855/50 text-slate-400 border border-white/5 hover:bg-slate-805'}`}>
                <span className="flex items-center gap-2"><Layers size={16}/> {t("reports.boqQuantities")}</span>
                <Activity size={14} className="opacity-60"/>
              </button>
           </div>

           {/* Group 2: Client Reports */}
           <div className="space-y-1.5 pt-2 border-t border-white/5">
              <div className="text-[10px] uppercase tracking-wider text-blue-400 font-bold px-2 mb-1">{t("reports.clientReports")}</div>
              <button onClick={() => setReportType('CLIENT_CONTRACTS')} className={`w-full px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold flex items-center justify-between transition-all cursor-pointer ${reportType === 'CLIENT_CONTRACTS' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 font-black' : 'bg-slate-850/50 text-slate-400 border border-white/5 hover:bg-slate-805'}`}>
                <span className="flex items-center gap-2"><Briefcase size={16}/> {t("reports.ownerContracts")}</span>
                <Award size={14} className="opacity-60"/>
              </button>
              <button onClick={() => setReportType('CLIENT_ACHIEVEMENT_RECORDS')} className={`w-full px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold flex items-center justify-between transition-all cursor-pointer ${reportType === 'CLIENT_ACHIEVEMENT_RECORDS' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black' : 'bg-slate-850/50 text-slate-400 border border-white/5 hover:bg-slate-805'}`}>
                <span className="flex items-center gap-2"><FileText size={16}/> {t("reports.ownerAchievementRecords")}</span>
                <CheckCircle2 size={14} className="opacity-60"/>
              </button>
              <button onClick={() => setReportType('CLIENT_CONTACTS')} className={`w-full px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold flex items-center justify-between transition-all cursor-pointer ${reportType === 'CLIENT_CONTACTS' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 font-black' : 'bg-slate-850/50 text-slate-400 border border-white/5 hover:bg-slate-805'}`}>
                <span className="flex items-center gap-2"><Users size={16}/> {t("reports.clientFinancialActivity")}</span>
                <Users size={14} className="opacity-60"/>
              </button>
           </div>

           {/* Group 3: Supplier Reports */}
           <div className="space-y-1.5 pt-2 border-t border-white/5">
              <div className="text-[10px] uppercase tracking-wider text-rose-400 font-bold px-2 mb-1">{t("reports.supplierReports")}</div>
              <button onClick={() => setReportType('SUBCONTRACTOR_CONTRACTS')} className={`w-full px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold flex items-center justify-between transition-all cursor-pointer ${reportType === 'SUBCONTRACTOR_CONTRACTS' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 font-black' : 'bg-slate-850/50 text-slate-400 border border-white/5 hover:bg-slate-805'}`}>
                <span className="flex items-center gap-2"><Briefcase size={16}/> {t("reports.subcontractorContracts")}</span>
                <Award size={14} className="opacity-60"/>
              </button>
              <button onClick={() => setReportType('SUBCONTRACTOR_ACHIEVEMENT_RECORDS')} className={`w-full px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold flex items-center justify-between transition-all cursor-pointer ${reportType === 'SUBCONTRACTOR_ACHIEVEMENT_RECORDS' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black' : 'bg-slate-850/50 text-slate-400 border border-white/5 hover:bg-slate-805'}`}>
                <span className="flex items-center gap-2"><FileText size={16}/> {t("reports.contractorAchievementRecords")}</span>
                <CheckCircle2 size={14} className="opacity-60"/>
              </button>
              <button onClick={() => setReportType('SUPPLIER_CONTACTS')} className={`w-full px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold flex items-center justify-between transition-all cursor-pointer ${reportType === 'SUPPLIER_CONTACTS' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 font-black' : 'bg-slate-850/50 text-slate-400 border border-white/5 hover:bg-slate-805'}`}>
                <span className="flex items-center gap-2"><Users size={16}/> {t("reports.supplierFinancialActivity")}</span>
                <Users size={14} className="opacity-60"/>
              </button>
              <button onClick={() => setReportType('PURCHASES')} className={`w-full px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold flex items-center justify-between transition-all cursor-pointer ${reportType === 'PURCHASES' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 font-black' : 'bg-slate-850/50 text-slate-400 border border-white/5 hover:bg-slate-805'}`}>
                <span className="flex items-center gap-2"><ShoppingCart size={16}/> {t("reports.purchasesCosts")}</span>
                <ShoppingCart size={14} className="opacity-60"/>
              </button>
           </div>
        </div>

        {/* Filters Details */}
        <div className="lg:col-span-3 bg-[#0f1015]/60 backdrop-blur-md p-6 rounded-3xl border border-white/5 grid grid-cols-1 md:grid-cols-3 gap-6 shadow-2xl">
           <div className="space-y-2">
               <label className="text-slate-400 text-xs font-bold flex items-center gap-2"><Building size={14}/> {t("reports.filterByProject")}</label>
              <select 
                value={projectId} 
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none transition-colors"
              >
                 <option value="all">{t("reports.allProjects")}</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
           </div>
           
           <div className="space-y-2">
               <label className="text-slate-400 text-xs font-bold flex items-center gap-2"><Calendar size={14}/> {t("reports.startDate")}</label>
              <input 
                type="date" 
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                className="w-full bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-300 focus:border-indigo-500 outline-none transition-colors"
              />
           </div>

           <div className="space-y-2">
               <label className="text-slate-400 text-xs font-bold flex items-center gap-2"><Calendar size={14}/> {t("reports.endDate")}</label>
              <input 
                type="date" 
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                className="w-full bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-300 focus:border-indigo-500 outline-none transition-colors"
              />
           </div>
        </div>
      </div>

      {/* RENDER DYNAMIC VISUAL CHARTS (IF APPLICABLE) */}
      {showCharts && reportData && !isLoading && (
        <AnimatePresence mode="wait">
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }}
            className="print-hide"
          >
            {reportType === 'FINANCIAL_SUMMARY' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-slate-900/60 p-6 rounded-3xl border border-white/5 shadow-xl backdrop-blur-md relative overflow-hidden">
                  <h4 className="text-xs font-black text-slate-300 mb-4 flex items-center gap-2">
                    <BarChart3 size={14} className="text-blue-500" /> {t("reports.revenueVsCost")}
                  </h4>
                  <FinancialBarChart data={getFinancialChartData()} t={t} />
                </div>
                <div className="bg-slate-900/60 p-6 rounded-3xl border border-white/5 shadow-xl backdrop-blur-md relative overflow-hidden">
                  <h4 className="text-xs font-black text-slate-300 mb-4 flex items-center gap-2">
                    <PieChart size={14} className="text-rose-500" /> {t("reports.costStructureAnalysis")}
                  </h4>
                  <ExpensesDonutChart data={getCostBreakdown()} t={t} />
                </div>
              </div>
            )}

            {reportType === 'BOQ_PROGRESS' && (
              <BoqProgressChart summary={reportData.summary} items={reportData.data || []} t={t} />
            )}

            {(reportType === 'CONTRACTS' || reportType === 'CLIENT_CONTRACTS' || reportType === 'SUBCONTRACTOR_CONTRACTS') && (
              <ContractsStackedBar summary={reportData.summary} t={t} />
            )}

            {(reportType === 'CONTACTS' || reportType === 'CLIENT_CONTACTS' || reportType === 'SUPPLIER_CONTACTS') && (
              <TopContactsChart data={reportData.data || []} t={t} />
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* PRINTABLE AREA */}
      <div ref={pdfRef} id="printable-report" className="bg-[#0f1015]/60 backdrop-blur-xl print:bg-white rounded-3xl border border-white/5 print:border-none p-8 min-h-[500px] shadow-2xl relative">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 opacity-50">
            <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
            <p className="text-slate-400 print-hide">{t("reports.loadingReport")}</p>
          </div>
        ) : reportData ? (
          <>
            {/* Header of Report Document */}
            <div className="mb-8 border-b border-white/10 print:border-black/20 pb-6 flex flex-col md:flex-row justify-between items-center gap-4 text-right print:text-right">
               <div>
                  <h2 className="text-2xl font-black text-white print-text-black uppercase">
                    {reportType === 'FINANCIAL_SUMMARY' ? t("reports.reportTitle.financialSummary") : 
                     reportType === 'CONTRACTS' ? t("reports.reportTitle.contracts") :
                     reportType === 'CLIENT_CONTRACTS' ? t("reports.reportTitle.clientContracts") :
                     reportType === 'SUBCONTRACTOR_CONTRACTS' ? t("reports.reportTitle.subcontractorContracts") :
                     reportType === 'BOQ_PROGRESS' ? t("reports.reportTitle.boqProgress") :
                     reportType === 'ACHIEVEMENT_RECORDS' ? t("reports.reportTitle.achievementRecords") :
                     reportType === 'CLIENT_ACHIEVEMENT_RECORDS' ? t("reports.reportTitle.clientAchievementRecords") :
                     reportType === 'SUBCONTRACTOR_ACHIEVEMENT_RECORDS' ? t("reports.reportTitle.subcontractorAchievementRecords") :
                     reportType === 'CONTACTS' ? t("reports.reportTitle.contacts") :
                     reportType === 'CLIENT_CONTACTS' ? t("reports.reportTitle.clientContacts") :
                     reportType === 'SUPPLIER_CONTACTS' ? t("reports.reportTitle.supplierContacts") :
                     reportType === 'PURCHASES' ? t("reports.reportTitle.purchases") :
                     t("reports.reportTitle.purchases")}
                  </h2>
                 <p className="text-slate-400 print:text-slate-600 mt-2 text-sm">
                    {t("reports.selectedProject")}: <span className="font-bold text-white print-text-black">{projectId === 'all' ? t("reports.allActiveProjects") : projects.find(p=>p.id === projectId)?.name}</span>
                 </p>
                 {(dateRange.start || dateRange.end) && (
                   <p className="text-xs text-indigo-400 print:text-black mt-1">
                      {t("reports.reportPeriod")}: {dateRange.start ? `${t("reports.from")} ${dateRange.start}` : ''} {dateRange.end ? `${t("reports.to")} ${dateRange.end}` : ''}
                   </p>
                 )}
               </div>
               <div className="text-center md:text-left text-xs text-slate-500 print-text-black font-mono">
                  <p>{t("reports.reportIssueDate")}</p>
                 <p className="font-mono text-sm text-slate-300 print-text-black mt-1">{new Date().toLocaleString('ar-SA')}</p>
               </div>
            </div>

            {/* Smart Summary Cards based on Report Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
               {reportType === 'FINANCIAL_SUMMARY' && (
                 <>
                   <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="p-5 bg-gradient-to-br from-slate-900 to-slate-800/80 rounded-2xl border border-white/5 print-border print:bg-white shadow-lg">
                      <p className="text-[10px] text-slate-400 print:text-black mb-1">{t("reports.totalRevenue")}</p>
                     <p className="text-xl font-mono font-black text-emerald-400 print-text-black">SAR {Number(reportData.summary?.totalRevenue || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                   </motion.div>
                   <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="p-5 bg-gradient-to-br from-slate-900 to-slate-800/80 rounded-2xl border border-white/5 print-border print:bg-white shadow-lg">
                      <p className="text-[10px] text-slate-400 print:text-black mb-1">{t("reports.totalCostsLabel")}</p>
                     <p className="text-xl font-mono font-black text-rose-400 print-text-black">SAR {Number(reportData.summary?.totalCosts || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                   </motion.div>
                   <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className={`p-5 bg-gradient-to-br rounded-2xl border border-white/5 print-border print:bg-white shadow-lg ${reportData.summary?.profit >= 0 ? 'from-emerald-950/20 to-slate-900' : 'from-rose-950/20 to-slate-900'}`}>
                      <p className="text-[10px] text-slate-400 print:text-black mb-1">{t("reports.netOperatingProfit")}</p>
                     <p className={`text-xl font-mono font-black ${reportData.summary?.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'} print-text-black`}>SAR {Number(reportData.summary?.profit || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                   </motion.div>
                   <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="p-5 bg-gradient-to-br from-slate-900 to-slate-800/80 rounded-2xl border border-white/5 print-border print:bg-white shadow-lg">
                      <p className="text-[10px] text-slate-400 print:text-black mb-1">{t("reports.grossProfitMargin")}</p>
                     <p className="text-xl font-mono font-black text-indigo-400 print-text-black">{Number(reportData.summary?.margin || 0).toFixed(2)}%</p>
                   </motion.div>
                 </>
               )}

               {reportType === 'CLIENT_CONTRACTS' && (
                 <>
                   <div className="p-5 bg-slate-900/60 rounded-2xl border border-white/5 print-border print:bg-white">
                      <p className="text-[10px] text-slate-400 print:text-black mb-1">{t("reports.totalClientContractsValue")}</p>
                      <p className="text-lg font-mono font-bold text-blue-400 print-text-black">SAR {Number(reportData.summary?.totalValue || 0).toLocaleString()}</p>
                      <span className="text-[9px] text-slate-500">{t("reports.count")}: {reportData.summary?.totalContracts || 0}</span>
                   </div>
                   <div className="p-5 bg-slate-900/60 rounded-2xl border border-white/5 print-border print:bg-white">
                      <p className="text-[10px] text-slate-400 print:text-black mb-1">{t("reports.certifiedInvoicesIssued")}</p>
                     <p className="text-lg font-mono font-bold text-emerald-400 print-text-black">SAR {Number(reportData.summary?.totalInvoiced || 0).toLocaleString()}</p>
                   </div>
                   <div className="p-5 bg-slate-900/60 rounded-2xl border border-white/5 print-border print:bg-white">
                      <p className="text-[10px] text-slate-400 print:text-black mb-1">{t("reports.actuallyCollected")}</p>
                     <p className="text-lg font-mono font-bold text-white print-text-black">SAR {Number(reportData.summary?.totalPaid || 0).toLocaleString()}</p>
                   </div>
                   <div className="p-5 bg-slate-900/60 rounded-2xl border border-white/5 print-border print:bg-white">
                      <p className="text-[10px] text-slate-400 print:text-black mb-1">{t("reports.remainingForCollection")}</p>
                     <p className="text-lg font-mono font-bold text-rose-400 print-text-black">SAR {Number(reportData.summary?.remaining || 0).toLocaleString()}</p>
                   </div>
                 </>
               )}

               {reportType === 'SUBCONTRACTOR_CONTRACTS' && (
                 <>
                   <div className="p-5 bg-slate-900/60 rounded-2xl border border-white/5 print-border print:bg-white">
                      <p className="text-[10px] text-slate-400 print:text-black mb-1">{t("reports.totalSubcontractorContracts")}</p>
                     <p className="text-lg font-mono font-bold text-rose-400 print-text-black">SAR {Number(reportData.summary?.totalValue || 0).toLocaleString()}</p>
                      <span className="text-[9px] text-slate-500">{t("reports.count")}: {reportData.summary?.totalContracts || 0}</span>
                    </div>
                    <div className="p-5 bg-slate-900/60 rounded-2xl border border-white/5 print-border print:bg-white">
                      <p className="text-[10px] text-slate-400 print:text-black mb-1">{t("reports.contractorCertifiedInvoices")}</p>
                     <p className="text-lg font-mono font-bold text-emerald-400 print-text-black">SAR {Number(reportData.summary?.totalInvoiced || 0).toLocaleString()}</p>
                   </div>
                   <div className="p-5 bg-slate-900/60 rounded-2xl border border-white/5 print-border print:bg-white">
                      <p className="text-[10px] text-slate-400 print:text-black mb-1">{t("reports.actuallyPaidToContractors")}</p>
                     <p className="text-lg font-mono font-bold text-white print-text-black">SAR {Number(reportData.summary?.totalPaid || 0).toLocaleString()}</p>
                   </div>
                   <div className="p-5 bg-slate-900/60 rounded-2xl border border-white/5 print-border print:bg-white">
                      <p className="text-[10px] text-slate-400 print:text-black mb-1">{t("reports.remainingToPayContractors")}</p>
                     <p className="text-lg font-mono font-bold text-rose-400 print-text-black">SAR {Number(reportData.summary?.remaining || 0).toLocaleString()}</p>
                   </div>
                 </>
               )}

               {reportType === 'BOQ_PROGRESS' && (
                 <>
                   <div className="p-5 bg-slate-900/60 rounded-2xl border border-white/5 print-border print:bg-white">
                      <p className="text-[10px] text-slate-400 print:text-black mb-1">{t("reports.totalPlannedValue")}</p>
                     <p className="text-lg font-mono font-bold text-blue-400 print-text-black">SAR {Number(reportData.summary?.totalPlannedValue || 0).toLocaleString()}</p>
                   </div>
                   <div className="p-5 bg-slate-900/60 rounded-2xl border border-white/5 print-border print:bg-white">
                      <p className="text-[10px] text-slate-400 print:text-black mb-1">{t("reports.actualExecutedValue")}</p>
                     <p className="text-lg font-mono font-bold text-emerald-400 print-text-black">SAR {Number(reportData.summary?.totalExecutedValue || 0).toLocaleString()}</p>
                   </div>
                   <div className="p-5 bg-slate-900/60 rounded-2xl border border-white/5 print-border print:bg-white">
                      <p className="text-[10px] text-slate-400 print:text-black mb-1">{t("reports.remainingQuantityValue")}</p>
                     <p className="text-lg font-mono font-bold text-amber-400 print-text-black">SAR {Number(reportData.summary?.remainingValue || 0).toLocaleString()}</p>
                   </div>
                   <div className="p-5 bg-slate-900/60 rounded-2xl border border-white/5 print-border print:bg-white">
                      <p className="text-[10px] text-slate-400 print:text-black mb-1">{t("reports.overallProjectCompletion")}</p>
                     <p className="text-lg font-mono font-bold text-white print-text-black">{reportData.summary?.overallProgress || 0}%</p>
                   </div>
                 </>
               )}

               {(reportType === 'ACHIEVEMENT_RECORDS' || reportType === 'CLIENT_ACHIEVEMENT_RECORDS' || reportType === 'SUBCONTRACTOR_ACHIEVEMENT_RECORDS') && (
                 <>
                   <div className="p-5 bg-slate-900/60 rounded-2xl border border-white/5 print-border print:bg-white">
                      <p className="text-[10px] text-slate-400 print:text-black mb-1">{t("reports.certifiedRecordsCount")}</p>
                      <p className="text-lg font-mono font-bold text-indigo-400 print-text-black">{reportData.summary?.totalRecords || 0} {t("reports.record")}</p>
                     {reportType === 'ACHIEVEMENT_RECORDS' && (
                        <span className="text-[9px] text-slate-500">{t("reports.owners")}: {reportData.summary?.mainContractsRecordsCount || 0} | {t("reports.contractorsLabel")}: {reportData.summary?.subcontractsRecordsCount || 0}</span>
                     )}
                   </div>
                   <div className="p-5 bg-slate-900/60 rounded-2xl border border-white/5 print-border print:bg-white">
                      <p className="text-[10px] text-slate-400 print:text-black mb-1">{t("reports.totalCertifiedValue")}</p>
                     <p className="text-lg font-mono font-bold text-emerald-400 print-text-black">SAR {Number(reportData.summary?.totalCertifiedGross || 0).toLocaleString()}</p>
                   </div>
                   <div className="p-5 bg-slate-900/60 rounded-2xl border border-white/5 print-border print:bg-white">
                      <p className="text-[10px] text-slate-400 print:text-black mb-1">{t("reports.netCertifiedDues")}</p>
                     <p className="text-lg font-mono font-bold text-white print-text-black">SAR {Number(reportData.summary?.totalCertifiedNet || 0).toLocaleString()}</p>
                   </div>
                 </>
               )}

               {(reportType === 'CONTACTS' || reportType === 'CLIENT_CONTACTS' || reportType === 'SUPPLIER_CONTACTS') && (
                 <>
                   <div className="p-5 bg-slate-900/60 rounded-2xl border border-white/5 print-border print:bg-white">
                      <p className="text-[10px] text-slate-400 print:text-black mb-1">{t("reports.totalContactsCount")}</p>
                      <p className="text-lg font-mono font-bold text-indigo-400 print-text-black">{reportData.summary?.totalContacts || 0} {t("reports.entity")}</p>
                      {reportType === 'CONTACTS' && (
                        <span className="text-[9px] text-slate-500">{t("reports.clients")}: {reportData.summary?.clientsCount || 0} | {t("reports.suppliersLabel")}: {reportData.summary?.suppliersCount || 0}</span>
                     )}
                   </div>
                   {(reportType === 'CONTACTS' || reportType === 'CLIENT_CONTACTS') && (
                     <div className="p-5 bg-slate-900/60 rounded-2xl border border-white/5 print-border print:bg-white">
                        <p className="text-[10px] text-slate-400 print:text-black mb-1">{t("reports.clientSalesVolume")}</p>
                       <p className="text-lg font-mono font-bold text-emerald-400 print-text-black">SAR {Number(reportData.summary?.totalClientVolume || 0).toLocaleString()}</p>
                     </div>
                   )}
                   {(reportType === 'CONTACTS' || reportType === 'SUPPLIER_CONTACTS') && (
                     <div className="p-5 bg-slate-900/60 rounded-2xl border border-white/5 print-border print:bg-white">
                        <p className="text-[10px] text-slate-400 print:text-black mb-1">{t("reports.supplierContractorVolume")}</p>
                       <p className="text-lg font-mono font-bold text-rose-400 print-text-black">SAR {Number(reportData.summary?.totalSupplierVolume || 0).toLocaleString()}</p>
                     </div>
                   )}
                 </>
               )}

               {reportType === 'PURCHASES' && (
                 <>
                   <div className="p-5 bg-slate-900/60 rounded-2xl border border-white/5 print-border print:bg-white">
                      <p className="text-[10px] text-slate-400 print:text-black mb-1">{t("reports.purchaseOrdersCount")}</p>
                      <p className="text-lg font-mono font-bold text-indigo-400 print-text-black">{reportData.summary?.totalOrders || 0} {t("reports.order")}</p>
                   </div>
                   <div className="p-5 bg-slate-900/60 rounded-2xl border border-white/5 print-border print:bg-white">
                      <p className="text-[10px] text-slate-400 print:text-black mb-1">{t("reports.totalPurchaseExpenses")}</p>
                     <p className="text-lg font-mono font-bold text-rose-400 print-text-black">SAR {Number(reportData.summary?.totalSpent || 0).toLocaleString()}</p>
                   </div>
                 </>
               )}
            </div>

            {/* Print-friendly Charts (Visible only in Print/PDF) */}
            {showCharts && (
              <div className="hidden print:block mb-8">
                {reportType === 'FINANCIAL_SUMMARY' && (
                  <div className="grid grid-cols-2 gap-6">
                    <div className="border border-slate-200 p-4 rounded-2xl bg-slate-50">
                      <h4 className="text-[11px] font-black text-slate-800 mb-4 flex items-center gap-2">
                        {t("reports.printRevenueAnalysis")}
                      </h4>
                      <FinancialBarChart data={getFinancialChartData()} t={t} />
                    </div>
                    <div className="border border-slate-200 p-4 rounded-2xl bg-slate-50">
                      <h4 className="text-[11px] font-black text-slate-800 mb-4 flex items-center gap-2">
                        {t("reports.printExpenseAnalysis")}
                      </h4>
                  <ExpensesDonutChart data={getCostBreakdown()} t={t} />
                    </div>
                  </div>
                )}

                {reportType === 'BOQ_PROGRESS' && (
                  <div className="border border-slate-200 p-4 rounded-2xl bg-slate-50">
              <BoqProgressChart summary={reportData.summary} items={reportData.data || []} t={t} />
                  </div>
                )}

                {(reportType === 'CONTRACTS' || reportType === 'CLIENT_CONTRACTS' || reportType === 'SUBCONTRACTOR_CONTRACTS') && (
                  <div className="border border-slate-200 p-4 rounded-2xl bg-slate-50">
              <ContractsStackedBar summary={reportData.summary} t={t} />
                  </div>
                )}

                {(reportType === 'CONTACTS' || reportType === 'CLIENT_CONTACTS' || reportType === 'SUPPLIER_CONTACTS') && (
                  <div className="border border-slate-200 p-4 rounded-2xl bg-slate-50">
              <TopContactsChart data={reportData.data || []} t={t} />
                  </div>
                )}
              </div>
            )}

            {/* Client-side Search and Rows Metainfo (Hidden in Print) */}
            <div className="print-hide flex flex-col md:flex-row justify-between items-center gap-4 mb-4 bg-slate-950/30 p-4 rounded-2xl border border-white/5">
              <div className="relative w-full md:max-w-xs">
                <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t("reports.searchPlaceholder")}
                  className="w-full bg-slate-950/90 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-xl pr-9 pl-4 py-2 text-xs text-white outline-none transition-all placeholder-slate-500"
                />
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                {t("reports.showing")} {filteredAndSortedData.length} {t("reports.ofTotal")} {reportData.data?.length || 0} {t("reports.recordsAvailable")}
              </div>
            </div>

            {/* Report Details Table */}
            <div className="overflow-x-auto bg-slate-950/20 rounded-2xl border border-white/5 p-4 print:p-0 print:border-none shadow-inner">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-900/60 print:bg-slate-100 text-slate-300 print:text-black border-b border-white/10 print:border-black">
                    {reportType === 'FINANCIAL_SUMMARY' && (
                       <>
                          {renderSortHeader('date', t("reports.date"))}
                          {renderSortHeader('project', t("reports.project"))}
                          {renderSortHeader('type', t("reports.transactionType"))}
                          {renderSortHeader('amount', t("reports.flowAmount"))}
                       </>
                    )}
 
                    {(reportType === 'CONTRACTS' || reportType === 'CLIENT_CONTRACTS' || reportType === 'SUBCONTRACTOR_CONTRACTS') && (
                       <>
                          {renderSortHeader('referenceNumber', t("reports.contractRef"))}
                          {renderSortHeader('type', t("reports.contractType"))}
                          {renderSortHeader('project', t("reports.project"))}
                          {renderSortHeader('partyName', reportType === 'CLIENT_CONTRACTS' ? t("reports.clientOwner") : reportType === 'SUBCONTRACTOR_CONTRACTS' ? t("reports.subcontractorLabel") : t("reports.secondParty"))}
                          {renderSortHeader('totalValue', t("reports.contractValue"))}
                          {renderSortHeader('totalInvoiced', t("reports.certifiedInvoicesLabel"))}
                          {renderSortHeader('totalPaid', t("reports.actuallyPaid"))}
                          {renderSortHeader('remaining', t("reports.remaining"))}
                       </>
                    )}
 
                    {reportType === 'BOQ_PROGRESS' && (
                       <>
                          {renderSortHeader('description', t("reports.boqItem"))}
                          {renderSortHeader('project', t("reports.project"))}
                          {renderSortHeader('unitPrice', t("reports.unitPrice"))}
                          {renderSortHeader('plannedQty', t("reports.plannedQty"))}
                          {renderSortHeader('executedQty', t("reports.executedQty"))}
                          {renderSortHeader('remainingQty', t("reports.remainingQty"))}
                          {renderSortHeader('executedValue', t("reports.executedValue"))}
                          {renderSortHeader('completionPercentage', t("reports.completionPercent"))}
                       </>
                    )}
 
                    {(reportType === 'ACHIEVEMENT_RECORDS' || reportType === 'CLIENT_ACHIEVEMENT_RECORDS' || reportType === 'SUBCONTRACTOR_ACHIEVEMENT_RECORDS') && (
                       <>
                         <th className="px-2 py-3.5 font-bold print-hide"></th>
                          {renderSortHeader('invoiceNumber', t("reports.recordNumber"))}
                          {renderSortHeader('project', t("reports.project"))}
                          {renderSortHeader('contractType', t("reports.contractType"))}
                          {renderSortHeader('partyName', t("reports.secondParty"))}
                          {renderSortHeader('approvedAt', t("reports.approvalDate"))}
                          {renderSortHeader('approvedBy', t("reports.approvedBy"))}
                          {renderSortHeader('grossAmount', t("reports.grossAmount"))}
                          {renderSortHeader('netAmount', t("reports.netAmount"))}
                       </>
                    )}
 
                    {(reportType === 'CONTACTS' || reportType === 'CLIENT_CONTACTS' || reportType === 'SUPPLIER_CONTACTS') && (
                       <>
                          {renderSortHeader('name', t("reports.entityName"))}
                          {renderSortHeader('commercialName', t("reports.commercialReg"))}
                          {reportType === 'CONTACTS' && renderSortHeader('type', t("reports.contactType"))}
                          <th className="px-4 py-3.5 font-bold text-center">{t("reports.phoneEmail")}</th>
                          {renderSortHeader('projectsCount', t("reports.projects"))}
                          {renderSortHeader('contractsCount', t("reports.contractsOrders"))}
                          {renderSortHeader('volume', t("reports.totalVolume"))}
                       </>
                    )}
 
                    {reportType === 'PURCHASES' && (
                       <>
                          {renderSortHeader('date', t("reports.date"))}
                          {renderSortHeader('poNumber', t("reports.poNumber"))}
                          {renderSortHeader('project', t("reports.project"))}
                          {renderSortHeader('supplier', t("reports.supplier"))}
                          {renderSortHeader('taxAmount', t("reports.taxAmount"))}
                          {renderSortHeader('total', t("reports.totalCostSar"))}
                       </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 print:divide-black/10 text-slate-300 print-text-black">
                  {filteredAndSortedData.length > 0 ? filteredAndSortedData.map((row: any, i: number) => (
                    <tr key={row.id || i} className="hover:bg-slate-900/40 print:hover:bg-transparent transition-colors">
                      
                      {reportType === 'FINANCIAL_SUMMARY' && (
                        <>
                          <td className="px-4 py-3.5 font-mono text-[11px]">{new Date(row.date).toLocaleDateString('ar-SA')}</td>
                           <td className="px-4 py-3.5 font-bold text-white print-text-black">{row.project || t("reports.general")}</td>
                           <td className="px-4 py-3.5 text-slate-400 print-text-black">{row.type}</td>
                          <td className={`px-4 py-3.5 font-mono font-black text-left ${row.amount > 0 ? 'text-emerald-400 print-text-black' : 'text-rose-400 print-text-black'}`}>
                            {row.amount > 0 ? '+' : ''}{Number(row.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}
                          </td>
                        </>
                      )}

                      {(reportType === 'CONTRACTS' || reportType === 'CLIENT_CONTRACTS' || reportType === 'SUBCONTRACTOR_CONTRACTS') && (
                        <>
                          <td className="px-4 py-3.5 font-mono font-bold text-xs text-white print-text-black">{row.referenceNumber}</td>
                          <td className="px-4 py-3.5 text-[10px]">
                            <span className={`px-2 py-0.5 rounded font-bold ${row.type === 'MAIN_CONTRACT' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                              {row.type === 'MAIN_CONTRACT' ? t("reports.mainContract") : t("reports.subContract")}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 font-bold text-slate-400 print-text-black">{row.project}</td>
                          <td className="px-4 py-3.5 font-bold text-white print-text-black">{row.partyName}</td>
                          <td className="px-4 py-3.5 font-mono">{Number(row.totalValue).toLocaleString()}</td>
                          <td className="px-4 py-3.5 font-mono text-emerald-400 print-text-black font-semibold">{Number(row.totalInvoiced).toLocaleString()}</td>
                          <td className="px-4 py-3.5 font-mono text-blue-400 print-text-black">{Number(row.totalPaid).toLocaleString()}</td>
                          <td className="px-4 py-3.5 font-mono font-bold text-rose-400 print-text-black">{Number(row.remaining).toLocaleString()}</td>
                        </>
                      )}

                      {reportType === 'BOQ_PROGRESS' && (
                        <>
                          <td className="px-4 py-3.5">
                             <div className="font-bold text-white print-text-black truncate max-w-[200px]" title={row.description}>{row.description}</div>
                             <div className="text-[10px] text-slate-500 font-mono">{row.itemCode}</div>
                          </td>
                          <td className="px-4 py-3.5 font-bold text-slate-400 print-text-black">{row.project}</td>
                          <td className="px-4 py-3.5 font-mono">SAR {Number(row.unitPrice).toLocaleString()}</td>
                          <td className="px-4 py-3.5 font-mono font-bold">{row.plannedQty}</td>
                          <td className="px-4 py-3.5 font-mono text-emerald-400 print-text-black font-bold">{row.executedQty}</td>
                          <td className="px-4 py-3.5 font-mono text-rose-400 print-text-black">{row.remainingQty}</td>
                          <td className="px-4 py-3.5 font-mono text-white print-text-black font-semibold">{Number(row.executedValue).toLocaleString(undefined, {minimumFractionDigits: 1})}</td>
                          <td className="px-4 py-3.5 font-mono text-[11px]">
                             <div className="flex items-center gap-2 justify-start">
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
                          <td className="px-2 py-3.5 print-hide">
                            <button 
                              onClick={() => toggleInvoiceDetails(row.id)}
                              className="p-1 rounded-md hover:bg-slate-800 text-slate-400 transition-colors cursor-pointer"
                            >
                              {expandedInvoiceId === row.id ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                            </button>
                          </td>
                          <td className="px-4 py-3.5 font-mono font-bold text-white print-text-black">{row.invoiceNumber}</td>
                          <td className="px-4 py-3.5 font-bold text-slate-400 print-text-black">{row.project}</td>
                          <td className="px-4 py-3.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${row.contractType === 'MAIN_CONTRACT' ? 'bg-blue-500/10 text-blue-400' : 'bg-rose-500/10 text-rose-400'}`}>
                              {row.contractType === 'MAIN_CONTRACT' ? t("reports.ownerContract") : t("reports.subContract")}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 font-bold text-white print-text-black">{row.partyName}</td>
                          <td className="px-4 py-3.5 font-mono text-[11px]">{row.approvedAt ? new Date(row.approvedAt).toLocaleDateString('ar-SA') : new Date(row.issueDate).toLocaleDateString('ar-SA')}</td>
                          <td className="px-4 py-3.5 text-slate-400 print-text-black">{row.approvedBy}</td>
                          <td className="px-4 py-3.5 font-mono text-slate-400">{Number(row.grossAmount).toLocaleString(undefined, {minimumFractionDigits: 1})}</td>
                          <td className="px-4 py-3.5 font-mono font-bold text-emerald-400 print-text-black">{Number(row.netAmount).toLocaleString(undefined, {minimumFractionDigits: 1})}</td>
                        </>
                      )}

                      {(reportType === 'CONTACTS' || reportType === 'CLIENT_CONTACTS' || reportType === 'SUPPLIER_CONTACTS') && (
                        <>
                          <td className="px-4 py-3.5">
                            <div className="font-bold text-white print-text-black">{row.name}</div>
                            <div className="text-[10px] text-slate-500">{row.contactPerson !== '-' ? `${t("reports.contactPerson")}: ${row.contactPerson}` : ''}</div>
                          </td>
                          <td className="px-4 py-3.5 font-mono text-[11px]">{row.commercialName}</td>
                          {reportType === 'CONTACTS' && (
                            <td className="px-4 py-3.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${row.type === 'CLIENT' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                {row.type === 'CLIENT' ? t("reports.clientType") : t("reports.supplierType")}
                              </span>
                            </td>
                          )}
                          <td className="px-4 py-3.5 text-center font-mono text-[11px]">
                            <div>{row.phone}</div>
                            <div className="text-[10px] text-slate-500">{row.email}</div>
                          </td>
                          <td className="px-4 py-3.5 font-mono text-center font-semibold">{row.projectsCount}</td>
                          <td className="px-4 py-3.5 font-mono text-center text-slate-400">{row.contractsCount}</td>
                          <td className="px-4 py-3.5 font-mono font-bold text-white print-text-black">{Number(row.volume).toLocaleString()}</td>
                        </>
                      )}

                      {reportType === 'PURCHASES' && (
                        <>
                          <td className="px-4 py-3.5 font-mono text-[11px]">{new Date(row.date).toLocaleDateString('ar-SA')}</td>
                          <td className="px-4 py-3.5 font-mono font-bold text-white print-text-black">{row.poNumber}</td>
                           <td className="px-4 py-3.5 font-bold text-slate-400 print-text-black">{row.project || t("reports.general")}</td>
                           <td className="px-4 py-3.5 text-white print-text-black">{row.supplier}</td>
                          <td className="px-4 py-3.5 font-mono text-slate-500">{Number(row.taxAmount).toLocaleString()}</td>
                          <td className="px-4 py-3.5 font-mono font-bold text-rose-400 print-text-black">{Number(row.total).toLocaleString()}</td>
                        </>
                      )}
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={12} className="px-4 py-12 text-center text-slate-500 print:text-black">{t("reports.noMatchingRecords")}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Collapse row content details drawer */}
            <AnimatePresence>
              {(reportType === 'ACHIEVEMENT_RECORDS' || reportType === 'CLIENT_ACHIEVEMENT_RECORDS' || reportType === 'SUBCONTRACTOR_ACHIEVEMENT_RECORDS') && 
               expandedInvoiceId && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: "auto" }} 
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 p-5 bg-slate-950/60 rounded-2xl border border-indigo-500/20 print:bg-white print:border-black/10"
                >
                  {(() => {
                    const selectedRow = reportData.data.find((r: any) => r.id === expandedInvoiceId);
                    if (!selectedRow) return null;
                    return (
                      <div className="space-y-4">
                        <h4 className="text-xs font-black text-indigo-400 print-text-black flex items-center gap-2 font-bold">
                          <Award size={14} /> {t("reports.itemsQuantitiesDetails")} ({selectedRow.invoiceNumber}):
                        </h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-right text-[11px] bg-slate-900/40 print:bg-white rounded-xl overflow-hidden border border-white/5 print:border-black/10">
                            <thead>
                              <tr className="bg-slate-900/80 print:bg-slate-200 text-slate-400 print:text-black font-bold">
                                <th className="px-3 py-2.5">{t("reports.boqCode")}</th>
                                <th className="px-3 py-2.5 text-center">{t("reports.unit")}</th>
                                <th className="px-3 py-2.5 text-center">{t("reports.categoryPrice")}</th>
                                <th className="px-3 py-2.5 text-center">{t("reports.prevQty")}</th>
                                <th className="px-3 py-2.5 text-center text-indigo-400 print-text-black">{t("reports.currentQty")}</th>
                                <th className="px-3 py-2.5 text-center">{t("reports.totalQty")}</th>
                                <th className="px-3 py-2.5 text-left">{t("reports.currentValueSar")}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 print:divide-black/10 text-slate-300 print-text-black">
                              {selectedRow.details.map((detail: any, dIdx: number) => (
                                <tr key={dIdx} className="hover:bg-slate-900/20">
                                  <td className="px-3 py-2.5">
                                    <span className="font-bold text-white print-text-black block">{detail.description}</span>
                                    <span className="text-[9px] text-slate-500 font-mono">{detail.itemCode}</span>
                                  </td>
                                  <td className="px-3 py-2.5 text-center text-slate-400">{detail.unit}</td>
                                  <td className="px-3 py-2.5 text-center font-mono">SAR {Number(detail.unitPrice).toLocaleString()}</td>
                                  <td className="px-3 py-2.5 text-center font-mono">{detail.previousQty}</td>
                                  <td className="px-3 py-2.5 text-center font-mono font-bold text-indigo-400 print-text-black">{detail.currentQty}</td>
                                  <td className="px-3 py-2.5 text-center font-mono">{detail.totalQty}</td>
                                  <td className="px-3 py-2.5 text-left font-mono font-bold text-white print-text-black">SAR {Number(detail.currentValue).toLocaleString()}</td>
                                </tr>
                              ))}
                              {selectedRow.details.length === 0 && (
                                <tr>
                                  <td colSpan={7} className="px-3 py-6 text-center text-slate-500">{t("reports.noDetailsRecorded")}</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })()}
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Signature & Certified blocks at the bottom of the printed report */}
            <div className="mt-12 pt-8 border-t border-dashed border-white/20 print:border-black/20 flex flex-col sm:flex-row justify-between items-center gap-6 print-text-black">
              <p className="text-[10px] text-slate-500 print-text-black">{t("reports.reportGeneratedBy")} {company?.nameAr || 'PMS Contracting'}</p>
              <div className="flex gap-12 text-xs font-bold text-slate-400 print-text-black">
                <span>{t("reports.preparedByFinance")}</span>
                <span>{t("reports.approvedByPM")}</span>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
