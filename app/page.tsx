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
    const [output, setOutput] = useState<{ html: string; link: string } | null>(null);
    const [error, setError] = useState('');
    const [copyBtnText, setCopyBtnText] = useState('📋 コピー');


    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const vParam = params.get('v');
        if (vParam) {
            const tParam = params.get('t') ? `&t=${encodeURIComponent(params.get('t') || '')}` : '';
            const typeParam = params.get('type') ? `&type=${encodeURIComponent(params.get('type') || '')}` : '';
            const goPath = resolveGoPath(window.location.hostname);
            window.location.href = `${goPath}?v=${encodeURIComponent(vParam)}${typeParam}${tParam}`;
        }
    }, []);

    const handleGenerate = () => {
        const input = videoInput.trim();
        const time = t.trim();
        setError('');
        setOutput(null);
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

        setOutput({
            html: `<a href="${link}" target="_blank" rel="noopener noreferrer">${link}</a>`,
            link: link
        });
    };

    const handleCopy = () => {
        if (output) {
            navigator.clipboard.writeText(output.link).then(() => {
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
                {output && (
                    <button className="btn btn-secondary" onClick={handleCopy}>{copyBtnText}</button>
                )}
            </div>

            {error && <div className="error-msg">{error}</div>}
            {output && (
                <div className="mt-4 output-area">
                    <div dangerouslySetInnerHTML={{ __html: output.html }} />
                </div>
            )}
        </div>
    );
}
