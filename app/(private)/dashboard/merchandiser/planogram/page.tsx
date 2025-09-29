"use client";
import { useState } from "react";
import { Icon } from "@iconify-icon/react";
import { useRouter } from "next/navigation";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";
import CustomDropdown from "@/app/components/customDropdown";
import BorderIconButton from "@/app/components/borderIconButton";
import Table, { TableDataType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import DeleteConfirmPopup from "@/app/components/deletePopUp";
import { useSnackbar } from "@/app/services/snackbarContext";
interface PlanogramItem {
  id: string;
image: string;
  name: string;
  customer_name: string;
  valid_from: string;
  valid_to: string;
}
const dropdownDataList = [
  { icon: "lucide:layout", label: "SAP", iconWidth: 20 },
  { icon: "lucide:download", label: "Download QR Code", iconWidth: 20 },
  { icon: "lucide:printer", label: "Print QR Code", iconWidth: 20 },
  { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
  { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
];

// ✅ Static table data
const tableData: TableDataType[] = [
  {
    id: "1",

    name: "North planogram",

    customer_name: "Data ",
    valid_from: "2025-09-01",
    valid_to: "2025-09-30",
    image: "image1.png",
  },
  {
    id: "2",

    name: "South planogram",
image: "image2.png",
    customer_name: "Custume Name",
    status: "Inactive",
    valid_from: "2025-09-01",
    valid_to: "2025-09-30",
  },
];

export default function Planogram() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedRow, setSelectedRow] = useState<PlanogramItem | null>(null);

  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  const handleConfirmDelete = () => {
    if (selectedRow) {
      showSnackbar(`Deleted row with ID: ${selectedRow.id}`, "success");
      setShowDeletePopup(false);
    }
  };

  type TableRow = TableDataType & { id?: string };

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-[20px] font-semibold text-[#181D27]">Planogram</h1>
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
                  key="add-region"
                  href="/dashboard/merchandiser/planogram/add"
                  leadingIcon="lucide:plus"
                  label="Add Planogram"
                  labelTw="hidden sm:block"
                  isActive
                />,
              ],
            },
            footer: { nextPrevBtn: true, pagination: true },
            columns: [
              { key: "name", label: "Name" },
              { key: "customer_name", label: "Customer Name" },
              { key: "valid_from", label: "Valid From" },
              { key: "valid_to", label: "Valid To" },
                { key: "image", label: "Image" },
            ],
            rowSelection: true, 
            rowActions: [
              { 
                icon: "lucide:edit-2",
                onClick: (data: object) => {
                  const row = data as TableRow;
                  router.push(
                    `/dashboard/merchandiser/planogram/update/${row.id}`
                  );
                },
              },
              {
                icon: "lucide:trash-2",
                onClick: (data: object) => {
                  const row = data as TableRow;
                  setSelectedRow({ id: row.id, ...row } as PlanogramItem);
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
            title="Planogram"
            onClose={() => setShowDeletePopup(false)}
            onConfirm={handleConfirmDelete}
          />
        </div>
      )}
    </>
  );
}
