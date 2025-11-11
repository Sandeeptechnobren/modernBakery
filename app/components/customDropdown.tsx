import { Icon } from "@iconify-icon/react";

type dataType = {
    icon: string;
    label: string;
    iconWidth?: number;
    onClick?: () => void;
};

export default function CustomDropdown({
    data,
    children,
    mode = "light",
}: {
    data?: dataType[];
    children?: React.ReactNode;
    // light (default) or dark theme for dropdown
    mode?: "light" | "dark";
}) {
    const isDark = mode === "dark";
    const containerClass = isDark
        ? "rounded-[8px] border-[1px] border-transparent bg-[#0F1724] py-[6px] w-full overflow-auto h-full cursor-pointer"
        : "rounded-[8px] border-[1px] border-[#E9EAEB] bg-white py-[4px] w-full overflow-auto h-full cursor-pointer";
    const itemClass = isDark
        ? "px-[14px] py-[10px] flex items-center gap-[12px] hover:bg-[#0b1220]"
        : "px-[14px] py-[10px] flex items-center gap-[12px] hover:bg-[#FAFAFA]";
    const iconClass = isDark ? "text-[#9AA6B2]" : "text-[#717680]";
    const labelClass = isDark ? "text-white font-[500] text-[16px]" : "text-[#181D27] font-[500] text-[16px]";

    return (
        <div className={containerClass}>
            {children && children !== null && children}
            {data &&
                data.map((item: dataType, index: number) => (
                    <div key={index} className={itemClass} onClick={item.onClick}>
                        <Icon icon={item.icon} width={item.iconWidth || 24} className={iconClass} />
                        <span className={labelClass}>{item.label}</span>
                    </div>
                ))}
        </div>
    );
}
