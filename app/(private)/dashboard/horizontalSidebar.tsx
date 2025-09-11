import { Icon } from "@iconify-icon/react";
import Link from "next/link";

export default function HorizontalSidebar() {
    return (
        <>
            <div className="w-full h-[44px] bg-white border-b-[1px] border-[#E9EAEB] flex items-center px-[16px] py-[12px] gap-[32px] overflow-x-auto overflow-y-hidden">
                <Link href="/dashboard" className="text-[#414651] flex items-center gap-[4px] justify-between">
                    <div className="flex items-center gap-[8px] whitespace-nowrap">
                        <Icon icon="hugeicons:home-01" width={20} />
                        <span>Dashboard</span>
                    </div>
                </Link>
                <Link href="/dashboard/company" className="text-[#414651] flex items-center gap-[4px] justify-between">
                    <div className="flex items-center gap-[8px] whitespace-nowrap">
                        <Icon icon="lucide:user" width={20} />
                        <span>Company</span>
                    </div>
                </Link>
                <Link href="/dashboard/masters" className="text-[#414651] flex items-center gap-[4px] justify-between">
                    <div className="flex items-center gap-[8px] whitespace-nowrap">
                        <Icon icon="hugeicons:workflow-square-06" width={20} />
                        <span>Masters</span>
                    </div>
                    <Icon
                        icon="mdi-light:chevron-right"
                        width={18}
                        className="rotate-90"
                    />
                </Link>
                
                <Link href="/dashboard/report" className="text-[#414651] flex items-center gap-[4px] justify-between">
                    <div className="flex items-center gap-[8px] whitespace-nowrap">
                        <Icon icon="tabler:file-text" width={20} />
                        <span>Report</span>
                    </div>
                    <Icon
                        icon="mdi-light:chevron-right"
                        width={18}
                        className="rotate-90"
                    />
                </Link>
                <Link href="/dashboard/agentTransaction" className="text-[#414651] flex items-center gap-[4px] justify-between">
                    <div className="flex items-center gap-[8px] whitespace-nowrap">
                        <Icon icon="mingcute:bill-line" width={20} />
                        <span>Agent Transaction</span>
                    </div>
                </Link>
                <Link href="/dashboard/harissTransaction" className="text-[#414651] flex items-center gap-[4px] justify-between">
                    <div className="flex items-center gap-[8px] whitespace-nowrap">
                        <Icon icon="hugeicons:transaction" width={20} />
                        <span>Hariss Transaction</span>
                    </div>
                </Link>
            </div>
        </>
    );
}
