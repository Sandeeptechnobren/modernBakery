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
import { customerTypeList, deleteCustomerType } from "@/app/services/allApi";

// 🔹 API response type
interface CustomerType {
  id?: string | number;
  code?: string;
  name?: string;
  status?: string;
  [key: string]: string | number | undefined;
}

// 🔹 Dropdown menu items
const dropdownDataList = [
  { icon: "lucide:layout", label: "SAP", iconWidth: 20 },
  { icon: "lucide:download", label: "Download QR Code", iconWidth: 20 },
  { icon: "lucide:printer", label: "Print QR Code", iconWidth: 20 },
  { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
  { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
];

// 🔹 Table columns
const columns = [
  { key: "code", label: "Code" },
  { key: "name", label: "Name" },
  { key: "status", label: "Status" },
];

export default function CustomerPage() {
  const [customers, setCustomers] = useState<CustomerType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedRow, setSelectedRow] = useState<CustomerType | null>(null);

  const { showSnackbar } = useSnackbar();
  const router = useRouter();

  // normalize table data
  const tableData: TableDataType[] = customers.map((c) => ({
    id: c.id?.toString() ?? "",
    code: c.code ?? "",
    name: c.name ?? "",
    status: c.status === "active" ? "Active" : "Inactive",
  }));

  // fetch list
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await customerTypeList();
        setCustomers(res.data || []);
      } catch (error) {
        console.error("Failed to fetch customers ❌", error);
        showSnackbar("Failed to fetch customers ❌", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, [showSnackbar]);

  // delete handler (like CompanyPage)
  const handleConfirmDelete = async () => {
    if (!selectedRow?.id) return;

    try {
      const res = await deleteCustomerType(String(selectedRow.id));
      if (res.error) {
        showSnackbar("Failed to delete customer ❌", "error");
      }
      if (res.status === 200) {
        showSnackbar("Customer deleted successfully ✅", "success");

        setCustomers((prev) =>
          prev.filter((c) => String(c.id) !== String(selectedRow.id))
        );

        setShowDeletePopup(false);
        setSelectedRow(null);
      }
    } catch (error) {
      console.error("Delete failed ❌", error);
      showSnackbar("Delete failed ❌", "error");
    }
  };

  // render
  if (loading) return <Loading />;

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-[20px]">
        <h1 className="text-[20px] font-semibold text-[#181D27]">Customer Type</h1>

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
                  key={0}
                  href="/dashboard/settings/customer/customerType/add"
                  isActive
                  leadingIcon="lucide:plus"
                  label="Add Customer Type"
                  labelTw="hidden sm:block"
                />,
              ],
            },
            footer: { nextPrevBtn: true, pagination: true },
            columns,
            rowSelection: true,
            rowActions: [
              {
                icon: "lucide:eye",
                onClick: (row: object) => {
                  const r = row as TableDataType;
                  router.push(
                    `/dashboard/settings/customer/customerType/view/${r.id}`
                  );
                },
              },
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
                icon: "lucide:more-vertical",
                onClick: (row: object) => {
                  const r = row as TableDataType;
                  setSelectedRow({
                    id: r.id,
                    code: r.code,
                    name: r.name,
                    status: r.status,
                  });
                  setShowDeletePopup(true);
                },
              },
            ],
            pageSize: 10,
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
