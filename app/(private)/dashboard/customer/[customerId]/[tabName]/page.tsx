"use client";

import { useParams } from "next/navigation";
import Overview from "./overview";
import CustomerInfo from "./customerInfo";
import Balance from "./balance";
import Settings from "./settings";
import SalesSummary from "./salesSummary";
import CallHistory from "./callHistory";

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
    const { tabName } = useParams();

    return (
        <>
            {tabs.find((tab) => tab.url === tabName)?.component || tabs[0].component}
        </>
    );
}
