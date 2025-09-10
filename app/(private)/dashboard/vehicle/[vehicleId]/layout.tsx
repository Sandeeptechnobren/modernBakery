"use client";

import BorderIconButton from "@/app/components/borderIconButton";
import ContainerCard from "@/app/components/containerCard";
import CustomDropdown from "@/app/components/customDropdown";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import StatusBtn from "@/app/components/statusBtn";
import { Icon } from "@iconify-icon/react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { tabs } from "./[tabName]/page";

const dropdownDataList = [
    { icon: "humbleicons:radio", label: "Inactive", iconWidth: 20 },
    { icon: "hugeicons:delete-02", label: "Delete", iconWidth: 20 },
];

export default function CustomerDetails({
    children,
}: {
    children: React.ReactNode;
}) {
    const [showDropdown, setShowDropdown] = useState(false);
    const { customerId } = useParams();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState(0);

    const onTabClick = (index: number) => {
        setActiveTab(index);
        router.replace(`/dashboard/customer/${customerId}/${tabs[index].url}`);
    };

    return (
        <>
            {/* header */}
            <div className="flex justify-between items-center mb-[20px]">
                <div className="flex items-center gap-[16px]">
                    <Icon
                        icon="lucide:arrow-left"
                        width={24}
                        onClick={() => router.back()}
                    />
                    <h1 className="text-[20px] font-semibold text-[#181D27] flex items-center leading-[30px] mb-[4px]">
                        Customer Details
                    </h1>
                </div>
                <div className="flex gap-[12px] relative">
                    <div className="gap-[12px] hidden sm:flex">
                        <BorderIconButton
                            icon="tabler:plus"
                            label="Add New Order"
                            labelTw="text-[12px] hidden md:block"
                        />
                        <BorderIconButton icon="mdi-light:message" />
                        <BorderIconButton icon="material-symbols-light:history-2" />
                    </div>
                    <BorderIconButton
                        icon="ic:sharp-more-vert"
                        onClick={() => setShowDropdown(!showDropdown)}
                    />

                    {showDropdown && (
                        <div className="w-[145px] absolute top-[40px] right-0 z-30">
                            <CustomDropdown data={dropdownDataList} />
                        </div>
                    )}
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
                            Abdul Retail Shop
                        </h2>
                        <span className="flex items-center">
                            <span className="text-[#414651] text-[16px]">
                                <span className="font-[600]">Owner:</span>{" "}
                                <span className="font-[400]">
                                    Musinguzi Abdul
                                </span>
                                <span className="flex justify-center p-[10px] sm:p-0 sm:inline-block mt-[10px] sm:mt-0 sm:ml-[10px]">
                                    <StatusBtn status="active" />
                                </span>
                            </span>
                        </span>
                    </div>
                </div>

                {/* contact button */}
                <SidebarBtn
                    isActive={true}
                    label="Send Email"
                    labelTw="text-[16px] font-semibold mb-[4px] sm:hidden md:flex"
                    leadingIcon="ic:outline-email"
                    leadingIconSize={20}
                />
            </ContainerCard>

            {/* tabs */}
            <ContainerCard
                className="w-full flex gap-[4px] overflow-x-auto"
                padding="5px"
            >
                {tabs.map((tab, index) => (
                    <TabBtn
                        key={index}
                        label={tab.name}
                        isActive={activeTab === index}
                        onClick={() => {
                            onTabClick(index);
                        }}
                    />
                ))}
            </ContainerCard>

            {children}
        </>
    );
}

function TabBtn({
    label,
    isActive,
    onClick,
}: {
    label: string;
    isActive: boolean;
    onClick: () => void;
}) {
    return (
        <button
            className={`${
                isActive ? "bg-[#FFF0F2] text-[#EA0A2A]" : "text-[#535862]"
            } text-[16px] font-semibold px-[16px] py-[10px] rounded-[8px] cursor-pointer whitespace-nowrap`}
            onClick={onClick}
        >
            {label}
        </button>
    );
}
