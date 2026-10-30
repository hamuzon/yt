import React from 'react';

export const metadata = {
    title: 'YouTube',
    description: '',
    robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
