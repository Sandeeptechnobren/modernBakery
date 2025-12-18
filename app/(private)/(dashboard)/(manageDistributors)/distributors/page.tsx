"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Table, { TableDataType, listReturnType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { getWarehouse, deleteWarehouse, warehouseListGlobalSearch, exportWarehouseData, warehouseStatusUpdate, downloadFile } from "@/app/services/allApi";
import { useLoading } from "@/app/services/loadingContext";
import DeleteConfirmPopup from "@/app/components/deletePopUp";
import { useSnackbar } from "@/app/services/snackbarContext";
import StatusBtn from "@/app/components/statusBtn2";


type WarehouseRow = TableDataType & {
  id?: string;
  uuid?: string;
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
  region?: { code?: string; name?: string; region_name?: string; }
  location?: { code?: string; name?: string; location_code?: string; location_name?: string; }
  company?: { company_code?: string; company_name?: string };
  city?: string;
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
  company_customer_id?: { customer_name: string };
  region_id?: { region_name: string };
  area?: { code?: string; area_code?: string; area_name?: string; name: string };
};

const columns = [
  // { key: "warehouse_code", label: "Warehouse Code", showByDefault: true, render: (row: WarehouseRow) =>(<span className="font-semibold text-[#181D27] text-[14px]">{ row.warehouse_code || "-"}</span>) },
  // { key: "registation_no", label: "Registration No.", render: (row: WarehouseRow) => (<span className="font-semibold text-[#181D27] text-[14px]">{row.registation_no || "-" }</span>)},
  { key: "warehouse_name", label: "Distributors Name", render: (row: WarehouseRow) => row.warehouse_code + " - " + row.warehouse_name || "-" },
  { key: "owner_name", label: "Owner Name", render: (row: WarehouseRow) => row.owner_name || "-" },
  { key: "owner_number", label: "Owner Contact No.", render: (row: WarehouseRow) => row.owner_number || "-" },
  // { key: "owner_email", label: "Owner Email", render: (row: WarehouseRow) => row.owner_email || "-" },
  // { key: "location", label: "Warehouse Location", render: (row: WarehouseRow) => row.location || "-" },
  // { key: "company", label: "Company Code", render: (row: WarehouseRow) => row.company?.company_code || "-" },
  // { key: "company", label: "Company Name", render: (row: WarehouseRow) => row.company?.company_name || "-" },
  { key: "warehouse_manager", label: "Distributors Manager", render: (row: WarehouseRow) => row.warehouse_manager || "-" },
  { key: "warehouse_manager_contact", label: "Distributors Manager Contact", render: (row: WarehouseRow) => row.warehouse_manager_contact || "-" },
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
  { key: "tin_no", label: "TIN No.", render: (row: WarehouseRow) => row.tin_no || "-" },
  {
    label: 'Region',
    // showByDefault: true,
    key: 'region',
    render: (row: WarehouseRow) => {
      return row.region?.name || row.region?.region_name || '-';
    }
  },
  {
    label: 'Area',
    // showByDefault: true,
    key: 'area',
    render: (row: WarehouseRow) => {
      return row.area?.name || row.area?.area_name || '-';

    }
  },
  // { key: "sub_region_id", label: "Sub Region"},
  { key: "city", label: "City", render: (row: WarehouseRow) => row.city || "-", },
  {
    key: "location", label: "Location", render: (row: WarehouseRow) => {
      return row.location?.name || row.location?.location_name || '-';
    }
  },
  // { key: "town_village", label: "Town", render: (row: WarehouseRow) => row.town_village || "-" },
  // { key: "street", label: "Street", render: (row: WarehouseRow) => row.street || "-" },
  // { key: "landmark", label: "Landmark", render: (row: WarehouseRow) => row.landmark || "-" },
  // { key: "agreed_stock_capital", label: "Stock Capital", render: (row: WarehouseRow) => row.agreed_stock_capital || "-" },
  {
    key: "is_efris", label: "EFRIS",
    // showByDefault: true,
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
    // showByDefault: true,
    // isSortable: true,
    render: (row: WarehouseRow) => <StatusBtn isActive={String(row.status) > "0"} />,
  },
];

export default function Warehouse() {
  const { setLoading } = useLoading();
  const [refreshKey, setRefreshKey] = useState(0);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  type TableRow = TableDataType & { id?: string };
  // typed row for warehouse table
  type WarehouseRow = TableDataType & {
    id?: string;
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
    region?: { code?: string; region_name?: string; }
    get_company_customer?: { owner_name?: string };
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
  const [threeDotLoading, setThreeDotLoading] = useState({
    csv: false,
    xlsx: false,
  });
  const fetchWarehouse = useCallback(
    async (
      page: number = 1,
      pageSize: number = 50
    ): Promise<listReturnType> => {
      try {
        //  setLoading(true);
        const listRes = await getWarehouse({
          //  limit: pageSize.toString(),
          page: page.toString(),
          per_page: pageSize.toString(),
        });
        //  setLoading(false);
        return {
          data: listRes.data || [],
          total: listRes?.pagination?.last_page || listRes?.pagination?.pagination?.last_page || 1,
          currentPage: listRes?.pagination?.current_page || listRes?.pagination?.pagination?.current_page || 1,
          pageSize: listRes?.pagination?.limit || listRes?.pagination?.pagination?.limit || pageSize,
        };
      } catch (error: unknown) {
        console.error("API Error:", error);
        setLoading(false);
        throw new Error(String(error));
      }
    },
    []
  );

  const searchWarehouse = useCallback(
    async (
      query: string,
      pageSize: number = 50,
      columns?: string,
      page: number = 1
    ): Promise<listReturnType> => {
      try {
        //  setLoading(true);
        const listRes = await warehouseListGlobalSearch({
          query,
          per_page: pageSize.toString(),
          page: page.toString(),
        });
        //  setLoading(false);
        return {
          data: listRes.data || [],
          total: listRes.pagination.last_page || 1,
          currentPage: listRes.pagination.current_page || 1,
          pageSize: listRes.pagination.limit || pageSize,
        };
      } catch (error: unknown) {
        console.error("API Error:", error);
        setLoading(false);
        throw error;
      }
    },
    []
  );


  const exportFile = async (format: string) => {
    try {
      setThreeDotLoading((prev) => ({ ...prev, [format]: true }));
      const response = await exportWarehouseData({ format });
      if (response && typeof response === 'object' && response.download_url) {
        await downloadFile(response.download_url);
        showSnackbar("File downloaded successfully ", "success");
      } else {
        showSnackbar("Failed to get download URL", "error");
      }
      setThreeDotLoading((prev) => ({ ...prev, [format]: false }));
    } catch (error) {
      showSnackbar("Failed to download Distributors data", "error");
      setThreeDotLoading((prev) => ({ ...prev, [format]: false }));
    } finally {
    }
  };

  const statusUpdate = async (ids?: (string | number)[], status: number = 0) => {
    try {
      if (!ids || ids.length === 0) {
        showSnackbar("No Distributors selected", "error");
        return;
      }
      const selectedRowsData: number[] = ids.map((id) => Number(id)).filter((n) => !Number.isNaN(n));
      console.log("selectedRowsData", selectedRowsData);
      if (selectedRowsData.length === 0) {
        showSnackbar("No Distributors selected", "error");
        return;
      }
      await warehouseStatusUpdate({ warehouse_ids: selectedRowsData, status });
      setRefreshKey((k) => k + 1);
      showSnackbar("Distributors status updated successfully", "success");
    } catch (error) {
      showSnackbar("Failed to update Distributors status", "error");
    }
  };


  const handleConfirmDelete = async () => {
    if (!selectedRow) return;

    try {
      if (!selectedRow?.id) throw new Error('Missing id');
      await deleteWarehouse(String(selectedRow.id)); // call API

      showSnackbar("Distributors deleted successfully ", "success");
      setLoading(false);
    } catch (error) {
      console.error("Delete failed :", error);
      showSnackbar("Failed to delete Distributors", "error");
    } finally {
      setShowDeletePopup(false);
      setSelectedRow(null);
    }
  };
  // useEffect(() => {
  //   setLoading(true);
  // }, []);
  return (
    <>


      <div className="flex flex-col h-full">
        <Table
          refreshKey={refreshKey}
          config={{
            api: {
              list: fetchWarehouse,
              search: searchWarehouse
            },

            header: {
              threeDot: [
                {
                  icon: threeDotLoading.csv ? "eos-icons:three-dots-loading" : "gala:file-document",
                  label: "Export CSV",
                  labelTw: "text-[12px] hidden sm:block",
                  onClick: () => !threeDotLoading.csv && exportFile("csv"),
                },
                {
                  icon: threeDotLoading.xlsx ? "eos-icons:three-dots-loading" : "gala:file-document",
                  label: "Export Excel",
                  labelTw: "text-[12px] hidden sm:block",
                  onClick: () => !threeDotLoading.xlsx && exportFile("xlsx"),
                },
                {
                  icon: "lucide:radio",
                  label: "Inactive",
                  // showOnSelect: true,
                  showWhen: (data: TableDataType[], selectedRow?: number[]) => {
                    if (!selectedRow || selectedRow.length === 0) return false;
                    const status = selectedRow?.map((id) => data[id].status).map(String);
                    return status?.includes("1") || false;
                  },
                  onClick: (data: TableDataType[], selectedRow?: number[]) => {
                    const status: string[] = [];
                    const ids = selectedRow?.map((id) => {
                      const currentStatus = data[id].status;
                      if (!status.includes(currentStatus)) {
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
                    if (!selectedRow || selectedRow.length === 0) return false;
                    const status = selectedRow?.map((id) => data[id].status).map(String);
                    return status?.includes("0") || false;
                  },
                  onClick: (data: TableDataType[], selectedRow?: number[]) => {
                    const status: string[] = [];
                    const ids = selectedRow?.map((id) => {
                      const currentStatus = data[id].status;
                      if (!status.includes(currentStatus)) {
                        status.push(currentStatus);
                      }
                      return data[id].id;
                    })
                    statusUpdate(ids, Number(1));
                  },
                },
              ],
              title: "Distributors",
              searchBar: true,
              columnFilter: true,
              actions: [
                <SidebarBtn
                  key={0}
                  href="/distributors/add"
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
                  router.push(`/distributors/details/${row.uuid}`);
                },
              },

              {
                icon: "lucide:edit-2",
                onClick: (data: object) => {
                  const row = data as TableRow;
                  router.push(`/distributors/${row.uuid}`);
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