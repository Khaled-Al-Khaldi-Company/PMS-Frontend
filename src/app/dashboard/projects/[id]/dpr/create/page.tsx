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
  Loader2,
  Printer
} from "lucide-react";
import { useDownloadPdf } from "@/hooks/useDownloadPdf";
import { useLanguage } from "@/lib/i18n/context";

export default function CreateDPRPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const { t } = useLanguage();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { pdfRef, downloadPdf } = useDownloadPdf();

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
              {t("dpr.create")}
            </h1>
            <p className="text-slate-400 text-sm mt-1.5 font-medium">{t("dpr.subtitleCreate")}</p>
          </div>
          <button type="button" onClick={() => downloadPdf(`DPR_${reportDate}.pdf`)} className="flex items-center gap-2 px-5 py-2.5 bg-rose-800 hover:bg-rose-700 text-rose-300 rounded-xl transition-colors border border-rose-700 shadow-lg font-medium">
            <Printer size={18} /> {t("common.pdf")}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass-dark border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden bg-slate-900/60">
           <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
             <Sun className="text-amber-500" size={20} /> {t("dpr.reportData")}
           </h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">{t("dpr.date")}</label>
               <input 
                 type="date" required 
                 value={reportDate} onChange={e => setReportDate(e.target.value)} 
                 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500" 
               />
             </div>
             <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1"><Cloud size={14}/> {t("dpr.weather")}</label>
               <select 
                 value={weather} onChange={e => setWeather(e.target.value)} 
                 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 appearance-none"
               >
                  <option value="مشمس">{t("dpr.weatherSunny")}</option>
                  <option value="غائم">{t("dpr.weatherCloudy")}</option>
                  <option value="ممطر">{t("dpr.weatherRainy")}</option>
                  <option value="غبار">{t("dpr.weatherDust")}</option>
               </select>
             </div>
             <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1"><ThermometerSun size={14}/> {t("dpr.temperature")}</label>
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
                  <User className="text-blue-400" size={18} /> {t("dpr.labors")}
               </h2>
               <button type="button" onClick={handleAddLabor} className="text-xs font-bold bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white px-3 py-1.5 rounded-lg border border-blue-500/20 transition-colors flex items-center gap-1">
                  <Plus size={14} /> {t("dpr.addLabor")}
               </button>
             </div>
             
             <div className="space-y-4">
               {labors.map((labor, index) => (
                 <div key={index} className="grid grid-cols-12 gap-3 items-center bg-slate-950/50 p-3 rounded-xl border border-white/5 relative group">
                   <div className="col-span-4">
                      <input type="text" required placeholder={t("dpr.trade")} value={labor.trade} onChange={e => {
                       const newLabors = [...labors]; newLabors[index].trade = e.target.value; setLabors(newLabors);
                     }} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                   </div>
                   <div className="col-span-3">
                      <input type="number" required min="1" placeholder={t("dpr.count")} value={labor.count} onChange={e => {
                        const newLabors = [...labors]; newLabors[index].count = parseInt(e.target.value); setLabors(newLabors);
                      }} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-center font-mono text-white focus:outline-none focus:border-blue-500" />
                   </div>
                   <div className="col-span-3">
                      <input type="number" required min="1" step="0.5" placeholder={t("dpr.hours")} value={labor.hours} onChange={e => {
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
               {labors.length === 0 && <p className="text-xs text-center text-slate-500 py-4">{t("dpr.noLabors")}</p>}
             </div>
          </div>

          {/* Equipments */}
          <div className="glass-dark border border-white/10 rounded-3xl p-6 shadow-xl bg-slate-900/60">
             <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
               <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <HardHat className="text-amber-500" size={18} /> {t("dpr.equipments")}
               </h2>
               <button type="button" onClick={handleAddEquipment} className="text-xs font-bold bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white px-3 py-1.5 rounded-lg border border-amber-500/20 transition-colors flex items-center gap-1">
                  <Plus size={14} /> {t("dpr.addEquipment")}
               </button>
             </div>
             
             <div className="space-y-4">
               {equipments.map((equip, index) => (
                 <div key={index} className="grid grid-cols-12 gap-3 items-center bg-slate-950/50 p-3 rounded-xl border border-white/5 relative group">
                   <div className="col-span-4">
                      <input type="text" required placeholder={t("dpr.equipmentType")} value={equip.equipmentType} onChange={e => {
                       const newEq = [...equipments]; newEq[index].equipmentType = e.target.value; setEquipments(newEq);
                     }} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500" />
                   </div>
                   <div className="col-span-3">
                      <input type="number" required min="1" placeholder={t("dpr.count")} value={equip.count} onChange={e => {
                       const newEq = [...equipments]; newEq[index].count = parseInt(e.target.value); setEquipments(newEq);
                     }} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-center font-mono text-white focus:outline-none focus:border-amber-500" />
                   </div>
                   <div className="col-span-3">
                      <input type="number" required min="1" step="0.5" placeholder={t("dpr.hours")} value={equip.hours} onChange={e => {
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
               {equipments.length === 0 && <p className="text-xs text-center text-slate-500 py-4">{t("dpr.noEquipments")}</p>}
             </div>
          </div>
        </div>

        <div className="glass-dark border border-white/10 rounded-3xl p-8 shadow-xl bg-slate-900/60 space-y-6">
          <div>
            <label className="text-sm font-bold text-white mb-3 block flex items-center gap-2">
              {t("dpr.workPerformed")}
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
              {t("dpr.safetyNotes")}
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
          {t("dpr.saveSubmit")}
        </button>

      </form>

      {/* Print View */}
      <div ref={pdfRef} className="hidden print:block print:!bg-white print:!text-black font-sans p-8" dir="rtl">
        <div className="text-center mb-6 border-b-2 border-slate-900 pb-4">
          <h1 className="text-2xl font-black text-slate-900">تقرير الموقع اليومي</h1>
          <h2 className="text-sm text-slate-500 font-bold">Daily Progress Report (DPR)</h2>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
          <div className="bg-slate-50 p-3 rounded border border-slate-200">
            <span className="font-bold text-slate-500">التاريخ: </span>
            <span className="font-mono font-bold">{reportDate}</span>
          </div>
          <div className="bg-slate-50 p-3 rounded border border-slate-200">
            <span className="font-bold text-slate-500">الطقس: </span>
            <span className="font-bold">{weather}</span>
          </div>
          <div className="bg-slate-50 p-3 rounded border border-slate-200">
            <span className="font-bold text-slate-500">درجة الحرارة: </span>
            <span className="font-mono font-bold">{temperature}°C</span>
          </div>
        </div>
        <div className="mb-6">
          <h3 className="font-bold text-slate-800 text-sm mb-2 border-b border-slate-200 pb-1">الأعمال المنجزة (Work Performed):</h3>
          <p className="text-sm text-slate-700 whitespace-pre-wrap bg-slate-50 p-3 rounded border border-slate-200">{workPerformed}</p>
        </div>
        {safetyNotes && (
          <div className="mb-6">
            <h3 className="font-bold text-slate-800 text-sm mb-2 border-b border-slate-200 pb-1">ملاحظات الأمن والسلامة (Safety Notes):</h3>
            <p className="text-sm text-slate-700 whitespace-pre-wrap bg-slate-50 p-3 rounded border border-slate-200">{safetyNotes}</p>
          </div>
        )}
        {labors.length > 0 && (
          <div className="mb-6">
            <h3 className="font-bold text-slate-800 text-sm mb-2 border-b border-slate-200 pb-1">العمالة (Labors):</h3>
            <table className="w-full text-right text-sm border-collapse">
              <thead><tr className="bg-slate-900 text-white"><th className="p-2 border border-slate-900">المهنة</th><th className="p-2 border border-slate-900 text-center w-20">العدد</th><th className="p-2 border border-slate-900 text-center w-20">الساعات</th><th className="p-2 border border-slate-900">ملاحظات</th></tr></thead>
              <tbody>{labors.map((l, i) => (
                <tr key={i} className="border-b border-slate-300">
                  <td className="p-2 border-x border-slate-300 font-bold">{l.trade}</td>
                  <td className="p-2 border-x border-slate-300 text-center font-mono">{l.count}</td>
                  <td className="p-2 border-x border-slate-300 text-center font-mono">{l.hours}</td>
                  <td className="p-2 border-x border-slate-300">{l.notes}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
        {equipments.length > 0 && (
          <div className="mb-6">
            <h3 className="font-bold text-slate-800 text-sm mb-2 border-b border-slate-200 pb-1">المعدات (Equipments):</h3>
            <table className="w-full text-right text-sm border-collapse">
              <thead><tr className="bg-slate-900 text-white"><th className="p-2 border border-slate-900">نوع المعدة</th><th className="p-2 border border-slate-900 text-center w-20">العدد</th><th className="p-2 border border-slate-900 text-center w-20">الساعات</th><th className="p-2 border border-slate-900">ملاحظات</th></tr></thead>
              <tbody>{equipments.map((e, i) => (
                <tr key={i} className="border-b border-slate-300">
                  <td className="p-2 border-x border-slate-300 font-bold">{e.equipmentType}</td>
                  <td className="p-2 border-x border-slate-300 text-center font-mono">{e.count}</td>
                  <td className="p-2 border-x border-slate-300 text-center font-mono">{e.hours}</td>
                  <td className="p-2 border-x border-slate-300">{e.notes}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}
