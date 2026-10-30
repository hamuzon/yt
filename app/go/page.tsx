const redirectScript = `
(() => {
  const url = new URL(window.location.href);
  const v = url.searchParams.get('v') || url.searchParams.get('V') || url.searchParams.get('id') || '';
  const typeParam = (url.searchParams.get('type') || url.searchParams.get('TYPE') || '').toLowerCase();
  const t = url.searchParams.get('t') || url.searchParams.get('time') || url.searchParams.get('start') || '';
  const fallbackPath = url.hostname === 'hamuzon.github.io' ? '/yt/' : '/';

  if (!v) {
    window.location.replace(fallbackPath);
    return;
  }

  const ua = navigator.userAgent || '';
  const isMobile = /iPhone|iPad|iPod|Android/i.test(ua);

  let redirectUrl;
  switch (typeParam) {
    case 'm':
      redirectUrl = \`https://music.youtube.com/watch?v=\${encodeURIComponent(v)}\`;
      break;
    case 's':
      redirectUrl = isMobile
        ? \`https://m.youtube.com/shorts/\${encodeURIComponent(v)}\`
        : \`https://www.youtube.com/shorts/\${encodeURIComponent(v)}\`;
      break;
    default:
      redirectUrl = \`https://youtu.be/\${encodeURIComponent(v)}\`;
  }

  if (t) {
    const sep = redirectUrl.includes('?') ? '&' : '?';
    redirectUrl += \`\${sep}t=\${encodeURIComponent(t)}\`;
  }

  window.location.replace(redirectUrl);
})();
`;

export default function GoRedirect() {
    return (
        <script dangerouslySetInnerHTML={{ __html: redirectScript }} />
    );
}
