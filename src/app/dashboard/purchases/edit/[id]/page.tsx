"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
  Receipt
} from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";

export default function EditPurchasePage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    fetchData();
  }, [orderId]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const [pos, mats, projs, orderRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/v1/integration/daftra/pms-suppliers`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/v1/projects`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/v1/purchases/${orderId}`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      setSuppliers(pos.data);
      setProjects(projs.data.items || projs.data);
      
      const ord = orderRes.data;
      if (ord.status !== 'PENDING') {
        alert("لا يمكن تعديل طلب شراء معتمد أو ملغي.");
        router.back();
        return;
      }

      setFormData({
        projectId: ord.projectId,
        supplierName: ord.supplier?.name || "",
        expectedDate: ord.expectedDate ? new Date(ord.expectedDate).toISOString().split('T')[0] : "",
        hasVat: Number(ord.taxAmount) > 0,
        items: ord.items.map((it: any) => ({
          materialName: it.material?.name || "",
          unit: it.material?.unit || "حبه",
          qty: it.quantity,
          price: it.unitPrice
        }))
      });
    } catch (err) {
      alert("تعذر جلب بيانات الطلب");
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.qty * item.price), 0);
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { materialName: "", unit: "حبه", qty: 1, price: 0 }]
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
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${API_BASE_URL}/v1/purchases/${orderId}`,
        {
          ...formData,
          expectedDate: formData.expectedDate ? new Date(formData.expectedDate).toISOString() : undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      router.push("/dashboard/purchases");
    } catch (err: any) {
      alert("حدث خطأ أثناء تحديث أمر الشراء.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
         <Loader2 className="animate-spin text-indigo-500 mb-4" size={48} />
         <p className="text-slate-400 font-bold">جاري تحميل بيانات الطلب...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 w-full animate-in fade-in zoom-in-95 duration-500 pb-12 relative">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <button onClick={() => router.back()} className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-slate-300 hover:text-white transition-all shadow-lg hover:-translate-x-1">
            <ArrowRight size={22} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3 drop-shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/10 flex items-center justify-center border border-blue-500/20 shadow-lg">
                <ShoppingCart className="text-blue-400" size={24} />
              </div>
              تعديل طلب الشراء
            </h1>
          </div>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-dark border border-white/5 rounded-3xl p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-300 flex items-center gap-2">
                <Building2 size={16} className="text-indigo-400" />
                المشروع المستهدف
              </label>
              <select
                required
                value={formData.projectId}
                onChange={e => setFormData({...formData, projectId: e.target.value})}
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3.5 px-4 text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all cursor-pointer shadow-inner"
              >
                <option value="" disabled>-- اختر المشروع --</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            <div className="space-y-3 md:col-span-2">
              <label className="text-sm font-bold text-indigo-300 flex items-center gap-2">
                <User size={16} className="text-indigo-400" />
                المورد (Supplier)
              </label>
              <input 
                type="text" 
                list="suppliersDropdown"
                required 
                value={formData.supplierName} 
                onChange={e => setFormData({...formData, supplierName: e.target.value})} 
                className="w-full bg-indigo-500/5 border border-indigo-500/20 rounded-xl py-3.5 px-4 text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-inner" 
                placeholder="اسم المورد..." 
              />
              <datalist id="suppliersDropdown">
                {suppliers.map(s => <option key={s.id} value={s.name}>{s.daftraSupplierId ? '✅ مربوط بدفترة' : ''}</option>)}
              </datalist>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-300 flex items-center gap-2">
                <Calendar size={16} className="text-indigo-400" />
                تاريخ التوريد المتوقع
              </label>
              <input type="date" required value={formData.expectedDate} onChange={e => setFormData({...formData, expectedDate: e.target.value})} className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3.5 px-4 text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-inner" style={{ colorScheme: 'dark' }} />
            </div>
          </div>

          <div className="border border-white/5 rounded-3xl overflow-hidden bg-gradient-to-b from-slate-900/50 to-slate-950/50 w-full p-6 shadow-xl relative">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-xl text-white flex items-center gap-2 drop-shadow-sm">
                <Package className="text-indigo-400" size={24} />
                قائمة المواد
              </h3>
              <button type="button" onClick={handleAddItem} className="flex items-center gap-2 text-sm font-bold text-white bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 px-4 py-2 rounded-xl transition-all shadow-lg">
                <PlusCircle size={18} /> إضافة مادة
              </button>
            </div>

            <div className="space-y-3">
              {formData.items.map((item, index) => (
                <div key={index} className="flex flex-col md:flex-row items-center gap-3 w-full bg-slate-950/40 p-3 rounded-2xl border border-white/5 transition-colors group">
                  <div className="flex-1 w-full relative">
                    <input type="text" required value={item.materialName} onChange={e => handleItemChange(index, "materialName", e.target.value)} placeholder="اسم المادة..." className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 px-4 text-sm font-bold text-white focus:outline-none focus:border-indigo-500 transition-colors shadow-inner" />
                  </div>
                  <div className="w-full md:w-28 relative">
                     <input type="text" required value={item.unit} onChange={e => handleItemChange(index, "unit", e.target.value)} placeholder="الوحدة" className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 px-4 text-sm font-bold text-white text-center focus:outline-none shadow-inner" />
                  </div>
                  <div className="w-full md:w-28 relative">
                     <input type="number" required min="1" value={item.qty} onChange={e => handleItemChange(index, "qty", Number(e.target.value))} className="w-full bg-emerald-500/5 border border-emerald-500/20 rounded-xl py-2.5 px-4 text-sm font-bold text-emerald-400 text-center font-mono shadow-inner" />
                  </div>
                  <div className="w-full md:w-32 relative">
                     <input type="number" required min="0" step="any" value={item.price} onChange={e => handleItemChange(index, "price", Number(e.target.value))} className="w-full bg-amber-500/5 border border-amber-500/20 rounded-xl py-2.5 px-4 text-sm font-bold text-amber-400 text-center font-mono shadow-inner" />
                  </div>
                  <div className="w-full md:w-40 relative">
                    <div className="w-full px-4 py-2.5 bg-indigo-500/10 rounded-xl text-center font-black text-indigo-300 font-mono text-base border border-indigo-500/20 shadow-inner">
                      {(item.qty * item.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="w-full md:w-10 flex justify-end md:justify-center">
                    {formData.items.length > 1 && (
                      <button type="button" onClick={() => handleRemoveItem(index)} className="p-2 text-slate-500 hover:text-rose-400 rounded-xl transition-colors">
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col md:flex-row justify-between items-start md:items-center bg-gradient-to-r from-indigo-900/40 to-slate-900 p-6 rounded-2xl border border-indigo-500/20 shadow-xl relative overflow-hidden">
               <div className="flex flex-col gap-4 relative z-10 mb-6 md:mb-0">
                 <div className="flex items-center gap-3">
                   <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30">
                     <Receipt size={24} />
                   </div>
                   <span className="font-bold text-xl text-slate-300">ملخص أمر الشراء (SAR)</span>
                 </div>
                 <div className="flex items-center gap-3 mt-2 pr-2">
                   <label className="relative inline-flex items-center cursor-pointer">
                     <input type="checkbox" className="sr-only peer" checked={formData.hasVat} onChange={e => setFormData({...formData, hasVat: e.target.checked})} />
                     <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:bg-indigo-500"></div>
                   </label>
                   <span className="text-sm font-bold text-indigo-300">يخضع للضريبة (15%)</span>
                 </div>
               </div>

               <div className="relative z-10 flex flex-col items-end gap-2">
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
            <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-10 py-3 rounded-xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all hover:-translate-y-1 disabled:opacity-50 text-lg">
              {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />}
              <span>تحديث البيانات</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
