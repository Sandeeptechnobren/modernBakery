"use client";

import { useState, useEffect, useCallback } from "react";
import { Icon } from "@iconify-icon/react";
import { useRouter } from "next/navigation";

import BorderIconButton from "@/app/components/borderIconButton";
import CustomDropdown from "@/app/components/customDropdown";
import Table, { TableDataType, listReturnType, searchReturnType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { vehicleList, deleteVehicle, vehicleGlobalSearch } from "@/app/services/allApi";
import { useLoading } from "@/app/services/loadingContext";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";
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
    },
  },
  // { key: "ownerReference", label: "Owner Reference" },
  // { key: "vehicleRoute", label: "Vehicle Route" },
  { key: "description", label: "Description", render: (row: TableDataType) => row.description || "-" },
  { key: "valid_from", label: "Valid From", render: (row: TableDataType) => row.valid_from || "-" },
  { key: "valid_to", label: "Valid To", render: (row: TableDataType) => row.valid_to || "-" },
  {
    key: "status",
    label: "Status",
    render: (row: TableDataType) => (
      <StatusBtn isActive={row.status === "Active" ? true : false} />
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
        const listRes = await vehicleList({
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
      {/* Header */}
      {/* <div className="flex justify-between items-center mb-[20px]">
        <h1 className="text-[20px] font-semibold text-[#181D27]">
          Vehicle
        </h1>

        <div className="flex gap-[12px] relative">
          

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
        </div>
      </div> */}

      {/* Table */}
      <div className="h-[calc(100%-60px)]">
        <Table
          refreshKey={refreshKey}
          config={{
            api: {
              list: fetchVehicles,
              search: searchVehicle,
            },
            header: {
              title: "Vehicle",
              wholeTableActions: [
                <div key={0} className="flex gap-[12px] relative">
                  <BorderIconButton
                    icon="ic:sharp-more-vert"
                    onClick={() =>
                      setShowDropdown(!showDropdown)
                    }
                  />

                  {showDropdown && (
                    <div className="w-[226px] absolute top-[40px] right-0 z-30">
                      <CustomDropdown>
                        {dropdownDataList.map(
                          (
                            link,
                            index: number
                          ) => (
                            <div
                              key={index}
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
                  )}
                </div>
              ],
              searchBar: true,
              columnFilter: true,
              actions: [
                <SidebarBtn
                  key={0}
                  href="/dashboard/master/vehicle/add"
                  isActive
                  leadingIcon="lucide:plus"
                  label="Add Vehicle"
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
                onClick: (row: object) => {
                  const r = row as TableDataType;
                  router.push(
                    `/dashboard/master/vehicle/updateVehicle/${r.id}`
                  );
                },
              },
              {
                icon: "lucide:trash-2",
                onClick: (row: object) => {
                  const r = row as TableDataType;
                  setSelectedRow({ id: r.id });
                  setShowDeletePopup(true);
                },
              },
            ],
            pageSize: 5,
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
