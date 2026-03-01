import { redirect } from 'next/navigation';

export default async function YtPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const params = await searchParams;
    const query = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
        if (typeof value === 'string') {
            query.set(key, value);
        }
    }

    const to = query.toString() ? `/go?${query.toString()}` : '/go';
    redirect(to);
}
