"use client";

import Table, {
  listReturnType,
  searchReturnType,
  TableDataType,
} from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { getRouteVisitList, downloadFile, exportRouteVisit, routeVisitGlobalSearch } from "@/app/services/allApi"; // Adjust import path
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useRouter } from "next/navigation";
import StatusBtn from "@/app/components/statusBtn2";
import { useCallback, useEffect, useState } from "react";
import { formatDate } from "../salesTeam/details/[uuid]/page";

const columns = [
  { key: "osa_code", label: "Code" },
  { key: "from_date", label: "From Date", render: (row: TableDataType) => row.from_date ? formatDate(row.from_date) : "" },
  { key: "to_date", label: "To Date", render: (row: TableDataType) => row.to_date ? formatDate(row.to_date) : "" },
  {
    key: "customer_type",
    label: "Customer Type",
    render: (row: TableDataType) =>
      String(row.customer_type) === "1" ? "Agent Customer" : "Merchandiser",
  },

  {
    key: "status",
    label: "Status",
    isSortable: true,
    render: (row: TableDataType) => (
      <StatusBtn isActive={String(row.status) === "1"} />
    ),
  },
];

export default function RouteVisits() {
  interface RouteVisitItem {
    uuid?: string;
    id?: number | string;
    from_date?: string;
    to_date?: string;
    customer_type?: string;
    status?: string;
  }

  const { setLoading } = useLoading();
  const [refreshKey, setRefreshKey] = useState(0);
  const [filters, setFilters] = useState({
    from_date: null as string | null,
    to_date: null as string | null,
    customer_type: null as string | null,
    status: null as string | null,
  });
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  type TableRow = TableDataType & { uuid?: string };



  const fetchRouteVisits = useCallback(
    async (
      page: number = 1,
      pageSize: number = 50
    ): Promise<listReturnType> => {
      try {
        // setLoading(true);

        // Prepare params for the API call
        const params = {
          from_date: filters.from_date,
          to_date: filters.to_date,
          customer_type: filters.customer_type,
          status: filters.status,
        };

        const listRes = await getRouteVisitList(params);
        // console.log("Route Visits", listRes);

        // setLoading(false);

        // ✅ Added: transform customer_type names only
        const transformedData = (listRes.data || []).map((item: any) => ({
          ...item,
          customer_type:
            item.customer_type == 1 ? "Agent Customer" : "Merchandiser",
          // Keep numeric status so StatusBtn (which checks String(row.status) === "1") works
          status: item.status,
          // Add date formatting:
          from_date: item.from_date ? item.from_date.split("T")[0] : "",
          to_date: item.to_date ? item.to_date.split("T")[0] : "",
        }));

        // Adjust this based on your actual API response structure
        return {
          data: transformedData,
          total: listRes.pagination?.totalPages || 1,
          currentPage: listRes.pagination?.page || 1,
          pageSize: listRes.pagination?.limit || pageSize,
        };
      } catch (error: unknown) {
        console.error("API Error:", error);
        setLoading(false);
        showSnackbar("Failed to fetch route visits", "error");
        throw error;
      }
    },
    [filters, setLoading, showSnackbar]
  );

  const searchRouteVisits = useCallback(
    async (
      query: string,
      pageSize: number = 50,
      column?: string,
      page: number = 1
    ): Promise<listReturnType> => {
      try {
        setLoading(true);
        const listRes = await routeVisitGlobalSearch({
          query,
          per_page: pageSize.toString(),
          page: page.toString(),
        });
        setLoading(false);
        return {
          data: listRes.data || [],
          total: listRes.pagination.totalPages,
          currentPage: listRes.pagination.page,
          pageSize: listRes.pagination.limit,
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
      const response = await exportRouteVisit({ format });
      if (response && typeof response === 'object' && response.file_url) {
        await downloadFile(response.file_url);
        showSnackbar("File downloaded successfully ", "success");
      } else {
        showSnackbar("Failed to get download URL", "error");
      }
    } catch (error) {
      showSnackbar("Failed to download route visit data", "error");
    } finally {
    }
  };
  // Refresh table when filters change
  useEffect(() => {
    setRefreshKey((prev) => prev + 1);
  }, [filters]);

  return (
    <>
      <div className="h-[calc(100%-60px)]">
        {/* Filter Section */}
        {/* <FilterSection /> */}

        <Table
          refreshKey={refreshKey}
          config={{
            api: {
              list: fetchRouteVisits,
              search: searchRouteVisits,
            },
            header: {
              title: "Route Visits",
              threeDot: [
                {
                  icon: "gala:file-document",
                  label: "Export CSV",
                  labelTw: "text-[12px] hidden sm:block",
                  onClick: () => exportFile("csv"),
                },
                {
                  icon: "gala:file-document",
                  label: "Export Excel",
                  labelTw: "text-[12px] hidden sm:block",
                  onClick: () => exportFile("xls"),

                },
              ],
              searchBar: true,
              columnFilter: true,
              actions: [
                <SidebarBtn
                  key={0}
                  href="/routeVisit/add"
                  isActive
                  leadingIcon="lucide:plus"
                  label="Add"
                  labelTw="hidden sm:block"
                />,
              ],
            },
            localStorageKey: "route-visits-table",
            table: {
              height: 500,
            },
            footer: {
              nextPrevBtn: true,
              pagination: true,
            },
            columns,
            rowSelection: false, // Set to true if you need row selection
            rowActions: [
              // {
              //   icon: "lucide:eye",
              //   onClick: (data: object) => {
              //     const row = data as TableRow;
              //     router.push(`/routeVisit/details/${row.uuid}`);
              //   },
              // },
              {
                icon: "lucide:edit-2",
                onClick: (data: object) => {
                  const row = data as TableRow;
                  router.push(`/routeVisit/${row.uuid}`);
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
