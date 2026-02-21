'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function RedirectContent() {
    const searchParams = useSearchParams();

    useEffect(() => {
        const v = searchParams.get('v');
        const typeParam = searchParams.get('type') || '';
        const t = searchParams.get('t') || '';

        if (!v) {
            // If no V, we can't redirect to a specific video, so go home
            window.location.href = '/';
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
                // Default is youtu.be for shorter links
                redirectUrl = `https://youtu.be/${v}`;
        }

        if (t) {
            const sep = redirectUrl.includes('?') ? '&' : '?';
            redirectUrl += `${sep}t=${encodeURIComponent(t)}`;
        }

        window.location.href = redirectUrl;
    }, [searchParams]);

    return (
        <div className="glass-card">
            <h1>Redirecting...</h1>
            <p>YouTubeへ移動しています。</p>
        </div>
    );
}

export default function YTRedirect() {
    return (
        <Suspense fallback={<div className="glass-card"><h1>Loading...</h1></div>}>
            <RedirectContent />
        </Suspense>
    );
}
