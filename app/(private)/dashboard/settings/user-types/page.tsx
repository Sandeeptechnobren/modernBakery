"use client";
import { useState, useEffect } from "react";
import { Icon } from "@iconify-icon/react";
import { useRouter } from "next/navigation";
import BorderIconButton from "@/app/components/borderIconButton";
import CustomDropdown from "@/app/components/customDropdown";
import Table, { TableDataType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { userList, deleteUser } from "@/app/services/allApi";
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
  { key: "code", label: "User Code" },
  { key: "name", label: "User Name" },
 
];

export default function Country() {
  interface CountryItem {
    id?: number | string;
    code?: string;
    name?: string;
  }

  const [countries, setCountries] = useState<CountryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedRow, setSelectedRow] = useState<CountryItem | null>(null);
  const router = useRouter();
  const { showSnackbar } = useSnackbar(); // ✅ snackbar hook
  type TableRow = TableDataType & { id?: string };

  // normalize countries to TableDataType for the Table component
  const tableData: TableDataType[] = countries.map((c) => ({
    id: c.id?.toString() ?? "",
    code: c.code ?? "",
    name: c.name ?? "",
   
  }));

  const fetchCountries = async () => {
  try {
    setLoading(true);
    const listRes = await userList({});
    setCountries(listRes.data);
    console.log("Fetched users:", listRes.data);
  } catch (error: unknown) {
    console.error("API Error:", error);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchCountries();
}, []);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const listRes = await userList({});
        setCountries(listRes.data);
        console.log("Fetched users:", listRes.data);
      } catch (error: unknown) {
        console.error("API Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

 const handleConfirmDelete = async () => {
  if (!selectedRow?.id) {
    showSnackbar("No row selected ❌", "error");
    return;
  }

  try {
    await deleteUser(String(selectedRow.id));
      await fetchCountries();

    // ✅ Update state immediately without full refresh
    setCountries((prev) => prev.filter((c) => String(c.id) !== String(selectedRow.id)));

    showSnackbar("User deleted successfully ✅", "success");
  } catch (error) {
    console.error("Delete failed:", error);
    showSnackbar("Failed to delete user ❌", "error");
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
          User Types
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
                  href="/dashboard/settings/user-types/add"
                  isActive
                  leadingIcon="lucide:plus"
                  label="Add User"
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
                  router.push(`/dashboard/settings/user-types/update/${row.id}`);
                //   /api/settings/user-type/{id}
                },
              },
              {
                icon: "lucide:more-vertical",
                onClick: (data: object) => {
                  const row = data as TableRow;
                  setSelectedRow({ id: row.id, code: row.code, name: row.name });
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
      title={`Delete User: ${selectedRow.name}?`}
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
