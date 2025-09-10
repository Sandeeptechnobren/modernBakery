"use client";

import { Icon } from "@iconify-icon/react";
import Link from "next/link";

export default function AddCustomer() {

    return (
        <>
            {/* header */}
            <div className="flex justify-between items-center mb-[20px]">
                <div className="flex items-center gap-[16px]">
                    <Link href="/dashboard/customer">
                        <Icon icon="lucide:arrow-left" width={24} />
                    </Link>
                    <h1 className="text-[20px] font-semibold text-[#181D27] flex items-center leading-[30px] mb-[5px]">
                        Add New Customer
                    </h1>
                </div>
            </div>

            {/* content */}
            <div></div>
        </>
    );
}
