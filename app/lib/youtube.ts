const YOUTUBE_DOMAIN_KEYWORDS = [
    'youtube.com',
    'm.youtube.com',
    'music.youtube.com',
    'youtube.co.jp',
    'youtube.jp',
] as const;

const MUSIC_YOUTUBE_DOMAIN_KEYWORD = 'music.youtube.com';

function matchesDomainKeyword(hostname: string, keyword: string): boolean {
    return hostname === keyword || hostname.endsWith(`.${keyword}`);
}

export function isYouTubeHost(hostname: string): boolean {
    return YOUTUBE_DOMAIN_KEYWORDS.some((keyword) => matchesDomainKeyword(hostname, keyword));
}

export function isMusicYouTubeHost(hostname: string): boolean {
    return matchesDomainKeyword(hostname, MUSIC_YOUTUBE_DOMAIN_KEYWORD);
}
