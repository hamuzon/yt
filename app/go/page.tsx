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
  const url = new URL(window.location.href);
  const v = url.searchParams.get('v') || '';
  const basePath = url.hostname === 'hamuzon.github.io' ? '/yt/' : '/';

  if (!v) {
    window.location.replace(basePath);
    return;
  }

  window.location.replace(\`\${basePath}?v=\${encodeURIComponent(v)}\`);
})();
`;

export default function GoRedirect() {
    return (
        <script dangerouslySetInnerHTML={{ __html: redirectScript }} />
    );
}
