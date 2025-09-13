import { Icon } from "@iconify-icon/react";

export default function SearchBar({
    placeholder = "Search here...",
    value,
    onChange,
    icon = "iconamoon:search",
    iconWidth = 20,
}: {
    placeholder?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    icon?: string;
    iconWidth?: number;
}) {
    return (
        <div className="relative text-[#717680] text-[14px]">
            <div className="absolute top-0 left-0 flex items-center h-full pl-[12px]">
                <Icon icon={icon} width={iconWidth} />
            </div>
            <input
                type="text"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="border border-gray-300 rounded-md p-2 w-full h-[36px] px-[12px] py-[8px] pl-[40px]"
            />
        </div>
    );
}