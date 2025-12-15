"use client";

import React, { useEffect, useState } from "react";
import type { JSX } from "react"; // ✅ Fixes JSX namespace error
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Formik, Form, FormikHelpers } from "formik";
import * as Yup from "yup";
import ContainerCard from "@/app/components/containerCard";
import InputFields from "@/app/components/inputFields";
import { useSnackbar } from "@/app/services/snackbarContext";
import DeleteConfirmPopup from "@/app/components/deletePopUp";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import {
  getSurveyById,
  updateSurvey,
  UpdateSurveyQuestion,
  getSurveyQuestionBySurveyId,
  deleteSurveyQuestion,
} from "@/app/services/allApi";

// ✅ Question types
const questionTypes = [
  "comment box",
  "check box",
  "radio button",
  "textbox",
  "selectbox",
] as const;

const typesWithOptions: readonly (typeof questionTypes)[number][] = [
  "check box",
  "radio button",
  "selectbox",
];

const stepSchemas = [
  Yup.object({
    surveyName: Yup.string().required("Survey Name is required."),
    startDate: Yup.date()
      .required("Start Date is required")
      .typeError("Invalid date"),
    endDate: Yup.date()
      .required("End Date is required")
      .typeError("Invalid date")
      .min(Yup.ref("startDate"), "End Date cannot be before Start Date"),
    status: Yup.number().required("Status is required."),
  }),
];

interface SurveyFormValues {
  surveyName: string;
  startDate: string;
  endDate: string;
  status: number;
  survey_id: string;
}

type QuestionType = (typeof questionTypes)[number];

interface Question {
  id: number | string;
  question: string;
  question_type: QuestionType;
  survey_id: number | string;
  question_id: string | number;
  question_based_selected?: string | string[];
  edited?: boolean;
}

export default function UpdateSurveyTabs(): JSX.Element {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const surveyId = params.id;
  const { showSnackbar } = useSnackbar();

  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<Question | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<number>(1);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [initialValues, setInitialValues] = useState<SurveyFormValues>({
    surveyName: "",
    startDate: "",
    endDate: "",
    status: 1,
    survey_id: "",
  });

  // ✅ Map question type safely
  const mapQuestionType = (type: string): QuestionType =>
    questionTypes.includes(type.toLowerCase() as QuestionType)
      ? (type.toLowerCase() as QuestionType)
      : "textbox";

  // ✅ Fetch Survey / Questions
  useEffect(() => {
    if (!surveyId) return;

    const fetchData = async (): Promise<void> => {
      try {
        if (activeTab === 2) {
          const questionsData: Question[] = await getSurveyQuestionBySurveyId(
            surveyId.toString()
          );

          if (!questionsData || questionsData.length === 0) {
            showSnackbar("No questions found for this survey.", "warning");
            setQuestions([]);
            return;
          }

          const formattedQuestions = questionsData.map((q) => ({
            ...q,
            question_id: q.question_id || q.id,
            edited: false,
          }));
          setQuestions(formattedQuestions);
        } else {
          const res = await getSurveyById(surveyId.toString());
          const surveyData = res?.data?.data || res?.data;

          if (!surveyData) return;

          setInitialValues({
            surveyName: surveyData.survey_name || "",
            startDate: surveyData.start_date?.split("T")[0] || "",
            endDate: surveyData.end_date?.split("T")[0] || "",
            status: Number(surveyData.status),
            survey_id: surveyId.toString(),
          });
        }
      } catch (err) {
        console.error(err);
        showSnackbar("Failed to load survey data ❌", "error");
      }
    };

    fetchData();
  }, [surveyId, activeTab, showSnackbar]);

  // ✅ Update survey details
  const handleUpdateSurvey = async (
    values: SurveyFormValues,
    actions: FormikHelpers<SurveyFormValues>
  ): Promise<void> => {
    try {
      await stepSchemas[0].validate(values, { abortEarly: false });

      const payload = {
        survey_name: values.surveyName.trim(),
        start_date: values.startDate,
        end_date: values.endDate,
        status: values.status === 1 ? "active" : "inactive",
      };

      const res = await updateSurvey(values.survey_id, payload);

      if (res?.error) {
        showSnackbar(Object.values(res.error).flat().join(" | "), "error");
        return;
      }

      showSnackbar("Survey updated successfully ✅", "success");
      setActiveTab(2);
    } catch (err) {
      showSnackbar("Fix validation errors before updating.", "error");
    } finally {
      actions.setSubmitting(false);
    }
  };

  // ✅ Delete Question
  const handleConfirmDelete = async (id: string | number): Promise<void> => {
    try {
      const res = await deleteSurveyQuestion(id);
      if (res?.error) {
        showSnackbar(res.data?.message || "Failed to delete question ❌", "error");
      } else {
        showSnackbar(res.message || "Question deleted successfully ✅", "success");
        setQuestions((prev) => prev.filter((q) => q.id !== id));
      }
    } catch (error) {
      console.error(error);
      showSnackbar("Error deleting question ❌", "error");
    }
  };

  // ✅ Update only edited questions
  const handleUpdateAllQuestions = async (): Promise<void> => {
    try {
      const editedQuestions = questions.filter((q) => q.edited);

      if (editedQuestions.length === 0) {
        showSnackbar("No changes to update ⚠️", "warning");
        return;
      }

      for (const q of editedQuestions) {
        if (!q.question_id) continue;

        const payload = {
          survey_id: surveyId?.toString() || "",
          question: q.question,
          question_type: mapQuestionType(q.question_type),
          question_based_selected: "",
        };

        if (
          typesWithOptions.includes(
            payload.question_type as (typeof typesWithOptions)[number]
          )
        ) {
          payload.question_based_selected = Array.isArray(q.question_based_selected)
            ? q.question_based_selected.join(",")
            : typeof q.question_based_selected === "string"
            ? q.question_based_selected
            : "";
        }

        await UpdateSurveyQuestion(q.question_id.toString(), payload);
      }

      showSnackbar("Edited questions updated successfully ✅", "success");
      setQuestions((prev) => prev.map((q) => ({ ...q, edited: false })));
    } catch (err) {
      console.error(err);
      showSnackbar("Failed to update questions ❌", "error");
    }
  };

  // ✅ Render tab content
  const renderTabContent = (
    values: SurveyFormValues,
    setFieldValue: FormikHelpers<SurveyFormValues>["setFieldValue"]
  ): JSX.Element | null => {
    switch (activeTab) {
      case 1:
        return (
          <ContainerCard>
            <h2 className="text-lg font-semibold mb-4">Update Survey</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <InputFields
                label="Survey Name"
                name="surveyName"
                value={values.surveyName}
                onChange={(e) => setFieldValue("surveyName", e.target.value)}
              />
              <InputFields
                label="Start Date"
                type="date"
                name="startDate"
                value={values.startDate}
                onChange={(e) => setFieldValue("startDate", e.target.value)}
              />
              <InputFields
                label="End Date"
                type="date"
                name="endDate"
                value={values.endDate}
                onChange={(e) => setFieldValue("endDate", e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <SidebarBtn
                label="Update Survey"
                isActive
                onClick={() =>
                  handleUpdateSurvey(values, {
                    setErrors: () => {},
                    setSubmitting: () => {},
                  } as unknown as FormikHelpers<SurveyFormValues>)
                }
              />
            </div>
          </ContainerCard>
        );

      case 2:
        return (
          <ContainerCard>
            <h2 className="text-lg font-semibold mb-4">Update Questions</h2>
            {questions.length === 0 ? (
              <p className="text-gray-500">No questions found for this survey.</p>
            ) : (
              <>
                {questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-5 items-end"
                  >
                    <InputFields
                      label="Question"
                      value={q.question}
                      onChange={(e) => {
                        const newQuestions = [...questions];
                        newQuestions[idx].question = e.target.value;
                        newQuestions[idx].edited = true;
                        setQuestions(newQuestions);
                      }}
                    />
                    <InputFields
                      label="Question Type"
                      type="select"
                      value={q.question_type}
                      options={questionTypes.map((type) => ({
                        value: type,
                        label: type,
                      }))}
                      onChange={(e) => {
                        const newQuestions = [...questions];
                        newQuestions[idx].question_type =
                          e.target.value as QuestionType;
                        newQuestions[idx].edited = true;
                        setQuestions(newQuestions);
                      }}
                    />
                    <button
                      type="button"
                      className="bg-white border border-gray-300 h-10 w-10 p-1 mt-9 rounded flex items-center justify-center hover:bg-gray-100 transition"
                      onClick={() => {
                        setQuestionToDelete(q);
                        setShowDeletePopup(true);
                      }}
                    >
                      <Icon icon="lucide:trash-2" width={22} height={22} />
                    </button>
                  </div>
                ))}
                <div className="flex justify-end mt-6">
                  <SidebarBtn
                    label="Update Question"
                    isActive
                    onClick={handleUpdateAllQuestions}
                  />
                </div>
              </>
            )}
          </ContainerCard>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full p-4">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/merchandiser/survey">
          <Icon icon="lucide:arrow-left" width={24} />
        </Link>
        <h1 className="text-xl font-semibold">Update Survey</h1>
      </div>

      <Formik enableReinitialize initialValues={initialValues} onSubmit={() => {}}>
        {({ values, setFieldValue }) => (
          <Form>
            <div className="flex gap-4 mb-4 border-b">
              {[{ id: 1, label: "Survey" }, { id: 2, label: "Questions" }].map(
                (tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 ${
                      activeTab === tab.id
                        ? "border-b-2 border-red-600 font-semibold"
                        : "text-gray-500"
                    }`}
                  >
                    {tab.label}
                  </button>
                )
              )}
            </div>
            {renderTabContent(values, setFieldValue)}
          </Form>
        )}
      </Formik>

      {showDeletePopup && questionToDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <DeleteConfirmPopup
            title="Survey Question"
            onClose={() => setShowDeletePopup(false)}
            onConfirm={() =>
              questionToDelete && handleConfirmDelete(questionToDelete.id)
            }
          />
        </div>
      )}
    </div>
  );
}
