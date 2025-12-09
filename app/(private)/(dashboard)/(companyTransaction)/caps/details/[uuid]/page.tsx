"use client";

import ContainerCard from "@/app/components/containerCard";
import Table, { TableDataType } from "@/app/components/customTable";
import Logo from "@/app/components/logo";
import { Icon } from "@iconify-icon/react";
import { useParams, useRouter } from "next/navigation";
import { RefObject, useEffect, useRef, useState } from "react";
// import KeyValueData from "../master/customer/[customerId]/keyValueData";
import { formatWithPattern } from "@/app/(private)/utils/date";
import BorderIconButton from "@/app/components/borderIconButton";
import PrintButton from "@/app/components/printButton";
import { capsByUUID, purchaseOrderById, exportCapsViewPdf } from "@/app/services/companyTransaction";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { isValidDate } from "@/app/utils/formatDate";
import { downloadFile } from "@/app/services/allApi";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";

const columns = [
    { key: "index", label: "#" },
    { key: "item_name", label: "Item Name", render: (value: TableDataType) => <>{value.item_code ? `${value.item_code}` : ""} {value.item_code && value.item_name ? " - " : ""} {value.item_name ? value.item_name : ""}</> },
    { key: "uom_name", label: "UOM" },
    { key: "quantity", label: "Collected Quantity" },
];

interface CapsDetail {
    id: number,
    uuid: string,
    osa_code: string,
    warehouse_id: number,
    warehouse_code: string,
    warehouse_name: string,
    warehouse_email: string,
    driver_id: number,
    driver_code: string,
    driver_name: string,
    salesman_id: number,
    truck_no: string,
    contact_no: number,
    claim_no: string,
    claim_date: string,
    claim_amount: number,
    details: [
        {
            id: number,
            uuid: string,
            osa_code: string,
            item_id: number,
            item_code: string,
            item_name: string,
            uom_id: number,
            uom_name: string,
            uom_type: string,
            quantity: string,
            receive_qty: string,
            receive_amount: string,
            receive_date: string,
            remarks: string,
            remarks2: string,
            status: number
        }
    ]
}

export default function CapsDetailPage() {
    const router = useRouter();
    const { setLoading } = useLoading();
    const { showSnackbar } = useSnackbar();
    const [data, setData] = useState<CapsDetail | null>(null);
    const [loading, setLoadingState] = useState<boolean>(false);
    const params = useParams();
    const UUID = Array.isArray(params.uuid) ? params.uuid[0] : params.uuid ?? "";
    const CURRENCY = localStorage.getItem("country") || "";
    const PATH = `/caps/details/`;

    const fetchOrder = async () => {
        setLoading(true);
        const listRes = await capsByUUID(UUID);
        if (listRes.error) {
            showSnackbar(listRes.error.message || "Failed to fetch Caps Collection details", "error");
            setLoading(false);
            throw new Error(listRes.error.message);
        } else {
            setData(listRes.data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchOrder();
    }, [UUID]);

    const exportFile = async () => {
        try {
            setLoadingState(true);
            const response = await exportCapsViewPdf({
                uuid: UUID,
                format: "pdf",
            });
            if (response && typeof response === "object" && response.download_url) {
                await downloadFile(response.download_url);
                showSnackbar("File downloaded successfully ", "success");
            } else {
                showSnackbar("Failed to get download URL", "error");
            }
        } catch (error) {
            showSnackbar("Failed to download warehouse data", "error");
        } finally {
            setLoadingState(false);
        }
    };

    const targetRef = useRef<HTMLDivElement | null>(null);

    return (
        <>
            {/* ---------- Header ---------- */}
            <div className="flex justify-between items-center mb-[20px]">
                {/* <div className="flex items-center gap-[16px]">
                    <Icon
                        icon="lucide:arrow-left"
                        width={24}
                        onClick={() => router.push("/caps")}
                        className="cursor-pointer"
                    />
                    <h1 className="text-[20px] font-semibold text-[#181D27] flex items-center leading-[30px]">
                        Caps Collection #{data?.order_code || "-"}
                    </h1>
                    <BorderIconButton disabled={!data?.previous_uuid} onClick={data?.previous_uuid ? () => router.push(`${PATH}${data.previous_uuid}`) : undefined} icon="lucide:chevron-left" label={"Prev"} labelTw="font-medium text-[12px]" className="!h-[30px] !gap-[3px] !px-[5px] !pr-[10px]" />
                    <BorderIconButton disabled={!data?.next_uuid} onClick={data?.next_uuid ? () => router.push(`${PATH}${data.next_uuid}`) : undefined} trailingIcon="lucide:chevron-right" label={"Next"} labelTw="font-medium text-[12px]" className="!h-[30px] !gap-[3px] !px-[5px] !pl-[10px]" />
                </div> */}

                {/* Action Buttons */}
                <div className="flex gap-[12px] relative">
                </div>
            </div>

            <div ref={targetRef}>
                <ContainerCard className="rounded-[10px] space-y-[40px]">
                    <div className="flex justify-between flex-wrap gap-[20px]">
                        <div className="flex flex-col gap-[10px]">
                            <Logo type="full" />
                        </div>

                        <div className="flex flex-col items-end">
                            <span className="text-[42px] uppercase text-[#A4A7AE] mb-[10px]">Caps Collection</span>
                            {/* <span className="text-primary text-[14px] tracking-[8px]">#{data?.order_code || "-"}</span> */}
                        </div>
                    </div>

                    <hr className="text-[#D5D7DA]" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 md:gap-x-8 items-start">
                        {/* From (Seller) */}
                        <div>
                            <div className="flex flex-col space-y-[12px] text-primary-bold text-[14px] border-b md:border-b-0 pb-4 md:pb-0">
                                <span>Seller</span>
                                <div className="flex flex-col space-y-[10px]">
                                    <span className="font-semibold">{data?.warehouse_name && data?.warehouse_code ? `${data?.warehouse_code} - ${data?.warehouse_name}` : "-"}</span>
                                    {/* <span>{data?.warehouse_town && ` ${data?.warehouse_town}`}</span>
                                    <span>
                                        {data?.warehouse_district && `Phone: ${data?.warehouse_district}`} <br /> {data?.warehouse_contact && `Email: ${data?.warehouse_contact}`}
                                    </span> */}
                                </div>
                            </div>
                        </div>

                        {/* To (Customer) */}
                        <div>
                            <div className="flex flex-col space-y-[12px] text-primary-bold text-[14px]">
                                {/* <span>Buyer</span>
                                <div className="flex flex-col space-y-[10px]">
                                    <span className="font-semibold">{data?.salesman_code && data?.salesman_name ? `${data?.salesman_code} - ${data?.salesman_name}` : "-"}</span>
                                </div> */}
                            </div>
                        </div>

                        {/* Dates / meta - right column */}
                        <div className="flex md:justify-end">
                            <div className="text-primary-bold text-[14px] md:text-right">
                                {(data?.driver_code || data?.driver_name) && <div>
                                    Driver: <span className="font-bold">{data?.driver_code ? data?.driver_code : ""} {data?.driver_code && data?.driver_name && " - "} {data?.driver_name ? data?.driver_name : ""}</span>
                                </div>}
                                {data?.truck_no && <div className="mt-2">
                                    Truck: <span className="font-bold">{data?.truck_no || ""}</span>
                                </div>}
                                {data?.claim_date && isValidDate(new Date(data?.claim_date)) && <div className="mt-2">
                                    Claim Date: <span className="font-bold">{formatWithPattern(new Date(data?.claim_date), "DD MMM YYYY", "en-GB").toLowerCase() || ""}</span>
                                </div>}
                            </div>
                        </div>
                    </div>

                    {/* ---------- Order Table ---------- */}
                    <Table
                        data={(data?.details || []).map((row, index) => {
                            const mappedRow: Record<string, string> = { index: String(index + 1) };
                            Object.keys(row).forEach((key) => {
                                const value = (row as any)[key];
                                mappedRow[key] = value === null || value === undefined ? "" : String(value);
                            });
                            return mappedRow;
                        })}
                        config={{
                            columns: columns,
                        }}
                    />

                    {/* ---------- Footer Buttons ---------- */}
                    <div className="flex flex-wrap justify-end gap-[20px] print:hidden">
                        <SidebarBtn
                            leadingIcon={loading ? "eos-icons:three-dots-loading" : "lucide:download"}
                            leadingIconSize={20}
                            label="Download"
                            onClick={exportFile}
                        />
                        <PrintButton targetRef={targetRef as unknown as RefObject<HTMLElement>} />
                    </div>
                </ContainerCard>
            </div>
        </>
    );
}