"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify-icon/react";
import BorderIconButton from "@/app/components/borderIconButton";
import CustomDropdown from "@/app/components/customDropdown";
import Table, { TableDataType, listReturnType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { getWarehouse, deleteWarehouse, warehouseListGlobalSearch } from "@/app/services/allApi";
import { useLoading } from "@/app/services/loadingContext";
import DeleteConfirmPopup from "@/app/components/deletePopUp";
import { useSnackbar } from "@/app/services/snackbarContext";

const dropdownDataList = [
  // { icon: "lucide:layout", label: "SAP", iconWidth: 20 },
  // { icon: "lucide:download", label: "Download QR Code", iconWidth: 20 },
  // { icon: "lucide:printer", label: "Print QR Code", iconWidth: 20 },
  { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
  { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
];

// Move WarehouseRow type above columns so it is in scope
type WarehouseRow = TableDataType & {
  id?:string;
  code?: string;
  warehouseName?: string;
  tin_no?: string;
  ownerName?: string;
  owner_email?: string;
  ownerContact?: string;
  warehouse_type?: string;
  business_type?: string;
  warehouse_manager?: string;
  warehouse_manager_contact?: string;
  district?: string;
  street?: string;
  branch_id?: string;
  town_village?: string;
  region?: {region_name?:string;}
  get_company_customer?: {owner_name?:string};
  city?: string;
  location?: string;
  landmark?: string;
  latitude?: string;
  longitude?: string;
  threshold_radius?: string;
  device_no?: string;
  is_branch?: string;
  p12_file?: string;
  is_efris?: string;
  stock_capital?: string;
  deposite_amount?: string;
  phoneNumber?: string;
  address?: string;
  status?: string | boolean | number;
  company_customer_id?:{customer_name: string};
  region_id?:{ region_name:string};
  area?: {area_name:string};
};

const columns = [
  { key: "registation_no", label: "Registration No.", render: (row: WarehouseRow) => (<span className="font-semibold text-[#181D27] text-[14px]">{row.registation_no || "-" }</span>)},
  { key: "warehouse_code", label: "Warehouse Code", render: (row: WarehouseRow) =>(<span className="font-semibold text-[#181D27] text-[14px]">{ row.warehouse_code || "-"}</span>) },
  { key: "warehouse_name", label: "Warehouse Name", render: (row: WarehouseRow) => row.warehouse_name || "-" },
  { key: "tin_no", label: "TIN No", render: (row: WarehouseRow) => row.tin_no || "-" },
  { key: "owner_name", label: "Owner Name", render: (row: WarehouseRow) => row.owner_name || "-" },
  { key: "owner_number", label: "Owner Contact No.", render: (row: WarehouseRow) => row.owner_number || "-" },
  { key: "owner_email", label: "Owner Email", render: (row: WarehouseRow) => row.owner_email || "-" },
  // { key: "depotName", label: "Depot Name" },
  { key: "location", label: "Warehouse Location", render: (row: WarehouseRow) => row.location || "-" },
  { key: "company_customer_id", label: "Customer", render: (row: WarehouseRow) => row.get_company_customer?.owner_name || "-" },
  { key: "warehouse_manager", label: "Warehouse Manager", render: (row: WarehouseRow) => row.warehouse_manager || "-" },
  { key: "warehouse_manager_contact", label: "Warehouse Manager Contact", render: (row: WarehouseRow) => row.warehouse_manager_contact || "-" },
  {
    key: "warehouse_type",
    label: "Warehouse Type",
    render: (row: WarehouseRow) => {
      const value = row.warehouse_type;
      const strValue = value != null ? String(value) : "";
      if (strValue === "0") return "Agent";
      if (strValue === "1") return "Hariss";
      if (strValue === "2") return "Outlet";
      return strValue || "-";
    },
  },
  { key: "business_type", label: "Business Type", render: (row: WarehouseRow) => {
      const value = row.business_type;
      const strValue = value != null ? String(value) : "";
      if (strValue === "1") return "B2B";
      return strValue || "-";
    }, },
  // { key: "region_id", label: "Region"},
  {
    label: 'Region',
    key: 'region_id',
    render: (row: WarehouseRow) => row.region?.region_name || '-',
  },
  {
    label: 'Sub Region',
    key: 'area_name',
    render: (row: WarehouseRow) => row.area?.area_name || '-',
  },
  // { key: "sub_region_id", label: "Sub Region"},
  { key: "city", label: "City", render: (row: WarehouseRow) => row.city || "-" },
  { key: "district", label: "District", render: (row: WarehouseRow) => row.district || "-" },
  { key: "location", label: "Location", render: (row: WarehouseRow) => row.location || "-" },
  { key: "address", label: "Address", render: (row: WarehouseRow) => row.address || "-" },
  { key: "town_village", label: "Town", render: (row: WarehouseRow) => row.town_village || "-" },
  { key: "street", label: "Street", render: (row: WarehouseRow) => row.street || "-" },
  { key: "landmark", label: "Landmark", render: (row: WarehouseRow) => row.landmark || "-" },
  { key: "latitude", label: "Latitude", render: (row: WarehouseRow) => row.latitude || "-" },
  { key: "longitude", label: "Longitude", render: (row: WarehouseRow) => row.longitude || "-" },
  { key: "threshold_radius", label: "Threshold Radius", render: (row: WarehouseRow) => row.threshold_radius || "-" },
  { key: "stock_capital", label: "Stock Capital", render: (row: WarehouseRow) => row.stock_capital || "-" },
  { key: "deposite_amount", label: "Deposit Amount", render: (row: WarehouseRow) => row.deposite_amount || "-" },
  { key: "device_no", label: "Device No.", render: (row: WarehouseRow) => row.device_no || "-" },
  { key: "p12_file", label: "P12 File", render: (row: WarehouseRow) => row.p12_file || "-" },
  { key: "branch_id", label: "Branch", render: (row: WarehouseRow) => row.branch_id || "-" },
  { key: "is_efris", label: "EFRIS", render: (row: WarehouseRow) => row.is_efris || "-" },
  {
    key: "status",
    label: "Status",
    render: (row: TableDataType) => (
      <div className="flex items-center">
        {row.status ? (
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

export default function Warehouse() {
  const {setLoading} = useLoading();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  type TableRow = TableDataType & { id?: string };
    // typed row for warehouse table
    type WarehouseRow = TableDataType & {
      id?:string;
      code?: string;
      warehouseName?: string;
      tin_no?: string;
      ownerName?: string;
      owner_email?: string;
      ownerContact?: string;
      warehouse_type?: string;
      business_type?: string;
      // depotName?: string;
      warehouse_manager?: string;
      warehouse_manager_contact?: string;
      district?: string;
      street?: string;
      branch_id?: string;
      town_village?: string;
      region?: {region_name?:string;}
      get_company_customer?: {owner_name?:string};
      city?: string;
      location?: string;
      landmark?: string;
      latitude?: string;
      longitude?: string;
      threshold_radius?: string;
      device_no?: string;
      is_branch?: string;
      p12_file?: string;
      is_efris?: string;
      stock_capital?: string;
      deposite_amount?: string;
      // depotLocation?: string;
      // depotLocation?: string;
      phoneNumber?: string;
      address?: string;
      
      status?: string | boolean | number;
    };

    const [selectedRow, setSelectedRow] = useState<WarehouseRow | null>(null);
    const router = useRouter();
    const { showSnackbar } = useSnackbar();
         const fetchWarehouse = useCallback(
             async (
                 page: number = 1,
                 pageSize: number = 5
             ): Promise<listReturnType> => {
                 try {
                   setLoading(true);
                     const listRes = await getWarehouse({
                         limit: pageSize.toString(),
                         page: page.toString(),
                     });
                     setLoading(false);
                     return {
                         data: listRes.data || [],
                         total: listRes.pagination.totalPages ,
                         currentPage: listRes.pagination.page ,
                         pageSize: listRes.pagination.limit ,
                     };
                 } catch (error: unknown) {
                     console.error("API Error:", error);
                     setLoading(false);
                     throw error;
                 }
             },
             []
         );

         const searchWarehouse = useCallback(
             async (
                 query: string,
                 pageSize: number = 5
             ): Promise<listReturnType> => {
                 try {
                   setLoading(true);
                     const listRes = await warehouseListGlobalSearch({
                         query,
                         per_page: pageSize.toString()
                     });
                     setLoading(false);
                     return {
                         data: listRes.data || [],
                         total: listRes.pagination.totalPages ,
                         currentPage: listRes.pagination.page ,
                         pageSize: listRes.pagination.limit ,
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
  
      try {
        if (!selectedRow?.id) throw new Error('Missing id');
        await deleteWarehouse(String(selectedRow.id)); // call API
        
        showSnackbar("Warehouse deleted successfully ", "success"); 
        setLoading(false);
        // await fetchWarehouses();
        //  setWarehouses((prev) => prev.filter((c) => String(c.id) !== String(selectedRow.id)));
      } catch (error) {
        console.error("Delete failed :", error);
        showSnackbar("Failed to delete Warehouse", "error"); 
      } finally {
        setShowDeletePopup(false);
        setSelectedRow(null);
      }
    };
    useEffect(() => {
      setLoading(true);
    }, []);
  return (
    <>
      
      <div className="h-[calc(100%-60px)]">
        <Table
          // data={warehouses}
          config={{
            api:{
              list: fetchWarehouse,
              search: searchWarehouse
            },
            header: {
              title: "Warehouse",
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
                  href="/dashboard/master/warehouse/addwarehouse"
                  isActive
                  leadingIcon="lucide:plus"
                  label="Add Warehouse"
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
                  router.push(`/dashboard/master/warehouse/${row.id}`);
                },
              },
              // { icon: "lucide:edit-2", onClick: console.log },
              {
                icon: "lucide:trash-2",
                onClick: (data: object) => {
                  const row = data as TableRow;
                  if (row.id) {
                    setSelectedRow({ id: String(row.id) });
                  }
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
            title="Warehouse"
            onClose={() => setShowDeletePopup(false)}
            onConfirm={handleConfirmDelete}
          />
        </div>
      )}
    </>
  );
}