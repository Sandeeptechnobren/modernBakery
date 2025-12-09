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
import { capsCollectionList, exportCapsCollection, capsCollectionStatusUpdate } from "@/app/services/agentTransaction";
import { downloadFile } from "@/app/services/allApi";
import { useSnackbar } from "@/app/services/snackbarContext"; // ✅ import snackbar
import { useLoading } from "@/app/services/loadingContext";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";

export default function SalemanLoad() {
  const { warehouseOptions, salesmanOptions, routeOptions, regionOptions, areaOptions, companyOptions } = useAllDropdownListData();
  const columns: configType["columns"] = [
    { key: "code", label: "Code" },
    // { key: "date", label: "Collection Date" },
    {
      key: "warehouse_code", label: "Distributors", render: (row: TableDataType) => {
        const code = row.warehouse_code || "-";
        const name = row.warehouse_name || "-";
        return `${code}${code && name ? " - " : ""}${name}`;
      }
    },
    {
      key: "customer",
      label: "Customer",
      render: (row: TableDataType) => {
        const code = row.customer_code ? row.customer_code : null;
        const name = row.customer_name ? row.customer_name : null;

        if (!code && !name) return "-";              // both null → show "-"
        if (code && !name) return code;              // only code
        if (!code && name) return name;              // only name

        return `${code} - ${name}`;                  // both available
      },
    }


  ];

  const { setLoading } = useLoading();
  const [refreshKey, setRefreshKey] = useState(0);
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const [threeDotLoading, setThreeDotLoading] = useState({
    csv: false,
    xlsx: false,
  });
  type TableRow = TableDataType & { id?: string };

  const fetchSalesmanLoadHeader = useCallback(
    async (
      page: number = 1,
      pageSize: number = 50
    ): Promise<listReturnType> => {
      try {
        setLoading(true);
        const listRes = await capsCollectionList({
          page: page.toString(),
          per_page: pageSize.toString(),
        });
        setLoading(false);
        return {
          data: Array.isArray(listRes.data) ? listRes.data : [],
          total: listRes?.pagination?.totalPages || 1,
          currentPage: listRes?.pagination?.page || 1,
          pageSize: listRes?.pagination?.limit || pageSize,
        };
      } catch (error: unknown) {
        setLoading(false);
        return {
          data: [],
          total: 1,
          currentPage: 1,
          pageSize: 5,
        };
      }
    }, [setLoading]);

  const exportListFile = async (format: string) => {
    try {
      const response = await exportCapsCollection({ format });
      if (response && typeof response === 'object' && response.download_url) {
        await downloadFile(response.download_url);
        showSnackbar("File downloaded successfully ", "success");
      } else {
        showSnackbar("Failed to get download URL", "error");
      }
    } catch (error) {
      showSnackbar("Failed to download warehouse data", "error");
    } finally {
    }
  };

  //  const exportDetailsFile = async (format: string) => {
  //    try {
  //      const response = await exportCapsCollection({ format }); 
  //      if (response && typeof response === 'object' && response.download_url) {
  //       await downloadFile(response.download_url);
  //        showSnackbar("File downloaded successfully ", "success");
  //      } else {
  //        showSnackbar("Failed to get download URL", "error");
  //      }
  //    } catch (error) {
  //      showSnackbar("Failed to download warehouse data", "error");
  //    } finally {
  //    }
  //  };

  const exportFile = async (format: "csv" | "xlsx" = "csv") => {
    try {
      setThreeDotLoading((prev) => ({ ...prev, [format]: true }));
      const response = await exportCapsCollection({ format });
      if (response && typeof response === 'object' && response.download_url) {
        await downloadFile(response.download_url);
        showSnackbar("File downloaded successfully ", "success");
      } else {
        showSnackbar("Failed to get download URL", "error");
      }
      setThreeDotLoading((prev) => ({ ...prev, [format]: false }));
    } catch (error) {
      showSnackbar("Failed to download Salesman Load data", "error");
      setThreeDotLoading((prev) => ({ ...prev, [format]: false }));
    } finally {
    }
  };


  const statusUpdate = async (
    dataOrIds: TableRow[] | (string | number)[] | undefined,
    selectedRowOrStatus?: number[] | number
  ) => {
    try {
      if (!dataOrIds || dataOrIds.length === 0) {
        showSnackbar("No CAPS Collection selected", "error");
        return;
      }

      let selectedRowsData: (string | number)[] = [];
      let status: number | undefined;

      const first = dataOrIds[0];
      // if first element is an object, treat dataOrIds as WarehouseRow[] and selectedRowOrStatus as selected indexes
      if (typeof first === "object") {
        const data = dataOrIds as TableRow[];
        const selectedRow = selectedRowOrStatus as number[] | undefined;
        if (!selectedRow || selectedRow.length === 0) {
          showSnackbar("No CAPS Collection selected", "error");
          return;
        }
        selectedRowsData = data
          .filter((row: TableRow, index) => selectedRow.includes(index))
          .map((row: TableRow) => row.uuid || row.id)
          .filter((id) => id !== undefined) as (string | number)[];
        status = typeof selectedRowOrStatus === "number" ? selectedRowOrStatus : 0;
      } else {
        // otherwise treat dataOrIds as an array of UUIDs
        const ids = dataOrIds as (string | number)[];
        if (ids.length === 0) {
          showSnackbar("No CAPS Collection selected", "error");
          return;
        }
        selectedRowsData = ids;
        status = typeof selectedRowOrStatus === "number" ? selectedRowOrStatus : 0;
      }

      if (selectedRowsData.length === 0) {
        showSnackbar("No CAPS Collection selected", "error");
        return;
      }

      const response = await capsCollectionStatusUpdate({ cap_ids: selectedRowsData, status: status ?? 0 });

      // Check if response has error
      if (response?.error || response?.message?.includes("error") || response?.errors) {
        const errorMessage = response?.message || response?.data?.message || "Failed to update CAPS Collection status";
        showSnackbar(errorMessage, "error");
        return;
      }

      setRefreshKey((k) => k + 1);
      showSnackbar("CAPS Collection status updated successfully", "success");
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to update CAPS Collection status";
      showSnackbar(errorMessage, "error");
    }
  };

  const filterBy = useCallback(
    async (
      payload: Record<string, string | number | null>,
      pageSize: number
    ): Promise<listReturnType> => {
      let result;
      setLoading(true);
      try {
        const params: Record<string, string> = {};
        Object.keys(payload || {}).forEach((k) => {
          const v = payload[k as keyof typeof payload];
          if (v !== null && typeof v !== "undefined" && String(v) !== "") {
            params[k] = String(v);
          }
        });
        result = await capsCollectionList(params);
      } finally {
        setLoading(false);
      }

      if (result?.error) throw new Error(result.data?.message || "Filter failed");
      else {
        const pagination = result.pagination?.pagination || result.pagination || {};
        return {
          data: result.data || [],
          total: pagination.totalPages || result.pagination?.totalPages || 0,
          totalRecords: pagination.totalRecords || result.pagination?.totalRecords || 0,
          currentPage: pagination.current_page || result.pagination?.currentPage || 0,
          pageSize: pagination.limit || pageSize,
        };
      }
    },
    [setLoading]
  );

  useEffect(() => {
    setRefreshKey(k => k + 1);
  }, [companyOptions, regionOptions, areaOptions, warehouseOptions, routeOptions, salesmanOptions]);

    return (
        <>
            <div className="flex flex-col h-full">
                <Table
                    refreshKey={refreshKey}
                    config={{
                        api: {
                            list: fetchSalesmanLoadHeader,
                            filterBy: filterBy,
                        },
                        header: {
                             filterByFields: [
                                {
                                    key: "start_date",
                                    label: "Start Date",
                                    type: "date",
                                    applyWhen: (filters) => !!filters.start_date && !!filters.end_date
                                },
                                {
                                    key: "end_date",
                                    label: "End Date",
                                    type: "date",
                                    applyWhen: (filters) => !!filters.start_date && !!filters.end_date
                                },
                                {
                                    key: "company",
                                    label: "Company",
                                    isSingle: false,
                                    multiSelectChips: true,
                                    options: Array.isArray(companyOptions) ? companyOptions : [],
                                },
                                {
                                    key: "region",
                                    label: "Region",
                                    isSingle: false,
                                    multiSelectChips: true,
                                    options: Array.isArray(regionOptions) ? regionOptions : [],
                                },
                                {
                                    key: "area",
                                    label: "Area",
                                    isSingle: false,
                                    multiSelectChips: true,
                                    options: Array.isArray(areaOptions) ? areaOptions : [],
                                },
                                {
                                    key: "warehouse",
                                    label: "Warehouse",
                                    isSingle: false,
                                    multiSelectChips: true,
                                    options: Array.isArray(warehouseOptions) ? warehouseOptions : [],
                                },
                                {
                                    key: "route_id",
                                    label: "Route",
                                    isSingle: false,
                                    multiSelectChips: true,
                                    options: Array.isArray(routeOptions) ? routeOptions : [],
                                },
                                 {
                                    key: "salesman",
                                    label: "Sales Team",
                                    isSingle: false,
                                    multiSelectChips: true,
                                    options: Array.isArray(salesmanOptions) ? salesmanOptions : [],
                                },
                                
                            ],
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
              ],
              title: "CAPS Master Collection",
              searchBar: false,
              columnFilter: true,
              actions: [
                <SidebarBtn
                  key={0}
                  href="/capsCollection/add"
                  isActive
                  leadingIcon="lucide:plus"
                  label="Add"
                  labelTw="hidden sm:block"
                />
              ],
            },
            footer: { nextPrevBtn: true, pagination: true },
            columns,
            rowSelection: true,
            rowActions: [
              {
                icon: "lucide:eye",
                onClick: (data: object) => {
                  const row = data as TableRow;
                  router.push(`/capsCollection/details/${row.uuid}`);
                },
              },
              // {
              //     icon: "lucide:edit-2",
              //     onClick: (data: object) => {
              //         const row = data as TableRow;
              //         router.push(
              //             `/capsCollection/${row.uuid}`
              //         );
              //     },
              // },
            ],
            pageSize: 50,
          }}
        />
      </div>

      {/* {showDeletePopup && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                    <DeleteConfirmPopup
                        title="Agent Customer"
                        onClose={() => setShowDeletePopup(false)}
                        onConfirm={handleConfirmDelete}
                    />
                </div>
            )} */}
    </>
  );
}
