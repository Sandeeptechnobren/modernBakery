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
import {
    roleList,
    
    deleteRole,
} from "@/app/services/allApi";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";
import DeleteConfirmPopup from "@/app/components/deletePopUp";
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
    { key: "permissions", label: "Permissions", render: (data: TableDataType) => Array.isArray(data.permissions) ? data.permissions.join(", ") : data.permissions },
];

export default function Roles() {
    interface RoleItem {
        id: number | string;
        name: string;
        permissions: string;
    }

    const { setLoading } = useLoading();
    const [showDropdown, setShowDropdown] = useState<boolean>(false);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [selectedRow, setSelectedRow] = useState<RoleItem | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const router = useRouter();
    const { showSnackbar } = useSnackbar(); 

    const fetchCountries = useCallback(
        async (
            page: number = 1,
            pageSize: number = 5
        ): Promise<listReturnType> => {
            try {
              setLoading(true);
                const listRes = await roleList({
                    page: page.toString(),
                    per_page: pageSize.toString(),
                });
                setLoading(false);
                return {
                    data: listRes.data || [],
                    total: listRes.pagination.last_page || 1,
                    currentPage: listRes.pagination.current_page || page,
                    pageSize: listRes.pagination.per_page || pageSize,
                };
            } catch (error: unknown) {
                console.error("API Error:", error);
                setLoading(false);
                throw error;
            }
        },
        []
    );

    const handleConfirmDelete = async () => {
        if (!selectedRow) return;

        if (!selectedRow?.id) throw new Error("Missing id");
        const res = await deleteRole(String(selectedRow.id));
        if (res.error)
            return showSnackbar(
                res.data.message || "Failed to delete Role",
                "error"
            );
        else {
            showSnackbar("Role deleted successfully ", "success");
            setRefreshKey(refreshKey + 1);
        }
        setLoading(false);
        setShowDeletePopup(false);
        setSelectedRow(null);
    };

    useEffect(() => {
        setLoading(true);
    }, []);

    return (
        <>
            <div className="h-[calc(100%-60px)] pb-[22px]">
                <Table
                    refreshKey={refreshKey}
                    config={{
                        api: {
                            list: fetchCountries,
                            // search: searchCountries,
                        },
                        header: {
                            title: "Role",
                            wholeTableActions: [
                                <div key={0} className="flex gap-[12px] relative">
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
                                                                    {
                                                                        link.label
                                                                    }
                                                                </span>
                                                            </div>
                                                        )
                                                    )}
                                                </CustomDropdown>
                                            </div>
                                        }
                                    />
                                </div>
                            ],
                            searchBar: false,
                            columnFilter: true,
                            actions: [
                                <SidebarBtn
                                    key={0}
                                    href="/settings/role/add"
                                    isActive
                                    leadingIcon="lucide:plus"
                                    label="Add Role"
                                    labelTw="hidden lg:block"
                                />,
                            ],
                        },
                        localStorageKey: "role-table",
                        footer: { nextPrevBtn: true, pagination: true },
                        columns,
                        rowSelection: true,
                        rowActions: [
                            {
                                icon: "lucide:edit-2",
                                onClick: (data: TableDataType) => {
                                    router.push(`/settings/role/${data.id}`);

                                },
                            },
                            {
                                icon: "lucide:trash-2",
                                onClick: (data: TableDataType) => {
                                    setSelectedRow({ id: data.id, name: data.name, permissions: data.permissions } as RoleItem);
                                    setShowDeletePopup(true);
                                },
                            },
                        ],
                        pageSize: 5,
                    }}
                />
            </div>

            {showDeletePopup && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                    <DeleteConfirmPopup
                        title="Role"
                        onClose={() => setShowDeletePopup(false)}
                        onConfirm={handleConfirmDelete}
                    />
                </div>
            )}
        </>
    );
}