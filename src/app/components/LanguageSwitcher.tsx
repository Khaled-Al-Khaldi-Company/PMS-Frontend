"use client";

import { useLanguage } from "@/lib/i18n/context";
import { Globe } from "lucide-react";

export default function LanguageSwitcher() {
  const { locale, toggleLocale } = useLanguage();

  return (
    <button
      onClick={toggleLocale}
      className="fixed top-4 left-4 z-[100] flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition-all text-sm font-bold"
      title={locale === "ar" ? "English" : "العربية"}
    >
      <Globe size={16} />
      {locale === "ar" ? "EN" : "AR"}
    </button>
  );
}
