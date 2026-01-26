import React from 'react'
import { notFound } from 'next/navigation'
import ProfileCard from '@/components/web/profile/ProfileCard'

export default async function Page({ params }: { params: Promise<{ username: string }> }) {
    const resolvedParams = await params;
    const { username } = resolvedParams;

    // TODO: Fetch user data from DB based on username
    
    return (
        <ProfileCard 
            username={username}
            avatarUrl="/profile.jpeg"
        />
    )
}
