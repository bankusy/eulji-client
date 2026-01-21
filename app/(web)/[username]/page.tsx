import React from 'react'
import { notFound } from 'next/navigation'

export default async function Page({ params }: { params: Promise<{ [key: string]: string }> }) {
    const resolvedParams = await params;
    

    return (
        <div></div>
    )
}
