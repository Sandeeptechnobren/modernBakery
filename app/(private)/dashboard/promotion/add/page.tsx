"use client";

import ContainerCard from "@/app/components/containerCard";
import TabBtn from "@/app/components/tabBtn";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import SelectKeyCombination from "./selectKeyCombination";
import KeyValue from "./keyValue";
import Promotion from "./promotion";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";

const tabs = [
    {
        label: "Select Key Combination",
        component: <SelectKeyCombination />,
    },
    {
        label: "Key Value",
        component: <KeyValue />,
    },
    {
        label: "Promotion",
        component: <Promotion />,
    },
];

export default function AddPromotion() {
    const [activeTab, setActiveTab] = useState(0);
    function handleSubmit() {
        alert("Submitted");
    }

    return (
        <>
            <div className="flex justify-between items-center mb-[20px]">
                <div className="flex items-center gap-[16px]">
                    <Link href="/dashboard/company">
                        <Icon icon="lucide:arrow-left" width={24} />
                    </Link>
                    <h1 className="text-[20px] font-semibold text-[#181D27] flex items-center leading-[30px] mb-[5px]">
                        Add New Company
                    </h1>
                </div>
            </div>
            <ContainerCard className="w-full lg:w-[800px] m-auto">
                <ContainerCard
                    className="hidden sm:flex justify-around gap-[4px] overflow-x-auto m-auto"
                    padding="5px"
                >
                    {tabs.map((tab, index) => (
                        <TabBtn
                            key={index}
                            label={tab.label}
                            isActive={activeTab === index}
                            onClick={() => {
                                setActiveTab(index);
                            }}
                        />
                    ))}
                </ContainerCard>

                {tabs[activeTab].component}

                <div className="flex justify-between">
                    <div></div>
                    <div className="flex gap-[8px] justify-between">
                        {activeTab > 0 && (
                            <SidebarBtn
                                isActive={false}
                                label="Back"
                                labelTw="px-[20px]"
                                onClick={() => {
                                    setActiveTab(activeTab - 1);
                                }}
                            />
                        )}
                        {activeTab < tabs.length && (
                            <SidebarBtn
                                isActive={true}
                                label={
                                    activeTab === tabs.length - 1
                                        ? "Submit"
                                        : "Next"
                                }
                                labelTw="px-[20px]"
                                onClick={() => {
                                    if (activeTab === tabs.length - 1)
                                        handleSubmit();
                                    else setActiveTab(activeTab + 1);
                                }}
                            />
                        )}
                    </div>
                </div>
            </ContainerCard>
        </>
    );
}
