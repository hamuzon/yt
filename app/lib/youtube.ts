// Allow only valid YouTube registrable domains:
// - youtube.com
// - youtube.<ccTLD> (e.g. youtube.jp)
// - youtube.co.<ccTLD> (e.g. youtube.co.jp)
const YOUTUBE_HOST_PATTERN = /^(?:[a-z0-9-]+\.)*youtube\.(?:com|[a-z]{2}|co\.[a-z]{2})$/i;

const MUSIC_YOUTUBE_HOST_PATTERN = /^music\.youtube\.(?:com|[a-z]{2}|co\.[a-z]{2})$/i;

export function isYouTubeHost(hostname: string): boolean {
    return YOUTUBE_HOST_PATTERN.test(hostname);
}

export function isMusicYouTubeHost(hostname: string): boolean {
    return MUSIC_YOUTUBE_HOST_PATTERN.test(hostname);
}
