"use client"
import { useUser } from '@/app/provider'
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card'
import { supabase } from '@/services/supabaseClient';
import { LogOut } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React from 'react'
import { toast } from 'sonner';

function Settings() {
    const { user } = useUser();
    const router = useRouter();
    const onSignOut = async () => {
        const { error } = await supabase.auth.signOut()
        if (error) {
            toast.error('Odjava nije uspjela. Pokušajte ponovo.');
            return;
        }
        router.replace('/auth')
    }
    const initial = (user?.name || user?.email || '?')[0]?.toUpperCase();

    return (
        <div className='mt-5'>
            <h2 className='font-bold text-2xl'>Postavke</h2>
            <Card className="w-full max-w-md mx-auto overflow-hidden mt-10">
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                        {user?.picture ? (
                            <Image src={user.picture} alt='Profilna slika' width={100} height={100}
                                className='w-[70px] h-[70px] rounded-full'
                            />
                        ) : (
                            <div className='w-[70px] h-[70px] shrink-0 rounded-full bg-primary text-white text-2xl font-bold flex items-center justify-center'>
                                {initial}
                            </div>
                        )}

                        <div className="flex flex-col items-center sm:items-start">
                            <h3 className="text-lg font-medium">{user?.name}</h3>
                            <p className="text-sm text-muted-foreground">{user?.email}</p>
                            {typeof user?.credits === 'number' && (
                                <p className="text-sm mt-1">Preostalo kredita: <span className="font-medium text-primary">{user.credits}</span></p>
                            )}
                        </div>
                    </div>

                    <div className="mt-6">
                        <Button variant="outline" className="w-full" onClick={onSignOut}>
                            <LogOut className="h-4 w-4" /> Odjava
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default Settings
