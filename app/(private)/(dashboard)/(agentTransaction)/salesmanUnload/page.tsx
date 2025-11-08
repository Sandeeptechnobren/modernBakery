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
  const { regionOptions, warehouseOptions, routeOptions, channelOptions, itemCategoryOptions, customerSubCategoryOptions } = useAllDropdownListData();

  const [refreshKey, setRefreshKey] = useState(0);
  const [isFiltered, setIsFiltered] = useState(false);

  const [form, setForm] = useState({
    start_date: "",
    end_date: "",
    region_id: "",
  });

  const [errors, setErrors] = useState({
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

  // ✅ Validate filters
  const validateFilters = () => {
    const newErrors: any = {};
    let isValid = true;

    if (!form.start_date) {
      newErrors.start_date = "From Date is required";
      isValid = false;
    }
    if (!form.end_date) {
      newErrors.end_date = "To Date is required";
      isValid = false;
    }
    if (!form.region_id) {
      newErrors.region_id = "Region is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
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

        // Build proper query object
        const params = {
          start_date: form.start_date,
          end_date: form.end_date,
          region_id: form.region_id,
          page: page.toString(),
          per_page: pageSize.toString(),
          submit: "Filter",
        };

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
      <div className="gap-3">
        <h1 className="text-bold-700">Salesman Unload</h1>
      </div>{" "}

      {/* 🔍 Filter Section
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4 bg-white p-4 rounded-lg shadow">
        <div>
          <InputFields
            required
            label="From Date"
            type="date"
            value={form.start_date}
            onChange={(e) => handleChange("start_date", e.target.value)}
          />
          {errors.start_date && (
            <p className="text-red-500 text-sm">{errors.start_date}</p>
          )}
        </div>

        <div>
          <InputFields
            required
            label="To Date"
            type="date"
            value={form.end_date}
            onChange={(e) => handleChange("end_date", e.target.value)}
          />
          {errors.end_date && (
            <p className="text-red-500 text-sm">{errors.end_date}</p>
          )}
        </div>

        <div>
          <InputFields
            required
            label="Region"
            value={form.region_id}
            onChange={(e) => handleChange("region_id", e.target.value)}
            options={regionOptions}
          />
          {errors.region_id && (
            <p className="text-red-500 text-sm">{errors.region_id}</p>
          )}
        </div>

        <div className="flex items-end">
          <SidebarBtn
            href="#"
            isActive
            leadingIcon="lucide:filter"
            label="Apply Filter"
            labelTw="hidden sm:block"
            onClick={handleFilter}
          />
        </div>
      </div> */}
      {/* 📋 Table Section */}
      <Table
        refreshKey={refreshKey}
        config={{
          api: { list: fetchSalesmanUnloadHeader },
          header: {
            // title: "Salesman Unload",
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
            // {
            //   icon: "lucide:edit-2",
            //   onClick: (data: object) => {
            //     const row = data as TableDataType;
            //     router.push(`/salesmanUnload/${String(row.uuid)}`);
            //   },
            // },
          ],
          pageSize: 50,
        }}
      />
    </div>
  );
}
