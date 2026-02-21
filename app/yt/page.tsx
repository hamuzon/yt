'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

function RedirectContent() {
    const searchParams = useSearchParams();

    useEffect(() => {
        const v = searchParams.get('v');
        const typeParam = searchParams.get('type') || '';
        const t = searchParams.get('t') || '';

        if (!v) {
            window.location.replace('/');
            return;
        }

        const ua = navigator.userAgent || '';
        const isMobile = /iPhone|iPad|iPod|Android/i.test(ua);

        let redirectUrl: string;

        switch (typeParam) {
            case 'm':
                redirectUrl = `https://music.youtube.com/watch?v=${v}`;
                break;
            case 's':
                redirectUrl = isMobile
                    ? `https://m.youtube.com/shorts/${v}`
                    : `https://www.youtube.com/shorts/${v}`;
                break;
            default:
                redirectUrl = `https://youtu.be/${v}`;
        }

        if (t) {
            const sep = redirectUrl.includes('?') ? '&' : '?';
            redirectUrl += `${sep}t=${encodeURIComponent(t)}`;
        }

        window.location.replace(redirectUrl);
    }, [searchParams]);

    return null;
}

export default function YTRedirect() {
    return (
        <Suspense fallback={null}>
            <RedirectContent />
        </Suspense>
    );
}
