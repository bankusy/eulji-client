import {
    DragEndEvent,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useEffect, useMemo, useState } from "react";

interface UseDraggableColumnsProps<T extends { key: string }> {
    columns: T[];
    visibleColumns: { [key: string]: boolean };
    storageKey: string;
}

export function useDraggableColumns<T extends { key: string }>({
    columns,
    visibleColumns,
    storageKey,
}: UseDraggableColumnsProps<T>) {
    const [columnOrder, setColumnOrder] = useState<string[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            try {
                setColumnOrder(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse column order", e);
            }
        }
        setIsLoaded(true);
    }, [storageKey]);

    const saveColumnOrder = (newOrder: string[]) => {
        setColumnOrder(newOrder);
        localStorage.setItem(storageKey, JSON.stringify(newOrder));
    };

    const orderedColumns = useMemo(() => {
        const visibleCols = columns.filter((col) => visibleColumns[col.key]);
        if (columnOrder.length === 0) return visibleCols;

        return [...visibleCols].sort((a, b) => {
            const indexA = columnOrder.indexOf(a.key);
            const indexB = columnOrder.indexOf(b.key);
            if (indexA === -1 && indexB === -1) return 0;
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });
    }, [columns, visibleColumns, columnOrder, isLoaded]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            const currentOrder =
                columnOrder.length > 0 ? columnOrder : columns.map((c) => c.key);

            const oldKey = active.id as string;
            const newKey = over!.id as string;

            const globalOldIndex = currentOrder.indexOf(oldKey);
            const globalNewIndex = currentOrder.indexOf(newKey);

            if (globalOldIndex !== -1 && globalNewIndex !== -1) {
                const newOrder = arrayMove(currentOrder, globalOldIndex, globalNewIndex);
                saveColumnOrder(newOrder);
            }
        }
    };

    return {
        orderedColumns,
        sensors,
        handleDragEnd,
    };
}
