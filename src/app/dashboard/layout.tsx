"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CompanyProvider } from "@/context/CompanyContext";
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
  Shield,
  LayoutDashboard,
  ClipboardList,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import LanguageSwitcher from "@/app/components/LanguageSwitcher";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { t, dir } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [userName, setUserName] = useState("مدير النظام");
  const [userRole, setUserRole] = useState("Admin");
  const [permissions, setPermissions] = useState<string[]>([]);
  const [screenPermissions, setScreenPermissions] = useState<string[]>([]);

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
        setScreenPermissions(u.screenPermissions || []);
      } catch (e) {}
    }
  }, [router]);

  const hasAccess = (reqPerms: string[]) => {
    if (userRole === "Admin") return true; 
    if (userRole === "Viewer") {
      return !reqPerms.includes("MANAGE_USERS");
    }
    if (!reqPerms || reqPerms.length === 0) return true;
    return reqPerms.some(p => permissions.includes(p));
  };

  const hasScreenAccess = (screenKey: string) => {
    if (userRole === "Admin" || userRole === "System Admin") return true;
    if (screenPermissions.includes("*")) return true;
    return screenPermissions.includes(screenKey);
  };

  const menuItems = [
    { icon: Building2, labelKey: "nav.dashboard", path: "/dashboard", req: [], screenKey: "dashboard" },
    { icon: Briefcase, labelKey: "nav.projects", path: "/dashboard/projects", req: ["PROJECT_MANAGE"], screenKey: "projects" },
    { icon: FileCheck2, labelKey: "nav.quotations", path: "/dashboard/quotations", req: ["QUOTATION_CREATE", "QUOTATION_APPROVE"], screenKey: "quotations" },
    { icon: FileSpreadsheet, labelKey: "nav.boq", path: "/dashboard/boq", req: ["PROJECT_MANAGE", "INVOICE_CREATE"], screenKey: "boq" },
    { icon: ShoppingCart, labelKey: "nav.purchases", path: "/dashboard/purchases", req: ["PO_CREATE", "PO_APPROVE"], screenKey: "purchases" },
    { icon: Building2, labelKey: "nav.inventory", path: "/dashboard/inventory", req: ["PO_CREATE", "INVOICE_CREATE"], screenKey: "inventory" },
    { icon: FileSignature, labelKey: "nav.contracts", path: "/dashboard/contracts", req: ["CONTRACT_CREATE", "CONTRACT_APPROVE"], screenKey: "contracts" },
    { icon: Receipt, labelKey: "nav.invoices", path: "/dashboard/invoices", req: ["INVOICE_CREATE", "INVOICE_REVIEW", "INVOICE_APPROVE"], screenKey: "invoices" },
    { icon: Banknote, labelKey: "nav.expenses", path: "/dashboard/expenses", req: ["EXPENSE_CREATE", "EXPENSE_APPROVE"], screenKey: "expenses" },
    { icon: FileSpreadsheet, labelKey: "nav.reports", path: "/dashboard/reports", req: [], screenKey: "reports" },
    { icon: PieChart, labelKey: "nav.analytics", path: "/dashboard/analytics", req: [], screenKey: "analytics" },
    { icon: UserCircle, labelKey: "nav.contacts", path: "/dashboard/contacts", req: ["PROJECT_MANAGE", "CONTRACT_CREATE", "PO_CREATE"], screenKey: "contacts" },
    { icon: Building2, labelKey: "nav.company", path: "/dashboard/settings/company", req: ["MANAGE_USERS"], screenKey: "company" },
    { icon: Settings, labelKey: "nav.settings", path: "/dashboard/settings", req: ["MANAGE_USERS"], screenKey: "settings" },
    { icon: UserCircle, labelKey: "nav.users", path: "/dashboard/settings/users", req: ["MANAGE_USERS"], screenKey: "users" },
    { icon: Shield, labelKey: "nav.roles", path: "/dashboard/settings/roles", req: ["MANAGE_USERS"], screenKey: "roles" },
  ];

  const visibleMenuItems = menuItems.filter(item => hasAccess(item.req) && hasScreenAccess(item.screenKey));

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
          {visibleMenuItems.map((item, i) => {
            const isActive = (() => {
              if (item.path === "/dashboard") {
                return pathname === "/dashboard";
              }
              if (item.path === "/dashboard/settings") {
                const specificSettingsPaths = [
                  "/dashboard/settings/users",
                  "/dashboard/settings/roles",
                  "/dashboard/settings/company"
                ];
                return pathname.startsWith("/dashboard/settings") && !specificSettingsPaths.some(p => pathname.startsWith(p));
              }
              return pathname.startsWith(item.path);
            })();

            return (
              <motion.button
                key={i}
                whileHover={{ x: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push(item.path)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all relative border border-transparent ${
                  isActive 
                    ? "text-blue-400 font-bold" 
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute inset-0 bg-blue-600/10 border border-blue-500/20 rounded-2xl -z-10 pointer-events-none"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <item.icon size={20} className={isActive ? "text-blue-400" : "text-slate-400"} />
                <span className="font-medium">{t(item.labelKey)}</span>
              </motion.button>
            );
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-white/5 space-y-2">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 h-max w-max max-w-full">
            <UserCircle size={28} className="text-slate-400 shrink-0" />
            <div className="overflow-hidden w-full pl-2">
              <p className="text-sm font-medium text-white block truncate w-32">{userName}</p>
              <p className="text-xs text-slate-400">{t("common.loginAs")} ({userRole})</p>
            </div>
          </div>

          <LanguageSwitcher />
          
          <button 
            onClick={() => {
              localStorage.removeItem("token");
              router.push("/");
            }}
            className="w-full flex items-center justify-center gap-2 p-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
          >
            <LogOut size={18} />
            <span className="font-medium text-sm w-max block">{t("common.logout")}</span>
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
          <div className="p-4 md:p-8 relative z-10 h-full w-full print:p-0 print:h-auto print:block pb-24 md:pb-8">
            {(() => {
              const matchedMenuItem = menuItems.find(item => pathname === item.path || pathname.startsWith(item.path + '/'));
              
              if (matchedMenuItem && (!hasAccess(matchedMenuItem.req) || !hasScreenAccess(matchedMenuItem.screenKey))) {
                return (
                  <div className="flex flex-col items-center justify-center h-[70vh] text-center">
                    <Shield size={64} className="text-rose-500/50 mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">عفواً، وصول غير مصرح</h2>
                    <p className="text-slate-400 max-w-md">لا تملك الصلاحيات الكافية للوصول إلى هذه الشاشة. يرجى مراجعة مدير النظام لتعديل مصفوفة الصلاحيات الخاصة بك.</p>
                  </div>
                );
              }
              return <CompanyProvider>{children}</CompanyProvider>;
            })()}
          </div>
        </main>

        {/* Bottom Navigation - Mobile Only */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0f1015]/95 backdrop-blur-xl border-t border-white/5 safe-area-bottom">
          <div className="flex items-center justify-around py-1">
            {[
              { icon: LayoutDashboard, labelKey: "nav.dashboard", path: "/dashboard", req: [], screenKey: "dashboard" },
              { icon: Briefcase, labelKey: "nav.projects", path: "/dashboard/projects", req: ["PROJECT_MANAGE"], screenKey: "projects" },
              { icon: FileSignature, labelKey: "nav.invoices", path: "/dashboard/invoices", req: ["INVOICE_CREATE", "INVOICE_REVIEW", "INVOICE_APPROVE"], screenKey: "invoices" },
              { icon: FileCheck2, labelKey: "nav.contracts", path: "/dashboard/contracts", req: ["CONTRACT_CREATE", "CONTRACT_APPROVE"], screenKey: "contracts" },
              { icon: PieChart, labelKey: "nav.analytics", path: "/dashboard/analytics", req: [], screenKey: "analytics" },
            ].filter(item => hasAccess(item.req) && hasScreenAccess(item.screenKey)).map((item, i) => {
              const isActive = pathname === item.path || pathname.startsWith(item.path + "/");
              return (
                <button
                  key={i}
                  onClick={() => router.push(item.path)}
                  className={`flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl transition-colors ${
                    isActive ? "text-blue-400" : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  <item.icon size={20} />
                  <span className={`text-[10px] font-bold ${isActive ? "" : "font-medium"}`}>{t(item.labelKey)}</span>
                  {isActive && <div className="w-1 h-1 rounded-full bg-blue-400 mt-0.5" />}
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
