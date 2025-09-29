"use client";

import { useState, useEffect,useCallback } from "react";
import { Icon } from "@iconify-icon/react";
import { useRouter } from "next/navigation";

import BorderIconButton from "@/app/components/borderIconButton";
import CustomDropdown from "@/app/components/customDropdown";
import Table, { TableDataType,listReturnType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { getExpenseTypeList, deleteExpenseType } from "@/app/services/allApi";
import { useLoading } from "@/app/services/loadingContext";
import DeleteConfirmPopup from "@/app/components/deletePopUp";
import { useSnackbar } from "@/app/services/snackbarContext"; // ✅ import snackbar

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
  { key: "expense_type_code", label: "Expense Type Code" },
  { key: "expense_type_name", label: "Expense Type Name" },
  // { key: "created_user", label: "Created User" },
  // { key: "updated_user", label: "Updated User" },
  // { key: "created_date", label: "Created Date" },
 
//   { key: "expense_type_status", label: "Status" },
  {
    key: "expense_type_status",
    label: "Status",
    render: (row: TableDataType) => (
      <div className="flex items-center">
        {Number(row.expense_type_status) === 1 ? (
          <span className="text-sm text-[#027A48] bg-[#ECFDF3] font-[500] p-1 px-4 rounded-xl text-[12px]">
            Active
          </span>
        ) : (
          <span className="text-sm text-red-700 bg-red-200 p-1 px-4 rounded-xl text-[12px]">
            In Active
          </span>
        )}
      </div>
    ),
  },
];

export default function Expensetype() {
  interface expenseTypeItem {
    id?: number | string;
    expense_type_code?: string;
    expense_type_name?: string;
    // created_user?: string;
    // updated_user?: string;
    created_date?: string;
    expense_type_status?: string;
  }

  const [countries, setCountries] = useState<expenseTypeItem[]>([]);
  const { setLoading} = useLoading();
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedRow, setSelectedRow] = useState<expenseTypeItem | null>(null);
  const router = useRouter();
  const { showSnackbar } = useSnackbar(); // ✅ snackbar hook
  type TableRow = TableDataType & { id?: string };

  // normalize countries to TableDataType for the Table component
const tableData: TableDataType[] = countries.map((c) => ({
  id: c.id?.toString() ?? "",
  expense_type_code: c.expense_type_code ?? "",
  expense_type_name: c.expense_type_name ?? "",
  // created_user: c.created_user ?? "",
  // updated_user: c.updated_user ?? "",
  created_date: c.created_date ?? "",
  expense_type_status:
    typeof c.expense_type_status === "number"
      ? String(c.expense_type_status)
      : c.expense_type_status ?? "0",
}));
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
                    pageSize: number = 1
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
  // useEffect(() => {
  //   fetchCountries();
  // }, []);


  const handleConfirmDelete = async () => {
    if (!selectedRow) return;

  try {
      if (!selectedRow?.id) throw new Error('Missing id');
      await deleteExpenseType(String(selectedRow.id)); // call API
      showSnackbar("Expense Type deleted successfully ", "success");
      // fetchCountries(); // Refresh the table data after successful delete
    } catch (error) {
      console.error("Delete failed ❌:", error);
      showSnackbar("Failed to delete Expense Type", "error");
    } finally {
      setShowDeletePopup(false);
      setSelectedRow(null);
    }
  };
  

  return  (
    <>


      <div className="h-[calc(100%-60px)]">
        <Table
          
          config={{
            api:{ list: fetchExpenseType, },
            header: {
              title: "Expense Type",
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
                  href="/dashboard/settings/expenseType/add"
                  isActive
                  leadingIcon="lucide:plus"
                  label="Add Expense Type"
                  labelTw="hidden sm:block"
                />,
              ],
            },
            footer: { nextPrevBtn: true, pagination: true },
            columns,
            rowSelection: true,
            rowActions: [
              
              {
                icon: "lucide:edit-2",
                onClick: (data: object) => {
                  const row = data as TableRow;
                  router.push(`/dashboard/settings/expenseType/${row.id}/update`);
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
            title="Expense Type"
            onClose={() => setShowDeletePopup(false)}
            onConfirm={handleConfirmDelete}
          />
        </div>
      )}
    </>
  );
}
