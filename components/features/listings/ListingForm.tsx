
import { X } from "lucide-react";
import React, { useState } from "react";
import Form from "@/components/ui/Form";
import FormSection from "@/components/ui/FormSection";
import FormInput from "@/components/ui/FormInput";
import { FormSelect, SelectOption } from "@/components/ui/FormSelect";
import FormTextArea from "@/components/ui/FormTextArea";
import Button from "@/components/ui/Button";
import { useListingMutations } from "@/hooks/queries/listings";
import { Listing } from "@/types/listing";

// Helper for phone formatting
const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 7)
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(
        7,
        11,
    )}`;
};

// Helper for payload cleaning
const cleanPayload = (data: Partial<Listing>) => {
    const {
        bcode,
        building_code,
        sigungu_code,
        owner_contact, // handle separately
        ...rest
    } = data;

    // Clean phone
    const cleanedContact = owner_contact
        ? owner_contact.replace(/-/g, "")
        : undefined;

    return {
        ...rest,
        owner_contact: cleanedContact,
    };
};

interface ListingFormProps {
    initialData?: Partial<Listing>;
    onClose: () => void;
    initialAddress?: string;
    agencyId: string;
}

export default function ListingForm({
    initialData,
    onClose,
    initialAddress,
    agencyId,
}: ListingFormProps) {
    const { createListing, updateListing } = useListingMutations(agencyId);

    const [formData, setFormData] = useState<Partial<Listing>>({
        transaction_type: "SALE",
        property_type: "APARTMENT",
        status: "AVAILABLE",
        address: initialAddress,
        name: initialData?.name || initialAddress,
        ...initialData,
        owner_contact: initialData?.owner_contact
            ? formatPhoneNumber(initialData.owner_contact)
            : undefined,
    });

    const isEditing = !!initialData?.id;
    const isSubmitting = createListing.isPending || updateListing.isPending;

    const handleAddressSearch = () => {
        if (initialAddress) return; // Prevent search if address is fixed
        const script = document.createElement("script");
        script.src =
            "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
        script.onload = () => {
            new (window as any).daum.Postcode({
                oncomplete: (data: any) => {
                    let fullAddress = data.address;
                    let extraAddress = "";

                    if (data.addressType === "R") {
                        if (data.bname !== "") {
                            extraAddress += data.bname;
                        }
                        if (data.buildingName !== "") {
                            extraAddress +=
                                extraAddress !== ""
                                    ? `, ${data.buildingName}`
                                    : data.buildingName;
                        }
                        fullAddress +=
                            extraAddress !== "" ? ` (${extraAddress})` : "";
                    }

                    setFormData((prev) => ({
                        ...prev,
                        address: fullAddress,
                        zonecode: data.zonecode,
                        address_road: data.roadAddress,
                        address_jibun: data.jibunAddress,
                        address_english: data.addressEnglish,
                        bcode: data.bcode,
                        bname: data.bname,
                        building_code: data.buildingCode,
                        building_name: data.buildingName,
                        sido: data.sido,
                        sigungu: data.sigungu,
                        sigungu_code: data.sigunguCode,
                        user_selected_type: data.userSelectedType,
                        name: data.buildingName || prev.name,
                    }));
                },
            }).open();
        };
        document.head.appendChild(script);
    };

    const handleChange = (field: keyof Listing, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        // Validation

        // 1. Required Fields
        if (!formData.address?.trim() || !formData.name?.trim()) {
            alert("필수 입력 항목을 확인해주세요 (주소, 건물명)");
            return;
        }

        // 2. Pricing Validation based on Transaction Type
        const type = formData.transaction_type || "SALE";
        if (type === "SALE") {
            if (!formData.price_selling || formData.price_selling <= 0) {
                alert("매매가를 올바르게 입력해주세요.");
                return;
            }
        } else if (type === "JEONSE") {
            if (!formData.deposit || formData.deposit <= 0) {
                alert("전세 보증금을 올바르게 입력해주세요.");
                return;
            }
        } else if (type === "WOLSE") {
            // Wolse usually needs rent. Deposit can be 0 theoretically but let's warn if both are missing? 
            // For now, let's enforce rent > 0.
            if (
                (formData.deposit === undefined || formData.deposit < 0) ||
                (formData.rent === undefined || formData.rent < 0)
            ) {
                alert("월세 보증금 및 차임을 올바르게 입력해주세요.");
                return;
            }
        }

        // 3. Area Validation
        if (
            formData.area_supply_m2 &&
            formData.area_private_m2 &&
            Number(formData.area_private_m2) > Number(formData.area_supply_m2)
        ) {
            alert("전용면적은 공급면적보다 클 수 없습니다.");
            return;
        }

        // 4. Contact Validation
        if (formData.owner_contact) {
            const phoneRegex = /^\d{2,3}-\d{3,4}-\d{4}$/;
            if (!phoneRegex.test(formData.owner_contact)) {
                alert("소유자 연락처 형식이 올바르지 않습니다.");
                return;
            }
        }

        try {
            const payload = cleanPayload(formData);

            if (isEditing && initialData?.id) {
                await updateListing.mutateAsync({
                    ...payload,
                    id: initialData.id,
                });
            } else {
                await createListing.mutateAsync(payload);
            }
            onClose();
        } catch (error: any) {
            alert(error.message || "오류가 발생했습니다.");
        }
    };

    const handleNumberChange = (field: keyof Listing, value: string) => {
        const num = Number(value);
        if (num < 0) return; // Prevent negative input
        setFormData((prev) => ({ ...prev, [field]: num }));
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
                    label="주소"
                    readOnly
                    disabled={!!initialAddress}
                    value={formData.address || ""}
                    onChange={(e) => handleChange("address", e.target.value)}
                    placeholder="예: 은마아파트"
                    button={
                        <Button
                            variant="primary"
                            onClick={handleAddressSearch}
                            disabled={!!initialAddress}
                            type="button"
                        >
                            검색
                        </Button>
                    }
                />
                <FormInput
                    label="건물명"
                    disabled={!!initialAddress}
                    value={formData.name || ""}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="예: 은마아파트"
                />
                <FormInput
                    label="상세 주소"
                    value={formData.address_detail || ""}
                    onChange={(e) =>
                        handleChange("address_detail", e.target.value)
                    }
                    placeholder="예: 101동 101호"
                />
            </FormSection>

            <FormSection title="매물 상세">
                <FormSelect
                    label="매물 종류"
                    value={formData.property_type || "APARTMENT"}
                    onChange={(val) => handleChange("property_type", val)}
                >
                    <SelectOption value="APARTMENT">아파트</SelectOption>
                    <SelectOption value="VILLA">빌라</SelectOption>
                    <SelectOption value="OFFICETEL">오피스텔</SelectOption>
                    <SelectOption value="ONEROOM">원룸</SelectOption>
                    <SelectOption value="COMMERCIAL">상가</SelectOption>
                    <SelectOption value="LAND">토지</SelectOption>
                </FormSelect>
                <FormSelect
                    label="거래 유형"
                    value={formData.transaction_type || "SALE"}
                    onChange={(val) => handleChange("transaction_type", val)}
                >
                    <SelectOption value="SALE">매매</SelectOption>
                    <SelectOption value="JEONSE">전세</SelectOption>
                    <SelectOption value="WOLSE">월세</SelectOption>
                </FormSelect>

                {formData.transaction_type === "SALE" && (
                    <FormInput
                        label="매매가"
                        type="number"
                        value={formData.price_selling?.toString() || ""}
                        onChange={(e) =>
                            handleNumberChange("price_selling", e.target.value)
                        }
                        min={0}
                        placeholder="0"
                        unit="만원"
                    />
                )}
                {(formData.transaction_type === "JEONSE" ||
                    formData.transaction_type === "WOLSE") && (
                    <FormInput
                        label="보증금"
                        type="number"
                        value={formData.deposit?.toString() || ""}
                        onChange={(e) =>
                            handleNumberChange("deposit", e.target.value)
                        }
                        min={0}
                        placeholder="0"
                        unit="만원"
                    />
                )}
                {formData.transaction_type === "WOLSE" && (
                    <FormInput
                        label="월세"
                        type="number"
                        value={formData.rent?.toString() || ""}
                        onChange={(e) =>
                            handleNumberChange("rent", e.target.value)
                        }
                        min={0}
                        placeholder="0"
                        unit="만원"
                    />
                )}

                <FormInput
                    label="공급면적 (m²)"
                    type="number"
                    value={formData.area_supply_m2?.toString() || ""}
                    onChange={(e) =>
                        handleNumberChange("area_supply_m2", e.target.value)
                    }
                    min={0}
                    placeholder="0"
                />
                <FormInput
                    label="전용면적 (m²)"
                    type="number"
                    value={formData.area_private_m2?.toString() || ""}
                    onChange={(e) =>
                        handleNumberChange("area_private_m2", e.target.value)
                    }
                    min={0}
                    placeholder="0"
                />

                <FormInput
                    label="해당 층"
                    type="number"
                    placeholder="해당 층"
                    value={formData.floor?.toString() || ""}
                    onChange={(e) =>
                        handleNumberChange("floor", e.target.value)
                    }
                />
                <FormInput
                    label="전체 층"
                    type="number"
                    placeholder="전체"
                    value={formData.total_floors?.toString() || ""}
                    onChange={(e) =>
                        handleNumberChange("total_floors", e.target.value)
                    }
                    min={0}
                />
                <FormInput
                    label="방 개수"
                    type="number"
                    placeholder="방"
                    value={formData.room_count?.toString() || ""}
                    onChange={(e) =>
                        handleNumberChange("room_count", e.target.value)
                    }
                    min={0}
                />
                <FormInput
                    label="욕실 개수"
                    type="number"
                    placeholder="욕실"
                    value={formData.bathroom_count?.toString() || ""}
                    onChange={(e) =>
                        handleNumberChange("bathroom_count", e.target.value)
                    }
                    min={0}
                />
            </FormSection>

            <FormSection title="추가 정보">
                <FormInput
                    label="소유자 주 연락처"
                    value={formData.owner_contact || ""}
                    onChange={(e) =>
                        handleChange(
                            "owner_contact",
                            formatPhoneNumber(e.target.value),
                        )
                    }
                    placeholder="010-1234-5678"
                    maxLength={13}
                />
                <FormTextArea
                    label="관리자 메모"
                    value={formData.memo || ""}
                    onChange={(e: any) => handleChange("memo", e.target.value)}
                    className="h-24 resize-none"
                    // placeholder="매물에 대한 메모를 입력하세요"
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
                    {isSubmitting ? "저장 중" : isEditing ? "수정" : "등록"}
                </Button>
            </div>
        </Form>
    );
}
