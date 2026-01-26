"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { FormSelect, SelectOption } from "@/components/ui/FormSelect";

export default function PersonalContactPage() {
    const params = useParams();
    const router = useRouter();
    const agencyId = params.agencyId as string;
    const userId = params.userId as string;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [userName, setUserName] = useState("");
    const [loading, setLoading] = useState(true);

    // 폼 상태
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [preferredRegion, setPreferredRegion] = useState("");
    const [propertyType, setPropertyType] = useState("OFFICETEL");
    const [transactionType, setTransactionType] = useState("WOLSE");
    const [moveInDate, setMoveInDate] = useState("");

    // 담당자 정보 가져오기
    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await fetch(`/api/users/${userId}/public-info`);
                if (response.ok) {
                    const data = await response.json();
                    setUserName(data.name || data.nickname || "담당자");
                }
            } catch (error) {
                console.error("Failed to fetch user info:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserInfo();
    }, [userId]);

    // 전화번호 자동 포맷팅
    const formatPhone = (value: string) => {
        const numbers = value.replace(/\D/g, "");
        if (numbers.length <= 3) return numbers;
        if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
        return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            alert("이름을 입력해주세요.");
            return;
        }

        if (!phone) {
            alert("휴대폰 번호를 입력해주세요.");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch("/api/leads/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    agencyId,
                    userId, // 개인별 폼이므로 userId 전달
                    name,
                    phone,
                    preferred_region: preferredRegion,
                    property_type: propertyType,
                    transaction_type: transactionType,
                    move_in_date: moveInDate,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.error || "문의 등록에 실패했습니다.");
                return;
            }

            // 감사 페이지로 이동 (userId 포함)
            router.push(`/contact/${agencyId}/thanks?leadId=${data.leadId}&userId=${userId}`);
        } catch (error) {
            console.error(error);
            alert("오류가 발생했습니다. 다시 시도해주세요.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
                <div className="text-gray-600 dark:text-gray-400">로딩 중...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">👤</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        매물 문의하기
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                            {userName}
                        </span>
                        에게 문의하시면 빠르게 연락드리겠습니다.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* 이름 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            이름 <span className="text-red-500">*</span>
                        </label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="홍길동"
                            required
                            className="text-base"
                        />
                    </div>

                    {/* 휴대폰 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            휴대폰 번호 <span className="text-red-500">*</span>
                        </label>
                        <Input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(formatPhone(e.target.value))}
                            placeholder="010-1234-5678"
                            required
                            maxLength={13}
                            className="text-base"
                        />
                    </div>

                    {/* 희망 지역 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            희망 지역
                        </label>
                        <Input
                            value={preferredRegion}
                            onChange={(e) => setPreferredRegion(e.target.value)}
                            placeholder="예: 강남구, 홍대입구역"
                            className="text-base"
                        />
                    </div>

                    {/* 매물 형태 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            매물 형태
                        </label>
                        <FormSelect value={propertyType} onChange={setPropertyType}>
                            <SelectOption value="ONEROOM">원룸</SelectOption>
                            <SelectOption value="TWOROOM">투룸</SelectOption>
                            <SelectOption value="THREEROOM">쓰리룸</SelectOption>
                            <SelectOption value="OFFICETEL">오피스텔</SelectOption>
                            <SelectOption value="VILLA">빌라</SelectOption>
                            <SelectOption value="APARTMENT">아파트</SelectOption>
                            <SelectOption value="COMMERCIAL">상가</SelectOption>
                        </FormSelect>
                    </div>

                    {/* 지불 형태 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            거래 유형
                        </label>
                        <FormSelect value={transactionType} onChange={setTransactionType}>
                            <SelectOption value="WOLSE">월세</SelectOption>
                            <SelectOption value="JEONSE">전세</SelectOption>
                            <SelectOption value="SALE">매매</SelectOption>
                        </FormSelect>
                    </div>

                    {/* 입주 가능 시기 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            입주 가능 시기
                        </label>
                        <FormSelect value={moveInDate} onChange={setMoveInDate}>
                            <SelectOption value="">선택하세요</SelectOption>
                            <SelectOption value="IMMEDIATE">즉시 가능</SelectOption>
                            <SelectOption value="WITHIN_1_MONTH">1개월 이내</SelectOption>
                            <SelectOption value="WITHIN_3_MONTHS">3개월 이내</SelectOption>
                            <SelectOption value="FLEXIBLE">상관없음</SelectOption>
                        </FormSelect>
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-12 text-base font-semibold"
                        variant="primary"
                    >
                        {isSubmitting ? "제출 중..." : "문의하기"}
                    </Button>
                </form>

                {/* Footer */}
                <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-6">
                    문의하신 정보는 안전하게 보호됩니다.
                </p>
            </div>
        </div>
    );
}
