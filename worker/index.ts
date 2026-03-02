interface Env {
    ASSETS: { fetch(request: Request): Promise<Response> };
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
    const path = pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname;
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
    const notFoundUrl = new URL('/404.html', request.url);
    const fallback = await env.ASSETS.fetch(new Request(notFoundUrl.toString(), request));

    if (fallback.ok) {
        return new Response(fallback.body, {
            status: 404,
            headers: fallback.headers,
        });
    }

    return new Response('Not Found', { status: 404 });
}

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        try {
            const url = new URL(request.url);
            const normalizedPath = normalizePath(url.pathname);
            const pathVideoId = extractVideoIdFromPath(normalizedPath);
            const v = url.searchParams.get('v') || pathVideoId;

            if ((normalizedPath === '/' || normalizedPath === '/yt' || !!pathVideoId) && v) {
                const typeParam = url.searchParams.get('type') || '';
                const t = url.searchParams.get('t') || '';
                const ua = request.headers.get('user-agent') || '';
                return redirectResponse(buildRedirectUrl(v, typeParam, t, ua));
            }

            if (normalizedPath === '/go') {
                if (!v) {
                    return new Response('YouTube ID required', { status: 400 });
                }
                const typeParam = url.searchParams.get('type') || '';
                const t = url.searchParams.get('t') || '';
                const ua = request.headers.get('user-agent') || '';
                return redirectResponse(buildRedirectUrl(v, typeParam, t, ua));
            }

            if (normalizedPath === '/yt') {
                const target = new URL('/yt/', url.origin);
                target.search = url.search;
                return redirectResponse(target.toString());
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
