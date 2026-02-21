'use client';

import { useState } from 'react';

export default function ThumbnailPage() {
    const [inputUrl, setInputUrl] = useState('');
    const [size, setSize] = useState('hqdefault');
    const [outputUrl, setOutputUrl] = useState('');

    const getVideoId = (input: string) => {
        if (!input) return null;
        const trimmedInput = input.trim();
        if (/^[a-zA-Z0-9_-]{11}$/.test(trimmedInput)) {
            return trimmedInput;
        }
        const thumb = trimmedInput.match(/(?:i\.ytimg\.com|img\.youtube\.com)\/vi\/([a-zA-Z0-9_-]{11})/);
        if (thumb) return thumb[1];
        try {
            const u = new URL(trimmedInput);
            if (u.hostname === 'youtu.be') {
                const id = u.pathname.split('/')[1];
                if (/^[a-zA-Z0-9_-]{11}$/.test(id)) return id;
            }
            if (u.hostname.includes('youtube.com')) {
                const v = u.searchParams.get('v');
                if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;

                const shorts = u.pathname.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
                if (shorts) return shorts[1];

                const embed = u.pathname.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
                if (embed) return embed[1];

                const live = u.pathname.match(/\/live\/([a-zA-Z0-9_-]{11})/);
                if (live) return live[1];
            }
        } catch (e) {
            console.error('Thumbnail extraction error:', e);
        }
        return null;
    };

    const handleGenerate = () => {
        const id = getVideoId(inputUrl);
        if (!id) {
            setOutputUrl('無効なURLまたはID');
            return;
        }
        const url = `https://i.ytimg.com/vi/${id}/${size}.jpg`;
        setOutputUrl(url);
    };

    const handleCopy = () => {
        if (outputUrl && outputUrl !== '無効なURLまたはID') {
            navigator.clipboard.writeText(outputUrl).then(() => {
                alert('Copied!');
            });
        }
    };

    return (
        <div className="glass-card">
            <h1>YouTube サムネURL取得</h1>

            <div className="input-group">
                <input
                    type="text"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="YouTube URL / ID / サムネURL"
                />
            </div>

            <div className="input-group">
                <select value={size} onChange={(e) => setSize(e.target.value)} aria-label="サムネイルサイズ">
                    <option value="maxresdefault">maxresdefault（最高画質）</option>
                    <option value="sddefault">sddefault</option>
                    <option value="hqdefault">hqdefault（推奨）</option>
                    <option value="mqdefault">mqdefault</option>
                    <option value="default">default（最小）</option>
                </select>
            </div>

            <div className="flex flex-col gap-3">
                <button className="btn btn-primary" onClick={handleGenerate}>生成</button>
                <button className="btn btn-secondary" onClick={handleCopy}>URLコピー</button>
            </div>

            <div className="mt-4">
                <textarea
                    rows={2}
                    readOnly
                    value={outputUrl}
                    placeholder="サムネイルURL"
                />
            </div>
        </div>
    );
}
