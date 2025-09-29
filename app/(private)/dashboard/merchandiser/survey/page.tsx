"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify-icon/react";
import { useRouter } from "next/navigation";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";
import CustomDropdown from "@/app/components/customDropdown";
import BorderIconButton from "@/app/components/borderIconButton";
import Table, { TableDataType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { SurveyList, deleteSurvey } from "@/app/services/allApi";
import Loading from "@/app/components/Loading";
import DeleteConfirmPopup from "@/app/components/deletePopUp";
import { useSnackbar } from "@/app/services/snackbarContext";
interface SurveyItem {
  id?: number | string;
  survey_code?: string;
  survey_name?: string;
  start_date?: string;
  end_date?: string;
  status?: number | "Active" | "Inactive";
  
}
const dropdownDataList = [
  { icon: "lucide:layout", label: "SAP", iconWidth: 20 },
  { icon: "lucide:download", label: "Download QR Code", iconWidth: 20 },
  { icon: "lucide:printer", label: "Print QR Code", iconWidth: 20 },
  { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
  { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
];

export default function Survey() {
  const [surveys, setSurveys] = useState<SurveyItem[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);  
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedRow, setSelectedRow] = useState<SurveyItem | null>(null);

  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  type TableRow = TableDataType & { id?: string };

  // Normalize API data for table
const tableData: TableDataType[] = surveys.map((s) => ({
  id: s.id?.toString() ?? "",
  survey_code: s.survey_code ?? "",
  survey_name: s.survey_name ?? "",
  start_date: s.start_date ?? "",
  end_date: s.end_date ?? "",
  status:
    String(s.status).toLowerCase() === "active" || s.status === 1
      ? "Active"
      : "Inactive",
}));

  async function fetchPlanograms() {
      const listRes = await SurveyList();
      if(listRes.error) {
        showSnackbar("Failed to fetch Surveys ❌", "error");
      } else {
        setSurveys(listRes.data);
      }
      setLoading(false);
    };

  useEffect(() => {
    fetchPlanograms();
  }, []);

 const handleConfirmDelete = async () => {
  if (!selectedRow?.id) return;

  const res = await deleteSurvey(String(selectedRow.id));
  if(res.error) {
    showSnackbar(res.data.message || "Failed to delete Survey","error");
  } else {
    showSnackbar(res.message || "Survey deleted successfully", "success");
    fetchPlanograms();
  }
  setShowDeletePopup(false);
};


  if (loading) return <Loading />;

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-[20px] font-semibold text-[#181D27]">Survey</h1>
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
          key="add-survey"
          href="/dashboard/merchandiser/survey/add"
          leadingIcon="lucide:plus"
          label="Add Survey"
          labelTw="hidden sm:block"
          isActive
        />,
      ],
    },
    footer: { nextPrevBtn: true, pagination: true },
    columns: [
      { key: "survey_code", label: "Survey code" },
      { key: "survey_name", label: "Survey name" },
      { key: "start_date", label: "Start To" },
      { key: "end_date", label: "End To" },
      {
        key: "status",
        label: "Status",
        render: (row: SurveyItem) => (
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
        icon: "lucide:edit-2",
        onClick: (data: object) => {
          const row = data as TableRow;
          router.push(`/dashboard/merchandiser/survey/update/${row.id}`);
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
            title="Survey"
            onClose={() => setShowDeletePopup(false)}
            onConfirm={handleConfirmDelete}
          />
        </div>
      )}
    </>
  );
}