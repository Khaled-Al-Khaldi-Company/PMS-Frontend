"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Mail, ArrowRight } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@system.com");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/v1/auth/login`, {
        method: `POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "فشل تسجيل الدخول");

      // Save token (usually in cookies or context, using localStorage for demo)
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
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
      </motion.div>
    </div>
  );
}
