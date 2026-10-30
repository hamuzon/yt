'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { SpeedInsights } from "@vercel/speed-insights/next";
import { isMusicYouTubeHost, isYouTubeHost, parseYouTubeInput } from './lib/youtube';


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
            const tParam = params.get('t') || params.get('time') || params.get('start') || '';

            const ua = navigator.userAgent || '';
            const isMobile = /iPhone|iPad|iPod|Android/i.test(ua);

            let redirectUrl: string;
            switch (typeParam) {
                case 'm':
                    redirectUrl = `https://music.youtube.com/watch?v=${encodeURIComponent(vParam)}`;
                    break;
                case 's':
                    redirectUrl = isMobile
                        ? `https://m.youtube.com/shorts/${encodeURIComponent(vParam)}`
                        : `https://www.youtube.com/shorts/${encodeURIComponent(vParam)}`;
                    break;
                default:
                    redirectUrl = `https://youtu.be/${encodeURIComponent(vParam)}`;
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

        const parsed = parseYouTubeInput(input);
        if (!parsed || !parsed.videoId) {
            setError('❌ 有効なURLまたはIDを入力してください');
            return;
        }

        const finalT = time || parsed.time;
        const link = buildGoUrl(window.location.origin, window.location.hostname, parsed.videoId, parsed.type, finalT);

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
        <>
            <script dangerouslySetInnerHTML={{ __html: `
(() => {
  const v = new URLSearchParams(window.location.search).get('v');
  if (!v) return;
  const type = new URLSearchParams(window.location.search).get('type') || '';
  const t = new URLSearchParams(window.location.search).get('t') || '';
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent || '');
  let url;
  if (type === 'm') url = 'https://music.youtube.com/watch?v=' + v;
  else if (type === 's') url = (isMobile ? 'https://m.youtube.com/shorts/' : 'https://www.youtube.com/shorts/') + v;
  else url = 'https://youtu.be/' + v;
  if (t) url += (url.includes('?') ? '&' : '?') + 't=' + encodeURIComponent(t);
  window.location.replace(url);
})();
` }} />
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
                <SpeedInsights />
            </div>
        </>
    );
}
