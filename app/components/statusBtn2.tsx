"use client";

export default function StatusBtn({ isActive }: { isActive: boolean }) {
    return isActive ? (
        <span className="text-sm text-[#027A48] bg-[#ECFDF3] font-[500] p-1 px-4 rounded-xl text-[12px]">
            Active
        </span>
    ) : (
        <span className="text-sm text-red-700 bg-red-200 p-1 px-4 rounded-xl text-[12px]">
            Inactive
        </span>
    );
}
