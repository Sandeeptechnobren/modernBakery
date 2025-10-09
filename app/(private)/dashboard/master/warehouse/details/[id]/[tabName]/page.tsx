"use client";

import { useParams, useRouter } from "next/navigation";
import Overview from "./overview";
import CustomerInfo from "./warehouseInfo";
import ContainerCard from "@/app/components/containerCard";
import { useEffect, useState } from "react";
import TabBtn from "@/app/components/tabBtn";

export const tabs = [
    {
        name: "Overview",
        url: "overview",
        component: <Overview />,
    },
    {
        name: "Warehouse Info",
        url: "warehouse-info",
        component: <CustomerInfo />,
    },
   
];

export default function WarehouseTabs() {
    const { id, tabName } = useParams();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState(0);

    const onTabClick = (index: number) => {
        setActiveTab(index);
        router.replace(
            `/dashboard/master/warehouse/details/${id}/${tabs[index].url}`
        );
    };

    useEffect(() => {
        setActiveTab(tabs.findIndex((tab) => tab.url === tabName));
    }, [tabName]);

    return (
        <>
            {/* tabs */}
            <ContainerCard
                className="w-full flex gap-[4px] overflow-x-auto"
                padding="5px"
            >
                {tabs.map((tab, index) => (
                    <div key={index}>
                        <TabBtn
                            label={tab.name}
                            isActive={activeTab === index}
                            onClick={() => {
                                onTabClick(index);
                            }}
                        />
                    </div>
                ))}
            </ContainerCard>
            {tabs.find((tab) => tab.url === tabName)?.component ||
                tabs[0].component}
        </>
    );
}
