export default function TabBtn({
    label,
    isActive,
    onClick,
}: {
    label: string;
    isActive: boolean;
    onClick: () => void;
}) {
    return (
        <button
            className={`${
                isActive ? "bg-[var(--secondary-btn-color)] text-[var(--secondary-btn-text-color)]" : "text-[#535862]"
            } w-full text-[16px] font-semibold px-[16px] py-[10px] rounded-[8px] cursor-pointer whitespace-nowrap`}
            onClick={onClick}
        >
            {label}
        </button>
    );
}