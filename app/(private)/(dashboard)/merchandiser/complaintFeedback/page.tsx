"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify-icon/react";

import Table, { listReturnType, TableDataType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";
import CustomDropdown from "@/app/components/customDropdown";
import BorderIconButton from "@/app/components/borderIconButton";
import DeleteConfirmPopup from "@/app/components/deletePopUp";

import { useSnackbar } from "@/app/services/snackbarContext";
import { useLoading } from "@/app/services/loadingContext";
import { complaintFeedbackList, deleteShelves } from "@/app/services/merchandiserApi";

const dropdownDataList = [
  { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
  { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
];

export default function ComplaintFeedbackPage() {
  const { setLoading } = useLoading();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deleteSelectedRow, setDeleteSelectedRow] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  // Handle Delete
  const handleConfirmDelete = async () => {
    if (!deleteSelectedRow) return;

    setLoading(true);
    const res = await deleteShelves(deleteSelectedRow);
    setLoading(false);

    if (res.error) {
      showSnackbar(res.data?.message || "Failed to delete feedback", "error");
    } else {
      showSnackbar(res.message || "Deleted successfully", "success");
      setRefreshKey((prev) => prev + 1); // Refresh table
      setShowDeletePopup(false);
    }
  };

  // Fetch Table Data
  const fetchComplaintFeedback = useCallback(
    async (pageNo = 1, pageSize = 10): Promise<listReturnType> => {
      setLoading(true);
      const res = await complaintFeedbackList({ page: String(pageNo), per_page: String(pageSize) });
      setLoading(false);

      if (res.error) {
        showSnackbar(res.data?.message || "Failed to fetch complaint feedback", "error");
        return { data: [], currentPage: 1, pageSize, total: 0 };
      }

    //   const apiData = (res?.data || []).map((item: any) => ({
    //     id: item.id,
    //     uuid: item.uuid,
    //     feedback_title: item.complaint_title,
    //     complaint_code: item.complaint_code || "-",
    //     merchendiser: item.merchendiser,
    //     item: item.item,
    //     type: item.type || "-",
    //     description: item.description || "-",
    //   }));



      return {
        data: res?.data || [],
        currentPage: res?.pagination?.current_page || 1,
        pageSize: res?.pagination?.per_page || pageSize,
        total: res?.pagination?.last_page || 1,
      };
    },
    [setLoading, showSnackbar]
  );

  return (
    <>
      <div className="flex flex-col h-full">
        <Table
          refreshKey={refreshKey}
          config={{
            api: { list: fetchComplaintFeedback },
            header: {
              title: "Complaint Feedback",
              wholeTableActions: [
                <div key={0} className="flex gap-[12px] relative">
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
                              <Icon icon={link.icon} width={link.iconWidth} className="text-[#717680]" />
                              <span className="text-[#181D27] font-[500] text-[16px]">{link.label}</span>
                            </div>
                          ))}
                        </CustomDropdown>
                      </div>
                    }
                  />
                </div>,
              ],
              searchBar: false,
              columnFilter: true,
              actions: [
                <SidebarBtn
                  key="add"
                  href="/merchandiser/complaintFeedback/add"
                  leadingIcon="lucide:plus"
                  label="Add Feedback"
                  labelTw="hidden lg:block"
                  isActive
                />,
              ],
            },
            footer: { nextPrevBtn: true, pagination: true },
            columns: [
              { key: "complaint_code", label: "Complaint Code" },
              { key: "complaint_title", label: "Title" },
              { key: "merchendiser", label: "Merchendiser", render: (row) => typeof row.merchendiser === "object" &&
            row.merchendiser !== null &&
            "name" in row.merchendiser
                ? (row.merchendiser as { name?: string })
                      ?.name || "-"
                : "-", },
              { key: "item", label: "Item", render: (row) => typeof row.item === "object" &&
            row.item !== null &&
            "item_name" in row.item
                ? (row.item as { item_name?: string })
                      .item_name || "-"
                : "-", },
              { key: "type", label: "Type" },
              { key: "description", label: "Description" },
            ],
            rowSelection: true,
            rowActions: [
              {
                icon: "lucide:eye",
                onClick: (data: TableDataType) => {
                  router.push(`/merchandiser/complaintFeedback/view/${data.uuid}`);
                },
              },
              {
                icon: "lucide:trash-2",
                onClick: (data: TableDataType) => {
                  setDeleteSelectedRow(data.uuid);
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
            title="Complaint Feedback"
            onClose={() => setShowDeletePopup(false)}
            onConfirm={handleConfirmDelete}
          />
        </div>
      )}
    </>
  );
}
