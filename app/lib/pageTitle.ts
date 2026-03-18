export function normalizeDisplayPath(pathname: string) {
    if (!pathname || pathname === '/') {
        return '';
    }

    return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
}

export function formatHeading(pathname: string, label: string) {
    const displayPath = normalizeDisplayPath(pathname);
    return displayPath ? `${displayPath} ${label}` : label;
}

export function formatDocumentTitle(pathname: string, label: string) {
    const displayPath = normalizeDisplayPath(pathname);
    return displayPath ? `${displayPath} ${label} | YouTube Link Service` : `${label} | YouTube Link Service`;
}
