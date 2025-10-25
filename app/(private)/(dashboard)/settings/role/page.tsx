"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Table, {
    listReturnType,
    TableDataType,
} from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { deleteRole, roleGlobalSearch, roleList } from "@/app/services/allApi";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";

const columns = [
    { key: "name", label: "Name" },
    { key: "permissions", label: "Permissions", render: (data: TableDataType) => {
        const row = (data as any)[0];
        if (row && typeof row === "object" && "menus" in row) {
            console.log(row, "dfjkdlfjldkj");
            return row?.menus?.[0]?.menu?.submenu?.[0]?.permissions?.[0] || "-";
        }
        return "-";
    }}
];

export default function Roles() {
    const { showSnackbar } = useSnackbar();
    const { setLoading } = useLoading();
    const [refreshKey, setRefreshKey] = useState<number>(0);
    const router = useRouter();

    const fetchCountries = useCallback(
        async (
            page: number = 1,
            pageSize: number = 50
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

    const searchList = useCallback(
        async (search: string, pageSize: number = 5): Promise<listReturnType> => {
            setLoading(true);
            const listRes = await roleGlobalSearch({
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

    // const deleteUser = useCallback(async (id: string) => {
    //     setLoading(true);
    //     const res = await deleteRole(id);
    //     setLoading(false);
    //     if(res.error){
    //         showSnackbar("Unable to Delete the User", "error");
    //         throw new Error("Unable to delete user");
    //     } 
    //     showSnackbar("User Deleted Successfully", "success");
    //     setRefreshKey(prev => prev +1);
    // }, []);

    useEffect(() => {
        setLoading(true);
    }, []);

    return (
        <div className="flex flex-col h-full">
            <Table
                refreshKey={refreshKey}
                config={{
                    api: {
                        list: fetchCountries,
                        search: searchList,
                    },
                    header: {
                        title: "Roles",
                        searchBar: true,
                        columnFilter: true,
                        actions: [
                            <SidebarBtn
                                key={0}
                                href="/settings/role/add"
                                isActive
                                leadingIcon="lucide:plus"
                                label="Add"
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
                        // {
                        //     icon: "lucide:trash-2",
                        //     onClick: (data: TableDataType) => {
                        //         deleteUser(data.id)
                        //     },
                        // },
                    ],
                    pageSize: 50,
                }}
            />
        </div>
    );
}