import './globals.css'
import type { Metadata } from 'next'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
    title: 'YouTube Link Service',
    description: 'Generate easy YouTube links and tools',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="ja">
            <head>
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
