"use client";

import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/lib/api";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, UserPlus, FileEdit, Trash2, Shield, Lock, Activity, CheckCircle, XCircle,
  Building2, Plus, X, Save, Loader2
} from "lucide-react";
import axios from "axios";
import { useLanguage } from "@/lib/i18n/context";

const ALL_PERMISSIONS = [
  "QUOTATION_CREATE", "QUOTATION_APPROVE",
  "PROJECT_MANAGE",
  "PO_CREATE", "PO_APPROVE",
  "CONTRACT_CREATE", "CONTRACT_APPROVE",
  "INVOICE_CREATE", "INVOICE_REVIEW", "INVOICE_APPROVE",
  "EXPENSE_CREATE", "EXPENSE_APPROVE",
  "MANAGE_USERS",
  "FINANCE_VIEW",
  "VIEW_ALL_RECORDS",
];

export default function UsersManagementPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // User Form State
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

  // Project Permissions State
  const [userProjectPerms, setUserProjectPerms] = useState<any[]>([]);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/v1/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch {}
    setIsLoading(false);
  };

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/v1/users/roles`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRoles(res.data);
    } catch {}
  };

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/v1/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(res.data);
    } catch {}
  };

  const fetchUserProjectPerms = async (userId: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/v1/users/${userId}/project-permissions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserProjectPerms(res.data);
    } catch {
      setUserProjectPerms([]);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchProjects();
  }, []);

  const { t } = useLanguage();

  const openAddUser = () => {
    setEditingUserId(null);
    setFormData({ firstName: "", lastName: "", email: "", password: "", roleId: roles[0]?.id || "", isActive: true });
    setUserProjectPerms([]);
    setShowModal(true);
  };

  const openEditUser = (user: any) => {
    setEditingUserId(user.id);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: "",
      roleId: user.roleId,
      isActive: user.isActive
    });
    fetchUserProjectPerms(user.id);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (editingUserId) {
        const payload: any = { ...formData };
        if (!payload.password) delete payload.password;
        await axios.patch(`${API_BASE_URL}/v1/users/${editingUserId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        if (!formData.password) {
           alert("كلمة المرور مطلوبة للمستخدم الجديد!");
           return;
        }
        await axios.post(`${API_BASE_URL}/v1/users`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setShowModal(false);
      fetchUsers();
    } catch (err: any) {
      alert("حدث خطأ أثناء حفظ بيانات المستخدم: " + (err.response?.data?.message || err.message));
    }
  };

  const handleAddProjectPerm = async () => {
    if (!editingUserId || selectedProjectIds.length === 0) return;
    const token = localStorage.getItem("token");
    let success = 0;
    let fail = 0;
    for (const projectId of selectedProjectIds) {
      try {
        await axios.post(`${API_BASE_URL}/v1/users/${editingUserId}/project-permissions`, {
          projectId, permissions: selectedPerms,
        }, { headers: { Authorization: `Bearer ${token}` } });
        success++;
      } catch {
        fail++;
      }
    }
    setShowProjectModal(false);
    setSelectedProjectIds([]);
    setSelectedPerms([]);
    fetchUserProjectPerms(editingUserId);
    if (fail > 0) {
      alert(`تم إسناد ${success} مشروع بنجاح، فشل ${fail} مشروع.`);
    }
  };

  const handleRemoveProjectPerm = async (projectId: string) => {
    if (!editingUserId) return;
    if (!confirm("إزالة هذا المشروع من صلاحيات المستخدم؟")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/v1/users/${editingUserId}/project-permissions/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUserProjectPerms(editingUserId);
    } catch (err: any) {
      alert("فشل إزالة المشروع: " + (err.response?.data?.message || err.message));
    }
  };

  const togglePerm = (perm: string) => {
    setSelectedPerms(prev =>
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  };

  if (isLoading) {
    return <div className="text-center p-12 text-slate-400">{t("common.loading")}</div>;
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
            {t("users.title")}
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            {t("users.subtitle")}
          </p>
        </div>
        <button onClick={openAddUser} className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 transition-all text-sm">
          <UserPlus size={18} /> {t("users.addUser")}
        </button>
      </div>

      <div className="glass-dark border border-white/5 rounded-3xl p-6 shadow-2xl relative">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-900/80">
              <tr>
                <th className="px-4 py-3 text-slate-400 font-bold text-xs uppercase border-b border-white/5">{t("users.tableUser")}</th>
                <th className="px-4 py-3 text-slate-400 font-bold text-xs uppercase border-b border-white/5">{t("users.tableEmail")}</th>
                <th className="px-4 py-3 text-slate-400 font-bold text-xs uppercase border-b border-white/5 text-center">{t("users.tableRole")}</th>
                <th className="px-4 py-3 text-slate-400 font-bold text-xs uppercase border-b border-white/5 text-center">{t("users.tableStatus")}</th>
                <th className="px-4 py-3 text-slate-400 font-bold text-xs uppercase border-b border-white/5 text-left">{t("users.tableActions")}</th>
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
                    <button type="button" onClick={async () => {
                      const token = localStorage.getItem("token");
                      try {
                        await axios.patch(`${API_BASE_URL}/v1/users/${user.id}`, { isActive: !user.isActive }, {
                          headers: { Authorization: `Bearer ${token}` }
                        });
                        fetchUsers();
                      } catch (err: any) {
                        alert("فشل تغيير حالة المستخدم: " + (err.response?.data?.message || err.message));
                      }
                    }} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                      user.isActive
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30'
                        : 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30'
                    }`}>
                      {user.isActive ? <><CheckCircle size={14} /> نشط</> : <><XCircle size={14} /> {t("users.inactiveToggle")}</>}
                    </button>
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

      {/* User Edit/Create Modal */}
      <AnimatePresence>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl p-6 shadow-2xl"
          >
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Shield className="text-indigo-400" />
              {editingUserId ? t("users.editUser") : t("users.addUser")}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">{t("users.firstName")}</label>
                  <input required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-indigo-500 focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">{t("users.lastName")}</label>
                  <input required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-indigo-500 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">{t("users.email")}</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full text-left font-mono bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-indigo-500 focus:outline-none" dir="ltr" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">{t("users.password")} {editingUserId && t("users.passwordHint")}</label>
                <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-indigo-500 focus:outline-none" dir="ltr" minLength={6} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">{t("users.role")}</label>
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
                    {formData.isActive ? t("users.activeToggle") : t("users.inactiveToggle")}
                  </button>
                </div>
              </div>

              <div className="mt-8 flex gap-4 pt-4 border-t border-slate-800">
                <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-colors">
                  {t("users.saveUser")}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="px-6 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-colors">
                  {t("common.cancel")}
                </button>
              </div>
            </form>

            {/* Project Permissions Section - only for editing */}
            {editingUserId && (
              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Building2 size={18} className="text-emerald-400" />
                    {t("users.assignedProjects")}
                  </h3>
                  <button
                    type="button"
                    onClick={() => { setSelectedProjectIds([]); setSelectedPerms([]); setShowProjectModal(true); }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors border border-emerald-500/20"
                  >
                    <Plus size={14} /> {t("users.assignProject")}
                  </button>
                </div>

                {userProjectPerms.length === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-6">لم يُسند أي مشروع لهذا المستخدم بعد</p>
                ) : (
                  <div className="space-y-3">
                    {userProjectPerms.map((pp: any) => (
                      <div key={pp.projectId} className="bg-slate-800/40 border border-slate-700 rounded-2xl p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-bold text-white text-sm">{pp.project.name}</p>
                            <p className="text-xs text-slate-500 font-mono">{pp.project.code}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveProjectPerm(pp.projectId)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {(pp.permissions as string[]).map((perm: string) => (
                            <span key={perm} className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              {perm}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
      </AnimatePresence>

      {/* Add Project Permission Modal */}
      <AnimatePresence>
      {showProjectModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg p-6 shadow-2xl"
          >
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
              <Building2 size={18} className="text-emerald-400" />
              إسناد صلاحيات مشروع
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 mb-2 block">{t("users.selectProjects")}</label>
                <div className="max-h-48 overflow-y-auto border border-slate-800 rounded-2xl p-2 bg-slate-950/50 space-y-1">
                  {projects
                    .filter(p => !userProjectPerms.some(pp => pp.projectId === p.id))
                    .length === 0 ? (
                    <p className="text-slate-500 text-xs text-center py-4">جميع المشاريع مسندة بالفعل</p>
                  ) : (
                    projects
                      .filter(p => !userProjectPerms.some(pp => pp.projectId === p.id))
                      .map(p => {
                        const isSelected = selectedProjectIds.includes(p.id);
                        return (
                          <label
                            key={p.id}
                            onClick={() => {
                              setSelectedProjectIds(prev =>
                                prev.includes(p.id)
                                  ? prev.filter(id => id !== p.id)
                                  : [...prev, p.id]
                              );
                            }}
                            className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-emerald-500/10 border border-emerald-500/30'
                                : 'bg-slate-900/50 border border-transparent hover:bg-slate-800/50'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                              isSelected
                                ? 'bg-emerald-500 border-emerald-500'
                                : 'border-slate-600'
                            }`}>
                              {isSelected && <span className="text-white text-xs font-bold">✓</span>}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white">{p.name}</p>
                              <p className="text-xs text-slate-500 font-mono">{p.code}</p>
                            </div>
                          </label>
                        );
                      })
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-2 block">{t("users.selectPerms")}</label>
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto border border-slate-800 rounded-2xl p-3 bg-slate-950/50">
                  {ALL_PERMISSIONS.map(perm => (
                    <label key={perm} className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg hover:bg-slate-800/50">
                      <input
                        type="checkbox"
                        checked={selectedPerms.includes(perm)}
                        onChange={() => togglePerm(perm)}
                        className="rounded accent-emerald-500"
                      />
                      <span className="text-xs text-slate-300">{perm}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleAddProjectPerm}
                  disabled={selectedProjectIds.length === 0 || selectedPerms.length === 0}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Save size={16} /> {t("users.saveAssignment")}
                </button>
                <button
                  type="button"
                  onClick={() => setShowProjectModal(false)}
                  className="px-6 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-colors"
                >
                  {t("common.cancel")}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>
    </div>
  );
}
