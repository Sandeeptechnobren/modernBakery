"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify-icon/react";
import BorderIconButton from "@/app/components/borderIconButton";
import CustomDropdown from "@/app/components/customDropdown";
import Table, { TableDataType, listReturnType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { getWarehouse, deleteWarehouse, warehouseListGlobalSearch,exportWarehouseData,warehouseStatusUpdate } from "@/app/services/allApi";
import { useLoading } from "@/app/services/loadingContext";
import DeleteConfirmPopup from "@/app/components/deletePopUp";
import { useSnackbar } from "@/app/services/snackbarContext";

const dropdownDataList = [
  { icon: "gala:file-document", label: "Export CSV", iconWidth: 20 },
  { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
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
  region?: {name?:string;}
  company?:{company_code?:string; company_name?:string};
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
  agreed_stock_capital?: string;
  deposite_amount?: string;
  phoneNumber?: string;
  address?: string;
  status?: string | boolean | number;
  company_customer_id?:{customer_name: string};
  region_id?:{ region_name:string};
  area?: {name:string};
};

const columns = [
  { key: "warehouse_code", label: "Warehouse Code", showByDefault: true, render: (row: WarehouseRow) =>(<span className="font-semibold text-[#181D27] text-[14px]">{ row.warehouse_code || "-"}</span>) },
  // { key: "registation_no", label: "Registration No.", render: (row: WarehouseRow) => (<span className="font-semibold text-[#181D27] text-[14px]">{row.registation_no || "-" }</span>)},
  { key: "warehouse_name", label: "Warehouse Name", showByDefault: true, render: (row: WarehouseRow) => row.warehouse_name || "-" },
  { key: "owner_name", label: "Owner Name", render: (row: WarehouseRow) => row.owner_name || "-" },
  { key: "owner_number", label: "Owner Contact No.", render: (row: WarehouseRow) => row.owner_number || "-" },
  { key: "owner_email", label: "Owner Email", render: (row: WarehouseRow) => row.owner_email || "-" },
  // { key: "location", label: "Warehouse Location", render: (row: WarehouseRow) => row.location || "-" },
  { key: "company", label: "Company Code", render: (row: WarehouseRow) => row.company?.company_code || "-" },
  { key: "company", label: "Company Name", render: (row: WarehouseRow) => row.company?.company_name || "-" },
  { key: "warehouse_manager", label: "Warehouse Manager", render: (row: WarehouseRow) => row.warehouse_manager || "-" },
  { key: "warehouse_manager_contact", label: "Warehouse Manager Contact", render: (row: WarehouseRow) => row.warehouse_manager_contact || "-" },
  {
    key: "warehouse_type",
    label: "Warehouse Type",
    render: (row: WarehouseRow) => {
      const value = row.warehouse_type;
      const strValue = value != null ? String(value) : "";
      if (strValue === "0") return "Agent";
      if (strValue === "1") return "Outlet";
      return strValue || "-";
    },
  },
  // { key: "business_type", label: "Business Type", render: (row: WarehouseRow) => {
  //     const value = row.business_type;
  //     const strValue = value != null ? String(value) : "";
  //     if (strValue === "1") return "B2B";
  //     return strValue || "-";
  //   }, },
  // { key: "region_id", label: "Region"},
  {
    label: 'Region',
    key: 'region',
    render: (row: WarehouseRow) => row.region?.name || '-',
  },
  {
    label: 'Area',
    key: 'area',
    render: (row: WarehouseRow) => row.area?.name || '-',
  },
  // { key: "sub_region_id", label: "Sub Region"},
  { key: "city", label: "City", render: (row: WarehouseRow) => row.city || "-" },
  { key: "location", label: "Location", showByDefault: true, render: (row: WarehouseRow) => row.location || "-" },
  { key: "town_village", label: "Town", render: (row: WarehouseRow) => row.town_village || "-" },
  { key: "street", label: "Street", render: (row: WarehouseRow) => row.street || "-" },
  { key: "landmark", label: "Landmark", render: (row: WarehouseRow) => row.landmark || "-" },
  { key: "agreed_stock_capital", label: "Stock Capital", render: (row: WarehouseRow) => row.agreed_stock_capital || "-" },
  { key: "is_efris", label: "EFRIS",
     render: (row: WarehouseRow) => {
      const value = row.is_efris;
      const strValue = value != null ? String(value) : "";
      if (strValue === "0") return "Disable";
      if (strValue === "1") return "Enable";
      return strValue || "-";
    }, 
  },
  {
    key: "status",
    label: "Status",
    showByDefault: true,
    render: (row: WarehouseRow) => {
      const value = row.status;
      const strValue = value != null ? String(value) : "";
      if (strValue === "1" || strValue === "Active" || strValue === "true" || strValue === "True" || value === 1 || value === true) {
        return (
          <span className="text-sm text-[#027A48] bg-[#ECFDF3] font-[500] p-1 px-4 rounded-xl text-[12px]">
            Active
          </span>
        );
      }
      return (
        <span className="text-sm text-red-700 bg-red-200 p-1 px-4 rounded-xl text-[12px]">
          Inactive
        </span>
      );
    },
  },
];

export default function Warehouse() {
  const {setLoading} = useLoading();
  const [refreshKey, setRefreshKey] = useState(0);
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
      agreed_stock_capital?: string;
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
                 pageSize: number = 50
             ): Promise<listReturnType> => {
                 try {
                   setLoading(true);
                     const listRes = await getWarehouse({
                        //  limit: pageSize.toString(),
                         per_page: pageSize.toString(),
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
                 pageSize: number = 50
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
 

         const exportFile = async () => {
         try {
           const response = await exportWarehouseData({}); 
           let fileUrl = response;
           if (response && typeof response === 'object' && response.url) {
             fileUrl = response.url;
           }
           if (fileUrl) {
             const link = document.createElement('a');
             link.href = fileUrl;
             link.download = '';
             document.body.appendChild(link);
             link.click();
             document.body.removeChild(link);
             showSnackbar("File downloaded successfully ", "success");
           } else {
             showSnackbar("Failed to get download URL", "error");
           }
         } catch (error) {
           showSnackbar("Failed to download warehouse data", "error");
         } finally {
         }
       };

       const statusUpdate = async (data: WarehouseRow[], selectedRow?: number[]) => {
         try {
           if (!selectedRow || selectedRow.length === 0) {
             showSnackbar("No warehouses selected", "error");
             return;
           }
           const selectedRowsData: number[] = data.filter((row:WarehouseRow,index) => selectedRow.includes(index)).map((row:WarehouseRow) => Number(row.id));
           console.log("selectedRowsData",selectedRowsData);
           if (selectedRowsData.length === 0) {
             showSnackbar("No warehouses selected", "error");
             return;
           }
           await warehouseStatusUpdate({ warehouse_ids: selectedRowsData, status: 0 });
           setRefreshKey((k) => k + 1);
           showSnackbar("Warehouse status updated successfully", "success");
         } catch (error) {
           showSnackbar("Failed to update warehouse status", "error");
         } finally {
         }
       };
         

        
    const handleConfirmDelete = async () => {
      if (!selectedRow) return;
  
      try {
        if (!selectedRow?.id) throw new Error('Missing id');
        await deleteWarehouse(String(selectedRow.id)); // call API
        
        showSnackbar("Warehouse deleted successfully ", "success"); 
        setLoading(false);
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

        
      <div className="flex flex-col h-full">
        <Table
        refreshKey={refreshKey}
          config={{
            api:{
              list: fetchWarehouse,
              search: searchWarehouse
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
                },
                {
                  icon: "lucide:radio",
                  label: "Inactive",
                  labelTw: "text-[12px] hidden sm:block",
                  showOnSelect: true,
                  onClick: (data: WarehouseRow[], selectedRow?: number[]) => {
                    statusUpdate(data, selectedRow);
                },
                  // onClick: statusUpdate,
                },
              ],
              title: "Warehouse",
               
                            
              searchBar: true,
              columnFilter: true,
              actions: [
                <SidebarBtn
                  key={0}
                  href="/warehouse/add"
                  isActive
                  leadingIcon="lucide:plus"
                  label="Add"
                  labelTw="hidden sm:block"
                />,
              ],
            },
            localStorageKey: "master-warehouse-table",
            footer: { nextPrevBtn: true, pagination: true },
            columns,
            rowSelection: true,
          
            rowActions: [
                {
                icon: "lucide:eye",
                onClick: (data: object) => {
                  const row = data as TableRow;
                  router.push(`/warehouse/details/${row.id}`);
                },
              },

              {
                icon: "lucide:edit-2",
                onClick: (data: object) => {
                  const row = data as TableRow;
                  router.push(`/warehouse/${row.id}`);
                },
              },
            
            ],
            pageSize: 50,
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