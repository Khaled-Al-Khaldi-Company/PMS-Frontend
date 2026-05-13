"use client";

/**
 * PrintFooter — ذيل الورقة الرسمية لشركة خالد حمد الخالدي للمقاولات
 * يُستخدم في جميع النماذج المطبوعة في الأسفل
 */
export default function PrintFooter() {
  return (
    <div className="w-full mt-8" dir="rtl">
      {/* خط فاصل أزرق */}
      <div className="w-full h-[2px] bg-[#1a3a6b] mb-2" />

      {/* معلومات التواصل */}
      <div className="flex flex-col items-center gap-0.5">
        {/* السطر العربي */}
        <p className="text-[9px] text-[#1a3a6b] font-bold text-center leading-relaxed" dir="rtl">
          ص.ب. ١٥٠٣٣ الرياض ١١٤٤٤ | المملكة العربية السعودية | س.ت. ١٠١٠٢٨٨٩٠٢ |
          تلفون: ٩٦٦+ ١١ ٤٦٠٣٠٣٠ | فاكس: ٩٦٦+ ١١ ٢١٥٢٦٢٢ | بريد إلكتروني: info@kke.bz
        </p>

        {/* السطر الإنجليزي */}
        <p className="text-[9px] text-[#1a3a6b] font-bold text-center leading-relaxed" dir="ltr">
          P.O.Box 15033 Riyadh 11444 - Kingdom of Saudi Arabia - C.R. 1010288902 -
          Tel: +966 11 4603030 Fax: +966 11 2152622 Email: info@kke.bz
        </p>
      </div>
    </div>
  );
}
