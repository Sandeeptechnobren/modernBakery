"use client";

import { useState, useEffect, useCallback } from "react";
import { Icon } from "@iconify-icon/react";
import { useRouter } from "next/navigation";
import { formatWithPattern } from "@/app/utils/formatDate";
import BorderIconButton from "@/app/components/borderIconButton";
import CustomDropdown from "@/app/components/customDropdown";
import Table, {
    listReturnType,
    searchReturnType,
    TableDataType,
} from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import {
    pricingHeaderList,
    pricingDetailGlobalSearch,
} from "@/app/services/allApi";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";
import { useLoading } from "@/app/services/loadingContext";
import { usePagePermissions } from "@/app/(private)/utils/usePagePermissions";

interface DropdownItem {
    icon: string;
    label: string;
    iconWidth: number;
}

const dropdownDataList: DropdownItem[] = [
    { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
];

const columns = [
    { key: "osa_code", label: "Pricing Code" },
    { key: "code", label: "Pricing Code" },
    { key: "name", label: "Name" },
    { key: "applicable_for", label: "Pricing Type" },
    {
        key: "start_date",
        label: "Start Date",
        render: (row: TableDataType) =>
            row.start_date
                ? formatWithPattern(new Date(row.start_date), "DD MMM YYYY", "en-GB")
                : "",
    },
    {
        key: "end_date",
        label: "End Date",
        render: (row: TableDataType) =>
            row.end_date
                ? formatWithPattern(new Date(row.end_date), "DD MMM YYYY", "en-GB")
                : "",
    },
];

export default function Pricing() {
    const { can, permissions } = usePagePermissions();
    const { setLoading } = useLoading();
    const [showDropdown, setShowDropdown] = useState<boolean>(false);
    const [refreshKey, setRefreshKey] = useState(0);

    // Refresh table when permissions load
    useEffect(() => {
        if (permissions.length > 0) {
            setRefreshKey((prev) => prev + 1);
        }
    }, [permissions]);

    const router = useRouter();

    type TableRow = TableDataType & { uuid?: string };

    // ✅ FIXED LIST API
    const fetchCountries = useCallback(
        async (
            page: number = 1,
            pageSize: number = 50
        ): Promise<listReturnType> => {
            try {
                setLoading(true);
                const listRes = await pricingHeaderList({});

                setLoading(false);

                return {
                    data: listRes.data || [],
                    total: listRes.pagination?.totalPages || 0,
                    currentPage: listRes.pagination?.page || 1,
                    pageSize: listRes.pagination?.limit || pageSize,
                };
            } catch (error) {
                console.error("API Error:", error);
                setLoading(false);
                throw error;
            }
        },
        []
    );

    // ✅ FULLY FIXED SEARCH FUNCTION — NOW COMPATIBLE WITH TABLE
    const searchCountries = useCallback(
        async (
            searchQuery: string,
            pageSize: number
        ): Promise<searchReturnType> => {
            try {
                setLoading(true);

                const result = await pricingDetailGlobalSearch({
                    search: searchQuery,
                    per_page: pageSize.toString(),
                });

                setLoading(false);

                const pagination = result?.pagination?.pagination || {};

                return {
                    data: result.data || [],
                    total: pagination.totalPages || 0,
                    currentPage: pagination.current_page || 1,
                    pageSize: pagination.limit || pageSize,
                };
            } catch (err) {
                setLoading(false);
                throw err;
            }
        },
        []
    );

    useEffect(() => {
        setLoading(true);
    }, []);

    return (
        <>
            <div className="h-[calc(100%-60px)]">
                <Table
                    refreshKey={refreshKey}
                    config={{
                        api: {
                            list: fetchCountries,
                            search: searchCountries,
                        },
                        header: {
                            title: "Pricing",
                            wholeTableActions: [
                                <div key={0} className="flex gap-[12px] relative">
                                    <DismissibleDropdown
                                        isOpen={showDropdown}
                                        setIsOpen={setShowDropdown}
                                        button={<BorderIconButton icon="ic:sharp-more-vert" />}
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
                                </div>,
                            ],
                            searchBar: true,
                            columnFilter: true,
                            actions: can("create") ? [
                                <SidebarBtn
                                    key={0}
                                    href="/pricing/add"
                                    isActive
                                    leadingIcon="lucide:plus"
                                    label="Add"
                                    labelTw="hidden sm:block"
                                />,
                            ] : [],
                        },
                        localStorageKey: "pricing-table",
                        table: { height: 500 },
                        footer: { nextPrevBtn: true, pagination: true },
                        columns,
                        rowSelection: true,
                        rowActions: [
                            {
                                icon: "lucide:eye",
                                onClick: (row: TableDataType) =>
                                    router.push(`/pricing/details/${row.uuid}`),
                            },
                            ...(can("edit") ? [{
                                icon: "lucide:edit-2",
                                onClick: (data: object) => {
                                    const row = data as TableRow;
                                    router.push(`/pricing/${row.uuid}`);
                                },
                            }] : []),
                        ],
                        pageSize: 50,
                    }}
                />
            </div>
        </>
    );
}
