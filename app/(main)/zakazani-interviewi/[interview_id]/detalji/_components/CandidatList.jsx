"use client";
import { Button } from '@/components/ui/button'
import moment from '@/lib/moment'
import { getFeedback, getScore, scoreColor } from '@/lib/feedback'
import { registrujFont } from '@/lib/pdfFont'
import { Download } from 'lucide-react'
import React, { useMemo } from 'react'
import { toast } from 'sonner'
import CandidateFeedbackDialog from './CandidateFeedbackDialog'

function CandidatList({ candidateList = [], pdfTitle }) {
  const rankedCandidates = useMemo(() => {
    const withScores = candidateList.map(c => ({ ...c, _score: getScore(c) }));
    return withScores.sort((a, b) => b._score - a._score);
  }, [candidateList]);

  // PDF export sa dinamičkim importom (radi samo na klijentu)
  const handleExportPDF = async () => {
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');

      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      await registrujFont(doc);

      // Naslov
      doc.setFont('Roboto', 'bold');
      doc.setFontSize(14);
      doc.text(pdfTitle ? `Rang lista kandidata – ${pdfTitle}` : 'Rang lista kandidata', 40, 40);

      // Datum generisanja
      doc.setFont('Roboto', 'normal');
      doc.setFontSize(10);
      doc.text(`Generisano: ${moment().format('DD.MM.YYYY. HH:mm')}`, 40, 58);

      const head = [['#', 'Ime', 'E-mail', 'Rezultat', 'Preporuka', 'Završeno']];
      const body = rankedCandidates.map((c, i) => ([
        i + 1,
        c?.userName || '',
        c?.userEmail || '',
        `${c?._score ?? 0}/10`,
        getFeedback(c)?.recommendation === true ? 'Da' : 'Ne',
        c?.created_at ? moment(c.created_at).format('DD.MM.YYYY.') : '—',
      ]));

      autoTable(doc, {
        head,
        body,
        startY: 78,
        styles: { font: 'Roboto', fontSize: 10, cellPadding: 6 },
        headStyles: { font: 'Roboto', fontStyle: 'bold', fillColor: [79, 70, 229] },
        margin: { left: 40, right: 40 },
        didDrawPage: (data) => {
          const pageCount = doc.getNumberOfPages();
          doc.setFontSize(9);
          doc.text(
            `Strana ${data.pageNumber} / ${pageCount}`,
            doc.internal.pageSize.getWidth() - 80,
            doc.internal.pageSize.getHeight() - 20
          );
        },
      });

      doc.save(`rang-lista-kandidata-${moment().format('YYYYMMDD-HHmm')}.pdf`);
    } catch (e) {
      console.error('PDF export error:', e);
      toast.error('Greška pri generisanju PDF-a.');
    }
  };

  return (
    <div>
      <div className='flex flex-wrap gap-3 items-center justify-between my-5'>
        <h2 className='font-bold text-lg'>Kandidati ({candidateList.length})</h2>
        <Button onClick={handleExportPDF} disabled={!candidateList.length}>
          <Download className='h-4 w-4' /> Preuzmi rang listu (PDF)
        </Button>
      </div>

      {!rankedCandidates.length && (
        <div className='p-8 bg-white border rounded-xl text-center text-gray-500'>
          Još nijedan kandidat nije završio ovaj intervju.
        </div>
      )}

      <div className='space-y-3'>
        {rankedCandidates.map((candidate, index) => {
          const recommended = getFeedback(candidate)?.recommendation === true;
          return (
            <div
              key={candidate?.id ?? index}
              className='p-5 flex flex-col sm:flex-row gap-3 sm:items-center justify-between bg-white border rounded-xl'
            >
              <div className='flex items-center gap-5'>
                <h2 className='bg-primary h-11 w-11 shrink-0 flex items-center justify-center font-bold text-white rounded-full'>
                  {candidate?.userName?.[0]?.toUpperCase() || '?'}
                </h2>
                <div>
                  <div className='flex items-center gap-2 flex-wrap'>
                    <span className='text-xs bg-gray-100 rounded-full px-2 py-0.5'>#{index + 1}</span>
                    <h2 className='font-bold'>{candidate?.userName}</h2>
                  </div>
                  <h2 className='text-sm text-gray-500'>
                    Završeno: {candidate?.created_at ? moment(candidate.created_at).format('DD.MM.YYYY.') : '—'}
                  </h2>
                  <div className='flex items-center gap-2 mt-1 flex-wrap'>
                    <span className={`text-xs font-bold rounded-full px-2 py-0.5 ${scoreColor(candidate._score)}`}>
                      {candidate._score}/10
                    </span>
                    <span className={`text-xs rounded-full px-2 py-0.5 ${recommended ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {recommended ? 'Preporučen' : 'Nije preporučen'}
                    </span>
                  </div>
                </div>
              </div>
              <CandidateFeedbackDialog candidate={candidate} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CandidatList;
