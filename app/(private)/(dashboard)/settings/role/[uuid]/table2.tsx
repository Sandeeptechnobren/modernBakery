"use client";

import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import Table, { TableDataType } from "@/app/components/customTable";
import Toggle from "@/app/components/toggle";
import { Icon } from "@iconify-icon/react";
import { useEffect, useState } from "react";

const data = [
    { id: 1, name: 'User Management', list: true, add: false, edit: true, delete: false },
    { id: 2, name: 'Role Management', list: true, add: true, edit: false, delete: false },
    { id: 3, name: 'Product Management', list: true, add: true, edit: true, delete: true },
];

export default function RolesPermissionTable() {
    const { permissions } = useAllDropdownListData();
    const [permissionColumns, setPermissionColumns] = useState<{ key: string; label: string; }[]>([]);

    useEffect(() => {
        if (!permissions || !Array.isArray(permissions)) return;
        const permissionColumns = permissions.map((p) => ({
            key: p.name ?? '',
            label: p.name ?? ''
        }));
        setPermissionColumns(permissionColumns);
    }, [permissions]);

    const [refreshKey, setRefreshKey] = useState<number>(0);

    return <>
        <Table
            refreshKey={refreshKey}
            data={data as unknown as TableDataType[]}
            config={{
                columns: [
                    { key: 'name', label: 'Master', width: 200, sticky: 'left' },
                    { key: 'search', label: <Icon icon="lucide:search" />, sticky: 'center' },
                    ...permissionColumns
                ]
            }}
        />
    </>;
}