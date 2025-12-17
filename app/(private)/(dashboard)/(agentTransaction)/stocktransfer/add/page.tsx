"use client";

import ContainerCard from "@/app/components/containerCard";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import Table, { TableDataType } from "@/app/components/customTable";
import InputFields from "@/app/components/inputFields";
import { StockTransferTopOrders, addStockTransfer } from "@/app/services/agentTransaction";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function StockTransfer() {
    const { warehouseOptions = [], ensureWarehouseLoaded } = useAllDropdownListData();
    const router = useRouter();
    const { showSnackbar } = useSnackbar();
    const { setLoading } = useLoading();

    useEffect(() => {
        ensureWarehouseLoaded();
    }, [ensureWarehouseLoaded]);

    const [form, setForm] = useState({
        source_warehouse: "",
        destination_warehouse: "",
    });

    const [itemData, setItemData] = useState<TableDataType[]>([]);

    /* ------------------------------------------------------------
       FILTER DESTINATION WAREHOUSE (FIXED)
    ------------------------------------------------------------ */
    const destinationWarehouseOptions = useMemo(() => {
        if (!form.source_warehouse) return warehouseOptions;

        return warehouseOptions.filter(
            (opt: any) => String(opt.value) !== String(form.source_warehouse)
        );
    }, [warehouseOptions, form.source_warehouse]);

    /* ------------------------------------------------------------
       HANDLE CHANGE
    ------------------------------------------------------------ */
    const handleChange = (field: string, value: string) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
            ...(field === "source_warehouse"
                ? { destination_warehouse: "" }
                : {}),
        }));
    };

    /* ------------------------------------------------------------
       LOAD ITEMS WHEN SOURCE WAREHOUSE CHANGES
    ------------------------------------------------------------ */
    useEffect(() => {
        if (!form.source_warehouse) {
            setItemData([]);
            return;
        }

        const fetchItems = async () => {
            try {
                setLoading(true);
                const res = await StockTransferTopOrders(form.source_warehouse);

                const stocks = (res?.data || res || []).filter(
                    (row: any) => Number(row.qty) > 0
                );

                const mappedData = stocks.map((row: any) => ({
                    id: row.id,
                    item_code: row.item?.erp_code || "",
                    name: row.item?.name || "",
                    uom: row.item?.uom || "N/A",
                    available_qty: row.qty,
                    transfer_qty: "",
                    original_data: row,
                }));

                setItemData(mappedData);
            } catch (error) {
                console.error(error);
                showSnackbar("Failed to fetch items", "error");
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, [form.source_warehouse, setLoading, showSnackbar]);

    /* ------------------------------------------------------------
       UPDATE ITEM QTY
    ------------------------------------------------------------ */
    const updateItemQty = (index: number, value: string) => {
        const updated = [...itemData];
        updated[index].transfer_qty = value;
        setItemData(updated);
    };

    /* ------------------------------------------------------------
       SUBMIT
    ------------------------------------------------------------ */
    const handleSubmit = async () => {
        if (!form.source_warehouse || !form.destination_warehouse) {
            showSnackbar("Select both warehouses", "error");
            return;
        }

        const items = itemData.filter(
            (i: any) => Number(i.transfer_qty) > 0
        );

        if (!items.length) {
            showSnackbar("Enter transfer qty", "warning");
            return;
        }

        const payload = {
            from_warehouse: form.source_warehouse,
            to_warehouse: form.destination_warehouse,
            items: items.map((i: any) => ({
                item_id: i.original_data?.item?.id,
                qty: i.transfer_qty,
            })),
        };

        try {
            setLoading(true);
            const res = await addStockTransfer(payload);

            if (res?.error) {
                showSnackbar(res.message || "Failed", "error");
            } else {
                showSnackbar("Stock Transfer Created ✅", "success");
                router.push("/stocktransfer");
            }
        } catch (err) {
            showSnackbar("Something went wrong", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ContainerCard className="p-6 rounded-lg">
            {/* HEADER */}
            <div className="flex justify-between mb-6">
                <h1 className="text-lg font-semibold uppercase">
                    Stock Transfer
                </h1>
                <button
                    onClick={() => router.back()}
                    className="bg-emerald-500 text-white px-5 py-2 rounded"
                >
                    Back
                </button>
            </div>

            {/* WAREHOUSE SELECT */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <InputFields
                    label="Source Warehouse"
                    name="source_warehouse"
                    value={form.source_warehouse}
                    options={warehouseOptions}
                    onChange={(e) =>
                        handleChange("source_warehouse", e.target.value)
                    }
                />

                <InputFields
                    label="Destination Warehouse"
                    name="destination_warehouse"
                    value={form.destination_warehouse}
                    options={destinationWarehouseOptions}
                    disabled={!form.source_warehouse}
                    onChange={(e) =>
                        handleChange("destination_warehouse", e.target.value)
                    }
                />
            </div>

            {/* ITEMS TABLE */}
            <Table
                data={itemData.map((row, idx) => ({
                    ...row,
                    idx: idx.toString(),
                }))}
                config={{
                    table: { height: 450 },
                    columns: [
                        {
                            key: "item",
                            label: "Item",
                            render: (row) =>
                                `${row.item_code} - ${row.name}`,
                        },
                        { key: "uom", label: "UOM" },
                        { key: "available_qty", label: "Available" },
                        {
                            key: "transfer_qty",
                            label: "Transfer Qty",
                            render: (row: any) => (
                                <InputFields
                                    type="number"
                                    value={row.transfer_qty}
                                    min={0}
                                    max={row.available_qty}
                                    onChange={(e) =>
                                        updateItemQty(
                                            Number(row.idx),
                                            e.target.value
                                        )
                                    }
                                />
                            ),
                        },
                    ],
                    pageSize: itemData.length || 10,
                }}
            />

            {/* SUBMIT */}
            <div className="flex justify-end mt-6">
                <button
                    onClick={handleSubmit}
                    className="bg-blue-600 text-white px-8 py-2 rounded"
                >
                    Submit
                </button>
            </div>
        </ContainerCard>
    );
}
