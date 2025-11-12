"use client";
import { useState, useCallback } from "react";
import { Icon } from "@iconify-icon/react";
import { useRouter } from "next/navigation";
import BorderIconButton from "@/app/components/borderIconButton";
import CustomDropdown from "@/app/components/customDropdown";
import Table, { TableDataType, listReturnType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { salesmanTypeList, deleteSalesmanType } from "@/app/services/allApi";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";

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
    key: "salesman_type_code", label: "Salesman Code", render: (row: TableDataType) => (
      <span className="font-semibold text-[#181D27] text-[14px]">
        {row.salesman_type_code}
      </span>
    ),
  },
  { key: "salesman_type_name", label: "Salesman Name" },
  // { key: "salesman_type_status", label: "Status" },
  {
    key: "salesman_type_status",
    label: "Status",
    render: (row: TableDataType) => (
      <div className="flex items-center">
        {Number(row.salesman_type_status) === 1 || row.salesman_type_status === "Active" ? (
          <span className="text-sm text-[#027A48] bg-[#ECFDF3] p-1 px-4 rounded-xl">Active</span>
        ) : (
          <span className="text-sm text-red-700 bg-red-200 p-1 px-4 rounded-xl">Inactive</span>
        )}
      </div>
    ),
  },
];

export default function SalesmanTypeList() {
  interface SalesmanTypeForm {
    id: string;
    salesman_type_code?: string;
    salesman_type_name?: string;
    salesman_type_status: string | number; // ✅ allow both
  }

  const { setLoading } = useLoading();
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  type TableRow = TableDataType & { id?: string };


  // const fetchCountries = async () => {
  //   try {
  //     setLoading(true);
  //     const listRes = await salesmanTypeList({});
  //     setCountries(listRes.data);
  //     console.log("Fetched salesman type:", listRes.data);
  //   } catch (error: unknown) {
  //     console.error("API Error:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchSalesmanType = useCallback(
    async (
      page: number = 1,
      pageSize: number = 1
    ): Promise<listReturnType> => {
      try {
        setLoading(true);
        const listRes = await salesmanTypeList({
          per_page: pageSize.toString(),
          current_page: page.toString(),
        });
        setLoading(false);
        return {
          data: listRes.data || [],
          total: listRes.pagination.pagination.totalPages,
          currentPage: listRes.pagination.pagination.page,
          pageSize: listRes.pagination.pagination.limit,
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
            api: {
              list: fetchSalesmanType,
            },
            header: {
              title: "Salesman Type",
              wholeTableActions: [
                <div key={0} className="flex gap-[12px] relative">
                  <BorderIconButton
                    icon="ic:sharp-more-vert"
                    onClick={() =>
                      setShowDropdown(!showDropdown)
                    }
                  />

                  {showDropdown && (
                    <div className="w-[226px] absolute top-[40px] right-0 z-30">
                      <CustomDropdown>
                        {dropdownDataList.map(
                          (
                            link,
                            index: number
                          ) => (
                            <div
                              key={index}
                              className="px-[14px] py-[10px] flex items-center gap-[8px] hover:bg-[#FAFAFA]"
                            >
                              <Icon
                                icon={
                                  link.icon
                                }
                                width={
                                  link.iconWidth
                                }
                                className="text-[#717680]"
                              />
                              <span className="text-[#181D27] font-[500] text-[16px]">
                                {link.label}
                              </span>
                            </div>
                          )
                        )}
                      </CustomDropdown>
                    </div>
                  )}
                </div>
              ],
              searchBar: false,
              columnFilter: true,
              actions: [
                <SidebarBtn
                  key={0}
                  href="/settings/manageCompany/salesman-type/add"
                  isActive
                  leadingIcon="lucide:plus"
                  label="Add"
                  labelTw="hidden lg:block"
                />,
              ],
            },
            localStorageKey: "salesmanType",
            footer: { nextPrevBtn: true, pagination: true },
            columns,
            rowSelection: true,
            rowActions: [
              {
                icon: "lucide:edit-2",
                onClick: (data: object) => {
                  const row = data as TableRow;
                  router.push(
                    `/settings/manageCompany/salesman-type/${row.id}`
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
