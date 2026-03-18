interface Env {
    ASSETS: { fetch(request: Request): Promise<Response> };
}

function isBot(ua: string): boolean {
    return /Twitterbot|Discordbot|Slackbot|facebookexternalhit|LinkedInBot|TelegramBot|WhatsApp|Googlebot|bingbot|Applebot|curl|wget/i.test(ua);
}

async function buildOgHtml(v: string, requestUrl: string): Promise<string> {
    const pageUrl = new URL('/go', requestUrl);
    pageUrl.searchParams.set('v', v);

    let title = 'YouTube Video';
    let description = '';
    let thumbnail = `https://i.ytimg.com/vi/${v}/maxresdefault.jpg`;

    try {
        const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${encodeURIComponent(v)}&format=json`;
        const res = await fetch(oembedUrl);
        if (res.ok) {
            const data = await res.json() as { title?: string; author_name?: string; thumbnail_url?: string };
            title = data.title || title;
            description = data.author_name ? `by ${data.author_name}` : '';
            thumbnail = data.thumbnail_url || thumbnail;
        }
    } catch {
        // fallback to defaults
    }

    const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${esc(title)}</title>
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${esc(thumbnail)}">
<meta property="og:url" content="${esc(pageUrl.toString())}">
<meta property="og:type" content="video.other">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${esc(thumbnail)}">
</head>
<body></body>
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
    return Response.redirect(url, 302);
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
    const v = url.searchParams.get('v') || '';
    const typeParam = url.searchParams.get('type') || '';
    const t = url.searchParams.get('t') || '';

    if (!v) return notFoundResponse(request, env);

    const ua = request.headers.get('user-agent') || '';

    // Bots get an OGP HTML page so Twitter/Discord/etc. can render cards
    if (isBot(ua)) {
        const html = await buildOgHtml(v, request.url);
        return new Response(html, {
            status: 200,
            headers: { 'Content-Type': 'text/html;charset=UTF-8' },
        });
    }

    // Everyone else gets redirected directly
    const isMobile = /iPhone|iPad|iPod|Android/i.test(ua);

    let redirectUrl: string;
    switch (typeParam) {
        case 'm':
            redirectUrl = `https://music.youtube.com/watch?v=${v}`;
            break;
        case 's':
            redirectUrl = isMobile
                ? `https://m.youtube.com/shorts/${v}`
                : `https://www.youtube.com/shorts/${v}`;
            break;
        default:
            redirectUrl = `https://youtu.be/${v}`;
    }

    if (t) {
        const sep = redirectUrl.includes('?') ? '&' : '?';
        redirectUrl += `${sep}t=${encodeURIComponent(t)}`;
    }

    return Response.redirect(redirectUrl, 302);
}

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        try {
            const url = new URL(request.url);
            const routedPath = localPath(url.pathname);
            const pathVideoId = extractVideoIdFromPath(routedPath);
            const v = url.searchParams.get('v') || pathVideoId;

            if ((routedPath === '/' || !!pathVideoId) && v) {
                const typeParam = url.searchParams.get('type') || '';
                const t = url.searchParams.get('t') || '';
                const ua = request.headers.get('user-agent') || '';
                return redirectResponse(buildRedirectUrl(v, typeParam, t, ua));
            }

            if (routedPath === '/go') {
                return handleGoRequest(request, env);
            }


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
