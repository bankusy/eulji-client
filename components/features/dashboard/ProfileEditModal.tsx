"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useUserStore } from "@/hooks/useUserStore";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
// import ProfileCard from "@/components/web/profile/ProfileCard"; // Removed
import { compressImage } from "@/lib/imageUtils";
import FormSection from "@/components/ui/FormSection";
import FormInput from "@/components/ui/FormInput";
import FormTextArea from "@/components/ui/FormTextArea";
import Form from "@/components/ui/BaseForm";
import { X } from "lucide-react";
import IconWrapper from "@/components/ui/IconWrapper";

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
    const [introduction, setIntroduction] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [agencyName, setAgencyName] = useState("");
    const [officeAddress, setOfficeAddress] = useState("");
    const [agencyDomain, setAgencyDomain] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen && user) {
            setNickname(user.nickname || "");
            setIntroduction(user.introduction || "");
            setAvatarUrl(user.avatar_url || "");

            // 주소 조합
            const fullAddress = [user.address, user.detail_address]
                .filter(Boolean)
                .join(" ");
            setOfficeAddress(fullAddress);

            // Agency domain 가져오기 - 추후 agency 정보에서 가져오기
            // TODO: agency_users에서 user의 agency_id를 조회하고, agencies 테이블의 domain 가져오기
            fetchAgencyDomain();
        }
    }, [isOpen, user]);

    const fetchAgencyDomain = async () => {
        if (!user) return;

        const supabase = createSupabaseBrowserClient();

        // 사용자의 agency 조회
        const { data: agencyUser } = await supabase
            .from("agency_users")
            .select("agency_id, agencies(name, domain)")
            .eq("user_id", user.id)
            .single();

        if (agencyUser?.agencies) {
            const agency = agencyUser.agencies as any;
            setAgencyDomain(agency.domain || "");
            setAgencyName(agency.name || "을지 부동산");
        }
    };

    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);
        const supabase = createSupabaseBrowserClient();

        // Keep track of the old avatar URL
        const previousAvatarUrl = user.avatar_url;

        try {
            // 주소를 address와 detail_address로 분리 (간단하게 처리)
            const addressParts = officeAddress.split(",");
            const address = addressParts[0]?.trim() || "";
            const detailAddress = addressParts.slice(1).join(",").trim() || "";

            const { error } = await supabase
                .from("users")
                .update({
                    nickname,
                    introduction,
                    avatar_url: avatarUrl,
                    address: address,
                    detail_address: detailAddress,
                })
                .eq("id", user.id);

            if (error) throw error;

            // Agency domain 중복 확인 및 저장 (domain이 없는 경우만)
            if (agencyDomain && !agencyDomain.includes("@")) {
                const { data: agencyUser } = await supabase
                    .from("agency_users")
                    .select("agency_id")
                    .eq("user_id", user.id)
                    .single();

                if (agencyUser) {
                    // domain 중복 확인
                    const { data: existingAgency } = await supabase
                        .from("agencies")
                        .select("id")
                        .eq("domain", agencyDomain)
                        .neq("id", agencyUser.agency_id)
                        .single();

                    if (existingAgency) {
                        alert(
                            "이미 사용 중인 도메인입니다. 다른 도메인을 입력해주세요.",
                        );
                        setIsSaving(false);
                        return;
                    }

                    // domain 저장
                    await supabase
                        .from("agencies")
                        .update({ domain: agencyDomain, name: agencyName })
                        .eq("id", agencyUser.agency_id);
                }
            }

            // If avatar has changed and there was a previous avatar, delete the old one
            if (previousAvatarUrl && previousAvatarUrl !== avatarUrl) {
                try {
                    await fetch("/api/storage/delete", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ fileUrl: previousAvatarUrl }),
                    });
                } catch (deleteError) {
                    // We don't block the UI flow for deletion errors, just log it
                    console.error("Failed to delete old avatar:", deleteError);
                }
            }

            await fetchUser(); // Refresh store data
            onClose();
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("프로필 수정 중 오류가 발생했습니다.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleAvatarClick = () => {
        if (isUploading) return;
        fileInputRef.current?.click();
    };

    const handleImageUpload = async (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = event.target.files?.[0];
        if (!file || !user || isUploading) return;

        setIsUploading(true);
        try {
            // Use custom compressor instead of library
            const compressedBlob = await compressImage(file, 1024, 0.8);

            // 1. Get Presigned URL from our API
            const response = await fetch("/api/upload/presigned-url", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    filename: file.name,
                    fileType: "image/webp", // We always convert to webp
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to get upload URL");
            }

            const { uploadUrl, publicUrl } = await response.json();

            console.log(uploadUrl);

            // 2. Upload directly to R2 using PUT
            const uploadResponse = await fetch(uploadUrl, {
                method: "PUT",
                headers: {
                    "Content-Type": "image/webp",
                },
                body: compressedBlob,
            });

            if (!uploadResponse.ok) {
                throw new Error("Failed to upload image to storage");
            }

            // 3. Update state with the public URL
            setAvatarUrl(publicUrl);
        } catch (error) {
            console.error("Error uploading image:", error);
            alert("이미지 업로드에 실패했습니다.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleFieldChange = (field: string, value: string) => {
        switch (field) {
            case "name":
                setNickname(value);
                break;
            case "bio":
                setIntroduction(value);
                break;
            case "agencyName":
                setAgencyName(value);
                break;
            case "officeAddress":
                setOfficeAddress(value);
                break;
            default:
                break;
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            className="max-w-2xl px-0 py-0 pb-0 flex flex-col h-[80vh]"
        >
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="hidden"
                accept="image/*"
            />

            <div className="flex-none p-6 border-b border-(--border)">
                <h2 className="text-xl font-semibold">
                    프로필 수정
                </h2>
                <p className="text-sm text-(--foreground-muted) mt-1">
                    프로필 정보를 입력해 주세요.
                </p>
            </div>

            <Form
                className="flex-1 p-6"
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSave();
                }}
            >
                {/* Avatar Section */}
                <div className="flex justify-center mb-6">
                    <div
                        className="relative w-24 h-24 rounded-full overflow-hidden border border-(--border-subtle) cursor-pointer hover:opacity-80 transition-opacity group"
                        onClick={handleAvatarClick}
                    >
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt="Avatar"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-(--background-subtle) flex items-center justify-center text-(--foreground-muted) text-xs">
                                이미지 없음
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                            변경
                        </div>
                    </div>
                </div>

                <FormSection title="기본 정보">
                    <FormInput
                        label="이름 (닉네임)"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="홍길동"
                    />
                    <FormTextArea
                        label="소개"
                        value={introduction}
                        onChange={(e) => setIntroduction(e.target.value)}
                        placeholder="간단한 소개를 입력해주세요"
                        className="h-24 text-sm p-2 resize-none"
                    />
                </FormSection>

                <FormSection title="부동산 정보">
                    <FormInput
                        label="상호명"
                        value={agencyName}
                        onChange={(e) => setAgencyName(e.target.value)}
                        placeholder="을지 부동산"
                    />
                    <FormInput
                        label="사무실 주소"
                        value={officeAddress}
                        onChange={(e) => setOfficeAddress(e.target.value)}
                        placeholder="서울시 강남구..."
                    />
                </FormSection>
            </Form>
            <div className="flex-none p-4 border-t border-(--border) flex justify-end gap-2">
                <Button
                    variant="ghost"
                    onClick={onClose}
                    className="text-(--foreground-muted) hover:text-(--foreground)"
                >
                    취소
                </Button>
                <Button
                    variant="primary" // Changed to primary for save action
                    type="submit"
                    onClick={handleSave}
                    disabled={isSaving || isUploading}
                >
                    {isSaving
                        ? "저장 중..."
                        : isUploading
                          ? "업로드 중..."
                          : "저장"}
                </Button>
            </div>
        </Modal>
    );
}
