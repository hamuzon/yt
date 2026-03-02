import './globals.css'
import Footer from '@/components/Footer'



const redirectScript = `(() => {
  const params = new URLSearchParams(window.location.search);
  const v = params.get('v');
  if (!v) return;

  const { origin, pathname } = window.location;
  const normalizedPath = pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname;
  if (normalizedPath === '/go' || normalizedPath === '/yt/go') return;

  const goPath = window.location.hostname.endsWith('github.io') ? '/yt/go' : '/go';
  const target = new URL(origin + goPath);
  target.searchParams.set('v', v);

  const typeParam = params.get('type');
  const tParam = params.get('t');
  if (typeParam) target.searchParams.set('type', typeParam);
  if (tParam) target.searchParams.set('t', tParam);

  window.location.replace(target.toString());
})();`;

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="ja">
            <head>
                <script dangerouslySetInnerHTML={{ __html: redirectScript }} />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&family=Inter:wght@400;600&family=Potta+One&display=swap" rel="stylesheet" />
            </head>
            <body>
                <main>{children}</main>
                <Footer />
            </body>
        </html>
    )
}
