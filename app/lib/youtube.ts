export interface ParsedYouTube {
    videoId: string;
    type: 'm' | 's' | '';
    time: string;
}

const YOUTUBE_DOMAIN_KEYWORDS = [
    'youtube.com',
    'm.youtube.com',
    'music.youtube.com',
    'gaming.youtube.com',
    'youtube.co.jp',
    'youtube.jp',
] as const;

const MUSIC_YOUTUBE_DOMAIN_KEYWORD = 'music.youtube.com';

function matchesDomainKeyword(hostname: string, keyword: string): boolean {
    const h = hostname.toLowerCase();
    return h === keyword || h.endsWith(`.${keyword}`);
}

export function isYouTubeHost(hostname: string): boolean {
    const h = hostname.toLowerCase();
    if (YOUTUBE_DOMAIN_KEYWORDS.some((keyword) => matchesDomainKeyword(h, keyword))) {
        return true;
    }
    return (
        h === 'youtu.be' ||
        h.endsWith('.youtu.be') ||
        /(^|\.)youtube\.[a-z]{2,}(\.[a-z]{2,})?$/i.test(h)
    );
}

export function isMusicYouTubeHost(hostname: string): boolean {
    return matchesDomainKeyword(hostname, MUSIC_YOUTUBE_DOMAIN_KEYWORD);
}

export function parseYouTubeInput(input: string): ParsedYouTube | null {
    if (!input) return null;
    const raw = input.trim();
    if (!raw) return null;

    let v = '';
    let type: 'm' | 's' | '' = '';
    let t = '';

    try {
        // 1. サムネイル画像URL (img.youtube.com, i.ytimg.com, i1~i4.ytimg.com など)
        const thumbMatch = raw.match(/(?:img\.youtube\.com|i\d?\.ytimg\.com)\/vi\/([a-zA-Z0-9_-]{11})/);
        if (thumbMatch && thumbMatch[1]) {
            return {
                videoId: thumbMatch[1],
                type: '',
                time: '',
            };
        }

        // 2. HTTP / HTTPS URL
        if (raw.startsWith('http://') || raw.startsWith('https://')) {
            const u = new URL(raw);
            const h = u.hostname.toLowerCase();
            const path = u.pathname;

            const isYT = isYouTubeHost(h);
            const isMusic = isMusicYouTubeHost(h);

            if (isYT && h !== 'youtu.be' && !h.endsWith('.youtu.be')) {
                if (path.startsWith('/watch')) {
                    v = u.searchParams.get('v') || '';
                    if (isMusic) type = 'm';
                } else if (path.startsWith('/shorts/')) {
                    const segment = path.split('/shorts/')[1] || '';
                    v = segment.split(/[?#/]/)[0] || '';
                    type = 's';
                } else if (path.startsWith('/embed/')) {
                    const segment = path.split('/embed/')[1] || '';
                    v = segment.split(/[?#/]/)[0] || '';
                } else if (path.startsWith('/live/')) {
                    const segment = path.split('/live/')[1] || '';
                    v = segment.split(/[?#/]/)[0] || '';
                } else if (path.startsWith('/v/')) {
                    const segment = path.split('/v/')[1] || '';
                    v = segment.split(/[?#/]/)[0] || '';
                }

                t = u.searchParams.get('t') || u.searchParams.get('time') || u.searchParams.get('start') || '';
            } else if (h === 'youtu.be' || h.endsWith('.youtu.be')) {
                const pathParts = path.replace(/^\//, '').split(/[?#/]/);
                v = pathParts[0] || '';
                t = u.searchParams.get('t') || u.searchParams.get('time') || u.searchParams.get('start') || '';
            } else {
                v = u.searchParams.get('v') || u.searchParams.get('V') || u.searchParams.get('id') || '';
                const rawType = (u.searchParams.get('type') || u.searchParams.get('TYPE') || '').toLowerCase();
                if (rawType === 'm' || rawType === 's') {
                    type = rawType;
                }
                t = u.searchParams.get('t') || u.searchParams.get('time') || u.searchParams.get('start') || '';
            }
        } else if (raw.includes('?')) {
            // 3. ID?t=10&type=s 形式
            const [idPart, queryPart] = raw.split('?', 2);
            v = idPart || '';
            const p = new URLSearchParams(queryPart);
            const rawType = (p.get('type') || p.get('TYPE') || '').toLowerCase();
            if (rawType === 'm' || rawType === 's') {
                type = rawType;
            }
            t = p.get('t') || p.get('time') || p.get('start') || '';
        } else {
            // 4. 単一ID
            v = raw;
        }

        v = v.trim();
        if (v.includes('/')) {
            v = v.split('/')[0];
        }

        if (!v) return null;

        return {
            videoId: v,
            type,
            time: t,
        };
    } catch {
        return null;
    }
}

