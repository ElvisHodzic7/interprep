"use client";
import React, { useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

// ⬇️ Helper: pokušaj na više path-ova; prilagodi ako znaš tačan
const getTranscript = (candidate) => {
  // najčešći slučajevi
  return (
    candidate?.feedback?.feedback?.transcript ||
    candidate?.feedback?.transcript ||
    candidate?.transcript ||
    ''
  );
};

function CandidateFeedbackDialog({ candidate }) {
  const feedback = candidate?.feedback?.feedback;
  const ratings = feedback?.rating || {};
  const {
    totalRating = 0,
    technicalSkills = 0,
    communication = 0,
    problemSolving = 0,
    experience = 0,
  } = ratings;

  const ukupniRating = useMemo(() => {
    const val = Number(totalRating) / 4;
    return Number.isFinite(val) ? Number(val.toFixed(1)) : 0;
  }, [totalRating]);

  const summaries = Array.isArray(feedback?.summary) ? feedback.summary : [];
  const recommended = feedback?.recommendation === true;
  const recommendationText = feedback?.recommendationMsg || (recommended ? 'Preporučuje se zapošljavanje.' : 'Ne preporučuje se zapošljavanje.');
  const transcript = getTranscript(candidate);

  // ⬇️ Handler: export transkripta u PDF (dinamički import da izbjegnemo SSR)
  const handleDownloadTranscriptPDF = async () => {
    try {
      const { default: jsPDF } = await import('jspdf');

      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const marginX = 40;
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();

      let y = 40;

      // Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('Transkript razgovora', marginX, y); y += 22;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      if (candidate?.userName) { doc.text(`Kandidat: ${candidate.userName}`, marginX, y); y += 16; }
      if (candidate?.userEmail) { doc.text(`Email: ${candidate.userEmail}`, marginX, y); y += 16; }

      y += 8;
      doc.setFont('helvetica', 'bold');
      doc.text('Sadržaj:', marginX, y); y += 16;

      // Normalizuj tekst (ako ima HTML tagova)
      const clean = String(transcript || '')
        .replace(/<\/?[^>]+(>|$)/g, '') // skini HTML tagove
        .replace(/\r\n/g, '\n')
        .replace(/\t/g, '  ');

      // Koristi monospaced font za bolju čitljivost dijaloga (built-in 'courier')
      doc.setFont('courier', 'normal');
      doc.setFontSize(10);

      const maxWidth = pageW - marginX * 2;
      const lines = doc.splitTextToSize(clean || 'Transkript nije dostupan.', maxWidth);

      const lineHeight = 13; // pt
      lines.forEach(line => {
        // Ako nema mjesta za još jednu liniju — nova strana
        if (y > pageH - 60) {
          doc.addPage();
          y = 40;
        }
        doc.text(line, marginX, y);
        y += lineHeight;
      });

      const fileSafeName = (candidate?.userName || 'kandidat').toLowerCase().replace(/\s+/g, '-');
      doc.save(`transkript-${fileSafeName}.pdf`);
    } catch (err) {
      console.error('Greška pri exportu transkripta u PDF:', err);
      alert('Nisam uspio napraviti PDF transkripta. Provjeri konzolu za detalje.');
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-primary">Vidi Izvještaj</Button>
      </DialogTrigger>

      <DialogContent>
        {/* ⬇️ Header sa dodatnim dugmetom za transkript */}
        <DialogHeader className="flex flex-row items-start justify-between gap-4">
          <div className="flex-1">
            <DialogTitle>Feedback</DialogTitle>
            <DialogDescription asChild>
              <div className='mt-5'>
                <div className='flex justify-between items-center'>
                  <div className='flex items-center gap-5'>
                    <h2 className='bg-primary p-3 px-4 font-bold text-white rounded-full'>
                      {candidate?.userName?.[0]?.toUpperCase() || '?'}
                    </h2>
                    <div>
                      <h2 className='font-bold'>{candidate?.userName}</h2>
                      <h2 className='text-sm text-gray-500'>{candidate?.userEmail}</h2>
                    </div>
                  </div>
                  <div className='flex items-center gap-3'>
                    <h2 className='text-primary text-2xl font-bold'>{ukupniRating}/10</h2>

                    {/* Dugme: transkript u PDF */}
                    <Button variant="secondary" onClick={handleDownloadTranscriptPDF}>
                      Preuzmi transkript (PDF)
                    </Button>
                  </div>
                </div>

                {/* ... ostatak tvog sadržaja: progress barovi, sažeci, preporuka ... */}
                <div className='mt-5'>
                  <h2 className='font-bold'>Recenzija vještina</h2>
                  <div className='mt-3 grid grid-cols-2 gap-5'>
                    <div>
                      <h2 className='flex justify-between'>
                        Tehničke vještine <span>{technicalSkills}/10</span>
                      </h2>
                      <Progress value={(Number(technicalSkills) || 0) * 10} className='mt-1' />
                    </div>
                    <div>
                      <h2 className='flex justify-between'>
                        Komunikacija <span>{communication}/10</span>
                      </h2>
                      <Progress value={(Number(communication) || 0) * 10} className='mt-1' />
                    </div>
                    <div>
                      <h2 className='flex justify-between'>
                        Rješavanje problema <span>{problemSolving}/10</span>
                      </h2>
                      <Progress value={(Number(problemSolving) || 0) * 10} className='mt-1' />
                    </div>
                    <div>
                      <h2 className='flex justify-between'>
                        Iskustvo <span>{experience}/10</span>
                      </h2>
                      <Progress value={(Number(experience) || 0) * 10} className='mt-1' />
                    </div>
                  </div>
                </div>

                <div className='mt-5'>
                  <h2 className='font-bold'>Ukupni utisak</h2>
                  <div className='p-5 bg-secondary my-3 rounded-md'>
                    {summaries.length
                      ? summaries.map((summary, i) => <p key={i}>{summary}</p>)
                      : <p className='text-gray-600'>Nema dodatnih sažetaka.</p>}
                  </div>
                </div>

                <div className={`p-5 mt-10 flex items-center justify-between rounded-md ${recommended ? 'bg-green-100' : 'bg-red-100'}`}>
                  <div>
                    <h2 className={`font-bold ${recommended ? 'text-green-700' : 'text-red-700'}`}>Preporuka:</h2>
                    <p className={`${recommended ? 'text-green-600' : 'text-red-600'}`}>{recommendationText}</p>
                  </div>
                </div>
              </div>
            </DialogDescription>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

export default CandidateFeedbackDialog
