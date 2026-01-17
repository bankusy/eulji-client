import React, { useState, ChangeEvent } from "react";

import Form from "@/components/ui/Form";
import FormSection from "@/components/ui/FormSection";
import FormInput from "@/components/ui/FormInput";
import { FormSelect, SelectOption } from "@/components/ui/FormSelect";
import FormTextArea from "@/components/ui/FormTextArea";
import Button from "@/components/ui/Button";
import { useLeadMutations } from "@/hooks/queries/leads";
import { Lead, Budget } from "@/types/lead";
import { X } from "lucide-react"; // Import X icon

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
    const [stage, setStage] = useState(initialData?.stage || "NEW");
    const [propertyType, setPropertyType] = useState(
        initialData?.propertyType || "OFFICETEL",
    );
    const [transactionType, setTransactionType] = useState(
        initialData?.transactionType || "WOLSE",
    );
    const [source, setSource] = useState(initialData?.source || "");
    const [assignee, setAssignee] = useState(initialData?.assignee || "");

    // Budget
    const [budget, setBudget] = useState<Budget>(
        initialData?.budget || {
            depositMin: 0,
            depositMax: 0,
            priceMin: 0,
            priceMax: 0,
        },
    );

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
        const { depositMin, depositMax, priceMin, priceMax } = budget;

        if (depositMin < 0 || depositMax < 0 || priceMin < 0 || priceMax < 0) {
            alert("예산 금액은 0원 이상이어야 합니다.");
            return;
        }

        // Max must be greater than Min only if Max is set (non-zero)
        if (depositMax > 0 && depositMin > depositMax) {
            alert("보증금 최소 금액이 최대 금액보다 클 수 없습니다.");
            return;
        }

        if (priceMax > 0 && priceMin > priceMax) {
            alert("월세/매매가 최소 금액이 최대 금액보다 클 수 없습니다.");
            return;
        }

        try {
            const leadData: any = {
                name,
                phone: phone.replace(/-/g, ""), // Strip dashes
                email,
                stage,
                propertyType,
                transactionType,
                source,
                assignee,
                budget,
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
        <Form
            onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
            }}
        >
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
                <FormSelect label="상태" value={stage} onChange={setStage}>
                    <SelectOption value="NEW">신규</SelectOption>
                    <SelectOption value="PENDING">대기</SelectOption>
                    <SelectOption value="TRYING">연락 시도</SelectOption>
                    <SelectOption value="MEETING SOON">상담 예정</SelectOption>
                    <SelectOption value="CONSULTING">상담 중</SelectOption>
                    <SelectOption value="PROVISIONAL CONTRACT">
                        가계약
                    </SelectOption>
                    <SelectOption value="SUCCESS">계약 완료</SelectOption>
                    <SelectOption value="TERMINATING">리드 종료</SelectOption>
                </FormSelect>
                <FormSelect
                    label="매물 유형"
                    value={propertyType}
                    onChange={setPropertyType}
                >
                    <SelectOption value="OFFICETEL">오피스텔</SelectOption>
                    <SelectOption value="ONEROOM">원룸</SelectOption>
                    <SelectOption value="TWOROOM">투룸</SelectOption>
                    <SelectOption value="THREEROOM">쓰리룸</SelectOption>
                    <SelectOption value="APART">아파트</SelectOption>
                    <SelectOption value="FACTORY">공장</SelectOption>
                    <SelectOption value="MALL">상가</SelectOption>
                    <SelectOption value="LAND">토지</SelectOption>
                </FormSelect>
                <FormSelect
                    label="거래 유형"
                    value={transactionType}
                    onChange={setTransactionType}
                >
                    <SelectOption value="WOLSE">월세</SelectOption>
                    <SelectOption value="JEONSE">전세</SelectOption>
                    <SelectOption value="SALE">매매</SelectOption>
                </FormSelect>
                <FormInput
                    label="유입 경로"
                    value={source}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setSource(e.target.value)
                    }
                    placeholder="직방, 다방, 블로그 등"
                />
                <FormInput
                    label="담당자"
                    value={assignee}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setAssignee(e.target.value)
                    }
                    placeholder="담당자 이름"
                />
            </FormSection>

            <FormSection title="예산">
                <div className="flex gap-4">
                    <FormInput
                        label="보증금 (최소)"
                        type="number"
                        value={budget?.depositMin?.toString()}
                        onChange={(e) =>
                            setBudget({
                                ...budget,
                                depositMin: Number(e.target.value),
                            })
                        }
                        placeholder="0"
                        unit="만원"
                    />
                    <FormInput
                        label="보증금 (최대)"
                        type="number"
                        value={budget?.depositMax?.toString()}
                        onChange={(e) =>
                            setBudget({
                                ...budget,
                                depositMax: Number(e.target.value),
                            })
                        }
                        placeholder="0"
                        unit="만원"
                    />
                </div>
                <div className="flex gap-4">
                    <FormInput
                        label="월세/매매가 (최소)"
                        type="number"
                        value={budget?.priceMin?.toString()}
                        onChange={(e) =>
                            setBudget({
                                ...budget,
                                priceMin: Number(e.target.value),
                            })
                        }
                        placeholder="0"
                        unit="만원"
                    />
                    <FormInput
                        label="월세/매매가 (최대)"
                        type="number"
                        value={budget?.priceMax?.toString()}
                        onChange={(e) =>
                            setBudget({
                                ...budget,
                                priceMax: Number(e.target.value),
                            })
                        }
                        placeholder="0"
                        unit="만원"
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

            {/* Buttons */}
            <div className="flex gap-2 px-4 mb-4 h-[36px] shrink-0">
                <Button
                    variant="ghost"
                    className="h-full flex-1 text-sm text-(--foreground-muted) hover:text-(--foreground) transition-colors"
                    onClick={onClose}
                >
                    취소
                </Button>
                <Button
                    onClick={handleSubmit}
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 h-full "
                    variant="outline"
                >
                    {isSubmitting ? "저장 중" : initialData ? "수정" : "등록"}
                </Button>
            </div>
        </Form>
    );
}
