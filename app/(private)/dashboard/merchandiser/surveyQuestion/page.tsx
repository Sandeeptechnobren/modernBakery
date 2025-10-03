"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify-icon/react";
import { useRouter } from "next/navigation";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";
import CustomDropdown from "@/app/components/customDropdown";
import BorderIconButton from "@/app/components/borderIconButton";
import Table, { TableDataType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { SurveyQuestionList, deleteSurveyQuestion } from "@/app/services/allApi";
import Loading from "@/app/components/Loading";
import DeleteConfirmPopup from "@/app/components/deletePopUp";
import { useSnackbar } from "@/app/services/snackbarContext";

export interface SurveyQuestionItem {
  id: number;
  survey_question_code: string;
  survey_id: number;
  question: string;
  question_type: string;
  question_based_selected: string;
}

const dropdownDataList = [
  { icon: "lucide:layout", label: "SAP", iconWidth: 20 },
  { icon: "lucide:download", label: "Download QR Code", iconWidth: 20 },
  { icon: "lucide:printer", label: "Print QR Code", iconWidth: 20 },
  { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
  { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
];

export default function SurveyQuestions() {
  const [questions, setQuestions] = useState<SurveyQuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedRow, setSelectedRow] = useState<{ id: string } | null>(null);

  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  type TableRow = TableDataType & { id?: string };

  // Map survey questions to table data
  const tableData: TableDataType[] = questions.map((q) => ({
    id: q.id.toString(),
    survey_question_code: q.survey_question_code,
    survey_id: q.survey_id.toString(),
    question: q.question,
    question_type: q.question_type,
    options: q.question_based_selected,
  }));

  // Fetch survey questions
  const fetchQuestions = async () => {
    const res = await SurveyQuestionList();
    if (res.error) {
      showSnackbar("Failed to fetch Survey Questions ❌", "error");
    } else {
      setQuestions(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  // Delete handler
  const handleConfirmDelete = async () => {
    if (!selectedRow?.id) return;

    const res = await deleteSurveyQuestion(selectedRow.id);
    if (res.error) {
      showSnackbar(res.data?.message || "Failed to delete Survey Question", "error");
    } else {
      showSnackbar(res.message || "Survey Question deleted successfully", "success");
      fetchQuestions();
    }
    setShowDeletePopup(false);
  };

  if (loading) return <Loading />;

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-[20px] font-semibold text-[#181D27]">Survey Questions</h1>
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
                  {dropdownDataList.map((link) => (
                    <div
                      key={link.label} // ✅ unique key
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
                  key="add-question"
                  href="/dashboard/merchandiser/surveyQuestion/add"
                  leadingIcon="lucide:plus"
                  label="Add Question"
                  labelTw="hidden sm:block"
                  isActive
                />,
              ],
            },
            footer: { nextPrevBtn: true, pagination: true },
            columns: [
              { key: "survey_question_code", label: "Question Code" },
              { key: "survey_id", label: "Survey ID" },
              { key: "question", label: "Question" },
              { key: "question_type", label: "Type" },
              { key: "options", label: "Options" },
            ],
            rowSelection: true,
            rowActions: [
              {
                icon: "lucide:edit-2",
                onClick: (data: object) => {
                  const row = data as TableRow;
                  router.push(`/dashboard/merchandiser/survey-question/update/${row.id}`);
                },
              },
              {
                icon: "lucide:trash-2",
                onClick: (data: object) => {
                  const row = data as TableRow;
                  setSelectedRow({ id: row.id! });
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
            title="Survey Question"
            onClose={() => setShowDeletePopup(false)}
            onConfirm={handleConfirmDelete}
          />
        </div>
      )}
    </>
  );
}
