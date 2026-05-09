'use client';

import { useEffect, useState } from 'react';

const Footer = () => {
    const [copyrightYear, setCopyrightYear] = useState('');
    const [hostname, setHostname] = useState('');
    const [pageTitle, setPageTitle] = useState('');

    useEffect(() => {
        const baseYear = 2025;
        const currentYear = new Date().getFullYear();
        setCopyrightYear(baseYear + (currentYear > baseYear ? `~${currentYear}` : ''));
        setHostname(window.location.hostname);

        const updateFooter = () => {
            const rawTitle = document.title.trim() || '';
            const parts = rawTitle.split('|');
            setPageTitle(parts[parts.length - 1].trim());
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
        <footer>
            &copy; {copyrightYear}{' '}
            {hostname.includes('hamuzon-jp.f5.si') ? (
                <a href="https://hamuzon-jp.f5.si" target="_blank" rel="noopener noreferrer">@hamuzon</a>
            ) : hostname.includes('hamuzon.github.io') ? (
                <a href="https://hamuzon.github.io" target="_blank" rel="noopener noreferrer">@hamuzon</a>
            ) : hostname.includes('hamusata.f5.si') ? (
                <a href="https://hamusata.f5.si" target="_blank" rel="noopener noreferrer">@hamusata</a>
            ) : (
                pageTitle
            )}
        </footer>
    );
};

export default Footer;
