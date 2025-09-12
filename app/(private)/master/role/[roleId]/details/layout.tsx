"use client";

import ContainerCard from "@/app/components/containerCard";
import { Icon } from "@iconify-icon/react";
import { useRouter } from "next/navigation";
import Table from "./table";


export default function CustomerDetails() {
    const router = useRouter();

    return (
        <>
            <div className="flex justify-between items-center mb-[20px]">
                <div className="flex items-center gap-[16px]">
                    <Icon
                        icon="lucide:arrow-left"
                        width={24}
                        onClick={() => router.back()}
                    />
                    <h1 className="text-[20px] font-semibold text-[#181D27] flex items-center leading-[30px] mb-[4px]">
                        User Role Assignment
                    </h1>
                </div>
               
            </div>

            <ContainerCard className="w-full flex flex-col sm:flex-row items-center justify-between gap-[10px] md:gap-0">
                {/* profile details */}
                <div className="flex flex-col sm:flex-row items-center gap-[20px]">
                    <div className="w-[80px] h-[80px] flex justify-center items-center rounded-full bg-[#E9EAEB]">
                        <Icon
                            icon="gridicons:user"
                            width={40}
                            className="text-[#535862] scale-[1.5]"
                        />
                    </div>
                    <div className="text-center sm:text-left">
                        <h2 className="text-[20px] font-semibold text-[#181D27] mb-[10px]">
                            ORG-Admin
                        </h2>
                        <p className="text-[16px] text-[#535862]">Supervisor</p>
                    </div>
                </div>
            </ContainerCard>
                <Table/>
        </>
    );
}


