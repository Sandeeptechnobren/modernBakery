
"use client";

import { useState, useEffect ,useCallback} from "react";
import { Icon } from "@iconify-icon/react";
import { useRouter, useSearchParams } from "next/navigation";

import BorderIconButton from "@/app/components/borderIconButton";
import CustomDropdown from "@/app/components/customDropdown";
import Table, { TableDataType,listReturnType ,searchReturnType} from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { routeTypeList, deleteRouteTypeById ,routeGlobalSearch} from "@/app/services/allApi";
import { useLoading } from "@/app/services/loadingContext";
import DeleteConfirmPopup from "@/app/components/deletePopUp";
import { useSnackbar } from "@/app/services/snackbarContext";
import StatusBtn from "@/app/components/statusBtn2";

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
  { key: "route_type_code", label: "Route Type Code" ,
    render: (row: TableDataType) => (
            <span className="font-semibold text-[#181D27] text-[14px]">
                {row.route_type_code}
            </span>
        ),
  },
  { key: "route_type_name", label: "Route Type Name" },
  {
    key: "status",
    label: "Status",
    render: (data: TableDataType) => (
      <StatusBtn isActive={data.status ? true : false} />
    ),
  },
];

export default function RouteType() {
  const { setLoading} = useLoading();
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const router = useRouter();

  type TableRow = TableDataType & { id?: string }

    const fetchRouteTypes = useCallback(
      async (
        page: number = 1,
        pageSize: number = 50
      ): Promise<listReturnType> => {
        try {
          setLoading(true);
          const listRes = await routeTypeList({
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
  
    const searchRouteType = useCallback(
      async (
        searchQuery: string,
        pageSize: number
      ): Promise<searchReturnType> => {
        setLoading(true);
        const result = await routeGlobalSearch({
          query: searchQuery,
          per_page: pageSize.toString(),
        });
        setLoading(false);
        if (result.error) throw new Error(result.data.message);
        else {
          return {
            data: result.data || [],
            total: result.pagination.totalPages,
            currentPage: result.pagination.page ,
            pageSize: result.pagination.limit ,
          };
        }
      },
      []
    );

  return (
    <>
      

      {/* Table */}
      <div className="h-[calc(100%-60px)]">
        <Table
         
          config={{
            api:{  list:fetchRouteTypes, search:searchRouteType },
            header: {
              
              title: "Route Type",
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
              searchBar: true,
              columnFilter: true,
              actions: [
                <SidebarBtn
                  key={0}
                  href="/settings/routetype/add"
                  isActive
                  leadingIcon="lucide:plus"
                  label="Add"
                  labelTw="hidden xl:block"
                />,
              ],
            },
            localStorageKey: "routeTypeTable",
            footer: { nextPrevBtn: true, pagination: true },
            columns,
            rowSelection: true,
            rowActions: [
              {
                icon: "lucide:edit-2",
                onClick: (data: object) => {
                  const row = data as TableRow;
                  router.push(`/settings/routetype/${row.id}`);
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
