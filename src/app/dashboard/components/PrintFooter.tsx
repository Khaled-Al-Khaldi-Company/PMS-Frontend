"use client";

import { useCompany } from "@/context/CompanyContext";

export default function PrintFooter() {
  const { company } = useCompany();
  if (!company) return null;
  const parts = [
    company.address,
    company.phone && `هاتف: ${company.phone}`,
    company.email && `بريد: ${company.email}`,
    company.taxNumber && `الرقم الضريبي: ${company.taxNumber}`,
    company.crNumber && `سجل تجاري: ${company.crNumber}`,
  ].filter(Boolean);
  return (
    <div className="text-center text-[9px] text-slate-500 font-medium">
      <p className="font-bold text-slate-700">{company.nameAr}</p>
      {parts.length > 0 && <p>{parts.join(" | ")}</p>}
    </div>
  );
}
