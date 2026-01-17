import GlobalLoadingTemplate from "@/app/GlobalLoadingTemplate";

export default function Template({ children }: { children: React.ReactNode }) {
    return <GlobalLoadingTemplate>{children}</GlobalLoadingTemplate>;
}
