"use client";

import { useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";
import { 
  FileText, 
  ArrowRight, 
  Save, 
  Plus, 
  Trash2,
  HardHat,
  User,
  Sun,
  Cloud,
  ThermometerSun,
  Loader2
} from "lucide-react";

export default function CreateDPRPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [reportDate, setReportDate] = useState(new Date().toISOString().substring(0, 10));
  const [weather, setWeather] = useState("مشمس");
  const [temperature, setTemperature] = useState<number>(35);
  const [workPerformed, setWorkPerformed] = useState("");
  const [safetyNotes, setSafetyNotes] = useState("");

  const [labors, setLabors] = useState<any[]>([
    { trade: "مهندس موقع", count: 1, hours: 8, notes: "" }
  ]);
  const [equipments, setEquipments] = useState<any[]>([]);

  const handleAddLabor = () => {
    setLabors([...labors, { trade: "", count: 1, hours: 8, notes: "" }]);
  };

  const handleRemoveLabor = (index: number) => {
    const newLabors = [...labors];
    newLabors.splice(index, 1);
    setLabors(newLabors);
  };

  const handleAddEquipment = () => {
    setEquipments([...equipments, { equipmentType: "", count: 1, hours: 8, notes: "" }]);
  };

  const handleRemoveEquipment = (index: number) => {
    const newEquipments = [...equipments];
    newEquipments.splice(index, 1);
    setEquipments(newEquipments);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      
      const payload = {
        reportDate,
        weather,
        temperature,
        workPerformed,
        safetyNotes,
        labors,
        equipments,
        createdBy: user?.name || 'المهندس'
      };

      await axios.post(`${API_BASE_URL}/v1/daily-reports/project/${projectId}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      router.push(`/dashboard/projects/${projectId}`);
    } catch (err: any) {
      alert("حدث خطأ أثناء حفظ التقرير: " + (err.response?.data?.message || err.message));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 w-full animate-in fade-in zoom-in-95 duration-500 pb-12 relative">
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-amber-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <button onClick={() => router.back()} className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-slate-300 hover:text-white transition-all shadow-lg hover:-translate-x-1">
            <ArrowRight size={22} />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-l from-amber-400 to-orange-300 flex items-center gap-3 drop-shadow-sm">
              <FileText className="text-amber-500" size={28} />
              تقرير الموقع اليومي (DPR)
            </h1>
            <p className="text-slate-400 text-sm mt-1.5 font-medium">سجل الإنجاز والموارد ليوم عمل جديد</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass-dark border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden bg-slate-900/60">
           <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
             <Sun className="text-amber-500" size={20} /> بيانات التقرير والطقس
           </h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="space-y-2">
               <label className="text-xs font-bold uppercase tracking-wider text-slate-400">تاريخ التقرير</label>
               <input 
                 type="date" required 
                 value={reportDate} onChange={e => setReportDate(e.target.value)} 
                 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500" 
               />
             </div>
             <div className="space-y-2">
               <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1"><Cloud size={14}/> حالة الطقس</label>
               <select 
                 value={weather} onChange={e => setWeather(e.target.value)} 
                 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 appearance-none"
               >
                 <option value="مشمس">مشمس (Sunny)</option>
                 <option value="غائم">غائم (Cloudy)</option>
                 <option value="ممطر">ممطر (Rainy)</option>
                 <option value="غبار">عاصفة رملية/غبار (Dust Storm)</option>
               </select>
             </div>
             <div className="space-y-2">
               <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1"><ThermometerSun size={14}/> درجة الحرارة (مئوية)</label>
               <input 
                 type="number" required 
                 value={temperature} onChange={e => setTemperature(Number(e.target.value))} 
                 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-mono" 
               />
             </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Labors */}
          <div className="glass-dark border border-white/10 rounded-3xl p-6 shadow-xl bg-slate-900/60">
             <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
               <h2 className="text-base font-bold text-white flex items-center gap-2">
                 <User className="text-blue-400" size={18} /> العمالة الميدانية والقوى العاملة
               </h2>
               <button type="button" onClick={handleAddLabor} className="text-xs font-bold bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white px-3 py-1.5 rounded-lg border border-blue-500/20 transition-colors flex items-center gap-1">
                 <Plus size={14} /> إضافة عامل/فئة
               </button>
             </div>
             
             <div className="space-y-4">
               {labors.map((labor, index) => (
                 <div key={index} className="grid grid-cols-12 gap-3 items-center bg-slate-950/50 p-3 rounded-xl border border-white/5 relative group">
                   <div className="col-span-4">
                     <input type="text" required placeholder="المهنة (نجار، حداد...)" value={labor.trade} onChange={e => {
                       const newLabors = [...labors]; newLabors[index].trade = e.target.value; setLabors(newLabors);
                     }} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                   </div>
                   <div className="col-span-3">
                     <input type="number" required min="1" placeholder="العدد" value={labor.count} onChange={e => {
                       const newLabors = [...labors]; newLabors[index].count = parseInt(e.target.value); setLabors(newLabors);
                     }} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-center font-mono text-white focus:outline-none focus:border-blue-500" />
                   </div>
                   <div className="col-span-3">
                     <input type="number" required min="1" step="0.5" placeholder="ساعات" value={labor.hours} onChange={e => {
                       const newLabors = [...labors]; newLabors[index].hours = parseFloat(e.target.value); setLabors(newLabors);
                     }} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-center font-mono text-white focus:outline-none focus:border-blue-500" />
                   </div>
                   <div className="col-span-2 flex justify-center">
                     <button type="button" onClick={() => handleRemoveLabor(index)} className="p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors">
                       <Trash2 size={16} />
                     </button>
                   </div>
                 </div>
               ))}
               {labors.length === 0 && <p className="text-xs text-center text-slate-500 py-4">لم يتم إضافة عمالة بعد.</p>}
             </div>
          </div>

          {/* Equipments */}
          <div className="glass-dark border border-white/10 rounded-3xl p-6 shadow-xl bg-slate-900/60">
             <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
               <h2 className="text-base font-bold text-white flex items-center gap-2">
                 <HardHat className="text-amber-500" size={18} /> المعدات والآليات (المملوكة/المستأجرة)
               </h2>
               <button type="button" onClick={handleAddEquipment} className="text-xs font-bold bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white px-3 py-1.5 rounded-lg border border-amber-500/20 transition-colors flex items-center gap-1">
                 <Plus size={14} /> إضافة معدة
               </button>
             </div>
             
             <div className="space-y-4">
               {equipments.map((equip, index) => (
                 <div key={index} className="grid grid-cols-12 gap-3 items-center bg-slate-950/50 p-3 rounded-xl border border-white/5 relative group">
                   <div className="col-span-4">
                     <input type="text" required placeholder="نوع المعدة (بوكلين...)" value={equip.equipmentType} onChange={e => {
                       const newEq = [...equipments]; newEq[index].equipmentType = e.target.value; setEquipments(newEq);
                     }} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500" />
                   </div>
                   <div className="col-span-3">
                     <input type="number" required min="1" placeholder="العدد" value={equip.count} onChange={e => {
                       const newEq = [...equipments]; newEq[index].count = parseInt(e.target.value); setEquipments(newEq);
                     }} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-center font-mono text-white focus:outline-none focus:border-amber-500" />
                   </div>
                   <div className="col-span-3">
                     <input type="number" required min="1" step="0.5" placeholder="ساعات" value={equip.hours} onChange={e => {
                       const newEq = [...equipments]; newEq[index].hours = parseFloat(e.target.value); setEquipments(newEq);
                     }} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-center font-mono text-white focus:outline-none focus:border-amber-500" />
                   </div>
                   <div className="col-span-2 flex justify-center">
                     <button type="button" onClick={() => handleRemoveEquipment(index)} className="p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors">
                       <Trash2 size={16} />
                     </button>
                   </div>
                 </div>
               ))}
               {equipments.length === 0 && <p className="text-xs text-center text-slate-500 py-4">لم يتم إضافة آليات بعد.</p>}
             </div>
          </div>
        </div>

        <div className="glass-dark border border-white/10 rounded-3xl p-8 shadow-xl bg-slate-900/60 space-y-6">
          <div>
            <label className="text-sm font-bold text-white mb-3 block flex items-center gap-2">
              الأعمال المنجزة اليوم بالموقع (Work Performed)
            </label>
            <textarea 
              required
              rows={4}
              value={workPerformed}
              onChange={e => setWorkPerformed(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm leading-relaxed resize-none"
              placeholder="اكتب هنا تفاصيل الأعمال التي تمت اليوم في الموقع، مثل: صب قواعد القطاع أ، توريد 50 طن حديد..."
            />
          </div>
          <div>
            <label className="text-sm font-bold text-white mb-3 block flex items-center gap-2">
              ملاحظات الأمن والسلامة ومعوقات العمل (إن وجدت)
            </label>
            <textarea 
              rows={3}
              value={safetyNotes}
              onChange={e => setSafetyNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-sm leading-relaxed resize-none"
              placeholder="تسجيل إصابات، تأخير في التوريد، طقس سيء عطل العمل..."
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full flex justify-center items-center gap-2 px-6 py-5 rounded-2xl font-black text-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-900 shadow-[0_0_30px_rgba(245,158,11,0.2)] hover:shadow-[0_0_40px_rgba(245,158,11,0.4)] transition-all hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} className="group-hover:scale-110 transition-transform" />}
          حفظ ورفع التقرير اليومي للإدارة
        </button>

      </form>
    </div>
  );
}
