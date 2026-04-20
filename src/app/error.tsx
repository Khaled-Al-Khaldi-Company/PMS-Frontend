"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-8">
      <div className="max-w-md w-full bg-slate-900 border border-rose-500/20 rounded-3xl p-8 text-center shadow-2xl">
        <h2 className="text-3xl font-black text-rose-500 mb-4">خطأ في النظام ⚠️</h2>
        <p className="text-slate-400 mb-6 leading-relaxed">
          نعتذر، حدث خطأ غير متوقع أثناء تحميل هذه الصفحة. 
          <br />
          السبب الفني: <span className="text-rose-300 font-mono text-sm">{error.message}</span>
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 rounded-xl transition-all"
          >
            إعادة المحاولة (Try Again)
          </button>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-all"
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    </div>
  );
}
