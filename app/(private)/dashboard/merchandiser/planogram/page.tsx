"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify-icon/react";
import { useRouter } from "next/navigation";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";
import CustomDropdown from "@/app/components/customDropdown";
import BorderIconButton from "@/app/components/borderIconButton";
import Table, { TableDataType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { planogramList, deletePlanogram } from "@/app/services/allApi";
import Loading from "@/app/components/Loading";
import DeleteConfirmPopup from "@/app/components/deletePopUp";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useLoading } from "@/app/services/loadingContext";
interface PlanogramItem {
  id?: number | string;
  name?: string;
  valid_from?: string;
  valid_to?: string;
  status?: number | "Active" | "Inactive";
  
}
const dropdownDataList = [
  { icon: "lucide:layout", label: "SAP", iconWidth: 20 },
  { icon: "lucide:download", label: "Download QR Code", iconWidth: 20 },
  { icon: "lucide:printer", label: "Print QR Code", iconWidth: 20 },
  { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
  { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
];

export default function Planogram() {
    const {setLoading} = useLoading();
  const [planograms, setPlanograms] = useState<PlanogramItem[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedRow, setSelectedRow] = useState<PlanogramItem | null>(null);
console.log("planograms", planograms);
  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  type TableRow = TableDataType & { id?: string };

  // Normalize API data for table
const tableData: TableDataType[] = planograms.map((s) => ({
  id: s.id?.toString() ?? "",
  name: s.name ?? "",
  valid_from: s.valid_from ?? "",
  valid_to: s.valid_to ?? "", 
  status: s.status === 1 || s.status === "Active" ? "Active" : "Inactive",
}));

  async function fetchPlanograms() {
      setLoading(true);
      const listRes = await planogramList();
      if(listRes.error) {
        showSnackbar("Failed to fetch Planograms ❌", "error");
      } else {
        setPlanograms(listRes.data);
      }
      setLoading(false);
    };

  useEffect(() => {
    fetchPlanograms();
  }, []);

 const handleConfirmDelete = async () => {
  if (!selectedRow?.id) return;

  const res = await deletePlanogram(String(selectedRow.id));
  if(res.error) {
    showSnackbar(res.data.message || "Failed to delete Planogram","error");
  } else {
    showSnackbar(res.message || "Planogram deleted successfully", "success");
    fetchPlanograms();
  }
  setShowDeletePopup(false);
};


 useEffect(() => {
    setLoading(true);
  }, [])


  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-[20px] font-semibold text-[#181D27]">Planogram</h1>
      <div className="flex gap-[12px] relative">
                
      
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
      searchBar: false,
      columnFilter: true,
      actions: [
        <SidebarBtn
          key="add-planogram"
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
      { key: "valid_from", label: "Valid From" },
      { key: "valid_to", label: "Valid To" },
      {
        key: "status",
        label: "Status",
        render: (row: PlanogramItem) => (
          <div className="flex items-center">
            {row.status === "Active" ? (
              <span className="text-sm text-[#027A48] bg-[#ECFDF3] font-[500] p-1 px-4 rounded-xl text-[12px]">
                Active
              </span>
            ) : (
              <span className="text-sm text-red-700 bg-red-200 p-1 px-4 rounded-xl text-[12px]">
                Inactive
              </span>
            )}
          </div>
        ),
      },
    ],
    rowSelection: true,
    rowActions: [
        {
    icon: "lucide:eye",
    onClick: (data: TableDataType) => {
      router.push(`/dashboard/merchandiser/planogram/view/${data.id}`);
    },
  },
      {
        icon: "lucide:edit-2",
        onClick: (data: object) => {
          const row = data as TableRow;
          router.push(`/dashboard/merchandiser/planogram/update/${row.id}`);
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