"use client";

import Table, {
  configType,
  listReturnType,
  TableDataType,
} from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import StatusBtn from "@/app/components/statusBtn2";
import { salesmanLoadHeaderList } from "@/app/services/agentTransaction";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface SalesmanLoadRow {
  osa_code?: string;
  warehouse?: { code?: string; name?: string };
  route?: { code?: string; name?: string };
  salesman?: { code?: string; name?: string };
  salesman_type?: { id?: number; code?: string; name?: string } | string;
  project_type?: { id?: number; code?: string; name?: string };
  status?: number | boolean;
  uuid?: string;
}

export default function SalemanLoad() {
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
      key: "project_type",
      label: "Salesman Role",
      render: (row: TableDataType) => {
        const s = row as SalesmanLoadRow;

        // Use project_type if present, otherwise fallback to salesman_type
        if (s.project_type && typeof s.project_type === "object") {
          const { code, name } = s.project_type;
          if (code || name) return `${code ?? ""} - ${name ?? ""}`;
        }

        if (s.salesman_type && typeof s.salesman_type === "object") {
          const { code, name } = s.salesman_type;
          if (code || name) return `${code ?? ""} - ${name ?? ""}`;
        }

        if (typeof s.salesman_type === "string") return s.salesman_type;

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

  useEffect(() => {
    setLoading(true);
  }, [setLoading]);

  return (
    <div className="flex flex-col h-full">
      <Table
        refreshKey={refreshKey}
        config={{
          api: {
            list: fetchSalesmanLoadHeader,
          },
          header: {
            title: "Salesman Load",
            searchBar: false,
            columnFilter: true,
            actions: [
              <SidebarBtn
                key={0}
                href="/salesmanLoad/add"
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
                if (row.uuid) router.push(`/salesmanLoad/details/${row.uuid}`);
              },
            },
          ],
          pageSize: 50,
        }}
      />
    </div>
  );
}
