"use client";
import React from 'react'
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
import { formatTranscript, getFeedback, getScore, getTranscript, scoreColor } from '@/lib/feedback'
import { registrujFont } from '@/lib/pdfFont'
import { FileDown } from 'lucide-react'
import { toast } from 'sonner'

const SKILLS = [
  ['technicalSkills', 'Tehničke vještine'],
  ['communication', 'Komunikacija'],
  ['problemSolving', 'Rješavanje problema'],
  ['experience', 'Iskustvo'],
];

function CandidateFeedbackDialog({ candidate }) {
  const feedback = getFeedback(candidate);
  const ratings = feedback?.rating || {};
  const score = getScore(candidate);

  // summary može biti niz rečenica ili jedan string
  const summaries = Array.isArray(feedback?.summary)
    ? feedback.summary
    : feedback?.summary ? [feedback.summary] : [];
  const recommended = feedback?.recommendation === true;
  const recommendationText = feedback?.recommendationMsg || (recommended ? 'Preporučuje se zapošljavanje.' : 'Ne preporučuje se zapošljavanje.');
  const transcript = formatTranscript(getTranscript(candidate));

  // Export transkripta u PDF (dinamički import da izbjegnemo SSR)
  const handleDownloadTranscriptPDF = async () => {
    try {
      const { default: jsPDF } = await import('jspdf');

      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      await registrujFont(doc);
      const marginX = 40;
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();

      let y = 40;

      doc.setFont('Roboto', 'bold');
      doc.setFontSize(16);
      doc.text('Transkript razgovora', marginX, y); y += 22;

      doc.setFont('Roboto', 'normal');
      doc.setFontSize(11);
      if (candidate?.userName) { doc.text(`Kandidat: ${candidate.userName}`, marginX, y); y += 16; }
      if (candidate?.userEmail) { doc.text(`E-mail: ${candidate.userEmail}`, marginX, y); y += 16; }
      doc.text(`Rezultat: ${score}/10`, marginX, y); y += 16;

      y += 8;
      doc.setFont('Roboto', 'bold');
      doc.text('Sadržaj:', marginX, y); y += 16;

      // Normalizuj tekst (ako ima HTML tagova)
      const clean = String(transcript || '')
        .replace(/<\/?[^>]+(>|$)/g, '')
        .replace(/\r\n/g, '\n')
        .replace(/\t/g, '  ');

      doc.setFont('Roboto', 'normal');
      doc.setFontSize(10);

      const maxWidth = pageW - marginX * 2;
      const lines = doc.splitTextToSize(clean || 'Transkript nije dostupan.', maxWidth);

      const lineHeight = 14;
      lines.forEach(line => {
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
      toast.error('Nije uspjelo kreiranje PDF-a transkripta.');
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-primary">Pogledaj izvještaj</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Izvještaj o kandidatu</DialogTitle>
          <DialogDescription asChild>
            <div className='mt-3 text-foreground'>
              <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4'>
                <div className='flex items-center gap-4'>
                  <h2 className='bg-primary h-11 w-11 shrink-0 flex items-center justify-center font-bold text-white rounded-full'>
                    {candidate?.userName?.[0]?.toUpperCase() || '?'}
                  </h2>
                  <div className='text-left'>
                    <h2 className='font-bold'>{candidate?.userName}</h2>
                    <h2 className='text-sm text-gray-500'>{candidate?.userEmail}</h2>
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <span className={`text-xl font-bold rounded-lg px-3 py-1 ${scoreColor(score)}`}>{score}/10</span>
                  <Button variant="secondary" onClick={handleDownloadTranscriptPDF}>
                    <FileDown className='h-4 w-4' /> Transkript (PDF)
                  </Button>
                </div>
              </div>

              <div className='mt-6'>
                <h2 className='font-bold'>Ocjena vještina</h2>
                <div className='mt-3 grid grid-cols-1 sm:grid-cols-2 gap-5'>
                  {SKILLS.map(([key, label]) => {
                    const value = Number(ratings[key]) || 0;
                    return (
                      <div key={key}>
                        <h2 className='flex justify-between text-sm'>
                          {label} <span className='font-medium'>{value}/10</span>
                        </h2>
                        <Progress value={value * 10} className='mt-1' />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className='mt-6'>
                <h2 className='font-bold'>Ukupni utisak</h2>
                <div className='p-4 bg-secondary my-3 rounded-md space-y-1 text-sm leading-6'>
                  {summaries.length
                    ? summaries.map((summary, i) => <p key={i}>{summary}</p>)
                    : <p className='text-gray-600'>Nema dostupnog sažetka.</p>}
                </div>
              </div>

              <div className={`p-4 mt-4 rounded-md ${recommended ? 'bg-green-100' : 'bg-red-100'}`}>
                <h2 className={`font-bold ${recommended ? 'text-green-700' : 'text-red-700'}`}>
                  Preporuka: {recommended ? 'Da' : 'Ne'}
                </h2>
                <p className={`text-sm ${recommended ? 'text-green-700' : 'text-red-700'}`}>{recommendationText}</p>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

export default CandidateFeedbackDialog
