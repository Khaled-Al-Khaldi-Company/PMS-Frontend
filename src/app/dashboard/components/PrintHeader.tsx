"use client";

import { useCompany } from "@/context/CompanyContext";

export default function PrintHeader() {
  const { company } = useCompany();
  if (!company) return null;
  return (
    <div className="text-right mb-2">
      <h1 className="text-2xl font-black text-slate-900">{company.nameAr}</h1>
      {company.nameEn && <p className="text-sm text-slate-500 font-bold">{company.nameEn}</p>}
    </div>
  );
}
