"use client";
import { useState, useEffect } from "react";
import { Icon } from "@iconify-icon/react";
import { useRouter } from "next/navigation";
import BorderIconButton from "@/app/components/borderIconButton";
import CustomDropdown from "@/app/components/customDropdown";
import Table, { TableDataType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { salesmanTypeList, deleteSalesmanType } from "@/app/services/allApi";
import Loading from "@/app/components/Loading";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";
import DeleteConfirmPopup from "@/app/components/deletePopUp";
import { useSnackbar } from "@/app/services/snackbarContext";

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
  { key: "salesman_type_code", label: "Salesman Code" },
  { key: "salesman_type_name", label: "Salesman Name" },
  { key: "salesman_type_status", label: "Status" },
];

export default function SalesmanTypeList() {
  interface SalesmanTypeForm {
    id: string;
    salesman_type_code?: string;
    salesman_type_name?: string;
    salesman_type_status: string | number; // ✅ allow both
  }

  const [countries, setCountries] = useState<SalesmanTypeForm[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedRow, setSelectedRow] = useState<SalesmanTypeForm | null>(null);
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  type TableRow = TableDataType & { id?: string };

  // ✅ Normalize countries to TableDataType for the Table component
  const tableData: TableDataType[] = countries.map((c) => ({
    id: String(c.id ?? ""),
    salesman_type_code: c.salesman_type_code ?? "",
    salesman_type_name: c.salesman_type_name ?? "",
    // ✅ Convert numeric/string status to readable text
    salesman_type_status:
      Number(c.salesman_type_status) === 1 ? "Active" : "Inactive",
  }));

  const fetchCountries = async () => {
    try {
      setLoading(true);
      const listRes = await salesmanTypeList({});
      setCountries(listRes.data);
      console.log("Fetched salesman type:", listRes.data);
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
    if (!selectedRow?.id) {
      showSnackbar("No row selected ❌", "error");
      return;
    }

    try {
      // ✅ Only ID is numeric here; status is not touched
      await deleteSalesmanType(String(selectedRow.id));
      await fetchCountries();

      // ✅ Update UI without full refresh
      setCountries((prev) =>
        prev.filter((c) => String(c.id) !== String(selectedRow.id))
      );

      showSnackbar("Salesman Type deleted successfully ✅", "success");
    } catch (error) {
      console.error("Delete failed:", error);
      showSnackbar("Failed to delete salesman type ❌", "error");
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
          Salesman Types
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
                  href="/dashboard/settings/salesman-type/add"
                  isActive
                  leadingIcon="lucide:plus"
                  label="Add New"
                  labelTw="hidden sm:block"
                />,
              ],
            },
            footer: { nextPrevBtn: true, pagination: true },
            columns,
            rowSelection: true,
            rowActions: [
              { icon: "lucide:eye" },
              {
                icon: "lucide:edit-2",
                onClick: (data: object) => {
                  const row = data as TableRow;
                  router.push(
                    `/dashboard/settings/salesman-type/update/${row.id}`
                  );
                },
              },
              {
                icon: "lucide:more-vertical",
                onClick: (data: object) => {
                  const row = data as TableRow;
                  setSelectedRow({
                    id: String(row.id),
                    salesman_type_code: row.salesman_type_code ?? "",
                    salesman_type_name: row.salesman_type_name ?? "",
                    salesman_type_status: row.salesman_type_status ?? "",
                  });
                  setShowDeletePopup(true);
                },
              },
            ],
            pageSize: 10,
          }}
        />
      </div>

      {showDeletePopup && selectedRow && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <DeleteConfirmPopup
            title={`Delete User: ${selectedRow.salesman_type_name}?`}
            onClose={() => {
              setShowDeletePopup(false);
              setSelectedRow(null);
            }}
            onConfirm={handleConfirmDelete}
          />
        </div>
      )}
    </>
  );
}
