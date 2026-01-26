// Simple helper to calculate dropdown direction
export function shouldOpenUpward(element: HTMLElement | null, dropdownHeight: number = 400): boolean {
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    return spaceBelow < dropdownHeight && spaceAbove > spaceBelow;
}
