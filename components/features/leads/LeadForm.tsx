import React, { useState, ChangeEvent } from "react";

import FormSection from "@/components/ui/FormSection";
import FormInput from "@/components/ui/FormInput";
import { FormSelect, SelectOption } from "@/components/ui/FormSelect";
import FormTextArea from "@/components/ui/FormTextArea";
import {Button} from "@/components/ui/v1/Button";
import { useLeadMutations } from "@/hooks/queries/leads";
import { getAgencyMembers } from "@/app/dashboard/agencies/[agencyId]/actions"; // Import added
import { Lead, LeadStage, LeadSource } from "@/types/lead";
import { PropertyType, TransactionType } from "@/types/listing";
import { X } from "lucide-react"; // Import X icon
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useUserStore } from "@/hooks/useUserStore";


interface LeadFormProps {
    initialData?: Lead | null;
    agencyId: string;
    onClose: () => void;
}

export default function LeadForm({
    initialData,
    agencyId,
    onClose,
}: LeadFormProps) {
    const { createLead, updateLead } = useLeadMutations(agencyId);
    const isSubmitting = createLead.isPending || updateLead.isPending;
    const { user } = useUserStore();

    const [members, setMembers] = useState<{ id: string; name: string }[]>([]);
    const [userRole, setUserRole] = useState<string | null>(null);

    React.useEffect(() => {
        getAgencyMembers(agencyId).then(setMembers).catch(console.error);

        const fetchRole = async () => {
            if (!agencyId || !user?.id) return;
            const supabase = createSupabaseBrowserClient();
            const { data } = await supabase
                .from("agency_users")
                .select("role")
                .eq("agency_id", agencyId)
                .eq("user_id", user.id)
                .single();
            setUserRole(data?.role || null);
        };
        fetchRole();
    }, [agencyId, user?.id]);

    const isOwner = userRole === "OWNER";

    // Helper for initial phone formatting
    const formatPhone = (val: string) => {
        const numbers = val.replace(/\D/g, "");
        if (numbers.length <= 3) return numbers;
        if (numbers.length <= 7)
            return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
        return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    };

    // Basic Info
    const [name, setName] = useState(initialData?.name || "");
    const [phone, setPhone] = useState(
        initialData?.phone ? formatPhone(initialData.phone) : "",
    );
    const [email, setEmail] = useState(initialData?.email || "");

    // Status & Type
    const [stage, setStage] = useState<LeadStage>(initialData?.stage || "NEW");
    const [property_type, setPropertyType] = useState(
        initialData?.property_type || "OFFICETEL",
    );
    const [transaction_type, setTransactionType] = useState<TransactionType>(
        initialData?.transaction_type || "WOLSE",
    );
    const [source, setSource] = useState<LeadSource>((initialData?.source as LeadSource) || "NAVER");
    const [preferred_region, setPreferredRegion] = useState(initialData?.preferred_region || "");
    const [assigneeId, setAssigneeId] = useState(initialData?.assigned_user_id || "");

    // Budget
    // Budget State - Flattened
    const [budget, setBudget] = useState({
        deposit_min: initialData?.deposit_min || 0,
        deposit_max: initialData?.deposit_max || 0,
        price_min: initialData?.price_min || 0,
        price_max: initialData?.price_max || 0,
    });

    // Details
    const [message, setMessage] = useState(initialData?.message || "");
    const [memo, setMemo] = useState(initialData?.memo || "");

    const handleSubmit = async () => {
        // Validation

        // 1. Name Check
        if (!name.trim()) {
            alert("이름을 입력해주세요.");
            return;
        }

        // 2. Phone Check
        // Allow empty, but if provided, must match pattern. 
        // We accept 010-1234-5678 or 02-123-4567 format.
        const phoneRegex = /^\d{2,3}-\d{3,4}-\d{4}$/;
        if (phone && !phoneRegex.test(phone)) {
            alert("휴대폰 번호 형식이 올바르지 않습니다. (예: 010-1234-5678)");
            return;
        }

        // 3. Email Check
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && !emailRegex.test(email)) {
            alert("유효한 이메일 주소를 입력해주세요.");
            return;
        }

        // 4. Budget Check
        const { deposit_min, deposit_max, price_min, price_max } = budget;

        if (deposit_min < 0 || deposit_max < 0 || price_min < 0 || price_max < 0) {
            alert("예산 금액은 0원 이상이어야 합니다.");
            return;
        }

        // Max must be greater than Min only if Max is set (non-zero)
        if (deposit_max > 0 && deposit_min > deposit_max) {
            alert("보증금 최소 금액이 최대 금액보다 클 수 없습니다.");
            return;
        }

        if (price_max > 0 && price_min > price_max) {
            alert("월세/매매가 최소 금액이 최대 금액보다 클 수 없습니다.");
            return;
        }

        try {
            const leadData: any = {
                name,
                phone: phone.replace(/-/g, ""), // Strip dashes
                email,
                stage,
                property_type,
                transaction_type,
                source,
                preferred_region, // Add to payload
                assigned_user_id: assigneeId,
                deposit_min: budget.deposit_min,
                deposit_max: budget.deposit_max,
                price_min: budget.price_min,
                price_max: budget.price_max,
                message,
                memo,
            };

            if (initialData?.id) {
                // Update
                await updateLead.mutateAsync({
                    ...initialData,
                    ...leadData,
                    id: initialData.id,
                });
            } else {
                // Create
                await createLead.mutateAsync(leadData);
            }
            onClose();
        } catch (error) {
            console.error("Failed to save lead:", error);
            alert("저장에 실패했습니다.");
        }
    };

    return (
        <form
            className="flex flex-col h-full bg-(--background)"
            onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
            }}
        >
            {/* Header */}
            <div className="flex-none p-6 border-b border-(--border)">
                <h2 className="text-xl font-semibold">
                    {initialData ? "고객 정보 수정" : "신규 고객 등록"}
                </h2>
                <p className="text-sm text-(--foreground-muted) mt-1">
                    고객의 상세 정보를 입력해 주세요. 모든 항목은 필수 입력입니다.
                </p>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <FormSection title="기본 정보">
                    <FormInput
                        label="이름"
                        value={name}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setName(e.target.value)
                        }
                        placeholder="홍길동"
                    />
                    <FormInput
                        label="휴대폰"
                        type="tel"
                        value={phone}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setPhone(formatPhone(e.target.value))
                        }
                        placeholder="010-1234-5678"
                    />
                    <FormInput
                        label="이메일"
                        type="email"
                        value={email}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setEmail(e.target.value)
                        }
                        placeholder="example@email.com"
                    />
                </FormSection>
                <FormSection title="상태 및 유형">
                    <FormSelect label="상태" value={stage} onChange={(val) => setStage(val as LeadStage)}>
                        <SelectOption value="NEW">신규</SelectOption>
                        <SelectOption value="IN_PROGRESS">진행 중</SelectOption>
                        <SelectOption value="RESERVED">예약</SelectOption>
                        <SelectOption value="CONTRACTED">계약 완료</SelectOption>
                        <SelectOption value="CANCELED">계약 취소</SelectOption>
                        <SelectOption value="FAILED">계약 실패</SelectOption>
                    </FormSelect>
                    <FormSelect
                        label="매물 유형"
                        value={property_type}
                        onChange={setPropertyType}
                    >
                        <SelectOption value="OFFICETEL">오피스텔</SelectOption>
                        <SelectOption value="ONEROOM">원룸</SelectOption>
                        <SelectOption value="TWOROOM">투룸</SelectOption>
                        <SelectOption value="THREEROOM">쓰리룸</SelectOption>
                        <SelectOption value="APARTMENT">아파트</SelectOption>
                        <SelectOption value="FACTORY">공장</SelectOption>
                        <SelectOption value="COMMERCIAL">상가</SelectOption>
                        <SelectOption value="LAND">토지</SelectOption>
                    </FormSelect>
                    <FormSelect
                        label="거래 유형"
                        value={transaction_type}
                        onChange={(val) => setTransactionType(val as TransactionType)}
                    >
                        <SelectOption value="WOLSE">월세</SelectOption>
                        <SelectOption value="JEONSE">전세</SelectOption>
                        <SelectOption value="SALE">매매</SelectOption>
                    </FormSelect>
                    <FormInput
                        label="희망 지역"
                        value={preferred_region}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setPreferredRegion(e.target.value)
                        }
                        placeholder="예: 강남구, 역삼동 (동 이름 추천)"
                    />
                    <FormSelect
                        label="유입 경로"
                        value={source}
                        onChange={(val) => setSource(val as LeadSource)}
                    >
                        <SelectOption value="NAVER">네이버부동산</SelectOption>
                        <SelectOption value="ZIGBANG">직방</SelectOption>
                        <SelectOption value="PETERPAN">피터팬</SelectOption>
                        <SelectOption value="DABANG">다방</SelectOption>
                        <SelectOption value="BLOG">블로그</SelectOption>
                        <SelectOption value="INSTAGRAM">인스타그램</SelectOption>
                        <SelectOption value="WEB_FORM">문의 폼</SelectOption>
                        <SelectOption value="YOUTUBE">유튜브</SelectOption>
                        <SelectOption value="KAKAO">카카오</SelectOption>
                        <SelectOption value="WALKIN">워크인</SelectOption>
                        <SelectOption value="CAFE">카페</SelectOption>
                        <SelectOption value="REFERRAL">지인소개</SelectOption>
                        <SelectOption value="ETC">기타</SelectOption>
                    </FormSelect>
                    <FormSelect
                        label="담당자"
                        value={assigneeId}
                        onChange={setAssigneeId}
                        disabled={!isOwner}
                    >
                        <SelectOption value="">담당자 선택</SelectOption>
                        {members.map((member) => (
                            <SelectOption key={member.id} value={member.id}>
                                {member.name}
                            </SelectOption>
                        ))}
                    </FormSelect>
                </FormSection>

                <FormSection title="예산">
                    <div className="flex flex-col md:flex-row gap-4">
                        <FormInput
                            label="보증금 (최소)"
                            type="number"
                            value={budget.deposit_min.toString()}
                            onChange={(e) => {
                                const val = Number(e.target.value);
                                if (val >= 0 && val <= 1000000) {
                                    setBudget((prev) => ({
                                        ...prev,
                                        deposit_min: val,
                                    }));
                                }
                            }}
                            placeholder="0"
                            unit="만원"
                            min="0"
                            max="1000000"
                        />
                        <FormInput
                            label="보증금 (최대)"
                            type="number"
                            value={budget.deposit_max.toString()}
                            onChange={(e) => {
                                const val = Number(e.target.value);
                                if (val >= 0 && val <= 1000000) {
                                    setBudget((prev) => ({
                                        ...prev,
                                        deposit_max: val,
                                    }));
                                }
                            }}
                            placeholder="0"
                            unit="만원"
                            min="0"
                            max="1000000"
                        />
                    </div>
                    <div className="flex flex-col md:flex-row gap-4">
                        <FormInput
                            label="월세/매매가 (최소)"
                            type="number"
                            value={budget.price_min.toString()}
                            onChange={(e) => {
                                const val = Number(e.target.value);
                                if (val >= 0 && val <= 5000000) {
                                    setBudget((prev) => ({
                                        ...prev,
                                        price_min: val,
                                    }));
                                }
                            }}
                            placeholder="0"
                            unit="만원"
                            min="0"
                            max="5000000"
                        />
                        <FormInput
                            label="월세/매매가 (최대)"
                            type="number"
                            value={budget.price_max.toString()}
                            onChange={(e) => {
                                const val = Number(e.target.value);
                                if (val >= 0 && val <= 5000000) {
                                    setBudget((prev) => ({
                                        ...prev,
                                        price_max: val,
                                    }));
                                }
                            }}
                            placeholder="0"
                            unit="만원"
                            min="0"
                            max="5000000"
                        />
                    </div>
                </FormSection>

                <FormSection title="추가 정보">
                    <FormTextArea
                        label="문의 내용"
                        value={message}
                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                            setMessage(e.target.value)
                        }
                        className="h-24 resize-none"
                        // placeholder="고객 문의 내용을 입력하세요"
                    />
                    <FormTextArea
                        label="메모"
                        value={memo}
                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                            setMemo(e.target.value)
                        }
                        className="h-24 resize-none"
                        // placeholder="관리자용 메모"
                    />
                </FormSection>
            </div>

            {/* Footer */}
            <div className="flex-none p-4 border-t border-(--border) flex justify-end gap-2">
                <Button
                    variant="ghost"
                    onClick={onClose}
                    className="text-(--foreground-muted) hover:text-(--foreground)"
                >
                    취소
                </Button>
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    variant="default"
                >
                    {isSubmitting ? "저장 중" : "저장"}
                </Button>
            </div>
        </form>
    );
}
