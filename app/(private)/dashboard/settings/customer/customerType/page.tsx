"use client";

import { useState, useEffect ,useCallback} from "react";
import { Icon } from "@iconify-icon/react";
import { useRouter } from "next/navigation";

import BorderIconButton from "@/app/components/borderIconButton";
import CustomDropdown from "@/app/components/customDropdown";
import Table, { TableDataType,listReturnType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { useLoading } from "@/app/services/loadingContext";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";
import DeleteConfirmPopup from "@/app/components/deletePopUp";
import { useSnackbar } from "@/app/services/snackbarContext";
import { deleteCustomerType, getCustomerType } from "@/app/services/allApi";

interface CustomerType {
  id?: string | number;
  code?: string;
  name?: string;
  status?:  number;
  [key: string]: string | number | undefined;
}

const dropdownDataList = [
  // { icon: "lucide:layout", label: "SAP", iconWidth: 20 },
  // { icon: "lucide:download", label: "Download QR Code", iconWidth: 20 },
  // { icon: "lucide:printer", label: "Print QR Code", iconWidth: 20 },
  { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
  { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
];

const columns = [
  { key: "code", label: "Code" },
  { key: "name", label: "Name" },
   {
        key: "status",
        label: "Status",
        render: (row: TableDataType) => (
            <div className="flex items-center">
                {row.status === "Active" ? (
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

export default function CustomerPage() {
  const [customers, setCustomers] = useState<CustomerType[]>([]);
  const {setLoading} = useLoading();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedRow, setSelectedRow] = useState<CustomerType | null>(null);
  const [refresh, setRefresh] = useState<boolean>(false);

  const { showSnackbar } = useSnackbar();
  const router = useRouter();

  // normalize table data
  const tableData: TableDataType[] = customers.map((c) => ({
    id: c.id?.toString() ?? "",
    code: c.code ?? "",
    name: c.name ?? "",
    status:
        c.status === 1
        ? "Active"
        : "Inactive",
  }));

  // fetch list
  // useEffect(() => {
  //   const fetchCustomers = async () => {
  //     try {
  //       const res = await getCustomerType();
  //       setCustomers(res?.data || []);
  //     } catch (error) {
  //       console.error("Failed to fetch customers ❌", error);
  //       showSnackbar("Failed to fetch customers ❌", "error");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchCustomers();
  // }, [refresh]);

          const fetchCustomerType = useCallback(
              async (
                  page: number = 1,
                  pageSize: number = 1
              ): Promise<listReturnType> => {
                  try {
                    setLoading(true);
                      const listRes = await getCustomerType({
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
  //          useEffect(() => {
  //   setLoading(true);
  // });
 const handleConfirmDelete = async () => {
  if (!selectedRow?.id) return;

  try {
    const res = await deleteCustomerType(String(selectedRow.id));

    // success check
    if (res?.success || res?.message || res) {
      setCustomers((prev) =>
        prev.filter((c) => String(c.id) !== String(selectedRow.id))
      );

      showSnackbar("Customer deleted successfully ✅", "success");
      // optional: if list becomes empty after delete
      if (customers.length === 1) {
        // after deleting last item, customers will be []
        setCustomers([]);
      }

      setShowDeletePopup(false);
      setSelectedRow(null);
    } else {
      showSnackbar("Failed to delete customer ❌", "error");
    }
  } catch (error) {
    console.error("Delete failed ❌", error);
    showSnackbar("Delete failed ❌", "error");
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
              title: "Customer Type",
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
                  key="add-customer-type"
                  href="/dashboard/settings/customer/customerType/add"
                  leadingIcon="lucide:plus"
                  label="Add Customer Type"
                  labelTw="hidden sm:block"
                  isActive
                />,
              ],
            },
            footer: { nextPrevBtn: true, pagination: true },
            columns,
            rowSelection: true,
            rowActions: [
              {
                icon: "lucide:edit-2",
                onClick: (row: object) => {
                  const r = row as TableDataType;
                  router.push(
                    `/dashboard/settings/customer/customerType/updateCustomerType/${r.id}`
                  );
                },
              },
              {
                icon: "lucide:trash",
                onClick: (row: object) => {
                  const r = row as TableDataType;
                  setSelectedRow({
                    id: r.id,
                    code: r.code,
                    name: r.name,
                    status: Number(r.status) === 1 ? 1 : 0,
                  });
                  setShowDeletePopup(true);
                },
              },
            ],
            pageSize: 5,
          }}
        />
      </div>

      {/* Delete Popup */}
      {showDeletePopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <DeleteConfirmPopup
            title="Delete Customer Type"
            onClose={() => setShowDeletePopup(false)}
            onConfirm={handleConfirmDelete}
          />
        </div>
      )}
    </>
  );
}
