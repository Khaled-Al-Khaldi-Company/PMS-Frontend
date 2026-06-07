"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import arMessages from "./translations/ar.json";
import enMessages from "./translations/en.json";

type Locale = "ar" | "en";

interface LanguageContextType {
  locale: Locale;
  dir: "rtl" | "ltr";
  t: (key: string) => string;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
}

const STORAGE_KEY = "pms_locale";

const LanguageContext = createContext<LanguageContextType | null>(null);

function loadMessages(locale: Locale): Record<string, any> {
  return locale === "en" ? (enMessages as Record<string, any>) : (arMessages as Record<string, any>);
}

function resolveNestedKey(obj: Record<string, any>, key: string): string {
  const keys = key.split(".");
  let result: any = obj;
  for (const k of keys) {
    if (result == null || typeof result !== "object") return key;
    result = result[k];
  }
  return typeof result === "string" ? result : key;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("ar");
  const [messages, setMessages] = useState<Record<string, any>>({});

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
    const initial = stored === "en" ? "en" : "ar";
    setLocaleState(initial);
    setMessages(loadMessages(initial));
    document.documentElement.lang = initial;
    document.documentElement.dir = initial === "ar" ? "rtl" : "ltr";
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    setMessages(loadMessages(newLocale));
    localStorage.setItem(STORAGE_KEY, newLocale);
    document.documentElement.lang = newLocale;
    document.documentElement.dir = newLocale === "ar" ? "rtl" : "ltr";
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === "ar" ? "en" : "ar");
  }, [locale, setLocale]);

  const t = useCallback(
    (key: string) => resolveNestedKey(messages, key),
    [messages]
  );

  return (
    <LanguageContext.Provider
      value={{
        locale,
        dir: locale === "ar" ? "rtl" : "ltr",
        t,
        setLocale,
        toggleLocale,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
