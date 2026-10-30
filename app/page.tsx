
'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { parseYouTubeInput } from './lib/youtube';

function resolveGoPath(hostname: string): string {
    return hostname.endsWith('github.io') ? '/yt/go/' : '/go/';
}

function buildGoUrl(
    origin: string,
    hostname: string,
    v: string,
    typeParam: string,
    t: string
): string {
    const url = new URL(resolveGoPath(hostname), origin);

    url.searchParams.set('v', v);

    if (typeParam) {
        url.searchParams.set('type', typeParam);
    }

    if (t) {
        url.searchParams.set('t', t);
    }

    return url.toString();
}

function resolveYouTubeUrl(
    videoId: string,
    type: string,
    time: string,
    isMobile: boolean
): string {
    let url: string;

    switch (type) {
        case 'm':
            url = `https://music.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
            break;

        case 's':
            url = `${isMobile ? 'https://m.youtube.com' : 'https://www.youtube.com'}/shorts/${encodeURIComponent(videoId)}`;
            break;

        default:
            url = `https://youtu.be/${encodeURIComponent(videoId)}`;
            break;
    }

    if (time) {
        const separator = url.includes('?') ? '&' : '?';
        url += `${separator}t=${encodeURIComponent(time)}`;
    }

    return url;
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

        if (!vParam) return;

        const typeParam = params.get('type') || '';
        const tParam =
            params.get('t') ||
            params.get('time') ||
            params.get('start') ||
            '';

        const ua = navigator.userAgent || '';
        const isMobile = /iPhone|iPad|iPod|Android/i.test(ua);

        const redirectUrl = resolveYouTubeUrl(
            vParam,
            typeParam,
            tParam,
            isMobile
        );

        window.location.replace(redirectUrl);
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

        const parsed = parseYouTubeInput(input);

        if (!parsed || !parsed.videoId) {
            setError('❌ 有効なURLまたはIDを入力してください');
            return;
        }

        const finalT = time || parsed.time || '';

        const link = buildGoUrl(
            window.location.origin,
            window.location.hostname,
            parsed.videoId,
            parsed.type || '',
            finalT
        );

        setOutputLink(link);
    };

    const handleCopy = async () => {
        if (!outputLink) return;

        try {
            await navigator.clipboard.writeText(outputLink);
            setCopyBtnText('✅ コピーしました');
        } catch {
            setCopyBtnText('❌ コピー失敗');
        }

        setTimeout(() => {
            setCopyBtnText('📋 コピー');
        }, 2000);
    };

    return (
        <>
            <div className="glass-card">
                <h1>🎬 YouTube Link</h1>

                <div className="input-group">
                    <input
                        type="text"
                        value={videoInput}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setVideoInput(e.target.value)
                        }
                        placeholder="動画IDまたはURLを入力"
                    />
                </div>

                <div className="input-group">
                    <input
                        type="text"
                        value={t}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setT(e.target.value)
                        }
                        placeholder="再生開始時間 t=xx（任意）"
                    />
                </div>

                <div className="flex flex-col gap-3">
                    <button
                        className="btn btn-primary"
                        onClick={handleGenerate}
                    >
                        リンク生成
                    </button>

                    {outputLink && (
                        <button
                            className="btn btn-secondary"
                            onClick={handleCopy}
                        >
                            {copyBtnText}
                        </button>
                    )}
                </div>

                {error && (
                    <div className="error-msg">
                        {error}
                    </div>
                )}

                {outputLink && (
                    <div className="mt-4 output-area">
                        <a
                            href={outputLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="break-all"
                        >
                            {outputLink}
                        </a>
                    </div>
                )}

                <SpeedInsights />
            </div>
        </>
    );
}
