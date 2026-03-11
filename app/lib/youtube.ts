const YOUTUBE_HOST_PATTERN = /^(?:[a-z0-9-]+\.)*youtube\.[a-z.]+$/i;

export function isYouTubeHost(hostname: string): boolean {
    return YOUTUBE_HOST_PATTERN.test(hostname);
}

export function isMusicYouTubeHost(hostname: string): boolean {
    return hostname.startsWith('music.youtube.');
}
