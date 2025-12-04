"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Table, {
  listReturnType,
  TableDataType,
} from "@/app/components/customTable";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import { downloadFile } from "@/app/services/allApi";
import {
  capsByUUID,
  capsList,
  returnExportCollapse,
  returnList,
  tempReturnList,
} from "@/app/services/companyTransaction";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";

const columns = [
  { key: "osa_code", label: "Code", showByDefault: true },
  {
    key: "warehouse_name",
    label: "Warehouse Name",
    showByDefault: true,
    render: (row: TableDataType) => {
      const code = row.warehouse_code ?? "";
      const name = row.warehouse_name ?? "";
      if (!code && !name) return "-";
      return `${code}${code && name ? " - " : ""}${name}`;
    },
  },
  {
    key: "truck_no",
    label: "Truck Number",
    showByDefault: true,
    render: (row: TableDataType) => {
      const code = row.truck_no ?? "";
      const name = row.truck_name ?? "";
      if (!code && !name) return "-";
      return `${code}${code && name ? " - " : ""}${name}`;
    },
  },
  {
    key: "driver_code",
    label: "Driver Code",
    showByDefault: true,
    render: (row: TableDataType) => {
      const code = row.driver_code ?? "";
      const name = row.driver_name ?? "";
      if (!code && !name) return "-";
      return `${code}${code && name ? " - " : ""}${name}`;
    },
  },
];

export default function CapsPage() {
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);
  //   const [threeDotLoading, setThreeDotLoading] = useState({
  //     csv: false,
  //     xlsx: false,
  //   });

  const fetchOrders = useCallback(
    async (page: number = 1, pageSize: number = 5): Promise<listReturnType> => {
      const params: Record<string, string> = {
        page: page.toString(),
        pageSize: pageSize.toString(),
      };
      const listRes = await capsList(params);
      return {
        data: Array.isArray(listRes.data) ? listRes.data : [],
        total: listRes?.pagination?.totalPages || 1,
        currentPage: listRes?.pagination?.page || 1,
        pageSize: listRes?.pagination?.limit || pageSize,
      };
    },
    []
  );

  const filterBy = useCallback(
    async (
      payload: Record<string, string | number | null>,
      pageSize: number,
      page: number = 1
    ): Promise<listReturnType> => {
      let result;
      try {
        const params: Record<string, string> = {
          per_page: pageSize.toString(),
          page: page.toString(),
        };
        Object.keys(payload || {}).forEach((k) => {
          const v = payload[k as keyof typeof payload];
          if (v !== null && typeof v !== "undefined" && String(v) !== "") {
            params[k] = String(v);
          }
        });
        result = await returnList(params);
      } catch (error) {
        throw new Error(String(error));
      }

      if (result?.error)
        throw new Error(result.data?.message || "Filter failed");
      else {
        const pagination =
          result.pagination?.pagination || result.pagination || {};
        return {
          data: result.data || [],
          total: pagination.totalPages || result.pagination?.totalPages || 0,
          totalRecords:
            pagination.totalRecords || result.pagination?.totalRecords || 0,
          currentPage:
            pagination.current_page || result.pagination?.currentPage || 0,
          pageSize: pagination.limit || pageSize,
        };
      }
    },
    []
  );

  //   const exportFile = async (format: "csv" | "xlsx" = "csv") => {
  //     try {
  //       setThreeDotLoading((prev) => ({ ...prev, [format]: true }));
  //       const response = await returnExportCollapse({ format });
  //       if (response && typeof response === "object" && response.download_url) {
  //         await downloadFile(response.download_url);
  //         showSnackbar("File downloaded successfully ", "success");
  //       } else {
  //         showSnackbar("Failed to get download URL", "error");
  //       }
  //       setThreeDotLoading((prev) => ({ ...prev, [format]: false }));
  //     } catch (error) {
  //       showSnackbar("Failed to download warehouse data", "error");
  //       setThreeDotLoading((prev) => ({ ...prev, [format]: false }));
  //     }
  //   };

  return (
    <>
      <div className="flex flex-col h-full">
        <Table
          refreshKey={refreshKey}
          config={{
            api: { list: fetchOrders, filterBy: filterBy },
            header: {
              title: "Company Caps Collections",
              searchBar: false,
              columnFilter: true,
              //   threeDot: [
              //     {
              //       icon: threeDotLoading.csv
              //         ? "eos-icons:three-dots-loading"
              //         : "gala:file-document",
              //       label: "Export CSV",
              //       labelTw: "text-[12px] hidden sm:block",
              //       onClick: () => !threeDotLoading.csv && exportFile("csv"),
              //     },
              //     {
              //       icon: threeDotLoading.xlsx
              //         ? "eos-icons:three-dots-loading"
              //         : "gala:file-document",
              //       label: "Export Excel",
              //       labelTw: "text-[12px] hidden sm:block",
              //       onClick: () => !threeDotLoading.xlsx && exportFile("xlsx"),
              //     },
              //   ],
              filterByFields: [
                {
                  key: "start_date",
                  label: "Start Date",
                  type: "date",
                },
                {
                  key: "end_date",
                  label: "End Date",
                  type: "date",
                },
              ],
              actions: [
                // <SidebarBtn
                //   key={1}
                //   href="caps/add"
                //   isActive
                //   leadingIcon="mdi:plus"
                //   label="Add"
                //   labelTw="hidden lg:block"
                // />,
              ],
            },
            rowSelection: false,
            footer: { nextPrevBtn: true, pagination: true },
            columns,
            rowActions: [
              {
                icon: "lucide:eye",
                onClick: (row: TableDataType) =>
                  router.push(`/caps/details/${row.uuid}`),
              },
            ],
            pageSize: 10,
          }}
        />
      </div>
    </>
  );
}
