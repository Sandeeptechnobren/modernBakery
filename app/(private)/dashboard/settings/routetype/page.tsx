
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
  { key: "route_type_code", label: "Route Type Code" },
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
 interface RouteTypeItem {
  id?: number | string;
  route_type_code?: string;
  route_type_name?: string;
  status?: number | "Active" | "Inactive";
}

  const [routeType, setRouteType] = useState<RouteTypeItem[]>([]);
  const { setLoading} = useLoading();
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedRow, setSelectedRow] = useState<RouteTypeItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const updated = searchParams.get("updated"); // detect if redirected after update
  const { showSnackbar } = useSnackbar();

  type TableRow = TableDataType & { id?: string };

  // ✅ Table data mapping
const tableData: TableDataType[] = routeType.map((s) => ({
  id: s.id?.toString() ?? "",
  route_type_code: s.route_type_code ?? "",
  route_type_name: s.route_type_name ?? "",
  status: s.status === 1 || s.status === "Active" ? "Active" : "Inactive",
}));

  // ✅ Reusable fetch function
  // const fetchRouteTypes = async () => {
  //   const listRes = await routeTypeList({});
  //   if (listRes.error) showSnackbar(listRes.data.message || "Failed to fetch Route Type", "error");
  //   else setRouteType(listRes.data);
  //   setLoading(false);
  // };

    const fetchRouteTypes = useCallback(
      async (
        page: number = 1,
        pageSize: number = 5
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
  

  // ✅ Delete handler with refresh
  const handleConfirmDelete = async () => {
    if (!selectedRow?.id) return;

    const res = await deleteRouteTypeById(String(selectedRow.id));
    if (res.error) showSnackbar(res.data.message || "Failed to delete Route Type ❌", "error");
    else {
      showSnackbar("Route Type deleted successfully ✅", "success");
      fetchRouteTypes();
    }
    setShowDeletePopup(false);
    setSelectedRow(null);
    setDeletingId(null);
  };

    // const searchRouteType = useCallback(
    //   async (
    //     searchQuery: string,
    //     pageSize: number
    //   ): Promise<searchReturnType> => {
    //     setLoading(true);
    //     const result = await routeGlobalSearch({
    //       query: searchQuery,
    //       per_page: pageSize.toString(),
    //     });
    //     setLoading(false);
    //     if (result.error) throw new Error(result.data.message);
    //     else {
    //       return {
    //         data: result.data || [],
    //         total: result.pagination.totalPages,
    //         currentPage: result.pagination.page ,
    //         pageSize: result.pagination.limit ,
    //       };
    //     }
    //   },
    //   []
    // );

  return (
    <>
      

      {/* Table */}
      <div className="h-[calc(100%-60px)]">
        <Table
         
          config={{
            api:{  list:fetchRouteTypes },
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
                  href="/dashboard/settings/routetype/add"
                  isActive
                  leadingIcon="lucide:plus"
                  label="Add Route Type"
                  labelTw="hidden xl:block"
                />,
              ],
            },
            footer: { nextPrevBtn: true, pagination: true },
            columns,
            rowSelection: true,
            rowActions: [
              {
                icon: "lucide:eye",
                onClick: (data: TableDataType) => {
                  router.push(
                    `/dashboard/settings/routetype/details/${data.id}`
                  );
                },
              },
              {
                icon: "lucide:edit-2",
                onClick: (data: object) => {
                  const row = data as TableRow;
                  router.push(`/dashboard/settings/routetype/${row.id}`);
                },
              },
              {
                icon: "lucide:trash-2",
                onClick: (data: object) => {
                  const row = data as TableRow;
                  if (deletingId === String(row.id)) return;
                  setSelectedRow({ id: String(row.id) });
                  setShowDeletePopup(true);
                },
              },
            ],
            pageSize: 10,
          }}
        />
      </div>

      {/* Delete popup */}
      {showDeletePopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <DeleteConfirmPopup
            title="Route Type"
            onClose={() => setShowDeletePopup(false)}
            onConfirm={handleConfirmDelete}
          />
        </div>
      )}
    </>
  );
}
