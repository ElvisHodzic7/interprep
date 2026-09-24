"use client";
import { Progress } from '@/components/ui/progress';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import FormContainer from './_components/FormContainer';
import QuestionList from './_components/QuestionList';
import { toast } from 'sonner';
import InterviewLink from './_components/InterviewLink';
import { useUser } from '@/app/provider';

const STEPS = ['Detalji', 'Pitanja', 'Link'];

function CreateInterview() {
  const router = useRouter();
  const { user } = useUser();

  // jezik je uvijek bosanski; type je niz odabranih tipova
  const [formData, setFormData] = useState({ lang: 'bs', type: [] });
  const [step, setStep] = useState(1);
  const [interviewId, setInterviewId] = useState();
  const [questionCount, setQuestionCount] = useState(0);

  const onHandleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const onGoToNext = () => {
    if (typeof user?.credits === 'number' && user.credits <= 0) {
      toast.error('Nemate dovoljno kredita za kreiranje intervjua.');
      return;
    }
    if (
      !formData?.jobPosition?.trim() ||
      !formData?.jobDescription?.trim() ||
      !formData?.duration ||
      !Array.isArray(formData?.type) || formData.type.length === 0
    ) {
      toast.error('Molimo popunite sva polja i odaberite barem jedan tip intervjua.');
      return;
    }
    setStep(s => s + 1);
  };

  const onCreateLink = (interview_id, count) => {
    setInterviewId(interview_id);
    setQuestionCount(count);
    setStep(s => s + 1);
  };

  return (
    <div className='mt-5 md:px-10 lg:px-24 xl:px-44'>
      <div className='flex gap-5 items-center'>
        <ArrowLeft onClick={() => router.back()} className='cursor-pointer' aria-label='Nazad' />
        <h2 className='font-bold text-2xl'>Kreiraj novi intervju</h2>
      </div>

      <div className='mt-5 flex justify-between text-sm'>
        {STEPS.map((label, i) => (
          <span
            key={label}
            className={i + 1 <= step ? 'font-medium text-primary' : 'text-gray-400'}
          >
            {i + 1}. {label}
          </span>
        ))}
      </div>
      <Progress value={(step / STEPS.length) * 100} className='mt-2 mb-5' />

      {step === 1 ? (
        <FormContainer
          onHandleInputChange={onHandleInputChange}
          formData={formData}
          GoToNext={onGoToNext}
        />
      ) : step === 2 ? (
        <QuestionList formData={formData} onCreateLink={onCreateLink} />
      ) : step === 3 ? (
        <InterviewLink
          interview_id={interviewId}
          formData={formData}
          questionCount={questionCount}
        />
      ) : null}
    </div>
  );
}

export default CreateInterview;
