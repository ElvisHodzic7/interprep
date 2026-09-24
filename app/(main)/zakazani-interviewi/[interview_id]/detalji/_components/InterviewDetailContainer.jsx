import { Calendar, Clock, Tag } from 'lucide-react'
import moment from '@/lib/moment'
import React from 'react'

function InterviewDetailContainer({ interviewDetail }) {
    // `type` je u bazi običan string "Tehnički, Behavioralni"
    const types = (interviewDetail?.type || '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

    return (
        <div className='p-5 md:p-7 bg-white border rounded-xl mt-5'>
            <h2 className='text-xl font-bold'>{interviewDetail?.jobPosition}</h2>

            <div className='mt-4 flex flex-wrap items-start gap-x-12 gap-y-4'>
                <div>
                    <h2 className='text-sm text-gray-500'>Trajanje</h2>
                    <h2 className='flex text-sm font-bold items-center gap-2'><Clock className='h-4 w-4' /> {interviewDetail?.duration}</h2>
                </div>
                <div>
                    <h2 className='text-sm text-gray-500'>Kreirano</h2>
                    <h2 className='flex text-sm font-bold items-center gap-2'>
                        <Calendar className='h-4 w-4' />
                        {interviewDetail?.created_at ? moment(interviewDetail.created_at).format('DD.MM.YYYY.') : '—'}
                    </h2>
                </div>
                {types.length > 0 && <div>
                    <h2 className='text-sm text-gray-500'>Tip</h2>
                    <div className='flex flex-wrap gap-2 mt-0.5'>
                        {types.map((t) => (
                            <span key={t} className='inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary'>
                                <Tag className='h-3 w-3' /> {t}
                            </span>
                        ))}
                    </div>
                </div>}
            </div>

            <div className='mt-5'>
                <h2 className='font-bold'>Opis posla</h2>
                <p className='text-sm leading-6 whitespace-pre-line text-gray-700'>{interviewDetail?.jobDescription}</p>
            </div>

            <div className='mt-5'>
                <h2 className='font-bold'>Pitanja na intervjuu</h2>
                <ol className='grid grid-cols-1 md:grid-cols-2 gap-3 mt-3'>
                    {(interviewDetail?.questionList ?? []).map((item, index) => (
                        <li className='text-sm flex gap-2' key={index}>
                            <span className='font-bold text-primary'>{index + 1}.</span>
                            <span>{item?.question}</span>
                        </li>
                    ))}
                </ol>
            </div>
        </div>
    )
}

export default InterviewDetailContainer
