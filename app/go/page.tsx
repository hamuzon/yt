import type { Metadata } from 'next';

// OG/Twitter tags are intentionally suppressed here.
// On Cloudflare, the Worker intercepts bot requests and returns YouTube OGP HTML directly.
export const metadata: Metadata = {
  openGraph: null,
  twitter: null,
};

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
