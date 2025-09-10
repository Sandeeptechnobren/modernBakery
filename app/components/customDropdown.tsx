import { Icon } from "@iconify-icon/react";

type dataType = {
    icon: string;
    label: string;
    iconWidth: number;
};

export default function CustomDropdown({
    data,
    children,
}: {
    data?: dataType[];
    children?: React.ReactNode;
}) {
    return (
        <div
            className={`rounded-[8px] border-[1px] border-[#E9EAEB] bg-white py-[4px] w-full`}
        >
            {children && children}
            {data &&
                data.map((item: dataType, index: number) => (
                    <div
                        key={index}
                        className="px-[14px] py-[10px] flex items-center gap-[8px] hover:bg-[#FAFAFA]"
                    >
                        <Icon
                            icon={item.icon}
                            width={item.iconWidth}
                            className="text-[#717680]"
                        />
                        <span className="text-[#181D27] font-[500] text-[16px]">
                            {item.label}
                        </span>
                    </div>
                ))}
        </div>
    );
}
