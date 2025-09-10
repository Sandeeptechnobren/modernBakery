import { Icon, IconifyIcon } from "@iconify-icon/react";
import Link from "next/link";

export default function SidebarBtn1({
    isActive = false,
    href = "",
    className = "",
    btnTw = "",
    onClick,
    label,
    labelTw,
    leadingIcon,
    leadingIconSize = 24,
    leadingIconTw,
    trailingIcon,
    trailingIconSize = 24,
    trailingIconTw,
    children,
}: {
    isActive?: boolean;
    className?: string;
    btnTw?: string;
    href?: string;
    onClick?: React.MouseEventHandler<HTMLAnchorElement>;
    label?: string;
    labelTw?: string;
    leadingIcon?: IconifyIcon | string;
    leadingIconSize?: number;
    leadingIconTw?: string;
    trailingIcon?: IconifyIcon | string;
    trailingIconSize?: number;
    trailingIconTw?: string;
    children?: React.ReactNode;
}) {
    return (
        <>
            <Link
                href={href}
                onClick={onClick}
                className={`${ btnTw || "h-[32px] px-3 py-2"} rounded-lg flex items-center gap-[12px] justify-between ${
                    isActive
                        ? "bg-[#285295] text-white"
                        : "bg-transparent text-[#C2CBDE] hover:bg-[#536893] hover:text-white"
                }`}
            >
                <div className="flex items-center gap-[12px]">
                    {leadingIcon && (
                        <Icon
                            icon={leadingIcon}
                            width={leadingIconSize}
                            className={leadingIconTw}
                        />
                    )}
                    <span className={labelTw}>{label}</span>
                </div>
                {trailingIcon && (
                    <Icon
                        icon={trailingIcon}
                        width={trailingIconSize}
                        className={trailingIconTw}
                    />
                )}
            </Link>
            {
                children && <div className={className}>
                    {children}
                </div>
            }
        </>
    );
}
