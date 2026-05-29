"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";

export interface CompanyProfile {
  id: string;
  nameAr: string;
  nameEn?: string;
  logoUrl?: string;
  stampUrl?: string;
  taxNumber?: string;
  crNumber?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  managerName?: string;
}

interface CompanyContextType {
  company: CompanyProfile | null;
  isLoading: boolean;
  refreshCompany: () => Promise<void>;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCompany = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoading(false);
        return;
      }
      const res = await axios.get(`${API_BASE_URL}/v1/settings/company`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCompany(res.data);
    } catch (err) {
      console.error("Failed to fetch company profile:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, []);

  return (
    <CompanyContext.Provider value={{ company, isLoading, refreshCompany: fetchCompany }}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error("useCompany must be used within a CompanyProvider");
  }
  return context;
}
