import type { Metadata } from 'next';

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

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const v = typeof params.v === 'string' ? params.v : '';

  if (!v) {
    return { title: 'Redirecting...' };
  }

  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${v}&format=json`;
    const res = await fetch(oembedUrl);
    if (!res.ok) throw new Error('Failed to fetch oEmbed');
    const data = await res.json();

    return {
      title: data.title || 'YouTube Video',
      description: data.author_name ? `By ${data.author_name}` : '',
      openGraph: {
        title: data.title || 'YouTube Video',
        description: data.author_name ? `By ${data.author_name}` : '',
        images: [
          data.thumbnail_url || `https://i.ytimg.com/vi/${v}/maxresdefault.jpg`,
        ],
        type: 'video.other',
      },
      twitter: {
        card: 'summary_large_image',
        title: data.title || 'YouTube Video',
        description: data.author_name ? `By ${data.author_name}` : '',
        images: [
          data.thumbnail_url || `https://i.ytimg.com/vi/${v}/maxresdefault.jpg`,
        ],
      },
    };
  } catch (error) {
    return {
      title: 'YouTube Video',
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

export default function GoRedirect() {
    return (
        <script dangerouslySetInnerHTML={{ __html: redirectScript }} />
    );
}
