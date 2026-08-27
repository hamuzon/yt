'use client';

import { ChangeEvent, useState } from 'react';
import { parseYouTubeInput } from '../lib/youtube';

export default function TextPage() {
    const [linkText, setLinkText] = useState('');
    const [inputUrl, setInputUrl] = useState('');
    const [outputMarkdown, setOutputMarkdown] = useState('');
    const [timeOption, setTimeOption] = useState(true);

    const getYouTubeLink = (input: string, keepTime: boolean) => {
        try {
            const parsed = parseYouTubeInput(input);
            if (!parsed || !parsed.videoId) return null;

            let timeParam = '';
            if (keepTime && parsed.time) {
                timeParam = `?t=${encodeURIComponent(parsed.time)}`;
            }

            return `https://youtu.be/${parsed.videoId}${timeParam}`;
        } catch (e) {
            console.error('Markdown link processing failed:', e);
            return null;
        }
    };


    const handleConvert = () => {
        const text = linkText.trim() || 'リンク';
        const link = getYouTubeLink(inputUrl, timeOption);
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
            <h1>YouTube Markdown Link</h1>
            <p>入力文字と YouTube URL から Markdown 形式のリンクを生成します<br />
                Generate a Markdown link from text and a YouTube URL.</p>

            <div className="input-group">
                <input
                    type="text"
                    value={linkText}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setLinkText(e.target.value)}
                    placeholder="リンク文字列を入力 / Enter link text"
                />
            </div>
            <div className="input-group">
                <input
                    type="text"
                    value={inputUrl}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setInputUrl(e.target.value)}
                    placeholder="YouTube URLを入力 / Enter YouTube URL"
                />
            </div>

            <div className="input-group flex items-center gap-3">
                <input
                    type="checkbox"
                    id="timeOption"
                    className="auto-width"
                    checked={timeOption}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setTimeOption(e.target.checked)}
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
