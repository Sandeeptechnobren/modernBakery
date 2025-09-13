"use client";

import { useParams, useRouter } from "next/navigation";
import Overview from "./overview";
import CustomerInfo from "./customerInfo";
import Balance from "./balance";
import Settings from "./settings";
import SalesSummary from "./salesSummary";
import CallHistory from "./callHistory";
import ContainerCard from "@/app/components/containerCard";
import { useEffect, useState } from "react";

export const tabs = [
    {
        name: "Overview",
        url: "overview",
        component: <Overview />,
    },
    {
        name: "Customer Info",
        url: "customer-info",
        component: <CustomerInfo />,
    },
    {
        name: "Balance",
        url: "balance",
        component: <Balance />,
    },
    {
        name: "Settings",
        url: "settings",
        component: <Settings />,
    },
    {
        name: "Sales Summary",
        url: "sales-summary",
        component: <SalesSummary />,
    },
    {
        name: "Call History",
        url: "call-history",
        component: <CallHistory />,
    },
];

export default function Page() {
    const { customerId, tabName } = useParams();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState(0);

    const onTabClick = (index: number) => {
        setActiveTab(index);
        router.replace(`/dashboard/master/customer/${customerId}/${tabs[index].url}`);
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
            {tabs.find((tab) => tab.url === tabName)?.component ||
                tabs[0].component}
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
