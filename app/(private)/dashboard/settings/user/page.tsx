"use client";

import BorderIconButton from "@/app/components/borderIconButton";
import { Icon } from "@iconify-icon/react";
import { useState } from "react";
import CustomDropdown from "@/app/components/customDropdown";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import Table, { TableDataType } from "@/app/components/customTable";

const data = new Array(100).fill(null).map((_, i) => ({
    id: (i + 1).toString(),
    name: `Abdul Retail Shop`,
    email: `test@gmail.com`,
    contactNo: '1234567890',
    userName: `abdul`,
    password: `********`,
    roleType: `Admin`,
    status: "Active",
}));

const columns = [
    {
        key: "name",
        label: "User Name", isSortable: true,
        render: (row: TableDataType) => (
            <span className="font-semibold text-[#181D27] text-[14px]">
                {row.name}
            </span>
        ),
    },
    { key: "email", label: "Email" },
    { key: "contactNo", label: "Contact No" },
    { key: "userName", label: "User Name" },
    { key: "password", label: "Password" },
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

export default function User() {
    const [showDropdown, setShowDropdown] = useState(false);
    return (
        <>
            {/* header */}
            <div className="w-full">
                <div className="flex justify-between items-center p-5">
                    <h1 className="text-[20px] font-semibold text-[#181D27] h-[30px] flex items-center leading-[30px] mb-[1px]">
                        User
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
                                actions: [
                                    <SidebarBtn
                                        key={0}
                                        isActive={true}
                                        href="/dashboard/settings/user/add"
                                        leadingIcon="lucide:plus"
                                        label="Add User"
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
                                            "Are you sure you want to delete this User?"
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
