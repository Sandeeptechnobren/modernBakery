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
  BrandList,
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
    key: "osa_code",
    label: "Brand Code",
    render: (row: TableDataType) => (
      <span className="font-semibold text-[#181D27] text-[14px]">
        {row.osa_code}
      </span>
    ),
  },
  { key: "name", label: "Brand Name" },
  // { key: "currency", label: "Currency" },

];

export default function Country() {
  interface CountryItem {
    id?: number | string;
    osa_code?: string;
    name?: string;
    // currency?: string;
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
        const listRes = await BrandList({
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
              title: "Brand",
              wholeTableActions: [
                <div key={0} className="flex gap-[12px] relative">
                  <DismissibleDropdown
                    isOpen={showDropdown}
                    setIsOpen={setShowDropdown}
                    button={<BorderIconButton icon="ic:sharp-more-vert" />}
                    dropdown={
                      <div className="absolute top-[40px] right-0 z-30 w-[226px]">
                        <CustomDropdown>
                          {dropdownDataList.map((link, idx) => (
                            <div
                              key={idx}
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
                    }
                  />
                </div>,
              ],
              // disable global search bar (use column filters only)
              searchBar: false,
              columnFilter: true,
              actions: [
                <SidebarBtn
                  key={0}
                  href="/settings/brand/add"
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
                  router.push(`/settings/brand/${row.uuid}`);
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
