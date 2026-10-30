interface Env {
    ASSETS: { fetch(request: Request): Promise<Response> };
}

const VIDEO_ID_RE = /^[A-Za-z0-9_-]{11}$/;

// Link-preview crawlers (Discord, X/Twitter, Slack, etc.).
// Normal browsers must not match this, otherwise they would receive the OGP
// page instead of the 302 redirect to YouTube.
const BOT_RE =
    /Twitterbot|Discordbot|Slackbot|Slack-ImgProxy|facebookexternalhit|LinkedInBot|TelegramBot|WhatsApp|Googlebot|bingbot|BingPreview|Applebot|SkypeUriPreview|Pinterest|redditbot|Mastodon|Misskey|Bluesky|Iframely|Embedly|curl|wget/i;

function isBot(ua: string): boolean {
    return BOT_RE.test(ua);
}

function getBasePath(url: URL): string {
    if (url.hostname === 'hamuzon.github.io') {
        return '/yt';
    }
    if (url.pathname === '/yt' || url.pathname.startsWith('/yt/')) {
        return '/yt';
    }
    return '';
}

function buildShareUrl(requestUrl: string, v: string, typeParam: string, t: string): string {
    const url = new URL(requestUrl);
    url.pathname = `${getBasePath(url)}/go/`;
    url.search = '';
    url.hash = '';
    url.searchParams.set('v', v);
    if (typeParam) {
        url.searchParams.set('type', typeParam);
    }
    if (t) {
        url.searchParams.set('t', t);
    }
    return url.toString();
}

function toSeconds(value: string): string {
    if (!value) return '';
    if (/^\d+$/.test(value)) return value;

    const match = value.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
    if (!match || (!match[1] && !match[2] && !match[3])) {
        return '';
    }

    const hours = Number(match[1] || 0);
    const minutes = Number(match[2] || 0);
    const seconds = Number(match[3] || 0);
    return String(hours * 3600 + minutes * 60 + seconds);
}

function buildEmbedUrl(requestUrl: string, v: string, t: string): string {
    const url = new URL(requestUrl);
    url.pathname = `${getBasePath(url)}/go/embed/`;
    url.search = '';
    url.hash = '';
    url.searchParams.set('v', v);

    const start = toSeconds(t);
    if (start) {
        url.searchParams.set('t', start);
    }

    return url.toString();
}

function buildEmbedHtml(v: string, t: string): string {
    const query = new URLSearchParams({
        rel: '0',
        playsinline: '1',
        modestbranding: '1',
    });

    const start = toSeconds(t);
    if (start) {
        query.set('start', start);
    }

    const src = `https://www.youtube.com/embed/${encodeURIComponent(v)}?${query.toString()}`;

    return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>YouTube Player</title>
<style>
html,body{margin:0;height:100%;background:#000;overflow:hidden}
iframe{display:block;width:100%;height:100%;border:0}
</style>
</head>
<body>
<iframe src="${escapeHtml(src)}" title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</body>
</html>`;
}

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

async function fetchOEmbed(v: string): Promise<{
    title?: string;
    author_name?: string;
    thumbnail_url?: string;
} | null> {
    try {
        const res = await fetch(
            `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${encodeURIComponent(v)}&format=json`,
            {
                headers: { accept: 'application/json' },
                signal: AbortSignal.timeout(3000),
            }
        );
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
}

async function buildOgHtml(v: string, requestUrl: string, typeParam: string, t: string): Promise<string> {
    const shareUrl = buildShareUrl(requestUrl, v, typeParam, t);
    const embedUrl = buildEmbedUrl(requestUrl, v, t);

    let title = 'YouTube Video';
    let description = 'YouTube で再生';
    // hqdefault always exists, while maxresdefault is missing for some videos.
    let thumbnail = `https://i.ytimg.com/vi/${v}/hqdefault.jpg`;

    const oembed = await fetchOEmbed(v);
    if (oembed) {
        title = oembed.title || title;
        description = oembed.author_name ? `by ${oembed.author_name}` : description;
        thumbnail = oembed.thumbnail_url || thumbnail;
    }

    const e = escapeHtml;

    return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${e(title)}</title>
<meta name="description" content="${e(description)}">
<link rel="canonical" href="${e(shareUrl)}">
<meta name="theme-color" content="#000000">
<meta property="og:site_name" content="YouTube Link">
<meta property="og:title" content="${e(title)}">
<meta property="og:description" content="${e(description)}">
<meta property="og:url" content="${e(shareUrl)}">
<meta property="og:type" content="video.other">
<meta property="og:image" content="${e(thumbnail)}">
<meta property="og:image:alt" content="${e(title)}">
<meta property="og:video" content="${e(embedUrl)}">
<meta property="og:video:url" content="${e(embedUrl)}">
<meta property="og:video:secure_url" content="${e(embedUrl)}">
<meta property="og:video:type" content="text/html">
<meta property="og:video:width" content="1280">
<meta property="og:video:height" content="720">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${e(title)}">
<meta name="twitter:description" content="${e(description)}">
<meta name="twitter:image" content="${e(thumbnail)}">
<meta name="twitter:image:alt" content="${e(title)}">
</head>
<body>
<p><a href="${e(shareUrl)}">${e(title)}</a></p>
</body>
</html>`;
}

function buildRedirectUrl(v: string, typeParam: string, t: string, ua: string) {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(ua);

    let redirectUrl: string;

    switch (typeParam) {
        case 'm':
            redirectUrl = `https://music.youtube.com/watch?v=${encodeURIComponent(v)}`;
            break;
        case 's':
            redirectUrl = isMobile
                ? `https://m.youtube.com/shorts/${encodeURIComponent(v)}`
                : `https://www.youtube.com/shorts/${encodeURIComponent(v)}`;
            break;
        default:
            redirectUrl = `https://youtu.be/${encodeURIComponent(v)}`;
    }

    if (t) {
        const sep = redirectUrl.includes('?') ? '&' : '?';
        redirectUrl += `${sep}t=${encodeURIComponent(t)}`;
    }

    return redirectUrl;
}

function redirectResponse(url: string) {
    return new Response(null, {
        status: 302,
        headers: {
            Location: url,
            'Cache-Control': 'no-store',
            Vary: 'User-Agent',
        },
    });
}

function htmlResponse(html: string) {
    return new Response(html, {
        status: 200,
        headers: {
            'Content-Type': 'text/html;charset=UTF-8',
            'Cache-Control': 'no-store',
            Vary: 'User-Agent',
        },
    });
}

function handleEmbedRequest(request: Request): Response {
    const url = new URL(request.url);
    const v = url.searchParams.get('v') || url.searchParams.get('V') || url.searchParams.get('id') || '';
    const t = url.searchParams.get('t') || url.searchParams.get('time') || url.searchParams.get('start') || '';

    if (!VIDEO_ID_RE.test(v)) {
        return new Response('Not Found', { status: 404 });
    }

    return new Response(buildEmbedHtml(v, t), {
        status: 200,
        headers: {
            'Content-Type': 'text/html;charset=UTF-8',
            'Cache-Control': 'public, max-age=3600',
        },
    });
}

function normalizePath(pathname: string) {
    return pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname;
}

function localPath(pathname: string) {
    const path = normalizePath(pathname);
    if (path === '/yt') {
        return '/';
    }
    if (path.startsWith('/yt/')) {
        return path.slice(3);
    }
    return path;
}

function extractVideoIdFromPath(path: string) {
    const match = path.match(/^\/([A-Za-z0-9_-]{11})$/);
    return match ? match[1] : '';
}

async function notFoundResponse(request: Request, env: Env) {
    // Next.js static export outputs /_not-found/index.html
    if (!env?.ASSETS) {
        return new Response('Not Found', { status: 404 });
    }

    const candidates = [
        '/_not-found/index.html',
        '/404/index.html',
        '/404.html',
    ];

    for (const path of candidates) {
        try {
            const notFoundUrl = new URL(path, request.url);
            const fallback = await env.ASSETS.fetch(new Request(notFoundUrl.toString()));
            if (fallback.status === 200) {
                const html = await fallback.text();
                return new Response(html, {
                    status: 404,
                    headers: { 'Content-Type': 'text/html;charset=UTF-8' },
                });
            }
        } catch (e) {
            console.error('ASSETS fallback fetch failed for', path, e);
        }
    }

    return new Response('Not Found', { status: 404 });
}

async function handleGoRequest(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const v = url.searchParams.get('v') || url.searchParams.get('V') || url.searchParams.get('id') || '';
    const typeParam = (url.searchParams.get('type') || url.searchParams.get('TYPE') || '').toLowerCase();
    const t = url.searchParams.get('t') || url.searchParams.get('time') || url.searchParams.get('start') || '';

    if (!v) return notFoundResponse(request, env);

    const ua = request.headers.get('user-agent') || '';

    // 2m.f5.si 方式: ボットも含めて全員リダイレクトする。
    // Discord などはリダイレクト先の YouTube を unfurl して動画埋め込みを生成する。
    return redirectResponse(buildRedirectUrl(v, typeParam, t, ua));
}

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        try {
            const url = new URL(request.url);
            const host = request.headers.get('host') || '';
            const hostPart = host.split(':')[0];

            if (hostPart.endsWith('.')) {
                url.hostname = hostPart.slice(0, -1);
                return Response.redirect(url.toString(), 301);
            }

            const routedPath = localPath(url.pathname);
            const pathVideoId = extractVideoIdFromPath(routedPath);
            const v = url.searchParams.get('v') || pathVideoId;

            if ((routedPath === '/' || !!pathVideoId) && v) {
                const typeParam = url.searchParams.get('type') || '';
                const t = url.searchParams.get('t') || '';
                const ua = request.headers.get('user-agent') || '';
                // ボットもリダイレクト(Discord が YouTube を unfurl して動画埋め込みを生成)
                return redirectResponse(buildRedirectUrl(v, typeParam, t, ua));
            }

            if (routedPath === '/go') {
                return handleGoRequest(request, env);
            }

            if (routedPath === '/go/embed') {
                return handleEmbedRequest(request);
            }

            // Everything else (the Next.js pages and assets) is served from
            // the static export.
            const assetResponse = await env.ASSETS.fetch(request);
            if (assetResponse.status === 404) {
                return notFoundResponse(request, env);
            }

            return assetResponse;
        } catch (error) {
            console.error('Worker request handling failed:', error);
            return notFoundResponse(request, env);
        }
    },
};
