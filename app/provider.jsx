"use client"
import { UserDetailContext } from '@/context/UserDetailContext';
import { supabase } from '@/services/supabaseClient'
import { usePathname, useRouter } from 'next/navigation';
import React, { useContext, useEffect, useState } from 'react'

// Rute koje zahtijevaju prijavu (dashboard dio aplikacije)
const PROTECTED_PREFIXES = ['/dashboard', '/postavke', '/svi-interviewi', '/zakazani-interviewi'];
const isProtected = (path) =>
    PROTECTED_PREFIXES.some((p) => path === p || path?.startsWith(p + '/'));

const Provider = ({children}) => {

    const [user,setUser] = useState();
    const [authStatus, setAuthStatus] = useState('loading'); // 'loading' | 'in' | 'out'
    const router = useRouter();
    const pathname = usePathname();

    useEffect(()=>{
        CreateNewUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'SIGNED_OUT') {
                setUser(undefined);
                setAuthStatus('out');
            }
        });
        return () => subscription.unsubscribe();
    }, [])

    // Neprijavljen korisnik na zaštićenoj ruti ide na prijavu
    useEffect(() => {
        if (authStatus === 'out' && isProtected(pathname)) router.replace('/auth');
    }, [authStatus, pathname, router]);

    const CreateNewUser = async () => {
        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (!authUser) {
            setAuthStatus('out');
            return;
        }
        setAuthStatus('in');

        const { data: Users } = await supabase
            .from('Users')
            .select("*")
            .eq('email', authUser.email)

        if (!Users?.length) {
            const { data, error } = await supabase.from('Users')
                .insert([
                    {
                        name: authUser.user_metadata?.name || authUser.email?.split('@')[0],
                        email: authUser.email,
                        picture: authUser.user_metadata?.picture,
                    }
                ])
                .select()
                .single();
            if (error) console.error('Greška pri kreiranju korisnika:', error);
            setUser(data);
            return;
        }
        setUser(Users[0]);
    }

  return (
    <UserDetailContext.Provider value={{user, setUser}}>
    <div>{children}</div>
    </UserDetailContext.Provider>
  )
}

export default Provider

export const useUser=()=>{
    const context=useContext(UserDetailContext);
    return context;
}
