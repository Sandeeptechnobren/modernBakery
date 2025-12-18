"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ContainerCard from "@/app/components/containerCard";
import InputFields from "@/app/components/inputFields";
import Table, { TableDataType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { Icon } from "@iconify-icon/react";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import { salesTeamRecontionOrders, salesTeamRecontionOrdersTop, addSalesTeamRecontionOrders, blockSalesTeamRecontionOrders } from "@/app/services/agentTransaction";
import { useSnackbar } from "@/app/services/snackbarContext";

const initialItems: TableDataType[] = [];

/* ---------------- COMPONENT ---------------- */

export default function AddSalesmanLoadUI() {
    const router = useRouter();
    const { showSnackbar } = useSnackbar();

    /* -------- FORM STATE -------- */
    const [form, setForm] = useState({
        warehouse: "",
        salesman: "",
        reconsile_date: "",
    });

    /* -------- DROPDOWN DATA -------- */
    const {
        warehouseOptions,
        ensureWarehouseLoaded,
    } = useAllDropdownListData();

    const [salesmanOptions, setSalesmanOptions] = useState<{ value: string; label: string }[]>([]);

    /* -------- FETCH DATA -------- */
    useEffect(() => {
        ensureWarehouseLoaded();
    }, [ensureWarehouseLoaded]);

    useEffect(() => {
        if (!form.warehouse) {
            setSalesmanOptions([]);
            return;
        }

        const fetchSalesmen = async () => {
            try {
                const res = await salesTeamRecontionOrders(form.warehouse);
                const list = res?.data || res || [];
                const opts = Array.isArray(list)
                    ? list.map((s: any) => ({
                        value: String(s.sales_man_id || s.id),
                        label: s.osa_code && s.name ? `${s.osa_code} - ${s.name}` : s.name || "",
                    }))
                    : [];
                setSalesmanOptions(opts);
            } catch (err) {
                setSalesmanOptions([]);
            }
        };

        fetchSalesmen();
    }, [form.warehouse]);

    useEffect(() => {
        if (!form.salesman || !form.reconsile_date) return;

        const fetchData = async () => {
            try {
                console.log("Fetching reconciliation with:", {
                    salesman_id: form.salesman,
                    reconsile_date: form.reconsile_date,
                });
                const res = await salesTeamRecontionOrdersTop({
                    salesman_id: Number(form.salesman),
                    reconsile_date: form.reconsile_date,
                });
                console.log("Reconciliation Response:", res);

                // Relaxed check: accept if data array is present
                const dataList = Array.isArray(res?.data) ? res.data : [];
                console.log("Extracted Data List:", dataList);

                if (dataList.length > 0) {
                    const newItems = dataList.map((item: any) => ({
                        id: item.item_id,
                        item_code: item.erp_code || "",
                        name: item.item_name || "",
                        load_qty: item.load_qty,
                        unload_qty: item.unload_qty,
                        invoice_qty: item.invoice_qty,
                        // Maintain other required TableDataType fields if any
                    }));
                    console.log("Setting item items:", newItems);
                    setItemData(newItems);
                } else {
                    // Handle Empty Data
                    console.log("No data found for this selection (List empty)");
                    setItemData([]);
                }

                // Update Grand Total
                if (res?.grand_total_amount !== undefined) {
                    setPayment(prev => ({
                        ...prev,
                        total: String(res.grand_total_amount)
                    }));
                } else {
                    setPayment(prev => ({ ...prev, total: "0" }));
                }
            } catch (err) {
                console.error("Failed to fetch reconciliation data", err);
            }
        };

        fetchData();
    }, [form.salesman, form.reconsile_date]);

    /* -------- ITEM TABLE STATE -------- */
    const [itemData, setItemData] = useState<TableDataType[]>(initialItems);

    /* -------- PAYMENT STATE -------- */
    const [payment, setPayment] = useState({
        total: "",
        cash: "",
        credit: "",
    });

    /* -------- MODAL STATE -------- */
    const [showMismatchModal, setShowMismatchModal] = useState(false);

    /* -------- MEMOIZED TABLE DATA -------- */
    const tableData = useMemo(() => {
        return itemData.map((row, idx) => ({
            ...row,
            idx,
        }));
    }, [itemData]);

    /* -------- HANDLERS -------- */

    const handleChange = (field: string, value: any) => {
        console.log(`handleChange for ${field}:`, value);
        // Handle various input event types or direct values
        let val = value;
        if (value && typeof value === 'object' && 'target' in value) {
            val = value.target.value;
        }
        console.log(`handleChange setForm ${field}:`, val);
        setForm((prev) => ({ ...prev, [field]: val }));
    };

    const updateQty = (index: number, field: string, value: string) => {
        setItemData((prev) =>
            prev.map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            )
        );
    };

    const handlePaymentChange = (field: string, value: string) => {
        // Only update the specific field, don't recalculate total
        // Total comes from API's grand_total_amount
        setPayment((prev) => ({
            ...prev,
            [field]: value
        }));
    };

    /* -------- SUBMIT LOGIC -------- */

    const handleSubmit = () => {
        const cash = Number(payment.cash || 0);
        const credit = Number(payment.credit || 0);
        const total = Number(payment.total || 0);

        if (cash + credit !== total) {
            setShowMismatchModal(true);
            return;
        }

        // ✅ No mismatch → submit directly
        submitData();
    };

    const submitData = async () => {
        try {
            const payload = {
                warehouse_id: Number(form.warehouse),
                salesman_id: Number(form.salesman),
                reconsile_date: form.reconsile_date,
                grand_total_amount: Number(payment.total),
                cash_amount: Number(payment.cash || 0),
                credit_amount: Number(payment.credit || 0),
                items: itemData.map((item) => ({
                    item_id: item.id,
                    load_qty: item.load_qty,
                    unload_qty: item.unload_qty,
                    invoice_qty: item.invoice_qty,
                })),
            };

            // console.log("Submitting payload:", payload);
            const response = await addSalesTeamRecontionOrders(payload);
            // console.log("API Response:", response);

            if (response?.status === "success" || response?.success) {
                showSnackbar("Sales Team Reconciliation created successfully!", "success");
                router.push('/salesTeamRecosite');
            } else {
                // Handle error response with errors object
                if (response?.errors) {
                    const errorMessages = Object.values(response.errors)
                        .flat()
                        .join(", ");
                    showSnackbar(errorMessages, "error");
                } else {
                    showSnackbar(response?.message || "Failed to create reconciliation", "error");
                }
            }
        } catch (error: any) {
            // console.error("Failed to submit data:", error);
            // Handle API error response
            if (error?.response?.data?.errors) {
                const errorMessages = Object.values(error.response.data.errors)
                    .flat()
                    .join(", ");
                showSnackbar(errorMessages, "error");
            } else if (error?.response?.data?.message) {
                showSnackbar(error.response.data.message, "error");
            } else {
                showSnackbar("An error occurred while submitting the data.", "error");
            }
        }
    };

    /* ---------------- UI ---------------- */

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
                    Add Sales Team Load
                </h1>
            </div>

            <ContainerCard className="rounded-[10px]">
                {/* -------- FORM -------- */}
                <div className="flex flex-col w-full sm:w-[30%] gap-4 mb-6">
                    <InputFields
                        label="Distributor"
                        value={form.warehouse}
                        options={warehouseOptions}
                        onChange={(e) =>
                            handleChange("warehouse", e.target.value)
                        }
                    />

                    <InputFields
                        label="Sales Team"
                        value={form.salesman}
                        options={salesmanOptions}
                        onChange={(e) =>
                            handleChange("salesman", e)
                        }
                        type="select"
                    />

                    <InputFields
                        label="Date"
                        name="reconsile_date"
                        value={form.reconsile_date}
                        onChange={(e) => handleChange("reconsile_date", e.target.value)}
                        type="date"
                        placeholder="Select Date"
                    />
                </div>

                {/* -------- TABLE -------- */}
                <Table
                    data={tableData}
                    config={{
                        table: { height: 400 },
                        columns: [
                            {
                                key: "item",
                                label: "Item Name",
                                render: (row: any) =>
                                    `${row.item_code} - ${row.name}`,
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

                {/* -------- PAYMENT -------- */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                    <InputFields
                        label="Total Amount"
                        type="number"
                        value={payment.total}
                        disabled
                        onChange={(e) =>
                            handlePaymentChange("total", e.target.value)
                        }
                    />

                    <InputFields
                        label="Cash"
                        value={payment.cash}
                        onChange={(e) =>
                            handlePaymentChange("cash", e.target.value)
                        }
                    />

                    <InputFields
                        label="Credit"
                        value={payment.credit}
                        onChange={(e) =>
                            handlePaymentChange("credit", e.target.value)
                        }
                    />
                </div>

                {/* -------- ACTIONS -------- */}
                <hr className="my-6" />

                <div className="flex justify-end gap-4">
                    <button
                        className="px-6 py-2 rounded-lg border border-gray-300"
                        onClick={() => router.back()}
                    >
                        Cancel
                    </button>

                    <SidebarBtn
                        isActive
                        label="Create Order"
                        onClick={handleSubmit}
                    />
                </div>
            </ContainerCard>

            {/* -------- CONFIRM MODAL -------- */}
            {showMismatchModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-lg w-[400px] p-6">
                        <h2 className="text-lg font-semibold mb-3">
                            Amount Mismatch
                        </h2>
                        <p className="text-sm text-gray-600 mb-6">
                            Cash + Credit does not match the total amount.
                            Do you want to Block this user?
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                className="px-4 py-2 border rounded-md"
                                onClick={() => setShowMismatchModal(false)}
                            >
                                No
                            </button>

                            <button
                                className="px-4 py-2 bg-[#181D27] text-white rounded-md"
                                onClick={async () => {
                                    setShowMismatchModal(false);
                                    // Block the salesman
                                    try {
                                        const blockPayload = {
                                            salesman_id: Number(form.salesman),
                                            reconsile_date: form.reconsile_date
                                        };
                                        console.log("Blocking salesman with payload:", blockPayload);
                                        const blockResponse = await blockSalesTeamRecontionOrders(blockPayload);
                                        console.log("Block API Response:", blockResponse);

                                        if (blockResponse?.status === "success" || blockResponse?.success) {
                                            showSnackbar("Salesman blocked successfully!", "success");
                                        } else {
                                            // Handle error response with errors object
                                            if (blockResponse?.errors) {
                                                const errorMessages = Object.values(blockResponse.errors)
                                                    .flat()
                                                    .join(", ");
                                                showSnackbar(errorMessages, "error");
                                            } else {
                                                showSnackbar(blockResponse?.message || "Failed to block salesman", "error");
                                            }
                                        }
                                    } catch (error: any) {
                                        console.error("Failed to block salesman:", error);
                                        // Handle API error response
                                        if (error?.response?.data?.errors) {
                                            const errorMessages = Object.values(error.response.data.errors)
                                                .flat()
                                                .join(", ");
                                            showSnackbar(errorMessages, "error");
                                        } else if (error?.response?.data?.message) {
                                            showSnackbar(error.response.data.message, "error");
                                        } else {
                                            showSnackbar("An error occurred while blocking the salesman.", "error");
                                        }
                                    }
                                    // Then submit the data
                                    submitData();
                                }}
                            >
                                Yes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
