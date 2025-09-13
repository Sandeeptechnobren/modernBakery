import { Icon } from "@iconify-icon/react/dist/iconify.mjs";

export default function KeyValueData({ title, data }: { title?: string; data: {  icon?: string; key: string | React.ReactNode; value: string | React.ReactNode, component?: React.ReactNode; }[] }) {
    return <>
        {title && <div className="text-[18px] font-semibold mb-[25px]">{title}</div>}
        <div className="space-y-[20px] text-[14px]">
            {data?.map((item, index) => (
                <div key={index} className="flex flex-col sm:flex-row justify-between gap-x-[20px]">
                    <div className="text-[#535862] whitespace-nowrap flex items-center gap-[8px]">
                        { item?.icon && <Icon icon={item?.icon || ""} width={18} />}
                        <span>{ item.key }</span>
                    </div>
                    <div className="text-[#181D27] mb-[3px]">{item.value}{item?.component || ""}</div>
                </div>
            ))}
        </div>        
    </>;
}