"use client";

export const statusStyles: Record<string, { text: string; bg: string }> = {
    "PENDING": { text: '#0B65C3', bg: '#E6F0FF' },
    "APPROVE": { text: '#92400E', bg: '#FFF7ED' },
    // include common synonym
    "APPROVED": { text: '#92400E', bg: '#FFF7ED' },
    "REJECTED": { text: '#C62828', bg: '#FCE4E4' },
    // "REJECTED": { text: '#E1465A', bg: '#FFF0F3' },
};

function formatStatusText(status: string): string {
    return status
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

export default function ApprovalStatus({ status }: { status: number | string }) {
    const key = String(status ?? '').toUpperCase().trim();
    const style = statusStyles[key] || { text: '#374151', bg: '#F3F4F6' };
    const inline = { color: style.text, backgroundColor: style.bg } as React.CSSProperties;

    return (
        <span style={inline} className={`text-sm font-medium p-1 px-4 rounded-xl text-[12px] uppercase`}>
            {formatStatusText(String(status))}
        </span>
    );
}
