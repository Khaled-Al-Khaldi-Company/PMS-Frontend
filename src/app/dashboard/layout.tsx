"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, 
  FileSpreadsheet, 
  Briefcase, 
  Receipt, 
  LogOut, 
  Menu,
  X,
  UserCircle,
  FileSignature,
  ShoppingCart,
  FileCheck2,
  Settings,
  PieChart,
  Banknote,
  Shield
} from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [userName, setUserName] = useState("مدير النظام");
  const [userRole, setUserRole] = useState("Admin");
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (!token) {
      router.push("/");
    }
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        setUserName(`${u.firstName} ${u.lastName}`);
        setUserRole(u.role);
        setPermissions(u.permissions || []);
      } catch (e) {}
    }
  }, [router]);

  const hasAccess = (reqPerms: string[]) => {
    if (userRole === "Admin") return true; 
    if (!reqPerms || reqPerms.length === 0) return true; // public to all logged in
    return reqPerms.some(p => permissions.includes(p));
  };

  const menuItems = [
    { icon: Building2, label: "الرئيسية", path: "/dashboard", req: [] }, // Mada accessible to all
    { icon: Briefcase, label: "المشاريع", path: "/dashboard/projects", req: ["PROJECT_MANAGE"] },
    { icon: FileCheck2, label: "عروض الأسعار", path: "/dashboard/quotations", req: ["QUOTATION_CREATE", "QUOTATION_APPROVE"] },
    // Everyone involved in projects can see BOQ for reference usually, but let's restrict to projects/invoices 
    { icon: FileSpreadsheet, label: "جداول الكميات", path: "/dashboard/boq", req: ["PROJECT_MANAGE", "INVOICE_CREATE"] },
    { icon: ShoppingCart, label: "المشتريات والمواد", path: "/dashboard/purchases", req: ["PO_CREATE", "PO_APPROVE"] },
    { icon: Building2, label: "مستودعات الموقع", path: "/dashboard/inventory", req: ["PO_CREATE", "INVOICE_CREATE"] },
    { icon: FileSignature, label: "العقود والمقاولين", path: "/dashboard/contracts", req: ["CONTRACT_CREATE", "CONTRACT_APPROVE"] },
    { icon: Receipt, label: "المستخلصات", path: "/dashboard/invoices", req: ["INVOICE_CREATE", "INVOICE_REVIEW", "INVOICE_APPROVE"] },
    { icon: Banknote, label: "العهد والمصروفات", path: "/dashboard/expenses", req: ["EXPENSE_CREATE", "EXPENSE_APPROVE"] },
    { icon: PieChart, label: "أرباح وخسائر المشاريع (P&L)", path: "/dashboard/analytics", req: [] }, // Or restrict to Admin
    { icon: UserCircle, label: "العملاء والموردين", path: "/dashboard/contacts", req: ["PROJECT_MANAGE", "CONTRACT_CREATE", "PO_CREATE"] },
    { icon: Building2, label: "بيانات هوية المنشأة الأساسية", path: "/dashboard/settings/company", req: ["MANAGE_USERS"] },
    { icon: Settings, label: "إعدادات دفترة (الربط)", path: "/dashboard/settings", req: ["MANAGE_USERS"] },
    { icon: UserCircle, label: "إدارة المستخدمين", path: "/dashboard/settings/users", req: ["MANAGE_USERS"] },
    { icon: Shield, label: "مصفوفة الصلاحيات (RBAC)", path: "/dashboard/settings/roles", req: ["MANAGE_USERS"] },
  ];

  const visibleMenuItems = menuItems.filter(item => hasAccess(item.req));

  return (
    <div className="min-h-screen bg-[#09090b] text-slate-100 flex overflow-hidden print:overflow-visible print:h-auto print:min-h-0 print:!bg-white print:!text-black print:block">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Navigation */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 0, x: isSidebarOpen ? 0 : 280 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed md:relative right-0 top-0 h-screen z-30 bg-[#0f1015]/80 backdrop-blur-xl border-l border-white/5 flex flex-col shrink-0 overflow-hidden print:hidden"
      >
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3 w-max">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-500 flex items-center justify-center glow">
              <Building2 size={24} />
            </div>
            <span className="font-bold text-xl tracking-tight text-white whitespace-nowrap">PMS Contracting</span>
          </div>
          <button className="md:hidden text-slate-400" onClick={() => setSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 min-h-0 px-4 py-4 space-y-2 overflow-y-auto">
          {visibleMenuItems.map((item, i) => (
            <motion.button
              key={i}
              whileHover={{ x: -5, backgroundColor: "rgba(59,130,246,0.1)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push(item.path)}
              className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-slate-300 hover:text-white transition-colors"
            >
              <item.icon size={20} className={i === 0 ? "text-blue-500" : ""} />
              <span className="font-medium">{item.label}</span>
            </motion.button>
          ))}
        </nav>

        <div className="p-4 mt-auto border-t border-white/5">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 mb-4 h-max w-max max-w-full">
            <UserCircle size={28} className="text-slate-400 shrink-0" />
            <div className="overflow-hidden w-full pl-2">
              <p className="text-sm font-medium text-white block truncate w-32">{userName}</p>
              <p className="text-xs text-slate-400">متصل ({userRole})</p>
            </div>
          </div>
          
          <button 
            onClick={() => {
              localStorage.removeItem("token");
              router.push("/");
            }}
            className="w-full flex items-center justify-center gap-2 p-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
          >
            <LogOut size={18} />
            <span className="font-medium text-sm w-max block">تسجيل الخروج</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden print:h-auto print:overflow-visible print:!bg-white text-slate-100 print:!text-black print:block">
        {/* Top Header */}
        <header className="h-20 bg-[#09090b]/80 backdrop-blur-xl border-b border-white/5 flex items-center px-4 md:px-8 shrink-0 z-10 sticky top-0 print:hidden">
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
          >
            <Menu size={20} />
          </button>

          <div className="grow" />

          {/* Integration Status Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium mr-1 tracking-wide">متصل بدفترة</span>
          </div>
        </header>

        {/* Dynamic Page Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[url('/bg-pattern.svg')] bg-cover relative print:overflow-visible print:h-auto print:block print:!bg-none print:!bg-white print:p-0 print:!text-black">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-transparent to-indigo-900/10 z-0 print:hidden" />
          <div className="p-4 md:p-8 relative z-10 h-full w-full print:p-0 print:h-auto print:block">
            {(() => {
              // Exact match or sub-paths (e.g. /dashboard/projects/123)
              const matchedMenuItem = menuItems.find(item => pathname === item.path || pathname.startsWith(item.path + '/'));
              
              if (matchedMenuItem && !hasAccess(matchedMenuItem.req)) {
                return (
                  <div className="flex flex-col items-center justify-center h-[70vh] text-center">
                    <Shield size={64} className="text-rose-500/50 mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">عفواً، وصول غير مصرح</h2>
                    <p className="text-slate-400 max-w-md">لا تملك الصلاحيات الكافية للوصول إلى هذه الشاشة. يرجى مراجعة مدير النظام لتعديل مصفوفة الصلاحيات الخاصة بك.</p>
                  </div>
                );
              }
              return children;
            })()}
          </div>
        </main>
      </div>
    </div>
  );
}
