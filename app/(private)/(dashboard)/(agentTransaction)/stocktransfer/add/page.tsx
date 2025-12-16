"use client";

import ContainerCard from "@/app/components/containerCard";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import Table, { TableDataType } from "@/app/components/customTable";
import InputFields from "@/app/components/inputFields";
import { itemList, warehouseStockTopOrders } from "@/app/services/allApi";
import { StockTransferTopOrders, addStockTransfer } from "@/app/services/agentTransaction";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function StockTransfer() {
    const { warehouseOptions } = useAllDropdownListData();
    const router = useRouter();
    const { showSnackbar } = useSnackbar();
    const { setLoading } = useLoading();

    const [form, setForm] = useState({
        source_warehouse: "",
        destination_warehouse: "",
    });

    const [itemData, setItemData] = useState<TableDataType[]>([]);

    /* ------------------------------------------------------------------
       FILTER DESTINATION WAREHOUSE OPTIONS
    ------------------------------------------------------------------ */
    const destinationWarehouseOptions = useMemo(() => {
        return warehouseOptions.filter(
            (opt: any) => opt.value !== form.source_warehouse
        );
    }, [warehouseOptions, form.source_warehouse]);

    /* ------------------------------------------------------------------
       HANDLE FIELD CHANGE
    ------------------------------------------------------------------ */
    const handleChange = (field: string, value: string) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
            ...(field === "source_warehouse"
                ? { destination_warehouse: "" }
                : {}),
        }));
    };

    /* ------------------------------------------------------------------
       LOAD ITEMS WHEN SOURCE WAREHOUSE CHANGES
    ------------------------------------------------------------------ */
    /* ------------------------------------------------------------------
       LOAD ITEMS WHEN SOURCE WAREHOUSE CHANGES
    ------------------------------------------------------------------ */
    useEffect(() => {
        if (!form.source_warehouse) {
            setItemData([]);
            return;
        }

        const fetchItems = async () => {
            try {
                setLoading(true);
                const res = await StockTransferTopOrders(form.source_warehouse);


                const stocks = (Array.isArray(res) ? res : (res?.data || [])).filter(
                    (row: any) => Number(row.qty) > 0
                );

                const mappedData = stocks.map((row: any) => ({
                    id: row.id,
                    item_code: row.item?.erp_code || "",
                    name: row.item?.name || "",
                    uom: row.item?.uom ? row.item.uom : "N/A",
                    available_qty: row.qty,
                    transfer_qty: "",
                    status: row.status,
                    original_data: row
                }));

                setItemData(mappedData);
            } catch (error) {
                console.error("Fetch items error:", error);
                showSnackbar("Failed to fetch items", "error");
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, [form.source_warehouse, setLoading, showSnackbar]);


    /* ------------------------------------------------------------------
       UPDATE ITEM QTY
    ------------------------------------------------------------------ */
    const recalculateItem = (
        index: number,
        field: string,
        value: string
    ) => {
        const updated = [...itemData];
        updated[index][field] = value;
        setItemData(updated);
    };

    /* ------------------------------------------------------------------
       SUBMIT
    ------------------------------------------------------------------ */
    const handleSubmit = async () => {
        if (!form.source_warehouse || !form.destination_warehouse) {
            showSnackbar(
                "Please select both source and destination warehouses",
                "error"
            );
            return;
        }

        const itemsToTransfer = itemData.filter(
            (item: any) =>
                item.transfer_qty && Number(item.transfer_qty) > 0
        );

        if (itemsToTransfer.length === 0) {
            showSnackbar("Please enter transfer quantity for at least one item", "warning");
            return;
        }

        const payload = {
            from_warehouse: form.source_warehouse,
            to_warehouse: form.destination_warehouse,
            items: itemsToTransfer.map((item: any) => ({
                item_id: item.original_data?.item?.id,
                qty: item.transfer_qty,
            })),
        };

        try {
            setLoading(true);
            const res = await addStockTransfer(payload);
            if (res?.error) {
                // Check for validation errors object
                if (res?.errors) {
                    const errorMsg = Object.values(res.errors).flat().join(", ");
                    showSnackbar(errorMsg || "Validation failed", "error");
                } else {
                    showSnackbar(res?.message || "Failed to create transfer", "error");
                }
            } else {
                showSnackbar("Stock Transfer Created Successfully ✅", "success");
                router.push("/stocktransfer");
            }
        } catch (error) {
            console.error("Transfer error:", error);
            showSnackbar("Something went wrong", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ContainerCard className="rounded-[10px] p-6">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-[20px] font-semibold text-[#181D27] uppercase">
                    Stock Transfer
                </h1>
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="bg-[#10B981] text-white px-6 py-2 rounded-md font-medium hover:bg-[#059669]"
                >
                    Back
                </button>
            </div>

            <hr className="mb-6" />

            {/* WAREHOUSE SELECTION */}
            <div className="flex flex-col sm:flex-row gap-6 mb-6">
                <div className="w-full sm:w-1/2">
                    <InputFields
                        label="Select Warehouse"
                        name="source_warehouse"
                        value={form.source_warehouse}
                        options={warehouseOptions}
                        onChange={(e) =>
                            handleChange("source_warehouse", e.target.value)
                        }
                    />
                </div>

                <div className="w-full sm:w-1/2">
                    <InputFields
                        label="Select Sub Warehouse"
                        name="destination_warehouse"
                        value={form.destination_warehouse}
                        options={destinationWarehouseOptions}
                        onChange={(e) =>
                            handleChange(
                                "destination_warehouse",
                                e.target.value
                            )
                        }
                        disabled={!form.source_warehouse}
                    />
                </div>
            </div>

            {/* ITEMS TABLE */}
            <Table
                key={`items-${itemData.length}`}
                data={itemData.map((row, idx) => ({
                    ...row,
                    idx: idx.toString(),
                }))}
                config={{
                    table: { height: 500 },
                    columns: [
                        {
                            key: "item",
                            label: "Item Code - Name",
                            width: 300,
                            render: (row: TableDataType) => (
                                <span>
                                    {row.item_code} - {row.name}
                                </span>
                            ),
                        },
                        {
                            key: "uom",
                            label: "UOM",
                            width: 100,
                            render: (row: TableDataType) => (
                                <span>{row.uom || "N/A"}</span>
                            ),
                        },
                        {
                            key: "available_qty",
                            label: "Available Qty",
                            width: 120,
                            render: (row: TableDataType) => (
                                <span className={Number(row.available_qty) === 0 ? "text-red-500" : ""}>
                                    {row.available_qty}
                                </span>
                            ),
                        },
                        {
                            key: "transfer_qty",
                            label: "Transfer Qty",
                            width: 120,
                            render: (row: any) => (
                                <InputFields
                                    type="number"
                                    name="transfer_qty"
                                    value={row.transfer_qty}
                                    placeholder="Qty"
                                    onChange={(e) =>
                                        recalculateItem(
                                            Number(row.idx),
                                            "transfer_qty",
                                            e.target.value
                                        )
                                    }
                                    min={0}
                                    max={Number(row.available_qty)}
                                />
                            ),
                        },
                    ],
                    pageSize: itemData.length || 10,
                }}
            />

            {/* ACTION */}
            <div className="flex justify-end mt-6">
                <button
                    onClick={handleSubmit}
                    className="bg-[#2563EB] text-white px-8 py-2 rounded-md hover:bg-[#1D4ED8]"
                >
                    Submit
                </button>
            </div>
        </ContainerCard>
    );
}
