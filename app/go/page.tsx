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

    const data = useMemo(() => {
        const v = searchParams.get('v') || '';
        const typeParam = searchParams.get('type') || '';
        const t = searchParams.get('t') || '';

        if (!v) {
            return {
                valid: false,
                redirectUrl: '',
            };
        }

        return {
            valid: true,
            redirectUrl: buildRedirectUrl(v, typeParam, t),
        };
    }, [searchParams]);

    const handleCopy = () => {
        if (!data.valid) return;

        navigator.clipboard
            .writeText(data.redirectUrl)
            .then(() => {
                setCopyBtnText('✅ コピーしました');
                setTimeout(() => setCopyBtnText('📋 コピー'), 2000);
            })
            .catch(() => {
                setCopyBtnText('❌ コピー失敗');
                setTimeout(() => setCopyBtnText('📋 コピー'), 2000);
            });
    };

    if (!data.valid) {
        return (
            <div className="glass-card">
                <h1>⚠️ パラメータが不足しています</h1>
                <p>URL に <code>?v=動画ID</code> を付けてください。</p>
            </div>
        );
    }

    return (
        <div className="glass-card">
            <h1>🎬 変換結果</h1>
            <p>以下のURLへ移動できます。</p>

            <div className="mt-4 output-area break-all">
                <a href={data.redirectUrl} target="_blank" rel="noopener noreferrer">
                    {data.redirectUrl}
                </a>
            </div>

            <div className="flex flex-col gap-3 mt-4">
                <a className="btn btn-primary" href={data.redirectUrl} target="_blank" rel="noopener noreferrer">
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
