"use client";

import BorderIconButton from "@/app/components/borderIconButton";
import { Icon } from "@iconify-icon/react";
import { useState } from "react";
import CustomDropdown from "@/app/components/customDropdown";
import Link from "next/link";
import Table, { TableDataType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";

const data = new Array(100).fill(null).map((_, i) => ({
    id: (i + 1).toString(),
    code: "AC0001604",
    companyName: `Abdul Retail Shop ${i + 1}`,
    companyType: `Musinguzi Abdul`,
    phoneNumber: "0789517400, 0702563915",
    region: "Kansanga Road",
    subRegion: "Kansanga Road",
    district: "kampala",
    country: "UAE",
    status: "Active",
}));

const columns = [
    {
        key: "code",
        label: "Code",
        render: (row: TableDataType) => (
            <span className="font-semibold text-[#181D27] text-[14px]">
                {row.code}
            </span>
        ),
    },
    {
        key: "companyName",
        label: "Company Name",
        render: (row: TableDataType) => (
            <Link
                href={`/dashboard/company/${row.id}/overview`}
                className="flex items-center cursor-pointer hover:text-[#EA0A2A]"
            >
                {row.companyName}
            </Link>
        ),
        isSortable: true,
    },
    { key: "companyType", label: "Company Name", isSortable: true },
    { key: "phoneNumber", label: "Phone Number", width: 150 },
    { key: "region", label: "Region" },
    { key: "subRegion", label: "Sub Region" },
    { key: "district", label: "District" },
    { key: "country", label: "Country" },
    {
        key: "status",
        label: "Status",
        render: (row: TableDataType) => (
            <div className="flex items-center">
                {row.status ? (
                    <span className="text-sm text-[#027A48] bg-[#ECFDF3] font-[500] p-1 px-4 rounded-xl text-[12px]">
                        Active
                    </span>
                ) : (
                    <span className="text-sm text-red-700 bg-red-200 p-1 px-4 rounded-xl text-[12px]">
                        Inactive
                    </span>
                )}
            </div>
        ),
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
            <div className="flex justify-between items-center mb-[20px]">
                <h1 className="text-[20px] font-semibold text-[#181D27] h-[30px] flex items-center leading-[30px] mb-[1px]">
                    Company
                </h1>
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
             <div className="h-[calc(100%-60px)]">
                            <Table
                                data={data}
                                config={{
                                    header: {
                                        searchBar: true,
                                        columnFilter: true,
                                        actions: [
                                            <SidebarBtn
                                                key={0}
                                                href="/dashboard/company/add"
                                                isActive={true}
                                                leadingIcon="lucide:plus"
                                                label="Add Company"
                                            />,
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