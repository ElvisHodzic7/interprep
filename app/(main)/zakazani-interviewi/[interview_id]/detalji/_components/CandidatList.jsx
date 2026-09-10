"use client";
import { Button } from '@/components/ui/button'
import moment from 'moment'
import React, { useMemo } from 'react'
import CandidateFeedbackDialog from './CandidateFeedbackDialog'

function getScore(candidate) {
  // očekivani path: candidate.feedback.feedback.rating
  const r = candidate?.feedback?.feedback?.rating;

  const toNum = (v) => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  };

  if (r) {
    // Ako postoji totalRating (suma 4 kategorije 0–10) -> skaliraj na 0–10
    if (r.totalRating != null) {
      const val = toNum(r.totalRating) / 4;
      return Number(val.toFixed(2));
    }
    // U suprotnom, prosjek iz pojedinačnih kategorija
    const parts = ['technicalSkills', 'communication', 'problemSolving', 'experience']
      .map((k) => toNum(r[k]))
      .filter((v) => Number.isFinite(v));

    if (parts.length) {
      const avg = parts.reduce((a, b) => a + b, 0) / parts.length;
      return Number(avg.toFixed(2));
    }
  }

  // Fallbackovi ako imaš staru strukturu
  const scoresObj = candidate?.feedback?.scores;
  if (scoresObj && typeof scoresObj === 'object') {
    const values = Object.values(scoresObj).map(toNum).filter(Number.isFinite);
    if (values.length) return Number((values.reduce((a,b)=>a+b,0)/values.length).toFixed(2));
  }

  const ratings = candidate?.feedback?.ratings;
  if (Array.isArray(ratings) && ratings.length) {
    const values = ratings.map(toNum).filter(Number.isFinite);
    if (values.length) return Number((values.reduce((a,b)=>a+b,0)/values.length).toFixed(2));
  }

  return 0;
}


function CandidatList({ candidateList = [] }) {
  const rankedCandidates = useMemo(() => {
    const withScores = candidateList.map(c => ({ ...c, _score: getScore(c) }));
    return withScores.sort((a, b) => b._score - a._score);
  }, [candidateList]);

  // ⬇️ PDF export sa dinamičkim importom (radi samo na klijentu)
  const handleExportPDF = async () => {
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable'); // v3 API

      const doc = new jsPDF({ unit: 'pt', format: 'a4' });

      // Naslov
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('Rang lista kandidata', 40, 40);

      // Datum generisanja
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Generisano: ${moment().format('DD.MM.YYYY HH:mm')}`, 40, 58);

      // Priprema podataka za tabelu
      const head = [['#', 'Ime', 'Email', 'Rezultat', 'Završeno']];
      const body = rankedCandidates.map((c, i) => ([
        i + 1,
        c?.userName || '',
        c?.email || c?.userEmail || '',
        c?._score?.toString() ?? '0',
        c?.created_at ? moment(c.created_at).format('DD.MM.YYYY') : '—',
      ]));

      // Tabela (v3: autoTable(doc, options))
      autoTable(doc, {
        head,
        body,
        startY: 78,
        styles: { fontSize: 10, cellPadding: 6 },
        headStyles: { fillColor: [0, 0, 0] },
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

      // Naziv fajla
      const fileName = `rang-lista-kandidata-${moment().format('YYYYMMDD-HHmm')}.pdf`;
      doc.save(fileName);
    } catch (e) {
      console.error('PDF export error:', e);
      alert('Greška pri generisanju PDF-a. Pogledaj konzolu.');
    }
  };

  return (
    <div>
      <div className='flex items-center justify-between my-5'>
        <h2 className='font-bold'>Kandidati ({candidateList?.length || 0})</h2>
        <Button onClick={handleExportPDF}>Preuzmi rang listu (PDF)</Button>
      </div>

      {rankedCandidates.map((candidate, index) => (
        <div
          key={candidate?.id ?? index}
          className='p-5 flex gap-3 items-center justify-between bg-white rounded-lg'
        >
          <div className='flex items-center gap-5'>
            <h2 className='bg-primary p-3 px-4 font-bold text-white rounded-full'>
              {candidate?.userName?.[0]?.toUpperCase() || '?'}
            </h2>
            <div>
              <div className='flex items-center gap-2'>
                <span className='text-xs bg-gray-100 rounded-full px-2 py-0.5'>#{index + 1}</span>
                <h2 className='font-bold'>{candidate?.userName}</h2>
              </div>
              <h2 className='text-sm text-gray-500'>
                Završeno: {candidate?.created_at ? moment(candidate.created_at).format('DD.MM.YYYY') : '—'}
              </h2>
              <h3 className='text-sm font-medium mt-1'>
                Rezultat: <span className='text-primary'>{candidate?._score}</span>
              </h3>
            </div>
          </div>
          <div className='flex gap-3 items-center'>
            <CandidateFeedbackDialog candidate={candidate} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default CandidatList;
