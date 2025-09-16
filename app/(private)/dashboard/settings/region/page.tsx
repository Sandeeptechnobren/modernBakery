"use client";

import BorderIconButton from "@/app/components/borderIconButton";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useState } from "react";
import CustomDropdown from "@/app/components/customDropdown";
import Table, { TableDataType } from "@/app/components/customTable";

const data = new Array(100).fill(null).map((_, i) => ({
    id: (i + 1).toString(),
    code:`7348grh`,
 name: `Abdul`,
    activity: `Retail`,
    description: 'Super Admin',
}));

const columns = [
     {
        key: "code",
        label: "Region Code",isSortable:true,
        render: (row: TableDataType) => (
            <Link
                href={`/dashboard/settings/region/${row.id}/region`}
                className="flex items-center cursor-pointer hover:text-[#EA0A2A]"
            >
                {row.code}
            </Link>
        ),
    },
    {
        key: "name",
        label: "Region Name",isSortable:true,
        render: (row: TableDataType) => (
            <Link
                href={`/dashboard/settings/region/${row.id}/region`}
                className="flex items-center cursor-pointer hover:text-[#EA0A2A]"
            >
                {row.name}
            </Link>
        ),
    },
    { key: "activity", label: "Activity" },
    { key: "description", label: "Description"},

];

const dropdownDataList = [
    { icon: "lucide:layout", label: "SAP", iconWidth: 20 },
    { icon: "lucide:download", label: "Download QR Code", iconWidth: 20 },
    { icon: "lucide:printer", label: "Print QR Code", iconWidth: 20 },
    { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
    { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
];

export default function Region() {
    const [showDropdown, setShowDropdown] = useState(false);
    return (
        <>
            {/* header */}
            <div className="w-full">
            <div className="flex justify-between items-center p-5">
                <h1 className="text-[20px] font-semibold text-[#181D27] h-[30px] flex items-center leading-[30px] mb-[1px]">
                    Region 
                </h1>

                {/* top bar action buttons */}
                <div className="flex gap-[12px] items-center text-center">
                    <BorderIconButton
                        icon="gala:file-document"
                        label="Export CSV"
                        labelTw="text-[12px] hidden sm:block items-center"
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
            <div className="h-[calc(100%-70px)]">
                <Table
                    data={data}
                    config={{
                        header: {
                            searchBar: true,
                            columnFilter: true,
                            
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
                                        "Are you sure you want to delete this Region?"
                                    );
                                },
                            },
                        ],
                        pageSize: 10,
                    }}
                />
            </div>
            </div>
        </>
    );
}
