"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Table, { TableDataType, listReturnType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { getWarehouse, deleteWarehouse, warehouseListGlobalSearch,exportWarehouseData,warehouseStatusUpdate, downloadFile } from "@/app/services/allApi";
import { useLoading } from "@/app/services/loadingContext";
import DeleteConfirmPopup from "@/app/components/deletePopUp";
import { useSnackbar } from "@/app/services/snackbarContext";

const dropdownDataList = [
  { icon: "gala:file-document", label: "Export CSV", iconWidth: 20 },
  { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
];

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
  // { key: "owner_email", label: "Owner Email", render: (row: WarehouseRow) => row.owner_email || "-" },
  // { key: "location", label: "Warehouse Location", render: (row: WarehouseRow) => row.location || "-" },
  // { key: "company", label: "Company Code", render: (row: WarehouseRow) => row.company?.company_code || "-" },
  // { key: "company", label: "Company Name", render: (row: WarehouseRow) => row.company?.company_name || "-" },
  { key: "warehouse_manager", label: "Warehouse Manager", render: (row: WarehouseRow) => row.warehouse_manager || "-" },
  { key: "warehouse_manager_contact", label: "Warehouse Manager Contact", render: (row: WarehouseRow) => row.warehouse_manager_contact || "-" },
  // {
  //   key: "warehouse_type",
  //   label: "Warehouse Type",
  //   showByDefault: true,
  //   render: (row: WarehouseRow) => {
  //     const value = row.warehouse_type;
  //     const strValue = value != null ? String(value) : "";
  //     if (strValue === "0") return "Agent";
  //     if (strValue === "1") return "Outlet";
  //     return strValue || "-";
  //   },
  // },
  // { key: "business_type", label: "Business Type", render: (row: WarehouseRow) => {
  //     const value = row.business_type;
  //     const strValue = value != null ? String(value) : "";
  //     if (strValue === "1") return "B2B";
  //     return strValue || "-";
  //   }, },
  // { key: "region_id", label: "Region"},
  {
    label: 'Region',
    showByDefault: true,
    key: 'region',
    render: (row: WarehouseRow) => row.region?.name || '-',
  },
  // {
  //   label: 'Area',
  //   showByDefault: true,
  //   key: 'area',
  //   render: (row: WarehouseRow) => row.area?.name || '-',
  // },
  // { key: "sub_region_id", label: "Sub Region"},
  { key: "city", label: "City", render: (row: WarehouseRow) => row.city || "-" },
  // { key: "location", label: "Location", showByDefault: true, render: (row: WarehouseRow) => row.location || "-" },
  // { key: "town_village", label: "Town", render: (row: WarehouseRow) => row.town_village || "-" },
  // { key: "street", label: "Street", render: (row: WarehouseRow) => row.street || "-" },
  // { key: "landmark", label: "Landmark", render: (row: WarehouseRow) => row.landmark || "-" },
  // { key: "agreed_stock_capital", label: "Stock Capital", render: (row: WarehouseRow) => row.agreed_stock_capital || "-" },
  { key: "is_efris", label: "EFRIS",
    showByDefault: true,
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
                         page: page.toString(),
                         per_page: pageSize.toString(),
                     });
                     setLoading(false);
                     return {
                         data: listRes.data || [],
                         total: listRes?.pagination?.last_page || listRes?.pagination?.pagination?.last_page || 1,
                         currentPage: listRes?.pagination?.current_page || listRes?.pagination?.pagination?.current_page || 1,
                         pageSize: listRes?.pagination?.limit || listRes?.pagination?.pagination?.limit || pageSize,
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

           const statusUpdate = async (
             dataOrIds: WarehouseRow[] | (string | number)[] | undefined,
             selectedRowOrStatus?: number[] | number
           ) => {
             try {
               // normalize to an array of numeric ids and determine status
               if (!dataOrIds || dataOrIds.length === 0) {
                 showSnackbar("No warehouses selected", "error");
                 return;
               }
       
               let selectedRowsData: number[] = [];
               let status: number | undefined;
       
               const first = dataOrIds[0];
               // if first element is an object, treat dataOrIds as WarehouseRow[] and selectedRowOrStatus as selected indexes
               if (typeof first === "object") {
                 const data = dataOrIds as WarehouseRow[];
                 const selectedRow = selectedRowOrStatus as number[] | undefined;
                 if (!selectedRow || selectedRow.length === 0) {
                   showSnackbar("No warehouses selected", "error");
                   return;
                 }
                 selectedRowsData = data
                   .filter((row: WarehouseRow, index) => selectedRow.includes(index))
                   .map((row: WarehouseRow) => Number(row.id));
                 status = typeof selectedRowOrStatus === "number" ? selectedRowOrStatus : 0;
               } else {
                 // otherwise treat dataOrIds as an array of ids
                 const ids = dataOrIds as (string | number)[];
                 if (ids.length === 0) {
                   showSnackbar("No warehouses selected", "error");
                   return;
                 }
                 selectedRowsData = ids.map((id) => Number(id));
                 status = typeof selectedRowOrStatus === "number" ? selectedRowOrStatus : 0;
               }
       
               if (selectedRowsData.length === 0) {
                 showSnackbar("No warehouses selected", "error");
                 return;
               }
       
               await warehouseStatusUpdate({ warehouse_ids: selectedRowsData, status: status ?? 0 });
               setRefreshKey((k) => k + 1);
               showSnackbar("Warehouse status updated successfully", "success");
             } catch (error) {
               showSnackbar("Failed to update warehouse status", "error");
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
                  onClick: exportFile,

                },
                // {
                //   icon: "lucide:radio",
                //   label: "Inactive",
                //   labelTw: "text-[12px] hidden sm:block",
                //   showOnSelect: true,
                //   onClick: (data: WarehouseRow[], selectedRow?: number[]) => {
                //     statusUpdate(data, selectedRow);
                // },
                //   // onClick: statusUpdate,
                // },
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