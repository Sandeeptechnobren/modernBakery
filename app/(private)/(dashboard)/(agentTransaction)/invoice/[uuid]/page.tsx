"use client";

import ContainerCard from "@/app/components/containerCard";
import Table from "@/app/components/customTable";
import Logo from "@/app/components/logo";
import { Icon } from "@iconify-icon/react";
import { useRouter, useParams } from "next/navigation";
import { ChangeEvent, useState, useEffect, Fragment, useCallback, useRef } from "react";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import KeyValueData from "@/app/components/keyValueData";
import InputFields from "@/app/components/inputFields";
import AutoSuggestion from "@/app/components/autoSuggestion";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import { createInvoice, updateInvoice, invoiceByUuid, deliveryList } from "@/app/services/agentTransaction";
import { warehouseListGlobalSearch, routeList, getCompanyCustomers, agentCustomerList, itemGlobalSearch, genearateCode, saveFinalCode } from "@/app/services/allApi";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useLoading } from "@/app/services/loadingContext";
import * as yup from "yup";
import { FormikValues } from "formik";
import toInternationalNumber from "@/app/(private)/utils/formatNumber";

// Local types to avoid any
type Option = { value: string; label: string; code?: string; name?: string };

interface ItemUom {
    id: string;
    name: string;
    price?: string | number;
}

interface FullItem {
    id: string;
    // Some APIs/key usages call this `code` and some `item_code` – keep both optional to be defensive
    code?: string;
    item_code?: string;
    name?: string;
    uom: ItemUom[];
}

interface Warehouse {
    id: number | string;
    warehouse_code?: string;
    warehouse_name?: string;
}

interface RouteItem {
    id: number | string;
    route_code?: string;
    route_name?: string;
}

interface CustomerLike {
    id: number | string;
    outlet_name?: string;
    customer_name?: string;
    name?: string;
    osa_code?: string;
    business_name?: string;
}

interface DeliveryDetail {
    // Some APIs provide nested item object, some provide flat item_id/code/name fields — accept both
    item?: { id?: number | string; code?: string; name?: string };
    item_id?: number | string;
    code?: string;
    item_name?: string;
    uom_id?: number | string;
    uom_name?: string;
    item_price?: number | string;
    itemvalue?: number | string;
    excise?: number | string;
    net?: number | string;
    vat?: number | string;
    total?: number | string;
    quantity?: number | string;
    discount?: number | string;
}

interface Delivery {
    id?: number | string;
    delivery_code?: string;
    customer?: { id?: number | string; outlet_name?: string; name?: string };
    route?: { id?: number | string; code?: string; name?: string };
    salesman?: { id?: number | string; code?: string; name?: string };
    comment?: string;
    details?: DeliveryDetail[];
    route_id?: number | string;
    salesman_id?: number | string;
    customer_id?: number | string; // sometimes explicit
}

interface InvoiceItemRow {
    item_id: string;
    itemName: string;
    itemLabel: string; // Store the display label separately
    UOM: string;
    uom_id: string;
    Quantity: string;
    Price: string;
    Excise: string;
    Discount: string;
    Net: string;
    Vat: string;
    Total: string;
}

// Helper to safely extract UOMs from unknown API shapes (item_uoms or uom)
const extractUoms = (source: unknown): ItemUom[] => {
    if (!Array.isArray(source)) return [];
    return source.map((u) => {
        const uu = u as Record<string, unknown>;
        return {
            id: String(uu.id ?? ''),
            name: String(uu.name ?? ''),
            price: (uu.price as string | number | undefined) ?? undefined,
        } as ItemUom;
    });
};

const dropdownDataList = [
    { icon: "humbleicons:radio", label: "Inactive", iconWidth: 20 },
    { icon: "hugeicons:delete-02", label: "Delete", iconWidth: 20 },
];


export default function InvoiceddEditPage() {
    const { warehouseOptions, agentCustomerOptions, routeOptions, itemOptions, fetchAgentCustomerOptions } = useAllDropdownListData();
    const { showSnackbar } = useSnackbar();
    const { setLoading } = useLoading();
    const router = useRouter();
    const params = useParams();

    const uuid = params?.uuid as string | undefined;
    const isEditMode = uuid !== undefined && uuid !== "add";
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [skeleton, setSkeleton] = useState({
        route: false,
        customer: false,
        item: false,
    });
    const [form, setForm] = useState({
        customerType: "",
        warehouse: "",
        warehouse_name: "",
        route: "",
        route_name: "",
        customer: "",
        customer_name: "",
        invoice_type: "",
        invoice_date: new Date().toISOString().slice(0, 10),
        note: "",
        transactionType: "1",
        paymentTerms: "1",
        paymentTermsUnit: "1",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const [itemData, setItemData] = useState<InvoiceItemRow[]>([{
        item_id: "",
        itemName: "",
        itemLabel: "",
        UOM: "",
        uom_id: "",
        Quantity: "1",
        Price: "",
        Excise: "",
        Discount: "",
        Net: "",
        Vat: "",
        Total: "",
    }]);

    // Store UOM options for each row
    const [rowUomOptions, setRowUomOptions] = useState<Record<string, { value: string; label: string; price?: string }[]>>({});

    // Store full item data for UOM lookup
    const [fullItemsData, setFullItemsData] = useState<Record<string, FullItem>>({});
    // Maintain a list of item options like the order page so selections persist
    const [itemsOptions, setItemsOptions] = useState<Option[]>([]);

    // Store full delivery data for auto-population
    const [deliveriesById, setDeliveriesById] = useState<Record<string, Delivery>>({});
    // Control and optimize item search calls
    const itemSearchCacheRef = useRef<Record<string, { ts: number; options: (Option & { uoms?: ItemUom[] })[] }>>({});
    const lastItemSearchRef = useRef<string>("");
    const [suppressItemSearch, setSuppressItemSearch] = useState(false);
    const codeGeneratedRef = useRef(false);
    const [code, setCode] = useState("");
    useEffect(() => {
        setLoading(true);

        if (isEditMode && uuid) {
            (async () => {
                try {
                    const res = await invoiceByUuid(uuid);
                    const data = res?.data ?? res;

                    if (res && !res.error && data) {
                        // set form fields
                        setForm({
                            customerType: data.customer_type ? String(data.customer_type) : "",
                            warehouse: data.warehouse_id ? String(data.warehouse_id) : "",
                            warehouse_name: data.warehouse_code && data.warehouse_name
                                ? `${data.warehouse_code} - ${data.warehouse_name}`
                                : (data.warehouse_name || ""),
                            route: data.route_id ? String(data.route_id) : "",
                            route_name: data.route_code && data.route_name
                                ? `${data.route_code} - ${data.route_name}`
                                : (data.route_name || ""),
                            customer: data.customer_id ? String(data.customer_id) : "",
                            customer_name: data.customer_name || "",
                            invoice_type: data.invoice_type !== undefined ? String(data.invoice_type) : "",
                            invoice_date: data.invoice_date || new Date().toISOString().slice(0, 10),
                            note: data.comment || "",
                            transactionType: data.transaction_type ? String(data.transaction_type) : "1",
                            paymentTerms: data.payment_terms ? String(data.payment_terms) : "1",
                            paymentTermsUnit: data.payment_terms_unit ? String(data.payment_terms_unit) : "1",
                        });

                        if (data.invoice_code) {
                            setCode(data.invoice_code);
                        }

                        // populate item rows and UOMs from invoice details
                        if (data.details && Array.isArray(data.details) && data.details.length > 0) {
                            const newRowUomOptions: Record<string, { value: string; label: string; price?: string }[]> = {};
                            const newFullItemsData: Record<string, FullItem> = { ...fullItemsData };

                            const loadedItems: InvoiceItemRow[] = data.details.map((detail: DeliveryDetail, index: number) => {
                                const itemId = String(detail.item_id ?? "");
                                const uomId = String(detail.uom_id ?? "");

                                const itemCode = detail.code || "";
                                const itemName = detail.item_name || "";
                                const itemLabel = itemCode && itemName ? `${itemCode} - ${itemName}` : (itemName || "");
                                const uomName = detail.uom_name || "";

                                if (uomId && uomName) {
                                    newRowUomOptions[String(index)] = [{
                                        value: uomId,
                                        label: uomName,
                                        price: String(detail.item_price ?? detail.itemvalue ?? "0"),
                                    }];
                                }

                                if (itemId) {
                                    newFullItemsData[itemId] = {
                                        id: itemId,
                                        code: itemCode || undefined,
                                        name: itemName || undefined,
                                        uom: uomId ? [{ id: uomId, name: uomName, price: String(detail.item_price ?? detail.itemvalue ?? "0") }] : [],
                                    };
                                }

                                return {
                                    item_id: itemId,
                                    itemName: itemName,
                                    itemLabel: itemLabel,
                                    UOM: uomName,
                                    uom_id: uomId,
                                    Quantity: String(detail.quantity ?? "1"),
                                    Price: String(detail.item_price ?? detail.itemvalue ?? ""),
                                    Excise: String(detail.excise ?? ""),
                                    Discount: String(detail.discount ?? ""),
                                    Net: String(detail.net ?? ""),
                                    Vat: String(detail.vat ?? ""),
                                    Total: String(detail.total ?? ""),
                                };
                            });

                            setFullItemsData(prev => ({ ...prev, ...newFullItemsData }));
                            setRowUomOptions(prev => ({ ...prev, ...newRowUomOptions }));
                            setItemData(loadedItems);
                        }
                    }
                } catch (error) {
                    console.error(error);
                    showSnackbar('Failed to load invoice', 'error');
                } finally {
                    setLoading(false);
                }
            })();
        } else {
            setLoading(false);
        }
    }, [isEditMode, uuid, setLoading, showSnackbar]);
    // Auto-generate invoice code in add mode only (prevent on edit)
    useEffect(() => {
        if (!isEditMode && !codeGeneratedRef.current) {
            codeGeneratedRef.current = true;
            (async () => {
                try {
                    setLoading(true);
                    const res = await genearateCode({ model_name: "invoice" });
                    if (res?.code) {
                        setCode(res.code);
                    }
                } catch (err) {
                    console.error("Failed to generate invoice code:", err);
                    showSnackbar("Failed to generate invoice code", "error");
                } finally {
                    setLoading(false);
                }
            })();
        }
    }, [isEditMode, setLoading, showSnackbar]);
    // Search functions for AutoSuggestion components
    const handleWarehouseSearch = useCallback(async (searchText: string) => {
        try {
            const response = await warehouseListGlobalSearch({ query: searchText, status: "active", invoice_date: form.invoice_date });
            const data: Warehouse[] = Array.isArray(response?.data) ? (response.data as Warehouse[]) : [];
            const options: Option[] = data.map((warehouse) => ({
                value: String(warehouse.id),
                label: `${warehouse.warehouse_code || ""} - ${warehouse.warehouse_name || ""}`,
                code: warehouse.warehouse_code,
                name: warehouse.warehouse_name,
            }));
            return options;
        } catch (error) {
            console.error('Error fetching warehouses:', error);
            showSnackbar('Failed to search warehouses', 'error');
            return [];
        }
    }, [showSnackbar]);

    const handleRouteSearch = useCallback(async (searchText: string) => {
        if (!form.warehouse) {
            return [];
        }
        try {
            const response = await routeList({
                warehouse_id: form.warehouse,
                search: searchText,
                per_page: "50"
            });
            const data: RouteItem[] = Array.isArray(response?.data) ? (response.data as RouteItem[]) : [];
            const options: Option[] = data.map((route) => ({
                value: String(route.id),
                label: `${route.route_code || ''} - ${route.route_name || ''}`,
                code: route.route_code,
                name: route.route_name,
            }));
            return options;
        } catch (error) {
            console.error('Error fetching routes:', error);
            showSnackbar('Failed to search routes', 'error');
            return [];
        }
    }, [form.warehouse, showSnackbar]);

    const handleCustomerSearch = useCallback(async (searchText: string) => {
        if (!form.route) {
            return [];
        }
        try {
            let response;
            if (form.customerType === "2") {
                // Company customer
                response = await getCompanyCustomers({
                    route_id: form.route,
                    search: searchText,
                    per_page: "50"
                });
            } else {
                // Agent customer (default)
                response = await agentCustomerList({
                    route_id: form.route,
                    search: searchText,
                    per_page: "50"
                });
            }
            const data: CustomerLike[] = Array.isArray(response?.data) ? (response.data as CustomerLike[]) : [];
            const options: Option[] = data.map((customer) => {
                if (form.customerType === "2") {
                    // Show osa_code - business_name for company customer
                    return {
                        value: String(customer.id),
                        label: `${customer.osa_code || ""} - ${customer.business_name || ""}`.trim(),
                        name: customer.business_name || "",
                    };
                } else {
                    // Agent customer
                    return {
                        value: String(customer.id),
                        label: `${customer.osa_code || ""} - ${customer.outlet_name || ""}`,
                        name: customer.outlet_name || customer.customer_name || customer.name || '',
                    };
                }
            });
            return options;
        } catch (error) {
            console.error('Error fetching customers:', error);
            showSnackbar('Failed to search customers', 'error');
            return [];
        }
    }, [form.route, form.customerType, showSnackbar]);

    const handleItemSearch = useCallback(async (searchText: string) => {
        // Prevent searches while we're auto-populating items from a delivery selection
        if (suppressItemSearch) {
            // Reset the flag after blocking one search
            setSuppressItemSearch(false);
            return [];
        }
        // Avoid API calls for empty/very short queries
        const qRaw = (searchText || "").trim();
        if (qRaw.length < 1) return [];
        const q = qRaw.toLowerCase();

        // Return cached results if available (30s TTL)
        const cached = itemSearchCacheRef.current[q];
        const now = Date.now();
        if (cached && now - cached.ts < 30_000) {
            return cached.options;
        }

        // Skip duplicate back-to-back queries
        if (lastItemSearchRef.current === q && cached) {
            return cached.options;
        }

        try {
            const response = await itemGlobalSearch({
                query: q,
            });
            const data = Array.isArray(response?.data) ? (response.data as unknown[]) : [];

            // Normalize and store full item data for later UOM lookup
            const itemsMap: Record<string, FullItem> = {};
            const options: (Option & { uoms?: ItemUom[] })[] = data.map((raw) => {
                const rawItem = raw as Record<string, unknown>;
                const item = rawItem as Partial<FullItem> & { id?: string | number; item_code?: string; code?: string; name?: string; uom?: ItemUom[] };
                const id = String(item.id ?? '');

                // API may return UOMs as `item_uoms` or `uom`. Prefer `item_uoms` if present.
                const sourceUomsRaw = Array.isArray(rawItem['item_uoms'] as unknown)
                    ? rawItem['item_uoms']
                    : Array.isArray((item as Record<string, unknown>)['uom'] as unknown)
                        ? (item as Record<string, unknown>)['uom']
                        : [];
                const uomArr: ItemUom[] = extractUoms(sourceUomsRaw);

                const itemObj = item as Record<string, unknown>;
                const codeVal = typeof itemObj.item_code === 'string' ? String(itemObj.item_code) : (typeof itemObj.code === 'string' ? String(itemObj.code) : undefined);

                const normalized: FullItem = {
                    id,
                    item_code: codeVal,
                    name: item.name,
                    uom: uomArr,
                };
                if (id) itemsMap[id] = normalized;

                return {
                    value: id,
                    label: `${codeVal || ''} - ${item.name || ''}`.trim(),
                    code: codeVal,
                    name: item.name,
                    uoms: uomArr,
                };
            });

            if (Object.keys(itemsMap).length > 0) {
                setFullItemsData(prev => ({ ...prev, ...itemsMap }));
            }
            // Cache and return
            itemSearchCacheRef.current[q] = { ts: now, options };
            lastItemSearchRef.current = q;
            return options;
        } catch (error) {
            console.error('Error fetching items:', error);
            showSnackbar('Failed to search items', 'error');
            return [];
        }
    }, [showSnackbar, suppressItemSearch]);

    const handleDeliverySearch = useCallback(async (searchText: string) => {
        if (!form.warehouse) {
            return [];
        }
        try {
            const response = await deliveryList({
                warehouse_id: form.warehouse,
                search: searchText,
                per_page: "50"
            });
            const data: Delivery[] = Array.isArray(response?.data) ? (response.data as Delivery[]) : [];

            // Store full delivery data for later use
            const byId: Record<string, Delivery> = {};
            data.forEach((delivery) => {
                if (delivery?.id !== undefined) {
                    byId[String(delivery.id)] = delivery;
                }
            });
            setDeliveriesById(byId);

            const options: Option[] = data.map((delivery) => ({
                value: String(delivery.id ?? ''),
                label: `${delivery.delivery_code || ''} - ${delivery.customer?.outlet_name || delivery.customer?.name || 'No Customer'}`,
                code: delivery.delivery_code,
            }));
            return options;
        } catch (error) {
            console.error('Error fetching deliveries:', error);
            showSnackbar('Failed to search deliveries', 'error');
            return [];
        }
    }, [form.warehouse, showSnackbar]);

    // Build validation schema based on invoice type:
    // - If invoice_type === '0' (Against Delivery): require invoice_type, invoice_date, warehouse, customer (delivery)
    // - If invoice_type === '1' (Direct Invoice): require invoice_type, invoice_date, warehouse, route, customer, customerType
    const createValidationSchema = (values: typeof form) => {
        const base = {
            invoice_type: yup.string().required("Invoice Type is required"),
            invoice_date: yup.string().required("Invoice Date is required"),
            warehouse: yup.string().required("Warehouse is required"),
        };

        if (String(values.invoice_type) === "0") {
            return yup.object().shape({
                ...base,
                customer: yup.string().required("Delivery is required"),
            });
        }

        // Default / Direct Invoice
        return yup.object().shape({
            ...base,
            customerType: yup.string().required("Customer Type is required"),
            route: yup.string().required("Route is required"),
            customer: yup.string().required("Customer is required"),
        });
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        // Special handling when invoice type changes
        if (name === "invoice_type") {
            // If switching to Direct Invoice, clear delivery/customer and item rows
            if (value === "1") {
                setForm((prev) => ({
                    ...prev,
                    invoice_type: value,
                    customer: "",
                    customer_name: "",
                }));

                // Clear delivery cache and per-row UOMs
                setDeliveriesById({});
                setRowUomOptions({});

                // Reset items to a single empty row
                setItemData([
                    {
                        item_id: "",
                        itemName: "",
                        itemLabel: "",
                        UOM: "",
                        uom_id: "",
                        Quantity: "1",
                        Price: "",
                        Excise: "",
                        Discount: "",
                        Net: "",
                        Vat: "",
                        Total: "",
                    },
                ]);
            } else {
                // For other invoice types just update the value
                setForm((prev) => ({ ...prev, invoice_type: value }));
            }

            // Clear any existing invoice_type validation error
            if (errors.invoice_type) {
                setErrors((prev) => ({ ...prev, invoice_type: "" }));
            }

            return;
        }

        setForm({ ...form, [name]: value });
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    // Calculate totals and VAT dynamically
    const recalculateItem = (index: number, field: string, value: string) => {
        const newData = [...itemData];
        const item = newData[index];
        item[field as keyof typeof item] = value;

        const qty = Number(item.Quantity) || 0;
        const price = Number(item.Price) || 0;
        const total = qty * price;
        const vat = total * 0.18; // 18% VAT
        const net = total - vat;

        item.Total = total.toFixed(2);
        item.Vat = vat.toFixed(2);
        item.Net = net.toFixed(2);

        setItemData(newData);
    };

    const handleAddNewItem = () => {
        setItemData([
            ...itemData,
            {
                item_id: "",
                itemName: "",
                itemLabel: "",
                UOM: "",
                uom_id: "",
                Quantity: "1",
                Price: "",
                Excise: "",
                Discount: "",
                Net: "",
                Vat: "",
                Total: "",
            },
        ]);
    };

    const handleRemoveItem = (index: number) => {
        if (itemData.length <= 1) {
            setItemData([
                {
                    item_id: "",
                    itemName: "",
                    itemLabel: "",
                    UOM: "",
                    uom_id: "",
                    Quantity: "1",
                    Price: "",
                    Excise: "",
                    Discount: "",
                    Net: "",
                    Vat: "",
                    Total: "",
                },
            ]);
            return;
        }
        setItemData(itemData.filter((_, i) => i !== index));
    };

    // Compute totals for summary
    const grossTotal = itemData.reduce(
        (sum, item) => sum + Number(item.Total || 0),
        0
    );
    const totalVat = itemData.reduce(
        (sum, item) => sum + Number(item.Vat || 0),
        0
    );
    const netAmount = itemData.reduce(
        (sum, item) => sum + Number(item.Net || 0),
        0
    );
    const discount = itemData.reduce(
        (sum, item) => sum + Number(item.Discount || 0),
        0
    );
    // Align with delivery page: final total should be net + VAT (which equals gross total)
    // Previous implementation added grossTotal + totalVat causing VAT to be counted twice.
    const finalTotal = totalVat + netAmount;

    // Create Payload for API
    const generatePayload = () => {
        // If Against Delivery (invoice_type === "0"), enrich from selected delivery
        let routeId: number | undefined = undefined;
        let salesmanId: number | undefined = undefined;
        let customerId: number | undefined = undefined;
        if (form.invoice_type === "0" && form.customer) {
            const selectedDelivery = deliveriesById[form.customer];
            if (selectedDelivery) {
                const maybeRouteId = selectedDelivery.route_id ?? selectedDelivery.route?.id;
                const maybeSalesmanId = selectedDelivery.salesman_id ?? selectedDelivery.salesman?.id;
                const maybeCustomerId = selectedDelivery.customer_id ?? selectedDelivery.customer?.id;

                routeId = maybeRouteId !== undefined ? Number(maybeRouteId) : undefined;
                salesmanId = maybeSalesmanId !== undefined ? Number(maybeSalesmanId) : undefined;
                customerId = maybeCustomerId !== undefined ? Number(maybeCustomerId) : (form.customer ? Number(form.customer) : undefined);
            }
        } else {
            customerId = form.customer ? Number(form.customer) : undefined;
            routeId = form.route ? Number(form.route) : undefined;
        }

        const now = new Date();
        const invoiceTime = now.toTimeString().split(' ')[0];
        const deliveryId = form.invoice_type === "0" && form.customer ? Number(form.customer) : undefined;

        return {
            invoice_type: Number(form.invoice_type),
            warehouse_id: Number(form.warehouse),
            customer_id: customerId,
            delivery_id: deliveryId,
            customer_type: form.customerType ? Number(form.customerType) : undefined,
            route_id: routeId,
            salesman_id: salesmanId,
            invoice_date: form.invoice_date,
            invoice_time: invoiceTime,
            gross_total: Number(grossTotal.toFixed(2)),
            discount: Number(discount.toFixed(2)),
            vat: Number(totalVat.toFixed(2)),
            net_total: Number(netAmount.toFixed(2)),
            total_amount: Number(finalTotal.toFixed(2)),
            comment: form.note || "",
            transaction_type: Number(form.transactionType),
            payment_terms: Number(form.paymentTerms),
            payment_terms_unit: Number(form.paymentTermsUnit),
            status: "1",
            details: itemData
                .filter(item => item.item_id && item.uom_id)
                .map((item) => ({
                    item_id: Number(item.item_id),
                    uom: Number(item.uom_id),
                    quantity: Number(item.Quantity) || 0,
                    item_price: Number(item.Price) || 0,
                    vat: Number(item.Vat) || 0,
                    discount: Number(item.Discount) || 0,
                    excise: Number(item.Excise) || 0,
                    gross_total: Number(item.Total) || 0,
                    net_total: Number(item.Net) || 0,
                    total: Number(item.Total) || 0,
                })),
        };
    };
    const handleSubmit = async () => {
        if (isSubmitting) return;
        try {
            const schema = createValidationSchema(form);
            await schema.validate(form, { abortEarly: false });
            setErrors({});
            const validItems = itemData.filter(item => item.item_id && item.uom_id);
            if (validItems.length === 0) {
                showSnackbar("Please add at least one item with UOM selected", "error");
                return;
            }

            setIsSubmitting(true);
            const payload = generatePayload();

            let res;
            if (isEditMode && uuid) {
                // Update existing invoice
                res = await updateInvoice(uuid, payload);
            } else {
                // Create new invoice
                res = await createInvoice(payload);
            }

            // Check if response contains an error
            if (res?.error) {
                showSnackbar(
                    res.data?.message || (isEditMode ? "Failed to update invoice" : "Failed to create invoice"),
                    "error"
                );
                setIsSubmitting(false);
                return;
            }

            // Save the generated code after successful creation (add mode only)
            if (!isEditMode && code) {
                try {
                    await saveFinalCode({
                        reserved_code: code,
                        model_name: "invoice",
                    });
                } catch (e) {
                    // Optionally handle error, but don't block success
                    console.error("Failed to save final code:", e);
                }
            }

            // Success
            showSnackbar(
                isEditMode
                    ? "Invoice updated successfully!"
                    : "Invoice created successfully!",
                "success"
            );
            router.push("/invoice");
        } catch (error) {
            if (error instanceof yup.ValidationError) {
                // Handle yup validation errors
                const formErrors: Record<string, string> = {};
                error.inner.forEach((err) => {
                    if (err.path) {
                        formErrors[err.path] = err.message;
                    }
                });
                setErrors(formErrors);
            } else {
                console.error("Error saving invoice:", error);

                // Extract error message from API response
                let errorMessage = isEditMode
                    ? "Failed to update invoice. Please try again."
                    : "Failed to create invoice. Please try again.";

                if (error && typeof error === 'object') {
                    // Check for error message in response
                    if ('response' in error && error.response && typeof error.response === 'object') {
                        const response = error.response as { data?: { message?: string } };
                        if (response.data?.message) {
                            errorMessage = response.data.message;
                        }
                    } else if ('data' in error && error.data && typeof error.data === 'object') {
                        const data = error.data as { message?: string };
                        if (data.message) {
                            errorMessage = data.message;
                        }
                    } else if ('message' in error && typeof error.message === 'string') {
                        errorMessage = error.message;
                    }
                }

                showSnackbar(errorMessage, "error");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFormReadyForItems = (() => {
        if (String(form.invoice_type) === "0") {
            return [form.warehouse, form.customer, form.invoice_type, form.invoice_date].every(Boolean);
        }
        return [form.customerType, form.route, form.warehouse, form.customer, form.invoice_type, form.invoice_date].every(Boolean);
    })();

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-[20px]">
                <div className="flex items-center gap-[16px]">
                    <Icon
                        icon="lucide:arrow-left"
                        width={24}
                        onClick={() => router.back()}
                    />
                    <h1 className="text-[20px] font-semibold text-[#181D27] flex items-center leading-[30px] mb-[4px]">
                        {isEditMode ? "Update Invoice" : "Add Invoice"}
                    </h1>
                </div>
            </div>
            <ContainerCard className="rounded-[10px] space-y-[40px] scrollbar-none">
                <div className="flex justify-between flex-wrap gap-[20px]">
                    <div className="flex flex-col gap-[10px]">
                        <Logo type="full" />
                    </div>

                    <div className="flex flex-col items-end">
                        <span className="text-[42px] uppercase text-[#A4A7AE] mb-[10px]">
                            Invoice
                        </span>
                        <span className="text-primary text-[14px] tracking-[10px]">
                            #{code}
                        </span>
                    </div>
                </div>
                <hr className="text-[#D5D7DA]" />

                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto flex-wrap">
                    <InputFields
                        required
                        label="Invoice type"
                        name="invoice_type"
                        value={form.invoice_type}
                        options={[
                            { label: "Against Delivery", value: "0" },
                            { label: "Direct Invoice", value: "1" },
                        ]}
                        onChange={handleChange}
                        error={errors.invoice_type}
                    />
                    <InputFields
                        required
                        label="Invoice Date"
                        type="date"
                        name="invoice_date"
                        value={form.invoice_date}
                        onChange={handleChange}
                        error={errors.invoice_date}
                    />
                    {form.invoice_type === "0" && (
                        <>
                            <AutoSuggestion
                                required
                                label="Warehouse"
                                name="warehouse"
                                placeholder="Search warehouse..."
                                initialValue={form.warehouse_name}
                                onSearch={(searchText) => handleWarehouseSearch(searchText)}
                                onSelect={(option) => {
                                    setForm(prev => ({
                                        ...prev,
                                        warehouse: option.value,
                                        warehouse_name: option.label,
                                        customer: "",
                                        customer_name: "",
                                    }));
                                    if (errors.warehouse) {
                                        setErrors(prev => ({ ...prev, warehouse: "" }));
                                    }
                                }}
                                onClear={() => {
                                    setForm(prev => ({
                                        ...prev,
                                        warehouse: "",
                                        warehouse_name: "",
                                        customer: "",
                                        customer_name: "",
                                    }));
                                }}
                                error={errors.warehouse}
                            />
                            <AutoSuggestion
                                required
                                label="Delivery"
                                name="customer"
                                placeholder="Search delivery..."
                                initialValue={form.customer_name}
                                onSearch={handleDeliverySearch}
                                onSelect={(option: Option) => {
                                    // Temporarily suppress item search calls while we auto-populate rows
                                    setSuppressItemSearch(true);
                                    setForm(prev => ({
                                        ...prev,
                                        customer: option.value,
                                        customer_name: option.label,
                                    }));
                                    if (errors.customer) {
                                        setErrors(prev => ({ ...prev, customer: "" }));
                                    }

                                    // Auto-populate items from selected delivery
                                    const selectedDelivery = deliveriesById[option.value];
                                    if (selectedDelivery && Array.isArray(selectedDelivery.details)) {
                                        const newRowUomOptions: Record<string, { value: string; label: string; price?: string }[]> = {};
                                        const newFullItemsData: Record<string, FullItem> = { ...fullItemsData };

                                        const loadedItemData: InvoiceItemRow[] = selectedDelivery.details.map((detail: DeliveryDetail, index: number) => {
                                            const itemId = String(detail.item?.id ?? "");
                                            const uomId = String(detail.uom_id ?? "");

                                            // Extract item code and name from delivery detail
                                            const itemCode = detail.item?.code || "";
                                            const itemName = detail.item?.name || "";
                                            const itemLabel = itemCode && itemName ? `${itemCode} - ${itemName}` : itemId;

                                            // Always create UOM option from delivery detail (this is the selected UOM)
                                            const uomName = detail.uom_name || "";
                                            const deliveryUomOption = uomId && uomName ? {
                                                value: String(uomId),
                                                label: uomName,
                                                price: String(detail.item_price || "0"),
                                            } : null;

                                            // Prefer UOMs provided in delivery detail (`item_uoms`) if available
                                            const detailObj = detail as Record<string, unknown>;
                                            const detailUomsRaw = Array.isArray(detailObj['item_uoms'] as unknown) ? detailObj['item_uoms'] : [];
                                            if (Array.isArray(detailUomsRaw) && detailUomsRaw.length > 0) {
                                                const uomOpts = extractUoms(detailUomsRaw).map(u => ({
                                                    value: String(u.id ?? ""),
                                                    label: u.name ?? "",
                                                    price: u.price !== undefined ? String(u.price) : "0",
                                                }));
                                                newRowUomOptions[index.toString()] = uomOpts;

                                                // Store full item data for future reference
                                                newFullItemsData[itemId] = {
                                                    id: itemId,
                                                    code: itemCode,
                                                    name: itemName,
                                                    uom: extractUoms(detailUomsRaw),
                                                };
                                            } else {
                                                // Check if we have more UOM options from itemOptions
                                                const typedItemOptions = itemOptions as Array<Option & { uoms?: ItemUom[] }>;
                                                const selectedItem = typedItemOptions.find((it) => it.value === itemId);
                                                if (selectedItem && Array.isArray(selectedItem.uoms) && selectedItem.uoms.length > 0) {
                                                    const uomOpts = selectedItem.uoms.map((uom: ItemUom) => ({
                                                        value: String(uom.id || ""),
                                                        label: uom.name || "",
                                                        price: (uom.price as string | number | undefined) ? String(uom.price) : "0",
                                                    }));
                                                    newRowUomOptions[index.toString()] = uomOpts;

                                                    // Store full item data for future reference
                                                    newFullItemsData[itemId] = {
                                                        id: itemId,
                                                        code: itemCode,
                                                        name: itemName,
                                                        uom: selectedItem.uoms,
                                                    };
                                                } else if (deliveryUomOption) {
                                                    // If no UOM options from itemOptions, use delivery detail UOM
                                                    newRowUomOptions[index.toString()] = [deliveryUomOption];

                                                    // Store minimal item data
                                                    newFullItemsData[itemId] = {
                                                        id: itemId,
                                                        code: itemCode,
                                                        name: itemName,
                                                        uom: [{
                                                            id: uomId,
                                                            name: uomName,
                                                            price: detail.item_price || "0",
                                                        }],
                                                    };
                                                }
                                            }

                                            const qty = Number(detail.quantity ?? 0);
                                            const price = Number(detail.item_price ?? 0);
                                            const discount = Number(detail.discount ?? 0);
                                            const total = qty * price;
                                            const vat = total * 0.18;
                                            const net = total - vat;

                                            return {
                                                item_id: itemId,
                                                itemName: itemLabel,
                                                itemLabel: itemLabel,
                                                UOM: uomId,
                                                uom_id: uomId,
                                                Quantity: String(qty || 1),
                                                Price: (Number(price) || 0).toFixed(2),
                                                Excise: "0.00",
                                                Discount: (Number(discount) || 0).toFixed(2),
                                                Net: net.toFixed(2),
                                                Vat: vat.toFixed(2),
                                                Total: total.toFixed(2),
                                            };
                                        });

                                        setFullItemsData(newFullItemsData);
                                        setRowUomOptions(newRowUomOptions);
                                        setItemData(loadedItemData);

                                        // Set note if available
                                        if (selectedDelivery.comment) {
                                            setForm((prev) => ({ ...prev, note: selectedDelivery.comment || prev.note }));
                                        }
                                    } else {
                                        // Reset if no details
                                        setRowUomOptions({});
                                        setItemData([
                                            {
                                                item_id: "",
                                                itemName: "",
                                                itemLabel: "",
                                                UOM: "",
                                                uom_id: "",
                                                Quantity: "1",
                                                Price: "",
                                                Excise: "",
                                                Discount: "",
                                                Net: "",
                                                Vat: "",
                                                Total: "",
                                            },
                                        ]);
                                    }
                                    // Re-enable item search shortly after rows are set to avoid AutoSuggestion remount spam
                                    setTimeout(() => setSuppressItemSearch(false), 300);
                                }}
                                onClear={() => {
                                    setForm(prev => ({
                                        ...prev,
                                        customer: "",
                                        customer_name: "",
                                    }));
                                    // Clear items when delivery is cleared
                                    setRowUomOptions({});
                                    setItemData([
                                        {
                                            item_id: "",
                                            itemName: "",
                                            itemLabel: "",
                                            UOM: "",
                                            uom_id: "",
                                            Quantity: "1",
                                            Price: "",
                                            Excise: "",
                                            Discount: "",
                                            Net: "",
                                            Vat: "",
                                            Total: "",
                                        },
                                    ]);
                                }}
                                error={errors.customer}
                                disabled={!form.warehouse}
                                noOptionsMessage={!form.warehouse ? "Please select a warehouse first" : "No deliveries found"}
                            />
                        </>
                    )}
                    {form.invoice_type === "1" && (
                        <>
                            <InputFields
                                required
                                label="Customer Type"
                                name="customerType"
                                value={form.customerType}
                                options={[
                                    { label: "Agent Customer", value: "1" },
                                    { label: "Company Customer", value: "2" },
                                ]}
                                onChange={handleChange}
                                error={errors.customerType}
                            />
                            <AutoSuggestion
                                required
                                label="Warehouse"
                                name="warehouse"
                                placeholder="Search warehouse..."
                                initialValue={form.warehouse_name}
                                onSearch={handleWarehouseSearch}
                                onSelect={(option) => {
                                    setForm(prev => ({
                                        ...prev,
                                        warehouse: option.value,
                                        warehouse_name: option.label,
                                        route: "",
                                        route_name: "",
                                        customer: "",
                                        customer_name: "",
                                    }));
                                    if (errors.warehouse) {
                                        setErrors(prev => ({ ...prev, warehouse: "" }));
                                    }
                                }}
                                onClear={() => {
                                    setForm(prev => ({
                                        ...prev,
                                        warehouse: "",
                                        warehouse_name: "",
                                        route: "",
                                        route_name: "",
                                        customer: "",
                                        customer_name: "",
                                    }));
                                }}
                                error={errors.warehouse}
                            />
                            <AutoSuggestion
                                required
                                label="Route"
                                name="route"
                                placeholder="Search route..."
                                initialValue={form.route_name}
                                onSearch={handleRouteSearch}
                                onSelect={(option) => {
                                    setForm(prev => ({
                                        ...prev,
                                        route: option.value,
                                        route_name: option.label,
                                        customer: "",
                                        customer_name: "",
                                    }));
                                    if (errors.route) {
                                        setErrors(prev => ({ ...prev, route: "" }));
                                    }
                                }}
                                onClear={() => {
                                    setForm(prev => ({
                                        ...prev,
                                        route: "",
                                        route_name: "",
                                        customer: "",
                                        customer_name: "",
                                    }));
                                }}
                                error={errors.route}
                                disabled={!form.warehouse}
                                noOptionsMessage={!form.warehouse ? "Please select a warehouse first" : "No routes found"}
                            />
                            <AutoSuggestion
                                required
                                label="Customer"
                                name="customer"
                                placeholder="Search customer..."
                                initialValue={form.customer_name}
                                onSearch={handleCustomerSearch}
                                onSelect={(option) => {
                                    setForm(prev => ({
                                        ...prev,
                                        customer: option.value,
                                        customer_name: option.label,
                                    }));
                                    if (errors.customer) {
                                        setErrors(prev => ({ ...prev, customer: "" }));
                                    }
                                }}
                                onClear={() => {
                                    setForm(prev => ({
                                        ...prev,
                                        customer: "",
                                        customer_name: "",
                                    }));
                                }}
                                error={errors.customer}
                                disabled={!form.route}
                                noOptionsMessage={!form.route ? "Please select a route first" : "No customers found"}
                            />

                        </>
                    )}
                </div>

                <Table
                    data={itemData.map((row, idx) => ({ ...row, idx: idx.toString() }))}
                    config={{
                        showNestedLoading: false,
                        columns: [
                            {
                                key: "itemName",
                                label: "Item Name",
                                width: 390,
                                render: (row) => {
                                    const selectedOpt = (() => {
                                        const selectedItemId = row.item_id;
                                        if (!selectedItemId) return null;
                                        // Try to find in global itemOptions first
                                        const typedItemOptions = itemOptions as Array<Option & { uoms?: ItemUom[] }>;
                                        const found = typedItemOptions?.find?.((it) => it.value === String(selectedItemId));
                                        if (found) return found;
                                        // Fallback to building a minimal option from the row label
                                        return { value: String(selectedItemId), label: row.itemLabel || String(selectedItemId) } as Option;
                                    })();

                                    return (
                                        <div style={{ minWidth: '390px', maxWidth: '390px' }}>
                                            <AutoSuggestion
                                                // Use stable key to prevent remount and auto-open on delivery selection
                                                key={`item-${row.idx}`}
                                                placeholder="Search item..."
                                                initialValue={row.itemLabel}
                                                selectedOption={selectedOpt ?? null}
                                                onSearch={handleItemSearch}
                                                onSelect={(option: Option & { uoms?: ItemUom[] }) => {
                                                const selectedItemId = option.value;
                                                const newData = [...itemData];
                                                const index = Number(row.idx);
                                                newData[index].item_id = selectedItemId;
                                                newData[index].itemName = selectedItemId;
                                                newData[index].itemLabel = option.label;
                                                let uomSource: ItemUom[] | undefined = undefined;
                                                const selectedItem = fullItemsData[selectedItemId];
                                                if (selectedItem && Array.isArray(selectedItem.uom) && selectedItem.uom.length > 0) {
                                                    uomSource = selectedItem.uom;
                                                } else {
                                                    const opt = option as Option & { uoms?: ItemUom[] };
                                                    if (Array.isArray(opt.uoms) && opt.uoms.length > 0) {
                                                        const uomArray: ItemUom[] = opt.uoms.map((u) => ({ id: String(u.id ?? ""), name: u.name ?? "", price: u.price }));
                                                        uomSource = uomArray;
                                                        setFullItemsData(prev => ({
                                                            ...prev,
                                                            [selectedItemId]: {
                                                                id: selectedItemId,
                                                                item_code: opt.code || undefined,
                                                                name: opt.name || undefined,
                                                                uom: uomArray,
                                                            }
                                                        }));
                                                    }
                                                }

                                                if (uomSource && uomSource.length > 0) {
                                                    const uomOpts = uomSource.map((uom: ItemUom) => ({
                                                        value: String(uom.id || ""),
                                                        label: uom.name || "",
                                                        price: (uom.price as string | number | undefined) ? String(uom.price) : "0"
                                                    }));

                                                    setRowUomOptions(prev => ({
                                                        ...prev,
                                                        [row.idx]: uomOpts
                                                    }));

                                                    const firstUom = uomOpts[0];
                                                    if (firstUom) {
                                                        newData[index].uom_id = firstUom.value;
                                                        newData[index].UOM = firstUom.value;
                                                        newData[index].Price = firstUom.price || "0";
                                                    }
                                                } else {
                                                    setRowUomOptions(prev => {
                                                        const newOpts = { ...prev };
                                                        delete newOpts[row.idx];
                                                        return newOpts;
                                                    });
                                                    newData[index].uom_id = "";
                                                    newData[index].UOM = "";
                                                    newData[index].Price = "0";
                                                }

                                                setItemData(newData);
                                                recalculateItem(index, "itemName", selectedItemId);
                                            }}
                                            onClear={() => {
                                                const newData = [...itemData];
                                                const index = Number(row.idx);
                                                newData[index].item_id = "";
                                                newData[index].itemName = "";
                                                newData[index].itemLabel = "";
                                                newData[index].uom_id = "";
                                                newData[index].UOM = "";
                                                newData[index].Price = "0";
                                                setRowUomOptions(prev => {
                                                    const newOpts = { ...prev };
                                                    delete newOpts[row.idx];
                                                    return newOpts;
                                                });
                                                setItemData(newData);
                                            }}
                                            disabled={!isFormReadyForItems && !row.item_id}
                                        />
                                    </div>
                                );
                            }},
                            {
                                key: "UOM",
                                label: "UOM",
                                width: 120,
                                render: (row) => {
                                    const uomOptions = rowUomOptions[row.idx] || [];
                                    return (
                                        <div style={{ minWidth: '120px', maxWidth: '120px' }}>
                                            <InputFields
                                                label=""
                                                name="UOM"
                                                options={uomOptions}
                                                value={row.uom_id}
                                                disabled={uomOptions.length === 0}
                                                onChange={(e) => {
                                                    const selectedUomId = e.target.value;
                                                    const selectedUom = uomOptions.find(uom => uom.value === selectedUomId);
                                                    const newData = [...itemData];
                                                    const index = Number(row.idx);
                                                    newData[index].uom_id = selectedUomId;
                                                    newData[index].UOM = selectedUomId;
                                                    if (selectedUom) {
                                                        newData[index].Price = selectedUom.price || "0";
                                                    }
                                                    setItemData(newData);
                                                    recalculateItem(index, "UOM", selectedUomId);
                                                }}
                                            />
                                        </div>
                                    );
                                },
                            },
                            {
                                key: "Quantity",
                                label: "Qty",
                                width: 100,
                                render: (row) => (
                                    <div style={{ minWidth: '100px', maxWidth: '100px' }}>
                                        <InputFields
                                            label=""
                                            type="number"
                                            name="Quantity"
                                            value={row.Quantity}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                const numValue = parseFloat(value);
                                                if (value === "") {
                                                    recalculateItem(Number(row.idx), "Quantity", value);
                                                } else if (numValue <= 0) {
                                                    recalculateItem(Number(row.idx), "Quantity", "1");
                                                } else {
                                                    recalculateItem(Number(row.idx), "Quantity", value);
                                                }
                                            }}
                                        />
                                    </div>
                                ),
                            },
                            {
                                key: "Price",
                                label: "Price",
                                render: (row) => toInternationalNumber(row.Price) || "0.00"
                            },
                            {
                                key: "preVat",
                                label: "Pre VAT",
                                render: (row) => toInternationalNumber(Number(row.Total) - Number(row.Vat)) || "0.00"
                            },
                            {
                                key: "Vat",
                                label: "VAT",
                                render: (row) => toInternationalNumber(row.Vat) || "0.00"
                            },
                            {
                                key: "Net",
                                label: "Net",
                                render: (row) => toInternationalNumber(row.Net) || "0.00"
                            },
                            {
                                key: "Total",
                                label: "Total",
                                render: (row) => toInternationalNumber(row.Total) || "0.00"
                            },
                            {
                                key: "action",
                                label: "Action",
                                render: (row) => (
                                    <button
                                        type="button"
                                        className={`${itemData.length <= 1
                                            ? "opacity-50 cursor-not-allowed"
                                            : ""
                                            } text-red-500 flex items-center`}
                                        onClick={() =>
                                            itemData.length > 1 && handleRemoveItem(Number(row.idx))
                                        }
                                    >
                                        <Icon icon="hugeicons:delete-02" width={20} />
                                    </button>
                                ),
                            },
                        ],
                    }}
                />

                {/* Add New Item */}
                <div className="mt-4">
                    <button
                        type="button"
                        className="text-[#E53935] font-medium text-[16px] flex items-center gap-2"
                        onClick={handleAddNewItem}
                    >
                        <Icon icon="material-symbols:add-circle-outline" width={20} />
                        Add New Item
                    </button>
                </div>

                <div className="flex justify-between text-primary">
                    <div></div>
                    <div className="flex justify-between flex-wrap w-full">
                        <div className="hidden flex-col justify-end gap-[20px] w-full lg:flex lg:w-[400px]">
                            <div className="flex flex-col space-y-[10px]">
                                <InputFields
                                    label="Note"
                                    type="textarea"
                                    name="note"
                                    placeholder="Enter Your Description"
                                    value={form.note}
                                    textareaCols={10}
                                    textareaResize={false}
                                    onChange={handleChange}
                                />
                            </div>
                            {/* <div className="flex space-x-[10px]">
                                <InputFields
                                    label="Payment Terms"
                                    name="paymentTerms"
                                    value={form.paymentTerms}
                                    placeholder=" "
                                    trailingElement={
                                        <select
                                            value={form.paymentTermsUnit}
                                            onChange={handleChange}
                                            className="h-full outline-0 bg-[#FAFAFA]"
                                        >
                                            <option value="1">Days</option>
                                            <option value="2">Months</option>
                                        </select>
                                    }
                                    onChange={handleChange}
                                />
                                <InputFields
                                    label="Transaction Type"
                                    name="transactionType"
                                    value={form.transactionType}
                                    options={[
                                        { label: "Cash", value: "1" },
                                        { label: "Online", value: "2" },
                                    ]}
                                    onChange={handleChange}
                                />
                            </div> */}
                        </div>

                        <div className="flex flex-col gap-[10px] w-full lg:w-[350px] border-b-[1px] border-[#D5D7DA]">
                            {[
                                // { key: "Gross Total", value: `AED ${grossTotal.toFixed(2)}` },
                                // { key: "Discount", value: `AED ${discount.toFixed(2)}` },
                                { key: "Net Total", value: `AED ${toInternationalNumber(netAmount)}` },
                                { key: "VAT", value: `AED ${toInternationalNumber(totalVat)}` },
                                { key: "VAT", value: `AED ${toInternationalNumber(netAmount - totalVat)}` },
                                // { key: "Delivery Charges", value: "AED 0.00" },
                            ].map((item) => (
                                <Fragment key={item.key}>
                                    <KeyValueData data={[item]} />
                                    <hr className="text-[#D5D7DA]" />
                                </Fragment>
                            ))}
                            <div className="font-semibold text-[#181D27] text-[18px] flex justify-between mt-2 mb-2">
                                <span>Total</span>
                                <span>AED {toInternationalNumber(finalTotal)}</span>
                            </div>
                        </div>


                    </div>
                </div>

                <hr className="text-[#D5D7DA]" />

                <div className="flex justify-end gap-4 mt-6">
                    <button
                        type="button"
                        className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
                        onClick={() => router.push("/invoice")}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <SidebarBtn
                        isActive={!isSubmitting}
                        label={
                            isSubmitting
                                ? (isEditMode ? "Updating Invoice..." : "Creating Invoice...")
                                : (isEditMode ? "Update Invoice" : "Create Invoice")
                        }
                        onClick={handleSubmit}
                    />
                </div>
            </ContainerCard>
        </div>
    );
}
