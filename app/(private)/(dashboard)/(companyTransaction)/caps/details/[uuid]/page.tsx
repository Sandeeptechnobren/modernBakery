"use client";

import ContainerCard from "@/app/components/containerCard";
import Table, { TableDataType } from "@/app/components/customTable";
import Logo from "@/app/components/logo";
import { Icon } from "@iconify-icon/react";
import { useParams, useRouter } from "next/navigation";
import { RefObject, useEffect, useRef, useState } from "react";
// import KeyValueData from "../master/customer/[customerId]/keyValueData";
import { formatWithPattern } from "@/app/(private)/utils/date";
import InputFields from "@/app/components/inputFields";
import PrintButton from "@/app/components/printButton";
import { capsByUUID, purchaseOrderById, exportCapsViewPdf, capsUpdate } from "@/app/services/companyTransaction";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { isValidDate } from "@/app/utils/formatDate";
import { downloadFile } from "@/app/services/allApi";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import WorkflowApprovalActions from "@/app/components/workflowApprovalActions";
import toInternationalNumber from "@/app/(private)/utils/formatNumber";

const baseColumns = [
    { key: "index", label: "#" },
    { key: "item_name", label: "Item Name", render: (value: TableDataType) => <>{value.item_code ? `${value.item_code}` : ""} {value.item_code && value.item_name ? " - " : ""} {value.item_name ? value.item_name : ""}</> },
    { key: "uom_name", label: "UOM" },
    { key: "quantity", label: "Quantity", render: (value: TableDataType) => <>{value.quantity ? toInternationalNumber(value.quantity, {minimumFractionDigits: 0}) : "0"}</> },
    { key: "receive_qty", label: "Collected Quantity", render: (value: TableDataType) => <>{value.receive_qty ? toInternationalNumber(value.receive_qty, {minimumFractionDigits: 0}) : "0"}</> },
    // { key: "receive_amount", label: "Received Amount",render:(value: TableDataType) => <>{value.receive_amount ? parseFloat(value.receive_amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}</> },
    { key: "remarks", label: "Remarks" },
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
    request_step_id: number,
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
    const [isEditApproveMode, setIsEditApproveMode] = useState(false);
    // Keep edited values aligned with details order (array)
    const [editValues, setEditValues] = useState<Array<{ receive_qty: string; remarks: string }>>([]);
    const params = useParams();
    const UUID = Array.isArray(params.uuid) ? params.uuid[0] : params.uuid ?? "";
    const CURRENCY = localStorage.getItem("country") || "";
    const PATH = `/caps/details/`;
    const backBtnUrl = "/caps";

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

    // Initialize editable values whenever details load.
    useEffect(() => {
        if (!data?.details) return;
        const next: Array<{ receive_qty: string; remarks: string }> = data.details.map((d: any) => ({
            receive_qty: String(d?.receive_qty ?? ""),
            remarks: String(d?.remarks ?? ""),
        }));
        setEditValues(next);
    }, [data?.details]);

    const setRowEditValue = (rowIndex: number, field: "receive_qty" | "remarks", value: string) => {
        setEditValues((prev) => {
            const copy = [...prev];
            const current = copy[rowIndex] || { receive_qty: "", remarks: "" };
            copy[rowIndex] = { ...current, [field]: value };
            return copy;
        });
    };

    const clampReceiveQty = (raw: string, maxQty: number) => {
        if (raw === "") return "";
        let n = Number(raw);
        if (Number.isNaN(n)) n = 0;
        n = Math.max(0, n);
        if (Number.isFinite(maxQty)) n = Math.min(n, Math.max(0, maxQty));
        // Collected qty should be integer
        n = Math.floor(n);
        return String(n);
    };

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
                <div className="flex items-center gap-[16px]">
                    <Icon
                        icon="lucide:arrow-left"
                        width={24}
                        onClick={() => router.push(backBtnUrl)}
                        className="cursor-pointer"
                    />
                    <h1 className="text-[20px] font-semibold text-[#181D27] flex items-center leading-[30px]">
                        Caps Deposit 
                    </h1>
                    {/* <BorderIconButton disabled={!data?.previous_uuid} onClick={data?.previous_uuid ? () => router.push(`${PATH}${data.previous_uuid}`) : undefined} icon="lucide:chevron-left" label={"Prev"} labelTw="font-medium text-[12px]" className="!h-[30px] !gap-[3px] !px-[5px] !pr-[10px]" />
                    <BorderIconButton disabled={!data?.next_uuid} onClick={data?.next_uuid ? () => router.push(`${PATH}${data.next_uuid}`) : undefined} trailingIcon="lucide:chevron-right" label={"Next"} labelTw="font-medium text-[12px]" className="!h-[30px] !gap-[3px] !px-[5px] !pl-[10px]" /> */}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-[12px] relative">
                </div>
            </div>

            <WorkflowApprovalActions 
                requestStepId={data?.request_step_id}
                redirectPath={backBtnUrl}
                model="Ht_Caps_Header"
                onApproveIntercept={async () => {
                    // Build details payload as array with ids + edited values
                    const detailsPayload = (data?.details || []).map((d: any, idx: number) => ({
                        ...d,
                        receive_qty: Number(editValues[idx]?.receive_qty ?? d?.receive_qty ?? 0),
                        remarks: String(editValues[idx]?.remarks ?? d?.remarks ?? ""),
                    }));
                    try {
                        await capsUpdate(UUID, { details: detailsPayload });
                    } catch (e) {
                        showSnackbar("Failed to update Caps Collection details", "error");
                        return true;
                    }
                    showSnackbar("Caps Collection details updated successfully", "success");
                    return false;
                }}
                setIsUserHavePermission={setIsEditApproveMode}
            />

            <div ref={targetRef}>
                <ContainerCard className="rounded-[10px] space-y-[40px]">
                    <div className="flex justify-between flex-wrap gap-[20px]">
                        <div className="flex flex-col gap-[10px]">
                            <Logo type="full" />
                        </div>

                        <div className="flex flex-col items-end">
                            <span className="text-[42px] uppercase text-[#A4A7AE] mb-[10px]">Caps Deposit</span>
                            <span className="text-primary text-[14px] tracking-[8px]">#{data?.osa_code || "-"}</span>
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
                                {data?.claim_no && <div className="mt-2">
                                    Claim No: <span className="font-bold">{data?.claim_no}</span>
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
                            // Override editable fields from local state when in edit mode (by index)
                            if (isEditApproveMode && editValues[index]) {
                                mappedRow.receive_qty = editValues[index].receive_qty;
                                mappedRow.remarks = editValues[index].remarks;
                            }
                            return mappedRow;
                        })}
                        config={{
                            showNestedLoading:false,
                            columns: baseColumns.map((c: any) => {
                                if (c.key === "receive_qty") {
                                    return {
                                        ...c,
                                        render: (value: TableDataType) => {
                                            const idx = Math.max(0, Number((value as any)?.index) - 1);
                                            const display = (value as any)?.receive_qty ?? "";
                                            if (!isEditApproveMode) return <>{display}</>;

                                            const maxQty = Number((value as any)?.quantity ?? 0);
                                            const safeMax = Number.isFinite(maxQty) ? maxQty : 0;

                                            return (
                                                <div className="w-[120px] min-w-[120px] max-w-[120px]">
                                                    <InputFields
                                                        type="number"
                                                        min={0}
                                                        max={safeMax}
                                                        integerOnly={true}
                                                        placeholder="Collected qty"
                                                        value={editValues[idx]?.receive_qty ?? String(display ?? "")}
                                                        onChange={(e) =>
                                                            setRowEditValue(
                                                                idx,
                                                                "receive_qty",
                                                                clampReceiveQty(e.target.value, safeMax)
                                                            )
                                                        }
                                                        width="100%"
                                                    />
                                                </div>
                                            );
                                        },
                                    };
                                }
                                if (c.key === "remarks") {
                                    return {
                                        ...c,
                                        render: (value: TableDataType) => {
                                            const idx = Math.max(0, Number((value as any)?.index) - 1);
                                            const display = (value as any)?.remarks ?? "";
                                            if (!isEditApproveMode) return <>{display ? display : "-"}</>;
                                            return (
                                                <div className="w-[220px] min-w-[220px] max-w-[220px] overflow-hidden">
                                                    <InputFields
                                                        type="text"
                                                        placeholder="Remarks"
                                                        value={editValues[idx]?.remarks ?? String(display ?? "")}
                                                        onChange={(e) => setRowEditValue(idx, "remarks", e.target.value)}
                                                        width="100%"
                                                    />
                                                </div>
                                            );
                                        },
                                    };
                                }
                                return c;
                            }),
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