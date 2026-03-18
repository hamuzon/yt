'use client';

import { useEffect, useState } from 'react';

const SITE_TITLE = 'YouTube Link Service';

const Footer = () => {
    const [footerHTML, setFooterHTML] = useState('');

    useEffect(() => {
        const baseYear = 2025;
        const currentYear = new Date().getFullYear();
        const hostname = window.location.hostname;
        const pathname = window.location.pathname.toLowerCase();

        const copyrightYear = baseYear + (currentYear > baseYear ? `~${currentYear}` : '');
        let content = `&copy; ${copyrightYear} `;

        if (hostname.includes('hamuzon-jp.f5.si')) {
            content += `<a href="https://hamuzon-jp.f5.si" target="_blank" rel="noopener noreferrer">@hamuzon</a>`;
        } else if (hostname.includes('hamuzon.github.io')) {
            content += `<a href="https://hamuzon.github.io" target="_blank" rel="noopener noreferrer">@hamuzon</a>`;
        } else if (hostname.includes('hamusata.f5.si')) {
            content += `<a href="https://hamusata.f5.si" target="_blank" rel="noopener noreferrer">@hamusata</a>`;
        } else {
            const knownPaths = ['/', '/go', '/go/', '/yt', '/yt/', '/thumbnail', '/thumbnail/', '/text', '/text/'];
            const pageTitle = document.title.trim();

            if (pageTitle) {
                content += pageTitle;
            } else if (knownPaths.includes(pathname)) {
                content += SITE_TITLE;
            }
        }

        setFooterHTML(content);
    }, []);

    return (
        <footer dangerouslySetInnerHTML={{ __html: footerHTML }} />
    );
};

export default Footer;
