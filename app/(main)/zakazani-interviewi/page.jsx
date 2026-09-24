"use client"
import { useUser } from '@/app/provider';
import { supabase } from '@/services/supabaseClient'
import React, { useEffect, useState } from 'react'
import InterviewGrid from '../dashboard/_components/InterviewGrid';

function ScheduledInterview() {
    const { user } = useUser();
    const [interviewList, setInterviewList] = useState(null); // null dok se učitava

    useEffect(() => {
        user && GetInterviewList();
    }, [user])

    const GetInterviewList = async () => {
        const { data, error } = await supabase.from('Interviews')
            .select('jobPosition,duration,type,created_at,interview_id,interview-feedback(userEmail)')
            .eq('userEmail', user?.email)
            .order('id', { ascending: false })

        if (error) console.error('Greška pri učitavanju intervjua:', error);
        setInterviewList(data || []);
    }

    return (
        <div className='my-5'>
            <h2 className='font-bold text-2xl'>Rezultati kandidata</h2>
            <p className='text-gray-500'>Odaberite intervju da vidite ocjene i izvještaje kandidata.</p>
            <InterviewGrid interviews={interviewList} viewDetail />
        </div>
    )
}

export default ScheduledInterview
