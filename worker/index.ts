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
    return new Response(null, {
        status: 302,
        headers: {
            Location: url,
            'Cache-Control': 'no-store',
        },
    });
}

function extractVideoIdFromPath(pathname: string) {
    const match = pathname.match(/^\/(?:(?:go|yt)\/)?([a-zA-Z0-9_-]{11})$/);
    return match ? match[1] : '';
}

function normalizePath(pathname: string) {
    const path = pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname;
    if (path.startsWith('/yt/')) {
        return path.slice(3);
    }
    return path;
}

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const url = new URL(request.url);
        const normalizedPath = normalizePath(url.pathname);

        if (normalizedPath === '/go') {
            const v = url.searchParams.get('v');
            if (!v) {
                return redirectResponse(`${url.origin}/`);
            }

            const typeParam = url.searchParams.get('type') || '';
            const t = url.searchParams.get('t') || '';
            const ua = request.headers.get('user-agent') || '';
            return redirectResponse(buildRedirectUrl(v, typeParam, t, ua));
        }

        const videoIdFromPath = extractVideoIdFromPath(normalizedPath);
        if (videoIdFromPath) {
            const typeParam = url.searchParams.get('type') || '';
            const t = url.searchParams.get('t') || '';
            const ua = request.headers.get('user-agent') || '';
            return redirectResponse(buildRedirectUrl(videoIdFromPath, typeParam, t, ua));
        }

        if (normalizedPath === '/yt') {
            const target = new URL('/go', url.origin);
            target.search = url.search;
            return redirectResponse(target.toString());
        }

        return env.ASSETS.fetch(request);
    },
};
