import { useCallback, useRef } from "react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";

export function useDownloadPdf() {
  const pdfRef = useRef<HTMLDivElement>(null);

  const downloadPdf = useCallback(async (filename = "document.pdf") => {
    const el = pdfRef.current;
    if (!el) return;

    el.classList.remove("hidden");
    el.classList.add("print:block");

    try {
      const dataUrl = await toPng(el, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve) => { img.onload = resolve; });
      const imgHeight = (img.height * imgWidth) / img.width;

      const pdf = new jsPDF("p", "mm", "a4");
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(dataUrl, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(dataUrl, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(filename);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      el.classList.add("hidden");
      el.classList.remove("print:block");
    }
  }, []);

  return { pdfRef, downloadPdf };
}
