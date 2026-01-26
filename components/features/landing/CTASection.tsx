import { redirect } from "next/navigation";
export default function CTASection() {



    return (
        <section className="my-16 border-y border-(--border)">
            <div className="flex flex-col gap-8 justify-center items-center py-16 px-8">
                {/* 메인 헤드라인 */}
                <div className="text-center max-w-4xl">
                    <div className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                        링크 하나로
                        <span className="text-(--accent)"> 매물과 고객을</span> 관리하세요
                    </div>
                    <div className="text-xl md:text-2xl font-light text-(--foreground-muted) leading-relaxed">
                        프로필·매물·문의가 자동으로 연결되는 공인중개사 전용 CRM을 지금 바로 경험해 보세요.
                    </div>
                </div>

                {/* CTA 버튼들 */}
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <button onClick={() => {
                        redirect("/dashboard")
                    }} className="px-8 py-4 bg-(--accent) hover:bg-(--accent-hover) text-(--accent-foreground) font-bold text-lg rounded-lg transition-all duration-300">
                        을지 CRM 무료로 시작하기
                    </button>

                    <button className="px-8 py-4 border border-(--border) text-(--accent) font-semibold text-lg rounded-lg hover:bg-(--accent) hover:text-(--accent-foreground) transition-all duration-300">
                        데모 중개사 페이지 보기
                    </button>
                </div>

                {/* 신뢰 요소 */}
                <div className="flex items-center gap-6 text-sm text-(--foreground-muted) mt-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-(--accent) rounded-full"></div>
                        <span>1분 만에 프로필 페이지 생성</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-(--accent) rounded-full"></div>
                        <span>문의 시 자동 CRM 등록</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-(--accent) rounded-full"></div>
                        <span>중개사를 위한 Freemium 요금제</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
