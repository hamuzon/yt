'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

function buildRedirectUrl(v: string, typeParam: string, t: string) {
    const ua = navigator.userAgent || '';
    const isMobile = /iPhone|iPad|iPod|Android/i.test(ua);

    let redirectUrl: string;

    switch (typeParam) {
        case 'm':
            redirectUrl = `https://music.youtube.com/watch?v=${encodeURIComponent(v)}`;
            break;
        case 's':
            redirectUrl = isMobile
                ? `https://m.youtube.com/shorts/${encodeURIComponent(v)}`
                : `https://www.youtube.com/shorts/${encodeURIComponent(v)}`;
            break;
        default:
            redirectUrl = `https://youtu.be/${encodeURIComponent(v)}`;
    }

    if (t) {
        const sep = redirectUrl.includes('?') ? '&' : '?';
        redirectUrl += `${sep}t=${encodeURIComponent(t)}`;
    }

    return redirectUrl;
}

function RedirectContent() {
    const searchParams = useSearchParams();

    const v = searchParams.get('v') || '';
    const typeParam = searchParams.get('type') || '';
    const t = searchParams.get('t') || '';

    useEffect(() => {
        if (!v) {
            window.location.replace('/');
            return;
        }

        const redirectUrl = buildRedirectUrl(v, typeParam, t);
        window.location.replace(redirectUrl);
    }, [v, typeParam, t]);

    return null;
}

export default function GoRedirect() {
    return (
        <Suspense fallback={null}>
            <RedirectContent />
        </Suspense>
    );
}
