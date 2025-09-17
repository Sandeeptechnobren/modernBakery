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
  type, // can be 'button' | 'link' | 'submit'
}: {
  isActive?: boolean;
  className?: string;
  href?: string;
  // accept click handlers for both anchor and button elements
  onClick?: React.MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;
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
  type?: "button" | "link" | "submit";
}) {
  const className = `p-2 h-10 rounded-lg px-3 py-2 flex items-center gap-[12px] justify-between ${
    isActive
      ? "bg-[var(--primary-btn-color)] text-white"
      : "bg-transparent text-[#414651] hover:bg-[var(--secondary-btn-color)] hover:text-[var(--secondary-btn-text-color)]"
  }`;

  const content = (
    <>
      <div className={`flex items-center ${isSubmenu ? "gap-[8px]" : "gap-[12px]"}`}>
        {leadingIcon && (
          <Icon
            icon={leadingIcon}
            width={leadingIconSize}
            className={`${leadingIconTw ? leadingIconTw : ""} ${isSubmenu ? "" : ""}`}
          />
        )}
        {children ? children : <span className={labelTw}>{label}</span>}
      </div>
      {trailingIcon && (
        <Icon icon={trailingIcon} width={trailingIconSize} className={trailingIconTw} />
      )}
    </>
  );

  if (type === "submit" || type === "button") {
    return (
      <button type={type} onClick={onClick as React.MouseEventHandler<HTMLButtonElement>} className={className}>
        {content}
      </button>
    );
  }

  // default: render a Link
  return (
    <Link href={href} onClick={onClick as React.MouseEventHandler<HTMLAnchorElement>} className={className}>
      {content}
    </Link>
  );
}
