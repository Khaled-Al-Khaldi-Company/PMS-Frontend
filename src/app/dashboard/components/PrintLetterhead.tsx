"use client";

/**
 * PrintLetterhead — صورة الورقة الرسمية كخلفية ثابتة
 *
 * تُضاف داخل أي حاوية طباعة (print view) لتضع الورقة الرسمية
 * خلف جميع البيانات بشكل كامل على كل صفحة مطبوعة.
 *
 * الاستخدام:
 *   <div className="hidden print:block print-on-letterhead">
 *     <PrintLetterhead />
 *     ... البيانات ...
 *   </div>
 */
export default function PrintLetterhead() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/letterhead.png"
      alt=""
      className="letterhead-bg"
      aria-hidden="true"
    />
  );
}
