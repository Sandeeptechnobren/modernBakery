import { Icon } from "@iconify-icon/react";

export default function BorderIconButton({
    icon,
    iconWidth = 18,
    trailingIcon,
    trailingIconSize = 18,
    label,
    labelTw,
    onClick
}: {
    icon?: string;
    iconWidth?: number;
    trailingIcon?: string;
    trailingIconSize?: number;
    label?: string;
    labelTw?: string;
    onClick?: () => void;
}) {
    return (
        <>
            <div className="bg-white h-[34px] border-[1px] border-[#D5D7DA] px-[10px] py-[8px] rounded-[8px] flex justify-center items-center gap-[8px] cursor-pointer" onClick={onClick}>
                {icon && <Icon icon={icon} width={iconWidth} />}
                {label && (
                    <span className={labelTw || `text-[12px]`}>{label}</span>
                )}
                {trailingIcon && (
                    <Icon icon={trailingIcon} width={trailingIconSize} />
                )}
            </div>
        </>
    );
}
