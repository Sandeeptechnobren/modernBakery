"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import Table, {
  listReturnType,
  TableDataType,
} from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import StatusBtn from "@/app/components/statusBtn2";
import {
  exportSalesmanData,
  salesmanList,
  SalesmanListGlobalSearch,
  updateSalesmanStatus,
} from "@/app/services/allApi";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";

const SalesmanPage = () => {
  const { setLoading } = useLoading();
  const { showSnackbar } = useSnackbar();
  const router = useRouter();

  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { warehouseOptions, routeOptions } = useAllDropdownListData();
  const [warehouseId, setWarehouseId] = useState<string>("");
  const [routeId, setRouteId] = useState<string>("");

  const handleStatusChange = async (
    data: TableDataType[],
    selectedRow: number[] | undefined,
    status: "0" | "1"
  ) => {
    if (!selectedRow || selectedRow.length === 0) {
      showSnackbar("Please select at least one sales Team", "error");
      return;
    }

    const selectedSalesmen = data.filter((_, index) =>
      selectedRow.includes(index)
    );
    // console.log(data, selectedRow)

    const failedUpdates: string[] = [];

    const selectedRowsData: string[] = data.filter((value, index) => selectedRow?.includes(index)).map((item) => item.id);
    try {
      setLoading(true);

      const res = await updateSalesmanStatus({ salesman_ids: selectedRowsData, status });

      if (failedUpdates.length > 0) {
        showSnackbar(
          `Failed to update status for: ${failedUpdates.join(", ")}`,
          "error"
        );
      } else {
        setRefreshKey((k) => k + 1);
        showSnackbar("Status updated successfully", "success");
        fetchSalesman();
      }

    } catch (error) {
      console.error("Status update error:", error);
      showSnackbar("An error occurred while updating status", "error");
    } finally {
      setLoading(false);
    }
  };


  const handleExport = async (fileType: "csv" | "xlsx") => {
    try {
      setLoading(true);

      const res = await exportSalesmanData({ format: fileType });
      console.log("Export API Response:", res);

      let downloadUrl = "";

      if (res?.url && res.url.startsWith("blob:")) {
        downloadUrl = res.url;
      } else if (res?.url && res.url.startsWith("http")) {
        downloadUrl = res.url;
      } else if (typeof res === "string" && res.includes(",")) {
        const blob = new Blob([res], {
          type:
            fileType === "csv"
              ? "text/csv;charset=utf-8;"
              : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        downloadUrl = URL.createObjectURL(blob);
      } else {
        showSnackbar("No valid file or URL returned from server", "error");
        return;
      }

      // ⬇ Trigger browser download
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `salesman_export.${fileType}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showSnackbar(
        `File Downloaded Successfully`,
        "success"
      );
    } catch (error) {
      console.error("Export error:", error);
      showSnackbar("Failed to export sales team data", "error");
    } finally {
      // setLoading(false);
      setShowExportDropdown(false);
    }
  };

  const searchSalesman = useCallback(
    async (
      query: string,
      pageSize: number = 50,
      columnName?: string,
      page: number = 1,
    ): Promise<listReturnType> => {
      try {
        // setLoading(true);
        const res = await SalesmanListGlobalSearch({ query: query, per_page: pageSize.toString(), page: page.toString() });
        // setLoading(false);

        return {
          data: res.data || [],
          total: res?.pagination?.totalPages || 1,
          currentPage: res?.pagination?.page || 1,
          pageSize: res?.pagination?.limit || pageSize
        };
      } catch (error) {
        setLoading(false);
        console.error(error);
        throw error;
      }
    },
    []
  );

  const fetchSalesman = useCallback(
    async (
      page: number = 1,
      pageSize: number = 50
    ): Promise<listReturnType> => {
      try {
        // setLoading(true);
        const listRes = await salesmanList({
          page: page.toString(),
        });
        // setLoading(false);
        return {
          data: listRes.data || [],
          total: listRes.pagination.totalPages || 1,
          currentPage: listRes.pagination.page || 1,
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

  const columns = [
    {
      key: "osa_code",
      label: "Sales Team",
      render: (row: TableDataType) => (
        <span className="font-semibold text-[#181D27] text-[14px]">
          {row.osa_code} - {row.name}
        </span>
      ),
    },
    {
      key: "salesman_type",
      label: "Sales Team Type",
      render: (row: TableDataType) => {
        const obj =
          typeof row.salesman_type === "string"
            ? JSON.parse(row.salesman_type)
            : row.salesman_type;
        return obj?.salesman_type_name || "-";
      },
    },

    { key: "designation", label: "Designation" },
    // {
    //       key: "warehouse",
    //       label: "Warehouse",
    //       render: (row: TableDataType) =>
    //           typeof row.warehouse === "object" &&
    //           row.warehouse !== null &&
    //           "warehouse_name" in row.warehouse
    //               ? (row.warehouse as { warehouse_name?: string })
    //                     .warehouse_name || "-"
    //               : "-",
    //               filter: {
    //                   isFilterable: true,
    //                   width: 320,
    //                   options: Array.isArray(warehouseOptions) ? warehouseOptions : [], // [{ value, label }]
    //                   onSelect: (selected: string | string[]) => {
    //                       setWarehouseId((prev) => prev === selected ? "" : (selected as string));
    //                   },
    //                   selectedValue: warehouseId,
    //               },

    //       showByDefault: true,
    //   },
    //   {
    //       key: "route",
    //       label: "Route",
    //       render: (row: TableDataType) => {
    //           if (
    //               typeof row.route === "object" &&
    //               row.route !== null &&
    //               "route_name" in row.route
    //           ) {
    //               return (row.route as { route_name?: string }).route_name || "-";
    //           }
    //           return typeof row.route === 'string' ? row.route : "-";
    //       },
    //       filter: {
    //           isFilterable: true,
    //           width: 320,
    //           options: Array.isArray(routeOptions) ? routeOptions : [],
    //           onSelect: (selected: string | string[]) => {
    //               setRouteId((prev) => prev === selected ? "" : (selected as string));
    //           },
    //           selectedValue: routeId,
    //       },

    //       showByDefault: true,
    //   },
    { key: "contact_no", label: "Contact No" },

    {
      key: "status",
      label: "Status",
      render: (row: TableDataType) => (
        <StatusBtn isActive={String(row.status) === "1"} />
      ),
    },
  ];

  return (
    <>
      {/* Table */}

      <div className="flex flex-col h-full">
        <Table
          refreshKey={refreshKey}
     
          config={{
            api: { list: fetchSalesman, search: searchSalesman },
            
            header: {
              title: "Sales Team",
              threeDot: [
                {
                  icon: "gala:file-document",
                  label: "Export CSV",
                  onClick: () => handleExport("csv")
                },
                {
                  icon: "gala:file-document",
                  label: "Export Excel",
                  onClick: () => handleExport("xlsx")
                },
                {
                  icon: "lucide:radio",
                  label: "Inactive",
                  showOnSelect: true,
                  onClick: (data: TableDataType[], selectedRow?: number[]) => {
                    handleStatusChange(data, selectedRow, "0");
                  }
                }
              ],
              searchBar: true,
              columnFilter: true,
              actions: [
                <SidebarBtn
                  key={0}
                  href="/salesTeam/add"
                  isActive
                  leadingIcon="lucide:plus"
                  label="Add"
                  labelTw="hidden sm:block"
                />,
              ],
            },
            localStorageKey: "salesman-table",
            footer: { nextPrevBtn: true, pagination: true },
            columns: columns,
            rowSelection: true,
            rowActions: [
              {
                icon: "lucide:eye",
                onClick: (data: TableDataType) => {
                  router.push(`/salesTeam/details/${data.uuid}`);
                },
              },
              {
                icon: "lucide:edit-2",
                onClick: (row: object) => {
                  const r = row as TableDataType;
                  router.push(`/salesTeam/${r.uuid}`);
                },
              },
            ],
            pageSize: 50,
          }}
        />
      </div>
    </>
  );
};

export default SalesmanPage;
