"use client"
import { useUser } from '@/app/provider';
import { supabase } from '@/services/supabaseClient';
import React, { useEffect, useState } from 'react'
import InterviewGrid from '../dashboard/_components/InterviewGrid';

function AllInterview() {
    const [interviewList, setInterviewList] = useState(null); // null dok se učitava
    const { user } = useUser();

    useEffect(() => {
        user && GetInterviewList();
    }, [user])

    const GetInterviewList = async () => {
        const { data: Interviews, error } = await supabase
            .from('Interviews')
            .select('*')
            .eq('userEmail', user?.email)
            .order('id', { ascending: false })

        if (error) console.error('Greška pri učitavanju intervjua:', error);
        setInterviewList(Interviews || []);
    }

    return (
        <div className='my-5'>
            <h2 className='font-bold text-2xl'>Svi intervjui</h2>
            <p className='text-gray-500'>Svi intervjui koje ste kreirali. Kopirajte ili pošaljite link kandidatima.</p>
            <InterviewGrid interviews={interviewList} />
        </div>
    )
}

export default AllInterview
