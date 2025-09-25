"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify-icon/react";
import { useRouter } from "next/navigation";

import BorderIconButton from "@/app/components/borderIconButton";
import CustomDropdown from "@/app/components/customDropdown";
import Table, { TableDataType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { getExpenseTypeList, deleteExpenseType } from "@/app/services/allApi";
import Loading from "@/app/components/Loading";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";
import DeleteConfirmPopup from "@/app/components/deletePopUp";
import { useSnackbar } from "@/app/services/snackbarContext"; // ✅ import snackbar

interface DropdownItem {
  icon: string;
  label: string;
  iconWidth: number;
}

const dropdownDataList: DropdownItem[] = [
  { icon: "lucide:layout", label: "SAP", iconWidth: 20 },
  { icon: "lucide:download", label: "Download QR Code", iconWidth: 20 },
  { icon: "lucide:printer", label: "Print QR Code", iconWidth: 20 },
  { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
  { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
];

const columns = [
  { key: "expense_type_code", label: "Expense Type Code" },
  { key: "expense_type_name", label: "Expense Type Name" },
  // { key: "created_user", label: "Created User" },
  // { key: "updated_user", label: "Updated User" },
  // { key: "created_date", label: "Created Date" },
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
  const [loading, setLoading] = useState<boolean>(true);
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
  const fetchCountries = async () => {
    try {
      const listRes = await getExpenseTypeList();
      setCountries(listRes.data);
    } catch (error: unknown) {
      console.error("API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCountries();
  }, []);


  const handleConfirmDelete = async () => {
    if (!selectedRow) return;

  try {
      if (!selectedRow?.id) throw new Error('Missing id');
      await deleteExpenseType(String(selectedRow.id)); // call API
      showSnackbar("Expense Type deleted successfully ", "success");
      fetchCountries(); // Refresh the table data after successful delete
    } catch (error) {
      console.error("Delete failed ❌:", error);
      showSnackbar("Failed to delete Expense Type", "error");
    } finally {
      setShowDeletePopup(false);
      setSelectedRow(null);
    }
  };
  

  return loading ? (
    <Loading />
  ) : (
    <>
      <div className="flex justify-between items-center mb-[20px]">
        <h1 className="text-[20px] font-semibold text-[#181D27] h-[30px] flex items-center leading-[30px] mb-[1px]">
          Expense Type
        </h1>

        <div className="flex gap-[12px] relative">
          <BorderIconButton icon="gala:file-document" label="Export CSV" />
          <BorderIconButton icon="mage:upload" />
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
        </div>
      </div>

      <div className="h-[calc(100%-60px)]">
        <Table
          data={tableData}
          config={{
            header: {
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
            pageSize: 10,
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
