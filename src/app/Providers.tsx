"use client";

import { ReactNode, useEffect } from "react";
import { LanguageProvider } from "@/lib/i18n/context";

export default function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  return <LanguageProvider>{children}</LanguageProvider>;
}
