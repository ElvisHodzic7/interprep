import React from 'react';
import { CheckCircle2, Clock, Send } from 'lucide-react';

const InterviewComplete = () => {
    return (
        <div className="flex flex-col min-h-[calc(100vh-72px)]">
            <main className="flex-grow flex items-center justify-center px-5 py-10">
                <div className="w-full max-w-xl rounded-xl border bg-white p-8 md:p-10 shadow-sm text-center">
                    <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />

                    <h1 className="mt-4 text-3xl font-bold">Intervju je završen!</h1>
                    <p className="mt-2 text-gray-500">
                        Hvala vam što ste učestvovali u intervjuu.
                    </p>

                    <div className="mt-8 rounded-xl bg-primary/5 border border-primary/20 p-6">
                        <div className="flex items-center justify-center rounded-full bg-primary w-12 h-12 mx-auto">
                            <Send className="h-5 w-5 text-white" />
                        </div>
                        <h2 className="mt-3 text-xl font-semibold">Šta je sljedeće?</h2>
                        <p className="mt-1 text-gray-600">
                            Vaši odgovori su poslani poslodavcu na pregled.
                        </p>
                        <p className="mt-3 text-sm text-gray-500 flex items-center justify-center gap-1">
                            <Clock className="h-4 w-4" />
                            Odgovor očekujte u roku od 2 do 3 radna dana.
                        </p>
                    </div>

                    <p className="mt-6 text-sm text-gray-400">Sada možete zatvoriti ovu stranicu.</p>
                </div>
            </main>

            <footer className="text-gray-400 text-center py-4 text-sm">
                <p>&copy; {new Date().getFullYear()} InterPrep · Elvis Hodžić</p>
            </footer>
        </div>
    );
};

export default InterviewComplete;
