"use client";

import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import Table, {
  configType,
  listReturnType,
  TableDataType,
} from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import StatusBtn from "@/app/components/statusBtn2";
import { salesmanLoadHeaderList, exportSalesmanLoad, exportSalesmanLoadDownload } from "@/app/services/agentTransaction";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { downloadFile } from "@/app/services/allApi";

interface SalesmanLoadRow {
  osa_code?: string;
  warehouse?: { code?: string; name?: string };
  route?: { code?: string; name?: string };
  salesman?: { code?: string; name?: string };
  salesman_type?: { id?: number; code?: string; name?: string };
  project_type?: { id?: number; code?: string; name?: string };
  status?: number | boolean;
  uuid?: string;
}

export default function SalemanLoad() {

  const { regionOptions, warehouseOptions, routeOptions, channelOptions, itemCategoryOptions, customerSubCategoryOptions } = useAllDropdownListData();



  const columns: configType["columns"] = [
    {
      key: "warehouse",
      label: "Warehouse",
      render: (row: TableDataType) => {
        const s = row as SalesmanLoadRow;
        const nameParts = s.warehouse?.name?.split(" - ");
        const shortName =
          nameParts && nameParts.length > 1
            ? `${nameParts[0]} (${nameParts[1]})`
            : s.warehouse?.name || "-";
        return `${s.warehouse?.code ?? ""} - ${shortName}`;
      },
    },
    {
      key: "route",
      label: "Route",
      render: (row: TableDataType) => {
        const s = row as SalesmanLoadRow;
        return s.route?.code || "-";
      },
    },
    {
      key: "salesman",
      label: "Salesman",
      render: (row: TableDataType) => {
        const s = row as SalesmanLoadRow;
        return `${s.salesman?.code ?? ""} - ${s.salesman?.name ?? ""}`;
      },
    },
    {
      key: "salesman_type", label: "Salesman Type",
      render: (row: TableDataType) => {
        const s = row as SalesmanLoadRow;
        return `${s.salesman_type?.code ?? ""} - ${s.salesman_type?.name ?? ""}`;
      },
    },
    {
      key: "project_type",
      label: "Salesman Role",
      render: (row: TableDataType) => {
        const s = row as SalesmanLoadRow;

        // Use project_type if present, otherwise fallback to salesman_type
        if (s.project_type && typeof s.project_type === "object") {
          const { code, name } = s.project_type;
          if (code || name) return `${code ?? ""} - ${name ?? ""}`;
        }

        if (s.project_type && typeof s.project_type === "object") {
          const { code, name } = s.project_type;
          if (code || name) return `${code ?? ""} - ${name ?? ""}`;
        }

        if (typeof s.project_type === "string") return s.project_type;

        return "-";
      },
    },
    {
      key: "status",
      label: "Status",
      render: (row: TableDataType) => {
        const s = row as SalesmanLoadRow;
        return <StatusBtn isActive={!!s.status && Number(s.status) === 1} />;
      },
    },
  ];

  const { setLoading } = useLoading();
  const [refreshKey, setRefreshKey] = useState(0);
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const [threeDotLoading, setThreeDotLoading] = useState({
    csv: false,
    xlsx: false,
  });


  const fetchSalesmanLoadHeader = useCallback(
    async (
      page: number = 1,
      pageSize: number = 50
    ): Promise<listReturnType> => {
      try {
        setLoading(true);
        const listRes = await salesmanLoadHeaderList({});
        setLoading(false);

        return {
          data: Array.isArray(listRes.data) ? listRes.data : [],
          total: listRes?.pagination?.totalPages || 1,
          currentPage: listRes?.pagination?.page || 1,
          pageSize: listRes?.pagination?.limit || pageSize,
        };
      } catch (error) {
        setLoading(false);
        showSnackbar("Failed to load Salesman Load list", "error");
        return {
          data: [],
          total: 1,
          currentPage: 1,
          pageSize: pageSize,
        };
      }
    },
    [setLoading, showSnackbar]
  );

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
        result = await salesmanLoadHeaderList(params);
      } finally {
        setLoading(false);
      }

      if (result?.error) throw new Error(result.data?.message || "Filter failed");
      else {
        const pagination = result.pagination?.pagination || result.pagination || {};
        return {
          data: result.data || [],
          total: pagination.last_page || result.pagination?.last_page || 0,
          totalRecords: pagination.total || result.pagination?.total || 0,
          currentPage: pagination.current_page || result.pagination?.currentPage || 0,
          pageSize: pagination.limit || pageSize,
        };
      }
    },
    [setLoading]
  );

  useEffect(() => {
    setLoading(true);
  }, [setLoading]);

  useEffect(() => {
    setRefreshKey(refreshKey + 1);
  }, [regionOptions, warehouseOptions, routeOptions, channelOptions, itemCategoryOptions, customerSubCategoryOptions]);


  const downloadPdf = async (uuid: string) => {
    try {
      setLoading(true);
      const response = await exportSalesmanLoadDownload({ uuid: uuid, format: "excel" });
      if (response && typeof response === 'object' && response.download_url) {
        await downloadFile(response.download_url);
        showSnackbar("File downloaded successfully ", "success");
      } else {
        showSnackbar("Failed to get download URL", "error");
      }
    } catch (error) {
      showSnackbar("Failed to download file", "error");
    } finally {
      setLoading(false);
    }
  };



  const exportFile = async (format: "csv" | "xlsx" = "csv") => {
    try {
      setThreeDotLoading((prev) => ({ ...prev, [format]: true }));
      const response = await exportSalesmanLoad({ format });
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

  return (
    <div className="flex flex-col h-full">
      <Table
        refreshKey={refreshKey}
        config={{
          api: {
            list: fetchSalesmanLoadHeader,
            filterBy: filterBy,
          },
          header: {
            title: "SalesTeam Load",
            searchBar: false,
            columnFilter: true,
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

            filterByFields: [
              {
                key: "start_date",
                label: "From Date",
                type: "date",
              },
              {
                key: "end_date",
                label: "To Date",
                type: "date",
              },
              {
                key: "warehouse",
                label: "Warehouse",
                isSingle: false,
                multiSelectChips: true,
                options: Array.isArray(warehouseOptions) ? warehouseOptions : [],
              },

              {
                key: "region_id",
                label: "Region",
                isSingle: false,
                multiSelectChips: true,
                options: Array.isArray(regionOptions) ? regionOptions : [{ value: "1", label: "Rajneesh" }],
              },
              {
                key: "route_id",
                label: "Route",
                isSingle: false,
                multiSelectChips: true,
                options: Array.isArray(routeOptions) ? routeOptions : [],
              },
              {
                key: "outlet_channel_id",
                label: "Outlet Channel",
                isSingle: false,
                multiSelectChips: true,
                options: Array.isArray(channelOptions) ? channelOptions : [],
              },
              {
                key: "category_id",
                label: "Category",
                type: "select",
                options: Array.isArray(itemCategoryOptions) ? itemCategoryOptions : [],
                isSingle: false,
                multiSelectChips: true,
              },
              {
                key: "subcategory_id",
                label: "Subcategory",
                isSingle: false,
                multiSelectChips: true,
                options: Array.isArray(customerSubCategoryOptions) ? customerSubCategoryOptions : [],
              },
            ],
            actions: [
              <SidebarBtn
                key={0}
                href="/salesTeamLoad/add"
                isActive
                leadingIcon="lucide:plus"
                label="Add"
                labelTw="hidden sm:block"
              />,
            ],
          },
          localStorageKey: "salesmanLoad-table",
          footer: { nextPrevBtn: true, pagination: true },
          columns,
          rowSelection: true,
          rowActions: [
            {
              icon: "lucide:eye",
              onClick: (data: object) => {
                const row = data as { uuid?: string };
                if (row.uuid) router.push(`/salesTeamLoad/details/${row.uuid}`);
              },
            },
            {
              icon: "lucide:download",
              onClick: (row: TableDataType) => downloadPdf(row.uuid),
            },
          ],
          pageSize: 50,
        }}
      />
    </div>
  );
}
