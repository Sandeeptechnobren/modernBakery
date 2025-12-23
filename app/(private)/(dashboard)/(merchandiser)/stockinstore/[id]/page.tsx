"use client";

import React, { useEffect, useRef, useState } from "react";
import { Formik, FormikValues } from "formik";
import * as Yup from "yup";
import { Icon } from "@iconify-icon/react";
import { useRouter } from "next/navigation";

import ContainerCard from "@/app/components/containerCard";
import InputFields from "@/app/components/inputFields";
import Table from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";

import { genearateCode, itemGlobalSearch } from "@/app/services/allApi";
import { addStockInStore } from "@/app/services/merchandiserApi";
import { saveFinalCode } from "@/app/services/allApi";

import { useSnackbar } from "@/app/services/snackbarContext";
import { useLoading } from "@/app/services/loadingContext";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

interface ItemRow {
    item_id: string;
    uom_id: string;
    capacity: string;
    UOM: { label: string; value: string }[];
}

/* -------------------------------------------------------------------------- */
/*                              VALIDATION SCHEMA                             */
/* -------------------------------------------------------------------------- */

const itemRowSchema = Yup.object({
    item_id: Yup.string().required("Item is required"),
    uom_id: Yup.string().required("UOM is required"),
    capacity: Yup.number()
        .typeError("Capacity must be a number")
        .min(1, "Capacity must be at least 1")
        .required("Capacity is required"),
});

const validationSchema = Yup.object({
    activity_name: Yup.string().required("Name is required"),
    from: Yup.string().required("From date is required"),
    to: Yup.string().required("To date is required"),
    customer: Yup.array().min(1, "Select at least one customer"),
});

/* -------------------------------------------------------------------------- */
/*                                   PAGE                                     */
/* -------------------------------------------------------------------------- */

export default function StockInStoreAddPage() {
    const router = useRouter();
    const { showSnackbar } = useSnackbar();
    const { setLoading } = useLoading();
    const { companyCustomersOptions, ensureCompanyCustomersLoaded } =
        useAllDropdownListData();

    const codeGenerated = useRef(false);
    const [code, setCode] = useState("");

    const [itemsOptions, setItemsOptions] = useState<
        { label: string; value: string }[]
    >([]);

    const [itemData, setItemData] = useState<ItemRow[]>([
        { item_id: "", uom_id: "", capacity: "", UOM: [] },
    ]);

    /* -------------------------------------------------------------------------- */
    /*                                  EFFECTS                                   */
    /* -------------------------------------------------------------------------- */

    useEffect(() => {
        ensureCompanyCustomersLoaded();
    }, [ensureCompanyCustomersLoaded]);

    useEffect(() => {
        if (!codeGenerated.current) {
            codeGenerated.current = true;
            (async () => {
                const res = await genearateCode({ model_name: "stock_in_store" });
                if (res?.code) setCode(res.code);
            })();
        }
    }, []);

    /* -------------------------------------------------------------------------- */
    /*                               ITEM HANDLERS                                */
    /* -------------------------------------------------------------------------- */

    const recalculateItem = (
        index: number,
        field: keyof ItemRow,
        value: string
    ) => {
        const updated = [...itemData];
        (updated[index] as any)[field] = value;
        setItemData(updated);
    };

    const addNewItem = () => {
        setItemData([
            ...itemData,
            { item_id: "", uom_id: "", capacity: "", UOM: [] },
        ]);
    };

    const removeItem = (index: number) => {
        if (itemData.length === 1) return;
        setItemData(itemData.filter((_, i) => i !== index));
    };

    /* -------------------------------------------------------------------------- */
    /*                                ITEM SEARCH                                 */
    /* -------------------------------------------------------------------------- */

    const fetchItems = async (search: string) => {
        const res = await itemGlobalSearch({
            query: search,
            per_page: "10",
        });

        if (res?.error) return [];

        const options = res.data.map((item: any) => ({
            value: String(item.id),
            label: `${item.code || item.item_code} - ${item.name}`,
        }));

        setItemsOptions(options);
        return options;
    };

    /* -------------------------------------------------------------------------- */
    /*                                PAYLOAD                                     */
    /* -------------------------------------------------------------------------- */

    const generatePayload = (values: FormikValues) => ({
        code,
        activity_name: values.activity_name,
        date_from: values.from,
        date_to: values.to,
        assign_customers: values.customer.map((id: string) => Number(id)),
        assign_inventory: itemData.map((item) => ({
            item_id: Number(item.item_id),
            item_uom: String(item.uom_id),
            capacity: Number(item.capacity),
        })),
    });

    /* -------------------------------------------------------------------------- */
    /*                                  SUBMIT                                    */
    /* -------------------------------------------------------------------------- */

    const handleSubmit = async (values: FormikValues) => {
        try {
            await Yup.array().of(itemRowSchema).validate(itemData, {
                abortEarly: false,
            });

            setLoading(true);
            const payload = generatePayload(values);

            const res = await addStockInStore(payload);
            if (res?.error) {
                showSnackbar("Failed to create stock", "error");
                return;
            }

            await saveFinalCode({
                reserved_code: code,
                model_name: "stock_in_store",
            });

            showSnackbar("Stock in store created successfully", "success");
            router.push("/stockInStore");
        } catch (err: any) {
            showSnackbar(err?.message || "Validation failed", "error");
        } finally {
            setLoading(false);
        }
    };

    /* -------------------------------------------------------------------------- */
    /*                                   RENDER                                   */
    /* -------------------------------------------------------------------------- */

    return (
        <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-5">
                <Icon
                    icon="lucide:arrow-left"
                    width={22}
                    className="cursor-pointer"
                    onClick={() => router.back()}
                />
                <h1 className="text-lg font-semibold">Add Stock In Store</h1>
            </div>

            <ContainerCard>
                <Formik
                    initialValues={{
                        activity_name: "",
                        from: "",
                        to: "",
                        customer: [],
                    }}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ values, handleChange, submitForm }) => (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                                <InputFields
                                    label="Code"
                                    value={code}
                                    disabled
                                    onChange={handleChange}
                                />
                                <InputFields
                                    required
                                    label="Name"
                                    name="activity_name"
                                    onChange={handleChange}
                                />
                                <InputFields
                                    required
                                    type="date"
                                    label="From"
                                    name="from"
                                    onChange={handleChange}
                                />
                                <InputFields
                                    required
                                    type="date"
                                    label="To"
                                    name="to"
                                    onChange={handleChange}
                                />
                                <InputFields
                                    required
                                    label="Customers"
                                    name="customer"
                                    isSingle={false}
                                    options={companyCustomersOptions}
                                    value={values.customer}
                                    onChange={(e) =>
                                        handleChange({
                                            target: { name: "customer", value: e.target.value },
                                        })
                                    }
                                />
                            </div>

                            <Table
                                data={itemData.map((row, idx) => ({
                                    ...row,
                                    idx: String(idx),
                                }))}
                                config={{
                                    columns: [
                                        {
                                            key: "item_id",
                                            label: "Item",
                                            render: (row) => (
                                                <InputFields
                                                    searchable
                                                    placeholder="Search item"
                                                    options={itemsOptions}
                                                    onSearch={fetchItems}
                                                    value={row.item_id}
                                                    onChange={(e) =>
                                                        recalculateItem(
                                                            Number(row.idx),
                                                            "item_id",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            ),
                                        },
                                        {
                                            key: "uom_id",
                                            label: "UOM",
                                            render: (row) => (
                                                <InputFields
                                                    placeholder="UOM"
                                                    value={row.uom_id}
                                                    onChange={(e) =>
                                                        recalculateItem(
                                                            Number(row.idx),
                                                            "uom_id",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            ),
                                        },
                                        {
                                            key: "capacity",
                                            label: "Capacity",
                                            render: (row) => (
                                                <InputFields
                                                    type="number"
                                                    placeholder="Capacity"
                                                    value={row.capacity}
                                                    onChange={(e) =>
                                                        recalculateItem(
                                                            Number(row.idx),
                                                            "capacity",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            ),
                                        },
                                        {
                                            key: "action",
                                            label: "Action",
                                            render: (row) => (
                                                <button
                                                    className="text-red-500"
                                                    onClick={() => removeItem(Number(row.idx))}
                                                >
                                                    <Icon icon="hugeicons:delete-02" width={20} />
                                                </button>
                                            ),
                                        },
                                    ],
                                }}
                            />

                            <button
                                type="button"
                                className="text-red-500 mt-4 flex items-center gap-2"
                                onClick={addNewItem}
                            >
                                <Icon icon="material-symbols:add-circle-outline" width={20} />
                                Add Item
                            </button>

                            <div className="flex justify-end mt-6 gap-4">
                                <SidebarBtn
                                    label="Submit"
                                    isActive
                                    onClick={() => submitForm()}
                                />
                            </div>
                        </>
                    )}
                </Formik>
            </ContainerCard>
        </div>
    );
}
