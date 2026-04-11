"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileSignature, Save, ArrowRight, Loader2, Plus, Trash2, ShieldQuestion, Wallet
} from "lucide-react";
import axios from "axios";

export default function CreateChangeOrderPage() {
  const router = useRouter();
  const params = useParams();
  const contractId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [contract, setContract] = useState<any>(null);

  const [formData, setFormData] = useState({
    title: "",
    type: "ADDITION", // ADDITION | DEDUCTION
    status: "APPROVED"
  });

  const [items, setItems] = useState<any[]>([
    { description: "", quantityChange: 1, unitPrice: 0 }
  ]);

  useEffect(() => {
    if (contractId) fetchContract();
  }, [contractId]);

  const fetchContract = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:4000/v1/contracts/${contractId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContract(res.data);
    } catch (err) {
      alert("لم يتم العثور على العقد.");
      router.push("/dashboard/contracts");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotal = () => {
    return items.reduce((acc, item) => {
      const qty = Number(item.quantityChange) || 0;
      const price = Number(item.unitPrice) || 0;
      return acc + (qty * price);
    }, 0);
  };

  const addItem = () => {
    setItems([...items, { description: "", quantityChange: 1, unitPrice: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate items
    if (items.length === 0 || items.some(i => !i.description)) {
      alert("يرجى إدخال بند واحد على الأقل وتعبئة وصفه.");
      return;
    }

    setIsSaving(true);
    const amount = calculateTotal();

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:4000/v1/contracts/${contractId}/change-orders`,
        {
          ...formData,
          amount,
          items: items.map(i => ({
            ...i,
            quantityChange: Number(i.quantityChange),
            unitPrice: Number(i.unitPrice)
          }))
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      router.push(`/dashboard/contracts/edit/${contractId}`);
    } catch (err: any) {
      alert(`خطأ أثناء إنشاء الملحق: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-emerald-500" size={48} />
      </div>
    );
  }

  const isMain = contract?.type === "MAIN_CONTRACT";
  const partyName = isMain
    ? (contract?.project?.client?.name || "الجهة المالكة")
    : (contract?.subcontractor?.name || "مقاول باطن");
  const totalAmount = calculateTotal();

  return (
    <div className="max-w-4xl mx-auto space-y-6 w-full animate-in fade-in zoom-in-95 duration-500 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/dashboard/contracts/edit/${contractId}`)}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
          >
            <ArrowRight size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <FileSignature className="text-emerald-400" size={24} />
              تصميم ملحق عقد (أمر تغييري)
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              إضافة تغيرات مالية أو كميات على العقد رقم: <span className="font-mono text-white">[{contract?.referenceNumber}]</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Core Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="md:col-span-2 glass-dark border border-white/5 rounded-3xl p-6"
        >
          <form id="co-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                عنوان الملحق / الغرض المستحدث
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-all font-medium text-lg"
                placeholder="مثال: زيادة كميات خرسانة السقف دور 1..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div
                onClick={() => setFormData({ ...formData, type: 'ADDITION' })}
                className={`p-4 rounded-2xl border cursor-pointer flex flex-col items-center justify-center gap-2 transition-all group ${
                  formData.type === 'ADDITION' 
                    ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)] shadow-inner' 
                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className={`p-2 rounded-full ${formData.type === 'ADDITION' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40' : 'bg-slate-800 text-slate-400 group-hover:text-white'}`}>
                  <Plus size={20} />
                </div>
                <span className={`font-bold ${formData.type === 'ADDITION' ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-300'}`}>ملحق إضافة / زيادة</span>
              </div>
              
              <div
                onClick={() => setFormData({ ...formData, type: 'DEDUCTION' })}
                className={`p-4 rounded-2xl border cursor-pointer flex flex-col items-center justify-center gap-2 transition-all group ${
                  formData.type === 'DEDUCTION' 
                    ? 'bg-rose-500/10 border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.15)] shadow-inner' 
                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className={`p-2 rounded-full ${formData.type === 'DEDUCTION' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/40' : 'bg-slate-800 text-slate-400 group-hover:text-white'}`}>
                  <ShieldQuestion size={20} />
                </div>
                <span className={`font-bold ${formData.type === 'DEDUCTION' ? 'text-rose-400' : 'text-slate-400 group-hover:text-slate-300'}`}>ملحق تنزيل / استبعاد</span>
              </div>
            </div>

            {/* Items List */}
            <div className="pt-6 border-t border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Wallet size={18} className="text-emerald-400" />
                  بنود الملحق التفصيلية
                </h3>
                <button
                  type="button"
                  onClick={addItem}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors flex items-center gap-1.5 border border-emerald-500/20"
                >
                  <Plus size={14} /> إضافة بند
                </button>
              </div>

              <div className="space-y-3">
                <AnimatePresence>
                  {items.map((item, index) => (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      key={index}
                      className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row gap-4 relative group"
                    >
                      <div className="flex-1 space-y-2">
                        <label className="text-xs text-slate-400">وصف البند التغييري</label>
                        <input
                          type="text"
                          required
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          placeholder="مثال: توريد مواد عزل مرنة..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div className="w-full sm:w-24 space-y-2">
                        <label className="text-xs text-slate-400">الكمية</label>
                        <input
                          type="number"
                          required
                          step="any"
                          min="0"
                          value={item.quantityChange}
                          onChange={(e) => updateItem(index, 'quantityChange', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm text-center focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div className="w-full sm:w-32 space-y-2">
                        <label className="text-xs text-slate-400">سعر الوحدة (SAR)</label>
                        <input
                          type="number"
                          required
                          step="any"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm text-center focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="absolute -left-2 -top-2 w-7 h-7 rounded-full bg-rose-500 flex items-center justify-center text-white opacity-0 sm:group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                      
                      {/* Subtotal Label */}
                      <div className="absolute left-4 bottom-4 sm:top-1/2 sm:-translate-y-1/2 sm:bottom-auto font-mono text-xs font-bold text-emerald-400 opacity-60">
                        = {(Number(item.quantityChange) * Number(item.unitPrice) || 0).toLocaleString()} S
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

          </form>
        </motion.div>

        {/* Sidebar Summary */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="glass-dark border border-white/5 rounded-3xl p-6 relative overflow-hidden">
            <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-[40px] opacity-20 pointer-events-none ${formData.type === 'ADDITION' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            
            <h3 className="text-lg font-bold text-white mb-6">ملخص الملحق المالي</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">الطرف المعني</span>
                <span className="font-bold text-white max-w-[140px] truncate" title={partyName}>{partyName}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">نوع الملحق</span>
                <span className={`font-bold ${formData.type === 'ADDITION' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formData.type === 'ADDITION' ? 'زيادة بالمبلغ' : 'استقطاع / تنزيل'}
                </span>
              </div>
              
              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-400">إجمالي الملحق (SAR)</span>
                  <span className={`font-mono text-xl font-black ${formData.type === 'ADDITION' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {formData.type === 'DEDUCTION' && totalAmount > 0 ? '-' : ''}{totalAmount.toLocaleString('en-US')}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              form="co-form"
              disabled={isSaving || totalAmount === 0}
              className={`w-full mt-8 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-white shadow-xl ${
                formData.type === 'ADDITION' 
                  ? "bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-emerald-500/25"
                  : "bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 shadow-rose-500/25"
              }`}
            >
              {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              اعتماد وإنشاء الملحق
            </button>
            <p className="text-center text-xs text-slate-500 mt-4 leading-relaxed">
              بموجب الاعتماد، سيتم {formData.type === 'ADDITION' ? 'زيادة' : 'خصم'} هذه القيمة لإجمالي العمليات.
            </p>
          </div>
        </motion.div>
        
      </div>
    </div>
  );
}
