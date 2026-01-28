import Link from 'next/link'
import React from 'react'

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-(--background) text-(--foreground)">
            <h2 className="text-4xl font-bold mb-4">404</h2>
            <p className="text-xl mb-8 text-(--foreground-muted)">페이지를 찾을 수 없습니다.</p>
            <Link
                href="/"
                className="px-6 py-3 bg-(--foreground) text-(--background) hover:opacity-90 transition-opacity"
            >
                홈으로 돌아가기
            </Link>
        </div>
    )
}
