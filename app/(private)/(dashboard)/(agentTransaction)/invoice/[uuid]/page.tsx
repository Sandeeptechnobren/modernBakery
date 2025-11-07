"use client";

import ContainerCard from "@/app/components/containerCard";
import Table from "@/app/components/customTable";
import Logo from "@/app/components/logo";
import { Icon } from "@iconify-icon/react";
import { useRouter, useParams } from "next/navigation";
import { ChangeEvent, useState, useEffect, Fragment } from "react";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import KeyValueData from "@/app/components/keyValueData";
import InputFields from "@/app/components/inputFields";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import { createInvoice, updateInvoice, invoiceByUuid } from "@/app/services/agentTransaction";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useLoading } from "@/app/services/loadingContext";
import * as yup from "yup";

const dropdownDataList = [
    { icon: "humbleicons:radio", label: "Inactive", iconWidth: 20 },
    { icon: "hugeicons:delete-02", label: "Delete", iconWidth: 20 },
];

const data = new Array(2).fill(null).map((_, index) => ({
    id: index.toString(),
    itemCode: "MMGW001",
    itemName: "Masafi Pure 4 Gallons(1 Bottle)",
    UOM: "BOT",
    Quantity: "5.00",
    Price: "14.00",
    Excise: "0.00",
    Discount: "0.00",
    Net: "70.00",
    Vat: "3.50",
    Total: "73.50",
}));

const columns = [
    { key: "id", label: "#", width: 60 },
    { key: "itemName", label: "Item", width: 250 },
    { key: "UOM", label: "UOM" },
    { key: "Quantity", label: "Quantity" },
    { key: "Discount", label: "Discount" },
    { key: "Vat", label: "VAT" },
    { key: "Net", label: "Net Amount" },
    { key: "Total", label: "Total" }
];

const keyValueData = [
    { key: "Gross Total", value: "AED 84.00" },
    { key: "Discount", value: "AED 0.00" },
    { key: "Net Total", value: "AED 70.00" },
    { key: "Excise", value: "AED 0.00" },
    { key: "Vat", value: "AED 3.50" },
    { key: "Delivery Charges", value: "AED 0.00" },
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

    const [form, setForm] = useState({
        customerType: "",
        warehouse: "",
        route: "",
        customer: "",
        invoice_type: "",
        invoice_date: new Date().toISOString().slice(0, 10),
        note: "",
        transactionType: "1",
        paymentTerms: "1",
        paymentTermsUnit: "1",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const [itemData, setItemData] = useState([{
        item_id: "",
        itemName: "",
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

    // Validation schema
    const validationSchema = yup.object().shape({
        invoice_type: yup.string().required("Invoice type is required"),
        warehouse: yup.string().required("Warehouse is required"),
        customer: yup.string().required("Customer is required"),
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
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
    const finalTotal = grossTotal + totalVat;

    // Create Payload for API
    const generatePayload = () => {
        return {
            invoice_type: Number(form.invoice_type),
            warehouse_id: Number(form.warehouse),
            customer_id: Number(form.customer),
            customer_type: form.customerType ? Number(form.customerType) : undefined,
            route_id: form.route ? Number(form.route) : undefined,
            invoice_date: form.invoice_date,
            gross_total: Number(grossTotal.toFixed(2)),
            discount: Number(discount.toFixed(2)),
            vat: Number(totalVat.toFixed(2)),
            total: Number(finalTotal.toFixed(2)),
            comment: form.note || "",
            transaction_type: Number(form.transactionType),
            payment_terms: Number(form.paymentTerms),
            payment_terms_unit: Number(form.paymentTermsUnit),
            details: itemData
                .filter(item => item.item_id && item.uom_id)
                .map((item) => ({
                    item_id: Number(item.item_id),
                    uom_id: Number(item.uom_id),
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

    // Submit handler
    const handleSubmit = async () => {
        if (isSubmitting) return; // Prevent multiple submissions

        try {
            // Validate form using yup schema
            await validationSchema.validate(form, { abortEarly: false });
            setErrors({});

            // Validate that at least one item is added
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
                        {isEditMode ? "Edit Invoice" : "Add Invoice"}
                    </h1>
                </div>
            </div>
            <ContainerCard className="rounded-[10px] space-y-[40px] scrollbar-none">
                <div className="flex justify-between flex-wrap gap-[20px]">
                    <div className="flex flex-col gap-[10px]">
                        <Logo type="full" />
                        <span className="text-primary font-normal text-[16px]">
                            Emma-Köhler-Allee 4c, Germering - 13907
                        </span>
                    </div>

                    <div className="flex flex-col">
                        <span className="text-[42px] uppercase text-[#A4A7AE] mb-[10px]">
                            Invoice
                        </span>
                        <span className="text-primary text-[14px] tracking-[10px]">
                            #W1O20933
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
                    {form.invoice_type === "0" && (
                        <>
                            <InputFields
                                required
                                label="Warehouse"
                                name="warehouse"
                                searchable={true}
                                value={form.warehouse}
                                options={warehouseOptions}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    handleChange(e);
                                    setForm(prev => ({ ...prev, customer: "" }));
                                    if (val) {
                                        fetchAgentCustomerOptions(val);
                                    }
                                }}
                                error={errors.warehouse}
                            />
                            <InputFields
                                required
                                label="Delivery"
                                name="customer"
                                searchable={true}
                                value={form.customer}
                                options={agentCustomerOptions}
                                onChange={handleChange}
                                error={errors.customer}
                            />
                        </>
                    )}
                    {form.invoice_type === "1" && (
                        <>
                            <InputFields
                                label="Customer Type"
                                name="customerType"

                                value={form.customerType}
                                options={[
                                    { label: "Agent Customer", value: "1" },
                                    { label: "Company Customer", value: "2" },
                                ]}
                                onChange={handleChange}
                            />
                            <InputFields
                                required
                                label="Warehouse"
                                name="warehouse"
                                searchable={true}
                                value={form.warehouse}
                                options={warehouseOptions}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    handleChange(e);
                                    setForm(prev => ({ ...prev, customer: "" }));
                                    if (val) {
                                        fetchAgentCustomerOptions(val);
                                    }
                                }}
                                error={errors.warehouse}
                            />
                            <InputFields
                                label="Route"
                                name="route"
                                value={form.route}
                                options={routeOptions}
                                onChange={handleChange}
                            />
                            <InputFields
                                required
                                label="Customer"
                                name="customer"
                                searchable={true}
                                value={form.customer}
                                options={agentCustomerOptions}
                                onChange={handleChange}
                                error={errors.customer}
                            />
                            <InputFields
                                label="Invoice Date"
                                type="date"
                                name="invoice_date"
                                value={form.invoice_date}
                                onChange={handleChange}
                            />
                        </>
                    )}
                </div>

                <Table
                    data={itemData.map((row, idx) => ({ ...row, idx: idx.toString() }))}
                    config={{
                        columns: [
                            {
                                key: "itemName",
                                label: "Item Name",
                                width: 390,
                                render: (row) => (
                                    <div style={{ minWidth: '390px', maxWidth: '390px' }}>
                                        <InputFields
                                            label=""
                                            name="itemName"
                                            searchable={true}
                                            options={itemOptions}
                                            value={row.item_id}
                                            onChange={(e) => {
                                                const selectedItemId = e.target.value;
                                                const newData = [...itemData];
                                                const index = Number(row.idx);
                                                newData[index].item_id = selectedItemId;
                                                newData[index].itemName = selectedItemId;

                                                const selectedItem = itemOptions.find(item => item.value === selectedItemId);
                                                if (selectedItem && selectedItem.uoms && selectedItem.uoms.length > 0) {
                                                    const uomOpts = selectedItem.uoms.map(uom => ({
                                                        value: uom.id || "",
                                                        label: uom.name || "",
                                                        price: uom.price || "0"
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
                                        />
                                    </div>
                                ),
                            },
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
                                render: (row) => row.Price || "0.00"
                            },
                            {
                                key: "Discount",
                                label: "Discount",
                                render: (row) => row.Discount || "0.00"
                            },
                            {
                                key: "Net",
                                label: "Net",
                                render: (row) => row.Net || "0.00"
                            },
                            {
                                key: "Vat",
                                label: "VAT",
                                render: (row) => row.Vat || "0.00"
                            },
                            {
                                key: "Total",
                                label: "Total",
                                render: (row) => row.Total || "0.00"
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
                            <div className="flex space-x-[10px]">
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
                            </div>
                        </div>

                        <div className="flex flex-col gap-[10px] w-full lg:w-[350px] border-b-[1px] border-[#D5D7DA]">
                            {[
                                { key: "Gross Total", value: `AED ${grossTotal.toFixed(2)}` },
                                { key: "Discount", value: `AED ${discount.toFixed(2)}` },
                                { key: "Net Total", value: `AED ${netAmount.toFixed(2)}` },
                                { key: "VAT", value: `AED ${totalVat.toFixed(2)}` },
                                { key: "Delivery Charges", value: "AED 0.00" },
                            ].map((item) => (
                                <Fragment key={item.key}>
                                    <KeyValueData data={[item]} />
                                    <hr className="text-[#D5D7DA]" />
                                </Fragment>
                            ))}
                            <div className="font-semibold text-[#181D27] text-[18px] flex justify-between mt-2 mb-2">
                                <span>Total</span>
                                <span>AED {finalTotal.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="flex flex-col justify-end gap-[20px] w-full lg:hidden lg:w-[400px]">
                            <div className="flex flex-col space-y-[10px]">
                                <div className="font-semibold text-[#181D27]">
                                    Note
                                </div>
                                <div>
                                    Lorem ipsum, dolor sit amet consectetur
                                    adipisicing elit. Sed dolor enim voluptatem
                                    harum delectus perferendis atque fugiat
                                    commodi maxime beatae.
                                </div>
                            </div>
                            <div className="flex flex-col space-y-[10px]">
                                <div className="font-semibold text-[#181D27]">
                                    Transaction Type
                                </div>
                                <div>Payment On Delivery.</div>
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
