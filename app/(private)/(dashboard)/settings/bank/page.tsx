"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import StatusBtn from "@/app/components/statusBtn2";
import Table, {
  configType,
  listReturnType,
  TableDataType,
} from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { getbankList } from "@/app/services/allApi";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useLoading } from "@/app/services/loadingContext";

export default function Bank() {
  const [selectedBank, setSelectedBank] = useState<string>("");
  const columns: configType["columns"] = [
    { key: "osa_code", label: "OSA Code", showByDefault: true },
    { key: "bank_name", label: "Bank Name", showByDefault: true },
    { key: "branch", label: "Branch", showByDefault: true },
    { key: "city", label: "City", showByDefault: true },
    { key: "account_number", label: "Account Number", showByDefault: true },
    {
      key: "status",
      label: "Status",
      render: (row: TableDataType) => {
        // Treat status 1 or 'active' (case-insensitive) as active
        const isActive =
          String(row.status) === "1" ||
          (typeof row.status === "string" &&
            row.status.toLowerCase() === "active");
        return <StatusBtn isActive={isActive} />;
      },
      showByDefault: true,
    },
  ];

  const { setLoading } = useLoading();
  const [refreshKey, setRefreshKey] = useState(0);
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  type TableRow = TableDataType & { uuid?: string };

  const fetchBank = useCallback(
    async (
      page: number = 1,
      pageSize: number = 50
    ): Promise<listReturnType> => {
      try {
        setLoading(true);

        // Use real API call
        const listRes = await getbankList({
          page,
          limit: pageSize,
        });

        console.log("Bank API Response:", listRes);

        setLoading(false);

        // Handle API response based on your API structure
        if (listRes?.success === true || listRes?.status === "success") {
          return {
            data: Array.isArray(listRes.data) ? listRes.data : [],
            total: listRes?.pagination?.totalPages || listRes?.total || 1,
            currentPage:
              listRes?.pagination?.page || listRes?.currentPage || page,
            pageSize:
              listRes?.pagination?.limit || listRes?.pageSize || pageSize,
          };
        } else {
          showSnackbar(
            listRes?.message || "Failed to fetch bank data",
            "error"
          );
          return {
            data: [],
            total: 1,
            currentPage: page,
            pageSize: pageSize,
          };
        }
      } catch (error: unknown) {
        setLoading(false);
        console.error("Error fetching bank data:", error);
        showSnackbar("Error fetching bank data", "error");
        return {
          data: [],
          total: 1,
          currentPage: page,
          pageSize: pageSize,
        };
      }
    },
    [setLoading, showSnackbar]
  );

  useEffect(() => {
    setLoading(true);
  }, [setLoading]);

  // Refresh function if needed
  const refreshTable = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <>
      <div className="flex flex-col h-full">
        <Table
          refreshKey={refreshKey}
          config={{
            api: { list: fetchBank },
            header: {
              title: "Bank",
              searchBar: false,
              columnFilter: true,
              actions: [
                <SidebarBtn
                  key={0}
                  href="/settings/bank/add"
                  isActive
                  leadingIcon="lucide:plus"
                  label="Add"
                  labelTw="hidden sm:block"
                />,
              ],
            },
            localStorageKey: "bank-table",
            footer: { nextPrevBtn: true, pagination: true },
            columns,
            rowSelection: true,
            rowActions: [
              {
                icon: "lucide:edit-2",
                onClick: (data: object) => {
                  const row = data as TableRow;
                  // Navigate to the settings bank edit page which will call getbankByUuid on mount
                  router.push(`/settings/bank/${row.uuid}`);
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
