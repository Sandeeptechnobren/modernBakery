import { Icon } from "@iconify-icon/react";
import { useState } from "react";

export default function SearchBar({
    placeholder = "Search here...",
    value,
    onChange,
    onEnterPress,
    icon = "iconamoon:search",
    iconWidth = 20,
}: {
    placeholder?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onEnterPress?: () => void;
    icon?: string;
    iconWidth?: number;
}) {
    const [showEnterBtn, setShowEnterBtn] = useState(false);
    return (
        <div className="relative text-[#717680] text-[14px]" tabIndex={-1}>
            <div className="absolute top-0 left-0 flex items-center h-full pl-[12px]">
                <Icon icon={icon} width={iconWidth} />
            </div>
            <input
                type="text"
                onKeyDown={(e) => e.key === "Enter" && onEnterPress && onEnterPress()}
                value={value}
                onChange={onChange}
                onFocus={() => setShowEnterBtn(true)} // Show Enter button on focus
                onBlur={() => setTimeout(() => setShowEnterBtn(false), 100)} // Hide Enter button after 0.2 seconds of no focus
                placeholder={placeholder}
                className="border border-gray-300 rounded-md p-2 w-full h-[36px] px-[12px] py-[8px] pl-[40px]"
            />
            {showEnterBtn && (
            <div className="flex absolute top-0 right-0 items-center h-full px-[12px] cursor-pointer" onClick={onEnterPress} >
                <Icon icon="lucide:send-horizontal" width={iconWidth} />
            </div>
            )}
        </div>
    );
}