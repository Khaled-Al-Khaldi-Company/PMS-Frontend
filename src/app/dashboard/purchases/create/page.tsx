"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ShoppingCart, 
  Save, 
  ArrowRight, 
  Loader2, 
  PlusCircle,
  Trash2,
  Package,
  Building2,
  Calendar,
  User,
  CheckCircle2,
  Receipt
} from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";

export default function CreatePurchasePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    projectId: "",
    supplierName: "",
    expectedDate: "",
    hasVat: true,
    items: [{ materialName: "", unit: "حبه", qty: 1, price: 0 }]
  });

  useEffect(() => {
    fetchProjects();
    fetchSuppliers();
  }, []);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/v1/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(res.data);
      if (res.data.length > 0) {
        setFormData(prev => ({ ...prev, projectId: res.data[0].id }));
      }
    } catch (err) {}
  };

  const fetchSuppliers = async () => {
    try {
      const token = localStorage.getItem(`token");
      const res = await axios.get(`${API_BASE_URL}/v1/integration/daftra/pms-suppliers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuppliers(res.data);
    } catch (err) {}
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.qty * item.price), 0);
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { materialName: `", unit: "حبه", qty: 1, price: 0 }]
    });
  };

  const handleRemoveItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
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
        `${API_BASE_URL}/v1/purchases`,
        {
          ...formData,
          expectedDate: formData.expectedDate ? new Date(formData.expectedDate).toISOString() : undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      router.push(`/dashboard/purchases");
    } catch (err: any) {
      alert("حدث خطأ أثناء رفع أمر الشراء.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 w-full animate-in fade-in zoom-in-95 duration-500 pb-12 relative">
      {/* Background glow */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <button onClick={() => router.back()} className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-slate-300 hover:text-white transition-all shadow-lg hover:-translate-x-1">
            <ArrowRight size={22} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3 drop-shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-blue-500/10 flex items-center justify-center border border-indigo-500/20 shadow-lg">
                <ShoppingCart className="text-indigo-400" size={24} />
              </div>
              إنشاء طلب شراء (PO)
            </h1>
            <p className="text-slate-400 text-sm mt-2 font-medium">إنشاء أمر استعاضة أو شراء مواد للمشروع وربطها بالمورد.</p>
          </div>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-dark border border-white/5 rounded-3xl p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-300 flex items-center gap-2">
                <Building2 size={16} className="text-indigo-400" />
                المشروع المستهدف بالمورد
              </label>
              <div className="relative">
                <select
                  required
                  value={formData.projectId}
                  onChange={e => setFormData({...formData, projectId: e.target.value})}
                  className="w-full bg-slate-950/50 border border-white/10 hover:border-indigo-500/30 rounded-xl py-3.5 px-4 text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none cursor-pointer shadow-inner"
                >
                  <option value="" disabled className="bg-slate-900">-- اختر المشروع --</option>
                  {projects.map(p => <option key={p.id} value={p.id} className="bg-slate-900">{p.name}</option>)}
                </select>
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">▼</div>
              </div>
            </div>

            <div className="space-y-3 md:col-span-2">
              <label className="text-sm font-bold text-indigo-300 flex items-center gap-2">
                <User size={16} className="text-indigo-400" />
                المورد المعتمد / المحتمل (Supplier)
              </label>
              <input 
                type="text" 
                list="suppliersDropdown"
                required 
                value={formData.supplierName} 
                onChange={e => setFormData({...formData, supplierName: e.target.value})} 
                className="w-full bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/20 hover:border-indigo-500/40 rounded-xl py-3.5 px-4 text-white font-medium placeholder-indigo-300/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-inner" 
                placeholder="اختر أو اكتب اسم المورد..." 
                autoComplete="off"
              />
              <datalist id="suppliersDropdown">
                {suppliers.map(s => <option key={s.id} value={s.name}>{s.daftraSupplierId ? `✅ مربوط بدفترة' : ''}</option>)}
              </datalist>
            </div>

            <div className="space-y-3 md:col-span-3 lg:col-span-1">
              <label className="text-sm font-bold text-slate-300 flex items-center gap-2">
                <Calendar size={16} className="text-indigo-400" />
                تاريخ التوريد المتوقع بالموقع
              </label>
              <input type="date" required value={formData.expectedDate} onChange={e => setFormData({...formData, expectedDate: e.target.value})} className="w-full bg-slate-950/50 border border-white/10 hover:border-indigo-500/30 rounded-xl py-3.5 px-4 text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-inner" style={{ colorScheme: 'dark' }} />
            </div>
          </div>

          <div className="border border-white/5 rounded-3xl overflow-hidden bg-gradient-to-b from-slate-900/50 to-slate-950/50 w-full p-6 shadow-xl relative">
            <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-xl text-white flex items-center gap-2 drop-shadow-sm">
                <Package className="text-indigo-400" size={24} />
                قائمة المواد المطلوبة
              </h3>
              <button type="button" onClick={handleAddItem} className="flex items-center gap-2 text-sm font-bold text-white bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 px-4 py-2 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/20">
                <PlusCircle size={18} /> إضافة مادة
              </button>
            </div>

            <div className="space-y-3">
              {/* Header Row for large screens */}
              <div className="hidden md:flex items-center gap-3 px-3 py-2 text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">
                <div className="flex-1">بيان وصنف المادة</div>
                <div className="w-28 text-center">الوحدة</div>
                <div className="w-28 text-center">الكمية</div>
                <div className="w-32 text-center">الإفرادي (SAR)</div>
                <div className="w-40 text-center text-indigo-300">الإجمالي (SAR)</div>
                <div className="w-10"></div>
              </div>

              {formData.items.map((item, index) => (
                <div key={index} className="flex flex-col md:flex-row items-center gap-3 w-full bg-slate-950/40 hover:bg-slate-900/60 p-3 rounded-2xl border border-white/5 transition-colors group">
                  <div className="flex-1 w-full relative">
                    <span className="md:hidden text-xs text-slate-500 font-bold mb-1 block">الصنف</span>
                    <input type="text" required value={item.materialName} onChange={e => handleItemChange(index, "materialName", e.target.value)} placeholder="وصف واسم المادة..." className="w-full bg-slate-900/50 border border-white/10 hover:border-white/20 rounded-xl py-2.5 px-4 text-sm font-bold text-white focus:outline-none focus:border-indigo-500 transition-colors shadow-inner" />
                  </div>
                  <div className="w-full md:w-28 relative">
                     <span className="md:hidden text-xs text-slate-500 font-bold mb-1 block">الوحدة</span>
                     <input type="text" required value={item.unit} onChange={e => handleItemChange(index, "unit", e.target.value)} placeholder="حبه / لفة..." className="w-full bg-slate-900/50 border border-white/10 hover:border-white/20 rounded-xl py-2.5 px-4 text-sm font-bold text-white text-center focus:outline-none focus:border-indigo-500 transition-colors shadow-inner" />
                  </div>
                  <div className="w-full md:w-28 relative">
                     <span className="md:hidden text-xs text-slate-500 font-bold mb-1 block">الكمية</span>
                     <input type="number" required min="1" value={item.qty} onChange={e => handleItemChange(index, "qty", Number(e.target.value))} className="w-full bg-emerald-500/5 border border-emerald-500/20 hover:border-emerald-500/40 rounded-xl py-2.5 px-4 text-sm font-bold text-emerald-400 text-center focus:outline-none focus:border-emerald-500 transition-colors font-mono shadow-inner" />
                  </div>
                  <div className="w-full md:w-32 relative">
                     <span className="md:hidden text-xs text-slate-500 font-bold mb-1 block">السعر الإفرادي</span>
                     <input type="number" required min="0" step="any" value={item.price} onChange={e => handleItemChange(index, "price", Number(e.target.value))} className="w-full bg-amber-500/5 border border-amber-500/20 hover:border-amber-500/40 rounded-xl py-2.5 px-4 text-sm font-bold text-amber-400 text-center focus:outline-none focus:border-amber-500 transition-colors font-mono shadow-inner" />
                  </div>
                  <div className="w-full md:w-40 relative">
                    <span className="md:hidden text-xs text-slate-500 font-bold mb-1 block">الإجمالي</span>
                    <div className="w-full px-4 py-2.5 bg-indigo-500/10 rounded-xl text-center font-black text-indigo-300 font-mono text-base border border-indigo-500/20 shadow-inner">
                      {(item.qty * item.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="w-full md:w-10 flex justify-end md:justify-center mt-2 md:mt-0">
                    {index > 0 ? (
                      <button type="button" onClick={() => handleRemoveItem(index)} className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors shrink-0">
                        <Trash2 size={20} />
                      </button>
                    ) : (
                      <div className="w-9 h-9" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col md:flex-row justify-between items-start md:items-center bg-gradient-to-r from-indigo-900/40 to-slate-900 p-6 rounded-2xl border border-indigo-500/20 shadow-xl relative overflow-hidden">
               <div className="absolute inset-0 bg-indigo-500/5" />
               <div className="flex flex-col gap-4 relative z-10 mb-6 md:mb-0">
                 <div className="flex items-center gap-3">
                   <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30">
                     <Receipt size={24} />
                   </div>
                   <span className="font-bold text-xl text-slate-300">ملخص أمر الشراء (SAR)</span>
                 </div>
                 
                 {/* VAT Toggle */}
                 <div className="flex items-center gap-3 mt-2 pr-2">
                   <label className="relative inline-flex items-center cursor-pointer">
                     <input type="checkbox" className="sr-only peer" checked={formData.hasVat} onChange={e => setFormData({...formData, hasVat: e.target.checked})} />
                     <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                   </label>
                   <span className="text-sm font-bold text-indigo-300">يخضع لضريبة القيمة المضافة (15%)</span>
                 </div>
               </div>

               <div className="relative z-10 flex flex-col items-end gap-2">
                 {formData.hasVat && (
                   <>
                     <div className="flex justify-between w-48 text-sm text-slate-400 font-medium"><span>المجموع:</span> <span className="font-mono">{calculateTotal().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                     <div className="flex justify-between w-48 text-sm text-rose-400 font-medium"><span>الضريبة (15%):</span> <span className="font-mono">{(calculateTotal() * 0.15).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                     <div className="w-48 h-px bg-white/10 my-1 rounded-full"></div>
                   </>
                 )}
                 <div className="flex justify-between w-64 text-xl">
                   <span className="font-bold text-slate-300 mt-1">الإجمالي:</span>
                   <span className="font-mono text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-indigo-500 drop-shadow-lg tracking-wider">
                     {(formData.hasVat ? calculateTotal() * 1.15 : calculateTotal()).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                   </span>
                 </div>
               </div>
            </div>
          </div>

          <div className="pt-8 flex gap-4 justify-end">
             <button type="button" onClick={() => router.back()} className="px-6 py-3 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all">
               إلغاء
             </button>
            <button type="submit" disabled={isLoading} className="flex items-center gap-2 px-10 py-3 rounded-xl font-black bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] transition-all hover:-translate-y-1 disabled:opacity-50 disabled:translate-y-0 text-lg">
              {isLoading ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />}
              <span>اعتماد طلب الـ PO المبدئي</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
