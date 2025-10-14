"use client";
import { useState, useEffect, useCallback } from "react";
import { Icon } from "@iconify-icon/react";
import { useRouter } from "next/navigation";
import BorderIconButton from "@/app/components/borderIconButton";
import CustomDropdown from "@/app/components/customDropdown";
import Table, {
  TableDataType,
  listReturnType,
} from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { userList } from "@/app/services/allApi";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext"; // ✅ import snackbar
import StatusBtn from "@/app/components/statusBtn2";
import { userTypeGlobalSearch } from "@/app/services/allApi";

interface DropdownItem {
  icon: string;
  label: string;
  iconWidth: number;
}
interface UserType {
  id?: number | string;
  code?: string;
  name?: string;
  status?: number;
}
const dropdownDataList: DropdownItem[] = [
  // { icon: "lucide:layout", label: "SAP", iconWidth: 20 },
  // { icon: "lucide:download", label: "Download QR Code", iconWidth: 20 },
  // { icon: "lucide:printer", label: "Print QR Code", iconWidth: 20 },
  { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
  { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
];

const columns = [
  { key: "code", label: "User Type Code" ,
    render: (row: TableDataType) => (
            <span className="font-semibold text-[#181D27] text-[14px]">
                {row.code}
            </span>
        ),
  },
  { key: "name", label: "User Name" },
  {
    key: "status",
    label: "Status",
    render: (row: TableDataType) => {
      const status = row.status;
      const isActive = String(status) === "1";
      return <StatusBtn isActive={isActive} />;
    },
  },
];

export default function UserType() {
  const { showSnackbar } = useSnackbar();
  const { setLoading } = useLoading();
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const router = useRouter();
  type TableRow = TableDataType & { id?: string };

  const fetchUserType = useCallback(
    async (
      page: number = 1,
      pageSize: number = 50
    ): Promise<listReturnType> => {
      try {
        setLoading(true);
        const listRes = await userList({
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

  const searchList = useCallback(
    async (search: string, pageSize: number = 5): Promise<listReturnType> => {
      setLoading(true);
      const listRes = await userTypeGlobalSearch({
        search,
        per_page: pageSize.toString(),
      });
      setLoading(false);
      if (listRes.error) {
        showSnackbar(listRes.data.message || "Failed to Search", "error");
        throw new Error("Failed to Search");
      } else {
        return {
          data: listRes.data || [],
          total: listRes.pagination.totalPages || 1,
          currentPage: listRes.pagination.page || 1,
          pageSize: listRes.pagination.limit || pageSize,
        };
      }
    },
    []
  );

  useEffect(() => {
    setLoading(true);
  }, []);

  return (
    <>
      <div className="h-[calc(100%-60px)]">
        <Table
          config={{
            api: {
              list: fetchUserType,
              search: searchList,
            },
            header: {
              title: "User Types",
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
              searchBar: true,
              columnFilter: true,
              actions: [
                <SidebarBtn
                  key={0}
                  href="/settings/user-types/add"
                  isActive
                  leadingIcon="lucide:plus"
                  label="Add"
                  labelTw="hidden sm:block"
                />,
              ],
            },
            localStorageKey: "user-type-table",
            footer: { nextPrevBtn: true, pagination: true },
            columns,
            rowSelection: true,
            rowActions: [
              {
                icon: "lucide:edit-2",
                onClick: (data: object) => {
                  const row = data as TableRow;
                  router.push(`/settings/user-types/${row.id}`);
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
