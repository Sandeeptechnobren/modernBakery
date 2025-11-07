"use client";

import { useState, useCallback } from "react";
import { Icon } from "@iconify-icon/react";
import { useRouter } from "next/navigation";
import BorderIconButton from "@/app/components/borderIconButton";
import CustomDropdown from "@/app/components/customDropdown";
import Table, { TableDataType, listReturnType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { getwarehouseStock } from "@/app/services/allApi";

interface WarehouseStock {
  id?: number;
  uuid?: string;
  osa_code?: string;
  warehouse?: string | null;
  item?: {
    id: number;
    code: string;
    name: string;
  };
  qty?: number;
  status?: number;
}

const dropdownDataList = [
  { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
  { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
];

const columns = [
  {
    key: "code",
    label: "Code",
    render: (row: TableDataType) => (
      <span className="font-semibold text-[#181D27] text-[14px]">{row.code}</span>
    ),
  },
  { key: "warehouse", label: "Warehouse" },
  { key: "item", label: "Item" },
  { key: "quantity", label: "Quantity" },
  {
    key: "status",
    label: "Status",
    render: (row: TableDataType) => (
      <div className="flex items-center">
        {Number(row.status) === 1 ? (
          <span className="text-sm text-[#027A48] bg-[#ECFDF3] font-[500] p-1 px-4 rounded-xl text-[12px]">
            Active
          </span>
        ) : (
          <span className="text-sm text-red-700 bg-red-200 p-1 px-4 rounded-xl text-[12px]">
            Inactive
          </span>
        )}
      </div>
    ),
  },
];

export default function WarehouseStockPage() {
  const { setLoading } = useLoading();
  const [showDropdown, setShowDropdown] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { showSnackbar } = useSnackbar();
  const router = useRouter();

  // ✅ Fetch and normalize data
  const fetchwarehouseStock = useCallback(
    async (page: number = 1, pageSize: number = 10): Promise<listReturnType> => {
      try {
        setLoading(true);
        const listRes = await getwarehouseStock({
          per_page: pageSize.toString(),
          page: page.toString(),
        });

        const records: WarehouseStock[] = listRes?.data || [];

        

        const pagination = listRes?.pagination || {};

        return {
          data: listRes?.data || [],
          total: pagination?.total || 1,
          currentPage: pagination?.current_page || 1,
          pageSize: pagination?.per_page || pageSize,
        };
      } catch (error: unknown) {
        console.error("API Error:", error);
        showSnackbar("Failed to load warehouse stock", "error");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, showSnackbar]
  );

  return (
    <>
      <div className="h-[calc(100%-60px)]">
        <Table
          refreshKey={refreshKey}
          config={{
            api: {
              list: fetchwarehouseStock,
            },
            header: {
              title: "Warehouse Stock",
              wholeTableActions: [
                <div key={0} className="flex gap-[12px] relative">
                  <BorderIconButton
                    icon="ic:sharp-more-vert"
                    onClick={() => setShowDropdown(!showDropdown)}
                  />
                  {showDropdown && (
                    <div className="w-[226px] absolute top-[40px] right-0 z-30">
                      <CustomDropdown>
                        {dropdownDataList.map((link, index: number) => (
                          <div
                            key={index}
                            className="px-[14px] py-[10px] flex items-center gap-[8px] hover:bg-[#FAFAFA]"
                          >
                            <Icon
                              icon={link.icon}
                              width={link.iconWidth}
                              className="text-[#717680]"
                            />
                            <span className="text-[#181D27] font-[500] text-[16px]">
                              {link.label}
                            </span>
                          </div>
                        ))}
                      </CustomDropdown>
                    </div>
                  )}
                </div>,
              ],
              searchBar: false,
              columnFilter: true,
              actions: [
                <SidebarBtn
                  key="add-warehouse-stock"
                  href="/settings/warehouseStock/add"
                  leadingIcon="lucide:plus"
                  label="Add"
                  labelTw="hidden sm:block"
                  isActive
                />,
              ],
            },
            localStorageKey: "warehouseStock",
            footer: { nextPrevBtn: true, pagination: true },
            columns,
            rowSelection: true,
            rowActions: [
              {
                icon: "lucide:edit-2",
                onClick: (row: object) => {
                  const r = row as TableDataType;
                  router.push(`/settings/warehouseStock/${r.uuid}`);
                },
              },
            ],
            pageSize: 10,
          }}
        />
      </div>
    </>
  );
}
