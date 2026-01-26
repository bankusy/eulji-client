import Image from "next/image";
// import "@/styles/components.css";
import { useEffect, useRef } from "react";

export default function LogoBar() {
    const trackRef = useRef<HTMLDivElement>(null);
    const logos = [
        { name: "atlassian" },
        { name: "canva" },
        { name: "coinbase" },
        { name: "framer" },
        { name: "google" },
        { name: "grammarly" },
        { name: "gumroad" },
        { name: "linear" },
        { name: "medium" },
        { name: "spotify" },
        { name: "tinder" },
    ];

    useEffect(() => {
        const calculateSlideDistance = () => {
            if (trackRef.current) {
                const images = trackRef.current.querySelectorAll('img');
                let totalWidth = 0;

                // 첫 11개 로고(원본)의 너비 합 계산
                for (let i = 0; i < 11; i++) {
                    if (images[i]) {
                        totalWidth += images[i].offsetWidth + 40; // 이미지 너비 + gap
                    }
                }

                // 마지막 gap 제거
                totalWidth -= 40;

                // CSS 변수로 설정
                trackRef.current.style.setProperty('--slide-distance', `-${totalWidth}px`);
            }
        };

        // 이미지 로드 후 계산
        const images = trackRef.current?.querySelectorAll('img');
        if (images && images.length > 0) {
            let loadedCount = 0;
            images.forEach((img) => {
                if (img.complete) {
                    loadedCount++;
                    if (loadedCount === images.length) {
                        calculateSlideDistance();
                    }
                } else {
                    img.addEventListener('load', () => {
                        loadedCount++;
                        if (loadedCount === images.length) {
                            calculateSlideDistance();
                        }
                    });
                }
            });
        }
    }, []);

    return (
        <div className="bar">
            <div className="track" ref={trackRef}>
                {logos.map((logo, index) => (
                    <Image
                        key={`${logo.name}-${index}`}
                        src={`/logos/${logo.name}.svg`}
                        alt={`${logo.name}`}
                        width={200}
                        height={100}
                    />
                ))}
                {/* 무한 재생을 위해 원본 복사 */}
                {logos.map((logo, index) => (
                    <Image
                        key={`${logo.name}-duplicate-${index}`}
                        src={`/logos/${logo.name}.svg`}
                        alt={`${logo.name}`}
                        width={200}
                        height={100}
                    />
                ))}
            </div>
        </div>
    );
}
