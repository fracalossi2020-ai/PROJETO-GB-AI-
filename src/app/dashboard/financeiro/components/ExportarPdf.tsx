'use client';

import { useRef, useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ExportarPdfProps {
  targetId: string;
  fileName?: string;
  label?: string;
}

export default function ExportarPdf({ targetId, fileName = 'relatorio-financeiro', label = 'Exportar PDF' }: ExportarPdfProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    const element = document.getElementById(targetId);
    if (!element) return;

    setLoading(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#050505',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      let imgY = 10;

      const scaledHeight = imgHeight * ratio;
      let heightLeft = scaledHeight;
      let position = imgY;

      pdf.addImage(imgData, 'PNG', imgX, position, pdfWidth - 20, scaledHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - scaledHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', imgX, position, pdfWidth - 20, scaledHeight);
        heightLeft -= pdfHeight;
      }

      const date = new Date().toLocaleDateString('pt-BR');
      pdf.save(`${fileName}-${date}.pdf`);
    } catch (err) {
      console.error('Erro ao exportar PDF:', err);
      alert('Erro ao gerar PDF. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 bg-[#ff9607] hover:bg-[#ffaa33] text-black rounded-lg text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(255,150,7,0.3)]"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      {loading ? 'Gerando...' : label}
    </button>
  );
}
