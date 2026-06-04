"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FilePlus, 
  Save, 
  ArrowRight, 
  Loader2, 
  Plus,
  Trash2,
  ListOrdered,
  Printer,
  Building2,
  FileSignature,
  FileText,
  ScrollText,
  Wand2,
  CheckCircle2,
  FileSpreadsheet,
  LayoutTemplate,
  Link2Off,
  Edit3,
  AlertCircle,
  X
} from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";
import { exportToCsv } from "@/lib/exportUtils";
import { useDownloadPdf } from "@/hooks/useDownloadPdf";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import PrintLetterhead from "../../components/PrintLetterhead";
import { useCompany } from "@/context/CompanyContext";
import { useLanguage } from "@/lib/i18n/context";

export default function EditQuotationPage() {
  const { t } = useLanguage();
  const { company } = useCompany();
  const router = useRouter();
  const params = useParams();
  const quotationId = params.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [printMeta, setPrintMeta] = useState({ date: "", ref: "" });
  
  const [userPerms, setUserPerms] = useState<string[]>([]);
  const [userRole, setUserRole] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    clientName: "",
    hasVat: false,
    technicalOffer: "",
    termsConditions: "",
    status: "DRAFT",
    projectId: null as string | null,
    createdBy: "",
    approvedBy: "",
    approvedAt: "",
    createdAt: "",
    updatedAt: "",
    items: [{ itemCode: "01", description: "", unit: "م٢", quantity: 1, unitPrice: 0 }]
  });

  const [isReverting, setIsReverting] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [templateFormData, setTemplateFormData] = useState({ name: "", technicalOffer: "", termsConditions: "" });
  const [isTemplateFormOpen, setIsTemplateFormOpen] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [templateMessage, setTemplateMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const [isDeletingTemplate, setIsDeletingTemplate] = useState(false);
  const { pdfRef, downloadPdf } = useDownloadPdf();
  const pdfRef2 = useRef<HTMLDivElement>(null);

  const downloadQuotationPdf = async () => {
    const el1 = pdfRef.current;
    const el2 = pdfRef2.current;
    if (!el1 || !el2) return;

    el1.classList.remove("hidden");
    el1.classList.add("print:block");
    el2.classList.remove("hidden");
    el2.classList.add("print:block");

    try {
      const dataUrl1 = await toPng(el1, { quality: 1, pixelRatio: 2 });
      const dataUrl2 = await toPng(el2, { quality: 1, pixelRatio: 2 });

      const imgWidth = 210;
      const pageHeight = 297;

      const img1 = new Image();
      img1.src = dataUrl1;
      await new Promise((resolve) => { img1.onload = resolve; });

      const img2 = new Image();
      img2.src = dataUrl2;
      await new Promise((resolve) => { img2.onload = resolve; });

      const imgHeight1 = (img1.height * imgWidth) / img1.width;
      const imgHeight2 = (img2.height * imgWidth) / img2.width;

      const pdf = new jsPDF("p", "mm", "a4");
      const THRESHOLD = 10;

      const addImageWithSlicing = (dataUrl: string, imgHeight: number) => {
        let heightLeft = imgHeight;
        let pos = 0;
        pdf.addImage(dataUrl, "PNG", 0, pos, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        while (heightLeft > THRESHOLD) {
          pos = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(dataUrl, "PNG", 0, pos, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
      };

      // Page 1 — financial table
      addImageWithSlicing(dataUrl1, imgHeight1);

      // Page 2 — scope, terms, signatures
      pdf.addPage();
      addImageWithSlicing(dataUrl2, imgHeight2);

      pdf.save(`Quotation_${printMeta.ref || 'draft'}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      el1.classList.add("hidden");
      el1.classList.remove("print:block");
      el2.classList.add("hidden");
      el2.classList.remove("print:block");
    }
  };

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        setUserPerms(u.permissions || []);
        setUserRole(u.role || "");
      } catch (e) {}
    }

    if (quotationId) {
      fetchQuotation();
    }
    fetchTemplates();
  }, [quotationId]);

  const fetchTemplates = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/v1/quotation-templates`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTemplates(res.data || []);
    } catch {}
  };

  const openCreateTemplate = () => {
    setTemplateFormData({
      name: "",
      technicalOffer: formData.technicalOffer || "",
      termsConditions: formData.termsConditions || ""
    });
    setEditingTemplateId(null);
    setTemplateMessage(null);
    setIsTemplateFormOpen(true);
  };

  const openEditTemplate = (t: any) => {
    setTemplateFormData({
      name: t.name || "",
      technicalOffer: t.technicalOffer || "",
      termsConditions: t.termsConditions || ""
    });
    setEditingTemplateId(t.id);
    setTemplateMessage(null);
    setIsTemplateFormOpen(true);
  };

  const handleSaveTemplate = async () => {
    if (!templateFormData.name.trim()) {
      setTemplateMessage({ type: 'error', text: 'الرجاء إدخال اسم القالب' });
      return;
    }
    try {
      setIsSavingTemplate(true);
      setTemplateMessage(null);
      const token = localStorage.getItem("token");
      if (editingTemplateId) {
        await axios.patch(`${API_BASE_URL}/v1/quotation-templates/${editingTemplateId}`, templateFormData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_BASE_URL}/v1/quotation-templates`, templateFormData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setTemplateMessage({ type: 'success', text: editingTemplateId ? 'تم تحديث القالب بنجاح' : 'تم إنشاء القالب بنجاح' });
      fetchTemplates();
      setTimeout(() => { setIsTemplateFormOpen(false); setTemplateMessage(null); }, 1000);
    } catch (err: any) {
      setTemplateMessage({ type: 'error', text: err.response?.data?.message || 'حدث خطأ أثناء حفظ القالب' });
    } finally {
      setIsSavingTemplate(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      setIsDeletingTemplate(true);
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/v1/quotation-templates/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTemplateToDelete(null);
      fetchTemplates();
    } catch {
      setTemplateMessage({ type: 'error', text: 'حدث خطأ أثناء حذف القالب' });
    } finally {
      setIsDeletingTemplate(false);
    }
  };

  const hasPermission = (perm: string) => {
    if (userRole === "Admin" || userRole === "System Admin") return true;
    return userPerms.includes(perm);
  };

  const fetchQuotation = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/v1/quotations/${quotationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const q = res.data;
      setFormData({
        title: q.title || "",
        clientName: q.client?.name || "",
        hasVat: q.hasVat || false,
        technicalOffer: q.technicalOffer || "",
        termsConditions: q.termsConditions || "",
        status: q.status || "DRAFT",
        projectId: q.projectId || null,
        createdBy: q.createdBy || "",
        approvedBy: q.approvedBy || "",
        approvedAt: q.approvedAt || "",
        createdAt: q.createdAt || "",
        updatedAt: q.updatedAt || "",
        items: q.items?.length > 0 ? q.items.map((i: any) => ({
          itemCode: i.itemCode,
          description: i.description,
          unit: i.unit,
          quantity: i.quantity,
          unitPrice: i.unitPrice
        })) : [{ itemCode: "01", description: "", unit: "م٢", quantity: 1, unitPrice: 0 }]
      });

      setPrintMeta({
        date: new Date(q.createdAt || new Date()).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' }),
        ref: q.quotationNumber
      });
    } catch (err) {
      console.error(err);
      alert("تعذر جلب بيانات عرض السعر.");
      router.push("/dashboard/quotations");
    } finally {
      setIsFetching(false);
    }
  };

  const calculateSubTotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const calculateVat = () => {
    return formData.hasVat ? calculateSubTotal() * 0.15 : 0;
  };

  const calculateTotal = () => {
    return calculateSubTotal() + calculateVat();
  };

  const handleAddItem = () => {
    const nextCode = (formData.items.length + 1).toString().padStart(2, '0');
    setFormData({
      ...formData,
      items: [...formData.items, { itemCode: nextCode, description: "", unit: "م٢", quantity: 1, unitPrice: 0 }]
    });
  };

  const handleRemoveItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    const reindexedItems = newItems.map((item, i) => ({
      ...item,
      itemCode: (i + 1).toString().padStart(2, '0')
    }));
    setFormData({ ...formData, items: reindexedItems });
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      // Only send editable fields
      const { projectId, createdBy, approvedBy, approvedAt, createdAt, updatedAt, ...payload } = formData;
      await axios.patch(
        `${API_BASE_URL}/v1/quotations/${quotationId}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("تم تحديث عرض السعر بنجاح!");
      fetchQuotation();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data || err.message || "خطأ غير معروف";
      alert(typeof msg === 'string' ? msg : JSON.stringify(msg, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  const handleConvertToProject = async () => {
    if (!confirm("هل أنت متأكد من تحويل عرض السعر لاعتماد وإنشاء مشروع تنفيذي؟")) return;
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_BASE_URL}/v1/quotations/${quotationId}/convert`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("🎉 تم إنشاء المشروع بنجاح من عرض السعر!");
      fetchQuotation();
    } catch (err) {
      alert("فشل تحويل عرض السعر لمشروع.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlink = async () => {
    if (!confirm("هل أنت متأكد من فك ارتباط عرض السعر بالمشروع يدوياً؟ سيتحول العرض لمسودة.")) return;
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_BASE_URL}/v1/quotations/${quotationId}/unlink`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("تم فك الارتباط بنجاح. يمكنك الآن تعديل العرض أو حذفه.");
      fetchQuotation();
    } catch (err: any) {
      alert("فشل فك الارتباط. تأكد من تحديث النظام.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevertToDraft = async () => {
    if (!confirm("هل أنت متأكد من إرجاع عرض السعر إلى مسودة؟")) return;
    setIsReverting(true);
    try {
      const token = localStorage.getItem("token");
      await axios.patch(`${API_BASE_URL}/v1/quotations/${quotationId}/revert-to-draft`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("تم إرجاع عرض السعر إلى مسودة.");
      fetchQuotation();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "فشل الإرجاع";
      alert(msg);
    } finally {
      setIsReverting(false);
    }
  };

  const handleDeleteQuotation = async () => {
    if (!confirm("هل أنت متأكد من حذف عرض السعر بشكل نهائي؟ هذا الإجراء لا يمكن التراجع عنه.")) return;
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/v1/quotations/${quotationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("تم حذف عرض السعر بنجاح.");
      router.push("/dashboard/quotations");
    } catch (err: any) {
      alert(err.response?.data?.message || "فشل حذف عرض السعر.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    if (!formData.items || formData.items.length === 0) return;
    const exportData = formData.items.map((item: any) => ({
      [t("common.no")]: item.itemCode,
      [t("common.description")]: item.description,
      [t("common.unit")]: item.unit,
      [t("common.quantity")]: item.quantity,
      [t("boq.unitPrice")]: item.unitPrice,
      [t("boq.printTotal")]: item.quantity * item.unitPrice
    }));
    exportToCsv(`Quotation_${printMeta.ref || 'Draft'}.csv`, exportData);
  };

  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] print:hidden">
         <Loader2 className="animate-spin text-pink-500 mb-4" size={48} />
         <p className="text-slate-400 font-bold tracking-widest text-sm">{t("quotations.loadingQuotation")}</p>
      </div>
    );
  }

  const isEditable = formData.status !== 'APPROVED' || hasPermission('QUOTATION_FORCE_EDIT');

  return (
    <>
      <style>{`
        #pdf-page-1, #pdf-page-2 {
          width: 210mm !important;
          min-height: 297mm !important;
          max-height: 297mm !important;
          overflow: hidden !important;
          box-sizing: border-box !important;
          padding: 130px 40px 90px !important;
        }
      `}</style>
      <div className="max-w-[1600px] mx-auto space-y-8 w-full animate-in fade-in zoom-in-95 duration-500 pb-12 print:hidden relative">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none -z-10" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <button onClick={() => router.back()} className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-slate-300 hover:text-white transition-all shadow-lg hover:-translate-x-1">
              <ArrowRight size={22} />
            </button>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3 drop-shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-blue-500/10 flex items-center justify-center border border-indigo-500/20 shadow-lg">
                  <FileText className="text-indigo-400" size={24} />
                </div>
                {t("quotations.editTitle")}
              </h1>
              <p className="text-slate-400 text-sm mt-2 font-medium flex items-center gap-2 font-mono">
                {printMeta.ref} - {formData.clientName}
                {formData.projectId && (
                  <span className="bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full text-xs font-bold border border-emerald-500/20 flex items-center gap-1">
                    <CheckCircle2 size={14} /> {t("quotations.convertedToProject")}
                  </span>
                )}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-3 bg-slate-900/50 p-1.5 rounded-xl border border-white/5">
              <span className="text-sm font-bold text-slate-400 mr-2">{t("quotations.statusLabel")}</span>
              <select 
                value={formData.status} 
                onChange={e => setFormData({...formData, status: e.target.value})}
                disabled={!!formData.projectId || !hasPermission('QUOTATION_APPROVE')}
                className={`bg-slate-950 border rounded-lg px-3 py-1.5 text-sm font-bold outline-none transition-colors appearance-none ${hasPermission('QUOTATION_APPROVE') ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'} ${
                  formData.status === 'APPROVED' ? 'text-emerald-400 border-emerald-500/30' : 
                  formData.status === 'REJECTED' ? 'text-rose-400 border-rose-500/30' : 
                  formData.status === 'SUBMITTED' ? 'text-blue-400 border-blue-500/30' : 
                  'text-slate-300 border-slate-700'
                }`}
              >
                <option value="DRAFT">{t("invoice.status.draft")} (Draft)</option>
                <option value="SUBMITTED">{t("invoice.status.submitted")} (Submitted)</option>
                <option value="APPROVED">{t("invoice.status.certified")} (Approved)</option>
                <option value="REJECTED">{t("expense.status.rejected")} (Rejected)</option>
              </select>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {formData.status === 'APPROVED' && !formData.projectId && hasPermission('QUOTATION_APPROVE') && (
                <button type="button" onClick={handleConvertToProject} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-black bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] transition-all animate-pulse text-sm">
                  <Wand2 size={18} /> {t("quotations.convertProject")}
                </button>
              )}
              {formData.status === 'APPROVED' && !formData.projectId && hasPermission('QUOTATION_CREATE') && (
                <button type="button" onClick={handleRevertToDraft} disabled={isReverting} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-slate-500/30 bg-slate-500/10 hover:bg-slate-500/20 text-slate-400 font-bold transition-all shadow-lg text-sm">
                  <ArrowRight size={18} /> {isReverting ? t("quotations.reverting") : t("quotations.revertToDraft")}
                </button>
              )}
              <button type="button" onClick={handleExportExcel} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold transition-all shadow-lg text-sm">
                <FileSpreadsheet size={18} /> {t("quotations.exportExcel")}
              </button>
              <button type="button" onClick={downloadQuotationPdf} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold transition-all shadow-lg text-sm">
                <Printer size={18} /> {t("quotations.pdfButton")}
              </button>
              <button type="button" onClick={handlePrint} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-bold transition-all shadow-lg text-sm">
                <Printer size={18} /> {t("quotations.printPreview")}
              </button>
              {isEditable && hasPermission('QUOTATION_CREATE') && (
                <button onClick={handleSubmit} disabled={isLoading} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] transition-all hover:-translate-y-1 text-sm disabled:opacity-50">
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} {t("quotations.saveBtn")}
                </button>
              )}
              {formData.status !== 'APPROVED' && hasPermission('QUOTATION_CREATE') && (
                <button type="button" onClick={handleDeleteQuotation} disabled={isLoading} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold transition-all shadow-lg text-sm">
                  <Trash2 size={18} /> {t("quotations.deleteQuotation")}
                </button>
              )}
              {formData.status === 'APPROVED' && hasPermission('QUOTATION_FORCE_DELETE') && (
                <div className="flex gap-2 w-full sm:w-auto">
                  {formData.projectId && (
                    <button type="button" onClick={handleUnlink} disabled={isLoading} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold transition-all shadow-lg text-sm" title={t("quotations.unlinkTitle")}>
                      <Link2Off size={18} /> {t("quotations.unlink")}
                    </button>
                  )}
                  <button type="button" onClick={handleDeleteQuotation} disabled={isLoading} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold transition-all shadow-lg text-sm">
                    <Trash2 size={18} /> {t("quotations.deleteQuotation")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-dark border border-white/5 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-teal-400 opacity-50" />
          
          <form className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-900/40 p-6 rounded-2xl border border-white/5 shadow-inner">
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Building2 size={14} className="text-indigo-400" />
                  {t("quotations.clientLabel")}
                </label>
                <input 
                  type="text" 
                  required 
                  disabled={!isEditable}
                  value={formData.clientName} 
                  onChange={e => setFormData({...formData, clientName: e.target.value})} 
                  className={`w-full bg-slate-950/50 border border-slate-700/80 rounded-xl py-3.5 px-4 text-white text-base placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all shadow-inner ${!isEditable ? 'opacity-60 cursor-not-allowed' : ''}`} 
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <FileSignature size={14} className="text-indigo-400" />
                  {t("quotations.titleLabel")}
                </label>
                <input 
                  type="text" 
                  required 
                  disabled={!isEditable}
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  className={`w-full bg-slate-950/50 border border-slate-700/80 rounded-xl py-3.5 px-4 text-white text-base placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all shadow-inner ${!isEditable ? 'opacity-60 cursor-not-allowed' : ''}`} 
                />
              </div>

              <div className="md:col-span-2 space-y-3 pt-2">
                <label className="flex items-center gap-3 bg-slate-950/80 border border-slate-800 p-4 rounded-xl cursor-pointer hover:border-indigo-500/30 transition-colors w-max">
                  <input 
                    type="checkbox" 
                    disabled={!isEditable}
                    checked={formData.hasVat} 
                    onChange={e => setFormData({...formData, hasVat: e.target.checked})}
                    className={`w-5 h-5 rounded accent-indigo-500 border-slate-700 ${!isEditable ? 'opacity-60 cursor-not-allowed' : ''}`} 
                  />
                  <span className={`font-bold text-sm ${!isEditable ? 'text-slate-400' : 'text-white'}`}>{t("quotations.vatLabel")}</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-900/40 p-6 rounded-2xl border border-white/5 shadow-inner relative">
               {/* Template Selector Float */}
               <div className="md:col-span-2 flex justify-end mb-2">
                  <div className="relative">
                     <button 
                       type="button"
                       disabled={!isEditable}
                       onClick={() => setShowTemplates(!showTemplates)}
                       className={`flex items-center gap-2 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-xl text-indigo-400 text-xs font-bold transition-all shadow-lg ${!isEditable ? 'opacity-50 cursor-not-allowed' : ''}`}
                     >
                       <LayoutTemplate size={14} />
                       {showTemplates ? t("quotations.templateClose") : t("quotations.templateOpen")}
                     </button>

                     <AnimatePresence>
                       {showTemplates && (
                         <motion.div 
                           initial={{ opacity: 0, y: 10, scale: 0.95 }}
                           animate={{ opacity: 1, y: 0, scale: 1 }}
                           exit={{ opacity: 0, y: 10, scale: 0.95 }}
                           className="absolute left-0 top-full mt-2 w-80 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl z-50 p-2 overflow-hidden"
                         >
                            <div className="p-3 border-b border-white/5 mb-1 flex items-center justify-between">
                               <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t("quotations.templateSelectorTitle")}</h4>
                               <button
                                 type="button"
                                 onClick={openCreateTemplate}
                                 className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-400 text-[10px] font-bold transition-all"
                               >
                                 <Plus size={12} /> {t("quotations.saveAsTemplate")}
                               </button>
                            </div>
                            <div className="max-h-64 overflow-y-auto custom-scrollbar">
                               {templates.length === 0 ? (
                                 <p className="p-4 text-xs text-slate-600 text-center italic">{t("quotations.noTemplates")}</p>
                               ) : (
                                 templates.map(t => (
                                   <div
                                     key={t.id}
                                     className="flex items-center gap-1 p-1 hover:bg-white/5 rounded-xl transition-colors group"
                                   >
                                     <button
                                       type="button"
                                       onClick={() => {
                                         setFormData({
                                           ...formData,
                                           technicalOffer: t.technicalOffer || "",
                                           termsConditions: t.termsConditions || ""
                                         });
                                         setShowTemplates(false);
                                       }}
                                       className="flex-1 text-right p-2 rounded-lg"
                                     >
                                       <p className="text-sm font-bold text-slate-300 group-hover:text-indigo-400">{t.name}</p>
                                       <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{t.technicalOffer?.substring(0, 35)}...</p>
                                     </button>
                                     <button
                                       type="button"
                                       onClick={() => { openEditTemplate(t); setShowTemplates(false); }}
                                       className="p-1.5 text-slate-600 hover:text-indigo-400 hover:bg-white/5 rounded-lg transition-all"
                                       title={t("common.edit")}
                                     >
                                       <Edit3 size={13} />
                                     </button>
                                     <button
                                       type="button"
                                       onClick={() => setTemplateToDelete(t.id)}
                                       className="p-1.5 text-slate-600 hover:text-rose-400 hover:bg-white/5 rounded-lg transition-all"
                                       title={t("common.delete")}
                                     >
                                       <Trash2 size={13} />
                                     </button>
                                   </div>
                                 ))
                               )}
                            </div>
                         </motion.div>
                       )}
                     </AnimatePresence>
                  </div>
               </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <FileText size={14} className="text-indigo-400" />
                  {t("quotations.technicalOffer")}
                </label>
                <textarea 
                  rows={4}
                  disabled={!isEditable}
                  value={formData.technicalOffer} 
                  onChange={e => setFormData({...formData, technicalOffer: e.target.value})} 
                  className={`w-full bg-slate-950/50 border border-slate-700/80 rounded-xl py-3.5 px-4 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all shadow-inner resize-y min-h-[120px] ${!isEditable ? 'opacity-60 cursor-not-allowed' : ''}`} 
                  placeholder={t("quotations.technicalOfferPlaceholder")} 
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <ScrollText size={14} className="text-indigo-400" />
                  {t("quotations.termsConditions")}
                </label>
                <textarea 
                  rows={4}
                  disabled={!isEditable}
                  value={formData.termsConditions} 
                  onChange={e => setFormData({...formData, termsConditions: e.target.value})} 
                  className={`w-full bg-slate-950/50 border border-slate-700/80 rounded-xl py-3.5 px-4 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all shadow-inner resize-y min-h-[120px] ${!isEditable ? 'opacity-60 cursor-not-allowed' : ''}`} 
                  placeholder={t("quotations.termsConditionsPlaceholder")} 
                />
              </div>
            </div>

            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <h3 className="font-extrabold text-xl text-white flex items-center gap-2 drop-shadow-sm">
                  <ListOrdered className="text-indigo-400" size={24} />
                  {t("quotations.itemsTitle")}
                </h3>
                {isEditable && (
                  <button type="button" onClick={handleAddItem} className="flex items-center gap-2 text-sm font-bold text-indigo-400 hover:text-white bg-indigo-500/10 hover:bg-indigo-500 border border-indigo-500/20 hover:border-indigo-500 px-4 py-2 rounded-xl transition-all shadow-lg hover:shadow-[0_0_15px_rgba(79,70,229,0.5)]">
                    <Plus size={18} /> {t("quotations.addItem")}
                  </button>
                )}
              </div>

              <div className="hidden lg:grid grid-cols-12 gap-4 px-4 pb-2 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">
                <div className="col-span-1">{t("quotations.colItemCode")}</div>
                <div className="col-span-4 text-right">{t("quotations.colDescriptionWide")}</div>
                <div className="col-span-2">{t("quotations.colUnitShort")}</div>
                <div className="col-span-1">{t("quotations.colQtyShort")}</div>
                <div className="col-span-2">{t("quotations.colUnitPriceShort")}</div>
                <div className="col-span-2 text-left">{t("quotations.colTotalShort")}</div>
              </div>

              <div className="space-y-3">
                {formData.items.map((item, index) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={index} 
                    className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 p-4 lg:p-3 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-2xl items-center transition-colors group relative"
                  >
                    <div className="col-span-1">
                       <input type="text" value={item.itemCode} onChange={e => handleItemChange(index, "itemCode", e.target.value)} className="w-full bg-slate-900/80 border border-slate-700/50 rounded-lg py-2.5 px-3 text-sm text-center text-slate-500 font-mono font-bold" readOnly />
                    </div>
                    <div className="col-span-1 lg:col-span-4">
                       <input type="text" required disabled={!isEditable} value={item.description} onChange={e => handleItemChange(index, "description", e.target.value)} className={`w-full bg-slate-900/50 border border-slate-700/50 rounded-lg py-2.5 px-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium ${!isEditable ? 'opacity-60 cursor-not-allowed' : ''}`} />
                    </div>
                    <div className="col-span-1 lg:col-span-2">
                       <input type="text" required disabled={!isEditable} list={`units-list-${index}`} value={item.unit} onChange={e => handleItemChange(index, "unit", e.target.value)} className={`w-full bg-slate-900/50 border border-slate-700/50 rounded-lg py-2.5 px-3 text-sm text-center text-slate-300 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all ${!isEditable ? 'opacity-60 cursor-not-allowed' : ''}`} />
                       <datalist id={`units-list-${index}`}>
                         <option value="م٢" />
                         <option value="م.ط" />
                         <option value="م٣" />
                         <option value="مقطوعية" />
                         <option value="عدد" />
                         <option value="حبة" />
                         <option value="كجم" />
                         <option value="طن" />
                         <option value="يوم" />
                         <option value="شهر" />
                         <option value="ساعة" />
                         <option value="لفة" />
                       </datalist>
                    </div>
                    <div className="col-span-1">
                       <input type="number" required disabled={!isEditable} min="1" step="any" value={item.quantity || ''} onChange={e => handleItemChange(index, "quantity", Number(e.target.value))} className={`w-full bg-slate-900/50 border border-slate-700/50 rounded-lg py-2.5 px-2 text-sm text-center text-emerald-300 font-mono font-bold focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all ${!isEditable ? 'opacity-60 cursor-not-allowed' : ''}`} />
                    </div>
                    <div className="col-span-1 lg:col-span-2">
                       <input type="number" required disabled={!isEditable} min="0" step="any" value={item.unitPrice || ''} onChange={e => handleItemChange(index, "unitPrice", Number(e.target.value))} className={`w-full bg-slate-900/50 border border-slate-700/50 rounded-lg py-2.5 px-3 text-sm text-center text-rose-300 font-mono font-bold focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all ${!isEditable ? 'opacity-60 cursor-not-allowed' : ''}`} />
                    </div>
                    <div className="col-span-1 lg:col-span-2 flex items-center gap-2">
                      <div className="flex-1 bg-slate-900/80 py-2.5 px-3 rounded-lg text-left font-black text-white font-mono text-sm border border-slate-700/50 shadow-inner group-hover:bg-slate-800 transition-colors">
                        {(item.quantity * item.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      {isEditable && (
                        <button type="button" onClick={() => handleRemoveItem(index)} className="p-2.5 text-rose-500 hover:text-white hover:bg-rose-500 rounded-lg transition-all" title={t("quotations.deleteItemTitle")}>
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 md:px-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden space-y-4">
               <div className="absolute inset-0 bg-indigo-500/5 mix-blend-overlay" />
               <div className="relative z-10 flex justify-between items-center border-b border-white/5 pb-4">
                 <span className="text-slate-400 font-bold">{t("quotations.subtotal")}</span>
                 <span className="font-mono text-xl text-white">{calculateSubTotal().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SAR</span>
               </div>
               {formData.hasVat && (
                 <div className="relative z-10 flex justify-between items-center border-b border-white/5 pb-4">
                   <span className="text-slate-400 font-bold text-indigo-400">{t("quotations.vatDisplay")}</span>
                   <span className="font-mono text-xl text-indigo-400">{calculateVat().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SAR</span>
                 </div>
               )}
               <div className="relative z-10 flex justify-between items-center flex-col md:flex-row gap-4 pt-2">
                 <div>
<h4 className="text-xl font-bold text-white mb-1">{t("quotations.totalAmount")}</h4>
                    <p className="text-sm text-slate-400">{t("quotations.netTotal")}</p>
                 </div>
                 <div className="flex items-baseline gap-2">
                   <span className="text-slate-400 font-bold tracking-widest text-sm">SAR</span>
                   <span className="font-mono text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-white drop-shadow-[0_0_15px_rgba(79,70,229,0.5)]">
                     {calculateTotal().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                   </span>
                 </div>
               </div>
            </div>
          </form>
        </motion.div>
      </div>

      <div ref={pdfRef} id="pdf-page-1" className="hidden print:block print-on-letterhead text-black font-sans bg-white" dir="rtl">
        {/* ===== الورقة الرسمية كخلفية ===== */}
        <PrintLetterhead />

        {/* ===== Page 1 content wrapper ===== */}
        <div className="pt-20 px-8 flex flex-col" style={{ minHeight: 'calc(297mm - 130px - 90px)' }}>
          <div className="flex-1">

        <div className="mb-8 flex justify-between items-start">
          <h1 className="text-3xl font-black text-slate-900">عرض سعر — Quotation</h1>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <p className="text-sm font-bold text-slate-800">رقم العرض (Ref): <span className="font-mono text-indigo-700">{printMeta.ref}</span></p>
            <p className="text-sm font-bold text-slate-800 mt-1">تاريخ الإصدار (Date): <span className="font-mono">{printMeta.date}</span></p>
          </div>
        </div>

        <div className="mb-10 grid grid-cols-2 gap-8 text-sm">
           <div className="bg-white p-4 border-2 border-slate-200 rounded-lg shadow-sm">
              <p className="text-slate-500 font-bold mb-2 uppercase text-xs tracking-wider border-b border-slate-100 pb-2">عناية العميل (Billed To):</p>
              <h2 className="text-xl font-black text-slate-900">{formData.clientName || '_______________'}</h2>
           </div>
           <div className="bg-white p-4 border-2 border-slate-200 rounded-lg shadow-sm">
              <p className="text-slate-500 font-bold mb-2 uppercase text-xs tracking-wider border-b border-slate-100 pb-2 text-right" dir="rtl">المشروع / البيان (Project/Subject):</p>
              <h2 className="text-lg font-bold text-slate-900 text-right" dir="rtl">{formData.title || '_______________'}</h2>
           </div>
        </div>



        <table className="w-full text-right text-sm border-collapse mb-10">
          <thead>
            <tr className="bg-slate-900 text-white font-bold text-xs uppercase">
              <th className="border border-slate-900 py-3 px-2 text-center w-12 text-slate-200">#</th>
              <th className="border border-slate-900 py-3 px-4 text-slate-200">البيان ومواصفات الأعمال (Description)</th>
              <th className="border border-slate-900 py-3 px-2 text-center text-slate-200">الوحدة (Unit)</th>
              <th className="border border-slate-900 py-3 px-2 text-center text-slate-200">الكمية (Qty)</th>
              <th className="border border-slate-900 py-3 px-3 text-center text-slate-200">سعر الوحدة (Unit Price)</th>
              <th className="border border-slate-900 py-3 px-3 text-center text-slate-200">الإجمالي (Total)</th>
            </tr>
          </thead>
          <tbody>
            {formData.items.map((item, index) => (
              <tr key={index} className="border-b border-slate-300">
                <td className="border-x border-slate-300 py-3 px-2 text-center font-bold text-slate-500">{item.itemCode}</td>
                <td className="border-x border-slate-300 py-3 px-4 text-slate-900 font-bold">{item.description || '-'}</td>
                <td className="border-x border-slate-300 py-3 px-2 text-center text-slate-600">{item.unit || '-'}</td>
                <td className="border-x border-slate-300 py-3 px-2 text-center font-mono font-bold text-slate-900">{item.quantity}</td>
                <td className="border-x border-slate-300 py-3 px-3 text-center font-mono text-slate-900">{Number(item.unitPrice).toLocaleString()}</td>
                <td className="border-x border-slate-300 py-3 px-3 text-center font-mono font-bold text-slate-900 bg-slate-50">
                  {(item.quantity * item.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mb-16">
          <div className="w-2/3 rounded-lg border-2 border-slate-900 overflow-hidden text-sm">
            <div className="bg-slate-50 flex justify-between px-4 py-3 border-b border-slate-900 font-bold">
              <span className="text-slate-600">المجموع الفرعي (Subtotal)</span>
              <span className="font-mono text-slate-900">{calculateSubTotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            {formData.hasVat && (
              <div className="bg-slate-100 flex justify-between px-4 py-3 border-b border-slate-900 font-bold">
                <span className="text-slate-600">ضريبة القيمة المضافة (VAT 15%)</span>
                <span className="font-mono text-slate-900">{calculateVat().toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="bg-slate-900 flex justify-between items-center px-4 py-4 text-white">
              <span className="font-black text-lg">صافي المبلغ المستحق (Net Total)</span>
              <span className="font-mono font-black text-xl">SAR {calculateTotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        </div>
        {/* Page 1 Signatures */}
        {formData.status === 'APPROVED' && (
        <div className="grid grid-cols-2 gap-20 text-center font-bold text-sm text-slate-900 px-10 border-t-2 border-slate-200 pt-10 mt-auto">
          <div className="flex flex-col items-center">
            <p className="mb-4 text-slate-800 font-black">إدارة المشاريع (Project Management)</p>
            {company?.stampUrl && (
              <img src={company.stampUrl} alt="Stamp" className="h-20 w-20 object-contain mb-2 mx-auto opacity-80" />
            )}
            <div className="border-2 border-emerald-500 bg-emerald-50 text-emerald-800 p-2 rounded-xl inline-block text-center shadow-md w-56 relative overflow-hidden transform -rotate-2">
              <div className="absolute inset-0 bg-emerald-500 opacity-5"></div>
              <p className="text-[10px] font-black uppercase tracking-widest mb-1 border-b border-emerald-200 pb-1 relative z-10 text-emerald-600">مُعتمد إلكترونياً (E-Approved)</p>
              <p className="text-base font-black mt-1 relative z-10">{formData.approvedBy}</p>
              <p className="text-[10px] font-mono mt-1 relative z-10">{formData.approvedAt ? new Date(formData.approvedAt).toLocaleString('en-GB') : new Date(formData.updatedAt).toLocaleString('en-GB')}</p>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <p className="mb-12">موافقة العميل (Client Approval)</p>
            <p className="border-t border-slate-900 border-dashed pt-2 mx-6 w-full">Signature / Stamp</p>
          </div>
        </div>
        )}
        </div>
      </div>

      {/* Print Template — Page 2 (Scope + Terms) */}
      <div ref={pdfRef2} id="pdf-page-2" className="hidden print:block print-on-letterhead text-black font-sans bg-white" dir="rtl">
        <PrintLetterhead />
        <div className="pt-20 px-8 flex flex-col" style={{ minHeight: 'calc(297mm - 130px - 90px)' }}>
          <div className="flex-1">

        {/* Header info */}
        <div className="mb-6 flex justify-between items-start">
          <h1 className="text-2xl font-black text-slate-900">عرض سعر — Quotation</h1>
          <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
            <p className="text-xs font-bold text-slate-800">رقم العرض (Ref): <span className="font-mono text-indigo-700">{printMeta.ref}</span></p>
            <p className="text-xs font-bold text-slate-800 mt-1">تاريخ الإصدار (Date): <span className="font-mono">{printMeta.date}</span></p>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 text-xs">
          <div className="bg-white p-3 border border-slate-200 rounded-lg">
            <p className="text-slate-500 font-bold mb-1 uppercase text-[10px]">العميل (Client):</p>
            <p className="font-bold text-slate-900">{formData.clientName || '_______________'}</p>
          </div>
          <div className="bg-white p-3 border border-slate-200 rounded-lg">
            <p className="text-slate-500 font-bold mb-1 uppercase text-[10px]">المشروع (Project):</p>
            <p className="font-bold text-slate-900">{formData.title || '_______________'}</p>
          </div>
        </div>

        {(formData.technicalOffer || formData.termsConditions) && (
          <>
            {formData.technicalOffer && (
              <div className="mb-8 pl-2">
                <h3 className="text-sm font-black text-slate-800 mb-3 border-b-2 border-slate-200 inline-block pb-1">نطاق العمل / العرض الفني (Scope of Work):</h3>
                <div className="text-xs text-slate-700 leading-relaxed font-bold whitespace-pre-wrap bg-white p-4 border border-slate-200 rounded-lg">
                  {formData.technicalOffer}
                </div>
              </div>
            )}

            {formData.termsConditions && (
              <div className="mb-10 bg-slate-50 p-6 border-2 border-slate-200 rounded-xl break-inside-avoid">
                <h3 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-2 border-b-2 border-slate-200 inline-block pb-1">
                  الشروط والأحكام (Terms & Conditions):
                </h3>
                <div className="text-xs text-slate-800 leading-loose font-bold whitespace-pre-wrap mt-2">
                  {formData.termsConditions}
                </div>
              </div>
            )}
          </>
        )}
        </div>

        {formData.status === 'APPROVED' && (
        <div className="grid grid-cols-2 gap-20 text-center font-bold text-sm text-slate-900 px-10 border-t-2 border-slate-200 pt-10 break-inside-avoid mt-auto">
          <div className="flex flex-col items-center">
            <p className="mb-4 text-slate-800 font-black">إدارة المشاريع (Project Management)</p>
            {company?.stampUrl && (
              <img src={company.stampUrl} alt="Stamp" className="h-20 w-20 object-contain mb-2 mx-auto opacity-80" />
            )}
            <div className="border-2 border-emerald-500 bg-emerald-50 text-emerald-800 p-2 rounded-xl inline-block text-center shadow-md w-56 relative overflow-hidden transform -rotate-2">
              <div className="absolute inset-0 bg-emerald-500 opacity-5"></div>
              <p className="text-[10px] font-black uppercase tracking-widest mb-1 border-b border-emerald-200 pb-1 relative z-10 text-emerald-600">مُعتمد إلكترونياً (E-Approved)</p>
              <p className="text-base font-black mt-1 relative z-10">{formData.approvedBy}</p>
              <p className="text-[10px] font-mono mt-1 relative z-10">{formData.approvedAt ? new Date(formData.approvedAt).toLocaleString('en-GB') : new Date(formData.updatedAt).toLocaleString('en-GB')}</p>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <p className="mb-12">موافقة العميل (Client Approval)</p>
            <p className="border-t border-slate-900 border-dashed pt-2 mx-6 w-full">Signature / Stamp</p>
          </div>
        </div>
        )}
        </div>
      </div>

      {/* Template Create/Edit Modal */}
      <AnimatePresence>
        {isTemplateFormOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => { if (!isSavingTemplate) setIsTemplateFormOpen(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-lg font-black text-white">
                  {editingTemplateId ? t("quotations.editTemplate") : t("quotations.saveAsNewTemplate")}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsTemplateFormOpen(false)}
                  className="p-1.5 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t("quotations.templateNameLabel")}</label>
                  <input
                    type="text"
                    value={templateFormData.name}
                    onChange={e => setTemplateFormData({...templateFormData, name: e.target.value})}
                    className="w-full bg-slate-950/50 border border-slate-700/80 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                    placeholder={t("quotations.templateNamePlaceholder")}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t("quotations.templateScope")}</label>
                  <textarea
                    rows={4}
                    value={templateFormData.technicalOffer}
                    onChange={e => setTemplateFormData({...templateFormData, technicalOffer: e.target.value})}
                    className="w-full bg-slate-950/50 border border-slate-700/80 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all resize-y"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t("quotations.templateTerms")}</label>
                  <textarea
                    rows={4}
                    value={templateFormData.termsConditions}
                    onChange={e => setTemplateFormData({...templateFormData, termsConditions: e.target.value})}
                    className="w-full bg-slate-950/50 border border-slate-700/80 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all resize-y"
                  />
                </div>

                {templateMessage && (
                  <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold ${templateMessage.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'}`}>
                    {templateMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    {templateMessage.text}
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-white/5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsTemplateFormOpen(false)}
                  disabled={isSavingTemplate}
                  className="px-6 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-white/20 font-bold transition-all text-sm"
                >
{t("common.cancel")}
                </button>
                <button
                  type="button"
                  onClick={() => setIsTemplateFormOpen(false)}
                  disabled={isSavingTemplate}
                  className="px-6 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-white/20 font-bold transition-all text-sm"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteTemplate(templateToDelete!)}
                  disabled={isDeletingTemplate}
                  className="px-6 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold transition-all text-sm flex items-center gap-2 shadow-lg"
                >
                  {isDeletingTemplate ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  {t("common.delete")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
