"use client";

import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import Table, {
  configType,
  listReturnType,
  TableDataType,
} from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { salesmanUnloadList } from "@/app/services/agentTransaction";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

export default function SalesmanUnloadPage() {
  const { setLoading } = useLoading();
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const {
    regionOptions,
    warehouseOptions,
    routeOptions,
    channelOptions,
    itemCategoryOptions,
    customerSubCategoryOptions,
  } = useAllDropdownListData();

  const [refreshKey, setRefreshKey] = useState(0);
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
      if (!isFiltered) {
        return { data: [], total: 0, currentPage: 1, pageSize };
      }

      try {
        setLoading(true);

        // ✅ Build query with only filled filters
        const params: any = {
          page: page.toString(),
          per_page: pageSize.toString(),
          submit: "Filter",
        };

        if (form.start_date) params.start_date = form.start_date;
        if (form.end_date) params.end_date = form.end_date;
        if (form.region_id) params.region_id = form.region_id;

        const listRes = await salesmanUnloadList(params);
        setLoading(false);

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
                    const params: Record<string, string> = { };
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
                        total: pagination.last_page || result.pagination?.last_page || 0,
                        totalRecords: pagination.total || result.pagination?.total || 0,
                        currentPage: pagination.current_page || result.pagination?.currentPage || 0,
                        pageSize: pagination.limit || pageSize,
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
      label: "Salesman",
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
      label: "Warehouse",
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
    { key: "Salesman_type", label: "Salesman Role" },
    { key: "unload_no", label: "Unload No." },
    { key: "unload_from", label: "Unload By" },
    {
      key: "status",
      label: "Status",
      render: (row: TableDataType) => (row.status ? "Active" : "Inactive"),
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="gap-3 mb-4">
        <h1 className="text-bold-700 text-lg">Salesman Unload</h1>
      </div>

      {/* 📋 Table Section with Dynamic Filters */}
      <Table
        refreshKey={refreshKey}
        config={{
          api: { list: fetchSalesmanUnloadHeader },
          header: {
            searchBar: false,
            columnFilter: true,
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
                options: Array.isArray(warehouseOptions)
                  ? warehouseOptions
                  : [],
              },
              {
                key: "region_id",
                label: "Region",
                isSingle: false,
                multiSelectChips: true,
                options: Array.isArray(regionOptions)
                  ? regionOptions
                  : [{ value: "1", label: "Default Region" }],
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
                options: Array.isArray(itemCategoryOptions)
                  ? itemCategoryOptions
                  : [],
                isSingle: false,
                multiSelectChips: true,
              },
              {
                key: "subcategory_id",
                label: "Subcategory",
                isSingle: false,
                multiSelectChips: true,
                options: Array.isArray(customerSubCategoryOptions)
                  ? customerSubCategoryOptions
                  : [],
              },
            ],
            actions: [
              <SidebarBtn
                key={0}
                href="/salesmanUnload/add"
                isActive
                leadingIcon="lucide:plus"
                label="Add"
                labelTw="hidden sm:block"
              />,
            ],
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
                router.push(`/salesmanUnload/details/${String(row.uuid)}`);
              },
            },
          ],
          pageSize: 50,
        }}
      />
    </div>
  );
}
