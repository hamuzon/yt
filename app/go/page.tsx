import type { Metadata } from 'next';

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  // Static export (Cloudflare / GitHub Pages):
  //   Return early without touching searchParams.
  //   Cloudflare Worker handles bot OGP directly.
  if (!process.env.VERCEL) {
    return { openGraph: null, twitter: null };
  }

  // Vercel (SSR): dynamically fetch YouTube oEmbed for the requested video.
  const params = await searchParams;
  const v = typeof params.v === 'string' ? params.v : '';

  if (!v) {
    return { openGraph: null, twitter: null };
  }

  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${encodeURIComponent(v)}&format=json`
    );
    if (!res.ok) throw new Error('oEmbed failed');
    const data = await res.json() as { title?: string; author_name?: string; thumbnail_url?: string };

    const title = data.title || 'YouTube Video';
    const description = data.author_name ? `by ${data.author_name}` : '';
    const thumbnail = data.thumbnail_url || `https://i.ytimg.com/vi/${v}/maxresdefault.jpg`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: [thumbnail],
        type: 'video.other',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [thumbnail],
      },
    };
  } catch {
    return {
      openGraph: {
        images: [`https://i.ytimg.com/vi/${v}/maxresdefault.jpg`],
        type: 'video.other',
      },
      twitter: {
        card: 'summary_large_image',
        images: [`https://i.ytimg.com/vi/${v}/maxresdefault.jpg`],
      },
    };
  }
}

const redirectScript = `
(() => {
  const params = new URLSearchParams(window.location.search);
  const v = params.get('v') || '';
  const typeParam = params.get('type') || '';
  const t = params.get('t') || '';

  if (!v) {
    window.location.replace('/');
    return;
  }

  const ua = navigator.userAgent || '';
  const isMobile = /iPhone|iPad|iPod|Android/i.test(ua);

  let redirectUrl;
  switch (typeParam) {
    case 'm':
      redirectUrl = 'https://music.youtube.com/watch?v=' + encodeURIComponent(v);
      break;
    case 's':
      redirectUrl = isMobile
        ? 'https://m.youtube.com/shorts/' + encodeURIComponent(v)
        : 'https://www.youtube.com/shorts/' + encodeURIComponent(v);
      break;
    default:
      redirectUrl = 'https://youtu.be/' + encodeURIComponent(v);
  }

  if (t) {
    const sep = redirectUrl.includes('?') ? '&' : '?';
    redirectUrl += sep + 't=' + encodeURIComponent(t);
  }

  window.location.replace(redirectUrl);
})();
`;

export default function GoRedirect() {
    return (
        <script dangerouslySetInnerHTML={{ __html: redirectScript }} />
    );
}
