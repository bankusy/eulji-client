"use client";

import { usePathname } from "next/navigation";
import HeroSection from "@/components/features/landing/HeroSection";
import WebDesignSection from "@/components/features/landing/WebDesignSection";
import LogoBar from "@/components/features/landing/LogoBar";
import FAQSection from "@/components/features/landing/FAQSection";
import CTASection from "@/components/features/landing/CTASection";
import Footer from "@/components/features/landing/Footer";
import { useEffect, useState } from "react";
import ThemeHook from "@/hooks/ThemeHook";
import Image from "next/image";

export default function Home() {
    const pathname = usePathname();
    const [isLoading, setLoading] = useState(false);

    return (
        <div className="h-full">
            <HeroSection />

            <section>
                <div className="my-16 border-y border-(--border)">
                    <WebDesignSection
                        imageSrc="/images/image3.jpg"
                        layout="image-text"
                        category="LINK PAGE & PROFILE"
                        title="링크 하나로 프로필·상품·문의까지"
                        description="인스타, 블로그 등 다양한 채널의 고객을 한 페이지로 모으고, 전문가 프로필과 대표 포트폴리오를 함께 보여주세요. 문의는 자동으로 CRM에 쌓입니다."
                    />
                    <WebDesignSection
                        imageSrc="/images/image4.jpg"
                        layout="text-image"
                        category="LEAD & 고객 관리"
                        title="문의가 들어오면 자동으로 CRM에 기록"
                        description="고객이 이름과 연락처를 남기는 순간, 리드가 자동으로 등록되고 히스토리가 쌓입니다. 수첩·엑셀 대신, 체계적으로 관리되는 비즈니스 파이프라인을 제공합니다."
                    />
                    <WebDesignSection
                        imageSrc="/images/image5.jpg"
                        layout="image-text"
                        showTopBorder={false}
                        category="스마트 알림 자동화"
                        title="고객을 놓치지 않는 스마트 알림"
                        description="중요 일정, 계약 만료일, 재계약 시점 등을 기준으로 자동 알림을 보내 잊혀진 고객을 다시 깨워보세요. 중요한 타이밍을 놓치지 않도록 CRM이 먼저 알려드립니다."
                    />
                </div>
            </section>

            <section>
                <div className="my-16">
                    <LogoBar />
                </div>
            </section>

            <FAQSection />
            <CTASection />
            <Footer />
        </div>
    );
}


export function Profile() {
    const [isInquiryFormOpen, setInquiryFormOpen] = useState(false);
    const [isLoading, setLoading] = useState(false);

    // Form State
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setLoading(true);
    }, [])


    const { systemTheme } = ThemeHook();
    const user = {
        name: "우정공인중개사",
        avatar: "/profile.png",
        address: "경남 김해시 계동로 12 팔판마을4단지푸르지오상가 101호",
    };

    const properties = [
        {
            id: 1,
            title: "마포구 합정동 역세권 투룸",
            price: "4억 5,000만",
            location: "마포구 합정동",
            specs: "투룸 · 15평",
            images: [
                "https://i.pinimg.com/1200x/93/09/01/930901cd4bb9a6d2a5cc5db0eda296dd.jpg",
            ],
            tags: ["신규", "급매"],
            status: "판매중",
        },
        {
            id: 2,
            title: "서대문구 홍은역 오피스텔",
            price: "6억 2,000만",
            location: "서대문구 홍은동",
            specs: "오피스텔 · 18평",
            images: [
                "https://i.pinimg.com/1200x/93/09/01/930901cd4bb9a6d2a5cc5db0eda296dd.jpg",
                "https://i.pinimg.com/736x/88/e6/ba/88e6bac20e41c64ddcdcba1f27b1b211.jpg",
            ],
            tags: ["거래완료"],
            status: "거래완료",
        },
        {
            id: 3,
            title: "용산구 이촌역 아파트",
            price: "8억 9,000만",
            location: "용산구 이촌동",
            specs: "아파트 · 24평",
            images: [
                "https://i.pinimg.com/736x/88/e6/ba/88e6bac20e41c64ddcdcba1f27b1b211.jpg",
                "https://i.pinimg.com/736x/c1/77/c3/c177c34a7771f75427e678f0b054ac25.jpg",
            ],
            tags: ["신규"],
            status: "판매중",
        },
        {
            id: 4,
            title: "용산구 이촌역 아파트",
            price: "8억 9,000만",
            location: "용산구 이촌동",
            specs: "아파트 · 24평",
            images: [
                "https://i.pinimg.com/736x/88/e6/ba/88e6bac20e41c64ddcdcba1f27b1b211.jpg",
            ],
            tags: ["신규"],
            status: "판매중",
        },
        {
            id: 3,
            title: "용산구 이촌역 아파트",
            price: "8억 9,000만",
            location: "용산구 이촌동",
            specs: "아파트 · 24평",
            images: [
                "https://i.pinimg.com/736x/88/e6/ba/88e6bac20e41c64ddcdcba1f27b1b211.jpg",
            ],
            tags: ["신규"],
            status: "판매중",
        },
        {
            id: 3,
            title: "용산구 이촌역 아파트",
            price: "8억 9,000만",
            location: "용산구 이촌동",
            specs: "아파트 · 24평",
            images: [
                "https://i.pinimg.com/736x/c1/77/c3/c177c34a7771f75427e678f0b054ac25.jpg",
            ],
            tags: ["신규"],
            status: "판매중",
        },
        {
            id: 3,
            title: "용산구 이촌역 아파트",
            price: "8억 9,000만",
            location: "용산구 이촌동",
            specs: "아파트 · 24평",
            images: [
                "https://i.pinimg.com/736x/88/e6/ba/88e6bac20e41c64ddcdcba1f27b1b211.jpg",
                "https://i.pinimg.com/1200x/93/09/01/930901cd4bb9a6d2a5cc5db0eda296dd.jpg",
            ],
            tags: ["신규"],
            status: "판매중",
        },
        {
            id: 3,
            title: "용산구 이촌역 아파트",
            price: "8억 9,000만",
            location: "용산구 이촌동",
            specs: "아파트 · 24평",
            images: [
                "https://i.pinimg.com/736x/88/e6/ba/88e6bac20e41c64ddcdcba1f27b1b211.jpg",
                "https://i.pinimg.com/736x/c1/77/c3/c177c34a7771f75427e678f0b054ac25.jpg",
            ],
            tags: ["신규"],
            status: "판매중",
        },
        {
            id: 3,
            title: "용산구 이촌역 아파트",
            price: "8억 9,000만",
            location: "용산구 이촌동",
            specs: "아파트 · 24평",
            images: [
                "https://i.pinimg.com/736x/88/e6/ba/88e6bac20e41c64ddcdcba1f27b1b211.jpg",
                "https://i.pinimg.com/736x/c1/77/c3/c177c34a7771f75427e678f0b054ac25.jpg",
            ],
            tags: ["신규"],
            status: "판매중",
        },
        {
            id: 3,
            title: "용산구 이촌역 아파트",
            price: "8억 9,000만",
            location: "용산구 이촌동",
            specs: "아파트 · 24평",
            images: [
                "https://i.pinimg.com/736x/88/e6/ba/88e6bac20e41c64ddcdcba1f27b1b211.jpg",
            ],
            tags: ["신규"],
            status: "판매중",
        },
        {
            id: 3,
            title: "용산구 이촌역 아파트",
            price: "8억 9,000만",
            location: "용산구 이촌동",
            specs: "아파트 · 24평",
            images: [
                "https://i.pinimg.com/736x/c1/77/c3/c177c34a7771f75427e678f0b054ac25.jpg",
            ],
            tags: ["신규"],
            status: "판매중",
        },
        {
            id: 3,
            title: "용산구 이촌역 아파트",
            price: "8억 9,000만",
            location: "용산구 이촌동",
            specs: "아파트 · 24평",
            images: [
                "https://i.pinimg.com/1200x/93/09/01/930901cd4bb9a6d2a5cc5db0eda296dd.jpg",
                "https://i.pinimg.com/736x/c1/77/c3/c177c34a7771f75427e678f0b054ac25.jpg",
            ],
            tags: ["신규"],
            status: "판매중",
        },
        {
            id: 3,
            title: "용산구 이촌역 아파트",
            price: "8억 9,000만",
            location: "용산구 이촌동",
            specs: "아파트 · 24평",
            images: [
                "https://i.pinimg.com/736x/88/e6/ba/88e6bac20e41c64ddcdcba1f27b1b211.jpg",
                "https://i.pinimg.com/736x/c1/77/c3/c177c34a7771f75427e678f0b054ac25.jpg",
            ],
            tags: ["신규"],
            status: "판매중",
        },
        {
            id: 3,
            title: "용산구 이촌역 아파트",
            price: "8억 9,000만",
            location: "용산구 이촌동",
            specs: "아파트 · 24평",
            images: [
                "https://i.pinimg.com/736x/88/e6/ba/88e6bac20e41c64ddcdcba1f27b1b211.jpg",
                "https://i.pinimg.com/736x/c1/77/c3/c177c34a7771f75427e678f0b054ac25.jpg",
            ],
            tags: ["신규"],
            status: "판매중",
        },
        {
            id: 3,
            title: "용산구 이촌역 아파트",
            price: "8억 9,000만",
            location: "용산구 이촌동",
            specs: "아파트 · 24평",
            images: [
                "https://i.pinimg.com/736x/88/e6/ba/88e6bac20e41c64ddcdcba1f27b1b211.jpg",
                "https://i.pinimg.com/736x/c1/77/c3/c177c34a7771f75427e678f0b054ac25.jpg",
            ],
            tags: ["신규"],
            status: "판매중",
        },
        {
            id: 3,
            title: "용산구 이촌역 아파트",
            price: "8억 9,000만",
            location: "용산구 이촌동",
            specs: "아파트 · 24평",
            images: [
                "https://i.pinimg.com/1200x/93/09/01/930901cd4bb9a6d2a5cc5db0eda296dd.jpg",
            ],
            tags: ["신규"],
            status: "판매중",
        },
        {
            id: 3,
            title: "용산구 이촌역 아파트",
            price: "8억 9,000만",
            location: "용산구 이촌동",
            specs: "아파트 · 24평",
            images: [
                "https://i.pinimg.com/1200x/93/09/01/930901cd4bb9a6d2a5cc5db0eda296dd.jpg",
                "https://i.pinimg.com/736x/c1/77/c3/c177c34a7771f75427e678f0b054ac25.jpg",
            ],
            tags: ["신규"],
            status: "판매중",
        },
    ];

    const handleInquiryForm = () => {
        setInquiryFormOpen((prev) => !prev);
    };

    if (!isLoading) return <div></div>;

    const handleSubmit = async () => {
        if (!name || !phone) {
            alert("이름과 연락처를 입력해주세요.");
            return;
        }
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/public/leads", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    phone,
                    message,
                }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "제출 실패");
            }

            alert("문의가 성공적으로 접수되었습니다.");
            setInquiryFormOpen(false);
            setName("");
            setPhone("");
            setMessage("");
        } catch (e: any) {
            console.error(e);
            alert(`문의 접수 중 오류가 발생했습니다: ${e.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-(--background) h-screen pt-(--header-height)">
            <div className="max-w-sm mx-auto h-full">
                <div className="flex flex-col items-center">
                    <div className="relative overflow-hidden w-24 h-24 rounded-full bg-(--border)">
                        {user.avatar ? (
                            <Image
                                className="absolute inset-0 object-cover"
                                src={user.avatar}
                                fill={true}
                                alt="mappin"
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Image
                                    src={`/icons/person/${systemTheme}-fill.svg`}
                                    width={28}
                                    height={28}
                                    alt="mappin"
                                />
                            </div>
                        )}
                    </div>
                    <div className="text-center">
                        <h1 className="text-2xl font-semibold text-(--foreground)">
                            {user.name}
                        </h1>
                        <p className="flex gap-1 items-center text-sm text-(--foreground-muted) mt-1">
                            <Image
                                className="relative -top-[1.5px]"
                                src={`/icons/mappin/${systemTheme}-fill.svg`}
                                width={16}
                                height={14}
                                alt="mappin"
                            />
                            <span className="text-xs">{user.address}</span>
                        </p>
                    </div>
                </div>

                <div className="overflow-y-auto h-[480px]">
                    <div className="grid grid-cols-3 gap-1 mt-3">
                        {properties.map((property) => (
                            <div
                                key={property.id}
                                className="relative space-y-1"
                            >
                                <div className="group relative overflow-hidden aspect-square">
                                    <Image
                                        className="absolute inset-0 object-cover"
                                        src={property.images[0]}
                                        fill={true}
                                        alt="image"
                                    />
                                    <div
                                        className={`hidden group-hover:flex absolute inset-0 justify-center items-center bg-black opacity-80 text-2xl transition-all duration-200 cursor-pointer`}
                                    >
                                        +{property.images.length}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {isInquiryFormOpen && (
                <div className="fixed inset-0 flex justify-center items-center w-full h-full z-50">
                    <div
                        className="absolute inset-0 w-full h-full bg-black/10"
                        onClick={() => setInquiryFormOpen(false)}
                    ></div>
                    <div
                        className="w-md h-[80vh] border border-(--border) bg-(--background) rounded-xl overflow-hidden relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="h-full flex flex-col">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-(--border)">
                                <h2 className="text-lg font-semibold text-(--foreground)">
                                    문의하기
                                </h2>
                                <button
                                    onClick={() => setInquiryFormOpen(false)}
                                    className="text-(--foreground-muted) hover:text-(--foreground) transition-colors"
                                >
                                    <svg
                                        className="w-6 h-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>

                            <div className="flex-1 overflow-auto px-6 py-6 space-y-6">
                                <div>
                                    <label className="block text-xs font-medium text-(--foreground) mb-2">
                                        이름
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="이름을 입력하세요"
                                        className="text-xs w-full px-4 py-3 border border-(--border) bg-(--navigation-submenu-background) text-(--foreground) placeholder:text-(--foreground-muted) focus:outline-none focus:border-transparent transition-all focus:ring-1 focus:ring-(--primary) focus:outline-0"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-(--foreground) mb-2">
                                        연락처
                                    </label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="010-1234-5678"
                                        className="text-xs w-full px-4 py-3 border border-(--border) bg-(--navigation-submenu-background) text-(--foreground) placeholder:text-(--foreground-muted) focus:outline-none focus:border-transparent transition-all focus:ring-1 focus:ring-(--primary) focus:outline-0"
                                        maxLength={13}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-(--foreground) mb-2">
                                        문의 내용
                                    </label>
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="문의 내용을 입력하세요"
                                        rows={6}
                                        className="text-xs w-full px-4 py-3 border border-(--border) bg-(--navigation-submenu-background) text-(--foreground) placeholder:text-(--foreground-muted) focus:outline-none focus:border-transparent transition-all resize-none focus:ring-1 focus:ring-(--primary) focus:outline-0"
                                    />
                                </div>
                            </div>

                            <div className="p-4 border-t border-(--border)">
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="flex justify-center w-full bg-(--foreground) text-(--background) py-3  hover:opacity-80 active:opacity-80 transition-opacity disabled:opacity-50"
                                >
                                    <span className="text-sm">{isSubmitting ? "접수 중..." : "문의하기"}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 플로팅 추가 버튼 */}
            <button
                onClick={handleInquiryForm}
                className="fixed bottom-6 right-6 w-12 h-12 bg-(--foreground) hover:opacity-80 text-(--background) rounded-full hover:transition-all duration-200 flex items-center justify-center z-1 hover:scale-[1.1]"
                title="새 리드 추가"
            >
                <Image
                    src={`/icons/mail/${systemTheme == "dark" ? "light" : "dark"}-fill.svg`}
                    width={24}
                    height={24}
                    alt="새 리드 추가"
                />
            </button>
        </div>
    );
}
