"use client";

import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileSpreadsheet, 
  Search, 
  Plus, 
  UploadCloud,
  Loader2,
  Save,
  X,
  TrendingUp,
  Wallet,
  Activity,
  Box
} from "lucide-react";
import axios from "axios";

export default function BoqPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [boqItems, setBoqItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importText, setImportText] = useState("");
  const [newItem, setNewItem] = useState({ itemCode: "", description: "", unit: "م٢", quantity: 0, unitPrice: 0, executionType: "SELF", subcontractorPrice: 0 });

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      fetchBoqItems(selectedProjectId);
    } else {
      setBoqItems([]);
    }
  }, [selectedProjectId]);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/v1/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(res.data);
      if (res.data.length > 0) {
        setSelectedProjectId(res.data[0].id);
      }
    } catch (err) {}
  };

  const fetchBoqItems = async (projectId: string) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/v1/projects/${projectId}/boq`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBoqItems(res.data);
    } catch (err) {}
    setIsLoading(false);
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) return;
    
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_BASE_URL}/v1/projects/${selectedProjectId}/boq`, newItem, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setIsAdding(false);
      setNewItem({ itemCode: "", description: "", unit: "م٢", quantity: 0, unitPrice: 0, executionType: "SELF", subcontractorPrice: 0 });
      fetchBoqItems(selectedProjectId); // Refresh list
    } catch (err) {
      alert("حدث خطأ أثناء إضافة البند. تأكد من أن الرمز غير مكرر.");
    }
  };

  const handleBatchImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) return;
    
    setIsLoading(true);
    try {
      // Parse TSV (Tab Separated Values) from Excel Paste
      const rows = importText.split('\n').filter(r => r.trim().length > 0);
      const items = rows.map(r => {
        const cols = r.split('\t').map(c => c.trim());
        return {
          itemCode: cols[0] || `B-${Math.floor(Math.random()*10000)}`,
          description: cols[1] || 'بند مستورد',
          unit: cols[2] || 'م٢',
          quantity: parseFloat(cols[3]) || 1,
          unitPrice: parseFloat(cols[4]) || 0,
          executionType: "SELF"
        };
      });

      const token = localStorage.getItem("token");
      await axios.post(`${API_BASE_URL}/v1/projects/${selectedProjectId}/boq/batch-import`, { items }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert(`🎉 تم استيراد ${items.length} بنود بنجاح!`);
      setIsImporting(false);
      setImportText("");
      fetchBoqItems(selectedProjectId);
    } catch (err) {
      alert("خطأ أثناء الاستيراد. تأكد من صحة البيانات المنسوخة.");
    } finally {
      setIsLoading(false);
    }
  };

  const totalValue = boqItems.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice)), 0);
  const totalExecutedValue = boqItems.reduce((sum, item) => sum + (Number(item.executedQty || 0) * Number(item.unitPrice)), 0);
  const completionPercentage = totalValue > 0 ? (totalExecutedValue / totalValue) * 100 : 0;

  return (
    <div className="space-y-6 w-full animate-in fade-in zoom-in-95 duration-500 relative">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <FileSpreadsheet className="text-indigo-500" size={28} />
            جداول الكميات المشروطة (BOQ)
          </h1>
          <p className="text-slate-400 text-sm">استيراد بنود المقايسة، ومراقبة تسعير وتطور الكميات.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsImporting(true)}
            disabled={!selectedProjectId}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium py-2.5 px-4 rounded-xl transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UploadCloud size={18} className="text-indigo-400 group-hover:-translate-y-1 transition-transform" />
            <span>استيراد ذكي (Excel)</span>
          </button>
          
          <button 
            onClick={() => setIsAdding(true)}
            disabled={!selectedProjectId}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 px-5 rounded-xl transition-all shadow-[0_0_15px_rgba(99,102,241,0.4)] group disabled:opacity-50"
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform" />
            <span>إضافة بند جديد</span>
          </button>
        </div>
      </div>

      {/* Top Value Cards (The Magic) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/20 p-6 flex items-center justify-between group shadow-xl">
           <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
           <div>
             <p className="text-indigo-400 font-bold mb-1 flex items-center gap-2">
               <Wallet size={16} /> إجمالي قيمة المقايسة (العقد الأساسي)
             </p>
             <h2 className="text-3xl font-black text-white font-mono">{totalValue.toLocaleString()} <span className="text-sm text-slate-500">SAR</span></h2>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30 shadow-inner">
             <FileSpreadsheet size={28} />
           </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900/40 to-slate-900 border border-emerald-500/20 p-6 flex items-center justify-between group shadow-xl">
           <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
           <div className="w-full">
             <p className="text-emerald-400 font-bold mb-1 flex items-center justify-between gap-2 w-full">
               <span className="flex items-center gap-2"><Activity size={16} /> الإنجاز المالي والمنفذ</span>
               <span className="font-mono text-xl">{completionPercentage.toFixed(1)}%</span>
             </p>
             <h2 className="text-2xl font-black text-white font-mono mt-1">{totalExecutedValue.toLocaleString()} <span className="text-sm text-slate-500">SAR</span></h2>
             <div className="w-full bg-slate-950 rounded-full h-2.5 mt-4 border border-white/5 overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${completionPercentage}%` }} transition={{ duration: 1.5, ease: "easeOut" }} className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-2.5 rounded-full relative">
                   <div className="absolute inset-0 bg-white/20 animate-pulse mix-blend-overlay" />
                </motion.div>
             </div>
           </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-900/40 to-slate-900 border border-amber-500/20 p-6 flex items-center justify-between group shadow-xl">
           <div className="absolute inset-0 bg-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
           <div>
             <p className="text-amber-400 font-bold mb-1 flex items-center gap-2">
               <TrendingUp size={16} /> المتبقي لتسليم المشروع
             </p>
             <h2 className="text-3xl font-black text-white font-mono">{(totalValue - totalExecutedValue).toLocaleString()} <span className="text-sm text-slate-500">SAR</span></h2>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400 border border-amber-500/30 shadow-inner">
             <Box size={28} />
           </div>
        </div>
      </div>

      <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex items-center justify-between gap-4 flex-wrap shadow-lg">
        <div className="relative flex-1 min-w-[200px] max-w-md group">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="بحث في بنود هذا المشروع..."
            className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-2.5 pr-12 pl-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <label className="text-slate-400 text-sm font-medium">المشروع المحدد:</label>
          <div className="flex items-center border border-white/10 bg-slate-900/80 rounded-xl px-2">
            <select 
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-transparent text-white text-sm font-medium outline-none px-3 py-2 cursor-pointer w-48 appearance-none"
            >
              <option value="" disabled className="bg-slate-900">-- اختر مشروعاً --</option>
              {projects.map(p => (
                <option key={p.id} value={p.id} className="bg-slate-900">{p.name} ({p.code})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-3xl glass border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-900/50 text-slate-400 border-b border-white/5 uppercase font-medium">
              <tr>
                <th className="px-6 py-4">الرمز (Code)</th>
                <th className="px-6 py-4">وصف البند</th>
                <th className="px-6 py-4">الوحدة</th>
                <th className="px-6 py-4">الكمية المقدرة</th>
                <th className="px-6 py-4">الإفرادي للمالك (SAR)</th>
                <th className="px-6 py-4">استراتيجية التنفيذ</th>
                <th className="px-6 py-4 text-emerald-400">الكمية المنفذة</th>
                <th className="px-6 py-4 text-amber-400">الإجمالي للمالك</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {isLoading ? (
                <tr>
                   <td colSpan={7} className="px-6 py-12 text-center text-slate-400"><Loader2 className="animate-spin mx-auto text-indigo-500" size={24} /></td>
                </tr>
              ) : boqItems.length === 0 ? (
                <tr>
                   <td colSpan={7} className="px-6 py-12 text-center text-slate-400">لا توجد بنود مضافة في هذا المشروع.</td>
                </tr>
              ) : (
                boqItems.map((item, i) => (
                  <motion.tr 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={item.id} 
                    className="hover:bg-indigo-500/[0.04] transition-colors group cursor-pointer border-b border-white/5"
                  >
                    <td className="px-6 py-5 font-mono text-slate-300 font-semibold">{item.itemCode}</td>
                    <td className="px-6 py-5 font-bold text-white">{item.description}</td>
                    <td className="px-6 py-5 text-slate-400 font-medium">{item.unit}</td>
                    <td className="px-6 py-5 font-mono text-slate-300">{Number(item.quantity).toLocaleString()}</td>
                    <td className="px-6 py-5 font-mono text-slate-300">{Number(item.unitPrice).toLocaleString()}</td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-inner ${item.executionType === 'SUBCONTRACT' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                        {item.executionType === 'SUBCONTRACT' ? 'مقاول باطن' : 'تنفيذ ذاتي'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-white bg-slate-900/40">
                      <div className="flex flex-col gap-2 w-32">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-emerald-400 font-black">{Number(item.executedQty || 0).toLocaleString()}</span>
                          <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">متبقي: {Number(item.quantity) - Number(item.executedQty || 0)}</span>
                        </div>
                        <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-white/5">
                          <div 
                            className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full rounded-full transition-all duration-1000" 
                            style={{ width: `${Math.min(((Number(item.executedQty || 0)) / Number(item.quantity)) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 drop-shadow-sm text-lg border-r border-white/5">
                      {(Number(item.quantity) * Number(item.unitPrice)).toLocaleString()}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inline Adding Modal Overlay */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsAdding(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg bg-slate-900 border border-white/10 shadow-2xl rounded-3xl p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">إضافة بند جديد (BOQ)</h3>
                <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
              </div>

              <form onSubmit={handleAddItem} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-400">كود البند</label>
                    <input type="text" required value={newItem.itemCode} onChange={e=>setNewItem({...newItem, itemCode: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-indigo-500 outline-none" placeholder="EX: STR-01" dir="ltr" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-400">الوحدة القياسية</label>
                    <input type="text" required value={newItem.unit} onChange={e=>setNewItem({...newItem, unit: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-indigo-500 outline-none" placeholder="م٢ / م٣ / مقطوعية" />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <label className="text-xs font-medium text-slate-400">بيان الأعمال / المواصفات</label>
                    <textarea required value={newItem.description} onChange={e=>setNewItem({...newItem, description: e.target.value})} rows={2} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-indigo-500 outline-none" placeholder="توريد وتركيب..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-400">الكمية المقدرة</label>
                    <input type="number" required min="1" step="any" value={newItem.quantity} onChange={e=>setNewItem({...newItem, quantity: parseFloat(e.target.value)})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-indigo-500 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-400">سعر الوحدة للمالك (بيع)</label>
                    <input type="number" required min="0" step="any" value={newItem.unitPrice} onChange={e=>setNewItem({...newItem, unitPrice: parseFloat(e.target.value)})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-indigo-500 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-400">طريقة التنفيذ</label>
                    <select required value={newItem.executionType} onChange={e=>setNewItem({...newItem, executionType: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-indigo-500 outline-none cursor-pointer">
                      <option value="SELF">تنفيذ ذاتي (كوادرنا)</option>
                      <option value="SUBCONTRACT">مقاول باطن</option>
                    </select>
                  </div>
                  {newItem.executionType === 'SUBCONTRACT' && (
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-amber-400">تكلفة الباطن (شراء)</label>
                      <input type="number" required min="0" step="any" value={newItem.subcontractorPrice} onChange={e=>setNewItem({...newItem, subcontractorPrice: parseFloat(e.target.value)})} className="w-full bg-amber-500/5 border border-amber-500/20 rounded-xl px-3 py-2 text-amber-400 focus:border-amber-500 outline-none placeholder-amber-500/30" placeholder="عقد الباطن لهذا البند..." />
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 mt-8 border-t border-white/5 pt-4">
                  <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm text-slate-300 hover:text-white">إلغاء</button>
                  <button type="submit" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium flex items-center gap-2 transition-colors">
                    <Save size={16} /> اعتماد البند الحسابي
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Smart Excel Import Modal */}
        {isImporting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsImporting(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="relative w-full max-w-2xl bg-slate-900 border border-white/10 shadow-2xl rounded-3xl p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400 flex items-center gap-2">
                    <UploadCloud size={24} className="text-indigo-400" />
                    استيراد المقايسة السريع من (Excel)
                  </h3>
                  <p className="text-sm text-slate-400 font-medium mt-1">لا حاجة لتصدير ملفات، فقط انسخ الخلايا من إكسيل (Copy) والصقها هنا (Paste)!</p>
                </div>
                <button onClick={() => setIsImporting(false)} className="text-slate-400 hover:text-white bg-white/5 p-2 rounded-xl"><X size={20} /></button>
              </div>

              <form onSubmit={handleBatchImport} className="space-y-4">
                <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl mb-4">
                  <p className="text-xs font-bold text-amber-500/90 leading-relaxed">
                    يجب أن تكون الأعمدة المنسوخة بالترتيب التالي للحصول على أفضل نتيجة:<br/>
                    (كود البند) | (بيان الأعمال) | (الوحدة) | (الكمية المقدرة) | (سعر הוحدة للمالك)
                  </p>
                </div>

                <textarea 
                  required 
                  value={importText} 
                  onChange={e => setImportText(e.target.value)} 
                  rows={8} 
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-4 py-3 text-white focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 outline-none placeholder-slate-600 shadow-inner resize-y font-mono text-xs leading-relaxed" 
                  placeholder="STR-01    حفر وتسوية الموقع    م٣    1500    45&#10;STR-02    توريد وصب خرسانة عادية    م٣    200    350&#10;STR-03    توريد وصب خرسانة مسلحة للحوائط    م٣    1200    950" 
                  dir="ltr"
                />

                <div className="flex justify-end gap-3 border-t border-white/5 pt-4 mt-2">
                  <button type="button" disabled={isLoading} onClick={() => setIsImporting(false)} className="px-5 py-2.5 text-sm font-bold text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-all">إلغاء</button>
                  <button type="submit" disabled={isLoading || importText.trim().length === 0} className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 shadow-[0_0_20px_rgba(79,70,229,0.3)] text-white rounded-xl text-sm font-black flex items-center gap-2 transition-all disabled:opacity-50 disabled:grayscale">
                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} تحليل واستيراد البيانات
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
