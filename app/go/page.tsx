'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

function buildRedirectUrl(v: string, typeParam: string, t: string) {
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

    return redirectUrl;
}

function RedirectContent() {
    const searchParams = useSearchParams();
    const [copyBtnText, setCopyBtnText] = useState('📋 コピー');

    const redirectUrl = useMemo(() => {
        const v = searchParams.get('v') || '';
        const typeParam = searchParams.get('type') || '';
        const t = searchParams.get('t') || '';

        if (!v) return '';

        return buildRedirectUrl(v, typeParam, t);
    }, [searchParams]);

    const handleCopy = () => {
        if (!redirectUrl) return;

        navigator.clipboard
            .writeText(redirectUrl)
            .then(() => {
                setCopyBtnText('✅ コピーしました');
                setTimeout(() => setCopyBtnText('📋 コピー'), 2000);
            })
            .catch(() => {
                setCopyBtnText('❌ コピー失敗');
                setTimeout(() => setCopyBtnText('📋 コピー'), 2000);
            });
    };

    if (!redirectUrl) return null;

    return (
        <div className="glass-card">
            <div className="output-area break-all">
                <a href={redirectUrl} target="_blank" rel="noopener noreferrer">
                    {redirectUrl}
                </a>
            </div>

            <div className="flex flex-col gap-3 mt-4">
                <a className="btn btn-primary" href={redirectUrl} target="_blank" rel="noopener noreferrer">
                    開く
                </a>
                <button className="btn btn-secondary" onClick={handleCopy}>
                    {copyBtnText}
                </button>
            </div>
        </div>
    );
}

export default function GoRedirect() {
    return (
        <Suspense fallback={null}>
            <RedirectContent />
        </Suspense>
    );
}
