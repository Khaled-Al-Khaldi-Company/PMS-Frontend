"use client";

import { useState, useEffect } from "react";
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  FileText, 
  CreditCard,
  User,
  Save,
  CheckCircle2
} from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";

export default function CompanyProfileSettings() {
  const [profile, setProfile] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE_URL}/v1/settings/company`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const token = localStorage.getItem("token");
      await axios.patch(`${API_BASE_URL}/v1/settings/company`, profile, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert("فشل الحفظ!");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile((prev: any) => ({ ...prev, [name]: value }));
  };

  if (isLoading) {
    return <div className="p-12 text-center text-slate-400 font-bold">جاري تحميل بيانات المنشأة...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/20">
          <Building2 className="text-indigo-400" size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-white">الملف التعريفي للمنشأة</h1>
          <p className="text-slate-400 text-sm mt-1">تُستخدم هذه البيانات محلياً للظهور في الطباعة (عروض الأسعار، العقود، المستخلصات)</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Basic Brand Info */}
        <div className="glass-dark border border-white/5 rounded-3xl p-6 sm:p-8 relative">
          <h2 className="text-lg font-bold text-white mb-6 border-b border-white/5 pb-4 flex items-center gap-2">
            <User className="text-slate-400" size={20} /> البيانات الأساسية
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs text-slate-400 mb-2 block font-bold">اسم المنشأة (عربي) *</label>
              <input required name="nameAr" value={profile.nameAr || ""} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-2 block font-bold">اسم المنشأة (إنجليزي)</label>
              <input name="nameEn" value={profile.nameEn || ""} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none" dir="ltr" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-2 block font-bold">رابط اللوجو (URL)</label>
              <input name="logoUrl" value={profile.logoUrl || ""} onChange={handleChange} placeholder="https://example.com/logo.png" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none" dir="ltr" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-2 block font-bold">اسم المدير المسؤول (للظهور في توقيع العقود)</label>
              <input name="managerName" value={profile.managerName || ""} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none" />
            </div>
          </div>
        </div>

        {/* Legal & Finance Info */}
        <div className="glass-dark border border-white/5 rounded-3xl p-6 sm:p-8 relative">
          <h2 className="text-lg font-bold text-white mb-6 border-b border-white/5 pb-4 flex items-center gap-2">
            <FileText className="text-slate-400" size={20} /> التراخيص والمعلومات المالية
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <label className="text-xs text-slate-400 mb-2 block font-bold">الرقم الضريبي (VAT Number)</label>
              <div className="relative">
                 <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                 <input name="taxNumber" value={profile.taxNumber || ""} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pr-11 pl-4 text-white focus:border-indigo-500 outline-none text-left" dir="ltr" />
              </div>
            </div>
            <div className="relative">
              <label className="text-xs text-slate-400 mb-2 block font-bold">رقم السجل التجاري (CR Number)</label>
              <div className="relative">
                 <FileText className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                 <input name="crNumber" value={profile.crNumber || ""} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pr-11 pl-4 text-white focus:border-indigo-500 outline-none text-left" dir="ltr" />
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="glass-dark border border-white/5 rounded-3xl p-6 sm:p-8 relative">
          <h2 className="text-lg font-bold text-white mb-6 border-b border-white/5 pb-4 flex items-center gap-2">
            <MapPin className="text-slate-400" size={20} /> بيانات الاتصال والموقع
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <label className="text-xs text-slate-400 mb-2 block font-bold">رقم الهاتف / الجوال</label>
              <div className="relative">
                 <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                 <input name="phone" value={profile.phone || ""} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pr-11 pl-4 text-white focus:border-indigo-500 outline-none text-left" dir="ltr" />
              </div>
            </div>
            <div className="relative">
              <label className="text-xs text-slate-400 mb-2 block font-bold">البريد الإلكتروني للإدارة</label>
              <div className="relative">
                 <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                 <input type="email" name="email" value={profile.email || ""} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pr-11 pl-4 text-white focus:border-indigo-500 outline-none text-left" dir="ltr" />
              </div>
            </div>
            <div className="md:col-span-2 relative">
              <label className="text-xs text-slate-400 mb-2 block font-bold">العنوان التفصيلي (الفرع الرئيسي)</label>
              <div className="relative">
                 <MapPin className="absolute right-4 top-4 text-slate-500" size={18} />
                 <textarea name="address" value={profile.address || ""} onChange={handleChange} rows={2} className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pr-11 pl-4 text-white focus:border-indigo-500 outline-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            disabled={isSaving}
            className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50"
          >
            {isSaving ? (
               <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : saveSuccess ? (
               <><CheckCircle2 size={20} /> تم حفظ بيانات المنشأة بنجاح</>
            ) : (
               <><Save size={20} /> حفظ التغييرات واستخدامها في الطباعة</>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
