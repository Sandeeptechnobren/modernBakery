"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import Table, {
  listReturnType,
  TableDataType,
} from "@/app/components/customTable";
import FilterComponent from "@/app/components/filterComponent";

type SalesmanType = {
  code?: string;
  [key: string]: any;
};

type TableDataTypeFixed = Omit<TableDataType, "salesman"> & {
  salesman?: SalesmanType | null;
};
import { useSnackbar } from "@/app/services/snackbarContext";
import { useLoading } from "@/app/services/loadingContext";
import { linkageList } from "@/app/services/agentTransaction";
import { usePagePermissions } from "@/app/(private)/utils/usePagePermissions";

const columns = [
  {
    key: "salesman",
    label: "Code",
    showByDefault: true,
    render: (row: TableDataType) =>
      typeof row.salesman === "object" &&
        row.salesman !== null &&
        "code" in row.salesman
        ? (row.salesman as { code?: string }).code || "-"
        : "-",
  },
  {
    key: "salesman",
    label: "Name",
    showByDefault: true,
    render: (row: TableDataType) =>
      typeof row.salesman === "object" &&
        row.salesman !== null &&
        "name" in row.salesman
        ? (row.salesman as { name?: string }).name || "-"
        : "-",
  },
  {
    key: "salesman",
    label: "Role",
    showByDefault: true,
    render: (row: TableDataType) =>
      typeof row.salesman === "object" &&
        row.salesman !== null &&
        "role_name" in row.salesman
        ? (row.salesman as { role_name?: string }).role_name || "-"
        : "-",
  },

  {
    key: "warehouse",
    label: "Distributor",
    showByDefault: true,
    render: (row: TableDataType) => {
      if (typeof row.warehouse === "object" && row.warehouse !== null) {
        const code = 'code' in row.warehouse ? row.warehouse.code : '';
        const name = 'name' in row.warehouse ? row.warehouse.name : '';
        if (!code && !name) return "-";
        return `${code}${code && name ? " - " : ""}${name}`;
      }
      return "-";
    },
  },

  {
    key: "manager",
    label: "SalesTeam Code",
    showByDefault: true,
    render: (row: TableDataType) =>
      typeof row.manager === "object" &&
        row.manager !== null &&
        "code" in row.manager
        ? (row.manager as { code?: string }).code || "-"
        : "-",
  },

  {
    key: "manager",
    label: "Worked With",
    showByDefault: true,
    render: (row: TableDataType) =>
      typeof row.manager === "object" &&
        row.manager !== null &&
        "name" in row.manager
        ? (row.manager as { name?: string }).name || "-"
        : "-",
  },
  {
    key: "route",
    label: "Route",
    showByDefault: true,
    render: (row: TableDataType) =>
      typeof row.route === "object" &&
        row.route !== null &&
        "name" in row.route
        ? (row.route as { name?: string }).name || "-"
        : "-",
  },
  {
    key: "requested_date",
    label: "Visit Date",
    showByDefault: true,
  },
  {
    key: "requested_time",
    label: "Visit Time",
    showByDefault: true,
  },
];


export default function CustomerInvoicePage() {
  const { can, permissions } = usePagePermissions();
  const { setLoading } = useLoading();
  // const { setLoading } = useLoading();

  const {
    customerSubCategoryOptions,
    companyOptions,
    salesmanOptions,
    channelOptions,
    warehouseAllOptions,
    routeOptions,
    regionOptions,
    areaOptions,
  } = useAllDropdownListData();
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);

  // Refresh table when permissions load
  useEffect(() => {
    if (permissions.length > 0) {
      setRefreshKey((prev) => prev + 1);
    }
  }, [permissions]);
  const [threeDotLoading, setThreeDotLoading] = useState({
    csv: false,
    xlsx: false,
  });

  const fetchOrders = useCallback(
    async (page: number = 1, pageSize: number = 5): Promise<listReturnType> => {
      const params: Record<string, string> = {
        page: page.toString(),
        pageSize: pageSize.toString(),
      };

      const listRes = await linkageList(params);

      const flatData = listRes.data?.map((item: any) => ({
        ...item,

        salesman: item.salesman || null,

        warehouse_code: item.warehouse?.code || "",
        warehouse_name: item.warehouse?.name || "",

        manager_code: item.manager?.code || "",
        manager_name: item.manager?.name || "",

        route_code: item.route?.code || "",
        route_name: item.route?.name || "",
      }));

      return {
        data: flatData || [],
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
        result = await linkageList(params);
      } finally {
        setLoading(false);
      }

      if (result?.error) throw new Error(result.data?.message || "Filter failed");
      else {
        const pagination = result.pagination?.pagination || result.pagination || {};
        return {
          data: result.data || [],
          total: pagination?.last_page || result.pagination?.last_page || 0,
          totalRecords: pagination?.total || result.pagination?.total || 0,
          currentPage: pagination?.current_page || result.pagination?.current_page || 0,
          pageSize: pagination?.per_page || pageSize,
        };
      }
    },
    [setLoading]
  );

  //   const exportFile = async (format: "csv" | "xlsx" = "csv") => {
  //     try {
  //       setThreeDotLoading((prev) => ({ ...prev, [format]: true }));
  //       const response = await agentOrderExport({ format });
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
  //     } finally {
  //     }
  //   };

  //   const downloadPdf = async (uuid: string) => {
  //     try {
  //       setLoading(true);
  //       const response = await agentOrderExport({ uuid: uuid, format: "pdf" });
  //       if (response && typeof response === 'object' && response.download_url) {
  //         await downloadFile(response.download_url);
  //         showSnackbar("File downloaded successfully ", "success");
  //       } else {
  //         showSnackbar("Failed to get download URL", "error");
  //       }
  //     } catch (error) {
  //       showSnackbar("Failed to download file", "error");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  // useEffect(() => {
  //   const res = async () => {
  //     const res = await workFlowRequest({ model: "order" });
  //     localStorage.setItem("workflow.order", JSON.stringify(res.data[0]))
  //   };
  //   res();
  // }, []);

  useEffect(() => {
    setRefreshKey((k) => k + 1);
  }, [
    companyOptions,
    customerSubCategoryOptions,
    routeOptions,
    warehouseAllOptions,
    channelOptions,
    salesmanOptions,
    areaOptions,
    regionOptions,
  ]);

  return (
    <>
      <div
        className="flex flex-col h-full"
      >
        <Table
          refreshKey={refreshKey}
          config={{
            api: { list: fetchOrders, filterBy: filterBy },
            header: {
              title: "SalesTeam Route Linkage",
              searchBar: false,
              columnFilter: true,
              filterRenderer: FilterComponent,
              actions: [],
            },
            rowSelection: true,
            footer: { nextPrevBtn: true, pagination: true },
            columns,
            pageSize: 10,
          }}
        />
      </div>
    </>
  );
}
