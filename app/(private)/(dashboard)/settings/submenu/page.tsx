"use client";

import { useState, useEffect, useCallback } from "react";
import { Icon } from "@iconify-icon/react";
import { useRouter } from "next/navigation";
import BorderIconButton from "@/app/components/borderIconButton";
import CustomDropdown from "@/app/components/customDropdown";
import Table, {
    listReturnType,
    TableDataType,
} from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { submenuGlobalSearch, submenuList } from "@/app/services/allApi";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useLoading } from "@/app/services/loadingContext";

interface DropdownItem {
    icon: string;
    label: string;
    iconWidth: number;
}

const dropdownDataList: DropdownItem[] = [
    { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
    { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
];

const columns = [
    { key: "name", label: "Name" },
    { 
        key: "menu", 
        label: "Menu", 
        render: (data: TableDataType) => {
            const menu = data.menu;
            if (
                typeof menu === "object" &&
                menu !== null &&
                "name" in menu
            ) {
                return (menu as { name: string }).name;
            }
            return "-";
        }
    },
    { key: "parent", label: "Parent", render: (data: TableDataType) => {
            const parent = data.parent;
            if (
                typeof parent === "object" &&
                parent !== null &&
                "name" in parent
            ) {
                return (parent as { name: string }).name;
            }
            return "-";
        } },
    { key: "url", label: "URL" },
    { key: "display_order", label: "Display Order", sortable: true },
    { key: "action_type", label: "Action Type", sortable: true },
    { key: "is_visible", label: "Is Visible", render: (data: TableDataType) => (data.is_visible ? "Yes" : "No") },
];

export default function Page() {
    const { setLoading } = useLoading();
    const [showDropdown, setShowDropdown] = useState<boolean>(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const router = useRouter();
    const { showSnackbar } = useSnackbar();

    const fetchData = useCallback(
        async (
            page: number = 1,
            pageSize: number = 50
        ): Promise<listReturnType> => {
            setLoading(true);
            const listRes = await submenuList({
                page: page.toString(),
                per_page: pageSize.toString()
            });
            setLoading(false);
            if (listRes.error) {
                showSnackbar(
                    listRes.data.message || "Failed to fetch data",
                    "error"
                );
                throw new Error("Failed to fetch data");
            } else {
                return {
                    data: listRes.data || [],
                    total: listRes.pagination.totalPages || 1,
                    currentPage: listRes.pagination.page || 1,
                    pageSize: listRes.pagination.limit || pageSize,
                };
            }
        },
        []
    );

    const searchList = useCallback(
        async (
            search: string,
            pageSize: number = 5
        ): Promise<listReturnType> => {
            setLoading(true);
            const listRes = await submenuGlobalSearch({
                search,
                limit: pageSize.toString(),
            });
            setLoading(false);
            if (listRes.error) {
                showSnackbar(
                    listRes.data.message || "Failed to Search",
                    "error"
                );
                throw new Error("Failed to Search");
            } else {
                return {
                    data: listRes.data || [],
                    total: listRes.pagination.totalPages || 1,
                    currentPage: listRes.pagination.page || 1,
                    pageSize: listRes.pagination.limit || pageSize,
                };
            }
        },
        []
    );

    useEffect(() => {
        setLoading(true);
    }, []);



    return (
        <>
            <div className="h-[calc(100%-60px)] pb-[22px]">
                <Table
                    refreshKey={refreshKey}
                    config={{
                        api: { list: fetchData, search: searchList },
                        header: {
                            title: "Sub Menus",
                            wholeTableActions: [
                                <div
                                    key={0}
                                    className="flex gap-[12px] relative"
                                >
                                    <DismissibleDropdown
                                        isOpen={showDropdown}
                                        setIsOpen={setShowDropdown}
                                        button={
                                            <BorderIconButton icon="ic:sharp-more-vert" />
                                        }
                                        dropdown={
                                            <div className="absolute top-[40px] right-0 z-30 w-[226px]">
                                                <CustomDropdown>
                                                    {dropdownDataList.map(
                                                        (link, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="px-[14px] py-[10px] flex items-center gap-[8px] hover:bg-[#FAFAFA]"
                                                            >
                                                                <Icon
                                                                    icon={
                                                                        link.icon
                                                                    }
                                                                    width={
                                                                        link.iconWidth
                                                                    }
                                                                    className="text-[#717680]"
                                                                />
                                                                <span className="text-[#181D27] font-[500] text-[16px]">
                                                                    {link.label}
                                                                </span>
                                                            </div>
                                                        )
                                                    )}
                                                </CustomDropdown>
                                            </div>
                                        }
                                    />
                                </div>,
                            ],
                            searchBar: true,
                            columnFilter: true,
                            actions: [
                                <SidebarBtn
                                    key={0}
                                    href="/settings/submenu/add"
                                    isActive
                                    leadingIcon="lucide:plus"
                                    label="Add"
                                    labelTw="hidden lg:block"
                                />,
                            ],
                        },
                        localStorageKey: "submenu-table",
                        footer: { nextPrevBtn: true, pagination: true },
                        columns,
                        rowSelection: true,
                        rowActions: [
                            {
                                icon: "lucide:edit-2",
                                onClick: (data: TableDataType) => {
                                    router.push(
                                        `/settings/submenu/${data.uuid}`
                                    );
                                },
                            },
                        ],
                        pageSize: 50
                    }}
                />
            </div>
        </>
    );
}
