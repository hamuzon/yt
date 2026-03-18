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

        // Handle .html extensions
        if (lowerPath.endsWith('.html')) {
            newPath = path.replace(/\.html$/i, '');
        } else {
            newPath = path;
        }

        // Exact normalization for known routes (case-insensitive)
        const knownRoutes = ['/thumbnail', '/text', '/yt'];
        const normalizedPath = newPath.toLowerCase();
        if (knownRoutes.includes(normalizedPath)) {
            newPath = normalizedPath;
        }

        // Always redirect to lowercase if the path has uppercase (case-insensitive routes)
        if (newPath !== newPath.toLowerCase()) {
            newPath = newPath.toLowerCase();
        }

        // Handle /index suffix (e.g., from original index.html -> /)
        if (newPath.endsWith('/index')) {
            newPath = newPath.slice(0, -6);
        }

        if (newPath === '') newPath = '/';

        // Perform redirect if the path changed
        if (newPath !== path) {
            window.location.replace(newPath + window.location.search);
            return;
        }

        // Determine contextual back link
        let defaultBackLink = '/';
        let textBackLink = '/text/';
        let thumbnailBackLink = '/thumbnail/';

        if (window.location.hostname === 'hamuzon.github.io') {
            defaultBackLink = 'https://hamuzon.github.io/yt/';
            textBackLink = 'https://hamuzon.github.io/yt/text/';
            thumbnailBackLink = 'https://hamuzon.github.io/yt/thumbnail/';
        }

        if (lowerPath.includes('/text/')) {
            setBackLink(textBackLink);
            setBackText('ツールに戻る / Back to Text Tool');
        } else if (lowerPath.includes('/thumbnail/')) {
            setBackLink(thumbnailBackLink);
            setBackText('ツールに戻る / Back to Thumbnail Tool');
        } else {
            setBackLink(defaultBackLink);
        }
    }, []);

    return (
        <div className="error-page">
            <div className="error-container">
                <h1>404</h1>
                <p>ページが見つかりませんでした。<br />
                    Page Not Found</p>
                <Link href={backLink} className="back-btn">
                    {backText}
                </Link>
            </div>
        </div>
    );
}
