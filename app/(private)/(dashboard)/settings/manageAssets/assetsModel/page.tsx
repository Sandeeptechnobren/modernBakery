"use client";

import Table, { TableDataType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import StatusBtn from "@/app/components/statusBtn2";
import { assetsModelList } from "@/app/services/allApi";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useRouter } from "next/navigation";

interface AssetsModelAPI {
  id: number;
  code: string;
  asset_type: { id?: number; name?: string } | string | null;
  manu_type: { id?: number; name?: string } | string | null;
  name: string;
  status: number;
}

interface ModelNumber {
  id: number;
  name: string;
  code: string;
  status: number;
  asset_type: { id?: number; name?: string } | string | null;
  manu_type: { id?: number; name?: string } | string | null;
}

export default function Page() {
  const pageSize = 10;

  const { showSnackbar } = useSnackbar();
  const router = useRouter();

  const renderMaybeObjectName = (val: any) => {
    if (val == null) return "-";
    if (typeof val === "string") return val || "-";
    if (typeof val === "object") return (val.name as string) || "-";
    return "-";
  };

  const columns = [
    {
      key: "code",
      label: "OSA Code",
      render: (row: TableDataType) => (
        <span className="font-semibold text-[#181D27] text-[14px]">
          {row.code}
        </span>
      ),
    },
    { key: "name", label: "Model Number" },
    {
      key: "asset_type",
      label: "Asset Category",
      render: (row: TableDataType) => renderMaybeObjectName(row.asset_type),
    },
    {
      key: "manu_type",
      label: "Manufacturer",
      render: (row: TableDataType) => renderMaybeObjectName(row.manu_type),
    },
    {
      key: "status",
      label: "Status",
      render: (row: TableDataType) => <StatusBtn isActive={row.status === "Active"} />,
    },
  ];

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-[20px]">
        <h1 className="text-[20px] font-semibold text-[#181D27]">Model Numbers</h1>
      </div>

      {/* Table */}
      <div className="h-[calc(100%-60px)]">
        <Table
          config={{
            header: {
              searchBar: false,
              columnFilter: true,
              actions: [
                <SidebarBtn
                  key={0}
                  href="/settings/manageAssets/assetsModel/add"
                  isActive
                  leadingIcon="lucide:plus"
                  label="Add"
                  labelTw="hidden sm:block"
                />,
              ],
            },
            pageSize,
            localStorageKey: "assets-model-number-table",
            footer: { nextPrevBtn: true, pagination: true },
            columns,
            rowSelection: true,
            api: {
              list: async (pageNo: number, pageSize: number) => {
                try {
                  const res = await assetsModelList({
                    page: String(pageNo),
                    limit: String(pageSize),
                  });

                  const formatted: ModelNumber[] = (res.data || []).map(
                    (s: AssetsModelAPI) => ({
                      id: s.id,
                      asset_type: s.asset_type,
                      manu_type: s.manu_type,
                      code: s.code,
                      name: s.name || "N/A",
                      status: s.status,
                    })
                  );

                  const tableData: TableDataType[] = formatted.map((c) => ({
                    id: String(c.id),
                    asset_type: renderMaybeObjectName(c.asset_type),
                    manu_type: renderMaybeObjectName(c.manu_type),
                    code: c.code ?? "-",
                    name: c.name ?? "-",
                    status: c.status === 1 ? "Active" : "Inactive",
                  }));

                  return {
                    data: tableData,
                    currentPage: res.pagination?.page || pageNo,
                    pageSize,
                    total: res.pagination?.totalPages ?? 1,
                    totalRecords: res.pagination?.totalRecords ?? tableData.length,
                  };
                } catch (error) {
                  console.error("Failed to fetch model numbers ❌", error);
                  showSnackbar("Failed to load model numbers ❌", "error");
                  return {
                    data: [],
                    currentPage: 1,
                    pageSize,
                    total: 0,
                    totalRecords: 0,
                  };
                }
              },
            },
          }}
        />
      </div>
    </>
  );
}
