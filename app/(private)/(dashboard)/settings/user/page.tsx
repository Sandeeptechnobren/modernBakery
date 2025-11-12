"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import StatusBtn from "@/app/components/statusBtn2";
import Table, {
    configType,
    listReturnType,
    searchReturnType,
    TableDataType,
} from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { getUserList, userList, userListGlobalSearch} from "@/app/services/allApi";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useLoading } from "@/app/services/loadingContext";

export default function User() {
    const [selectedUser, setSelectedUser] = useState<string>("");
    const columns: configType["columns"] = [
        { key: "name", label: "Name", showByDefault: true },
        {
            key: "role",
            label: "Role",
            render: (row: TableDataType) => {
                if (!row.role) return "";
                return typeof row.role === "string"
                    ? row.role
                    : (row.role as { name?: string }).name ?? "";
            },
            showByDefault: true,
        },
        { key: "email", label: "Email" },
        { key: "contact_number", label: "Contact No.",showByDefault: true  },
        {
            key: "status",
            label: "Status",
            render: (row: TableDataType) => {
                // Treat status 1 or 'active' (case-insensitive) as active
                const isActive =
                    String(row.status) === "1" ||
                    (typeof row.status === "string" &&
                        row.status.toLowerCase() === "active");
                return <StatusBtn isActive={isActive} />;
            },
            showByDefault: true,
        },
        ];

    const { setLoading } = useLoading();
    const [refreshKey, setRefreshKey] = useState(0);
    const router = useRouter();
    const { showSnackbar } = useSnackbar();
    type TableRow = TableDataType & { uuid?: string };

    const fetchUser = useCallback(
        async (
            page: number = 1,
            pageSize: number = 50
        ): Promise<listReturnType> => {
            try {
                setLoading(true);
                // const params: any = {
                //     page: page.toString(),
                // };
                const listRes = await getUserList();
                setLoading(false);
                return {
                    data: Array.isArray(listRes.data) ? listRes.data : [],
                    total: listRes?.pagination?.totalPages || 1,
                    currentPage: listRes?.pagination?.page || 1,
                    pageSize: listRes?.pagination?.limit || pageSize,
                };
            } catch (error: unknown) {
                setLoading(false);
                showSnackbar("Error fetching user data", "error");
                return {
                    data: [],
                    total: 1,
                    currentPage: 1,
                    pageSize: 50,
                };
            }
        },
        [selectedUser, setLoading]
    );

    useEffect(() => {
        setLoading(true);
    }, []);

    const searchUser = useCallback(
        async (
          query: string,
          page: number = 1,
          columnName?: string,
          pageSize: number = 50
        ): Promise<listReturnType> => {
          try {
            setLoading(true);
            const res = await userListGlobalSearch({ query: query, per_page: pageSize.toString() });
            setLoading(false);
            
    
            return {
              data: res.data || [],
              total: res.pagination.totalPages || 2,
              currentPage: res.pagination.page || 50,
              pageSize: res.pagination.limit || pageSize,
            };
          } catch (error) {
            setLoading(false);
            console.error(error);
            throw error;
          }
        },
        []
      );

    return (
        <>
            <div className="flex flex-col h-full">
                <Table
                    refreshKey={refreshKey}
                    config={{
                        api: { list: fetchUser, search: searchUser, },
                        header: {
                            title: "Users",
                            searchBar: true,
                            columnFilter: true,
                            actions: [
                                <SidebarBtn
                                    key={0}
                                    href="/settings/user/add"
                                    isActive
                                    leadingIcon="lucide:plus"
                                    label="Add"
                                    labelTw="hidden sm:block"
                                />,
                            ],
                        },
                        localStorageKey: "user-table",
                        footer: { nextPrevBtn: true, pagination: true },
                        columns,
                        rowSelection: true,
                        rowActions: [
                            // {
                            //     icon: "lucide:eye",
                            //     onClick: (data: object) => {
                            //         const row = data as TableRow;
                            //         router.push(`/agentCustomer/details/${row.uuid}`);
                            //     },
                            // },
                            {
                                icon: "lucide:edit-2",
                                onClick: (data: object) => {
                                    const row = data as TableRow;
                                    // Navigate to the settings user edit page which will call getUserByUuid on mount
                                    router.push(`/settings/user/${row.uuid}`);
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
