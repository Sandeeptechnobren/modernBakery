import { Icon } from "@iconify-icon/react";

export default function IconButton({ icon, notification, width, onClick ,bgClass = "bg-[#F5F5F5]", className}: { icon: string; notification?: boolean; width?: number;bgClass?: string;className?: string; onClick?: () => void })
 {
    const defaultClasses =
    `relative w-[32px] h-[32px] p-[7px] rounded-[8px] text-[#252B37] flex justify-center items-center cursor-pointer ${bgClass}`;
    return (
        <>
            <span 
            className={className ? className : defaultClasses}
            // className={`relative w-[32px] h-[32px] p-[7px] rounded-[8px] text-[#252B37] flex justify-center items-center cursor-pointer ${bgClass}`} 
            onClick={onClick}
            >
                <Icon icon={icon} width={width || 18} />
                {notification && <span className="absolute -top-[1px] -right-[1px] w-[7px] h-[7px] bg-[#EA0A2A] rounded-full"></span>}
            </span>
        </>
    );
}
