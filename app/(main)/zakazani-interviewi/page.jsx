"use client"
import { useUser } from '@/app/provider';
import { Button } from '@/components/ui/button';
import { supabase } from '@/services/supabaseClient'
import { Video } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import InterviewCard from '../dashboard/_components/InterviewCard';

function ScheduledInterview() {
    const { user } = useUser();
    const [interviewList, setInterviewList] = useState([]);
    useEffect(() => {
        user && GetInterviewList();
    }, [user])

    const GetInterviewList = async () => {
        const result = await supabase.from('Interviews')
            .select('jobPosition,duration,interview_id,interview-feedback(userEmail)')
            .eq('userEmail', user?.email)
            .order('id', { ascending: false })

        console.log(result);
        setInterviewList(result.data);
    }

    return (
        <div className=' mt-5'>
            <h2 className='font-bold text-2xl'>Lista Interviewa sa recenzijom kandidata</h2>
            {interviewList?.length == 0 &&
                <div className='p-5 flex flex-col gap-3 items-center bg-white rounded-xl mt-5 '>
                    <Video className='h-10 w-10 text-primary' />
                    <h2>Trenutno nemate kreirani Interview-a!</h2>
                    <Button>+ Kreiraj novi Interview</Button>
                </div>}
            {interviewList &&
                <div className='grid grid-cols-2 mt-5 xl:grid-cols-3 gap-5'>
                    {interviewList && interviewList?.map((interview, index) => (
                        <InterviewCard interview={interview} key={index}
                            viewDetail={true}
                        />
                    ))}
                </div>
            }
        </div>
    )
}

export default ScheduledInterview