"use client";

import React from "react";
import Image from "next/image";
import { MapPin, Building2, Briefcase } from "lucide-react";
import "@/styles/profile.css";
import StarBorder from "@/components/ui/common/Starborder";

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
}: ProfileCardProps) {
    return (
        <div className="profile-container">
            <div className="profile-card">
                <div className="profile-header"></div>
                <div className="profile-content">
                    <div className="profile-avatar-wrapper">
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
                        <h1 className="profile-name">{name}</h1>
                        <p className="profile-username">@{username}</p>
                    </div>

                    <p className="profile-bio">{bio}</p>

                    <div className="profile-metadata">
                        {location && (
                            <div className="metadata-item">
                                <MapPin size={16} />
                                <span>{location}</span>
                            </div>
                        )}
                        {officeAddress && (
                            <div className="metadata-item">
                                <Building2 size={16} />
                                <span>{officeAddress}</span>
                            </div>
                        )}
                        {agencyName && (
                            <div className="metadata-item">
                                <Briefcase size={16} />
                                <span>{agencyName}</span>
                            </div>
                        )}
                    </div>

                    <div className="profile-stats">
                        {stats.map((stat, idx) => (
                            <div key={idx} className="stat-item">
                                <span className="stat-value">{stat.value}</span>
                                <span className="stat-label">{stat.label}</span>
                            </div>
                        ))}
                    </div>

                    <div className="profile-actions">
                        <StarBorder as="button" color="magenta" speed="5s">
                            문의하기
                        </StarBorder>
                    </div>
                </div>
            </div>
        </div>
    );
}
