import Image from "next/image";
import RippleGrid from "./RippleGrid";
import { redirect } from "next/navigation";

export default function HeroSection() {
    return (
        <section>
            <div className="my-16 px-16 relative">
                {/* 배경 패턴 이미지 */}
                <div className="absolute inset-0 w-full h-full -z-10">
                    {/* <Image
                        className="object-cover"
                        src={"/images/image2.jpg"}
                        fill={true}
                        alt="bg"
                        priority
                    /> */}
                </div>
                
                <div className="flex justify-center gap-2 z-10 w-full">
                    <div className="flex flex-col justify-center gap-2 w-[800px]">
                        <div className="flex flex-col gap-2">
                            <div className="text-4xl font-bold">
                                링크 하나로
                            </div>
                            <div className="text-4xl font-bold">
                                내 비즈니스와 고객을 동시에 관리하세요.
                            </div>
                        </div>
                        <div className="text-(--foreground-muted) mb-8">
                            프로필·포트폴리오·문의가 자동으로 연결되는
                            전문가를 위한 스마트 CRM입니다.
                        </div>
                        <button onClick={() => {
                            redirect("/dashboard");
                        }} className="border border-(--border) text-(--foreground) w-[150px] rounded-full py-2 px-3 hover:bg-(--background)/10 transition-colors">
                            무료로 시작하기
                        </button>
                    </div>
                    <div className="h-[400px] flex justify-center items-center">
                        <RippleGrid />
                    </div>
                </div>
            </div>
        </section>
    );
}
