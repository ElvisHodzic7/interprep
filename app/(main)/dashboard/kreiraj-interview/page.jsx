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

function CreateInterview() {
  const router = useRouter();
  const { user } = useUser();

  // default jezik + prazan niz za type
  const [formData, setFormData] = useState({ lang: 'bs', type: [] });
  const [step, setStep] = useState(1);
  const [interviewId, setInterviewId] = useState();

  const onHandleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const onGoToNext = () => {
    if (typeof user?.credits === 'number' && user.credits <= 0) {
      toast('Molimo dopunite kredite');
      return;
    }
    if (
      !formData?.jobPosition ||
      !formData?.jobDescription ||
      !formData?.duration ||
      !Array.isArray(formData?.type) || formData.type.length === 0 ||
      !formData?.lang
    ) {
      toast('Molimo ispunite sva polja!');
      return;
    }
    setStep(s => s + 1);
  };

  const onCreateLink = (interview_id) => {
    setInterviewId(interview_id);
    setStep(s => s + 1);
  };

  return (
    <div className='mt-5 px-10 md:px-24 lg:px-44 xl:px-56'>
      <div className='flex gap-5 items-center'>
        <ArrowLeft onClick={() => router.back()} className='cursor-pointer' />
        <h2 className='font-bold text-2xl'>Kreiraj novi intervju</h2>
      </div>

      <Progress value={step * 33.33} className='my-5' />

      {step === 1 ? (
        <FormContainer
          onHandleInputChange={onHandleInputChange}
          formData={formData}
          GoToNext={onGoToNext}
        />
      ) : step === 2 ? (
        <>
         <QuestionList
  formData={formData}
  onCreateLink={onCreateLink}

/>

          {/* OBAVEZNO: prosljeđujemo korisnički email za Supabase INSERT */}
        </>
      ) : step === 3 ? (
        <InterviewLink
          interview_id={interviewId}
          formData={formData}
        />
      ) : null}
    </div>
  );
}

export default CreateInterview;
