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
import { permissionGlobalSearch, permissionList } from "@/app/services/allApi";
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
    { key: "guard_name", label: "Guard Name" }
];

export default function Permissions() {
    const { setLoading } = useLoading();
    const [showDropdown, setShowDropdown] = useState<boolean>(false);
    const router = useRouter();
    const { showSnackbar } = useSnackbar();


    const fetchData = useCallback(
        async (
            page: number = 1,
            pageSize: number = 50
        ): Promise<listReturnType> => {
            setLoading(true);
            const listRes = await permissionList({
                limit: pageSize.toString(),
                page: page.toString(),
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
                    total: listRes.pagination.totalPages,
                    currentPage: listRes.pagination.page,
                    pageSize: listRes.pagination.limit,
                };
            }
        },
        []
    );
    useEffect(() => {
        setLoading(true);
    }, []);

    const searchList = useCallback(
        async (search: string, pageSize: number = 5): Promise<listReturnType> => {
            setLoading(true);
            const listRes = await permissionGlobalSearch({
                search,
                per_page: pageSize.toString(),
            });
            setLoading(false);
            if (listRes.error) {
                showSnackbar(listRes.data.message || "Failed to Search", "error");
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

    return (
        <>
            <div className="h-[calc(100%-60px)] pb-[22px]">
                <Table
                    config={{
                        api: { list: fetchData, search: searchList },
                        header: {
                            title: "Permissions",
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
                                    href="/settings/permission/add"
                                    isActive
                                    leadingIcon="lucide:plus"
                                    label="Add"
                                    labelTw="hidden lg:block"
                                />,
                            ],
                        },
                        localStorageKey: "permission-table",
                        footer: { nextPrevBtn: true, pagination: true },
                        columns,
                        rowSelection: true,
                        rowActions: [
                            {
                                icon: "lucide:edit-2",
                                onClick: (data: TableDataType) => {
                                    router.push(
                                        `/settings/permission/${data.id}`
                                    );
                                },
                            },
                        ],
                        pageSize: 50,
                    }}
                />
            </div>
        </>
    );
}
