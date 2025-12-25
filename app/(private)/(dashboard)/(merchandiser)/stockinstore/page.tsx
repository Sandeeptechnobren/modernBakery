"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify-icon/react";
import Table, {
  TableDataType,
  listReturnType,
  searchReturnType,
} from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import BorderIconButton from "@/app/components/borderIconButton";
import CustomDropdown from "@/app/components/customDropdown";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";
import StatusBtn from "@/app/components/statusBtn2";
import { stockInStoreList } from "@/app/services/merchandiserApi";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useLoading } from "@/app/services/loadingContext";
import { exportPlanogram } from "@/app/services/merchandiserApi";
import { formatDate } from "../../(master)/salesTeam/details/[uuid]/page";
interface PlanogramItem {
  id: number | string;
  uuid: string;
  code: string;
  activity_name: string;
  date_range: {
    from: string;
    to: string;
  };
}

interface DropdownItem {
  icon: string;
  label: string;
  iconWidth: number;
}

const dropdownDataList: DropdownItem[] = [
  { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
  { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
];

export default function StockInStore() {
  const router = useRouter();
  const { setLoading } = useLoading();
  const { showSnackbar } = useSnackbar();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  type TableRow = TableDataType & { id?: string };

  const fetchPlanogram = useCallback(
    async (
      page: number = 1,
      pageSize: number = 50
    ): Promise<listReturnType> => {
      setLoading(true);

      try {
        const res = await stockInStoreList({
          page: page.toString(),
          limit: pageSize.toString(),
        });
        setLoading(false);
        if (res.error)
          throw new Error(res.message || "Failed to fetch stock in store");

        // Normalize status
        const data: TableDataType[] = res.data.map((item: PlanogramItem) => ({
          id: item.id.toString(),
          uuid: item.uuid,
          code: item.code,
          activity_name: item.activity_name,
          from: item.date_range.from,
          to: item.date_range.to,
        }));

        return {
          data,
          total: res.pagination?.last_page || 0,
          currentPage: res.pagination?.current_page || 1,
          pageSize: res.pagination?.per_page || pageSize,
        };
      } catch (err) {
        setLoading(false);
        showSnackbar((err as Error).message, "error");
        return { data: [], total: 0, currentPage: 1, pageSize };
      }
    },
    [setLoading, showSnackbar]
  );

  // Global search
  const searchPlanogram = useCallback(
    async (searchQuery: string): Promise<searchReturnType> => {
      setLoading(true);
      try {
        console.log(searchQuery);
        // always start from page 1 for a new search
        const res = await stockInStoreList({
          search: searchQuery,
        });

        setLoading(false);
        if (res.error) throw new Error(res.message || "Search failed");

        const data: TableDataType[] = res.data.map((item: PlanogramItem) => ({
          id: item.id.toString(),
          code: item.code,
          activity_name: item.activity_name,
          from: item.date_range.from,
          to: item.date_range.to,
        }));
        return {
          data,
          total: res.pagination?.total || data.length,
          currentPage: res.pagination?.current_page || 1,
          pageSize: res.pagination?.per_page,
        };
      } catch (err) {
        setLoading(false);
        showSnackbar((err as Error).message, "error");
        return { data: [], total: 0, currentPage: 1, pageSize: 10 };
      }
    },
    [setLoading, showSnackbar]
  );

  // Table columns
  const columns = [
    { key: "code", label: "Code" },
    { key: "activity_name", label: "Name" },
    {
      key: "from",
      label: "From",
      render: (row: any) => formatDate(row.from),
    },
    {
      key: "to",
      label: "To",
      render: (row: any) => formatDate(row.to),
    },
  ];

  const handleExport = async (fileType: "csv" | "xlsx") => {
    try {
      setLoading(true);

      const res = await exportPlanogram({ format: fileType });
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

      // ⬇️ Trigger browser download
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `stock-in-store_export.${fileType}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showSnackbar(
        `Download started for ${fileType.toUpperCase()} file`,
        "success"
      );
    } catch (error) {
      console.error("Export error:", error);
      showSnackbar("Failed to export Planogram data", "error");
    } finally {
      setLoading(false);
      setShowExportDropdown(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Table
        refreshKey={refreshKey}
        config={{
          api: {
            list: fetchPlanogram,
            search: searchPlanogram,
          },
          header: {
            title: "Stock In Store",

            threeDot: [
              {
                icon: "gala:file-document",
                label: "Export CSV",
                onClick: (data: TableDataType[], selectedRow?: number[]) => {
                  handleExport("csv");
                },
              },
              {
                icon: "gala:file-document",
                label: "Export Excel",
                onClick: (data: TableDataType[], selectedRow?: number[]) => {
                  handleExport("xlsx");
                },
              },
            ],

            searchBar: true,
            columnFilter: true,
            actions: [
              <SidebarBtn
                key="add-stock-in-store"
                href="/stockinstore/add"
                leadingIcon="lucide:plus"
                label="Add"
                labelTw="hidden sm:block"
                isActive
              />,
            ],
          },
          footer: { nextPrevBtn: true, pagination: true },
          columns,
          rowSelection: true,
          rowActions: [
            {
              icon: "lucide:eye",
              onClick: (data: TableDataType) =>
                router.push(`/stockinstore/view/${data.uuid}`),
            },
            {
              icon: "lucide:edit-2",
              onClick: (data: TableDataType) =>
                router.push(`/stockinstore/${data.uuid}`),
            },
            // {
            //   icon: "lucide:trash-2",
            //   onClick: (data: TableDataType) => {
            //     setDeleteSelectedRow(
            //       data?.uuid ? String(data.uuid) : data.uuid
            //     );
            //     setShowDeletePopup(true);
            //   },
            // },
          ],
          pageSize: 50,
        }}
      />
    </div>
  );
}
