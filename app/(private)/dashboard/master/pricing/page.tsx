"use client";

import BorderIconButton from "@/app/components/borderIconButton";
import { Icon } from "@iconify-icon/react";
import { useState } from "react";
import CustomDropdown from "@/app/components/customDropdown";
import Table, { TableDataType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";

const data = new Array(10).fill(null).map((_, i) => ({
    id: (i + 1).toString(),
    OSACode: "AC0001604",
    pricingPlanName: "Standard Price",
    pricingPlanDesc: "Standard Price Description",
    fromDate: `2023-10-${i + 1 < 10 ? "0" : ""}${i + 1}`,
    toDate: `2024-12-${i + 1 < 10 ? "0" : ""}${i + 1}`,
    applyOn: "Item",
}));

const columns = [
    {
        key: "OSACode",
        label: "OSA Code",
        render: (row: TableDataType) => (
            <span className="font-semibold text-[#181D27] text-[14px]">
                {row.OSACode}
            </span>
        ),
    },
    { key: "pricingPlanName", label: "Pricing Plan Name" },
    {
        key: "pricingPlanDesc",
        label: "Pricing Plan Desc",
    },
    { key: "fromDate", label: "From Date" },
    {
        key: "toDate",
        label: "To Date",
        isSortable: true,
    },
    {
        key: "applyOn",
        label: "Apply On",
        filter: {
            isFilterable: true,
            render: (data: TableDataType[]) => (
                <>
                    {["Customer", "Channel", "Category"].map((item, index) => {
                        return (
                            <div
                            key={index+1}
                            className="flex items-center gap-[8px] px-[14px] py-[10px] hover:bg-[#FAFAFA] text-[14px]"
                        >
                            <span className="font-[500] text-[#181D27]">
                                {index}
                            </span>
                            <span className="w-full overflow-hidden text-ellipsis">
                                {item}
                            </span>
                        </div>
                        );
                    })}
                </>
            ),
        },
    },
];

const dropdownDataList = [
    { icon: "lucide:layout", label: "SAP", iconWidth: 20 },
    { icon: "lucide:download", label: "Download QR Code", iconWidth: 20 },
    { icon: "lucide:printer", label: "Print QR Code", iconWidth: 20 },
    { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
    { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
];

export default function Customer() {
    const [showDropdown, setShowDropdown] = useState(false);
    return (
        <>
            {/* header */}
            <div className="flex justify-between items-center mb-[20px]">
                <h1 className="text-[20px] font-semibold text-[#181D27] h-[30px] flex items-center leading-[30px] mb-[1px]">
                    Pricing
                </h1>

                {/* top bar action buttons */}
                <div className="flex gap-[12px] relative">
                    <BorderIconButton
                        icon="gala:file-document"
                        label="Export CSV"
                        labelTw="text-[12px] hidden sm:block"
                    />
                    <BorderIconButton icon="mage:upload" />
                    <BorderIconButton
                        icon="ic:sharp-more-vert"
                        onClick={() => setShowDropdown(!showDropdown)}
                    />

                    {showDropdown && (
                        <div className="w-[226px] absolute top-[40px] right-0 z-30">
                            <CustomDropdown>
                                {dropdownDataList.map((link, index: number) => (
                                    <div
                                        key={index}
                                        className="px-[14px] py-[10px] flex items-center gap-[8px] hover:bg-[#FAFAFA]"
                                    >
                                        <Icon
                                            icon={link.icon}
                                            width={link.iconWidth}
                                            className="text-[#717680]"
                                        />
                                        <span className="text-[#181D27] font-[500] text-[16px]">
                                            {link.label}
                                        </span>
                                    </div>
                                ))}
                            </CustomDropdown>
                        </div>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="h-[calc(100%-60px)]">
                <Table
                    data={data}
                    config={{
                        header: {
                            searchBar: true,
                            columnFilter: true,
                            actions: [
                            
                             // Desktop button with text
                                            <span key="desktop" className="hidden sm:inline">
                                              <SidebarBtn
                                                href="/dashboard/master/pricing/add"
                                                isActive={true}
                                                leadingIcon="lucide:plus"
                                                label="Add Item"
                                              />
                                            </span>,
                            
                                            // Mobile button only icon centered
                                            <span
                                              key="mobile"
                                              className="inline sm:hidden justify-center w-12"
                                            >
                                              <SidebarBtn
                                                href="/dashboard/master/pricing/add"
                                                isActive={true}
                                                leadingIcon="lucide:plus"
                                                label="" // no text
                                              />
                                            </span>,
                                          
                            
                                                        ],
                        },
                        footer: {
                            nextPrevBtn: true,
                            pagination: true,
                        },
                        columns: columns,
                        rowSelection: true,
                        rowActions: [
                            {
                                icon: "lucide:eye",
                            },
                            {
                                icon: "lucide:edit-2",
                                onClick: (data) => {
                                    console.log(data);
                                },
                            },
                            {
                                icon: "lucide:more-vertical",
                                onClick: () => {
                                    confirm(
                                        "Are you sure you want to delete this customer?"
                                    );
                                },
                            },
                        ],
                        pageSize: 10,
                    }}
                />
            </div>
        </>
    );
}
