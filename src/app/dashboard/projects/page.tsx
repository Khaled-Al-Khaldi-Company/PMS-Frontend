"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, 
  Search, 
  Plus, 
  MoreVertical,
  Calendar,
  User,
  Activity,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  Clock,
  HardHat,
  Wallet,
  Trash2
} from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:4000/v1/projects", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(res.data);
    } catch (err) {
      console.error("Failed to fetch projects");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProject = async (e: any, id: string) => {
    e.stopPropagation();
    if (!confirm("هل أنت متأكد من رغبتك في حذف هذا المشروع نهائياً؟ هذا الإجراء لا يمكن التراجع عنه.")) return;
    
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:4000/v1/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProjects();
    } catch (err: any) {
      alert(err.response?.data?.message || "فشل حذف المشروع");
    }
  };

  const statusMap: Record<string, { label: string, color: string, border: string, bg: string, glow: string, icon: any }> = {
    PLANNING: { label: "قيد التخطيط", color: "text-amber-400", border: "border-amber-500/30", bg: "bg-amber-500/10", glow: "from-amber-500/20 to-transparent", icon: Clock },
    ACTIVE: { label: "نشط (قيد التنفيذ)", color: "text-blue-400", border: "border-blue-500/30", bg: "bg-blue-500/10", glow: "from-blue-500/20 to-transparent", icon: HardHat },
    COMPLETED: { label: "مكتمل", color: "text-emerald-400", border: "border-emerald-500/30", bg: "bg-emerald-500/10", glow: "from-emerald-500/20 to-transparent", icon: CheckCircle2 },
    ON_HOLD: { label: "متوقف", color: "text-rose-400", border: "border-rose-500/30", bg: "bg-rose-500/10", glow: "from-rose-500/20 to-transparent", icon: Activity },
  };

  const filters = [
    { id: "ALL", label: "جميع المشاريع", count: projects.length },
    { id: "ACTIVE", label: "نشطة", count: projects.filter(p => p.status === 'ACTIVE').length },
    { id: "PLANNING", label: "قيد التخطيط", count: projects.filter(p => p.status === 'PLANNING').length },
    { id: "COMPLETED", label: "مكتملة", count: projects.filter(p => p.status === 'COMPLETED').length },
  ];

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.includes(search) || p.code.includes(search);
    const matchesStatus = activeFilter === "ALL" || p.status === activeFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 w-full block animate-in fade-in zoom-in-95 duration-500 max-w-[1600px] mx-auto pb-12 relative">
      {/* Absolute Header Glow */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* Header Area */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/10 flex items-center justify-center border border-blue-500/20 shadow-lg">
            <Building2 className="text-blue-400" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white flex flex-wrap items-center gap-3 drop-shadow-sm">
              إدارة المشاريع
            </h1>
            <div className="text-slate-400 text-sm mt-1.5 font-medium flex items-start sm:items-center gap-2">
              <Activity size={14} className="text-blue-500 shrink-0 mt-0.5 sm:mt-0" />
              <span className="leading-relaxed">أضف، تتبع، ووّزع ميزانيات المشاريع، وراقب خطة التنفيذ خطوة بخطوة.</span>
            </div>
          </div>
        </div>
        
        <Link
          href="/dashboard/projects/create" 
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] group hover:-translate-y-1"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform" />
          <span>إضافة مشروع جديد</span>
        </Link>
      </div>

      {/* Filters and Search Toolbar */}
      <div className="glass-dark border border-white/5 p-2 rounded-2xl flex flex-col lg:flex-row items-center justify-between gap-4 bg-slate-900/60 backdrop-blur-md shadow-2xl">
        {/* Dynamic Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto p-1 bg-slate-900/50 rounded-xl">
          {filters.map(filter => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                activeFilter === filter.id 
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              {filter.label}
              <span className={`px-2 py-0.5 rounded-md text-[10px] ${activeFilter === filter.id ? 'bg-white/20' : 'bg-slate-800'}`}>
                {filter.count}
              </span>
            </button>
          ))}
        </div>

        {/* Global Search */}
        <div className="relative w-full lg:w-96 group px-2 lg:px-0">
          <Search className="absolute right-4 lg:right-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-400 transition-colors" size={18} />
          <input
            type="text"
            placeholder="ابحث برمز المشروع أو الكود..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950/50 border border-slate-700/80 rounded-xl py-3 pr-12 pl-4 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all shadow-inner group-hover:border-slate-600"
          />
        </div>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-64 bg-slate-800/20 rounded-3xl border border-white/5 animate-pulse relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent translate-x-[-100%] animate-[shimmer_2s_infinite]" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredProjects.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="col-span-full py-20 flex flex-col items-center justify-center text-center glass-dark rounded-3xl border border-white/5 shadow-2xl"
              >
                <Filter size={48} className="text-slate-600 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">لم يجد النظام أي مشاريع</h3>
                <p className="text-slate-400">جرب البحث بكلمات مختلفة أو قم بتغيير فلاتر التصنيف الحالية.</p>
              </motion.div>
            ) : (
              filteredProjects.map((project, i) => {
                const stat = statusMap[project.status] || statusMap['PLANNING'];
                const StatusIcon = stat.icon;

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05 }}
                    key={project.id}
                    onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                    className="rounded-3xl glass-dark border border-white/10 hover:border-blue-500/30 transition-all duration-300 group overflow-hidden relative flex flex-col cursor-pointer shadow-xl hover:shadow-[0_10px_40px_rgba(59,130,246,0.1)] hover:-translate-y-1"
                  >
                    {/* Glowing Accent */}
                    <div className={`absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br ${stat.glow} rounded-full blur-3xl opacity-40 group-hover:opacity-100 transition-opacity`} />
                    <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${stat.glow} opacity-60`} />

                    <div className="p-6 relative z-10 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-5">
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold tracking-wider rounded-lg border ${stat.border} ${stat.bg} ${stat.color} shadow-sm`}>
                          <StatusIcon size={14} />
                          {stat.label}
                        </div>
                        <div className="flex items-center gap-1">
                          <button 
                            className="text-slate-500 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10" 
                            onClick={(e) => { e.stopPropagation(); /* specific action */ }}
                            title="خيارات إضافية"
                          >
                            <MoreVertical size={16} />
                          </button>
                          <button 
                            className="text-rose-500/70 hover:text-rose-400 transition-colors p-1.5 rounded-lg hover:bg-rose-500/10" 
                            onClick={(e) => deleteProject(e, project.id)}
                            title="حذف المشروع"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="mb-6">
                        <h3 className="text-xl font-extrabold text-white mb-2 line-clamp-1 group-hover:text-blue-400 transition-colors drop-shadow-sm">{project.name}</h3>
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-700/50 shadow-inner">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">كود المشروع</span>
                          <span className="text-xs font-mono font-bold text-slate-300">{project.code}</span>
                        </div>
                      </div>

                      <div className="space-y-3.5 mb-2 mt-auto">
                        <div className="flex items-center gap-3 text-sm text-slate-300 bg-white/[0.02] p-2 rounded-xl border border-white/5 border-transparent group-hover:border-white/5 transition-all">
                          <User size={16} className="text-slate-500 shrink-0" />
                          <span className="truncate">{project.manager ? `${project.manager.firstName} ${project.manager.lastName}` : "مدير غير محدد"}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-300 bg-white/[0.02] p-2 rounded-xl border border-white/5 border-transparent group-hover:border-white/5 transition-all">
                          <Wallet size={16} className="text-slate-500 shrink-0" />
                          <span className="font-mono text-emerald-400 font-medium">
                            {project.budget ? `SAR ${Number(project.budget).toLocaleString()}` : "الميزانية غير محددة"}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-300 bg-white/[0.02] p-2 rounded-xl border border-white/5 border-transparent group-hover:border-white/5 transition-all">
                          <Calendar size={16} className="text-slate-500 shrink-0" />
                          <span className="font-mono">{project.startDate ? new Date(project.startDate).toLocaleDateString("ar-SA") : "غير محدد"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="border-t border-white/5 p-4 bg-slate-900/40 backdrop-blur-md flex items-center justify-between group-hover:bg-slate-900/60 transition-colors">
                      <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold uppercase tracking-wider">
                        عرض لوحة قيادة المشروع
                      </div>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${stat.bg} ${stat.color} group-hover:scale-110 group-hover:rotate-12`}>
                        <ArrowUpRight size={18} />
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
