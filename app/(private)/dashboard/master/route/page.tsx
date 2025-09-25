"use client";

import BorderIconButton from "@/app/components/borderIconButton";
import { Icon } from "@iconify-icon/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CustomDropdown from "@/app/components/customDropdown";
import Table, { TableDataType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { routeList,deleteRoute } from "@/app/services/allApi";
import Loading from "@/app/components/Loading";
import DeleteConfirmPopup from "@/app/components/deletePopUp";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
const columns = [
    {
        key: "route_code",
        label: "Route Code",
        render: (row: TableDataType) => (
            <span className="font-semibold text-[#181D27] text-[14px]">
                {row.route_code}
            </span>
        ),
    },
    { key: "route_name", label: "Route Name" ,isSortable: true },
     { key: "route_type", label: "Route Type" ,filter: {
            isFilterable: true,
            render: (data: TableDataType[]) =>
                data.map((row: TableDataType, index: number) => (
                    <div
                        key={index}
                        className="flex items-center gap-[8px] px-[14px] py-[10px] hover:bg-[#FAFAFA] text-[14px]"
                    >
                        <span className="font-[500] text-[#181D27]">
                            {row.routeTypeOptions}
                        </span>
                       
                    </div>
                )),
        },
         width:218,
},
    { key: "warehouse", label: "Warehouse" ,filter: {
            isFilterable: true,
            render: (data: TableDataType[]) =>
                data.map((row: TableDataType, index: number) => (
                    <div
                        key={index}
                        className="flex items-center gap-[8px] px-[14px] py-[10px] hover:bg-[#FAFAFA] text-[14px]"
                    >
                        <span className="font-[500] text-[#181D27]">
                            {row.warehouse}
                        </span>
                       
                    </div>
                )),
                width:218,
        },
},
   
   
    

    {
        key: "status",
        label: "Status",
        render: (row: TableDataType) => (
            <div className="flex items-center">
                {Number(row.status) === 1 ? (
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

export default function Route() {

    interface RouteItem {
    id?: number | string;
    route_code?: string;
    route_name?: string;
    warehouse?: string;
    route_type?: string;
    status?: string;
  }
  const {routeTypeOptions,warehouseOptions}=useAllDropdownListData();
    const[routes, setRoutes] = useState<RouteItem[]>([]);
    const [selectedRow, setSelectedRow] = useState<RouteItem | null>(null);
      const [showDeletePopup, setShowDeletePopup] = useState(false);
        const [showDropdown, setShowDropdown] = useState(false);
        const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  type TableRow = TableDataType & { id?: string };

    const tableData: TableDataType[] = routes.map((c) => ({
    id: c.id?.toString() ?? "",
    route_code: c.route_code ?? "",
    route_name: c.route_name ?? "",
    warehouse: c.warehouse ?? "",
    route_type: c.route_type ?? "",
    status: c.status ?? "",
  }));

    // Move fetchRoutes outside useEffect so it can be reused
    const fetchRoutes = async () => {
        try {
            setLoading(true);
            const listRes = await routeList();
            setRoutes(listRes?.data ?? []);
        } catch (error: unknown) {
            console.error("API Error:", error);
            setRoutes([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoutes();
    }, []);

    const handleConfirmDelete = async () => {
        if (!selectedRow) return;
        try {
            if (!selectedRow?.id) throw new Error('Missing id');
            await deleteRoute(String(selectedRow.id)); // call API
            showSnackbar("Route deleted successfully ", "success");
            await fetchRoutes();
             setRoutes((prev) => prev.filter((c) => String(c.id) !== String(selectedRow.id)));
        } catch (error) {
            console.error("Delete failed ❌:", error);
            showSnackbar("Failed to delete Route ❌", "error");
        } finally {
            setShowDeletePopup(false);
            setSelectedRow(null);
        }
    };

    if (loading) return <Loading />;

    return (
        <>
            {/* header */}
            <div className="flex justify-between items-center mb-[20px]">
                <h1 className="text-[20px] font-semibold text-[#181D27] h-[30px] flex items-center leading-[30px] mb-[1px]">
                    Route
                </h1>

                {/* top bar action buttons */}
                <div className="flex gap-[12px] relative">
                    <BorderIconButton
                        icon="gala:file-document"
                        label="Export CSV"
                        labelTw="text-[12px] hidden sm:block"
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
            <div className="h-[calc(100%-60px)]">
                <Table
                    data={tableData}
                    config={{
                        header: {
                            searchBar: true,
                            columnFilter: true,
                            actions: [
                                <SidebarBtn
                                    key={0}
                                    href="/dashboard/master/route/add"
                                    isActive={true}
                                    leadingIcon="lucide:plus"
                                    label="Add Route"
                                    labelTw="hidden sm:block"
                                />
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
                icon: "lucide:edit-2",
                onClick: (data: object) => {
                  const row = data as TableRow;
                  router.push(`/dashboard/master/route/routes/${row.id}`);
                },
              },
                            {
                            icon: "lucide:trash-2",
                            onClick: (data: object) => {
                            const row = data as TableRow;
                            setSelectedRow({ id: row.id });
                            setShowDeletePopup(true);
                            },
                        },
                        ],
                        pageSize: 10,
                    }}
                />
            </div>
            {showDeletePopup && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                      <DeleteConfirmPopup
                        title="Route"
                        onClose={() => setShowDeletePopup(false)}
                        onConfirm={handleConfirmDelete}
                      />
                    </div>
                  )}
        </>
    );
}
