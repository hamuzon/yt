'use client';

import { useEffect, useState } from 'react';

const Footer = () => {
    const [footerHTML, setFooterHTML] = useState('');

    useEffect(() => {
        const baseYear = 2025;
        const currentYear = new Date().getFullYear();
        const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
        const pathname = typeof window !== 'undefined' ? window.location.pathname.toLowerCase() : '';

        let copyrightYear = baseYear + (currentYear > baseYear ? "~" + currentYear : "");
        let content = `&copy; ${copyrightYear} `;

        if (hostname.includes("hamuzon-jp.f5.si")) {
            content += `<a href="https://hamuzon-jp.f5.si" target="_blank" rel="noopener noreferrer">@hamuzon</a>`;
        } else if (hostname.includes("hamuzon.github.io")) {
            content += `<a href="https://hamuzon.github.io" target="_blank" rel="noopener noreferrer">@hamuzon</a>`;
        } else if (hostname.includes("hamusata.f5.si")) {
            content += `<a href="https://hamusata.f5.si" target="_blank" rel="noopener noreferrer">@hamusata</a>`;
        } else {
            // Check for 404 state (any path that isn't /, /yt, /thumbnail, /text)
            const validPaths = ['/', '/yt', '/yt/', '/thumbnail', '/thumbnail/', '/text', '/text/'];
            if (validPaths.includes(pathname)) {
                if (pathname.includes('/thumbnail')) {
                    content += `YouTube サムネURL取得`;
                } else if (pathname.includes('/text')) {
                    content += `YouTube Markdown Link`;
                } else {
                    content += `YouTube Link Service`;
                }
            } else {
                // For 404, just the year sequence
                content += '';
            }
        }

        setFooterHTML(content);
    }, []);

    return (
        <footer dangerouslySetInnerHTML={{ __html: footerHTML }} />
    );
};

export default Footer;
