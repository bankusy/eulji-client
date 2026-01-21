"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useUserStore } from "@/hooks/useUserStore";
import { useEffect, useState } from "react";
import { Button } from "../Button";
import Input from "@/components/ui/Input";
import Modal from "../Modal";
import FormField from "../FormField";
import { InputGroup } from "../InputGroup";

interface ProfileEditModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ProfileEditModal({
    isOpen,
    onClose,
}: ProfileEditModalProps) {
    // Get user and refresh logic from store
    const { user, fetchUser } = useUserStore();

    const [nickname, setNickname] = useState("");
    const [jobTitle, setJobTitle] = useState("");
    const [introduction, setIntroduction] = useState("");

    // Address components
    const [zoneCode, setZoneCode] = useState("");
    const [address, setAddress] = useState(""); // Road Address
    const [detailAddress, setDetailAddress] = useState(""); // Detailed Address

    const [contactPhone, setContactPhone] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen && user) {
            setNickname(user.nickname || "");
            setJobTitle(user.job_title || "");
            setIntroduction(user.introduction || "");
            setContactPhone(user.contact_phone || "");
            setAvatarUrl(user.avatar_url || "");

            // Address logic
            setZoneCode(user.zone_code || "");
            setAddress(user.address || "");
            setDetailAddress(user.detail_address || "");
        }
    }, [isOpen, user]);

    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);
        const supabase = createSupabaseBrowserClient();

        try {
            const { error } = await supabase
                .from("users")
                .update({
                    nickname,
                    job_title: jobTitle,
                    introduction,
                    contact_phone: contactPhone,
                    avatar_url: avatarUrl,
                    // Save address components
                    zone_code: zoneCode,
                    address: address, // Road Address
                    detail_address: detailAddress,
                })
                .eq("id", user.id);

            if (error) throw error;

            await fetchUser(); // Refresh store data
            onClose();
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("프로필 수정 중 오류가 발생했습니다.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddressSearch = () => {
        const script = document.createElement("script");
        script.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
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
                        fullAddress += extraAddress !== "" ? ` (${extraAddress})` : "";
                    }

                    setZoneCode(data.zonecode); // Set Zone Code
                    setAddress(fullAddress);    // Set Road Address
                    setDetailAddress("");       // Reset Detail Address
                },
            }).open();
        };
        document.head.appendChild(script);
    };



    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            className="max-w-md"
        >
            <div className="h-full overflow-y-auto p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-(--foreground)">
                        프로필 수정
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-sm text-(--foreground-muted) hover:text-(--foreground) transition-colors"
                    >
                        닫기
                    </button>
                </div>

                <div className="space-y-4">
                    <FormField label="닉네임 (활동명)">
                        <Input
                            className="w-full"
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            placeholder="예: 우정공인중개사"
                        />
                    </FormField>

                    <FormField label="직함">
                        <Input
                            className="w-full"
                            type="text"
                            value={jobTitle}
                            onChange={(e) => setJobTitle(e.target.value)}
                            placeholder="예: 대표 공인중개사"
                        />
                    </FormField>

                    <FormField label="연락처 (노출용)">
                        <Input
                            // validationType="phone"
                            className="w-full"
                            type="text"
                            value={contactPhone}
                            onChange={(e) => setContactPhone(e.target.value)}
                            placeholder="010-1234-5678"
                            maxLength={13}
                        />
                    </FormField>

                    {/* Address Section */}
                    <FormField label="주소">
                        {/* Address & Search Button */}
                        <InputGroup
                            type="text"
                            value={address}
                            readOnly
                            placeholder="주소 검색을 클릭하세요"
                            inputClassName="cursor-default bg-(--background-subtle)"
                            buttonText="검색"
                            onButtonClick={handleAddressSearch}
                        />
                    </FormField>

                    <FormField label="상세 주소">
                        <Input
                            className="w-full"
                            type="text"
                            value={detailAddress}
                            onChange={(e) => setDetailAddress(e.target.value)}
                            placeholder="상세 주소 입력"
                        />
                    </FormField>

                    <FormField label="프로필 이미지 URL">
                        <Input
                            className="w-full"
                            type="text"
                            value={avatarUrl}
                            onChange={(e) => setAvatarUrl(e.target.value)}
                            placeholder="https://..."
                        />
                    </FormField>

                    <FormField label="소개글">
                        <textarea
                            value={introduction}
                            onChange={(e) => setIntroduction(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 text-sm bg-(--background-surface) border border-(--input-border) text-(--foreground) focus:outline-none focus:ring-1 focus:ring-(--primary) resize-none rounded-md"
                            placeholder="간단한 소개글을 입력하세요."
                        />
                    </FormField>
                </div>

                <div className="pt-2">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full bg-(--background-surface) py-2 rounded-md hover:bg-(--background-surface-hover) transition-colors"
                    >
                        {isSaving ? "저장 중..." : "저장하기"}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
