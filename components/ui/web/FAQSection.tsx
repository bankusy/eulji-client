import Accordion from "./Accordion";

export default function FAQSection() {
    return (
        <section>
            <div className="flex justify-center items-center px-16 my-16">
                <div className="flex flex-col gap-4">
                    <div className="text-5xl">자주 묻는 질문</div>
                    <Accordion
                        labels={[
                            {
                                id: 1,
                                headerLabel:
                                    "을지는 어떤 서비스인가요?",
                                toggleLabel:
                                    "을지는 전문가를 위한 링크 기반 CRM입니다. 프로필, 포트폴리오(상품) 확인, 문의 폼을 하나의 가벼운 페이지로 제공하고, 들어온 문의를 자동으로 CRM에 저장해 고객과 비즈니스 이력을 함께 관리할 수 있게 해줍니다.",
                            },
                            {
                                id: 2,
                                headerLabel: "정확히 무엇을 관리할 수 있나요?",
                                toggleLabel:
                                    "온라인에서 들어오는 문의(전화, 문자, 링크 폼)를 한곳에 모으고, 고객 정보·관심 상품·상담 이력·진행 단계(문의 → 미팅 → 계약)를 한 눈에 볼 수 있습니다. 엑셀과 수첩을 대신하는 효율적인 비즈니스 파이프라인을 제공합니다.",
                            },
                            {
                                id: 3,
                                headerLabel: "요금제와 무료 이용은 어떻게 되나요?",
                                toggleLabel:
                                    "기본 기능은 Freemium으로 제공되어, 프로필 페이지와 기본 문의 접수 기능을 무료로 사용할 수 있습니다. 포트폴리오 이미지 대량 등록, 고급 알림, 팀 기능 등은 유료 요금제로 제공되며, 추후 오픈 시 자세히 안내해 드립니다.",
                            },
                            {
                                id: 4,
                                headerLabel: "설정이 복잡하지는 않나요?",
                                toggleLabel:
                                    "회원가입 후 프로필 정보와 연락처, 소개글만 입력하면 나만의 페이지가 바로 생성됩니다. 상품 등록과 문의 폼 설정도 간편하게 구성되어 있어, IT에 익숙하지 않은 분들도 몇 분 안에 세팅할 수 있습니다.",
                            },
                            {
                                id: 5,
                                headerLabel: "언제든지 해지하거나 데이터를 가져갈 수 있나요?",
                                toggleLabel:
                                    "언제든지 마이페이지에서 계정을 비활성화하거나 구독을 해지하실 수 있습니다. 고객 정보와 상품 정보는 언제든 엑셀 등으로 안전하게 내려받을 수 있습니다.",
                            },
                        ]}
                    />
                </div>
            </div>
        </section>
    );
}
