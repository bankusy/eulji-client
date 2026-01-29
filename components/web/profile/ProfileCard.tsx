"use client";

import React, { useState } from "react";
import Image from "next/image";
import { MapPin, Building2, Briefcase } from "lucide-react";
import "@/styles/profile.css";
import StarBorder from "@/components/ui/common/Starborder";
import Modal  from "@/components/ui/v1/Modal";
import Input from "@/components/ui/v1/Input";
import { Button } from "@/components/ui/v1/Button";

interface ProfileCardProps {
    username: string;
    name?: string;
    bio?: string;
    avatarUrl?: string;
    location?: string;
    officeAddress?: string;
    agencyName?: string;
    stats?: {
        label: string;
        value: string | number;
    }[];
    
    // 편집 모드 관련
    editable?: boolean;
    onFieldChange?: (field: string, value: string) => void;
    onAvatarClick?: () => void;
}

export default function ProfileCard({
    username,
    name = "이재영",
    bio = "부동산 중개업 CRM 솔루션 컨설턴트입니다. 효율적인 자산 관리와 전문적인 중개 서비스를 제공합니다.",
    avatarUrl,
    location = "서울시 강남구",
    officeAddress = "서울시 강남구 테헤란로 123, 10층",
    agencyName = "을지 부동산 중개법인",
    stats = [
        { label: "Houses", value: 124 },
        { label: "Reviews", value: "4.9" },
        { label: "Exp.", value: "8y" },
    ],
    editable = false,
    onFieldChange,
    onAvatarClick,
}: ProfileCardProps) {
    const [isAddressPopupOpen, setIsAddressPopupOpen] = useState(false);
    const [tempAddress, setTempAddress] = useState(officeAddress);
    const [tempAgencyName, setTempAgencyName] = useState(agencyName);

    const handleChange = (field: string) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        onFieldChange?.(field, e.target.value);
    };

    const handleAddressPopupOpen = () => {
        setTempAddress(officeAddress);
        setTempAgencyName(agencyName);
        setIsAddressPopupOpen(true);
    };

    const handleAddressPopupSave = () => {
        onFieldChange?.('officeAddress', tempAddress);
        onFieldChange?.('agencyName', tempAgencyName);
        setIsAddressPopupOpen(false);
    };

    const handleAddressPopupCancel = () => {
        setTempAddress(officeAddress);
        setTempAgencyName(agencyName);
        setIsAddressPopupOpen(false);
    };

    return (
        <>
            {/* 편집 모드일 때 오버레이 표시 */}
            {editable && isAddressPopupOpen && (
                <div className="fixed inset-0 z-(--z-modal) flex items-center justify-center p-4">
                    <div className="relative z-10 w-full max-w-md bg-(--background) border border-(--border) rounded-lg p-6 space-y-4">
                        <h3 className="text-lg font-bold text-(--foreground)">주소 및 사무소 정보</h3>
                        
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-(--foreground) mb-1">사무소명</label>
                                <Input
                                    value={tempAgencyName}
                                    onChange={(e) => setTempAgencyName(e.target.value)}
                                    placeholder="을지 부동산"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-(--foreground) mb-1">주소</label>
                                <Input
                                    value={tempAddress}
                                    onChange={(e) => setTempAddress(e.target.value)}
                                    placeholder="서울시 강남구 테헤란로 123, 10층"
                                />
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button variant="outline" onClick={handleAddressPopupCancel} className="flex-1">
                                취소
                            </Button>
                            <Button variant="default" onClick={handleAddressPopupSave} className="flex-1">
                                저장
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="profile-card">
                <div className="profile-header"></div>
                <div className="profile-content">
                    <div 
                        className={`profile-avatar-wrapper ${editable ? 'profile-avatar-editable' : ''}`}
                        onClick={editable ? onAvatarClick : undefined}
                    >
                        {avatarUrl ? (
                            <Image
                                src={avatarUrl}
                                alt={name}
                                width={100}
                                height={100}
                                className="profile-avatar"
                            />
                        ) : (
                            <div className="profile-avatar bg-(--gray-3) flex items-center justify-center text-(--foreground-muted) text-xs">
                                No Image
                            </div>
                        )}
                        <div
                            className="status-badge"
                            title="현재 활동 중"
                        ></div>
                    </div>

                    <div className="profile-info">
                        {editable ? (
                            <>
                                <input
                                    type="text"
                                    className="profile-name editable-input"
                                    value={name}
                                    onChange={handleChange('name')}
                                    placeholder="이름 입력"
                                />
                                <p className="profile-username">@{username}</p>
                            </>
                        ) : (
                            <>
                                <h1 className="profile-name">{name}</h1>
                                <p className="profile-username">@{username}</p>
                            </>
                        )}
                    </div>

                    {editable ? (
                        <textarea
                            className="profile-bio editable-textarea"
                            value={bio}
                            onChange={handleChange('bio')}
                            placeholder="소개글을 입력하세요"
                        />
                    ) : (
                        <p className="profile-bio">{bio}</p>
                    )}

                    <div className="profile-metadata">
                        {location && (
                            <div className="metadata-item">
                                <MapPin size={16} />
                                <span>{location}</span>
                            </div>
                        )}
                        {(officeAddress || editable) && (
                            <div className="metadata-item">
                                <Building2 size={16} />
                                {editable ? (
                                    <button
                                        onClick={handleAddressPopupOpen}
                                        className="editable-input"
                                        style={{ cursor: 'pointer', textAlign: 'left', border: '1px dashed var(--border)' }}
                                    >
                                        {officeAddress || "주소를 입력하세요"}
                                    </button>
                                ) : (
                                    <span>{officeAddress}</span>
                                )}
                            </div>
                        )}
                        {(agencyName || editable) && (
                            <div className="metadata-item">
                                <Briefcase size={16} />
                                {editable ? (
                                    <button
                                        onClick={handleAddressPopupOpen}
                                        className="editable-input"
                                        style={{ cursor: 'pointer', textAlign: 'left', border: '1px dashed var(--border)' }}
                                    >
                                        {agencyName || "사무소명을 입력하세요"}
                                    </button>
                                ) : (
                                    <span>{agencyName}</span>
                                )}
                            </div>
                        )}
                    </div>

                    {!editable && stats && stats.length > 0 && (
                        <div className="profile-stats">
                            {stats.map((stat, idx) => (
                                <div key={idx} className="stat-item">
                                    <span className="stat-value">{stat.value}</span>
                                    <span className="stat-label">{stat.label}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {!editable && (
                        <div className="profile-actions">
                            <StarBorder as="button" color="magenta" speed="5s">
                                문의하기
                            </StarBorder>
                        </div>
                    )}
                    
                    {editable && (
                        <p className="editable-hint">
                            각 항목을 클릭하여 수정하세요
                        </p>
                    )}
                </div>
            </div>
        </>
    );
}
