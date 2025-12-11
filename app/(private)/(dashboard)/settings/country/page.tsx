"use client";

import { useState, useEffect, useCallback } from "react";
import { Icon } from "@iconify-icon/react";
import { useRouter } from "next/navigation";
import StatusBtn from "@/app/components/statusBtn2";
import BorderIconButton from "@/app/components/borderIconButton";
import CustomDropdown from "@/app/components/customDropdown";
import Table, {
  listReturnType,
  TableDataType,
} from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import {
  countryList,
  deleteCountry,
} from "@/app/services/allApi";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";
import DeleteConfirmPopup from "@/app/components/deletePopUp";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useLoading } from "@/app/services/loadingContext";

interface DropdownItem {
  icon: string;
  label: string;
  iconWidth: number;
}

const dropdownDataList: DropdownItem[] = [
  // { icon: "lucide:layout", label: "SAP", iconWidth: 20 },
  // { icon: "lucide:download", label: "Download QR Code", iconWidth: 20 },
  // { icon: "lucide:printer", label: "Print QR Code", iconWidth: 20 },
  { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
  { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
];

const columns = [
  {
    key: "country_code",
    label: "Country Code",
    showByDefault: true,
    render: (row: TableDataType) => (
      <span className="font-semibold text-[#181D27] text-[14px]">
        {row.country_code}
      </span>
    ),
  },
  { key: "country_name", label: "Country Name", showByDefault: true },
  { key: "currency", label: "Currency", showByDefault: true },
  {
    key: "status",
    label: "Status",
    render: (row: TableDataType) => (
      <StatusBtn isActive={row.status ? true : false} />
    ),
  },
];

export default function Country() {
  interface CountryItem {
    id?: number | string;
    country_code?: string;
    country_name?: string;
    currency?: string;
  }

  const { setLoading } = useLoading();
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedRow, setSelectedRow] = useState<CountryItem | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  type TableRow = TableDataType & { id?: string };

  const fetchCountries = useCallback(
    async (
      page: number = 1,
      pageSize: number = 50
    ): Promise<listReturnType> => {
      try {
        setLoading(true);
        const listRes = await countryList({
          limit: pageSize.toString(),
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

  // global search removed: use column filters and list API only

  useEffect(() => {
    setLoading(true);
  }, []);

  return (
    <>
      <div className="h-[calc(100%-60px)] pb-[22px]">
        <Table
          refreshKey={refreshKey}
          config={{
            api: {
              list: fetchCountries,
            },
            header: {
              title: "Country",
              searchBar: false,
              columnFilter: true,
              actions: [
                <SidebarBtn
                  key={0}
                  href="/settings/country/add"
                  isActive
                  leadingIcon="lucide:plus"
                  label="Add"
                  labelTw="hidden sm:block"
                />,
              ],
            },
            localStorageKey: "country",
            footer: { nextPrevBtn: true, pagination: true },
            columns,
            rowSelection: true,
            rowActions: [
              {
                icon: "lucide:edit-2",
                onClick: (data: object) => {
                  const row = data as TableRow;
                  router.push(`/settings/country/${row.id}`);
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
