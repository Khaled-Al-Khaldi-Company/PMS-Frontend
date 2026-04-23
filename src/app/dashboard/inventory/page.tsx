"use client";

import { useState, useEffect } from "react";
import { 
  Building2, 
  PackageSearch,
  ArrowRightLeft,
  X,
  Save,
  Plus,
  ArrowDownToLine,
  ArrowUpFromLine,
  Boxes,
  Warehouse
} from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

export default function InventoryDashboard() {
  const [activeTab, setActiveTab] = useState("STOCKS"); // STOCKS, TRANSACTIONS, WAREHOUSES
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [stocks, setStocks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [showGrnModal, setShowGrnModal] = useState(false);
  const [showMisModal, setShowMisModal] = useState(false);
  const [showWarehouseModal, setShowWarehouseModal] = useState(false);
  
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  
  // Forms
  const [warehouseForm, setWarehouseForm] = useState({ name: "", location: "", projectId: "" });
  const [grnForm, setGrnForm] = useState({ warehouseId: "", poId: "", materialId: "", quantity: "", remarks: "" });
  const [misForm, setMisForm] = useState({ warehouseId: "", projectId: "", materialId: "", quantity: "", remarks: "" });

  useEffect(() => {
    fetchWarehouses();
    fetchTransactions();
    fetchDropdowns();
  }, []);

  useEffect(() => {
    if (selectedWarehouse) {
      fetchStock(selectedWarehouse);
    } else {
      setStocks([]);
    }
  }, [selectedWarehouse]);

  const fetchWarehouses = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/v1/inventory/warehouses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWarehouses(res.data);
      if (res.data.length > 0) setSelectedWarehouse(res.data[0].id);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/v1/inventory/transactions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransactions(res.data);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchStock = async (warehouseId: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/v1/inventory/warehouses/${warehouseId}/stock`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStocks(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchDropdowns = async () => {
    try {
      const token = localStorage.getItem("token");
      const [pos, mats, projs] = await Promise.all([
        axios.get(`${API_BASE_URL}/v1/purchases`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/v1/materials`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/v1/projects`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const posData = Array.isArray(pos.data) ? pos.data : (pos.data?.items || []);
      const matsData = Array.isArray(mats.data) ? mats.data : (mats.data?.items || []);
      const projsData = Array.isArray(projs.data) ? projs.data : (projs.data?.items || []);

      setPurchaseOrders(posData.filter((p:any) => p.status === 'APPROVED' || p.status === 'PENDING'));
      
      const physicalMats = matsData.filter((m:any) => m.type !== 'SERVICE');
      setMaterials(physicalMats);
      
      setProjects(projsData);
    } catch (e) {}
  };

  const handleGrnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_BASE_URL}/v1/inventory/transactions/receipt`, {
        warehouseId: grnForm.warehouseId || selectedWarehouse,
        poId: grnForm.poId || undefined,
        materialId: grnForm.materialId,
        quantity: Number(grnForm.quantity),
        remarks: grnForm.remarks,
        createdBy: "User"
      }, { headers: { Authorization: `Bearer ${token}` } });
      setShowGrnModal(false);
      fetchTransactions();
      if (selectedWarehouse) fetchStock(selectedWarehouse);
      alert("تم تسجيل سند الاستلام بنجاح!");
    } catch (e: any) { alert("حدث خطأ في التسجيل"); }
  };

  const handleMisSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_BASE_URL}/v1/inventory/transactions/issue`, {
        warehouseId: misForm.warehouseId || selectedWarehouse,
        projectId: misForm.projectId || undefined,
        materialId: misForm.materialId,
        quantity: Number(misForm.quantity),
        remarks: misForm.remarks,
        createdBy: "User"
      }, { headers: { Authorization: `Bearer ${token}` } });
      setShowMisModal(false);
      fetchTransactions();
      if (selectedWarehouse) fetchStock(selectedWarehouse);
      alert("تم تسجيل صرف المواد بنجاح!");
    } catch (e: any) { alert(e.response?.data?.message || "حدث خطأ في الصرف.. تأكد من وجود رصيد كافٍ!"); }
  };

  const handleWarehouseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_BASE_URL}/v1/inventory/warehouses`, warehouseForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowWarehouseModal(false);
      fetchWarehouses();
      alert("تمت إضافة المستودع بنجاح!");
    } catch (e: any) { 
      const msg = e.response?.data?.message || e.message || 'حدث خطأ في إضافة المستودع';
      alert(msg);
    }
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Boxes className="animate-bounce text-indigo-500 mb-4" size={48} />
      <p className="text-slate-400 font-bold">جاري تجهيز إدارة المستودعات...</p>
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-12 animate-in fade-in zoom-in-95 duration-500 relative">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 bg-[#0f1015]/80 p-8 rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative z-10">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-400 to-teal-400 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
              <Warehouse className="text-indigo-400" size={28} />
            </div>
            إدارة مستودعات الموقع
          </h1>
          <p className="text-slate-400 text-lg mt-3 font-medium">نظام متكامل لتتبع وإدارة الأرصدة، تسجيل الاستلامات، وإصدار سندات الصرف.</p>
        </div>
        
        <div className="relative z-10 flex flex-wrap gap-3 w-full lg:w-auto">
          <button onClick={() => setShowWarehouseModal(true)} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-white font-bold transition-all shadow-lg hover:-translate-y-1">
            <Plus size={18} /> إضافة مستودع
          </button>
          <button onClick={() => setShowGrnModal(true)} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)] hover:shadow-[0_0_25px_rgba(16,185,129,0.3)] hover:-translate-y-1">
            <ArrowDownToLine size={18} /> سند استلام (GRN)
          </button>
          <button onClick={() => setShowMisModal(true)} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold transition-all shadow-[0_0_15px_rgba(244,63,94,0.15)] hover:shadow-[0_0_25px_rgba(244,63,94,0.3)] hover:-translate-y-1">
            <ArrowUpFromLine size={18} /> سند صرف مواد
          </button>
        </div>
      </div>

      {/* MODERN TABS */}
      <div className="flex bg-[#0f1015]/60 p-2 rounded-2xl border border-white/5 w-fit backdrop-blur-md shadow-xl">
        <button 
          onClick={() => setActiveTab("STOCKS")}
          className={`flex items-center gap-3 px-8 py-3 rounded-xl text-sm font-black transition-all duration-300 ${activeTab === 'STOCKS' ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
        >
          <PackageSearch size={20} /> الأرصدة الحالية والمخزون
        </button>
        <button 
          onClick={() => setActiveTab("TRANSACTIONS")}
          className={`flex items-center gap-3 px-8 py-3 rounded-xl text-sm font-black transition-all duration-300 ${activeTab === 'TRANSACTIONS' ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
        >
          <ArrowRightLeft size={20} /> سجل حركات المواد الدقيق
        </button>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="bg-[#0f1015]/60 backdrop-blur-md border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
        
        {/* WAREHOUSE SELECTOR FOR STOCKS */}
        {activeTab === "STOCKS" && (
          <div className="p-6 border-b border-white/5 bg-slate-900/40 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                 <Building2 className="text-blue-400" size={20} />
               </div>
               <span className="text-white font-black text-lg">عرض أرصدة مستودع:</span>
            </div>
            <select 
              className="bg-slate-950 border border-slate-800 text-white px-5 py-3 rounded-xl outline-none min-w-[250px] focus:border-indigo-500 transition-colors shadow-inner font-bold"
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
            >
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>{w.name} {w.project ? `(موقع: ${w.project.name})` : '(مستودع رئيسي)'}</option>
              ))}
            </select>
          </div>
        )}

        {/* DATA TABLES */}
        <div className="overflow-x-auto p-2">
          {activeTab === "STOCKS" && (
            <table className="w-full text-right border-separate border-spacing-y-2 px-4 pb-4">
              <thead>
                <tr className="text-slate-400 text-xs font-black uppercase tracking-wider">
                  <th className="px-6 py-4">كود المادة</th>
                  <th className="px-6 py-4">اسم المادة</th>
                  <th className="px-6 py-4">الوحدة</th>
                  <th className="px-6 py-4 text-left">الرصيد الفعلي المتوفر</th>
                </tr>
              </thead>
              <tbody>
                {stocks.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-16 text-slate-500 font-bold bg-slate-900/20 rounded-2xl">لا يوجد أرصدة في هذا المستودع حالياً</td></tr>
                ) : (
                  stocks.map((stock) => (
                    <motion.tr initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} key={stock.id} className="bg-slate-900/40 hover:bg-slate-800/60 transition-colors group">
                      <td className="px-6 py-5 rounded-r-2xl font-mono text-slate-500 text-sm font-bold border-y border-r border-white/5 group-hover:border-indigo-500/30">{stock.material.code}</td>
                      <td className="px-6 py-5 text-white font-bold border-y border-white/5 group-hover:border-indigo-500/30">{stock.material.name}</td>
                      <td className="px-6 py-5 border-y border-white/5 group-hover:border-indigo-500/30">
                        <span className="bg-slate-950 text-slate-300 px-3 py-1 rounded-lg text-xs font-bold border border-slate-800">{stock.material.unit}</span>
                      </td>
                      <td className="px-6 py-5 rounded-l-2xl text-left border-y border-l border-white/5 group-hover:border-indigo-500/30">
                        <span className="bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-xl font-black text-xl font-mono border border-emerald-500/20 inline-block shadow-inner" dir="ltr">
                          {stock.quantity}
                        </span>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeTab === "TRANSACTIONS" && (
            <table className="w-full text-right border-separate border-spacing-y-2 px-4 pb-4">
              <thead>
                <tr className="text-slate-400 text-xs font-black uppercase tracking-wider">
                  <th className="px-6 py-4">التاريخ</th>
                  <th className="px-6 py-4">الرقم المرجعي</th>
                  <th className="px-6 py-4">نوع الحركة</th>
                  <th className="px-6 py-4">المستودع</th>
                  <th className="px-6 py-4">المادة</th>
                  <th className="px-6 py-4 text-left">الكمية</th>
                  <th className="px-6 py-4 text-left">مرجع (PO/BOQ)</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-16 text-slate-500 font-bold bg-slate-900/20 rounded-2xl">لا توجد حركات مسجلة حتى الآن</td></tr>
                ) : (
                  transactions.map((trx) => (
                    <motion.tr initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} key={trx.id} className="bg-slate-900/40 hover:bg-slate-800/60 transition-colors group">
                      <td className="px-6 py-4 rounded-r-2xl font-mono text-slate-400 text-sm border-y border-r border-white/5 group-hover:border-indigo-500/30">{new Date(trx.date).toLocaleDateString('en-GB')}</td>
                      <td className="px-6 py-4 border-y border-white/5 group-hover:border-indigo-500/30">
                        <span className="bg-slate-950 border border-slate-800 text-indigo-400 font-mono text-xs px-3 py-1.5 rounded-lg font-bold inline-block">{trx.referenceNo}</span>
                      </td>
                      <td className="px-6 py-4 border-y border-white/5 group-hover:border-indigo-500/30">
                        {trx.type === 'RECEIPT' 
                          ? <span className="flex items-center gap-1.5 w-max bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-bold border border-emerald-500/20"><ArrowDownToLine size={14}/> استلام وارد</span>
                          : <span className="flex items-center gap-1.5 w-max bg-rose-500/10 text-rose-400 px-3 py-1.5 rounded-lg text-xs font-bold border border-rose-500/20"><ArrowUpFromLine size={14}/> صرف لموقع</span>
                        }
                      </td>
                      <td className="px-6 py-4 text-slate-300 font-bold text-sm border-y border-white/5 group-hover:border-indigo-500/30">{trx.warehouse.name}</td>
                      <td className="px-6 py-4 text-white font-bold border-y border-white/5 group-hover:border-indigo-500/30">{trx.material.name}</td>
                      <td className="px-6 py-4 text-left border-y border-white/5 group-hover:border-indigo-500/30">
                        <span className={`font-mono font-black text-lg ${trx.type === 'RECEIPT' ? 'text-emerald-400' : 'text-rose-400'}`} dir="ltr">
                          {trx.type === 'RECEIPT' ? '+' : '-'}{trx.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 rounded-l-2xl text-left border-y border-l border-white/5 group-hover:border-indigo-500/30 text-xs text-slate-500 font-mono">
                        {trx.po?.poNumber || trx.boqItem?.description || 'صرف/استلام حر'}
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODERN MODALS */}
      <AnimatePresence>
        {showGrnModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <motion.div initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.9, opacity:0}} className="bg-slate-900 border border-white/10 rounded-[2rem] p-8 w-full max-w-xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
              <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-5 relative z-10">
                <h2 className="text-2xl font-black text-white flex items-center gap-3"><ArrowDownToLine className="text-emerald-400" size={28}/> سند استلام مواد (GRN)</h2>
                <button onClick={() => setShowGrnModal(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-rose-500/20 hover:text-rose-400 transition-colors"><X size={20}/></button>
              </div>
              <form onSubmit={handleGrnSubmit} className="space-y-5 relative z-10">
                <div>
                   <label className="text-sm font-bold text-slate-400 mb-2 block">لصالح مستودع</label>
                   <select required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 text-white outline-none focus:border-emerald-500/50 transition-colors" onChange={e => setGrnForm({...grnForm, warehouseId: e.target.value})}>
                     <option value="">-- اختر المستودع --</option>
                     {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                   </select>
                </div>
                <div>
                   <label className="text-sm font-bold text-slate-400 mb-2 block">مربوط بأمر شراء (اختياري)</label>
                   <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 text-white outline-none focus:border-emerald-500/50 transition-colors" onChange={e => setGrnForm({...grnForm, poId: e.target.value})}>
                     <option value="">-- استلام حر بدون أمر شراء --</option>
                     {purchaseOrders.map(p => <option key={p.id} value={p.id}>{p.poNumber}</option>)}
                   </select>
                </div>
                <div className="grid grid-cols-2 gap-5">
                   <div>
                     <label className="text-sm font-bold text-slate-400 mb-2 block">المادة المستلمة</label>
                     <select required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 text-white outline-none focus:border-emerald-500/50 transition-colors" onChange={e => setGrnForm({...grnForm, materialId: e.target.value})}>
                       <option value="">-- اختر --</option>
                       {materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                     </select>
                   </div>
                   <div>
                     <label className="text-sm font-bold text-slate-400 mb-2 block">الكمية المستلمة</label>
                     <input required type="number" step="0.01" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 text-white outline-none focus:border-emerald-500/50 transition-colors font-mono text-lg" onChange={e => setGrnForm({...grnForm, quantity: e.target.value})} />
                   </div>
                </div>
                <div>
                   <label className="text-sm font-bold text-slate-400 mb-2 block">ملاحظات الفحص</label>
                   <input className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 text-white outline-none focus:border-emerald-500/50 transition-colors" onChange={e => setGrnForm({...grnForm, remarks: e.target.value})} placeholder="حالة المواد عند الاستلام..." />
                </div>
                <button type="submit" className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white py-4 rounded-xl font-black text-lg flex items-center justify-center gap-2 mt-6 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all hover:-translate-y-1">
                  <Save size={22} /> ترحيل السند وإضافة المواذ للرصيد
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {showMisModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <motion.div initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.9, opacity:0}} className="bg-slate-900 border border-white/10 rounded-[2rem] p-8 w-full max-w-xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-[80px] pointer-events-none" />
              <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-5 relative z-10">
                <h2 className="text-2xl font-black text-white flex items-center gap-3"><ArrowUpFromLine className="text-rose-400" size={28}/> سند صرف مواد (MIS)</h2>
                <button onClick={() => setShowMisModal(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-rose-500/20 hover:text-rose-400 transition-colors"><X size={20}/></button>
              </div>
              <form onSubmit={handleMisSubmit} className="space-y-5 relative z-10">
                <div>
                   <label className="text-sm font-bold text-slate-400 mb-2 block">من مستودع</label>
                   <select required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 text-white outline-none focus:border-rose-500/50 transition-colors" onChange={e => setMisForm({...misForm, warehouseId: e.target.value})}>
                     <option value="">-- اختر المستودع --</option>
                     {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                   </select>
                </div>
                <div>
                   <label className="text-sm font-bold text-slate-400 mb-2 block">لصالح مشروع (اختياري)</label>
                   <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 text-white outline-none focus:border-rose-500/50 transition-colors" onChange={e => setMisForm({...misForm, projectId: e.target.value})}>
                     <option value="">-- صرف حر بدون تحديد مشروع --</option>
                     {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                   </select>
                </div>
                <div className="grid grid-cols-2 gap-5">
                   <div>
                     <label className="text-sm font-bold text-slate-400 mb-2 block">المادة المُراد صرفها</label>
                     <select required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 text-white outline-none focus:border-rose-500/50 transition-colors" onChange={e => setMisForm({...misForm, materialId: e.target.value})}>
                       <option value="">-- اختر --</option>
                       {materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                     </select>
                   </div>
                   <div>
                     <label className="text-sm font-bold text-slate-400 mb-2 block">الكمية المصروفة</label>
                     <input required type="number" step="0.01" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 text-rose-400 outline-none focus:border-rose-500/50 transition-colors font-mono text-lg font-black" onChange={e => setMisForm({...misForm, quantity: e.target.value})} />
                   </div>
                </div>
                <button type="submit" className="w-full bg-gradient-to-r from-rose-600 to-pink-500 hover:from-rose-500 hover:to-pink-400 text-white py-4 rounded-xl font-black text-lg flex items-center justify-center gap-2 mt-6 shadow-[0_0_20px_rgba(225,29,72,0.3)] transition-all hover:-translate-y-1">
                  <ArrowUpFromLine size={22} /> صرف وخصم من الرصيد
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {showWarehouseModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <motion.div initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.9, opacity:0}} className="bg-slate-900 border border-white/10 rounded-[2rem] p-8 w-full max-w-lg shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />
              <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-5 relative z-10">
                <h2 className="text-2xl font-black text-white flex items-center gap-3"><Building2 className="text-indigo-400" size={28}/> إضافة مستودع جديد</h2>
                <button onClick={() => setShowWarehouseModal(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-rose-500/20 hover:text-rose-400 transition-colors"><X size={20}/></button>
              </div>
              <form onSubmit={handleWarehouseSubmit} className="space-y-5 relative z-10">
                <div>
                   <label className="text-sm font-bold text-slate-400 mb-2 block">اسم المستودع</label>
                   <input required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 text-white outline-none focus:border-indigo-500/50 transition-colors" placeholder="مثال: المستودع الرئيسي" onChange={e => setWarehouseForm({...warehouseForm, name: e.target.value})} />
                </div>
                <div>
                   <label className="text-sm font-bold text-slate-400 mb-2 block">موقع المستودع</label>
                   <input className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 text-white outline-none focus:border-indigo-500/50 transition-colors" placeholder="العنوان أو المربع..." onChange={e => setWarehouseForm({...warehouseForm, location: e.target.value})} />
                </div>
                <button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-500 hover:to-blue-400 text-white py-4 rounded-xl font-black text-lg flex items-center justify-center gap-2 mt-6 shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all hover:-translate-y-1">
                  <Plus size={22} /> إضافة واعتماد المستودع
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
