"use client";

import ContainerCard from "@/app/components/containerCard";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import Table, {
    configType,
    listReturnType,
    TableDataType,
} from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import InputFields from "@/app/components/inputFields";
import {
    salesmanLoadHeaderAdd,
    salesmanLoadHeaderUpdate,
} from "@/app/services/agentTransaction";
import { getRouteById, itemList } from "@/app/services/allApi";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import * as yup from "yup";

export default function AddEditSalesmanLoad() {
    const { salesmanTypeOptions, routeOptions, salesmanOptions } =
        useAllDropdownListData();
    const router = useRouter();
    const { showSnackbar } = useSnackbar();
    const { setLoading } = useLoading();
    const params = useParams();
    const loadUUID = params?.uuid as string | undefined;
    const isEditMode = loadUUID !== undefined && loadUUID !== "add";

    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        salesmanType: "",
        unload_date: "",
        route_id: "",
        salesman_id: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [refreshKey, setRefreshKey] = useState(0);
    const [itemData, setItemData] = useState<TableDataType[]>([]);

    // ✅ Fetch details in edit mode
    useEffect(() => {
        if (isEditMode && loadUUID) {
            setLoading(true);
            (async () => {
                try {
                    const res = await getRouteById(String(loadUUID));
                    const data = res?.data ?? res;
                    setForm({
                        salesmanType: data?.salesmanType || "",
                        unload_date: data?.unload_date || "",
                        route_id: data?.route_id || "",
                        salesman_id: data?.salesman_id || "",
                    });
                } catch (err) {
                    showSnackbar("Failed to fetch details", "error");
                } finally {
                    setLoading(false);
                }
            })();
        }
    }, [isEditMode, loadUUID, setLoading, showSnackbar]);

    // ✅ Validation schema
    const validationSchema = yup.object().shape({
        salesmanType: yup.string().required("Salesman Type is required"),
        unload_date: yup.string().required("Unload Date is required"),
        route_id: yup.string().required("Route is required"),
        salesman_id: yup.string().required("Salesman is required"),
    });


    const [data, setData] = useState<string>()
    const handleChange = (field: string, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    };

    // ✅ Fetch items list
    const fetchItems = useCallback(
        async (page: number = 1): Promise<listReturnType> => {
            try {
                setLoading(true);
                const res = await itemList({ page: page.toString() });
                setLoading(false);
                const data = res.data.map((item: any) => ({
                    ...item,
                    qty: item.qty || "", // Add editable qty field
                }));
                setItemData(data);
                return {
                    data,
                    total: res.pagination.totalPages,
                    currentPage: res.pagination.page,
                    pageSize: res.pagination.limit,
                };
            } catch (error) {
                setLoading(false);
                console.error(error);
                throw error;
            }
        },
        [setLoading]
    );

    // ✅ Handle Qty change (live input in table)
    const handleQtyChange = (itemId: string | number, value: string) => {
        console.log(itemId, value)
        setItemData((prev) =>
            prev.map((item) =>
                item.id === itemId ? { ...item, qty: value } : item
            )
        );
    };
    console.log(itemData)

    // ✅ Define Table columns with input field in Qty column
    const columns: configType["columns"] = [
        {
            key: "item",
            label: "Items",
            render: (row: TableDataType) => (
                <span>
                    {row.item_code && row.name
                        ? `${row.item_code} - ${row.name}`
                        : row.item_code
                            ? row.item_code
                            : row.name
                                ? row.name
                                : "-"}
                </span>
            ),
        },
        { key: "CSE", label: "CSE" },
        {
            key: "qty_input", // ✅ unique key name
            label: "Qty",
            render: (row: TableDataType) => (
                <div className="w-[100px]">
                    <input
                        type="number"
                        className="border border-gray-300 rounded-md px-2 py-1 w-full text-sm"
                        // value={()}
                        onChange={(e) => handleQtyChange(row.id, e.target.value)}
                    />
                </div>
            ),
        },
        { key: "PCS", label: "PCS" },
        {
            key: "qty_input", // ✅ unique key name
            label: "Qty",
            render: (row: TableDataType) => (
                <div className="w-[100px]">
                    <input
                        type="number"
                        className="border border-gray-300 rounded-md px-2 py-1 w-full text-sm"
                        value={(data ?? "")}
                        onChange={(e) => {
                            console.log(e)
                            setData(e.target.value.toString())
                            handleQtyChange(row.id, e.target.value)
                        }}
                    />
                </div>
            ),
        },
    ];

    // ✅ Submit Handler
    const handleSubmit = async () => {
        try {
            await validationSchema.validate(form, { abortEarly: false });
            setErrors({});
            setSubmitting(true);

            const payload = {
                ...form,
                items: itemData.filter((i) => i.qty && Number(i.qty) > 0), // include qty items only
            };

            let res;
            if (isEditMode && loadUUID) {
                res = await salesmanLoadHeaderUpdate(loadUUID, payload);
            } else {
                res = await salesmanLoadHeaderAdd(payload);
            }

            if (res?.error) {
                showSnackbar(res.data?.message || "Failed to submit form", "error");
            } else {
                showSnackbar(
                    isEditMode
                        ? "Salesman Unload updated successfully"
                        : "Salesman Unload added successfully",
                    "success"
                );
                router.push("/salesmanUnload");
            }
        } catch (err) {
            if (err instanceof yup.ValidationError) {
                const formErrors: Record<string, string> = {};
                err.inner.forEach((e) => {
                    if (e.path) formErrors[e.path] = e.message;
                });
                setErrors(formErrors);
            } else {
                showSnackbar("Failed to submit form", "error");
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <Link href="/salesmanUnload">
                        <Icon icon="lucide:arrow-left" width={24} />
                    </Link>
                    <h1 className="text-xl font-semibold text-gray-900">
                        {isEditMode ? "Update Salesman Unload" : "Add Salesman Unload"}
                    </h1>
                </div>
            </div>

            {/* Form Section */}
            <ContainerCard>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-800 mb-4">
                        Salesman Unload Details
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Salesman Type */}
                        <InputFields
                            required
                            label="Salesman Type"
                            value={form.salesmanType}
                            options={salesmanTypeOptions}
                            onChange={(e) => handleChange("salesmanType", e.target.value)}
                        />
                        {errors.salesmanType && (
                            <p className="text-red-500 text-sm mt-1">{errors.salesmanType}</p>
                        )}

                        {/* Unload Date */}
                        <InputFields
                            required
                            type="date"
                            label="Unload Date"
                            value={form.unload_date}
                            onChange={(e) => handleChange("unload_date", e.target.value)}
                        />
                        {errors.unload_date && (
                            <p className="text-red-500 text-sm mt-1">{errors.unload_date}</p>
                        )}

                        {/* Route */}
                        <InputFields
                            required
                            label="Route"
                            value={form.route_id}
                            options={routeOptions}
                            onChange={(e) => handleChange("route_id", e.target.value)}
                        />
                        {errors.route_id && (
                            <p className="text-red-500 text-sm mt-1">{errors.route_id}</p>
                        )}

                        {/* Salesman */}
                        <InputFields
                            required
                            label="Salesman"
                            value={form.salesman_id}
                            options={salesmanOptions}
                            onChange={(e) => handleChange("salesman_id", e.target.value)}
                        />
                        {errors.salesman_id && (
                            <p className="text-red-500 text-sm mt-1">{errors.salesman_id}</p>
                        )}
                    </div>
                </div>
            </ContainerCard>

            {/* Items Table */}
            <div className="mt-6">
                <Table
                    refreshKey={refreshKey}
                    config={{
                        api: { list: fetchItems },
                        header: {
                            title: "Items",
                            searchBar: false,
                            columnFilter: false,
                        },
                        footer: { nextPrevBtn: true, pagination: true },
                        columns,
                        rowSelection: false,
                        pageSize: 50,
                    }}
                />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 mt-6 pr-0">
                <button
                    type="button"
                    className={`px-6 py-2 rounded-lg border text-gray-700 hover:bg-gray-100 ${submitting
                        ? "bg-gray-100 border-gray-200 cursor-not-allowed text-gray-400"
                        : "border-gray-300"
                        }`}
                    onClick={() => router.push("/salesmanUnload")}
                    disabled={submitting}
                >
                    Cancel
                </button>

                <SidebarBtn
                    label={
                        submitting
                            ? isEditMode
                                ? "Updating..."
                                : "Submitting..."
                            : isEditMode
                                ? "Update"
                                : "Submit"
                    }
                    isActive={!submitting}
                    leadingIcon="mdi:check"
                    onClick={handleSubmit}
                    disabled={submitting}
                />
            </div>
        </>
    );
}
