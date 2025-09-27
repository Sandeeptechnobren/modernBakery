"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify-icon/react";
import { useRouter } from "next/navigation";

import BorderIconButton from "@/app/components/borderIconButton";
import CustomDropdown from "@/app/components/customDropdown";
import Table, { TableDataType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import Loading from "@/app/components/Loading";
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
  { icon: "lucide:layout", label: "SAP", iconWidth: 20 },
  { icon: "lucide:download", label: "Download QR Code", iconWidth: 20 },
  { icon: "lucide:printer", label: "Print QR Code", iconWidth: 20 },
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
  const [loading, setLoading] = useState(true);
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
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await getCustomerType();
        setCustomers(res?.data || []);
      } catch (error) {
        console.error("Failed to fetch customers ❌", error);
        showSnackbar("Failed to fetch customers ❌", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, [refresh]);

  // delete handler
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
setRefresh(!refresh);
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


  if (loading) return <Loading />;

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-[20px]">
        <h1 className="text-[20px] font-semibold text-[#181D27]">
          Customer Type
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

      {/* Table */}
      <div className="h-[calc(100%-60px)]">
        <Table
          data={tableData}
          config={{
            header: {
              searchBar: true,
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
