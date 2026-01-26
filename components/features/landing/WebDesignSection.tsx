import Image from "next/image";

interface WebDesignSectionProps {
    layout?: "image-text" | "text-image";
    showTopBorder?: boolean;
    category?: string;
    title?: string;
    description?: string;
    imageSrc?: string;
    imageAlt?: string;
}

export default function WebDesignSection({
    layout = "image-text",
    showTopBorder = true,
    category = "WEB DESIGN",
    title = "현대적인 웹 디자인으로 브랜드를 빛나게",
    description = "사용자 중심의 직관적인 디자인으로 방문자를 고객으로 전환합니다. 반응형 디자인으로 모든 디바이스에서 완벽하게 작동합니다.",
    imageSrc = "/images/image3.jpg",
    imageAlt = "web design showcase"
}: WebDesignSectionProps) {
    const content = (
        <div className="flex flex-col gap-2 justify-center h-full">
            <div className="text-md text-(--foreground-muted)">
                {category}
            </div>
            <div className="text-2xl font-semibold">
                {title}
            </div>
            <div className="text-sm">
                {description}
            </div>
        </div>
    );

    const image = (
        <div className="relative h-[360px] border-l border-(--border)">
            <Image
                className="object-cover"
                src={imageSrc}
                alt={imageAlt}
                fill={true}
            />
        </div>
    );

    return (
        <div className={`grid grid-cols-[250px_0.5fr_0.5fr_250px] ${showTopBorder ? 'border-y' : ''} border-(--border)`}>
            <div className="h-[360px] border-l border-(--border)"></div>
            {layout === "image-text" ? (
                <>
                    {image}
                    <div className="h-[360px] border-l border-(--border) p-16">
                        {content}
                    </div>
                </>
            ) : (
                <>
                    <div className="h-[360px] border-l border-(--border) p-16">
                        {content}
                    </div>
                    {image}
                </>
            )}

            <div className="h-[360px] border-l border-(--border)"></div>
        </div>
    );
}
