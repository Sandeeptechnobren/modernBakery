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

    return (
        <span className="text-sm text-[#027A48] bg-[#ECFDF3] font-[500] p-1 px-4 rounded-xl text-[12px]">
            {statusLabel}
        </span>
    );
}
