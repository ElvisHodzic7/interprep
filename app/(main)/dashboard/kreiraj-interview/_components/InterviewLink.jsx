"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, CheckCircle2, Clock, Copy, List, Mail, MessageCircle, Plus } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

function InterviewLink({ interview_id, formData, questionCount = 0 }) {
  const [baseUrl, setBaseUrl] = useState('');

  // Base URL iz browsera; fallback na env ako treba
  useEffect(() => {
    const origin =
      typeof window !== 'undefined' && window.location?.origin
        ? window.location.origin
        : (process.env.NEXT_PUBLIC_HOST_URL || '');
    setBaseUrl(origin);
  }, []);

  // Share URL: /interview/[id]
  const url = useMemo(() => {
    if (!interview_id || !baseUrl) return '';
    return `${baseUrl}/interview/${interview_id}`;
  }, [baseUrl, interview_id]);

  const poruka = `Pozdrav! Pozivamo vas na AI intervju za poziciju ${formData?.jobPosition || ''}. Intervju možete započeti ovdje: ${url}`;

  const onCopyLink = async () => {
    try {
      if (!url) return;
      await navigator.clipboard.writeText(url);
      toast.success('Link je kopiran!');
    } catch (e) {
      toast.error('Kopiranje linka nije uspjelo.');
      console.error(e);
    }
  };

  const onShareEmail = () => {
    const subject = `Poziv na AI intervju – ${formData?.jobPosition || 'InterPrep'}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(poruka)}`;
  };

  const onShareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(poruka)}`, '_blank', 'noopener,noreferrer');
  };

  if (!interview_id) {
    return (
      <div className="flex items-center justify-center flex-col mt-10">
        <div className="p-5 bg-white rounded-lg">Pripremam link…</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center flex-col mt-10">
      <CheckCircle2 className="h-14 w-14 text-green-500" />

      <h2 className="font-bold text-lg mt-4">Vaš AI intervju je spreman!</h2>
      <p className="mt-2 text-gray-500 text-center">Podijelite ovaj link s kandidatima da započnu intervju.</p>

      <div className="w-full p-7 mt-6 rounded-xl border bg-white">
        <h2 className="font-bold">Link za intervju</h2>

        <div className="mt-3 flex flex-col sm:flex-row gap-3 sm:items-center">
          <Input value={url} readOnly />
          <Button onClick={onCopyLink}>
            <Copy className="h-4 w-4" />
            Kopiraj link
          </Button>
        </div>

        <hr className="my-5" />

        <div className="flex gap-5">
          <h2 className="text-sm text-gray-500 flex gap-2 items-center">
            <Clock className="h-4 w-4" />
            {formData?.duration}
          </h2>
          <h2 className="text-sm text-gray-500 flex gap-2 items-center">
            <List className="h-4 w-4" />
            {questionCount} {questionCount % 10 === 1 && questionCount % 100 !== 11 ? 'pitanje' : 'pitanja'}
          </h2>
        </div>
      </div>

      <div className="mt-7 bg-white border p-5 rounded-xl w-full">
        <h2 className="font-bold">Podijeli putem</h2>
        <div className="flex flex-col sm:flex-row gap-3 mt-3">
          <Button variant="outline" className="flex-1" onClick={onShareEmail}>
            <Mail className="h-4 w-4" />
            E-mail
          </Button>
          <Button variant="outline" className="flex-1" onClick={onShareWhatsApp}>
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </Button>
        </div>
      </div>

      <div className="flex w-full gap-5 justify-between mt-6">
        <Button asChild variant="outline">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            Nazad na početnu
          </Link>
        </Button>

        <Button asChild>
          {/* obični <a> da se forma resetuje (ista ruta) */}
          <a href="/dashboard/kreiraj-interview">
            <Plus className="h-4 w-4" />
            Kreiraj novi intervju
          </a>
        </Button>
      </div>
    </div>
  );
}

export default InterviewLink;
