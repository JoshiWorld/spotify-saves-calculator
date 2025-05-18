"use client";

import { Button } from '@/components/ui/button';
import React, { useEffect } from 'react';

interface ErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
                <h1 className="text-2xl font-semibold text-red-500 mb-4">
                    Es ist ein Fehler aufgetreten!
                </h1>
                <p className="text-gray-700 mb-4">
                    {/* {error.message || 'Ein unerwarteter Fehler ist aufgetreten.'} */}
                    Link konnte nicht gefunden
                </p>
                <Button onClick={() => reset()} variant="outline">
                    Erneut versuchen
                </Button>
            </div>
        </div>
    );
}