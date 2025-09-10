export default function KeyValueData({ title, data }: { title?: string; data: { key: string; value: string, component?: React.ReactNode }[] }) {
    return <>
        {title && <div className="text-[18px] font-semibold mb-[25px]">{title}</div>}
        <div className="space-y-[20px] text-[14px]">
            {data?.map((item, index) => (
                <div key={index} className="flex flex-col md:flex-row justify-between gap-x-[20px]">
                    <div className="text-[#535862] whitespace-nowrap">{item.key}</div>
                    <div className="text-[#181D27]">{item.value}{item?.component || ""}</div>
                </div>
            ))}
        </div>        
    </>;
}