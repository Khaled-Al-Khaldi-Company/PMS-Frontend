"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function PrintHeader() {
  const [company, setCompany] = useState<any>({
    nameAr: "مؤسسة إدارة المشاريع للمقاولات",
    nameEn: "PMS Contracting Est.",
    address: "شارع العليا، الرياض، المملكة العربية السعودية",
    taxNumber: "300000000000003",
    crNumber: "1010101010",
    logoUrl: ""
  });

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE_URL}/v1/settings/company`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data) {
          setCompany(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch company profile", err);
      }
    };
    fetchCompany();
  }, []);

  return (
    <div className="text-left flex flex-col items-end">
      {company.logoUrl ? (
        <img src={company.logoUrl} alt="Company Logo" className="w-48 h-16 object-contain mb-3" />
      ) : (
        <div className="w-48 h-16 bg-slate-50 border-2 border-slate-200 rounded flex items-center justify-center mb-3 shadow-sm">
          <span className="font-black text-xl text-slate-400 tracking-wider">LOGO</span>
        </div>
      )}
      <h3 className="font-black text-xl text-slate-900 uppercase">{company.nameEn || "PMS Contracting Est."}</h3>
      <p className="text-xs text-slate-600 font-bold mt-1">{company.nameAr || "مؤسسة إدارة المشاريع للمقاولات"}</p>
      {company.address && <p className="text-xs text-slate-500 mt-1">{company.address}</p>}
      <div className="mt-2 text-xs text-slate-600 font-bold grid grid-cols-1 gap-1 text-right" dir="ltr">
        {company.taxNumber && <p>VAT No: <span className="font-mono">{company.taxNumber}</span></p>}
        {company.crNumber && <p>CR No: <span className="font-mono">{company.crNumber}</span></p>}
      </div>
    </div>
  );
}
