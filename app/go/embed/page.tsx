'use client';

import { useEffect, useState } from 'react';

const VIDEO_ID_RE = /^[A-Za-z0-9_-]{11}$/;

function toSeconds(value: string): string {
    if (!value) return '';
    if (/^\d+$/.test(value)) return value;

    const match = value.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
    if (!match || (!match[1] && !match[2] && !match[3])) {
        return '';
    }

    return String(
        Number(match[1] || 0) * 3600 +
        Number(match[2] || 0) * 60 +
        Number(match[3] || 0)
    );
}

export default function EmbedPage() {
    const [src, setSrc] = useState('');
    const [invalid, setInvalid] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const v = params.get('v') || params.get('V') || params.get('id') || '';

        if (!VIDEO_ID_RE.test(v)) {
            setInvalid(true);
            return;
        }

        const query = new URLSearchParams({
            rel: '0',
            playsinline: '1',
            modestbranding: '1',
        });

        const start = toSeconds(
            params.get('t') || params.get('time') || params.get('start') || ''
        );
        if (start) {
            query.set('start', start);
        }

        setSrc(`https://www.youtube.com/embed/${v}?${query.toString()}`);
    }, []);

    if (invalid) {
        return (
            <div className="embed-page">
                <p className="embed-error">動画IDが指定されていません。</p>
            </div>
        );
    }

    return (
        <div className="embed-page">
            {src && (
                <iframe
                    src={src}
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                />
            )}
        </div>
    );
}
