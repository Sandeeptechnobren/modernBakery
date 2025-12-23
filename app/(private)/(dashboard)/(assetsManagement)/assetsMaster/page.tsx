"use client";

import { useCallback, useEffect, useState } from "react";
import { Icon } from "@iconify-icon/react";
import { useRouter } from "next/navigation";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";
import CustomDropdown from "@/app/components/customDropdown";
import BorderIconButton from "@/app/components/borderIconButton";
import Table, { listReturnType, TableDataType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useLoading } from "@/app/services/loadingContext";
import { chillerList, deleteChiller, deleteServiceTypes, serviceTypesList } from "@/app/services/assetsApi";
import StatusBtn from "@/app/components/statusBtn2";
import { usePagePermissions } from "@/app/(private)/utils/usePagePermissions";

const dropdownDataList = [
  { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
  { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
];

export default function ShelfDisplay() {
  const { can, permissions } = usePagePermissions();
  const { setLoading } = useLoading();
  const [showDropdown, setShowDropdown] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Refresh table when permissions load
  useEffect(() => {
    if (permissions.length > 0) {
      setRefreshKey((prev) => prev + 1);
    }
  }, [permissions]);

  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  const fetchServiceTypes = useCallback(
    async (pageNo: number = 1, pageSize: number = 10): Promise<listReturnType> => {
      setLoading(true);
      const res = await chillerList({
        page: pageNo.toString(),
        per_page: pageSize.toString(),
      });
      setLoading(false);
      if (res.error) {
        showSnackbar(res.data.message || "failed to fetch the Chillers", "error");
        throw new Error("Unable to fetch the Chillers");
      } else {
        return {
          data: res.data || [],
          currentPage: res?.pagination?.page || 0,
          pageSize: res?.pagination?.limit || 10,
          total: res?.pagination?.totalPages || 0,
        };
      }
    }, []
  )
  const searchChiller = useCallback(
    async (query: string, pageSize: number = 10, columnName?: string): Promise<listReturnType> => {
      setLoading(true);
      let res;
      if (columnName && columnName !== "") {
        res = await chillerList({
          query: query,
          per_page: pageSize.toString(),
          [columnName]: query
        });
      }
      setLoading(false);
      if (res.error) {
        showSnackbar(res.data.message || "failed to search the Chillers", "error");
        throw new Error("Unable to search the Chillers");
      } else {
        return {
          data: res.data || [],
          currentPage: res?.pagination?.page || 0,
          pageSize: res?.pagination?.limit || 10,
          total: res?.pagination?.totalPages || 0,
        };
      }
    }, []
  )

  useEffect(() => {
    setLoading(true);
  }, [])

  return (
    <>
      {/* Table */}
      <div className="flex flex-col h-full">
        <Table
          refreshKey={refreshKey}
          config={{
            api: {
              list: fetchServiceTypes,
              search: searchChiller
            },
            header: {
              title: "Assets Master",

              searchBar: false,
              columnFilter: true,
              actions: can("create") ? [
                <SidebarBtn
                  key="name"
                  href="/assetsMaster/add"
                  leadingIcon="lucide:plus"
                  label="Add"
                  labelTw="hidden lg:block"
                  isActive
                />,
              ] : [],
            },
            localStorageKey: "assetsMasterTable",
            table: {
              height: 400
            },
            footer: { nextPrevBtn: true, pagination: true },
            columns: [
              {
                key: "osa_code", label: "OSA Code",
                render: (row: TableDataType) => (
                  <span className="font-semibold text-[#181D27] text-[14px]">
                    {row.osa_code}
                  </span>
                ),
              },
              {
                key: "sap_code", label: "SAP Code",
                render: (row: TableDataType) => (
                  <span className="font-semibold text-[#181D27] text-[14px]">
                    {row.sap_code}
                  </span>
                ),
              },
              { key: "serial_number", label: "Serial Number" },
              {
                key: "assets_category", label: "Assests Category Name", render: (data: TableDataType) =>
                  typeof data.assets_category === "object" && data.assets_category !== null
                    ? `${(data.assets_category as { name?: string }).name || ""}`
                    : "-",
              },
              {
                key: "model_number", label: "Model Number", render: (data: TableDataType) =>
                  typeof data.model_number === "object" && data.model_number !== null
                    ? `${(data.model_number as { name?: string }).name || ""}`
                    : "-",
              },
              { key: "acquisition", label: "Acquisition" },
              {
                key: "vendor", label: "Vendor", render: (data: TableDataType) =>
                  typeof data.vendor === "object" && data.vendor !== null
                    ? `${(data.vendor as { name?: string }).name || ""}`
                    : "-",
              },
              {
                key: "manufacturer", label: "Manufacturer", render: (data: TableDataType) =>
                  typeof data.manufacturer === "object" && data.manufacturer !== null
                    ? `${(data.manufacturer as { name?: string }).name || ""}`
                    : "-",
              },
              {
                key: "country", label: "Country", render: (data: TableDataType) =>
                  typeof data.country === "object" && data.country !== null
                    ? `${(data.country as { name?: string }).name || ""}`
                    : "-",
              },
              {
                key: "branding", label: "Branding", render: (data: TableDataType) =>
                  typeof data.branding === "object" && data.branding !== null
                    ? `${(data.branding as { name?: string }).name || ""}`
                    : "-",
              },
              { key: "assets_type", label: "Assets Type" },
              { key: "trading_partner_number", label: "Trading Partner No." },
              { key: "capacity", label: "Capacity" },
              { key: "manufacturing_year", label: "Manufacturing Year" },
              { key: "remarks", label: "Remarks" },
              {
                key: "status", label: "Status", render: (data: TableDataType) =>
                  typeof data.status === "object" && data.status !== null
                    ? `${(data.status as { name?: string }).name || ""}`
                    : "-",
              },
            ],
            rowSelection: true,
            rowActions: [
              {
                icon: "lucide:eye",
                onClick: (data: TableDataType) => {
                  router.push(`/assetsMaster/view/${data.uuid}`);
                },
              },
              ...(can("edit") ? [{
                icon: "lucide:edit-2",
                onClick: (data: TableDataType) => {
                  router.push(`/assetsMaster/${data.uuid}`);
                },
              }] : []),
            ],
            pageSize: 10,
          }}
        />
      </div>
    </>
  );
}