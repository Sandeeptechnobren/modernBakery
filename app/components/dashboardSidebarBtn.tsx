import { Icon, IconifyIcon } from "@iconify-icon/react";
import Link from "next/link";

export default function SidebarBtn({
    isActive = false,
    href = "",
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
    isSubmenu = false,
}: {
    isActive?: boolean;
    className?: string;
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
    isSubmenu?: boolean;
}) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={`p-2 h-10 rounded-lg px-3 py-2 flex items-center gap-[12px] justify-between ${isActive ? "bg-[var(--primary-btn-color)] text-white" : "bg-transparent text-[#414651] hover:bg-[var(--secondary-btn-color)] hover:text-[var(--text-secondary-color)]"}`}
        >
            <div className={`flex items-center ${isSubmenu ? "gap-[8px]" : "gap-[12px]"}`}>
                {leadingIcon && <Icon icon={leadingIcon} width={leadingIconSize} className={`${leadingIconTw ? leadingIconTw : ""} ${isSubmenu ? "" : ""}`} />}
                {children ? children : <span className={labelTw}>{label}</span>}
            </div>
            {trailingIcon && <Icon icon={trailingIcon} width={trailingIconSize} className={trailingIconTw} />}
        </Link>
    );
}
