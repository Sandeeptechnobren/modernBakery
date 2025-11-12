"use client";

import { useState, useCallback } from "react";
import { Icon } from "@iconify-icon/react";
import { useRouter } from "next/navigation";

import BorderIconButton from "@/app/components/borderIconButton";
import CustomDropdown from "@/app/components/customDropdown";
import Table, {
  TableDataType,
  listReturnType,
} from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { getExpenseTypeList } from "@/app/services/allApi";
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
  { key: "osa_code", label: "Expense Type Code",render: (row: TableDataType) => (
            <span className="font-semibold text-[#181D27] text-[14px]">
                {row.osa_code}
            </span>
        ), },
  { key: "name", label: "Expense Type Name" },
  // { key: "created_user", label: "Created User" },
  // { key: "updated_user", label: "Updated User" },
  // { key: "created_date", label: "Created Date" },

  //   { key: "expense_type_status", label: "Status" },
{
  key: "status",
  label: "Status",
  render: (row: TableDataType) => (
    <div className="flex items-center">
      {row.status ? (
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
}
];

export default function Expensetype() {
  interface expenseTypeItem {
    id?: number | string;
    osa_code?: string;
    name?: string;
    // created_user?: string;
    // updated_user?: string;
    created_date?: string;
    status?: string;
  }

  const { setLoading } = useLoading();
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const router = useRouter();
  type TableRow = TableDataType & { id?: string };

  // Move fetchCountries outside useEffect so it can be reused
  // const fetchCountries = async () => {
  //   try {
  //     const listRes = await getExpenseTypeList();
  //     setCountries(listRes.data);
  //   } catch (error: unknown) {
  //     console.error("API Error:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchExpenseType = useCallback(
    async (
      page: number = 1,
      pageSize: number = 50
    ): Promise<listReturnType> => {
      try {
        setLoading(true);
        const listRes = await getExpenseTypeList({
          per_page: pageSize.toString(),
          current_page: page.toString(),
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

  // useEffect(() => {
  //   fetchCountries();
  // }, []);

  return (
    <>
      <div className="h-[calc(100%-60px)]">
        <Table
          config={{
            api: { list: fetchExpenseType },
            header: {
              title: "Expense Type",
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
                  key={0}
                  href="/settings/manageCompany/expenseType/add"
                  isActive
                  leadingIcon="lucide:plus"
                  label="Add"
                  labelTw="hidden lg:block"
                />,
              ],
            },
            localStorageKey: "expenseTypeTable",
            footer: { nextPrevBtn: true, pagination: true },
            columns,
            rowSelection: true,
            rowActions: [
              {
                icon: "lucide:edit-2",
                onClick: (data: object) => {
                  const row = data as TableRow;
                router.push(
                    `/settings/manageCompany/expenseType/${row.uuid}`
                  );
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
