"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
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
  ChevronDown,
  UserPlus,
  Search,
  X
} from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";

export default function CreateQuotationPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    clientName: "",
    hasVat: false,
    technicalOffer: "",
    termsConditions: "",
    items: [{ itemCode: "01", description: "", unit: "م٢", quantity: 1, unitPrice: 0, estimatedUnitCost: 0 }]
  });

  // ── Client Combobox ────────────────────────────────────────────────
  const [clients, setClients] = useState<any[]>([]);
  const [clientSearch, setClientSearch] = useState("");
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const clientInputRef = useRef<HTMLInputElement>(null);
  const clientDropdownRef = useRef<HTMLDivElement>(null);

  // New Client Modal State
  const [showClientModal, setShowClientModal] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '',
    commercialName: '',
    contactPerson: '',
    phone: '',
    email: '',
    taxNumber: '',
    crNumber: '',
    address: '',
    activityType: '',
    notes: ''
  });
  const [isSubmittingClient, setIsSubmittingClient] = useState(false);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE_URL}/v1/contacts/clients`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setClients(res.data || []);
      } catch {}
    };
    fetchClients();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        clientDropdownRef.current && !clientDropdownRef.current.contains(e.target as Node) &&
        clientInputRef.current && !clientInputRef.current.contains(e.target as Node)
      ) {
        setShowClientDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredClients = clients.filter(c =>
    c.name?.toLowerCase().includes(clientSearch.toLowerCase()) ||
    c.commercialName?.toLowerCase().includes(clientSearch.toLowerCase())
  );

  const handleSelectClient = (client: any) => {
    setFormData({ ...formData, clientName: client.name });
    setClientSearch(client.name);
    setShowClientDropdown(false);
  };

  const handleClientInputChange = (val: string) => {
    setClientSearch(val);
    setFormData({ ...formData, clientName: val });
    setShowClientDropdown(true);
  };

  const submitNewClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.name) return;
    setIsSubmittingClient(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_BASE_URL}/v1/contacts/clients`, newClient, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Add to list and select it
      setClients(prev => [...prev, res.data]);
      handleSelectClient(res.data);
      setShowClientModal(false);
      setNewClient({
        name: '', commercialName: '', contactPerson: '', phone: '', email: '', 
        taxNumber: '', crNumber: '', address: '', activityType: '', notes: ''
      });
    } catch (err: any) {
      alert(`حدث خطأ أثناء تسجيل العميل:\n${err.response?.data?.message || err.message}`);
    } finally {
      setIsSubmittingClient(false);
    }
  };
  // ── End Client Combobox ───────────────────────────────────────────

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
      items: [...formData.items, { itemCode: nextCode, description: "", unit: "م٢", quantity: 1, unitPrice: 0, estimatedUnitCost: 0 }]
    });
  };

  const handleRemoveItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    // Re-index
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
      await axios.post(
        `${API_BASE_URL}/v1/quotations`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      router.push("/dashboard/quotations");
    } catch (err: any) {
      alert("حدث خطأ أثناء حفظ عرض السعر.");
    } finally {
      setIsLoading(false);
    }
  };

  const [printMeta, setPrintMeta] = useState({ date: "", ref: "" });

  useEffect(() => {
    setPrintMeta({
      date: new Date().toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' }),
      ref: `QT-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`
    });
  }, []);

  const handlePrint = () => {
    window.print();
  };


  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          .screen-only { display: none !important; }
          .print-doc {
            display: block !important;
            visibility: visible !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
          }
        }
      `}} />

      <div className="max-w-[1600px] mx-auto space-y-8 w-full animate-in fade-in zoom-in-95 duration-500 pb-12 screen-only relative">
        {/* Decorative Glow */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-[150px] pointer-events-none -z-10" />

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <button onClick={() => router.back()} className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-slate-300 hover:text-white transition-all shadow-lg hover:-translate-x-1">
              <ArrowRight size={22} />
            </button>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3 drop-shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500/20 to-rose-500/10 flex items-center justify-center border border-pink-500/20 shadow-lg">
                  <FileText className="text-pink-400" size={24} />
                </div>
                تسعير احترافي (عروض الأسعار)
              </h1>
              <p className="text-slate-400 text-sm mt-2 font-medium flex items-center gap-2">
                قم بتسجيل البنود وتكلفتها لإنشاء عرض سعر يمكنك طباعته أو حفظه كـ PDF للعميل.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button type="button" onClick={handlePrint} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-bold transition-all shadow-lg text-sm">
              <Printer size={18} /> معاينة وطباعة PDF
            </button>
            <button onClick={handleSubmit} disabled={isLoading} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white shadow-[0_0_20px_rgba(236,72,153,0.3)] hover:shadow-[0_0_30px_rgba(236,72,153,0.5)] transition-all hover:-translate-y-1 text-sm disabled:opacity-50">
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} حفظ في النظام
            </button>
          </div>
        </div>

        {/* Main Form Content */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-dark border border-white/5 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-pink-500 via-rose-500 to-orange-400 opacity-50" />
          
          <form className="space-y-10">
            {/* Metadata Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-900/40 p-6 rounded-2xl border border-white/5 shadow-inner">
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Building2 size={14} className="text-pink-400" />
                  العميل / الجهة المالكة المستهدفة
                </label>

                {/* Smart Client Combobox */}
                <div className="relative">
                  <div className="relative flex items-center">
                    <Search size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none z-10" />
                    <input
                      ref={clientInputRef}
                      type="text"
                      required
                      value={clientSearch}
                      onChange={e => handleClientInputChange(e.target.value)}
                      onFocus={() => setShowClientDropdown(true)}
                      className="w-full bg-slate-950/50 border border-slate-700/80 rounded-xl py-3.5 pr-10 pl-10 text-white text-base placeholder-slate-600 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all shadow-inner"
                      placeholder="ابحث أو اكتب اسم العميل..."
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      onClick={() => setShowClientDropdown(v => !v)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-pink-400 transition-colors"
                    >
                      <ChevronDown size={16} className={`transition-transform duration-200 ${showClientDropdown ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  <AnimatePresence>
                    {showClientDropdown && (
                      <motion.div
                        ref={clientDropdownRef}
                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full mt-2 w-full z-50 bg-slate-900 border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden max-h-64 flex flex-col"
                      >
                        {/* Header */}
                        <div className="px-4 py-2.5 border-b border-white/5 flex items-center justify-between">
                          <span className="text-xs text-slate-500 font-bold">
                            {filteredClients.length} عميل مسجل
                          </span>
                          {clientSearch && (
                            <span className="text-xs text-pink-400 font-bold">
                              نتائج: &ldquo;{clientSearch}&rdquo;
                            </span>
                          )}
                        </div>

                        <div className="overflow-y-auto flex-1">
                          {filteredClients.length > 0 ? (
                            filteredClients.map(client => (
                              <button
                                key={client.id}
                                type="button"
                                onClick={() => handleSelectClient(client)}
                                className="w-full text-right px-4 py-3 flex items-center gap-3 hover:bg-pink-500/10 transition-colors group border-b border-white/[0.03] last:border-0"
                              >
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-600/20 to-rose-600/10 border border-pink-500/20 flex items-center justify-center text-pink-300 font-black text-sm shrink-0 group-hover:border-pink-500/40 transition-colors">
                                  {client.name?.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-white text-sm truncate group-hover:text-pink-200 transition-colors">
                                    {client.name}
                                  </p>
                                  {client.commercialName && (
                                    <p className="text-xs text-slate-500 truncate">{client.commercialName}</p>
                                  )}
                                </div>
                                {formData.clientName === client.name && (
                                  <div className="w-2 h-2 rounded-full bg-pink-400 shrink-0" />
                                )}
                              </button>
                            ))
                          ) : clients.length === 0 ? (
                            <div className="px-4 py-6 text-center text-slate-500 text-sm">
                              <Building2 size={24} className="mx-auto mb-2 text-slate-700" />
                              لا يوجد عملاء مسجلين بعد
                            </div>
                          ) : (
                            <div className="px-4 py-4 flex items-center gap-3 text-sm">
                              <UserPlus size={18} className="text-pink-400 shrink-0" />
                              <div>
                                <p className="text-white font-bold">سيتم استخدام: &ldquo;{clientSearch}&rdquo;</p>
                                <p className="text-slate-500 text-xs mt-0.5">لا يوجد عميل مطابق – سيُحفظ كاسم جديد</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Footer hint */}
                        <div className="px-4 py-3 border-t border-white/5 bg-slate-950/50 flex items-center justify-between">
                          <p className="text-[10px] text-slate-500">
                            يمكنك اختيار عميل أو كتابة اسم مباشرة
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setShowClientDropdown(false);
                              setNewClient(p => ({...p, name: clientSearch}));
                              setShowClientModal(true);
                            }}
                            className="bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 transition-all"
                          >
                            <Plus size={14} /> تسجيل عميل جديد
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <FileSignature size={14} className="text-pink-400" />
                  وصف المشروع أو عنوان عرض السعر
                </label>
                <input 
                  type="text" 
                  required 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  className="w-full bg-slate-950/50 border border-slate-700/80 rounded-xl py-3.5 px-4 text-white text-base placeholder-slate-600 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all shadow-inner" 
                  placeholder="مثال: توريد وتركيب أعمال التشطيبات للفرع الرئيسي" 
                />
              </div>
              
              <div className="md:col-span-2 space-y-3 pt-2">
                <label className="flex items-center gap-3 bg-slate-950/80 border border-slate-800 p-4 rounded-xl cursor-pointer hover:border-pink-500/30 transition-colors w-max">
                  <input 
                    type="checkbox" 
                    checked={formData.hasVat} 
                    onChange={e => setFormData({...formData, hasVat: e.target.checked})}
                    className="w-5 h-5 rounded accent-pink-500 border-slate-700" 
                  />
                  <span className="font-bold text-white text-sm">تطبيق ضريبة القيمة المضافة 15% 🇸🇦</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-900/40 p-6 rounded-2xl border border-white/5 shadow-inner">
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <FileText size={14} className="text-pink-400" />
                  العرض الفني / نطاق العمل
                </label>
                <textarea 
                  rows={4}
                  value={formData.technicalOffer} 
                  onChange={e => setFormData({...formData, technicalOffer: e.target.value})} 
                  className="w-full bg-slate-950/50 border border-slate-700/80 rounded-xl py-3.5 px-4 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all shadow-inner resize-y min-h-[120px]" 
                  placeholder="مثال: يختص هذا العرض بتوريد وتركيب الأنظمة الموضحة بالجدول بموجب المواصفات العالمية المعتمدة..." 
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <ScrollText size={14} className="text-pink-400" />
                  الشروط والأحكام / شروط العقد
                </label>
                <textarea 
                  rows={4}
                  value={formData.termsConditions} 
                  onChange={e => setFormData({...formData, termsConditions: e.target.value})} 
                  className="w-full bg-slate-950/50 border border-slate-700/80 rounded-xl py-3.5 px-4 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all shadow-inner resize-y min-h-[120px]" 
                  placeholder="مثال: مدة التنفيذ 45 يوماً من تاريخ استلام الدفعة المقدمة. الدفعة المقدمة 50%..." 
                />
              </div>
            </div>

            {/* Pricing Table Section */}
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <h3 className="font-extrabold text-xl text-white flex items-center gap-2 drop-shadow-sm">
                  <ListOrdered className="text-pink-400" size={24} />
                  جداول التكلفة التفصيلية
                </h3>
                <button type="button" onClick={handleAddItem} className="flex items-center gap-2 text-sm font-bold text-pink-400 hover:text-white bg-pink-500/10 hover:bg-pink-500 border border-pink-500/20 hover:border-pink-500 px-4 py-2 rounded-xl transition-all shadow-lg hover:shadow-[0_0_15px_rgba(236,72,153,0.5)]">
                  <Plus size={18} /> إدراج بند جديد
                </button>
              </div>

              {/* Header Row for large screens */}
              <div className="hidden lg:grid grid-cols-12 gap-4 px-4 pb-2 text-xs font-bold text-slate-400 uppercase tracking-wider text-center flex items-center">
                <div className="col-span-1">بند رقم</div>
                <div className="col-span-3 text-right">وصف تفصيلي للأعمال</div>
                <div className="col-span-1">الوحدة</div>
                <div className="col-span-1 text-emerald-400">الكمية</div>
                <div className="col-span-2 text-amber-500">التكلفة المتوقعة (للإدارة)</div>
                <div className="col-span-2 text-rose-300">سعر الإفراد البيع (للعميل)</div>
                <div className="col-span-2 text-left">القيمة الإجمالية (SAR)</div>
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
                    <div className="col-span-1 lg:col-span-3">
                       <input type="text" required value={item.description} onChange={e => handleItemChange(index, "description", e.target.value)} placeholder="اكتب تفاصيل البند هنا..." className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg py-2.5 px-4 text-sm text-white focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all font-medium" />
                    </div>
                    <div className="col-span-1">
                       <input type="text" required value={item.unit} onChange={e => handleItemChange(index, "unit", e.target.value)} placeholder="مثال: م٢, مقطوعية" className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg py-2.5 px-3 text-sm text-center text-slate-300 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all" />
                    </div>
                    <div className="col-span-1">
                       <input type="number" required min="1" step="any" value={item.quantity || ''} onChange={e => handleItemChange(index, "quantity", Number(e.target.value))} placeholder="الكمية" className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg py-2.5 px-2 text-sm text-center text-emerald-300 font-mono font-bold focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all" />
                    </div>
                    <div className="col-span-1 lg:col-span-2">
                       <input type="number" required min="0" step="any" value={item.estimatedUnitCost || ''} onChange={e => handleItemChange(index, "estimatedUnitCost", Number(e.target.value))} placeholder="التكلفة 0.00" title="التكلفة التقديرية المتوقعة (لن تظهر للعميل)" className="w-full bg-slate-900/50 border border-amber-500/30 hover:border-amber-500/50 rounded-lg py-2.5 px-3 text-sm text-center text-amber-500 font-mono font-bold focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/60 transition-all" />
                    </div>
                    <div className="col-span-1 lg:col-span-2">
                       <input type="number" required min="0" step="any" value={item.unitPrice || ''} onChange={e => handleItemChange(index, "unitPrice", Number(e.target.value))} placeholder="سعر البيع 0.00" title="سعر البيع المعروض للعميل" className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg py-2.5 px-3 text-sm text-center text-rose-300 font-mono font-bold focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all" />
                    </div>
                    <div className="col-span-1 lg:col-span-2 flex items-center gap-2">
                      <div className="flex-1 bg-slate-900/80 py-2.5 px-3 rounded-lg text-left font-black text-white font-mono text-sm border border-slate-700/50 shadow-inner group-hover:bg-slate-800 transition-colors">
                        {(item.quantity * item.unitPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <button type="button" onClick={() => handleRemoveItem(index)} className="p-2.5 text-rose-500 hover:text-white hover:bg-rose-500 rounded-lg transition-all" title="حذف البند">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Total Summary */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 md:px-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden space-y-4">
               <div className="absolute inset-0 bg-pink-500/5 mix-blend-overlay" />
               <div className="relative z-10 flex justify-between items-center border-b border-white/5 pb-4">
                 <span className="text-slate-400 font-bold">المجموع الفرعي (Subtotal)</span>
                 <span className="font-mono text-xl text-white">{calculateSubTotal().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SAR</span>
               </div>
               {formData.hasVat && (
                 <div className="relative z-10 flex justify-between items-center border-b border-white/5 pb-4">
                   <span className="text-slate-400 font-bold text-pink-400">ضريبة القيمة المضافة (VAT 15%)</span>
                   <span className="font-mono text-xl text-pink-400">{calculateVat().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SAR</span>
                 </div>
               )}
               <div className="relative z-10 flex justify-between items-center flex-col md:flex-row gap-4 pt-2">
                 <div>
                   <h4 className="text-xl font-bold text-white mb-1">المبلغ الإجمالي المستحق</h4>
                   <p className="text-sm text-slate-400">Net Total Amount</p>
                 </div>
                 <div className="flex items-baseline gap-2">
                   <span className="text-slate-400 font-bold tracking-widest text-sm">SAR</span>
                   <span className="font-mono text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-pink-100 to-white drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]">
                     {calculateTotal().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                   </span>
                 </div>
               </div>
            </div>
          </form>
        </motion.div>
      </div>

      {/* =========================================
          PRINT ONLY A4 FORMAT (HIDDEN ON SCREEN)
          ========================================= */}
      <div className="hidden print-doc w-full p-8 sm:p-12 font-sans shadow-none">
        
        {/* Print Header */}
        <div className="border-b-2 border-slate-900 pb-6 mb-8 flex justify-between items-end">
           <div>
             <h1 className="text-4xl font-black text-slate-900 mb-1 tracking-tight">عــرض ســعــر</h1>
             <p className="text-lg font-bold text-slate-500">QUOTATION</p>
           </div>
           <div className="text-left font-bold text-sm text-slate-600">
             <p className="text-xl font-bold text-indigo-700 mb-2">PMS Contracting Est.</p>
             <p>Date: <span className="font-mono text-slate-900">{printMeta.date}</span></p>
             <p>Ref: <span className="font-mono text-slate-900">{printMeta.ref}</span></p>
           </div>
        </div>

        {/* Client & Project Info */}
        <div className="mb-10 grid grid-cols-2 gap-8 text-sm">
           <div className="bg-slate-50 p-4 border-l-4 border-slate-800 rounded-r-lg">
              <p className="text-slate-500 font-bold mb-1 uppercase text-xs">مقدم إلى العميل (Billed To):</p>
              <h2 className="text-xl font-black text-slate-900">{formData.clientName || '_______________'}</h2>
           </div>
           <div className="bg-slate-50 p-4 border-r-4 border-slate-800 rounded-l-lg text-left text-right" dir="rtl">
              <p className="text-slate-500 font-bold mb-1 uppercase text-xs">المشروع / البيان (Subject):</p>
              <h2 className="text-lg font-bold text-slate-900">{formData.title || '_______________'}</h2>
           </div>
        </div>

        {formData.technicalOffer && (
          <div className="mb-8 pl-2">
            <h3 className="text-sm font-black text-slate-800 mb-2 border-b-2 border-slate-200 inline-block pb-1">نطاق العمل / العرض الفني:</h3>
            <div className="text-xs text-slate-700 leading-relaxed font-bold whitespace-pre-wrap">
              {formData.technicalOffer}
            </div>
          </div>
        )}

        {/* Formal Table */}
        <table className="w-full text-right text-sm border-collapse mb-10">
          <thead>
            <tr className="bg-slate-900 text-white font-bold text-xs uppercase">
              <th className="border border-slate-900 py-3 px-2 text-center w-12 text-slate-200">م</th>
              <th className="border border-slate-900 py-3 px-4 text-slate-200">البيان ومواصفات الأعمال</th>
              <th className="border border-slate-900 py-3 px-2 text-center text-slate-200">الوحدة</th>
              <th className="border border-slate-900 py-3 px-2 text-center text-slate-200">الكمية</th>
              <th className="border border-slate-900 py-3 px-3 text-center text-slate-200">سعر الوحدة</th>
              <th className="border border-slate-900 py-3 px-3 text-center text-slate-200">الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            {formData.items.map((item, index) => (
              <tr key={index} className="border-b border-slate-300">
                <td className="border-x border-slate-300 py-3 px-2 text-center font-bold text-slate-500">{item.itemCode}</td>
                <td className="border-x border-slate-300 py-3 px-4 text-slate-900 font-bold">{item.description || '-'}</td>
                <td className="border-x border-slate-300 py-3 px-2 text-center text-slate-600">{item.unit || '-'}</td>
                <td className="border-x border-slate-300 py-3 px-2 text-center font-mono font-bold text-slate-900">{item.quantity}</td>
                <td className="border-x border-slate-300 py-3 px-3 text-center font-mono text-slate-900">{Number(item.unitPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                <td className="border-x border-slate-300 py-3 px-3 text-center font-mono font-bold text-slate-900 bg-slate-50">
                  {(item.quantity * item.unitPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Print Totals */}
        <div className="flex justify-end mb-16">
          <div className="w-2/3 rounded-lg border-2 border-slate-900 overflow-hidden text-sm">
            <div className="bg-slate-50 flex justify-between px-4 py-3 border-b border-slate-900 font-bold">
              <span className="text-slate-600">المجموع الفرعي المنفذ (Subtotal)</span>
              <span className="font-mono text-slate-900">{calculateSubTotal().toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            {formData.hasVat && (
              <div className="bg-slate-100 flex justify-between px-4 py-3 border-b border-slate-900 font-bold">
                <span className="text-slate-600">ضريبة القيمة المضافة (VAT 15%)</span>
                <span className="font-mono text-slate-900">{calculateVat().toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="bg-slate-900 flex justify-between items-center px-4 py-4 text-white">
              <span className="font-black text-lg">صافي المبلغ المستحق (Net Total)</span>
              <span className="font-mono font-black text-xl">SAR {calculateTotal().toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {formData.termsConditions && (
          <div className="mb-10 bg-slate-50 p-6 border-2 border-slate-200 rounded-xl break-inside-avoid">
            <h3 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-2">
              الشروط والأحكام (Terms & Conditions):
            </h3>
            <div className="text-xs text-slate-800 leading-loose font-bold whitespace-pre-wrap">
              {formData.termsConditions}
            </div>
          </div>
        )}

        {/* Print Footer */}
        <div className="grid grid-cols-2 gap-20 text-center font-bold text-sm text-slate-900 px-10 border-t-2 border-slate-200 pt-10 break-inside-avoid mt-8">
          <div>
            <p className="mb-12">المدير العام (General Manager)</p>
            <p className="border-t border-slate-900 border-dashed pt-2 mx-6">التوقيع والختم</p>
          </div>
          <div>
            <p className="mb-12">موافقة العميل (Client Approval)</p>
            <p className="border-t border-slate-900 border-dashed pt-2 mx-6">Signature / Stamp</p>
          </div>
        </div>
        
        <div className="absolute bottom-6 inset-x-0 text-center text-xs text-slate-400">
           وثيقة صادرة عن نظام إدارة المشاريع (PMS) لتسعير عقود المقاولات.
        </div>
      </div>

      {/* =========================================
          CLIENT REGISTRATION MODAL
          ========================================= */}
      {showClientModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Plus size={20} className="text-indigo-400" /> إضافة عميل جديد
              </h2>
              <button type="button" onClick={() => setShowClientModal(false)} className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={submitNewClient} className="p-6 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-300">* الاسم المختصر (اساسي)</label>
                  <input required value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="مثال: الراجحي" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-300">الاسم التجاري الكامل</label>
                  <input value={newClient.commercialName} onChange={e => setNewClient({...newClient, commercialName: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" placeholder="مثال: شركة الراجحي بمحدودة" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-300">الرقم الضريبي VAT</label>
                  <input value={newClient.taxNumber} onChange={e => setNewClient({...newClient, taxNumber: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" placeholder="3000..." />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-300">رقم السجل التجاري CR</label>
                  <input value={newClient.crNumber} onChange={e => setNewClient({...newClient, crNumber: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" placeholder="1010..." />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-300">رقم الهاتف التواصل</label>
                  <input value={newClient.phone} onChange={e => setNewClient({...newClient, phone: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" placeholder="05xxxxxxxx" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-300">البريد الإلكتروني</label>
                  <input type="email" value={newClient.email} onChange={e => setNewClient({...newClient, email: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" placeholder="info@example.com" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-300">العنوان أو المقر</label>
                  <input value={newClient.address} onChange={e => setNewClient({...newClient, address: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" placeholder="الرياض، حي السلي..." />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-300">ملاحظات داخلية / أرقام تواصل أخرى</label>
                  <textarea rows={2} value={newClient.notes} onChange={e => setNewClient({...newClient, notes: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 resize-none" placeholder="اكتب أي معلومات إضافية..." />
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-800 flex gap-4">
                <button type="submit" disabled={isSubmittingClient || !newClient.name} className="flex-1 bg-indigo-600 disabled:opacity-50 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2">
                  {isSubmittingClient && <Loader2 size={18} className="animate-spin" />}
                  إضافة واستخدام
                </button>
                <button type="button" onClick={() => setShowClientModal(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 rounded-xl transition-colors">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
