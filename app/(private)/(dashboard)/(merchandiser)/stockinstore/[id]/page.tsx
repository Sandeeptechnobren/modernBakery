"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Formik, FormikValues } from "formik";
import * as Yup from "yup";
import { Icon } from "@iconify-icon/react";
import { useParams, useRouter } from "next/navigation";

import ContainerCard from "@/app/components/containerCard";
import InputFields from "@/app/components/inputFields";
import Table from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";

import { genearateCode, itemGlobalSearch } from "@/app/services/allApi";
import {
    addStockInStore,
    updateStockInStore,
    stockInStoreById,
} from "@/app/services/merchandiserApi";

import { useSnackbar } from "@/app/services/snackbarContext";
import { useLoading } from "@/app/services/loadingContext";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";

interface ItemRow {
    item_id: string;
    uom_id: string;
    capacity: string;
    UOM: { label: string; value: string }[];
}

interface FormikForm {
    code: string;
    activity_name: string;
    from: string;
    to: string;
    customer: string[];
}

/* -------------------------------------------------------------------------- */
/*                              VALIDATION                                    */
/* -------------------------------------------------------------------------- */

const itemRowSchema = Yup.object({
    item_id: Yup.string().required(),
    uom_id: Yup.string().required(),
    capacity: Yup.number().min(1).required(),
});

const validationSchema = Yup.object({
    activity_name: Yup.string().required("Required"),
    from: Yup.string().required("Required"),
    to: Yup.string().required("Required"),
    customer: Yup.array().min(1, "Select at least one customer"),
});

export default function StockInStoreAddPage() {
    const router = useRouter();
    const { id } = useParams<{ id?: string }>();
    const isEditMode = Boolean(id && id !== "add");

    const { showSnackbar } = useSnackbar();
    const { setLoading } = useLoading();

    const { companyCustomersOptions, ensureCompanyCustomersLoaded } =
        useAllDropdownListData();

    const codeGeneratedRef = useRef(false);

    const [code, setCode] = useState("");
    const [itemData, setItemData] = useState<ItemRow[]>([
        { item_id: "", uom_id: "", capacity: "", UOM: [] },
    ]);

    const [searchedItemOptions, setSearchedItemOptions] = useState<any[]>([]);
    const [itemUomMap, setItemUomMap] = useState<Record<string, any[]>>({});

    const [initialFormikValues, setInitialFormikValues] =
        useState<FormikForm>({
            code: "",
            activity_name: "",
            from: "",
            to: "",
            customer: [],
        });

    /* -------------------------------------------------------------------------- */
    /*                                  EFFECTS                                   */
    /* -------------------------------------------------------------------------- */

    useEffect(() => {
        ensureCompanyCustomersLoaded();
    }, [ensureCompanyCustomersLoaded]);

    // Generate code (ADD only)
    useEffect(() => {
        if (isEditMode || codeGeneratedRef.current) return;

        codeGeneratedRef.current = true;

        (async () => {
            const res = await genearateCode({ model_name: "stock_code" });
            if (res?.code) setCode(res.code);
        })();
    }, [isEditMode]);

    // Load edit data
    useEffect(() => {
        if (!isEditMode || !id) return;

        setLoading(true);

        (async () => {
            try {
                const res = await stockInStoreById(id);
                const data = res.data;

                setCode(data.code ?? "");

                // hydrate formik
                setInitialFormikValues({
                    code: data.code ?? "",
                    activity_name: data.activity_name ?? "",
                    from: data.date_range?.from ?? "",
                    to: data.date_range?.to ?? "",
                    customer: data?.assign_customers?.map((c: any) => ({
                        label: c.name,
                        value: c.id,
                    })) ?? [],
                });

                // hydrate table rows + UOMs
                const rows: ItemRow[] =
                    data.inventories?.map((inv: any) => {
                        const uoms = inv.item?.item_uoms || [];

                        setItemUomMap((prev) => ({
                            ...prev,
                            [String(inv.item?.id)]: uoms,
                        }));

                        return {
                            item_id: String(inv.item?.id ?? ""),
                            uom_id: String(inv.item_uom?.id ?? ""),
                            capacity: String(inv.capacity ?? ""),
                            UOM: uoms.map((u: any) => ({
                                label: u.name,
                                value: String(u.id),
                            })),
                        };
                    }) || [];

                setItemData(rows.length ? rows : itemData);
            } catch {
                showSnackbar("Failed to load stock data", "error");
            } finally {
                setLoading(false);
            }
        })();
    }, [id, isEditMode]);

    /* -------------------------------------------------------------------------- */
    /*                               ITEM HANDLERS                                */
    /* -------------------------------------------------------------------------- */

    const updateItem = (index: number, field: keyof ItemRow, value: string) => {
        setItemData((prev) => {
            const copy = [...prev];
            (copy[index] as any)[field] = value;
            return copy;
        });
    };

    const handleItemChange = (index: number, itemId: string) => {
        const uoms = itemUomMap[itemId] || [];

        setItemData((prev) => {
            const copy = [...prev];
            copy[index] = {
                ...copy[index],
                item_id: itemId,
                uom_id: "",
                UOM: uoms.map((u: any) => ({
                    label: u.name,
                    value: String(u.id),
                })),
            };
            return copy;
        });
    };

    const addNewItem = () => {
        setItemData((prev) => [
            ...prev,
            { item_id: "", uom_id: "", capacity: "", UOM: [] },
        ]);
    };

    const removeItem = (index: number) => {
        if (itemData.length === 1) return;
        setItemData((prev) => prev.filter((_, i) => i !== index));
    };

    /* -------------------------------------------------------------------------- */
    /*                               ITEM SEARCH                                  */
    /* -------------------------------------------------------------------------- */

    const fetchItems = useCallback(async (search = "") => {
        const res = await itemGlobalSearch({ qsearch: search, per_page: "50" });

        const options =
            res?.data?.map((item: any) => {
                setItemUomMap((prev) => ({
                    ...prev,
                    [String(item.id)]: item.item_uoms || [],
                }));

                return {
                    label: item.erp_code
                        ? `${item.erp_code} - ${item.name}`
                        : item.name,
                    value: String(item.id),
                };
            }) || [];

        setSearchedItemOptions(options);
        return options;
    }, []);

    useEffect(() => {
        fetchItems("");
    }, [fetchItems]);

    /* -------------------------------------------------------------------------- */
    /*                                 SUBMIT                                     */
    /* -------------------------------------------------------------------------- */

    const handleSubmit = async (values: FormikValues) => {
        try {
            await Yup.array().of(itemRowSchema).validate(itemData, {
                abortEarly: false,
            });

            setLoading(true);

            const payload = {
                code,
                activity_name: values.activity_name,
                date_from: values.from,
                date_to: values.to,
                assign_customers: values.customer.map(Number),
                assign_inventory: itemData.map((i) => ({
                    item_id: Number(i.item_id),
                    item_uom: String(i.uom_id),
                    capacity: Number(i.capacity),
                })),
            };

            const res = isEditMode
                ? await updateStockInStore(id as string, payload)
                : await addStockInStore(payload);

            if (res?.error) {
                showSnackbar("Failed to save stock", "error");
            } else {
                showSnackbar(
                    isEditMode ? "Stock updated" : "Stock added",
                    "success"
                );
                router.push("/stockinstore");
            }
        } catch {
            showSnackbar("Something went wrong", "error");
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
                <h1 className="text-lg font-semibold">
                    {isEditMode ? "Edit" : "Add"} Stock In Store
                </h1>
            </div>

            <ContainerCard>
                <Formik
                    enableReinitialize
                    initialValues={initialFormikValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ values, handleChange, submitForm }) => (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                                <InputFields
                                    label="Code"
                                    value={values.code}
                                    onChange={handleChange}
                                    disabled
                                />
                                <InputFields
                                    required
                                    label="Name"
                                    name="activity_name"
                                    value={values.activity_name}
                                    onChange={handleChange}
                                />
                                <InputFields
                                    required
                                    type="date"
                                    label="From"
                                    name="from"
                                    value={values.from}
                                    onChange={handleChange}
                                />
                                <InputFields
                                    required
                                    type="date"
                                    label="To"
                                    name="to"
                                    value={values.to}
                                    onChange={handleChange}
                                />
                                <InputFields
                                    required
                                    searchable
                                    isSingle={false}
                                    label="Customers"
                                    name="customer"
                                    options={companyCustomersOptions}
                                    value={values.customer}
                                    onChange={(e) =>
                                        handleChange({
                                            target: { name: "customer", value: e.target.value },
                                        })
                                    }
                                />
                            </div>

                            <div className="mt-6">
                                <Table
                                    data={itemData.map((r, i) => ({ ...r, idx: i }))}
                                    config={{
                                        columns: [
                                            {
                                                key: "item_id",
                                                label: "Item",
                                                render: (row) => (
                                                    <InputFields
                                                        searchable
                                                        options={searchedItemOptions}
                                                        value={row.item_id}
                                                        onSearch={fetchItems}
                                                        onChange={(e) =>
                                                            handleItemChange(row.idx, e.target.value)
                                                        }
                                                    />
                                                ),
                                            },
                                            {
                                                key: "uom_id",
                                                label: "UOM",
                                                render: (row) => (
                                                    <InputFields
                                                        searchable
                                                        options={row.UOM}
                                                        value={row.uom_id}
                                                        onChange={(e) =>
                                                            updateItem(
                                                                row.idx,
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
                                                        value={row.capacity}
                                                        onChange={(e) =>
                                                            updateItem(
                                                                row.idx,
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
                                                        onClick={() => removeItem(row.idx)}
                                                    >
                                                        <Icon
                                                            icon="hugeicons:delete-02"
                                                            width={20}
                                                        />
                                                    </button>
                                                ),
                                            },
                                        ],
                                    }}
                                />
                            </div>

                            <button
                                type="button"
                                className="text-red-500 mt-4 flex items-center gap-2"
                                onClick={addNewItem}
                            >
                                <Icon
                                    icon="material-symbols:add-circle-outline"
                                    width={20}
                                />
                                Add Item
                            </button>

                            <div className="flex justify-end mt-6">
                                <SidebarBtn
                                    label="Submit"
                                    isActive
                                    onClick={submitForm}
                                />
                            </div>
                        </>
                    )}
                </Formik>
            </ContainerCard>
        </div>
    );
}
