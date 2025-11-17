"use client";

const statusEnum: Record<number, string> = {
    1: "Order Created",
    2: "Delivery Created",
    3: "Completed",
};

export default function OrderStatus({ status }: { status: number | string }) {
    if(typeof status === "string") {
        status = parseInt(status, 10);
    }
    const statusLabel = statusEnum[status] || "Unknown";
    const statusStyles: Record<number, { text: string; bg: string }> = {
        1: { text: '#0B65C3', bg: '#E6F0FF' }, // Order Created (blue)
        2: { text: '#92400E', bg: '#FFF7ED' }, // Delivery Created (amber)
        3: { text: '#027A48', bg: '#ECFDF3' }, // Completed (green)
    };

    const style = statusStyles[Number(status)] || { text: '#374151', bg: '#F3F4F6' };

    // Use inline styles for dynamic hex colors so Tailwind's purge doesn't
    // remove the classes. Keep the rest of the styling via Tailwind.
    const inline = { color: style.text, backgroundColor: style.bg } as React.CSSProperties;

    return (
        <span style={inline} className={`text-sm font-medium p-1 px-4 rounded-xl text-[12px]`}>
            {statusLabel}
        </span>
    );
}
