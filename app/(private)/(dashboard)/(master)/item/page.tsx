"use client";

import toInternationalNumber from "@/app/(private)/utils/formatNumber";
import BorderIconButton from "@/app/components/borderIconButton";
import CustomDropdown from "@/app/components/customDropdown";
import Table, { listReturnType, TableDataType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";
import StatusBtn from "@/app/components/statusBtn2";
import { updateItemStatus, itemList, itemGlobalSearch, downloadFile, itemExport } from "@/app/services/allApi";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import Drawer from "@mui/material/Drawer";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import ItemPage from "./itemPopup";
import { usePagePermissions } from "@/app/(private)/utils/usePagePermissions";

interface DropdownItem {
  icon: string;
  label: string;
  iconWidth: number;
  onClick?: () => void;
  status?: string;
}

interface LocalTableDataType {
  id?: number | string;
  uuid?: string;
  erp_code?: string;
  code?: string;
  name?: string;
  item_category?: { category_name?: string };
  item_uoms?: Array<{ name?: string; uom_type?: string; uom_price?: string }>;
  status?: number | string;
}




export default function Item() {
  const { setLoading } = useLoading();
  const { can, permissions } = usePagePermissions();
  const [refreshKey, setRefreshKey] = useState(0);

  // Refresh table when permissions load
  useEffect(() => {
    if (permissions.length > 0) {
      setRefreshKey((prev) => prev + 1);
    }
  }, [permissions]);

  // const [showDropdown, setShowDropdown] = useState(false);
  // const [showDeletePopup, setShowDeletePopup] = useState(false);
  // const [selectedRow, setSelectedRow] = useState<LocalTableDataType | null>(null);
  const [selectedId, setSelectedId] = useState<string>('');
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const [threeDotLoading, setThreeDotLoading] = useState({
    csv: false,
    xlsx: false,
  });

  const columns = [
    // { key: "erp_code", label: "ERP Code", render: (row: LocalTableDataType) => row.erp_code || "-" },
    {
      key: "name", 
      label: "Name", 
      showByDefault: true,
      render: (row: LocalTableDataType) => {
        return <div className="cursor-pointer hover:text-[#EA0A2A]" onClick={() => {
          // console.log("clicked", row.uuid)
          setSelectedId(row?.uuid || "")
          setOpen(true);
        }}>{row.erp_code + " - " + row.name || "-"}</div>
      }
    },
    {
      key: "item_category",
      label: "Category",
      showByDefault: true,
      render: (row: LocalTableDataType) => row.item_category?.category_name || "-",
    },
    {
      key: "base_uom",
      label: "Base UOM",
      showByDefault: true,
      render: (row: LocalTableDataType) => {
        if (!row.item_uoms || row.item_uoms.length === 0) return "-";
        return row.item_uoms[0]?.name ?? "-";
      },
    },
    {
      key: "base_uom_price",
      label: "Base UOM Price",
      showByDefault: true,
      render: (row: LocalTableDataType) => {
        if (!row.item_uoms || row.item_uoms.length === 0) return "-";
        return toInternationalNumber(row.item_uoms[0]?.uom_price) ?? "-";
      },
    },
    {
      key: "secondary_uom",
      label: "Secondary UOM",
      showByDefault: true,
      render: (row: LocalTableDataType) => {
        if (!row.item_uoms || row.item_uoms.length < 2) return "-";
        return row.item_uoms[1]?.name ?? "-";
      },
    },
    {
      key: "secondary_uom_price",
      label: "Secondary UOM Price",
      showByDefault: true,
      render: (row: LocalTableDataType) => {
        if (!row.item_uoms || row.item_uoms.length < 2) return "-";
        return toInternationalNumber(row.item_uoms[1]?.uom_price) ?? "-";
      },
    },
    {
      key: "status",
      label: "Status",
      // isSortable: true,
      showByDefault: true,
      render: (row: LocalTableDataType) => {
        const isActive =
          String(row.status) === "1" ||
          (typeof row.status === "string" &&
            row.status.toLowerCase() === "active");
        return <StatusBtn isActive={isActive} />;
      },
    },
  ];

  const fetchItems = useCallback(
    async (
      page: number = 1,
      pageSize: number = 50
    ): Promise<listReturnType> => {
      try {
        // setLoading(true);
        const res = await itemList({ page: page.toString(), per_page: pageSize.toString() });
        // setLoading(false);
        const data = res.data.map((item: LocalTableDataType) => ({
          ...item,
        }));
        return {
          data,
          total: res.pagination.totalPages,
          currentPage: res.pagination.page,
          pageSize: res.pagination.limit,
        };
      } catch (error) {
        setLoading(false);
        console.error(error);
        throw error;
      }
    },
    []
  );

  const searchItems = useCallback(
    async (
      query: string,
      pageSize: number = 50,
      columnName?: string,
      page: number = 1,
    ): Promise<listReturnType> => {
      try {
        // setLoading(true);
        const res = await itemGlobalSearch({ query: query, page: page.toString(), per_page: pageSize.toString() });
        // setLoading(false);
        const data = res.data.map((item: LocalTableDataType) => ({
          ...item,
        }));

        return {
          data: data || [],
          total: res.pagination.last_page || 1,
          currentPage: res.pagination.current_page || page,
          pageSize: res.pagination.per_page || pageSize,
        };
      } catch (error) {
        setLoading(false);
        console.error(error);
        throw error;
      }
    },
    []
  );

  const handleStatusChange = async (
    data: TableDataType[],
    selectedRow: number[] | undefined,
    status: "0" | "1"
  ) => {
    if (!selectedRow || selectedRow.length === 0) {
      showSnackbar("Please select at least one salesman", "error");
      return;
    }

    // const selectedItem = data.filter((_, index) =>
    //   selectedRow.includes(index)
    // );
    // console.log(data, selectedRow)

    const failedUpdates: string[] = [];

    const selectedRowsData: string[] = data.filter((value, index) => selectedRow?.includes(index)).map((item) => item.id);
    try {
      // setLoading(true);

      const res = await updateItemStatus({ item_ids: selectedRowsData, status });

      if (failedUpdates.length > 0) {
        showSnackbar(
          `Failed to update status for: ${failedUpdates.join(", ")}`,
          "error"
        );
      } else {
        setRefreshKey((k) => k + 1);
        showSnackbar("Status updated successfully", "success");
        // fetchItems();
      }

    } catch (error) {
      console.error("Status update error:", error);
      showSnackbar("An error occurred while updating status", "error");
    } finally {
      // setLoading(false);
      // setShowDropdown(false);
    }
  };

  const exportFile = async (format: string) => {
    try {
      setThreeDotLoading((prev) => ({ ...prev, [format]: true }));
      const response = await itemExport({ format });
      if (response && typeof response === 'object' && response.download_url) {
        await downloadFile(response.download_url);
        showSnackbar("File downloaded successfully ", "success");
      } else {
        showSnackbar("Failed to get download URL", "error");
      }
      setThreeDotLoading((prev) => ({ ...prev, [format]: false }));
    } catch (error) {
      setThreeDotLoading((prev) => ({ ...prev, [format]: false }));
      showSnackbar("Failed to download Item data", "error");
    }
  }

  // useEffect(() => {
  //   setLoading(true);
  // }, []);

  return (
    <>
      <div className="flex flex-col h-full">
        <Table
          refreshKey={refreshKey}
          config={{
            api: { list: fetchItems, search: searchItems },
            header: {
              title: "Item",
              searchBar: true,
              threeDot: [
                {
                  icon: threeDotLoading.csv ? "eos-icons:three-dots-loading" : "gala:file-document",
                  label: "Export CSV",
                  labelTw: "text-[12px] hidden sm:block",
                  onClick: () => !threeDotLoading.csv && exportFile("csv"),
                },
                {
                  icon: threeDotLoading.xlsx ? "eos-icons:three-dots-loading" : "gala:file-document",
                  label: "Export Excel",
                  labelTw: "text-[12px] hidden sm:block",
                  onClick: () => !threeDotLoading.xlsx && exportFile("xlsx"),
                },
                {
                  icon: "lucide:radio",
                  label: "Inactive",
                  showOnSelect: true,
                  onClick: (data: TableDataType[], selectedRow?: number[]) => {
                    handleStatusChange(data, selectedRow, "0");
                  },
                }
              ],
              columnFilter: true,
              actions: can("create") ? [
                <SidebarBtn
                  key={0}
                  href="/item/add"
                  isActive
                  leadingIcon="lucide:plus"
                  label="Add"
                  labelTw="hidden sm:block"
                />,
              ] : [],
            },
            localStorageKey: "item-table",
            table: {
              height: 500,
            },
            footer: { nextPrevBtn: true, pagination: true },
            columns,
            rowSelection: true,
            rowActions: [
              {
                icon: "lucide:eye",
                onClick: (row: LocalTableDataType) =>
                  router.push(`/item/details/${row.uuid}`),
              },
              ...(can("edit") ? [{
                icon: "lucide:edit-2",
                onClick: (row: LocalTableDataType) =>
                  router.push(`/item/${row.uuid}`),
              }] : []),
            ],
            pageSize: 50,
          }}
        />
      </div>
      <Drawer anchor="right" open={open} onClose={() => { setOpen(false) }} >
        <ItemPage id={selectedId} />
      </Drawer>

    </>
  );
}
