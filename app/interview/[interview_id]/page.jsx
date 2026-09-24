"use client"
import React, { useContext, useEffect, useState } from 'react'
import Image from 'next/image'
import { Clock, Info, Loader2Icon, Mic, TriangleAlert } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/services/supabaseClient'
import { toast } from 'sonner'
import { InterviewDataContext } from '@/context/InterviewDataContext'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Interview() {

    const { interview_id } = useParams();
    const [interviewData, setInterviewData] = useState();
    const [invalidLink, setInvalidLink] = useState(false);
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const { setInterviewInfo } = useContext(InterviewDataContext);
    const router = useRouter();

    useEffect(() => {
        interview_id && GetInterviewDetails();
    }, [interview_id])

    const GetInterviewDetails = async () => {
        setLoading(true);
        try {
            const { data: Interviews, error } = await supabase
                .from('Interviews')
                .select("jobPosition,jobDescription,duration,type")
                .eq('interview_id', interview_id)
            if (error || !Interviews?.length) {
                setInvalidLink(true);
                toast.error('Neispravan link za intervju');
                return;
            }
            setInterviewData(Interviews[0]);
        }
        catch (e) {
            setInvalidLink(true);
            toast.error('Neispravan link za intervju');
        } finally {
            setLoading(false);
        }
    }

    const isEmailValid = EMAIL_REGEX.test(userEmail.trim());
    const canJoin = !loading && userName.trim().length > 1 && isEmailValid;

    const onJoinInterview = async () => {
        setLoading(true);
        const { data: Interviews, error } = await supabase
            .from('Interviews')
            .select('*')
            .eq('interview_id', interview_id);

        if (error || !Interviews?.length) {
            toast.error('Nije moguće učitati intervju. Pokušajte ponovo.');
            setLoading(false);
            return;
        }

        setInterviewInfo({
            userName: userName.trim(),
            userEmail: userEmail.trim(),
            interviewData: Interviews[0]
        });
        router.push('/interview/' + interview_id + '/start')
    }

    if (invalidLink) {
        return (
            <div className='px-5 md:px-28 lg:px-48 xl:px-80 mt-7 pb-20'>
                <div className='flex flex-col items-center text-center border rounded-xl bg-white p-10 shadow-sm'>
                    <TriangleAlert className='h-10 w-10 text-amber-500' />
                    <h2 className='font-bold text-xl mt-4'>Link za intervju nije ispravan</h2>
                    <p className='text-gray-500 mt-2'>
                        Provjerite da li ste kopirali cijeli link ili kontaktirajte osobu koja vam ga je poslala.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className='px-5 md:px-28 lg:px-48 xl:px-80 mt-7 pb-20'>
            <div className='flex flex-col items-center
             justify-center border rounded-xl bg-white shadow-sm
             p-7 lg:px-16 xl:px-24 mb-20'>
                <h2 className='text-sm font-medium text-primary'>AI intervju</h2>

                <Image src={'/interview.png'} alt='Ilustracija intervjua'
                    width={500}
                    height={500}
                    className='w-[240px] my-6'
                />

                <h2 className='font-bold text-xl text-center'>{interviewData?.jobPosition || 'Učitavanje…'}</h2>
                {interviewData?.duration && (
                    <h2 className='flex gap-2 items-center text-gray-500 mt-2'>
                        <Clock className='h-4 w-4' /> {interviewData.duration}
                    </h2>
                )}

                <div className='w-full mt-6'>
                    <label htmlFor='ime' className='text-sm font-medium'>Ime i prezime</label>
                    <Input id='ime' className='mt-1' placeholder='npr. Mujo Mujić'
                        value={userName} onChange={(event) => setUserName(event.target.value)} />
                </div>
                <div className='w-full mt-4'>
                    <label htmlFor='email' className='text-sm font-medium'>E-mail</label>
                    <Input id='email' type='email' className='mt-1' placeholder='npr. mujo.mujic@gmail.com'
                        value={userEmail} onChange={(event) => setUserEmail(event.target.value)} />
                    {userEmail && !isEmailValid && (
                        <p className='text-xs text-red-600 mt-1'>Unesite ispravnu e-mail adresu.</p>
                    )}
                </div>

                <div className='p-4 bg-primary/5 border border-primary/20 flex gap-4 rounded-xl mt-6 w-full'>
                    <Info className='text-primary shrink-0' />
                    <div>
                        <h2 className='font-bold'>Prije nego što počnemo</h2>
                        <ul className='mt-1 space-y-0.5'>
                            <li className='text-sm text-gray-700'>• Provjerite da mikrofon radi i dozvolite mu pristup u pregledniku</li>
                            <li className='text-sm text-gray-700'>• Provjerite da imate stabilnu internet konekciju</li>
                            <li className='text-sm text-gray-700'>• Nastojte biti u okruženju bez buke</li>
                        </ul>
                    </div>
                </div>

                <Button className='mt-6 w-full font-bold'
                    disabled={!canJoin}
                    onClick={() => onJoinInterview()}
                >
                    {loading ? <Loader2Icon className='animate-spin' /> : <Mic />} Pridružite se intervjuu</Button>
            </div>
        </div>
    )
}

export default Interview
