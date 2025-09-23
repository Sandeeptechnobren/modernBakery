import { Icon } from "@iconify-icon/react";

export default function BorderIconButton({
  icon,
  iconWidth = 18,
  trailingIcon,
  trailingIconSize = 18,
  label,
  labelTw,
  onClick,
  disabled = false,
}: {
  icon?: string;
  iconWidth?: number;
  trailingIcon?: string;
  trailingIconSize?: number;
  label?: string;
  labelTw?: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <div
      className={`bg-white h-[34px] border-[1px] border-[#D5D7DA] px-[10px] py-[8px] rounded-[8px] flex justify-center items-center gap-[8px] cursor-pointer ${disabled ? "pointer-events-none opacity-50" : ""}`}
      onClick={onClick}
    >
      {icon && <Icon icon={icon} width={iconWidth} />}
      {label && (
        <span className={labelTw || `hidden sm:inline text-[12px]`}>
          {label}
        </span>
      )}
      {trailingIcon && <Icon icon={trailingIcon} width={trailingIconSize} />}
    </div>
  );
}
