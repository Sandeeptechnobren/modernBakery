"use client";

import { useRouter } from "next/navigation";
import Table, { TableDataType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { useSnackbar } from "@/app/services/snackbarContext";
import { manufacturerList } from "@/app/services/allApi";
import StatusBtn from "@/app/components/statusBtn2";

interface AssetsCategoryAPI {
  id: number;
  osa_code: string;
  asset_type: string;
  name: string;
  status: number;
}

interface Manufacturer {
  id: number;
  name: string;
  osa_code: string;
  status: number;
  asset_type: string;
}

export default function Page() {
  const pageSize = 10;

  const { showSnackbar } = useSnackbar();
  const router = useRouter();

  const columns = [
    {
      key: "osa_code",
      label: "Code",
      render: (row: TableDataType) => (
        <span className="font-semibold text-[#181D27] text-[14px]">
          {row.osa_code}
        </span>
      ),
    },
    { key: "name", label: "Manufacturer Name" },
    { key: "asset_type", label: "Asset Category",
      render: (data: TableDataType) =>
                typeof data.asset_type === "object" && data.asset_type !== null
                    ? `${(data.asset_type as { name?: string }).name || ""}`
                    : "-", },
    {
      key: "status",
      label: "Status",
      render: (row: TableDataType) => (
        <StatusBtn isActive={row.status === "Active"} />
      ),
    },
  ];

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-[20px]">
        <h1 className="text-[20px] font-semibold text-[#181D27]">
          Manufacturer List
        </h1>
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
                  href="./manufacturer/add"
                  isActive
                  leadingIcon="lucide:plus"
                  label="Add"
                  labelTw="hidden sm:block"
                />,
              ],
            },
            pageSize: pageSize,
            localStorageKey: "manufacturer-list-table", // renamed for clarity
            footer: { nextPrevBtn: true, pagination: true },
            columns,
            rowSelection: true,
            api: {
              list: async (pageNo: number, pageSize: number) => {
                try {
                  const res = await manufacturerList({
                    page: String(pageNo),
                    limit: String(pageSize),
                  });

                  // map API response -> table-friendly rows
                  const formatted: Manufacturer[] = (res.data || []).map(
                    (s: AssetsCategoryAPI) => ({
                      id: s.id,
                      asset_type: s.asset_type,
                      osa_code: s.osa_code,
                      name: s.name,
                      status: s.status,
                    })
                  );

                  const tableData: TableDataType[] = formatted.map((c) => ({
                    id: String(c.id),
                    asset_type: c.asset_type,
                    osa_code: c.osa_code,
                    name: c.name,
                    status: c.status === 1 ? "Active" : "Inactive",
                  }));

                  return {
                    data: tableData,
                    currentPage: res.pagination?.page || pageNo,
                    pageSize: pageSize,
                    total: res.pagination?.totalPages ?? 1,
                    totalRecords: res.pagination?.totalRecords ?? tableData.length,
                  };
                } catch (error) {
                  console.error("Failed to fetch manufacturers ❌", error);
                  showSnackbar("Failed to load manufacturers ❌", "error");
                  return {
                    data: [],
                    currentPage: 1,
                    pageSize: pageSize,
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
