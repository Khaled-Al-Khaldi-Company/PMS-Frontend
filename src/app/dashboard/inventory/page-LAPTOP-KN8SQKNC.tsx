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
  ArrowUpFromLine
} from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";

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
      setPurchaseOrders(pos.data.filter((p:any) => p.status === 'APPROVED' || p.status === 'PENDING'));
      
      // ONLY physical materials (NOT services/equipment) can enter a warehouse
      const physicalMats = mats.data.filter((m:any) => m.type !== 'SERVICE');
      setMaterials(physicalMats);
      
      setProjects(projs.data);
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
    } catch (e) { alert("حدث خطأ"); }
  };

  if (isLoading) return <div className="p-12 text-center text-slate-400">جاري تحميل بيانات المخازن...</div>;

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-12 animate-in-erp">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/20">
              <Building2 className="text-indigo-400" size={24} />
            </div>
            إدارة المخازن ومواد الموقع
          </h1>
          <p className="text-slate-400 text-sm mt-2">تسجيل الاستلامات، حركات الصرف للمشاريع، ومراقبة المخزون</p>
        </div>
        
        <div className="flex gap-2">
          <button onClick={() => setShowWarehouseModal(true)} className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all border border-slate-700">
            <Plus size={18} /> مستودع جديد
          </button>
          <button onClick={() => setShowGrnModal(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all">
            <ArrowDownToLine size={18} /> سند استلام (GRN)
          </button>
          <button onClick={() => setShowMisModal(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all">
            <ArrowUpFromLine size={18} /> سند صرف مواد
          </button>
        </div>
      </div>

      {/* SAP Fiori Style Tabs */}
      <div className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-white/5 w-fit">
        <button 
          onClick={() => setActiveTab("STOCKS")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'STOCKS' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
        >
          <PackageSearch size={18} /> الأرصدة الحالية
        </button>
        <button 
          onClick={() => setActiveTab("TRANSACTIONS")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'TRANSACTIONS' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
        >
          <ArrowRightLeft size={18} /> حركة المواد (السجل)
        </button>
      </div>

      {/* Content Area */}
      <div className="glass-dark border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
        
        {/* WAREHOUSE SELECTOR (Common for Stocks) */}
        {activeTab === "STOCKS" && (
          <div className="p-6 border-b border-white/5 bg-white/5 flex gap-4 items-center">
            <span className="text-slate-300 font-bold">عرض مستودع:</span>
            <select 
              className="bg-slate-900 border border-slate-700 text-white px-4 py-2 rounded-xl outline-none"
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
            >
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>{w.name} {w.project ? `(موقع: ${w.project.name})' : '(مستودع رئيسي)'}</option>
              ))}
            </select>
          </div>
        )}

        <div className="overflow-x-auto custom-scrollbar">
          {activeTab === "STOCKS" && (
            <table className="enterprise-table">
              <thead>
                <tr>
                  <th>كود المادة</th>
                  <th>اسم المادة</th>
                  <th>الوحدة</th>
                  <th className="text-left">الرصيد الفعلي</th>
                </tr>
              </thead>
              <tbody>
                {stocks.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-12 text-slate-500">لا يوجد أرصدة في هذا المستودع</td></tr>
                ) : (
                  stocks.map((stock) => (
                    <tr key={stock.id}>
                      <td className="font-mono text-slate-400 text-xs">{stock.material.code}</td>
                      <td className="font-bold text-white">{stock.material.name}</td>
                      <td><span className="badge-erp bg-slate-800 text-slate-300 border-slate-700">{stock.material.unit}</span></td>
                      <td className="text-left font-black text-lg text-emerald-400" dir="ltr">{stock.quantity}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeTab === "TRANSACTIONS" && (
            <table className="enterprise-table">
              <thead>
                <tr>
                  <th>التاريخ</th>
                  <th>الرقم المرجعي</th>
                  <th>الحركة</th>
                  <th>المستودع</th>
                  <th>المادة</th>
                  <th className="text-left">الكمية</th>
                  <th>أمر الشراء / البند</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-slate-500">لا توجد حركات مسجلة</td></tr>
                ) : (
                  transactions.map((trx) => (
                    <tr key={trx.id}>
                      <td className="text-sm text-slate-400 whitespace-nowrap">{new Date(trx.date).toLocaleDateString('ar-EG')}</td>
                      <td className="font-mono text-xs text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded inline-block mt-2">{trx.referenceNo}</td>
                      <td>
                        {trx.type === 'RECEIPT' 
                          ? <span className="badge-erp text-emerald-400 border-emerald-400/30 bg-emerald-400/10"><ArrowDownToLine size={12}/> استلام</span>
                          : <span className="badge-erp text-rose-400 border-rose-400/30 bg-rose-400/10"><ArrowUpFromLine size={12}/> صرف لموقع</span>
                        }
                      </td>
                      <td className="text-sm">{trx.warehouse.name}</td>
                      <td className="font-bold">{trx.material.name}</td>
                      <td className="text-left font-black" dir="ltr">
                        <span className={trx.type === 'RECEIPT' ? 'text-emerald-400' : 'text-rose-400'}>
                          {trx.type === 'RECEIPT' ? '+' : ''}{trx.quantity}
                        </span>
                      </td>
                      <td className="text-xs text-slate-400 max-w-[200px] truncate">
                        {trx.po?.poNumber || trx.boqItem?.description || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* GRN Modal */}
      {showGrnModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#18181b] border border-white/10 rounded-3xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2"><ArrowDownToLine className="text-emerald-400" /> تسجيل استلام مواد (GRN)</h2>
              <button onClick={() => setShowGrnModal(false)} className="text-slate-400 hover:text-white"><X /></button>
            </div>
            <form onSubmit={handleGrnSubmit} className="space-y-4">
              <div>
                 <label className="text-xs text-slate-400 mb-1 block">لصالح مستودع</label>
                 <select required className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none" onChange={e => setGrnForm({...grnForm, warehouseId: e.target.value})}>
                   <option value="">-- اختر المستودع --</option>
                   {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                 </select>
              </div>
              <div>
                 <label className="text-xs text-slate-400 mb-1 block">مربوط بأمر شراء (اختياري)</label>
                 <select className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none" onChange={e => setGrnForm({...grnForm, poId: e.target.value})}>
                   <option value="">-- استلام حر بدون PO --</option>
                   {purchaseOrders.map(p => <option key={p.id} value={p.id}>{p.poNumber}</option>)}
                 </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="text-xs text-slate-400 mb-1 block">المادة المستلمة</label>
                   <select required className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none" onChange={e => setGrnForm({...grnForm, materialId: e.target.value})}>
                     <option value="">-- اختر --</option>
                     {materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                   </select>
                 </div>
                 <div>
                   <label className="text-xs text-slate-400 mb-1 block">الكمية المستلمة الفعليا</label>
                   <input required type="number" step="0.01" className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none" onChange={e => setGrnForm({...grnForm, quantity: e.target.value})} />
                 </div>
              </div>
              <div>
                 <label className="text-xs text-slate-400 mb-1 block">ملاحظات الفحص</label>
                 <input className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none" onChange={e => setGrnForm({...grnForm, remarks: e.target.value})} />
              </div>
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 mt-4">
                <Save size={18} /> ترحيل السند وإضافة المواذ للرصيد
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MIS Modal */}
      {showMisModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#18181b] border border-white/10 rounded-3xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2"><ArrowUpFromLine className="text-indigo-400" /> صرف مواد لموقع (MIS)</h2>
              <button onClick={() => setShowMisModal(false)} className="text-slate-400 hover:text-white"><X /></button>
            </div>
            <form onSubmit={handleMisSubmit} className="space-y-4">
              <div>
                 <label className="text-xs text-slate-400 mb-1 block">من مستودع</label>
                 <select required className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none" onChange={e => setMisForm({...misForm, warehouseId: e.target.value})}>
                   <option value="">-- اختر المستودع --</option>
                   {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                 </select>
              </div>
              <div>
                 <label className="text-xs text-slate-400 mb-1 block">لصالح مشروع (اختياري)</label>
                 <select className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none" onChange={e => setMisForm({...misForm, projectId: e.target.value})}>
                   <option value="">-- صرف حر للإدارة --</option>
                   {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                 </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="text-xs text-slate-400 mb-1 block">المادة المُراد صرفها</label>
                   <select required className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none" onChange={e => setMisForm({...misForm, materialId: e.target.value})}>
                     <option value="">-- اختر --</option>
                     {materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                   </select>
                 </div>
                 <div>
                   <label className="text-xs text-slate-400 mb-1 block">الكمية المصروفة</label>
                   <input required type="number" step="0.01" className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none" onChange={e => setMisForm({...misForm, quantity: e.target.value})} />
                 </div>
              </div>
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 mt-4">
                <ArrowUpFromLine size={18} /> صرف وخصم من الرصيد
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Create Warehouse Modal */}
      {showWarehouseModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#18181b] border border-white/10 rounded-3xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2"><Building2 className="text-indigo-400" /> إضافة مستودع جديد</h2>
              <button onClick={() => setShowWarehouseModal(false)} className="text-slate-400 hover:text-white"><X /></button>
            </div>
            <form onSubmit={handleWarehouseSubmit} className="space-y-4">
              <div>
                 <label className="text-xs text-slate-400 mb-1 block">اسم المستودع</label>
                 <input required className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none" placeholder="مثال: المستودع الرئيسي" onChange={e => setWarehouseForm({...warehouseForm, name: e.target.value})} />
              </div>
              <div>
                 <label className="text-xs text-slate-400 mb-1 block">موقع المستودع</label>
                 <input className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none" onChange={e => setWarehouseForm({...warehouseForm, location: e.target.value})} />
              </div>
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 mt-4">
                <Plus size={18} /> حفظ المستودع
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
