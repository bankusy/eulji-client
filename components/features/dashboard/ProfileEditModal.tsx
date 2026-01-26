"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useUserStore } from "@/hooks/useUserStore";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import ProfileCard from "@/components/web/profile/ProfileCard";

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
                        alert("이미 사용 중인 도메인입니다. 다른 도메인을 입력해주세요.");
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
        const url = prompt("프로필 이미지 URL을 입력하세요", avatarUrl);
        if (url !== null) {
            setAvatarUrl(url);
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
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-md" transparent={true}>
            <ProfileCard
                editable={true}
                username={agencyDomain || user?.email || ""}
                name={nickname}
                bio={introduction}
                avatarUrl={avatarUrl}
                officeAddress={officeAddress}
                agencyName={agencyName}
                onFieldChange={handleFieldChange}
                onAvatarClick={handleAvatarClick}
            />

            <div className="absolute -top-4 -right-4 flex flex-col h-[36px]">
                <Button
                    variant="primary"
                    onClick={handleSave}
                    disabled={isSaving}
                >
                    {isSaving ? "저장 중..." : "저장하기"}
                </Button>
            </div>
        </Modal>
    );
}
