"use client";

/**
 * PrintLetterhead — صورة الورقة الرسمية كخلفية ثابتة
 * تُضاف داخل أي حاوية طباعة لتضع الورقة خلف البيانات
 */
export default function PrintLetterhead() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/company_letterhead_1778702088189.png"
      alt=""
      className="letterhead-bg"
      aria-hidden="true"
    />
  );
}
