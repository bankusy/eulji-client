"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { MessageCircle } from "lucide-react";
import Button from "@/components/ui/Button";

export default function ThanksPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const agencyId = params.agencyId as string;
    const leadId = searchParams.get("leadId");
    const userId = searchParams.get("userId"); // 개인별 폼에서 전달

    const [agencyInfo, setAgencyInfo] = useState<{ name: string; kakao_url?: string } | null>(null);
    const [userName, setUserName] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInfo = async () => {
            try {
                // 에이전시 정보
                const agencyResponse = await fetch(`/api/agencies/${agencyId}/info`);
                if (agencyResponse.ok) {
                    const agencyData = await agencyResponse.json();
                    setAgencyInfo(agencyData);
                }

                // 개인별 폼인 경우 담당자 정보도 가져오기
                if (userId) {
                    const userResponse = await fetch(`/api/users/${userId}/public-info`);
                    if (userResponse.ok) {
                        const userData = await userResponse.json();
                        setUserName(userData.name || userData.nickname || "담당자");
                    }
                }
            } catch (error) {
                console.error("Failed to fetch info:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInfo();
    }, [agencyId, userId]);

    const handleKakaoClick = () => {
        if (agencyInfo?.kakao_url) {
            window.open(agencyInfo.kakao_url, "_blank");
        } else {
            alert("카카오톡 상담 링크가 설정되지 않았습니다.");
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 text-center">
                {/* Success Icon */}
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg
                        className="w-8 h-8 text-green-600 dark:text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                </div>

                {/* Message */}
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                    문의가 접수되었습니다!
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                    {userId && userName 
                        ? `${userName}님이` 
                        : agencyInfo?.name || "담당자가"
                    } 빠른 시간 내에
                </p>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                    연락드리겠습니다.
                </p>

                {/* Kakao Button */}
                {!loading && agencyInfo?.kakao_url && (
                    <div className="space-y-4">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            💬 지금 바로 상담하기
                        </p>
                        <Button
                            onClick={handleKakaoClick}
                            className="w-full h-14 text-base font-semibold bg-yellow-400 hover:bg-yellow-500 text-gray-900"
                        >
                            <MessageCircle className="w-5 h-5 mr-2" />
                            카카오톡으로 상담하기
                        </Button>
                    </div>
                )}

                {/* Info */}
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        문의번호: {leadId ? `#${leadId.slice(0, 8)}` : "생성 중"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        문의하신 내용은 안전하게 보호됩니다.
                    </p>
                </div>
            </div>
        </div>
    );
}
