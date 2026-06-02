"use client";

import { useLanguage } from "@/lib/i18n/context";
import { Globe } from "lucide-react";

export default function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, toggleLocale } = useLanguage();

  return (
    <button
      onClick={toggleLocale}
      className={`w-full flex items-center justify-center gap-2 p-3 text-slate-400 hover:bg-white/5 rounded-xl transition-colors ${className}`}
      title={locale === "ar" ? "English" : "العربية"}
    >
      <Globe size={18} />
      <span className="font-medium text-sm">{locale === "ar" ? "English" : "العربية"}</span>
    </button>
  );
}
