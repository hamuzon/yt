'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function NotFoundClient() {
    const [backLink, setBackLink] = useState('/');
    const [backText, setBackText] = useState('ホームに戻る / Back to Home');

    useEffect(() => {
        const path = window.location.pathname;
        const lowerPath = path.toLowerCase();

        let newPath = '';

        if (lowerPath.endsWith('.html')) {
            newPath = path.replace(/\.html$/i, '');
        } else {
            newPath = path;
        }

        const knownRoutes = ['/thumbnail', '/text', '/yt', '/go'];
        const normalizedPath = newPath.toLowerCase();
        if (knownRoutes.includes(normalizedPath)) {
            newPath = normalizedPath;
        }

        if (newPath !== newPath.toLowerCase()) {
            newPath = newPath.toLowerCase();
        }

        if (newPath.endsWith('/index')) {
            newPath = newPath.slice(0, -6);
        }

        if (newPath === '') newPath = '/';

        if (newPath !== path) {
            window.location.replace(newPath + window.location.search);
            return;
        }

        let defaultBackLink = '/';
        if (window.location.hostname === 'hamuzon.github.io') {
            defaultBackLink = 'https://hamuzon.github.io/yt/';
        }

        if (lowerPath.startsWith('/text/')) {
            setBackLink('/text');
            setBackText('ツールに戻る / Back to Text Tool');
        } else if (lowerPath.startsWith('/thumbnail/')) {
            setBackLink('/thumbnail');
            setBackText('ツールに戻る / Back to Thumbnail Tool');
        } else {
            setBackLink(defaultBackLink);
        }
    }, []);

    const isExternal = backLink.startsWith('http');

    return (
        <div className="error-page">
            <div className="glass-card">
                <h1>404</h1>
                <p>ページが見つかりません<br /><span>Sorry, Not Found.</span></p>
                {isExternal ? (
                    <div className="flex justify-center mt-4">
                        <a href={backLink} className="btn btn-secondary auto-width">
                            {backText}
                        </a>
                    </div>
                ) : (
                    <div className="flex justify-center mt-4">
                        <Link href={backLink} className="btn btn-secondary auto-width">
                            {backText}
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
