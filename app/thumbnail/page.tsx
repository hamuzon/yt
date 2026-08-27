'use client';

import { ChangeEvent, useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { parseYouTubeInput } from '../lib/youtube';

function ThumbnailPageContent() {
    const [inputUrl, setInputUrl] = useState('');
    const [size, setSize] = useState('hqdefault');
    const [outputUrl, setOutputUrl] = useState('');
    const [previewUrl, setPreviewUrl] = useState('');
    const [copyLabel, setCopyLabel] = useState('クリックでコピー');
    const searchParams = useSearchParams();

    const getVideoId = (input: string) => {
        if (!input) return null;
        const parsed = parseYouTubeInput(input);
        return parsed?.videoId || null;
    };


    useEffect(() => {
        const value = searchParams.get('v') ?? searchParams.get('url') ?? searchParams.get('id');
        if (!value) return;
        setInputUrl(value);
        const id = getVideoId(value);
        if (!id) return;
        const url = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
        setOutputUrl(url);
        setPreviewUrl(url);
    }, [searchParams]);

    const handleGenerate = () => {
        const id = getVideoId(inputUrl);
        if (!id) {
            setOutputUrl('無効なURLまたはID');
            setPreviewUrl('');
            return;
        }
        const url = `https://i.ytimg.com/vi/${id}/${size}.jpg`;
        setOutputUrl(url);
        setPreviewUrl(url);
    };

    const handleCopy = () => {
        if (outputUrl && outputUrl !== '無効なURLまたはID') {
            navigator.clipboard.writeText(outputUrl).then(() => {
                alert('Copied!');
            });
        }
    };

    const handlePreviewError = () => {
        if (!previewUrl.includes('/maxresdefault.jpg')) return;
        const id = getVideoId(inputUrl);
        if (!id) return;
        const fallback = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
        setOutputUrl(fallback);
        setPreviewUrl(fallback);
    };

    const handleImageCopy = () => {
        if (!previewUrl) return;
        navigator.clipboard.writeText(previewUrl).then(() => {
            setCopyLabel('コピーしました！');
            setTimeout(() => setCopyLabel('クリックでコピー'), 1500);
        });
    };

    return (
        <div className="glass-card">
            <h1>YouTube サムネURL取得</h1>

            <div className="input-group">
                <input
                    type="text"
                    value={inputUrl}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setInputUrl(e.target.value)}
                    placeholder="YouTube URL / ID / サムネURL"
                />
            </div>

            <div className="input-group">
                <select value={size} onChange={(e: ChangeEvent<HTMLSelectElement>) => setSize(e.target.value)} aria-label="サムネイルサイズ">
                    <option value="maxresdefault">maxresdefault（最高画質）</option>
                    <option value="sddefault">sddefault</option>
                    <option value="hqdefault">hqdefault（推奨）</option>
                    <option value="mqdefault">mqdefault</option>
                    <option value="default">default（最小）</option>
                    <option value="1">1.jpg（動画の開始: 120 × 90）</option>
                    <option value="2">2.jpg（動画の中間: 120 × 90）</option>
                    <option value="3">3.jpg（動画の終了: 120 × 90）</option>
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

            {previewUrl && (
                <div className="mt-4" style={{ position: 'relative', display: 'inline-block', width: '100%', maxWidth: 360, margin: '1rem auto 0' }}>
                    <Image
                        id="preview"
                        className="preview"
                        src={previewUrl}
                        alt="サムネイルプレビュー"
                        onError={handlePreviewError}
                        onClick={handleImageCopy}
                        width={360}
                        height={202}
                        style={{ height: 'auto', cursor: 'pointer', display: 'block', width: '100%' }}
                    />
                    <div style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        borderRadius: 12,
                        background: 'rgba(133,76,48,0.55)',
                        color: '#fff', fontWeight: 700, fontSize: '0.95rem',
                        opacity: copyLabel === 'コピーしました！' ? 1 : undefined,
                        pointerEvents: 'none',
                        className: 'preview-overlay',
                    } as React.CSSProperties}>
                        {copyLabel}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function ThumbnailPage() {
    return (
        <Suspense fallback={<div className="glass-card">読み込み中...</div>}>
            <ThumbnailPageContent />
        </Suspense>
    );
}
