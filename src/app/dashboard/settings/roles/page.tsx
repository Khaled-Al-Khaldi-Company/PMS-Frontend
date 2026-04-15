"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield, Key, Check } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";

export default function RolesMatrixPage() {
  const router = useRouter();
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

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

  const togglePermission = (roleId: string, permName: string) => {
    setRoles(roles.map(r => {
      if (r.id === roleId) {
        const hasPerm = r.permissions.some((p: any) => p.name === permName);
        let newPerms;
        if (hasPerm) {
          newPerms = r.permissions.filter((p: any) => p.name !== permName);
        } else {
          const permObj = permissions.find(p => p.name === permName);
          newPerms = [...r.permissions, permObj];
        }
        return { ...r, permissions: newPerms };
      }
      return r;
    }));
  };

  const hasPermission = (role: any, permName: string) => {
    return role.permissions.some((p: any) => p.name === permName);
  };

  const saveRolePermissions = async (role: any) => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem(`token");
      await axios.patch(`${API_BASE_URL}/v1/users/roles/${role.id}/permissions`, {
        permissionNames: role.permissions.map((p: any) => p.name)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`تم حفظ صلاحيات مسمى: ${role.name}`);
    } catch (err: any) {
      alert(`فشل الحفظ");
    }
    setIsSaving(false);
  };

  if (isLoading) return <div className="p-12 text-center text-slate-400">جاري التحميل...</div>;

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row items-start justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/20">
              <Shield className="text-indigo-400" size={24} />
            </div>
            مصفوفة الصلاحيات (Roles Matrix)
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            حدد الصلاحيات والإمكانيات لكل دور وظيفي في المؤسسة. سيتم منعهم تلقائيا من الوصول للصفحات الغير مصرح بها.
          </p>
        </div>
      </div>

      <div className="glass-dark border border-white/5 rounded-3xl p-6 shadow-2xl relative overflow-x-auto custom-scrollbar">
        <table className="w-full text-right text-sm">
          <thead className="bg-slate-900/80">
            <tr>
              <th className="px-4 py-4 text-slate-400 font-black text-sm uppercase min-w-[200px]">الصلاحـية / الدالة</th>
              {roles.map(r => (
                <th key={r.id} className="px-4 py-4 text-center">
                  <span className="block font-bold text-indigo-400 text-base">{r.name}</span>
                  <span className="block text-[10px] text-slate-500 font-normal mt-1 max-w-[120px] mx-auto leading-relaxed">{r.description}</span>
                  <button 
                     onClick={() => saveRolePermissions(r)}
                     disabled={isSaving}
                     className="mt-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-[10px] px-3 py-1.5 rounded-lg flex items-center justify-center mx-auto gap-1 transition-all"
                  >
                     <Key size={12} /> حفظ وتطبيق
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-slate-300">
            {permissions.map((perm) => (
              <tr key={perm.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-5 font-bold text-white flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                  <div>
                    {perm.description || perm.name}
                    <div className="text-[9px] text-slate-500 font-mono mt-0.5 uppercase tracking-wider">{perm.name}</div>
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
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center transition-all ${isActive ? `bg-indigo-500 text-white shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-slate-800 text-transparent border border-slate-700 group-hover:border-indigo-500/50'}`}>
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
    </div>
  );
}
