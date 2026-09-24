"use client"
import { useUser } from '@/app/provider'
import Image from 'next/image';
import React from 'react'

function WelcomeContainer() {
    const { user } = useUser();
    const initial = (user?.name || user?.email || '?')[0]?.toUpperCase();
    return (
        <div className='bg-white p-5 rounded-xl border flex justify-between items-center'>
            <div>
                <h2 className='text-lg font-bold'>Dobro došli{user?.name ? `, ${user.name}` : ''}</h2>
                <h2 className='text-gray-500'>AI-generisani intervjui za bolju pripremu i lakše zapošljavanje</h2>
            </div>
            {user && (user.picture ? (
                <Image src={user.picture} alt='Profilna slika'
                    width={40} height={40}
                    className='rounded-full'
                />
            ) : (
                <div className='h-10 w-10 shrink-0 rounded-full bg-primary text-white font-bold flex items-center justify-center'>
                    {initial}
                </div>
            ))}
        </div>
    )
}

export default WelcomeContainer
