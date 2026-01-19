import React from 'react'
import { notFound } from 'next/navigation'

export default async function Page({ params }: { params: Promise<{ [key: string]: string }> }) {
    const resolvedParams = await params;
    const slug = resolvedParams['@'];

    if (!slug) {
        notFound();
    }

    const isAt = slug.startsWith('%40') || slug.startsWith('@');

    if (!isAt) {
        notFound();
    }

    return (
        <div></div>
    )
}
