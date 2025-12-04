"use client";

import KeyValueData from "@/app/components/keyValueData";
import ContainerCard from "@/app/components/containerCard";
import { useLoading } from "@/app/services/loadingContext";
import { getCustomerPointsDetails } from "@/app/services/loyaltyProgramApis";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import TabBtn from "@/app/components/tabBtn";
import Table, { TableDataType } from "@/app/components/customTable";
import { formatWithPattern } from "@/app/utils/formatDate";
import toInternationalNumber from "@/app/(private)/utils/formatNumber";

interface Item {
    id: string;
    uuid: string;
    osa_code: string;
    customer_code: string;
    customer_name: string;
    tier_code: string;
    tier_name: string;
    total_earning: string;
    total_spend: string;
    total_closing: string;
    details?: Array<{
        id: number;
        uuid: string;
        osa_code: string;
        activity_date: string;
        activity_type: string;
        invoice_ids?: number | null;
        documents?: Array<{
            id?: number;
            code?: string;
            date?: string;
            type?: string;
            description?: string | null;
        }>;
        adjustment_point?: number | null;
        incooming_point?: number;
        outgoing_point?: number;
        closing_point?: number;
    }>;
}

const title = "Customer Loyalty Points Details";
const backBtnUrl = "/customerLoyaltyPoints";

export default function ViewPage() {
    const pointsColumns = [
        { key: "osa_code", label: "Code", render: (row: TableDataType) => <span className="font-semibold text-[#181D27] text-[14px]">{(row as any).osa_code || "-"}</span> },
        { key: "activity_date", label: "Date", render: (row: TableDataType) => formatWithPattern(new Date((row as any).activity_date), "DD MMM YYYY", "en-GB") },
        { key: "activity_type", label: "Activity Type", render: (row: TableDataType) => ((row as any).activity_type || "-") },
        { key: "incooming_point", label: "Incoming Point", render: (row: TableDataType) => toInternationalNumber((row as any).incooming_point ?? "-") },
        { key: "outgoing_point", label: "Outgoing Point", render: (row: TableDataType) => toInternationalNumber((row as any).outgoing_point ?? "-") },
        { key: "adjustment_point", label: "Adjustment Point", render: (row: TableDataType) => toInternationalNumber((row as any).adjustment_point ?? "-") },
        { key: "document_code", label: "Invoice No.", render: (row: TableDataType) => (<span className="font-semibold text-[#181D27] text-[14px]">{(row as any).document_code || "-"}</span>) },
        { key: "document_date", label: "Invoice Date", render: (row: TableDataType) => formatWithPattern(new Date((row as any).document_date), "DD MMM YYYY", "en-GB") },
        { key: "closing_point", label: "Closing Point", render: (row: TableDataType) => toInternationalNumber((row as any).closing_point ?? "-") },
    ];

    const [activeTab, setActiveTab] = useState("overview");
    const tabList = [
        { key: "overview", label: "Overview" },
        { key: "invoice", label: "Invoice" },
    ];

    const onTabClick = (idx: number) => {
        if (typeof idx !== "number") return;
        if (idx < 0 || idx >= tabList.length) return;
        setActiveTab(tabList[idx].key);
    };
    const params = useParams();
    let uuid: string = "";
    if (params.uuid) {
        if (Array.isArray(params.uuid)) {
            uuid = params.uuid[0] || "";
        } else {
            uuid = params.uuid as string;
        }
    }

    const { showSnackbar } = useSnackbar();
    const { setLoading } = useLoading();
    const [item, setItem] = useState<Item | null>(null);

    const periodLabel = (val?: string | null) => {
        const map: Record<string, string> = {
            "1": "Monthly",
            "2": "Quarterly",
            "3": "Half Yearly",
            "4": "Yearly",
        };
        if (val === null || val === undefined || val === "") return "-";
        return map[String(val)] ?? String(val);
    };

    useEffect(() => {
        const fetchPlanogramImageDetails = async () => {
            setLoading(true);
            const res = await getCustomerPointsDetails(uuid);
            setLoading(false);
            if (res.error) {
                showSnackbar(
                    res.data.message || "Unable to fetch Route Details",
                    "error"
                );
                throw new Error("Unable to fetch Route Details");
            } else {
                setItem(res.data);
            }
        };
        fetchPlanogramImageDetails();
    }, []);

    return (
        <>
            <div className="flex items-center gap-4 mb-6">
                <Link href={backBtnUrl}>
                    <Icon icon="lucide:arrow-left" width={24} />
                </Link>
                <h1 className="text-xl font-semibold mb-1">{title}</h1>
            </div>

            {/* Tabs */}
            <ContainerCard className="w-full flex gap-[4px] overflow-x-auto" padding="5px">
                {tabList.map((tab, index) => (
                    <div key={index}>
                        <TabBtn label={tab.label} isActive={activeTab === tab.key} onClick={() => onTabClick(index)} />
                    </div>
                ))}
            </ContainerCard>

            {/* Tab content */}
            <div className="flex gap-x-[20px] mt-4">
                <div className="w-full">
                    {activeTab === "overview" && (
                        <ContainerCard className="w-auto h-fit">
                            <KeyValueData
                                data={[
                                    { key: "Code", value: item?.osa_code || "-" },
                                    {
                                        key: "Customer",
                                        value: `${item?.customer_code || ""} - ${item?.customer_name || ""}`,
                                    },
                                    {
                                        key: "Tier",
                                        value: `${item?.tier_code || ""} - ${item?.tier_name || ""}`,
                                    },
                                    { key: "Total Earning", value: toInternationalNumber(item?.total_earning || "-") },
                                    { key: "Total Spend", value: toInternationalNumber(item?.total_spend || "-") },
                                    { key: "Total Closing", value: toInternationalNumber(item?.total_closing || "-") },
                                ]}
                            />
                        </ContainerCard>
                    )}

                    {activeTab === "invoice" && (
                        // <ContainerCard className="w-full">
                        <div className="flex flex-col h-full">
                            <Table
                                config={{

                                    footer: { nextPrevBtn: true, pagination: true },
                                    columns: pointsColumns,
                                    showNestedLoading: true,
                                    rowSelection: false,
                                    pageSize: 50,
                                }}

                                data={(item?.details || []).map(d => ({
                                    osa_code: d.osa_code ?? "",
                                    activity_date: d.activity_date ?? "",
                                    activity_type: d.activity_type ?? "",
                                    document_code: Array.isArray(d.documents) && d.documents[0]?.code ? String(d.documents[0].code) : "",
                                    document_date: Array.isArray(d.documents) && d.documents[0]?.date ? new Date(d.documents[0].date).toLocaleDateString('en-GB') : "",
                                    incooming_point: String(d.incooming_point ?? ""),
                                    outgoing_point: String(d.outgoing_point ?? ""),
                                    closing_point: String(d.closing_point ?? ""),
                                    adjustment_point: d.adjustment_point === null || typeof d.adjustment_point === 'undefined' ? "" : String(d.adjustment_point),
                                }))}
                            />
                        </div>
                        // </ContainerCard>
                    )}
                </div>
            </div>
        </>
    );
}
