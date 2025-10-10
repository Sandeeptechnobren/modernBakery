"use client";

import ContainerCard from "@/app/components/containerCard";
import Table from "@/app/components/customTable";
import Logo from "@/app/components/logo";
import { Icon } from "@iconify-icon/react";
import { useRouter } from "next/navigation";
import { ChangeEvent, useState } from "react";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import KeyValueData from "@/app/components/keyValueData";
import InputFields from "@/app/components/inputFields";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";

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
    const { warehouseOptions, agentCustomerOptions } = useAllDropdownListData();
    const router = useRouter();
    const [showDropdown, setShowDropdown] = useState(false);
    const orderId = "#W1O20933";

    const [form, setForm] = useState({
        warehouse: "",
        customer: "",
        note: "",
        transactionType: "1",
        paymentTerms: "1",
        paymentTermsUnit: "1",
    });

    const [itemData, setItemData] = useState([{
        itemCode: "",
        itemName: "",
        UOM: "",
        Quantity: "",
        Price: "",
        Excise: "",
        Discount: "",
        Net: "",
        Vat: "",
        Total: "",
    }]);

const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    }

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
                        Add Invoice
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
                            {orderId}
                        </span>
                    </div>
                </div>
                <hr className="text-[#D5D7DA]" />

                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <InputFields
                        label="Warehouse"
                        type="text"
                        name="warehouse"
                        value={form.warehouse}
                        options={warehouseOptions}
                        onChange={handleChange}
                    />
                    <InputFields
                        label="Customer"
                        type="text"
                        name="customer"
                        value={form.warehouse}
                        options={agentCustomerOptions}
                        onChange={handleChange}
                    />
                </div>

                <Table
                    data={itemData}
                    config={{
                        columns: columns,
                    }}
                />

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

                        <div className="flex flex-col gap-[20px] w-full lg:w-[350px] border-b-[1px] border-[#D5D7DA] lg:border-0 pb-[20px] lg:pb-0 mb-[20px] lg:mb-0">
                            <KeyValueData data={keyValueData} />
                            <div className="font-semibold text-[#181D27] text-[18px] flex justify-between">
                                <span>Total</span>
                                <span>AED 7.00</span>
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

                <div className="flex flex-wrap justify-end gap-[20px]">
                    <SidebarBtn
                        leadingIcon={"lucide:download"}
                        leadingIconSize={20}
                        label="Download"
                    />
                    <SidebarBtn
                        isActive
                        leadingIcon={"lucide:printer"}
                        leadingIconSize={20}
                        label="Print Now"
                    />
                </div>
            </ContainerCard>
        </div>
    );
}
