"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/api';
import { User, Building, Phone, Mail, FileText, MapPin, MoreVertical, Edit, Trash2, Plus, X } from 'lucide-react';

export default function ContactsPage() {
  const [activeTab, setActiveTab] = useState<'suppliers' | 'clients'>('suppliers');
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    commercialName: '',
    contactPerson: '',
    phone: '',
    email: '',
    taxNumber: '',
    crNumber: '',
    address: '',
    activityType: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/v1/contacts/${activeTab}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const openNewModal = () => {
    setEditingItem(null);
    setFormData({
      name: '', commercialName: '', contactPerson: '', phone: '', email: '', 
      taxNumber: '', crNumber: '', address: '', activityType: '', notes: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      commercialName: item.commercialName || '',
      contactPerson: item.contactPerson || '',
      phone: item.phone || '',
      email: item.email || '',
      taxNumber: item.taxNumber || '',
      crNumber: item.crNumber || '',
      address: item.address || '',
      activityType: item.activityType || '',
      notes: item.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا السجل بشكل نهائي؟")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/v1/contacts/${activeTab}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      alert("حدث خطأ أثناء الحذف، ربما السجل مرتبط بعمليات مالية!");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (editingItem) {
        await axios.put(`${API_BASE_URL}/v1/contacts/${activeTab}/${editingItem.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_BASE_URL}/v1/contacts/${activeTab}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(`حدث خطأ أثناء الحفظ:\n${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in zoom-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/50 p-6 rounded-3xl border border-slate-800 backdrop-blur-xl">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Building className="text-indigo-500" size={32} />
            إدارة جهات الاتصال (CRM)
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            أرشيف متكامل لإدارة بيانات الموردين والعملاء والسجلات الضريبية بحرية كاملة
          </p>
        </div>
        <button 
          onClick={openNewModal}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl shadow-lg transition-all flex items-center gap-2 font-medium"
        >
          <Plus size={20} />
          إضافة {activeTab === 'suppliers' ? 'مورد جديد' : 'عميل جديد'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-slate-900/50 backdrop-blur-sm rounded-2xl w-full max-w-md mx-auto border border-slate-800">
        <button 
          onClick={() => setActiveTab('suppliers')}
          className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex justify-center items-center gap-2 ${activeTab === 'suppliers' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
        >
           قائمة الموردين
        </button>
        <button 
          onClick={() => setActiveTab('clients')}
          className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex justify-center items-center gap-2 ${activeTab === 'clients' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
        >
           قائمة العملاء
        </button>
      </div>

      {/* Cards Grid */}
      {isLoading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((item) => (
            <div key={item.id} className="group bg-slate-900/40 backdrop-blur-md rounded-3xl border border-slate-800/80 hover:border-indigo-500/50 p-6 flex flex-col gap-4 shadow-xl transition-all hover:-translate-y-1 relative overflow-hidden">
              <div className={`absolute top-0 right-0 w-full h-1 ${activeTab === 'suppliers' ? 'bg-gradient-to-r from-transparent via-indigo-500 to-transparent' : 'bg-gradient-to-r from-transparent via-blue-500 to-transparent'} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
              
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                    {item.name} 
                  </h3>
                  <p className="text-sm text-slate-400 font-medium">
                    {item.commercialName || "لم يسجل الاسم التجاري"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => openEditModal(item)} className="p-2 bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white rounded-xl transition-colors">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white rounded-xl transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-700 to-transparent my-1"></div>

              <div className="space-y-3 text-sm">
                 <div className="flex items-start gap-3">
                   <div className="mt-0.5 p-1.5 rounded-lg bg-slate-800/50 text-indigo-400"><FileText size={14} /></div>
                   <div className="flex-1">
                     <p className="text-slate-500 text-xs">الرقم الضريبي والسجل</p>
                     <p className="text-slate-300">{item.taxNumber ? `ضريبي: ${item.taxNumber}' : 'لا يوجد ضرائب'} {item.crNumber ? `| س.ت: ${item.crNumber}' : ''}</p>
                   </div>
                 </div>
                 
                 <div className="flex items-start gap-3">
                   <div className="mt-0.5 p-1.5 rounded-lg bg-slate-800/50 text-indigo-400"><MapPin size={14} /></div>
                   <div className="flex-1">
                     <p className="text-slate-500 text-xs">العنوان</p>
                     <p className="text-slate-300">{item.address || 'غير محدد'}</p>
                   </div>
                 </div>

                 <div className="flex items-center gap-3">
                   <div className="p-1.5 rounded-lg bg-slate-800/50 text-indigo-400"><Phone size={14} /></div>
                   <p className="text-slate-300">{item.phone || 'بدون هاتف'}</p>
                 </div>
              </div>

              {item.notes && (
                <div className="mt-2 p-3 rounded-xl bg-slate-800/30 text-slate-400 text-xs italic border border-slate-700/30">
                  "{item.notes}"
                </div>
              )}
            </div>
          ))}

          {data.length === 0 && (
            <div className="col-span-full py-20 text-center flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-3xl">
              <User size={48} className="text-slate-600 mb-4" />
              <h3 className="text-xl font-bold text-slate-300 mb-2">لا يوجد سجلات</h3>
              <p className="text-slate-500">اضغط على زر الإضافة لإنشاء القيد الأول في قاعدة البيانات.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {editingItem ? <Edit size={20} className="text-indigo-400" /> : <Plus size={20} className="text-indigo-400" />}
                {editingItem ? 'تعديل السجل' : 'إضافة سجل جديد'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-300">* الاسم المختصر (اساسي)</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="مثال: الراجحي" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-300">الاسم التجاري الكامل</label>
                  <input value={formData.commercialName} onChange={e => setFormData({...formData, commercialName: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" placeholder="مثال: شركة الراجحي للحديد المحدودة" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-300">الرقم الضريبي VAT</label>
                  <input value={formData.taxNumber} onChange={e => setFormData({...formData, taxNumber: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" placeholder="3000..." />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-300">رقم السجل التجاري CR</label>
                  <input value={formData.crNumber} onChange={e => setFormData({...formData, crNumber: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" placeholder="1010..." />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-300">رقم الهاتف التواصل</label>
                  <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" placeholder="05xxxxxxxx" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-300">البريد الإلكتروني</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" placeholder="info@example.com" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-300">العنوان أو المقر</label>
                  <input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" placeholder="الرياض، حي السلي، شارع اسطنبول" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-300">نوع النشاط (اختياري)</label>
                  <input value={formData.activityType} onChange={e => setFormData({...formData, activityType: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" placeholder="مثال: توريد مواد بناء، مقاولات عامة..." />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-300">ملاحظات داخلية / أرقام تواصل أخرى</label>
                  <textarea rows={3} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 resize-none" placeholder="اكتب أي معلومات إضافية عن هذه الجهة..." />
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-800 flex gap-4">
                <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl transition-colors">
                  {editingItem ? 'حفظ التعديلات' : 'إضافة إلى الأرشيف'}
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 rounded-xl transition-colors">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
