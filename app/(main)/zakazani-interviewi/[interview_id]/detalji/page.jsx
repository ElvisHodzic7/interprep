"use client"
import { useUser } from '@/app/provider';
import { supabase } from '@/services/supabaseClient';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import InterviewDetailContainer from './_components/InterviewDetailContainer';
import CandidatList from './_components/CandidatList';

function InterviewDetail() {
    const { interview_id } = useParams();
    const { user } = useUser();
    const [interviewDetail, setInterviewDetail] = useState();
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        user && GetInterviewDetail();
    }, [user])

    const GetInterviewDetail = async () => {
        const { data, error } = await supabase.from('Interviews')
            .select(`jobPosition,jobDescription,type,questionList,duration,interview_id,created_at,
                interview-feedback(userEmail,userName,feedback,created_at)`)
            .eq('userEmail', user?.email)
            .eq('interview_id', interview_id)

        if (error || !data?.length) {
            if (error) console.error('Greška pri učitavanju detalja:', error);
            setNotFound(true);
            return;
        }
        setInterviewDetail(data[0])
    }

    return (
        <div className='mt-5'>
            <div className='flex items-center gap-3'>
                <Link href='/zakazani-interviewi' aria-label='Nazad'>
                    <ArrowLeft />
                </Link>
                <h2 className='font-bold text-2xl'>Detalji intervjua</h2>
            </div>

            {notFound ? (
                <div className='p-8 bg-white border rounded-xl mt-5 text-center text-gray-500'>
                    Intervju nije pronađen.
                </div>
            ) : !interviewDetail ? (
                <div className='space-y-4 mt-5'>
                    <Skeleton className='h-64 rounded-xl bg-white border' />
                    <Skeleton className='h-24 rounded-xl bg-white border' />
                </div>
            ) : (
                <>
                    <InterviewDetailContainer interviewDetail={interviewDetail} />
                    <CandidatList
                        candidateList={interviewDetail['interview-feedback'] ?? []}
                        pdfTitle={interviewDetail.jobPosition}
                    />
                </>
            )}
        </div>
    )
}

export default InterviewDetail
