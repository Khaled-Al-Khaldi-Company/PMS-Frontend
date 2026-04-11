"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Users, UserPlus, FileEdit, Trash2, Shield, Lock, Activity, CheckCircle, XCircle } from "lucide-react";
import axios from "axios";

export default function UsersManagementPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form State
  const [showModal, setShowModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    roleId: "",
    isActive: true
  });

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:4000/v1/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch {}
    setIsLoading(false);
  };

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:4000/v1/users/roles", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRoles(res.data);
    } catch {}
  };

  const openAddUser = () => {
    setEditingUserId(null);
    setFormData({ firstName: "", lastName: "", email: "", password: "", roleId: roles[0]?.id || "", isActive: true });
    setShowModal(true);
  };

  const openEditUser = (user: any) => {
    setEditingUserId(user.id);
    setFormData({ 
      firstName: user.firstName, 
      lastName: user.lastName, 
      email: user.email, 
      password: "", // Left blank intentionally
      roleId: user.roleId, 
      isActive: user.isActive 
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (editingUserId) {
        // Update
        const payload: any = { ...formData };
        if (!payload.password) delete payload.password; // Don't submit blank password
        await axios.patch(`http://localhost:4000/v1/users/${editingUserId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // Create
        if (!formData.password) {
           alert("كلمة المرور مطلوبة للمستخدم الجديد!");
           return;
        }
        await axios.post("http://localhost:4000/v1/users", formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setShowModal(false);
      fetchUsers();
    } catch (err: any) {
      alert("حدث خطأ أثناء حفظ بيانات المستخدم: " + (err.response?.data?.message || err.message));
    }
  };

  if (isLoading) {
    return <div className="text-center p-12 text-slate-400">جاري تحميل المستخدمين...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/20">
              <Users className="text-indigo-400" size={24} />
            </div>
            إدارة المستخدمين والصلاحيات
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            تمكنك هذه الشاشة من إضافة مهندسين ومراجعين وتخصيص صلاحياتهم (RBAC).
          </p>
        </div>
        <button onClick={openAddUser} className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 transition-all text-sm">
          <UserPlus size={18} /> إضافة مستخدم جديد
        </button>
      </div>

      <div className="glass-dark border border-white/5 rounded-3xl p-6 shadow-2xl relative">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-900/80">
              <tr>
                <th className="px-4 py-3 text-slate-400 font-bold text-xs uppercase border-b border-white/5">المستخدم</th>
                <th className="px-4 py-3 text-slate-400 font-bold text-xs uppercase border-b border-white/5">البريد الإلكتروني</th>
                <th className="px-4 py-3 text-slate-400 font-bold text-xs uppercase border-b border-white/5 text-center">الدور / الصلاحية</th>
                <th className="px-4 py-3 text-slate-400 font-bold text-xs uppercase border-b border-white/5 text-center">الحالة</th>
                <th className="px-4 py-3 text-slate-400 font-bold text-xs uppercase border-b border-white/5 text-left">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-4 font-bold text-white flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 text-xs">
                        {user.firstName[0]}
                     </div>
                     {user.firstName} {user.lastName}
                  </td>
                  <td className="px-4 py-4 font-mono text-xs">{user.email}</td>
                  <td className="px-4 py-4 text-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      <Shield size={12} /> {user.role?.name || "بدون صلاحية"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    {user.isActive ? (
                      <span className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                         <CheckCircle size={14} /> نشط
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-red-400 text-xs font-bold">
                         <XCircle size={14} /> موقوف
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-left">
                    <button onClick={() => openEditUser(user)} className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-indigo-600 rounded-lg transition-colors">
                      <FileEdit size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Shield className="text-indigo-400" /> 
              {editingUserId ? "تعديل مستخدم" : "إضافة مستخدم جديد"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">الاسم الأول</label>
                  <input required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-indigo-500 focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">اسم العائلة</label>
                  <input required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-indigo-500 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">البريد الإلكتروني (لتسجيل الدخول)</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full text-left font-mono bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-indigo-500 focus:outline-none" dir="ltr" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">كلمة المرور {editingUserId && "(اتركها فارغة إذا لم ترد التغيير)"}</label>
                <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-indigo-500 focus:outline-none" dir="ltr" minLength={6} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">صلاحية النظام</label>
                  <select required value={formData.roleId} onChange={e => setFormData({...formData, roleId: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-indigo-500 focus:outline-none">
                     <option value="" disabled>اختر الصلاحية</option>
                     {roles.map(r => (
                       <option key={r.id} value={r.id}>{r.name}</option>
                     ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block text-center">حالة الحساب</label>
                  <button type="button" onClick={() => setFormData({...formData, isActive: !formData.isActive})} className={`w-full py-2.5 rounded-xl font-bold flex flex-col items-center justify-center transition-colors ${formData.isActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                    {formData.isActive ? 'مُفعّل نشط' : 'موقوف'}
                  </button>
                </div>
              </div>

              <div className="mt-8 flex gap-4 pt-4 border-t border-slate-800">
                <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-colors">
                  حفظ المستخدم
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="px-6 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-colors">
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
