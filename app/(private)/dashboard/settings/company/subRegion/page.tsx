"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify-icon/react";
import BorderIconButton from "@/app/components/borderIconButton";
import CustomDropdown from "@/app/components/customDropdown";
import Table from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { subRegionList } from "@/app/services/allApi";
import Loading from "@/app/components/Loading";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";

interface Company {
    id: string;
    area_code: string;
    area_name: string;
    status: "Active" | "Inactive";
    [key: string]: string | "Active" | "Inactive";
}

interface DropdownItem {
    icon: string;
    label: string;
    iconWidth: number;
}

// Mock data setup with correct keys
const mockCompanies: Company[] = new Array(100).fill(null).map((_, i) => ({
    id: (i + 1).toString(),
    area_code: `SR000${i + 1}`,
    area_name: `Kansanga SubRegion ${i + 1}`,
    status: "Active",
}));

const dropdownDataList: DropdownItem[] = [
    { icon: "lucide:layout", label: "SAP", iconWidth: 20 },
    { icon: "lucide:download", label: "Download QR Code", iconWidth: 20 },
    { icon: "lucide:printer", label: "Print QR Code", iconWidth: 20 },
    { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
    { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
];

const columns = [
    { key: "area_code", label: "SubRegion Code" },
    { key: "area_name", label: "SubRegion Name" },
    {
        key: "status",
        label: "Status",
        render: (row: Company) => (
            <div className="flex items-center">
                {row.status === "Active" ? (
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

export default function SubRegion() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [showDropdown, setShowDropdown] = useState<boolean>(false);

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const listRes = await subRegionList();
                setCompanies(listRes.data);
            } catch (error: unknown) {
                if (error instanceof Error) {
                    console.error("API Error:", error.message);
                } else {
                    console.error("Unexpected error:", error);
                }
                setCompanies(mockCompanies); // fallback to mock
            } finally {
                setLoading(false);
            }
        };

        fetchCompanies();
    }, []);

    return loading ? <Loading /> : (
        <>
            <div className="flex justify-between items-center mb-[20px]">
                <h1 className="text-[20px] font-semibold text-[#181D27] h-[30px] flex items-center leading-[30px] mb-[1px]">
                    Sub Region
                </h1>
                <div className="flex gap-[12px] relative">
                    <BorderIconButton
                        icon="gala:file-document"
                        label="Export CSV"
                    />
                    <BorderIconButton icon="mage:upload" />
                    <DismissibleDropdown
                        isOpen={showDropdown}
                        setIsOpen={setShowDropdown}
                        button={
                            <BorderIconButton
                                icon="ic:sharp-more-vert"
                            />
                        }
                        dropdown={
                            <div className="absolute top-[40px] right-0 z-30 w-[226px]">
                                <CustomDropdown>
                                    {dropdownDataList.map((link, idx) => (
                                        <div
                                            key={idx}
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
                        }
                    />
                </div>
            </div>
            <div className="h-[calc(100%-60px)]">
                <Table
                    data={companies}
                    config={{
                        header: {
                            searchBar: true,
                            columnFilter: true,
                            actions: [
                                <SidebarBtn
                                    key={0}
                                    href="/dashboard/settings/company/subRegion/add"
                                    isActive
                                    leadingIcon="lucide:plus"
                                    label="Add Sub Region"
                                    labelTw="hidden sm:block"
                                />,
                            ],
                        },
                        pageSize: 5,
                        footer: { nextPrevBtn: true, pagination: true },
                        columns,
                        rowSelection: true,
                    }}
                />
            </div>
        </>
    );
}
