"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Table, { TableDataType, listReturnType, searchReturnType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { vehicleListData, deleteVehicle, vehicleGlobalSearch ,exportVehicleData,vehicleStatusUpdate, downloadFile} from "@/app/services/allApi";
import { useLoading } from "@/app/services/loadingContext";
import DeleteConfirmPopup from "@/app/components/deletePopUp";
import { useSnackbar } from "@/app/services/snackbarContext";
import StatusBtn from "@/app/components/statusBtn2";

// 🔹 API response type
interface Vehicle {
  id?: string | number;
  vehicle_code?: string;
  description?: string;
  number_plat?: string;
  vehicle_chesis_no?: string;
  opening_odometer?: string;
  vehicle_type?: string;
  capacity?: string;
  owner_type?: string;
  warehouse?: { id: string, warehouse_code: string, warehouse_name: string, owner_name: string };
  owner_reference?: string;
  vehicle_route?: string;
  status?: number;
  [key: string]: string | number | object | undefined;
}

// 🔹 Dropdown menu data
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

// 🔹 Table columns
const columns = [
  { key: "vehicle_code", label: "Vehicle Code", render: (row: TableDataType) => (<span className="font-semibold text-[#181D27] text-[14px]">{row.vehicle_code || "-"}</span>) },
  { key: "number_plat", label: "Number Plate", render: (row: TableDataType) => row.number_plat || "-" },
  { key: "vehicle_chesis_no", label: "Chassis Number", render: (row: TableDataType) => row.vehicle_chesis_no || "-" },
  { key: "vehicle_brand", label: "Brand", render: (row: TableDataType) => row.vehicle_brand || "-" },
  { key: "opening_odometer", label: "Odo Meter", render: (row: TableDataType) => row.opening_odometer || "-" },
  {
    key: "vehicle_type",
    label: "Vehicle Type",
    render: (row: TableDataType) => {
      const value = row.vehicle_type;
      if (value == null || value === "") return "-";
      const strValue = String(value);
      if (strValue === "1") return "Truck";
      if (strValue === "2") return "Van";
      if (strValue === "3") return "Bike";
      if (strValue === "4") return "Tuktuk";
      return strValue;
    },
  },
  { key: "capacity", label: "Capacity", render: (row: TableDataType) => row.capacity || "-" },
  {
    key: "owner_type",
    label: "Owner Type",
    render: (row: TableDataType) => {
      const value = row.owner_type;
      if (value == null || value === "") return "-";
      const strValue = String(value);
      if (strValue === "0") return "Company Owned";
      if (strValue === "1") return "Contractor";
      return strValue;
    },
  },
  {
    key: "depotLocation", label: "Warehouse", render: (data: TableDataType) => {
      const warehouseObj = typeof data.warehouse === "string"
        ? JSON.parse(data.warehouse)
        : data.warehouse;
      return warehouseObj?.warehouse_name || "-";
    }, filter: {
        isFilterable: true,
        render: (data: TableDataType[]) => {
            return data.map((item, index) => <div key={item.id+index} className="w-full text-left p-2">{item.warehouse_name}</div>);
        }
    } },
  // { key: "ownerReference", label: "Owner Reference" },
  // { key: "vehicleRoute", label: "Vehicle Route" },
  { key: "description", label: "Description", render: (row: TableDataType) => row.description || "-" },
  { key: "valid_from", label: "Valid From", render: (row: TableDataType) => row.valid_from || "-" },
  { key: "valid_to", label: "Valid To", render: (row: TableDataType) => row.valid_to || "-" },
  {
    key: "status",
    label: "Status",
    render: (row: TableDataType) => (
      <StatusBtn isActive={String(row.status) === "1"} />
    ),
  },
];

export default function VehiclePage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const { setLoading } = useLoading();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedRow, setSelectedRow] = useState<Vehicle | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const { showSnackbar } = useSnackbar();
  const router = useRouter();

  // ✅ Map vehicles → TableDataType safely
  const tableData: TableDataType[] = vehicles.map((v) => ({
    id: String(v.id ?? ""),
    vehicle_code: v.vehicle_code ?? "-",
    vehicle_brand: v.vehicle_brand !== undefined ? String(v.vehicle_brand) : "-",
    number_plat: v.number_plat ?? "-",
    vehicle_chesis_no: v.vehicle_chesis_no ?? "-",
    opening_odometer: v.opening_odometer ?? "-",
    vehicle_type: v.vehicle_type ?? "-",
    capacity: v.capacity ?? "-",
    owner_type: v.owner_type ?? "-",
    warehouse: v.warehouse?.warehouse_name ?? "-",
    ownerReference: v.owner_reference ?? "-",
    vehicleRoute: v.vehicle_route ?? "-",
    description: v.description ?? "-",
    valid_from: v.valid_from !== undefined ? String(v.valid_from) : "-",
    valid_to: v.valid_to !== undefined ? String(v.valid_to) : "-",
    status: v.status === 1 ? "Active" : "Inactive",
  }));


  const fetchVehicles = useCallback(
    async (
      page: number = 1,
      pageSize: number = 5
    ): Promise<listReturnType> => {
      try {
        setLoading(true);
        const listRes = await vehicleListData({
          limit: pageSize.toString(),
          page: page.toString(),
        });
        setLoading(false);
        return {
          data: listRes.data || [],
          total: listRes.pagination.totalPages,
          currentPage: listRes.pagination.page,
          pageSize: listRes.pagination.limit,
        };
      } catch (error: unknown) {
        console.error("API Error:", error);
        setLoading(false);
        throw error;
      }
    },
    []
  );

  const searchVehicle = useCallback(
    async (
      searchQuery: string,
    ): Promise<searchReturnType> => {
      setLoading(true);
      const result = await vehicleGlobalSearch({
        search: searchQuery,
        // per_page: pageSize.toString(),
      });
      setLoading(false);
      if (result.error) throw new Error(result.data.message);
      const pagination = result.pagination && result.pagination.pagination ? result.pagination.pagination : {};
      return {
        data: result.data || [],
        total: pagination.totalPages || 10,
        currentPage: pagination.current_page || 1,
        pageSize: pagination.limit || 10,
      };
    },
    []
  );

           const exportFile = async () => {
           try {
             const response = await exportVehicleData({ format: "xlsx"}); 
             if (response && typeof response === 'object' && response.url) {
             await downloadFile(response.url);
               showSnackbar("File downloaded successfully ", "success");
             } else {
               showSnackbar("Failed to get download URL", "error");
             }
           } catch (error) {
             showSnackbar("Failed to download warehouse data", "error");
           } finally {
           }
         };

                const statusUpdate = async (ids?: (string | number)[], status: number = 0) => {
                        try {
                          if (!ids || ids.length === 0) {
                            showSnackbar("No warehouses selected", "error");
                            return;
                          }
                          const selectedRowsData: number[] = ids.map((id) => Number(id)).filter((n) => !Number.isNaN(n));
                          console.log("selectedRowsData", selectedRowsData);
                          if (selectedRowsData.length === 0) {
                            showSnackbar("No warehouses selected", "error");
                            return;
                          }
                          await vehicleStatusUpdate({ warehouse_ids: selectedRowsData, status });
                          setRefreshKey((k) => k + 1);
                          showSnackbar("Warehouse status updated successfully", "success");
                        } catch (error) {
                          showSnackbar("Failed to update warehouse status", "error");
                        }
                      };
                
  const handleConfirmDelete = async () => {
    if (!selectedRow?.id) return;

    const res = await deleteVehicle(String(selectedRow.id));
    if (res.error) {
      showSnackbar(res.data.message || "Failed to delete vehicle ❌", "error");
    } else {
      showSnackbar(res.message || "Vehicle deleted successfully ✅", "success");
      setRefreshKey(prev => prev+1);
      setLoading(false);
    }
    setShowDeletePopup(false);
    setSelectedRow(null);
  };
  useEffect(() => {
    setLoading(true);
  }, []);

  return (
    <>
    
      <div className="flex flex-col h-full">
        <Table
          refreshKey={refreshKey}
          config={{
            api: {
              list: fetchVehicles,
              search: searchVehicle,
            },
            header: {
               threeDot: [
                {
                  icon: "gala:file-document",
                  label: "Export CSV",
                  labelTw: "text-[12px] hidden sm:block",
                  onClick: exportFile,
                },
                {
                  icon: "gala:file-document",
                  label: "Export Excel",
                  labelTw: "text-[12px] hidden sm:block",
                  // You can add onClick for Excel if needed
                },
                {
                                    icon: "lucide:radio",
                                    label: "Inactive",
                                    // showOnSelect: true,
                                    showWhen: (data: TableDataType[], selectedRow?: number[]) => {
                                        if(!selectedRow || selectedRow.length === 0) return false;
                                        const status = selectedRow?.map((id) => data[id].status).map(String);
                                        return status?.includes("1") || false;
                                    },
                                    onClick: (data: TableDataType[], selectedRow?: number[]) => {
                                        const status: string[] = [];
                                        const ids = selectedRow?.map((id) => {
                                            const currentStatus = data[id].status;
                                            if(!status.includes(currentStatus)){
                                                status.push(currentStatus);
                                            }
                                            return data[id].id;
                                        })
                                        statusUpdate(ids, Number(0));
                                    },
                                },
                                {
                                    icon: "lucide:radio",
                                    label: "Active",
                                    // showOnSelect: true,
                                    showWhen: (data: TableDataType[], selectedRow?: number[]) => {
                                        if(!selectedRow || selectedRow.length === 0) return false;
                                        const status = selectedRow?.map((id) => data[id].status).map(String);
                                        return status?.includes("0") || false;
                                    },
                                    onClick: (data: TableDataType[], selectedRow?: number[]) => {
                                        const status: string[] = [];
                                        const ids = selectedRow?.map((id) => {
                                            const currentStatus = data[id].status;
                                            if(!status.includes(currentStatus)){
                                                status.push(currentStatus);
                                            }
                                            return data[id].id;
                                        })
                                        statusUpdate(ids, Number(1));
                                    },
                                },
              ],
              title: "Vehicle",
              
             
              searchBar: true,
              columnFilter: true,
              actions: [
                <SidebarBtn
                  key={0}
                  href="/vehicle/add"
                  isActive
                  leadingIcon="lucide:plus"
                  label="Add"
                  labelTw="hidden sm:block"
                />,
              ],
            },
            localStorageKey: "vehicle-table",
            footer: { nextPrevBtn: true, pagination: true },
            columns,
            rowSelection: true,
            rowActions: [
               {
                icon: "lucide:eye",
                onClick: (data: TableDataType) => {
                  router.push(`/vehicle/details/${data.id}`);
                },
              },
              {
                icon: "lucide:edit-2",
                onClick: (row: object) => {
                  const r = row as TableDataType;
                  router.push(
                    `/vehicle/${r.id}`
                  );
                },
              },
              // {
              //   icon: "lucide:trash-2",
              //   onClick: (row: object) => {
              //     const r = row as TableDataType;
              //     setSelectedRow({ id: r.id });
              //     setShowDeletePopup(true);
              //   },
              // },
            ],
            pageSize: 10,
          }}
        />
      </div>

      {/* Delete Popup */}
      {showDeletePopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <DeleteConfirmPopup
            title="Delete Vehicle"
            onClose={() => setShowDeletePopup(false)}
            onConfirm={handleConfirmDelete}
          />
        </div>
      )}
    </>
  );
}
