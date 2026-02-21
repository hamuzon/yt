'use client';

import { useState, useEffect } from 'react';


function getGoPath(origin: string): string {
    try {
        const { hostname } = new URL(origin);
        return hostname === 'hamuzon.github.io' ? '/yt/go/' : '/go/';
    } catch {
        return '/go/';
    }
}


export default function Home() {
    const [videoInput, setVideoInput] = useState('');
    const [t, setT] = useState('');
    const [output, setOutput] = useState<{ html: string; link: string } | null>(null);
    const [error, setError] = useState('');
    const [copyBtnText, setCopyBtnText] = useState('📋 コピー');

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const vParam = params.get("v");
        if (vParam) {
            const tParam = params.get("t") ? `&t=${encodeURIComponent(params.get("t") || '')}` : "";
            const typeParam = params.get("type") ? `&type=${encodeURIComponent(params.get("type") || '')}` : "";
            const goPath = getGoPath(window.location.origin);
            window.location.href = `${goPath}?v=${vParam}${typeParam}${tParam}`;
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
            if (input.startsWith("http")) {
                const urlObj = new URL(input);
                const host = urlObj.hostname;
                if (host.includes("youtube.com") || host.includes("m.youtube.com") || host.includes("music.youtube.com")) {
                    if (urlObj.pathname.startsWith("/watch")) {
                        const vFromUrl = urlObj.searchParams.get("v");
                        if (vFromUrl) v = vFromUrl;
                        if (host.includes("music.youtube.com")) type = "m";
                    }
                    if (urlObj.pathname.startsWith("/shorts/")) {
                        v = urlObj.pathname.split("/shorts/")[1].split("/")[0];
                        type = "s";
                    }
                    const tFromUrl = urlObj.searchParams.get("t");
                    if (tFromUrl) paramT = tFromUrl;
                } else if (host === "youtu.be") {
                    v = urlObj.pathname.replace("/", "");
                    const tFromUrl = urlObj.searchParams.get("t");
                    if (tFromUrl) paramT = tFromUrl;
                }
            } else if (input.includes("?")) {
                const [id, queryParams] = input.split("?");
                v = id;
                const p = new URLSearchParams(queryParams);
                const tFromUrl = p.get("t");
                if (tFromUrl) paramT = tFromUrl;
            }
        } catch (e) {
            console.error('URL parsing error:', e);
        }

        const finalT = time || paramT;
        const base = typeof window !== 'undefined' ? window.location.origin : '';
        const goPath = getGoPath(base);
        let link = `${base}${goPath}?v=${v}`;
        if (type) link += `&type=${type}`;
        if (finalT) link += `&t=${encodeURIComponent(finalT)}`;

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
                    onChange={(e) => setVideoInput(e.target.value)}
                    placeholder="動画IDまたはURLを入力"
                />
            </div>
            <div className="input-group">
                <input
                    type="text"
                    value={t}
                    onChange={(e) => setT(e.target.value)}
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
