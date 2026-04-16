"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FileSignature, Save, ArrowRight, Loader2, Wallet } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";

export default function CreateContractPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [projectBoq, setProjectBoq] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [showBoqSelector, setShowBoqSelector] = useState(false);
  
  const [formData, setFormData] = useState({
    projectId: "",
    subcontractorId: "",
    type: "SUBCONTRACT",
    referenceNumber: "",
    totalValue: 0,
    retentionPercent: 5,
    advancePayment: 10
  });

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
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/v1/contacts/suppliers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuppliers(res.data);
      if (res.data.length > 0) {
        setFormData(prev => ({ ...prev, subcontractorId: res.data[0].id }));
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchProjects();
    fetchSuppliers();
  }, []);

  useEffect(() => {
    if (formData.projectId) {
      fetchProjectBoq(formData.projectId);
      setSelectedItems([]); // reset items if project changes
    }
  }, [formData.projectId]);

  const fetchProjectBoq = async (pid: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/v1/projects/${pid}/boq`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjectBoq(res.data);
    } catch (err) {}
  };

  const handleAddItem = (item: any) => {
    if (selectedItems.find(it => it.boqItemId === item.id)) return;
    
    // Calculate committed quantity from OTHER contracts
    const committedToOthers = (item.contractItems || []).reduce((acc: any, ci: any) => acc + Number(ci.assignedQty), 0);
    const remaining = Math.max(0, item.quantity - committedToOthers);

    setSelectedItems([...selectedItems, {
      boqItemId: item.id,
      description: item.description,
      unit: item.unit,
      assignedQty: remaining, // default to what is actually available!
      unitPrice: item.unitPrice, 
    }]);
    setShowBoqSelector(false);
  };

  const removeItem = (id: string) => {
    setSelectedItems(selectedItems.filter(it => it.boqItemId !== id));
  };

  const updateItemValue = (id: string, field: string, value: string) => {
    setSelectedItems(prev => prev.map(it => 
      it.boqItemId === id ? { ...it, [field]: value } : it
    ));
  };

  // Auto-calculate Total Value
  const calculatedTotal = selectedItems.reduce((acc, it) => acc + (Number(it.assignedQty) * Number(it.unitPrice)), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_BASE_URL}/v1/contracts`,
        { ...formData, items: selectedItems, totalValue: calculatedTotal },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      router.push("/dashboard/contracts");
    } catch (err: any) {
      const errData = err.response?.data || err.message;
      alert(`حدث خطأ أثناء حفظ العقد:\n${typeof errData === 'object' ? JSON.stringify(errData, null, 2) : errData}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 w-full animate-in fade-in zoom-in-95 duration-500 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors">
            <ArrowRight size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <FileSignature className="text-orange-500" size={24} />
              تسجيل عقد جديد
            </h1>
            <p className="text-slate-400 text-sm mt-1">تأسيس عقد مقاول باطن أو مورد وربطه بالمشروع.</p>
          </div>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-dark border border-white/5 rounded-3xl p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">المشروع المرتبط</label>
              <select
                required
                value={formData.projectId}
                onChange={e => setFormData({...formData, projectId: e.target.value})}
                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all appearance-none cursor-pointer"
              >
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">رقم العقد المرجعي (REF)</label>
              <input type="text" required value={formData.referenceNumber} onChange={e => setFormData({...formData, referenceNumber: e.target.value})} className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all" placeholder="CT-2026-X01" dir="ltr" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-300">نوع العقد (التوجيه المحاسبي)</label>
               <select
                required
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value})}
                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all appearance-none cursor-pointer"
              >
                <option value="SUBCONTRACT">عقد مقاول باطن (مشتريات/مصروف)</option>
                <option value="MAIN_CONTRACT">عقد رئيسي مع المالك (مبيعات/إيراد)</option>
              </select>
            </div>

            {formData.type === "SUBCONTRACT" && (
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-slate-300">اختر مقاول الباطن / المورد</label>
                <select
                  required
                  value={formData.subcontractorId}
                  onChange={e => setFormData({...formData, subcontractorId: e.target.value})}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all appearance-none cursor-pointer"
                >
                  <option value="" disabled>اختر المقاول من القائمة الإدارية</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} {s.daftraSupplierId ? '(مربوط)' : '(غير مربوط)'}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">يجب أن يكون المقاول مربوطاً بدفترة لتتمكن من ترحيل مستخلصاته لاحقاً.</p>
              </div>
            )}

            <div className="space-y-4 border border-blue-500/30 p-5 rounded-3xl bg-blue-500/5 col-span-1 md:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-blue-400 flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                   بنود وجدول كميات العقد (Scope of Work)
                </label>
                <button 
                  type="button"
                  onClick={() => setShowBoqSelector(true)}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg flex items-center gap-2"
                >
                  <span className="text-lg">+</span> إضافة بند من المشروع
                </button>
              </div>

              {selectedItems.length === 0 ? (
                <div className="py-10 text-center text-slate-500 border-2 border-dashed border-white/5 rounded-2xl">
                  لم يتم إضافة بنود للعقد بعد. اضغط على زر الإضافة لاختيار مهام من جدول كميات المشروع.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs text-slate-300">
                    <thead className="border-b border-white/10 uppercase font-bold text-[10px] text-slate-500">
                      <tr>
                        <th className="pb-3 pr-2">وصف البند</th>
                        <th className="pb-3 text-center">الكمية المسندة</th>
                        <th className="pb-3 text-center">سعر المتر (مقاول)</th>
                        <th className="pb-3 text-left">إجمالي البند</th>
                        <th className="pb-3 text-center w-10">#</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {selectedItems.map((it) => (
                        <tr key={it.boqItemId} className="group transition-colors hover:bg-white/5">
                          <td className="py-4 pr-2">
                            <p className="font-bold text-white mb-0.5">{it.description}</p>
                            <p className="text-[10px] text-slate-500 font-mono italic">Unit: {it.unit}</p>
                          </td>
                          <td className="py-4 text-center">
                            <input 
                              type="number" 
                              value={it.assignedQty} 
                              onChange={e => updateItemValue(it.boqItemId, 'assignedQty', e.target.value)}
                              className="w-20 bg-slate-900 border border-slate-700 rounded-lg text-center py-1.5 font-mono text-emerald-400 focus:outline-none focus:border-emerald-500/50 transition-all"
                            />
                          </td>
                          <td className="py-4 text-center">
                            <input 
                              type="number" 
                              value={it.unitPrice} 
                              onChange={e => updateItemValue(it.boqItemId, 'unitPrice', e.target.value)}
                              className="w-24 bg-slate-900 border border-slate-700 rounded-lg text-center py-1.5 font-mono text-blue-400 focus:outline-none focus:border-blue-500/50 transition-all"
                            />
                          </td>
                          <td className="py-4 text-left font-mono font-bold text-white text-[13px]">
                            {(Number(it.assignedQty) * Number(it.unitPrice)).toLocaleString(undefined, {minimumFractionDigits: 2})}
                          </td>
                          <td className="py-4 text-center">
                            <button type="button" onClick={() => removeItem(it.boqItemId)} className="p-1.5 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all">
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-blue-500/20">
                        <td colSpan={3} className="py-5 text-left font-bold text-slate-400">إجمالي قيمة العقد (تلقائي):</td>
                        <td className="py-5 text-left font-mono font-black text-blue-400 text-xl">
                          <span className="text-xs text-slate-500 mr-1">SAR</span>
                          {calculatedTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>

            {/* BOQ Selector Modal */}
            {showBoqSelector && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-slate-900 border border-white/10 w-full max-w-3xl rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] -z-10" />
                  
                  <div className="flex justify-between items-center mb-8">
                    <div>
                        <h3 className="text-2xl font-black text-white">جدول كميات المشروع</h3>
                        <p className="text-sm text-slate-400 mt-1">اختر البنود التي تود إسنادها لهذا المقاول</p>
                    </div>
                    <button onClick={() => setShowBoqSelector(false)} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/5 text-slate-400 hover:text-white transition-colors">✕</button>
                  </div>
                  
                  <div className="max-h-[450px] overflow-y-auto space-y-3 pr-4 custom-scrollbar">
                    {projectBoq.length === 0 ? (
                      <div className="text-center py-20 text-slate-500 flex flex-col items-center gap-4">
                         <div className="p-4 rounded-full bg-white/5"><Loader2 className="animate-spin text-slate-400" /></div>
                         <p>لا توجد بنود متاحة حالياً في المشروع.</p>
                      </div>
                    ) : (
                      projectBoq.map(it => {
                        const committed = (it.contractItems || []).reduce((acc: number, ci: any) => acc + ci.assignedQty, 0);
                        const remaining = it.quantity - committed;
                        const isFullyAssigned = remaining <= 0;

                        return (
                          <div 
                            key={it.id} 
                            onClick={() => !isFullyAssigned && handleAddItem(it)}
                            className={`p-5 rounded-[1.5rem] border transition-all cursor-pointer flex justify-between items-center group ${
                              selectedItems.find(sel => sel.boqItemId === it.id) || isFullyAssigned
                                ? "bg-slate-800/30 border-slate-700/50 opacity-30 grayscale pointer-events-none" 
                                : "bg-slate-800/80 border-white/5 hover:border-blue-500/50 hover:bg-slate-700/50 hover:scale-[1.01]"
                            }`}
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                  <span className="px-2 py-0.5 rounded-md bg-slate-700 text-slate-400 font-mono text-[10px] uppercase">{it.itemCode}</span>
                                  <p className="text-white font-bold text-base">{it.description}</p>
                                  {isFullyAssigned && <span className="bg-rose-500/10 text-rose-500 text-[10px] px-2 py-0.5 rounded-full border border-rose-500/20">تم إسناده بالكامل</span>}
                              </div>
                              
                              <div className="flex items-center gap-4 mt-2">
                                <div className="text-[10px] text-slate-500">
                                   إجمالي المشروع: <span className="text-white font-mono">{it.quantity}</span>
                                </div>
                                <div className="text-[10px] text-amber-500/70">
                                   تم إسناده مسبقاً: <span className="text-amber-500 font-mono">{committed}</span>
                                </div>
                                <div className="text-[10px] text-emerald-500/70">
                                   المتبقي: <span className="text-emerald-500 font-mono font-bold">{remaining}</span>
                                </div>
                              </div>
                            </div>
                            <div className="mr-4">
                               {!isFullyAssigned && (
                                 <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-soft font-bold text-xl">+</div>
                               )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </motion.div>
              </div>
            )}

            <div className="space-y-4 border border-white/5 p-6 rounded-3xl bg-slate-900/50">
              <label className="text-sm font-bold text-amber-400 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  نسبة الدفعة المقدمة (%)
              </label>
              <input type="number" required min="0" max="100" value={formData.advancePayment} onChange={e => setFormData({...formData, advancePayment: Number(e.target.value)})} className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-mono" />
            </div>

            <div className="space-y-4 border border-white/5 p-6 rounded-3xl bg-slate-900/50">
              <label className="text-sm font-bold text-rose-400 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  نسبة الخصم / المحتجز (%)
              </label>
              <input type="number" required min="0" max="100" value={formData.retentionPercent} onChange={e => setFormData({...formData, retentionPercent: Number(e.target.value)})} className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all font-mono" />
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 flex gap-4 justify-end items-center">
            {projects.length === 0 && (
              <span className="text-rose-400 text-sm font-medium ml-auto">
                يجب إنشاء مشروع أولاً قبل تسجيل العقد.
              </span>
            )}
            <button 
              type="submit" 
              disabled={isLoading || projects.length === 0} 
              className="flex items-center gap-2 px-8 py-2.5 rounded-xl font-medium bg-orange-600 hover:bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              <span>حفظ واعتماد العقد</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
