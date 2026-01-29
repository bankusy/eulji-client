import { useMemo } from "react";
import { leadColumns, Lead } from "@/types/lead";

// 컬럼 설정을 관리하는 훅
export function useLeadsColumns(
    columnOrder: string[],
    visibleColumns: Record<string, boolean>,
    stickyColumns: Record<string, boolean>,
    members: any[], // 멤버 목록 (담당자 지정용)
    isOwner: boolean, // 수정 권한 확인용
    onRecommendationClick: (lead: Lead) => void // 추천 매물 클릭 핸들러
) {
    return useMemo(() => {
        // 빠른 검색을 위한 Map 생성
        const columnMap = new Map(leadColumns.map((column) => [column.key, column]));

        // 스티키 속성을 병합하는 헬퍼 함수
        const mergeStickyState = (column: (typeof leadColumns)[0]) => ({
            ...column,
            // 1. 사용자 지정 스티키 설정 -> 2. 기본 스티키 설정 -> 3. 기본값 false
            sticky: stickyColumns[column.key] ?? column.sticky ?? false,
        });

        // 컬럼에 동적 기능(담당자, 추천 매물 등)을 주입하는 함수
        const enrichColumnDefinition = (column: (typeof leadColumns)[0]) => {
            const mergedColumn = mergeStickyState(column);

            // 담당자 컬럼: 셀렉트 옵션 동적 생성
            if (mergedColumn.key === "assignee") {
                return {
                    ...mergedColumn,
                    type: "select" as const,
                    editable: isOwner,
                    getEditValue: (lead: Lead) => lead.assigned_user_id,
                    options: [
                        { label: "미지정", value: "" },
                        ...members.map((member: any) => ({
                            label: member.name,
                            value: member.id,
                        })),
                    ],
                };
            }

            // 추천 매물 컬럼: 클릭 가능한 렌더 함수 주입
            if (mergedColumn.key === "recommendations") {
                return {
                    ...mergedColumn,
                    render: (row: Lead) => {
                        const recommendations = row.recommendations;
                        return (
                            <div
                                className="w-full cursor-pointer hover:bg-(--background-surface) rounded px-2 py-1 transition-colors"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    if (recommendations && recommendations.length > 0) {
                                        onRecommendationClick(row);
                                    }
                                }}
                            >
                                {Array.isArray(recommendations) && recommendations.length > 0 ? (
                                    <span className="text-(--primary) font-semibold">
                                        {recommendations.length}건 매칭
                                    </span>
                                ) : (
                                    <span className="text-(--foreground-muted) text-xs">
                                        0건
                                    </span>
                                )}
                            </div>
                        );
                    },
                };
            }
            return mergedColumn;
        };

        // 1. 컬럼 순서(ordered)에 따라 매핑
        const orderedColumns = columnOrder
            .map((key) => columnMap.get(key))
            // 존재하고 화면에 보이는 컬럼만 필터링
            .filter((column) => column && visibleColumns[column.key])
            // 동적 기능 주입
            .map((column) => enrichColumnDefinition(column!));

        // 2. 순서에는 없지만 설정에는 존재하는(누락된) 컬럼 처리
        const missingColumns = leadColumns
            .filter(
                (column) => !columnOrder.includes(column.key) && visibleColumns[column.key],
            )
            .map((column) => enrichColumnDefinition(column));

        // 최종 병합하여 반환
        return [...orderedColumns, ...missingColumns] as typeof leadColumns;
    }, [columnOrder, visibleColumns, stickyColumns, members, isOwner, onRecommendationClick]);
}
