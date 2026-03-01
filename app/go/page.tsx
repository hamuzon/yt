import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

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

export default async function GoPage({
    searchParams,
}: {
    searchParams: Promise<{ v?: string; type?: string; t?: string }>;
}) {
    const { v = '', type = '', t = '' } = await searchParams;

    if (!v) {
        redirect('/');
    }

    const ua = (await headers()).get('user-agent') || '';
    redirect(buildRedirectUrl(v, type, t, ua));
}
