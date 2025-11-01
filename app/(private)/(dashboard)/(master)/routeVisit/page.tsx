"use client";

import { useState, useEffect, useCallback } from "react";
import { Icon } from "@iconify-icon/react";
import { useRouter } from "next/navigation";
import Table, {
  listReturnType,
  searchReturnType,
  TableDataType,
} from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { getRouteVisitList } from "@/app/services/allApi";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useLoading } from "@/app/services/loadingContext";

const columns = [
  { key: "from_date", label: "From Date" },
  { key: "to_date", label: "To Date" },
  { key: "customer_type", label: "Customer Type" },
  { key: "status", label: "Status" },
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
        setLoading(true);

        const params = {
          from_date: filters.from_date,
          to_date: filters.to_date,
          customer_type: filters.customer_type,
          status: filters.status,
        };

        const listRes = await getRouteVisitList(params);
        console.log("Route Visits", listRes);

        setLoading(false);

        const transformedData = (listRes.data || []).map(
          (item: {
            customer_type: number;
            status: number;
            from_date: string;
            to_date: string;
          }) => ({
            ...item,
            // Transform customer_type for display
            customer_type:
              item.customer_type == 1
                ? "Agent Customer"
                : item.customer_type == 2
                ? "Merchandiser"
                : item.customer_type?.toString(),
            // Transform status for display
            status:
              item.status == 1
                ? "Active"
                : item.status == 0
                ? "Inactive"
                : item.status?.toString(),
            // Format dates from "2025-11-29T00:00:00.000000Z" to "2025-11-29"
            from_date: item.from_date ? item.from_date.split("T")[0] : "",
            to_date: item.to_date ? item.to_date.split("T")[0] : "",
          })
        );

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
      searchQuery: string,
      pageSize: number
    ): Promise<searchReturnType> => {
      try {
        setLoading(true);

        const params = {
          from_date: filters.from_date,
          to_date: filters.to_date,
          customer_type: filters.customer_type,
          status: filters.status,
          search: searchQuery || null,
        };

        const result = await getRouteVisitList(params);
        setLoading(false);

        const transformedData = (result.data || []).map(
          (item: {
            customer_type: number;
            status: number;
            from_date: string;
            to_date: string;
          }) => ({
            ...item,
            // Transform customer_type for display
            customer_type:
              item.customer_type == 1
                ? "Agent Customer"
                : item.customer_type == 2
                ? "Merchandiser"
                : item.customer_type?.toString(),
            // Transform status for display
            status:
              item.status == 1
                ? "Active"
                : item.status == 0
                ? "Inactive"
                : item.status?.toString(),
            // Format dates from "2025-11-29T00:00:00.000000Z" to "2025-11-29"
            from_date: item.from_date ? item.from_date.split("T")[0] : "",
            to_date: item.to_date ? item.to_date.split("T")[0] : "",
          })
        );

        return {
          data: transformedData,
          total: result.pagination?.totalPages || 0,
          currentPage: result.pagination?.page || 1,
          pageSize: result.pagination?.limit || pageSize,
        };
      } catch (error: unknown) {
        console.error("Search Error:", error);
        setLoading(false);
        showSnackbar("Search failed", "error");
        throw error;
      }
    },
    [filters, setLoading, showSnackbar]
  );

  // Refresh table when filters change
  useEffect(() => {
    setRefreshKey((prev) => prev + 1);
  }, [filters]);

  return (
    <>
      <div className="h-[calc(100%-60px)]">
        <Table
          refreshKey={refreshKey}
          config={{
            api: {
              list: fetchRouteVisits,
              search: searchRouteVisits,
            },
            header: {
              title: "Route Visits",
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
            localStorageKey: "routeVisit-table",
            table: {
              height: 500,
            },
            footer: {
              nextPrevBtn: true,
              pagination: true,
            },
            columns,
            rowSelection: false,
            rowActions: [
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
