"use client";

import React, { useEffect, useState } from "react";
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
  deleteSurveyQuestion
} from "@/app/services/allApi";

const questionTypes = ["comment box", "check box", "radio button", "textbox", "selectbox"];
const typesWithOptions = ["check box", "radio button", "selectbox"];

const stepSchemas = [
  Yup.object({
    surveyName: Yup.string().required("Survey Name is required."),
    startDate: Yup.date().required("Start Date is required").typeError("Invalid date"),
    endDate: Yup.date()
      .required("End Date is required")
      .typeError("Invalid date")
      .min(Yup.ref("startDate"), "End Date cannot be before Start Date"),
    status: Yup.string().required("Status is required."),
  }),
];

interface SurveyFormValues {
  surveyName: string;
  startDate: string;
  endDate: string;
  status: number;
  survey_id: string;
}

interface Question {
  id: number | string;
  question: string;
  question_type: string;
  survey_id: number | string;
  question_id: string;
  question_based_selected?: string | string[];
}

export default function UpdateSurveyTabs() {
  const router = useRouter();
  const params = useParams();
  const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null);

  const surveyId = params.id;
  const { showSnackbar } = useSnackbar();
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [activeTab, setActiveTab] = useState<number>(1);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [initialValues, setInitialValues] = useState<SurveyFormValues>({
    surveyName: "",
    startDate: "",
    endDate: "",
    status: 1,
    survey_id: "",
  });

  const mapQuestionType = (type: string) => {
    switch (type.toLowerCase()) {
      case "check box":
        return "check box";
      case "comment box":
        return "comment box";
      case "textbox":
        return "textbox";
      case "radio button":
        return "radio button";
      case "selectbox":
        return "selectbox";
      default:
        return type;
    }
  };

  useEffect(() => {
    if (!surveyId) return;

    const fetchData = async () => {
      try {
        if (activeTab === 2) {
          const questionsData = await getSurveyQuestionBySurveyId(surveyId.toString());
          console.log(questionsData)
          if (!questionsData || questionsData.length === 0) {
            showSnackbar("No questions found for this survey.", "warning");
          }
          type QuestionData = {
            id: number | string;
            question_id?: number | string;
            [key: string]: unknown;
          };

          const formattedQuestions = questionsData.map((q: QuestionData) => ({
            ...q,
            question_id: q.question_id || q.id,
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

  const handleUpdateSurvey = async (values: SurveyFormValues, actions: FormikHelpers<SurveyFormValues>) => {
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
      if (err instanceof Yup.ValidationError) {
        const errors: Record<string, string> = {};
        err.inner.forEach((e) => {
          if (e.path) errors[e.path] = e.message;
        });
        actions.setErrors(errors);
      }
      showSnackbar("Fix validation errors before updating.", "error");
    } finally {
      actions.setSubmitting(false);
    }
  };
const handleConfirmDelete = async (id: string | number) => { 


  try {
    const res = await deleteSurveyQuestion(id);

    if (res?.error) {
      showSnackbar(res.data?.message || "Failed to delete question ❌", "error");
    } else {
      showSnackbar(res.message || "Question deleted successfully ✅", "success");
      // Remove deleted question from state
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    }
  } catch (error) {
    console.error(error);
    showSnackbar("Error deleting question ❌", "error");
  }
};


const handleUpdateAllQuestions = async () => {
  try {
    for (const q of questions) {
      if (!q.question_id) continue;

      const payload = {
        survey_id: surveyId ? surveyId.toString() : "",
        question: q.question,
        question_type: mapQuestionType(q.question_type),
        question_based_selected: "",
      };

      // 👇 Correct logic — always send string (joined if array)
      if (typesWithOptions.includes(payload.question_type)) {
        payload.question_based_selected =
          Array.isArray(q.question_based_selected)
            ? q.question_based_selected.join(",")
            : typeof q.question_based_selected === "string"
            ? q.question_based_selected
            : "";
      }

      await UpdateSurveyQuestion(q.question_id, payload);
    }

    showSnackbar("Questions updated successfully ✅", "success");
    router.push("/merchandiser/survey");
  } catch (err) {
    console.error(err);
    showSnackbar("Failed to update questions ❌", "error");
  }
};

  const renderTabContent = (
    values: SurveyFormValues,
    setFieldValue: FormikHelpers<SurveyFormValues>["setFieldValue"]
  ) => {
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
              <InputFields
                label="Status"
                type="select"
                name="status"
                value={values.status === 1 ? "active" : "inactive"}
                onChange={(e) => setFieldValue("status", e.target.value === "active" ? 1 : 0)}
                options={[
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                ]}
              />
            </div>
               <div className="flex justify-end gap-4 mt-6">
                   <button
                                type="button"
                                onClick={() => router.push("/merchandiser/survey")}
                                className="px-6 py-2 rounded-lg  border border-gray-300 text-gray-700 hover:bg-gray-100"
                              >
                                Cancel
                              </button>
               
                     <SidebarBtn
                             type="button"
                              leadingIcon="mdi:check"
                            label=" Update"
                            labelTw="hidden sm:block" 
                            isActive
                               onClick={() =>
                handleUpdateSurvey(values, {
                  setErrors: () => {},
                  setSubmitting: () => {},
                } as Partial<FormikHelpers<SurveyFormValues>> as FormikHelpers<SurveyFormValues>)
              }
                          />,
                 
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
      <div key={q.id} className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
        <InputFields
          label="Question"
          name={`question-${idx}`}
          value={q.question}
          onChange={(e) => {
            const newQuestions = [...questions];
            newQuestions[idx].question = e.target.value;
            setQuestions(newQuestions);
          }}
        />
        <InputFields
          label="Question Type "
          type="select"
          name={`type-${idx}`}
          value={q.question_type}
          onChange={(e) => {
            const newQuestions = [...questions];
            newQuestions[idx].question_type = e.target.value;
            // Reset options if type changes to one without options
            if (!typesWithOptions.includes(e.target.value)) {
              newQuestions[idx].question_based_selected = "";
            } else if (
              !Array.isArray(newQuestions[idx].question_based_selected)
            ) {
              newQuestions[idx].question_based_selected = [""];
            }
            setQuestions(newQuestions);
          }}
          options={questionTypes.map((type) => ({
            value: type,
            label: type.charAt(0).toUpperCase() + type.slice(1),
          }))}
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
        {typesWithOptions.includes(q.question_type) && (
          <div className="col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Options
            </label>
            <div className="flex flex-wrap gap-3">
              {(Array.isArray(q.question_based_selected)
                ? q.question_based_selected
                : typeof q.question_based_selected === "string" && q.question_based_selected
                ? q.question_based_selected.split(",")
                : []
              ).map((opt, optIdx) => (
                <input
                  key={optIdx}
                  type="text"
                  value={opt}
                  onChange={(e) => {
                    const newQuestions = [...questions];
                    let optionsArr: string[] = [];
                    if (Array.isArray(newQuestions[idx].question_based_selected)) {
                      optionsArr = [...newQuestions[idx].question_based_selected];
                    } else if (
                      typeof newQuestions[idx].question_based_selected === "string" &&
                      newQuestions[idx].question_based_selected
                    ) {
                      optionsArr = newQuestions[idx].question_based_selected.split(",");
                    }
                    optionsArr[optIdx] = e.target.value;
                    newQuestions[idx].question_based_selected = optionsArr;
                    setQuestions(newQuestions);
                  }}
                  className="border border-gray-300 rounded-lg px-3 h-11 py-2 w-[395px] "
                  placeholder={`Option ${optIdx + 1}`}
                />
              ))}
              <button
  type="button"
  onClick={() => {
    const newQuestions = [...questions];
    let optionsArr: string[] = [];
    if (Array.isArray(newQuestions[idx].question_based_selected)) {
      optionsArr = [...newQuestions[idx].question_based_selected];
    } else if (
      typeof newQuestions[idx].question_based_selected === "string" &&
      newQuestions[idx].question_based_selected
    ) {
      optionsArr = newQuestions[idx].question_based_selected.split(",");
    }

    if (optionsArr.length >= 6) {
      showSnackbar("Maximum of 6 options allowed ❌", "warning");
      return;
    }

    optionsArr.push("");
    newQuestions[idx].question_based_selected = optionsArr;
    setQuestions(newQuestions);
  }}
  className="px-3 py-2 border border-dashed border-gray-400 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
>
  + Add Option
</button>

            </div>
          </div>
        )}
      </div>
    ))}



                <div className="flex justify-end gap-4 mt-6">
                   <button
                                type="button"
                                onClick={() => router.push("/merchandiser/survey")}
                                className="px-6 py-2 rounded-lg  border border-gray-300 text-gray-700 hover:bg-gray-100"
                              >
                                Cancel
                              </button>
               
                     <SidebarBtn
                             type="button"
                              leadingIcon="mdi:check"
                            label="Update Question"
                            labelTw="hidden sm:block"
                            isActive
                               onClick={handleUpdateAllQuestions}
                          />,
                 
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
        {(formikHelpers) => {
          const { values, setFieldValue } = formikHelpers;
          return (
            <Form>
              <div className="flex gap-4 mb-4 border-b">
                {[{ id: 1, label: "Survey" }, { id: 2, label: "Questions" }].map((tab) => (
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
                ))}
              </div>
              {renderTabContent(values, setFieldValue)}
            </Form>
          );
        }}
      </Formik>
       {showDeletePopup && questionToDelete && (
  <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
    <DeleteConfirmPopup
      title="Survey Question"
      onClose={() => setShowDeletePopup(false)}
      onConfirm={() => questionToDelete && handleConfirmDelete(questionToDelete.id)} // fixed argument
    />
  </div>
)}
    </div>
  );
}