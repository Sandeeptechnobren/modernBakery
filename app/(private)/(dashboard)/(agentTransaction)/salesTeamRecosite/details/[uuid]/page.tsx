"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import ContainerCard from "@/app/components/containerCard";
import Table, { TableDataType } from "@/app/components/customTable";
import { Icon } from "@iconify-icon/react";
import { salesTeamRecontionOrderByUuid } from "@/app/services/agentTransaction";
import { useSnackbar } from "@/app/services/snackbarContext";
import KeyValueData from "@/app/components/keyValueData";

export default function SalesmanLoadDetailsUI() {
    const router = useRouter();
    const params = useParams();
    const { showSnackbar } = useSnackbar();

    /* -------- FORM STATE -------- */
    const [form, setForm] = useState({
        warehouse: "",
        salesman: "",
        reconsile_date: "",
    });

    /* -------- PAYMENT STATE -------- */
    const [payment, setPayment] = useState({
        total: "",
        cash: "",
        credit: "",
    });

    /* -------- ITEM TABLE STATE -------- */
    const [itemData, setItemData] = useState<TableDataType[]>([]);

    /* -------- FETCH DATA -------- */
    useEffect(() => {
        const fetchDetails = async () => {
            if (!params.uuid) return;

            try {
                const res = await salesTeamRecontionOrderByUuid(String(params.uuid));
                console.log("Details Response:", res);

                if (res?.data) {
                    const d = res.data;
                    setForm({
                        warehouse: d.warehouse_name || "",
                        salesman: d.salesman_name || "",
                        reconsile_date: d.reconsile_date ? d.reconsile_date.split('T')[0] : "",
                    });

                    setPayment({
                        total: String(d.grand_total_amount || 0),
                        cash: String(d.cash_amount || 0),
                        credit: String(d.credit_amount || 0),
                    });

                    if (Array.isArray(d.items)) {
                        setItemData(d.items.map((item: any) => ({
                            id: item.item_id,
                            name: item.item_name || "",
                            load_qty: item.load_qty,
                            unload_qty: item.unload_qty,
                            invoice_qty: item.invoice_qty,
                            item_code: item.erp_code, // Store erp_code as item_code for display if needed
                            // ...item 
                        })));
                    }
                }
            } catch (err) {
                console.error("Failed to fetch details", err);
                showSnackbar("Failed to load details", "error");
            }
        };

        fetchDetails();
    }, [params.uuid, showSnackbar]);

    /* -------- MEMOIZED TABLE DATA -------- */
    const tableData = useMemo(() => {
        return itemData.map((row, idx) => ({
            ...row,
            idx,
        }));
    }, [itemData]);

    return (
        <div className="flex flex-col">
            {/* -------- HEADER -------- */}
            <div className="flex items-center gap-4 mb-5">
                <Icon
                    icon="lucide:arrow-left"
                    width={24}
                    className="cursor-pointer"
                    onClick={() => router.back()}
                />
                <h1 className="text-[20px] font-semibold text-[#181D27]">
                    Sales Team Load Details
                </h1>
            </div>

            <div className="flex flex-col gap-6">
                <div className="flex flex-wrap gap-4">
                    <ContainerCard className="w-full lg:w-[48%]">
                        <KeyValueData
                            data={[
                                { value: form.warehouse, key: "Distributor" },
                                { value: form.salesman, key: "Sales Team" },
                                { value: form.reconsile_date, key: "Date" },
                            ]}
                        />
                    </ContainerCard>

                    <ContainerCard className="w-full lg:w-[48%]">
                        <KeyValueData
                            data={[
                                { value: payment.total, key: "Total Amount" },
                                { value: payment.cash, key: "Cash" },
                                { value: payment.credit, key: "Credit" },
                            ]}
                        />
                    </ContainerCard>
                </div>

                <ContainerCard className="rounded-[10px]">
                    {/* -------- TABLE -------- */}
                    <Table
                        data={tableData}
                        config={{
                            table: { height: 400 },
                            columns: [
                                {
                                    key: "item",
                                    label: "Item Name",
                                    render: (row: any) => row.name,
                                },
                                {
                                    key: "load_qty",
                                    label: "Load Qty",
                                    render: (row: any) => row.load_qty,
                                },
                                {
                                    key: "unload_qty",
                                    label: "Unload Qty",
                                    render: (row: any) => row.unload_qty,
                                },
                                {
                                    key: "invoice_qty",
                                    label: "Invoice Qty",
                                    render: (row: any) => row.invoice_qty,
                                },
                            ],
                            pageSize: 100,
                        }}
                    />

                    {/* -------- ACTIONS -------- */}
                    <hr className="my-6" />

                    <div className="flex justify-end gap-4">
                        <button
                            className="px-6 py-2 rounded-lg border border-gray-300"
                            onClick={() => router.back()}
                        >
                            Back
                        </button>
                    </div>
                </ContainerCard>
            </div>
        </div>
    );
}
