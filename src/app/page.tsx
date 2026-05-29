"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Mail, ArrowRight } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/apiErrors";

export default function LoginPage() {
  const router = useRouter();
  // Safe default: pre-fill viewer/guest account
  const [email, setEmail] = useState("viewer@system.com");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("admin") === "true") {
        setEmail("admin@system.com");
        setPassword("123456");
      } else if (params.get("demo") === "true" || params.get("guest") === "true" || params.get("viewer") === "true") {
        setEmail("viewer@system.com");
        setPassword("123456");
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "فشل تسجيل الدخول");

      // Save token
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      router.push("/dashboard");
    } catch (err: any) {
      setError(getApiErrorMessage(err, "فشل تسجيل الدخول"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#09090b]">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md p-8 sm:p-10 rounded-3xl glass-dark glow border border-white/5"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/20 text-blue-400 mb-6 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
            <Lock size={32} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">تسجيل الدخول</h1>
          <p className="text-slate-400 text-sm">نظام إدارة المقاولات والمستخلصات ERP</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-500/10 rounded-lg text-center border border-red-500/20">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="relative group">
              <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="البريد الإلكتروني"
                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3 pr-12 pl-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                dir="ltr"
              />
            </div>

            <div className="relative group">
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="كلمة المرور"
                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3 pr-12 pl-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                dir="ltr"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full relative group overflow-hidden bg-blue-600 hover:bg-blue-500 text-white font-medium py-3.5 rounded-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span className="relative z-10">{isLoading ? "جاري التحقق..." : "تسجيل الدخول"}</span>
            {!isLoading && <ArrowRight size={18} className="relative z-10 group-hover:-translate-x-1 transition-transform" />}
            
            {/* Hover Glare Effect */}
            <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
          </button>
        </form>

        {/* Quick Demo Login Section */}
        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-slate-500 text-xs font-semibold mb-3">تسجيل دخول سريع للتجربة والتقييم</p>
          <div className="flex justify-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setEmail("viewer@system.com");
                setPassword("123456");
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all duration-300 ${
                email === "viewer@system.com"
                  ? "bg-blue-500/20 text-blue-400 border-blue-500/30 shadow-[0_0_12px_rgba(59,130,246,0.2)]"
                  : "bg-slate-900/60 text-slate-400 border-slate-800/80 hover:text-slate-300 hover:bg-slate-800/50"
              }`}
            >
              حساب زائر (عرض فقط)
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail("admin@system.com");
                setPassword("123456");
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all duration-300 ${
                email === "admin@system.com"
                  ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/30 shadow-[0_0_12px_rgba(99,102,241,0.2)]"
                  : "bg-slate-900/60 text-slate-400 border-slate-800/80 hover:text-slate-300 hover:bg-slate-800/50"
              }`}
            >
              مدير النظام (كامل الصلاحيات)
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
