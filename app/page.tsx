'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { isMusicYouTubeHost, isYouTubeHost } from './lib/youtube';


function resolveGoPath(hostname: string): string {
    return hostname.endsWith('github.io') ? '/yt/go/' : '/go/';
}

function buildGoUrl(origin: string, hostname: string, v: string, typeParam: string, t: string): string {
    let redirectUrl = `${origin}${resolveGoPath(hostname)}?v=${encodeURIComponent(v)}`;

    if (typeParam) {
        redirectUrl += `&type=${encodeURIComponent(typeParam)}`;
    }

    if (t) {
        redirectUrl += `&t=${encodeURIComponent(t)}`;
    }

    return redirectUrl;
}


export default function Home() {
    const [videoInput, setVideoInput] = useState('');
    const [t, setT] = useState('');
    const [outputLink, setOutputLink] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [copyBtnText, setCopyBtnText] = useState('📋 コピー');


    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const vParam = params.get('v');
        if (vParam) {
            const typeParam = params.get('type') || '';
            const tParam = params.get('t') || '';

            const ua = navigator.userAgent || '';
            const isMobile = /iPhone|iPad|iPod|Android/i.test(ua);

            let redirectUrl: string;
            switch (typeParam) {
                case 'm':
                    redirectUrl = `https://music.youtube.com/watch?v=${vParam}`;
                    break;
                case 's':
                    redirectUrl = isMobile
                        ? `https://m.youtube.com/shorts/${vParam}`
                        : `https://www.youtube.com/shorts/${vParam}`;
                    break;
                default:
                    redirectUrl = `https://youtu.be/${vParam}`;
            }

            if (tParam) {
                const sep = redirectUrl.includes('?') ? '&' : '?';
                redirectUrl += `${sep}t=${encodeURIComponent(tParam)}`;
            }

            window.location.replace(redirectUrl);
        }
    }, []);

    const handleGenerate = () => {
        const input = videoInput.trim();
        const time = t.trim();
        setError('');
        setOutputLink(null);
        setCopyBtnText('📋 コピー');

        if (!input) {
            setError('⚠️ 入力してください');
            return;
        }

        let v: string = input;
        let type: string = '';
        let paramT: string = '';

        try {
            if (input.startsWith('http')) {
                const urlObj = new URL(input);
                const host = urlObj.hostname;
                const isYouTubeDomain = isYouTubeHost(host);

                if (isYouTubeDomain) {
                    if (urlObj.pathname.startsWith('/watch')) {
                        const vFromUrl = urlObj.searchParams.get('v');
                        if (vFromUrl) v = vFromUrl;
                        if (isMusicYouTubeHost(host)) type = 'm';
                    }
                    if (urlObj.pathname.startsWith('/shorts/')) {
                        v = urlObj.pathname.split('/shorts/')[1].split('/')[0];
                        type = 's';
                    }
                    const tFromUrl = urlObj.searchParams.get('t');
                    if (tFromUrl) paramT = tFromUrl;
                } else if (host === 'youtu.be') {
                    v = urlObj.pathname.replace('/', '');
                    const tFromUrl = urlObj.searchParams.get('t');
                    if (tFromUrl) paramT = tFromUrl;
                }
            } else if (input.includes('?')) {
                const [id, queryParams] = input.split('?');
                v = id;
                const p = new URLSearchParams(queryParams);
                const tFromUrl = p.get('t');
                if (tFromUrl) paramT = tFromUrl;
            }
        } catch (e) {
            console.error('URL parsing error:', e);
        }

        const finalT = time || paramT;
        const link = buildGoUrl(window.location.origin, window.location.hostname, v, type, finalT);

        setOutputLink(link);
    };

    const handleCopy = () => {
        if (outputLink) {
            navigator.clipboard.writeText(outputLink).then(() => {
                setCopyBtnText('✅ コピーしました');
                setTimeout(() => setCopyBtnText('📋 コピー'), 2000);
            }).catch(() => {
                setCopyBtnText('❌ コピー失敗');
                setTimeout(() => setCopyBtnText('📋 コピー'), 2000);
            });
        }
    };

    return (
        <div className="glass-card">
            <h1>🎬 YouTube Link</h1>
            <div className="input-group">
                <input
                    type="text"
                    value={videoInput}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setVideoInput(e.target.value)}
                    placeholder="動画IDまたはURLを入力"
                />
            </div>
            <div className="input-group">
                <input
                    type="text"
                    value={t}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setT(e.target.value)}
                    placeholder="再生開始時間 t=xx（任意）"
                />
            </div>

            <div className="flex flex-col gap-3">
                <button className="btn btn-primary" onClick={handleGenerate}>リンク生成</button>
                {outputLink && (
                    <button className="btn btn-secondary" onClick={handleCopy}>{copyBtnText}</button>
                )}
            </div>

            {error && <div className="error-msg">{error}</div>}
            {outputLink && (
                <div className="mt-4 output-area">
                    <a href={outputLink} target="_blank" rel="noopener noreferrer" className="break-all">
                        {outputLink}
                    </a>
                </div>
            )}
        </div>
    );
}
