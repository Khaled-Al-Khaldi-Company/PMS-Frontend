"use client";

/**
 * PrintHeader — الترويسة الرسمية لشركة خالد حمد الخالدي للمقاولات
 * تُستخدم في جميع النماذج المطبوعة: المستخلصات، العقود، عروض الأسعار، أوامر الشراء
 */
export default function PrintHeader() {
  return (
    <div className="w-full" dir="rtl">
      {/* ====== الترويسة الرسمية ====== */}
      <div className="flex items-center justify-between w-full pb-3">

        {/* يمين: الاسم بالعربية */}
        <div className="text-right">
          <p className="text-[22px] font-black text-[#1a3a6b] leading-tight tracking-wide">
            شركة خالد حمد الخالدي
          </p>
          <p className="text-[16px] font-bold text-[#1a3a6b] tracking-widest">
            للمقاولات
          </p>
        </div>

        {/* وسط: الشعار */}
        <div className="flex items-center justify-center mx-4">
          <svg width="80" height="60" viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* المستطيل الرأسي */}
            <rect x="42" y="4" width="18" height="52" fill="#1a3a6b" />
            {/* السهم/الشكل الهندسي */}
            <path d="M38 30 L20 8 L20 20 L4 20 L4 40 L20 40 L20 52 Z" fill="#1a3a6b" />
          </svg>
        </div>

        {/* يسار: الاسم بالإنجليزية */}
        <div className="text-left">
          <p className="text-[18px] font-black text-[#1a3a6b] leading-tight tracking-wide">
            Khalid H. Al Khaldi Company
          </p>
          <p className="text-[14px] font-bold text-[#1a3a6b] tracking-widest">
            For Contracting
          </p>
        </div>

      </div>

      {/* خط فاصل أزرق */}
      <div className="w-full h-[3px] bg-[#1a3a6b]" />
    </div>
  );
}
