"use client";

import ApprovalStatus from "@/app/components/approvalStatus";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import Table, {
  configType,
  listReturnType,
  TableDataType,
} from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import StatusBtn from "@/app/components/statusBtn2";
import { salesmanUnloadList } from "@/app/services/agentTransaction";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useRouter } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import { usePagePermissions } from "@/app/(private)/utils/usePagePermissions";
import FilterComponent from "@/app/components/filterComponent";

export default function SalesmanUnloadPage() {
  const { can, permissions } = usePagePermissions();
  const { setLoading } = useLoading();
  const { showSnackbar } = useSnackbar();
  const router = useRouter();

  const [refreshKey, setRefreshKey] = useState(0);

  // Refresh table when permissions load
  useEffect(() => {
    if (permissions.length > 0) {
      setRefreshKey((prev) => prev + 1);
    }
  }, [permissions]);

  const {
    regionOptions,
    warehouseOptions,
    routeOptions,
    channelOptions,
    itemCategoryOptions,
    customerSubCategoryOptions,
    ensureChannelLoaded, ensureCustomerSubCategoryLoaded, ensureItemCategoryLoaded, ensureRegionLoaded, ensureRouteLoaded, ensureWarehouseLoaded } = useAllDropdownListData();

  // Load dropdown data
  useEffect(() => {
    ensureChannelLoaded();
    ensureCustomerSubCategoryLoaded();
    ensureItemCategoryLoaded();
    ensureRegionLoaded();
    ensureRouteLoaded();
    ensureWarehouseLoaded();
  }, [ensureChannelLoaded, ensureCustomerSubCategoryLoaded, ensureItemCategoryLoaded, ensureRegionLoaded, ensureRouteLoaded, ensureWarehouseLoaded]);

  const [isFiltered, setIsFiltered] = useState(false);

  const [form, setForm] = useState({
    start_date: "",
    end_date: "",
    region_id: "",
  });

  const routeTypeOptions = [
    { label: "Urban", value: "1" },
    { label: "Rural", value: "2" },
  ];

  // ✅ Handle input changes
  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // ✅ Allow any filter combination (at least one required)
  const validateFilters = () => {
    if (!form.start_date && !form.end_date && !form.region_id) {
      showSnackbar("Please select at least one filter", "warning");
      return false;
    }
    return true;
  };

  // ✅ Apply Filter
  const handleFilter = () => {
    if (!validateFilters()) return;
    setIsFiltered(true);
    setRefreshKey((prev) => prev + 1);
  };

  // ✅ Reset Filter
  const handleReset = () => {
    setForm({ start_date: "", end_date: "", region_id: "" });
    setIsFiltered(false);
    setRefreshKey((prev) => prev + 1);
  };

  // ✅ Fetch Data API (used by Table)
  const fetchSalesmanUnloadHeader = useCallback(
    async (
      page: number = 1,
      pageSize: number = 50
    ): Promise<listReturnType> => {
      try {
        const params: any = {
          page: page.toString(),
          per_page: pageSize.toString(),
          submit: "Filter",
        };

        if (form.start_date) params.start_date = form.start_date;
        if (form.end_date) params.end_date = form.end_date;
        if (form.region_id) params.region_id = form.region_id;

        const listRes = await salesmanUnloadList(params);

        return {
          data: Array.isArray(listRes.data) ? listRes.data : [],
          total: listRes?.pagination?.totalPages || 1,
          currentPage: listRes?.pagination?.page || 1,
          pageSize: listRes?.pagination?.limit || pageSize,
        };
      } catch (error) {
        setLoading(false);
        showSnackbar("Error fetching data", "error");
        return { data: [], total: 0, currentPage: 1, pageSize: 50 };
      }
    },
    [setLoading, isFiltered, form]
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
        result = await salesmanUnloadList(params);
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


  // ✅ Table Columns
  const columns: configType["columns"] = [
    { key: "unload_date", label: "Unload Date" },
    { key: "unload_time", label: "Unload Time" },
    { key: "laod_date", label: "Load Date" },
    {
      key: "salesman",
      label: "Sales Team",
      render: (row: TableDataType) => {
        const obj =
          typeof row.salesman === "string"
            ? JSON.parse(row.salesman)
            : row.salesman;
        return obj?.name || "-";
      },
    },
    {
      key: "warehouse",
      label: "Distributor ",
      render: (row: TableDataType) => {
        const obj =
          typeof row.warehouse === "string"
            ? JSON.parse(row.warehouse)
            : row.warehouse;
        return obj ? `${obj.code} - ${obj.name}` : "-";
      },
    },
    {
      key: "route",
      label: "Route",
      render: (row: TableDataType) => {
        const obj =
          typeof row.route === "string" ? JSON.parse(row.route) : row.route;
        return obj ? `${obj.code} - ${obj.name}` : "-";
      },
    },
    { key: "Salesman_type", label: "Sales Team Role" },
    { key: "unload_no", label: "Unload No." },
    { key: "unload_from", label: "Unload By" },
    {
      key: "approval_status",
      label: "Approval Status",
      // showByDefault: true,
      render: (row: TableDataType) => <ApprovalStatus status={row.approval_status || "-"} />,
    },
    {
      key: "status",
      label: "Status",
      render: (row: TableDataType) => (<StatusBtn isActive={row.status ? true : false} />),
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="gap-3 mb-4">
        <h1 className="text-bold-700 text-lg font-semibold">Salesman Unload</h1>
      </div>

      {/* 📋 Table Section with Dynamic Filters */}
      <Table
        refreshKey={refreshKey}
        config={{
          api: { list: fetchSalesmanUnloadHeader, filterBy },
          header: {
            searchBar: false,
            columnFilter: true,
            filterRenderer: FilterComponent,
            
            actions: can("create") ? [
              <SidebarBtn
                key={0}
                href="/salesTeamUnload/add"
                isActive
                leadingIcon="lucide:plus"
                label="Add"
                labelTw="hidden sm:block"
              />,
            ] : [],
          },
          localStorageKey: "salesmanUnload-table",
          footer: { nextPrevBtn: true, pagination: true },
          columns,
          rowSelection: true,
          rowActions: [
            {
              icon: "lucide:eye",
              onClick: (data: object) => {
                const row = data as TableDataType;
                router.push(`/salesTeamUnload/details/${String(row.uuid)}`);
              },
            },
          ],
          pageSize: 50,
        }}
      />
    </div>
  );
}
