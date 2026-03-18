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
    try {
        const notFoundUrl1 = new URL('/404/index.html', request.url);
        const notFoundUrl2 = new URL('/404.html', request.url);
        
        let fallback = await env.ASSETS.fetch(new Request(notFoundUrl1.toString()));
        if (fallback.status !== 200) {
            fallback = await env.ASSETS.fetch(new Request(notFoundUrl2.toString()));
        }

        if (fallback.status === 200 || fallback.status === 404) {
            const html = await fallback.text();
            return new Response(html, {
                status: 404,
                headers: {
                    'Content-Type': 'text/html;charset=UTF-8'
                }
            });
        }
    } catch (e) {
        console.error('ASSETS fallback fetch failed', e);
    }

    return new Response('Not Found', { status: 404 });
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
                if (!v) {
                    return notFoundResponse(request, env);
                }
                const typeParam = url.searchParams.get('type') || '';
                const t = url.searchParams.get('t') || '';
                const ua = request.headers.get('user-agent') || '';
                return redirectResponse(buildRedirectUrl(v, typeParam, t, ua));
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
