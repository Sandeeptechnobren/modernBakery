"use client";

import { useState, useEffect, useCallback } from "react";
import { Icon } from "@iconify-icon/react";
import { useRouter } from "next/navigation";
import StatusBtn from "@/app/components/statusBtn2";
import BorderIconButton from "@/app/components/borderIconButton";
import CustomDropdown from "@/app/components/customDropdown";
import Link from "next/link";
import Table, {
    listReturnType,
    searchReturnType,
    TableDataType,
} from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import {
    permissionList,
    
    deletePermissions,
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
    // { icon: "lucide:layout", label: "SAP", iconWidth: 20 },
    // { icon: "lucide:download", label: "Download QR Code", iconWidth: 20 },
    // { icon: "lucide:printer", label: "Print QR Code", iconWidth: 20 },
    { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
    { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
];

const columns = [
    { key: "role_name", label: "Role Name" ,render: (row: TableDataType) => (
      <Link
        href={`/dashboard/settings/role/detail/${row.id}`}
        className="flex items-center cursor-pointer hover:text-[#EA0A2A]"
      >
        {row.role_name}
      </Link>
    ),},
    { key: "role_activity", label: "Role Activity" },
    { key: "menu_id", label: "Menu Id" },
    { key: "agent_id", label: "Agent Id" },
    { key: "warehouse_id", label: "Warehouse Id" },
    {
            key: "status",
            label: "Status",
            render: (row: TableDataType) => (
                <StatusBtn isActive={row.status ? true : false} />
            ),
        },
];

export default function Permissions() {
    interface RoleItem {
        id?: number | string;
        uuid?: number | string;
        role_name?: string;
        role_activity?: string;
        menu_id?: string;
        agent_id?: string;
        warehouse_id?: string;
        status?: string;
    }

    const { setLoading } = useLoading();
    const [showDropdown, setShowDropdown] = useState<boolean>(false);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [selectedRow, setSelectedRow] = useState<RoleItem | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const router = useRouter();
    const { showSnackbar } = useSnackbar(); 
    type TableRow = TableDataType & { id?: string };

    const [tableData, setTableData] = useState<TableDataType[]>([]);

    const handleConfirmDelete = async () => {
        if (!selectedRow) return;

        if (!selectedRow?.uuid) throw new Error("Missing id");
        const res = await deletePermissions(String(selectedRow.uuid));
        if (res.error)
            return showSnackbar(
                res.data.message || "Failed to delete Permission",
                "error"
            );
        else {
            showSnackbar("Permission deleted successfully ", "success");
            setRefreshKey(refreshKey + 1);
        }
        setLoading(false);
        setShowDeletePopup(false);
        setSelectedRow(null);
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await permissionList();
                // Map API data to TableDataType if needed
                setTableData(Array.isArray(res.data) ? res.data : []);
            } catch (e) {
                setTableData([]);
            }
            setLoading(false);
        };
        fetchData();
    }, [refreshKey, setLoading]);

    return (
        <>
            <div className="h-[calc(100%-60px)] pb-[22px]">
                 <Table
                     refreshKey={refreshKey}
                     data={tableData}
                     config={{
                         // api: { list: fetchCountries },
                         header: {
                            title: "Permissions",
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
                            searchBar: true,
                            columnFilter: true,
                            actions: [
                                <SidebarBtn
                                    key={0}
                                    href="/dashboard/settings/permission/add"
                                    isActive
                                    leadingIcon="lucide:plus"
                                    label="Add Permission"
                                    labelTw="hidden sm:block"
                                />,
                            ],
                        },
                        footer: { nextPrevBtn: true, pagination: true },
                        columns,
                        rowSelection: true,
                        rowActions: [
                            {
                                icon: "lucide:edit-2",
                                onClick: (data: object) => {
                                    const row = data as TableRow;
                                    router.push(`/dashboard/settings/permission/detail/${row.uuid}`);

                                },
                            },
                            {
                                icon: "lucide:trash-2",
                                onClick: (data: object) => {
                                    const row = data as TableRow;
                                    setSelectedRow({ uuid: row.uuid });
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
                        title="Permission"
                        onClose={() => setShowDeletePopup(false)}
                        onConfirm={handleConfirmDelete}
                    />
                </div>
            )}
        </>
    );
}