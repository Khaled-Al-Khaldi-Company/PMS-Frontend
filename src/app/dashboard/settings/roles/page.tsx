"use client";

import { useState, useEffect } from "react";
import { Shield, Key, Check, Save } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";

export default function RolesMatrixPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingRoleId, setSavingRoleId] = useState<string | null>(null);
  const [savedRoleId, setSavedRoleId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const [rolesRes, permsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/v1/users/roles`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/v1/users/permissions`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setRoles(rolesRes.data);
      setPermissions(permsRes.data);
    } catch {}
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const togglePermission = (roleId: string, permName: string) => {
    setRoles(roles.map(r => {
      if (r.id === roleId) {
        const hasPerm = r.permissions.some((p: any) => p.name === permName);
        const newPerms = hasPerm
          ? r.permissions.filter((p: any) => p.name !== permName)
          : [...r.permissions, permissions.find(p => p.name === permName)];
        return { ...r, permissions: newPerms };
      }
      return r;
    }));
  };

  const hasPermission = (role: any, permName: string) =>
    role.permissions.some((p: any) => p.name === permName);

  const saveRolePermissions = async (role: any) => {
    setSavingRoleId(role.id);
    try {
      const token = localStorage.getItem("token");
      await axios.patch(`${API_BASE_URL}/v1/users/roles/${role.id}/permissions`, {
        permissionNames: role.permissions.map((p: any) => p.name)
      }, { headers: { Authorization: `Bearer ${token}` } });
      setSavedRoleId(role.id);
      setTimeout(() => setSavedRoleId(null), 2500);
    } catch {
      alert("فشل الحفظ");
    }
    setSavingRoleId(null);
  };

  if (isLoading) return <div className="p-12 text-center text-slate-400">جاري التحميل...</div>;

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-28">

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/20">
            <Shield className="text-indigo-400" size={24} />
          </div>
          مصفوفة الصلاحيات (Roles Matrix)
        </h1>
        <p className="text-slate-400 text-sm mt-2 mr-15">
          حدد الصلاحيات لكل دور — ثم اضغط <strong className="text-indigo-400">حفظ</strong> من الشريط السفلي لتطبيق التغييرات.
        </p>
      </div>

      {/* Matrix Table */}
      <div className="glass-dark border border-white/5 rounded-3xl shadow-2xl overflow-x-auto custom-scrollbar">
        <table className="w-full text-right text-sm">
          <thead className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur shadow-md">
            <tr>
              <th className="px-5 py-4 text-slate-400 font-black text-xs uppercase min-w-[220px] border-b border-white/5">
                الصلاحية / الدالة
              </th>
              {roles.map(r => (
                <th key={r.id} className="px-4 py-4 text-center border-b border-white/5 min-w-[130px]">
                  <span className="block font-bold text-indigo-400 text-sm">{r.name}</span>
                  <span className="block text-[10px] text-slate-500 mt-0.5 leading-relaxed max-w-[110px] mx-auto">{r.description}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-slate-300">
            {permissions.map((perm) => (
              <tr key={perm.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-4 font-bold text-white">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                    <div>
                      <div>{perm.description || perm.name}</div>
                      <div className="text-[9px] text-slate-500 font-mono mt-0.5 uppercase tracking-wider">{perm.name}</div>
                    </div>
                  </div>
                </td>
                {roles.map(role => {
                  const isActive = hasPermission(role, perm.name);
                  return (
                    <td key={role.id} className="px-4 py-3 text-center border-l border-white/5 last:border-0 align-middle">
                      <label className="inline-flex items-center justify-center cursor-pointer group p-2">
                        <input
                          type="checkbox"
                          checked={isActive}
                          onChange={() => togglePermission(role.id, perm.name)}
                          className="sr-only"
                        />
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center transition-all ${
                          isActive
                            ? 'bg-indigo-500 text-white shadow-[0_0_10px_rgba(99,102,241,0.5)]'
                            : 'bg-slate-800 text-transparent border border-slate-700 group-hover:border-indigo-500/50'
                        }`}>
                          <Check size={14} className={isActive ? "opacity-100" : "opacity-0"} strokeWidth={3} />
                        </div>
                      </label>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ====== Sticky Bottom Save Bar ====== */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-xl border-t border-white/10 px-6 py-4 shadow-2xl">
        <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-3">
          <span className="text-slate-400 text-sm flex items-center gap-2">
            <Key size={14} className="text-indigo-400" />
            احفظ صلاحيات كل دور بشكل منفصل بعد التعديل
          </span>
          <div className="flex flex-wrap gap-2">
            {roles.map(role => (
              <button
                key={role.id}
                onClick={() => saveRolePermissions(role)}
                disabled={savingRoleId === role.id}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 shadow-lg ${
                  savedRoleId === role.id
                    ? 'bg-green-600 hover:bg-green-500 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Save size={14} />
                {savingRoleId === role.id
                  ? 'جاري الحفظ...'
                  : savedRoleId === role.id
                  ? '✓ تم الحفظ'
                  : `حفظ ${role.name}`}
              </button>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
