import Image from 'next/image'
import React from 'react'

function InterviewHeader() {
    return (
        <div className='px-5 py-4 shadow-sm bg-white flex items-center justify-between'>
            <Image src={'/logo.png'} alt='InterPrep' width={200} height={100}
                className='w-[140px]'
            />
            <span className='text-sm text-gray-500'>AI intervju</span>
        </div>
    )
}

export default InterviewHeader
