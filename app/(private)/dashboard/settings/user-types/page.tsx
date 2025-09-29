"use client";
import { useState, useEffect ,useCallback} from "react";
import { Icon } from "@iconify-icon/react";
import { useRouter } from "next/navigation";
import BorderIconButton from "@/app/components/borderIconButton";
import CustomDropdown from "@/app/components/customDropdown";
import Table, { TableDataType ,listReturnType} from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { userList, deleteUserType } from "@/app/services/allApi";
import { useLoading } from "@/app/services/loadingContext";
import DeleteConfirmPopup from "@/app/components/deletePopUp";
import { useSnackbar } from "@/app/services/snackbarContext"; // ✅ import snackbar
import StatusBtn from "@/app/components/statusBtn2";

interface DropdownItem {
  icon: string;
  label: string;
  iconWidth: number;
}
 interface CountryItem {
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
  { key: "code", label: "User Code" },
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
 

  const [countries, setCountries] = useState<CountryItem[]>([]);
  const { setLoading} = useLoading();
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
    status: c.status?.toString() ?? "0",
   
  }));

           const fetchUserType = useCallback(
               async (
                   page: number = 1,
                   pageSize: number = 5
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
 const handleConfirmDelete = async () => {
  if (!selectedRow?.id) {
    showSnackbar("No row selected ❌", "error");
    return;
  }

  try {
    await deleteUserType(String(selectedRow.id));
    setLoading(true);
    showSnackbar("User deleted successfully ✅", "success");
  } catch (error) {
    console.error("Delete failed:", error);
    showSnackbar("Failed to delete user ❌", "error");
  } finally {
    setShowDeletePopup(false);
    setSelectedRow(null);
  }
};

useEffect(() => {
  setLoading(true);
}, []);

  return (
    <>
      
      <div className="h-[calc(100%-60px)]">
        <Table
         
          config={{
             api:{
                list: fetchUserType,
              },
            header: {
              title: "User Types",
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
              
              {
                icon: "lucide:edit-2",
                onClick: (data: object) => {
                  const row = data as TableRow;
                  router.push(`/dashboard/settings/user-types/update/${row.id}`);
                },
              },
              {
                icon: "lucide:trash-2",
                onClick: (data: object) => {
                  const row = data as TableRow;
                  setSelectedRow({ id: row.id, code: row.code, name: row.name });
                  setShowDeletePopup(true);
                },
              },
            ],
            pageSize: 5,
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
