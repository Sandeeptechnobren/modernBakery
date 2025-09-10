import { Icon } from "@iconify-icon/react/dist/iconify.mjs";

export default function StatusBtn({ status }: { status: string }) {
    return status === "active" ? (
        <>
            <span className="text-[#027A48] font-[500] rounded-[16px] bg-[#ECFDF3] border-[1px] border-[#A6F4C5] flex items-center px-[10px] gap-[6px] w-fit">
                <Icon
                    icon={"icon-park-outline:dot"}
                    width={12}
                    className="text-[#12B76A]"
                />
                <span className="text-[14px] mb-[3px]">Active</span>
            </span>
        </>
    ) : (
        <>
            <span className="text-[#7a4a02] font-[500] rounded-[16px] bg-[#fdefec] border-[1px] border-[#f4d1a6] flex items-center px-[10px] gap-[6px] w-fit">
                <Icon
                    icon={"icon-park-outline:dot"}
                    width={8}
                    className="text-[#b77212]"
                />
                <span className="text-[14px] mb-[3px]">Inactive</span>
            </span>
        </>
    );
}
