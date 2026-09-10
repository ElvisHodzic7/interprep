"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Clock, Copy, List, Mail, Plus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

function InterviewLink({ interview_id, formData, questionCount = 10 }) {
  const [baseUrl, setBaseUrl] = useState('');

  // Odredi pouzdan base URL u browseru; fallback na env ako treba (npr. Vercel Preview)
  useEffect(() => {
    const origin =
      typeof window !== 'undefined' && window.location?.origin
        ? window.location.origin
        : (process.env.NEXT_PUBLIC_HOST_URL || '');
    setBaseUrl(origin);
  }, []);

  // Ispravan share URL: /interview/[id]
  const url = useMemo(() => {
    if (!interview_id || !baseUrl) return '';
    return `${baseUrl}/interview/${interview_id}`;
  }, [baseUrl, interview_id]);

  const onCopyLink = async () => {
    try {
      if (!url) return;
      await navigator.clipboard.writeText(url);
      toast.success('Link kopiran!');
    } catch (e) {
      toast.error('Nisam uspio kopirati link.');
      console.error(e);
    }
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
      <div>
        <Image
          src={'/check.png'}
          alt="check"
          width={200}
          height={200}
          className="w-[50px] h-[50px]"
        />
      </div>

      <h2 className="font-bold text-lg mt-4">Your AI Interview is Ready!</h2>
      <p className="mt-3">Share this link with your candidates to start the interview process</p>

      <div className="w-full p-7 mt-6 rounded-lg bg-white">
        <div className="flex justify-between items-center">
          <h2 className="font-bold">Interview Link</h2>
          <h2 className="p-1 px-2 text-primary bg-blue-50 rounded-4xl">Valid for 30 Days</h2>
        </div>

        <div className="mt-3 flex gap-3 items-center">
          <Input value={url} readOnly />
          <Button onClick={onCopyLink}>
            <Copy className="mr-2 h-4 w-4" />
            Copy Link
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
            {questionCount} Questions
          </h2>
        </div>
      </div>

      <div className="mt-7 bg-white p-5 rounded-lg w-full">
        <h2 className="font-bold">Share Via</h2>
        <div className="flex gap-7 mt-2 justify-around">
          <Button variant="outline">
            <Mail className="mr-2 h-4 w-4" />
            Slack
          </Button>
          <Button variant="outline">
            <Mail className="mr-2 h-4 w-4" />
            Email
          </Button>
          <Button variant="outline">
            <Mail className="mr-2 h-4 w-4" />
            Whatsapp
          </Button>
        </div>
      </div>

      <div className="flex w-full gap-5 justify-between mt-6">
        <Link href="/dashboard">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>

        <Link href="/dashboard/kreiraj-interview">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create New Interview
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default InterviewLink;
