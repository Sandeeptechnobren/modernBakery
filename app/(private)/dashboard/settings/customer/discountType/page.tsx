"use client";

import BorderIconButton from "@/app/components/borderIconButton";
import { Icon } from "@iconify-icon/react";
import { useEffect, useState ,useCallback} from "react";
import { useRouter } from "next/navigation";
import CustomDropdown from "@/app/components/customDropdown";
import Table, { TableDataType,listReturnType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { getDiscountTypeList,deleteDiscountType } from "@/app/services/allApi";
import { useLoading } from "@/app/services/loadingContext";
import DeleteConfirmPopup from "@/app/components/deletePopUp";
import { useSnackbar } from "@/app/services/snackbarContext";

const columns = [
    {
        key: "discount_code",
        label: "Discount Code",
        render: (row: TableDataType) => (
            <span className="font-semibold text-[#181D27] text-[14px]">
                {row.discount_code}
            </span>
        ),
    },
    { key: "discount_name", label: "Discount Name" ,isSortable: true },
    {
    key: "created_date",
    label: "Created Date",
    render: (row: TableDataType) => {
        const dateStr = row.created_date;
        if (!dateStr) return "";
        const [y, m, d] = dateStr.split("T")[0].split("-");
        return `${d}-${m}-${y}`;
    },
},
    {
        key: "discount_status",
        label: "Status",
        render: (row: TableDataType) => {
            const statusValue = String(row.discount_status);
            const isActive = statusValue === "1";
            
            return (
                <div className="flex items-center">
                    {isActive ? (
                        <span className="text-sm text-[#027A48] bg-[#ECFDF3] font-[500] p-1 px-4 rounded-xl text-[12px]">
                            Active
                        </span>
                    ) : (
                        <span className="text-sm text-red-700 bg-red-200 p-1 px-4 rounded-xl text-[12px]">
                            Inactive
                        </span>
                    )}
                </div>
            );
        },
    },
];

const dropdownDataList = [
    // { icon: "lucide:layout", label: "SAP", iconWidth: 20 },
    // { icon: "lucide:download", label: "Download QR Code", iconWidth: 20 },
    // { icon: "lucide:printer", label: "Print QR Code", iconWidth: 20 },
    { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
    { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
];

export default function DiscountType() {
    interface DiscountTypeItem {
    id?: number | string;
    discount_code?: string;
    discount_name?: string;
    created_date?: string;
    discount_status?: string;
  }
    const[discountType, setDiscountType] = useState<DiscountTypeItem[]>([]);
    const [selectedRow, setSelectedRow] = useState<DiscountTypeItem | null>(null);
      const [showDeletePopup, setShowDeletePopup] = useState(false);
        const [showDropdown, setShowDropdown] = useState(false);
        const { setLoading} = useLoading();
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  type TableRow = TableDataType & { id?: string };

    const tableData: TableDataType[] = discountType.map((c) => ({
    id: c.id?.toString() ?? "",
    discount_code: c.discount_code ?? "",
    discount_name: c.discount_name ?? "",
    created_date: c.created_date ?? "",
    discount_status: c.discount_status ?? "",
  }));


        // const fetchDiscountType = async () => {
        //     try {
        //         setLoading(true);
        //         const listRes = await getDiscountTypeList();
        //         // routeList returns response shape similar to other list endpoints: { data: [...] }
        //         setDiscountType(listRes?.data ?? []);
        //     } catch (error: unknown) {
        //         console.error("API Error:", error);
        //         setDiscountType([]);
        //     } finally {
        //         setLoading(false);
        //     }
        // };

          const fetchCustomerType = useCallback(
              async (
                  page: number = 1,
                  pageSize: number = 1
              ): Promise<listReturnType> => {
                  try {
                    setLoading(true);
                      const listRes = await getDiscountTypeList({
                          per_page: pageSize.toString(),
                          page: page.toString(),
                      });
                      setLoading(false);
                      return {
                          data: listRes.data || [],
                          total: listRes.pagination.totalPages ,
                          currentPage: listRes.pagination.page ,
                          pageSize: listRes.pagination.limit ,
                      };
                  } catch (error: unknown) {
                      console.error("API Error:", error);
                      setLoading(false);
                      throw error;
                  }
              },
              []
          );

//   useEffect(() => {
//     fetchDiscountType();
//   }, []);
   const handleConfirmDelete = async () => {
      if (!selectedRow) return;
  
    try {
    if (!selectedRow?.id) throw new Error('Missing id');
    await deleteDiscountType(String(selectedRow.id)); // call API
        
        showSnackbar("Discount Type deleted successfully ", "success"); 
        // await fetchDiscountType();

    // ✅ Update state immediately without full refresh
    setDiscountType((prev) => prev.filter((c) => String(c.id) !== String(selectedRow.id)));
        router.refresh();
      } catch (error) {
        console.error("Delete failed ❌:", error);
        showSnackbar("Failed to delete Discount Type ❌", "error"); 
      } finally {
        setShowDeletePopup(false);
        setSelectedRow(null);
      }
    };



    return (
        <>
            

            {/* Table */}
            <div className="h-[calc(100%-60px)]">
                <Table
                    
                    config={{
                        api:{
                            list: fetchCustomerType,
                        },
                        header: {
                            title: "Discount Type",
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
                                    href="/dashboard/settings/customer/discountType/create"
                                    isActive={true}
                                    leadingIcon="lucide:plus"
                                    label="Add Discount Type"
                                    labelTw="hidden sm:block"
                                />
                            ],
                        },
                        footer: {
                            nextPrevBtn: true,
                            pagination: true,
                        },
                        columns: columns,
                        rowSelection: true,
                        rowActions: [
                            
                            {
                icon: "lucide:edit-2",
                onClick: (data: object) => {
                  const row = data as TableRow;
                  router.push(`/dashboard/settings/customer/discountType/${row.id}/update`);
                },
              },
                            {
                            icon: "lucide:trash-2",
                            onClick: (data: object) => {
                            const row = data as TableRow;
                            setSelectedRow({ id: row.id });
                            setShowDeletePopup(true);
                            },
                        },
                        ],
                        pageSize: 2,
                    }}
                />
            </div>
            {showDeletePopup && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                      <DeleteConfirmPopup
                        title="Discount Type"
                        onClose={() => setShowDeletePopup(false)}
                        onConfirm={handleConfirmDelete}
                      />
                    </div>
                  )}
        </>
    );
}
