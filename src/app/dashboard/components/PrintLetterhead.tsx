"use client";

import { useCompany } from "@/context/CompanyContext";

export default function PrintLetterhead() {
  const { company } = useCompany();
  if (!company?.stampUrl) return null;
  return (
    <div className="absolute top-8 left-8 w-32 h-32 opacity-90">
      <img src={company.stampUrl} alt="Stamp" className="w-full h-full object-contain" />
    </div>
  );
}
