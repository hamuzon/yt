'use client';

import { useEffect, useState } from 'react';

const SITE_TITLE = 'YouTube Link Service';

const Footer = () => {
    const [footerHTML, setFooterHTML] = useState('');

    useEffect(() => {
        const baseYear = 2025;
        const currentYear = new Date().getFullYear();
        const hostname = window.location.hostname;
        const copyrightYear = baseYear + (currentYear > baseYear ? `~${currentYear}` : '');

        const updateFooter = () => {
            let content = `&copy; ${copyrightYear} `;

            if (hostname.includes('hamuzon-jp.f5.si')) {
                content += '<a href="https://hamuzon-jp.f5.si" target="_blank" rel="noopener noreferrer">@hamuzon</a>';
            } else if (hostname.includes('hamuzon.github.io')) {
                content += '<a href="https://hamuzon.github.io" target="_blank" rel="noopener noreferrer">@hamuzon</a>';
            } else if (hostname.includes('hamusata.f5.si')) {
                content += '<a href="https://hamusata.f5.si" target="_blank" rel="noopener noreferrer">@hamusata</a>';
            } else {
                const pageTitle = document.title.trim();

                content += pageTitle || SITE_TITLE;
            }

            setFooterHTML(content);
        };

        updateFooter();

        const titleElement = document.querySelector('title');
        const observer = titleElement
            ? new MutationObserver(() => {
                updateFooter();
            })
            : null;

        if (titleElement && observer) {
            observer.observe(titleElement, {
                childList: true,
                subtree: true,
                characterData: true,
            });
        }

        window.addEventListener('pageshow', updateFooter);

        return () => {
            observer?.disconnect();
            window.removeEventListener('pageshow', updateFooter);
        };
    }, []);

    return (
        <footer dangerouslySetInnerHTML={{ __html: footerHTML }} />
    );
};

export default Footer;
