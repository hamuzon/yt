'use client';

import { useState } from 'react';

export default function TextPage() {
    const [linkText, setLinkText] = useState('');
    const [inputUrl, setInputUrl] = useState('');
    const [outputMarkdown, setOutputMarkdown] = useState('');
    const [timeOption, setTimeOption] = useState(true);

    const getMinimalYouTubeLink = (url: string, keepTime: boolean) => {
        try {
            const u = new URL(url);
            let videoId: string | null = null;
            let timeParam = '';

            if (keepTime) {
                const t = u.searchParams.get('t');
                const start = u.searchParams.get('start');
                if (t) timeParam = '?t=' + t;
                else if (start) timeParam = '?t=' + start;
            }

            if (u.hostname === 'youtu.be') {
                videoId = u.pathname.slice(1);
            } else if (u.hostname === 'music.youtube.com' && u.pathname === '/watch') {
                videoId = u.searchParams.get('v');
            } else if (u.hostname.includes('youtube.com')) {
                if (u.pathname === '/watch') {
                    videoId = u.searchParams.get('v');
                } else if (u.pathname.startsWith('/shorts/')) {
                    videoId = u.pathname.split('/')[2];
                }
            }

            if (!videoId) return null;

            return `https://youtu.be/${videoId}${timeParam}`;
        } catch (e) {
            console.error('Markdown link processing failed:', e);
            return null;
        }
    };

    const handleConvert = () => {
        const text = linkText.trim() || 'リンク';
        const link = getMinimalYouTubeLink(inputUrl.trim(), timeOption);
        if (!link) {
            setOutputMarkdown('無効なURL / Invalid URL');
        } else {
            setOutputMarkdown(`[${text}](${link})`);
        }
    };

    const handleCopy = () => {
        if (outputMarkdown && outputMarkdown !== '無効なURL / Invalid URL') {
            navigator.clipboard.writeText(outputMarkdown).then(() => {
                alert('Markdown copied!');
            });
        }
    };

    return (
        <div className="glass-card">
            <h1>YouTube 共有リンク Markdown 出力</h1>
            <p>入力文字と YouTube URL から Markdown 形式で短縮リンクを生成します<br />
                Generate short Markdown link from text & YouTube URL</p>

            <div className="input-group">
                <input
                    type="text"
                    value={linkText}
                    onChange={(e) => setLinkText(e.target.value)}
                    placeholder="リンク文字列を入力 / Enter link text"
                />
            </div>
            <div className="input-group">
                <input
                    type="text"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="YouTube URLを入力 / Enter YouTube URL"
                />
            </div>

            <div className="input-group flex items-center gap-3">
                <input
                    type="checkbox"
                    id="timeOption"
                    className="auto-width"
                    checked={timeOption}
                    onChange={(e) => setTimeOption(e.target.checked)}
                />
                <label htmlFor="timeOption" className="mb-0">時間パラメータ保持 / Keep time parameter</label>
            </div>

            <div className="flex flex-col gap-3">
                <button className="btn btn-primary" onClick={handleConvert}>Markdownに変換 / Convert</button>
                <button className="btn btn-secondary" onClick={handleCopy}>コピー / Copy</button>
            </div>

            <div className="mt-4">
                <textarea
                    rows={3}
                    readOnly
                    value={outputMarkdown}
                    placeholder="Markdown形式で表示 / Markdown output"
                />
            </div>
        </div>
    );
}
