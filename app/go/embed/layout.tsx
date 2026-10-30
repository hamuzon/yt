import React from 'react';

export const metadata = {
    title: 'YouTube Player',
    robots: {
        index: false,
        follow: false,
    },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
