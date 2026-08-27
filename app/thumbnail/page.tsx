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
    const [copyBtnText, setCopyBtnText] = useState('URLコピー');
    const searchParams = useSearchParams();

    const getVideoId = (input: string) => {
        if (!input) return null;
        const parsed = parseYouTubeInput(input);
        return parsed?.videoId || null;
    };

    const loadThumbnail = (id: string, selectedSize: string) => {
        const url = `https://i.ytimg.com/vi/${id}/${selectedSize}.jpg`;
        setOutputUrl(url);
        setPreviewUrl(url);
    };

    useEffect(() => {
        const value = searchParams.get('v') ?? searchParams.get('url') ?? searchParams.get('id');
        if (!value) return;
        setInputUrl(value);
        const id = getVideoId(value);
        if (!id) return;
        loadThumbnail(id, 'hqdefault');
    }, [searchParams]);

    const handleGenerate = () => {
        const id = getVideoId(inputUrl);
        if (!id) {
            setOutputUrl('無効なURLまたはID');
            setPreviewUrl('');
            return;
        }
        loadThumbnail(id, size);
    };

    const handleCopy = async () => {
        if (!outputUrl || outputUrl.startsWith('無効な')) return;

        try {
            await navigator.clipboard.writeText(outputUrl);
            setCopyBtnText('コピー完了!');
            setTimeout(() => {
                setCopyBtnText('URLコピー');
            }, 2000);
        } catch {
            setCopyBtnText('コピー失敗');
            setTimeout(() => {
                setCopyBtnText('URLコピー');
            }, 2000);
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

    const [imageCopyLabel, setImageCopyLabel] = useState('クリックでコピー');

    const handleImageCopy = async () => {
        if (!previewUrl) return;
        try {
            await navigator.clipboard.writeText(previewUrl);
            setImageCopyLabel('コピーしました！');
            setTimeout(() => setImageCopyLabel('クリックでコピー'), 2000);
        } catch {
            setImageCopyLabel('コピー失敗');
            setTimeout(() => setImageCopyLabel('クリックでコピー'), 2000);
        }
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
                <button className="btn btn-secondary" onClick={handleCopy}>{copyBtnText}</button>
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
                <div className="mt-4 flex flex-col items-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        id="preview"
                        className="preview"
                        src={previewUrl}
                        alt="YouTube thumbnail preview"
                        onError={handlePreviewError}
                        onClick={handleImageCopy}
                        style={{ display: 'block', cursor: 'pointer' }}
                        title="クリックでURLをコピー"
                    />
                    <span
                        onClick={handleImageCopy}
                        style={{
                            marginTop: '0.5rem',
                            fontSize: '0.85rem',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            userSelect: 'none',
                        }}
                    >
                        {imageCopyLabel === 'コピーしました！' ? '✅ コピーしました！' : '📋 クリックでコピー'}
                    </span>
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
