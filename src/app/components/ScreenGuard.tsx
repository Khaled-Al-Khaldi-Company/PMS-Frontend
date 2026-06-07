"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export const SCREEN_KEYS = {
  dashboard: "dashboard",
  projects: "projects",
  quotations: "quotations",
  boq: "boq",
  purchases: "purchases",
  inventory: "inventory",
  contracts: "contracts",
  invoices: "invoices",
  expenses: "expenses",
  dpr: "dpr",
  reports: "reports",
  analytics: "analytics",
  contacts: "contacts",
  company: "company",
  settings: "settings",
  users: "users",
  roles: "roles",
} as const;

export type ScreenKey = (typeof SCREEN_KEYS)[keyof typeof SCREEN_KEYS];

export function useScreenPermissions(): string[] {
  const [perms, setPerms] = useState<string[]>([]);
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      setPerms(user.screenPermissions || []);
    } catch {
      setPerms([]);
    }
  }, []);
  return perms;
}

export function hasScreenAccess(
  userScreenPermissions: string[],
  requiredScreen: ScreenKey,
): boolean {
  return userScreenPermissions.includes("*") || userScreenPermissions.includes(requiredScreen);
}

export default function ScreenGuard({
  screen,
  children,
}: {
  screen: ScreenKey;
  children: ReactNode;
}) {
  const router = useRouter();
  const screenPerms = useScreenPermissions();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const role = user.role || "";
      const perms: string[] = user.screenPermissions || [];

      if (role === "Admin" || role === "System Admin") {
        setChecking(false);
        return;
      }

      if (perms.includes("*") || perms.includes(screen)) {
        setChecking(false);
        return;
      }

      router.replace("/dashboard");
    } catch {
      router.replace("/dashboard");
    }
  }, [screen, router]);

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  return <>{children}</>;
}
