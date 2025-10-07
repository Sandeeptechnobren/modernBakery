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
import {
  getSurveyById,
  updateSurvey,
  UpdateSurveyQuestion,
  getSurveyQuestionBySurveyId,
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
  question: string;
  question_type: string;
  survey_id: number | string;
  question_id: string;
  question_based_selected?: string;
}

export default function UpdateSurveyTabs() {
  const router = useRouter();
  const params = useParams();
  const surveyId = params.id;
  const { showSnackbar } = useSnackbar();

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

  const handleUpdateAllQuestions = async () => {
    try {
      for (const q of questions) {
        if (!q.question_id) continue;

        const payload: {
          survey_id: string,
          question: string,
          question_type: string,
          question_based_selected?: string,
        } = {
          survey_id: (surveyId ? surveyId.toString() : ""),
          question: q.question,
          question_type: mapQuestionType(q.question_type),
        };

        // Only send question_based_selected if question type requires options
        if (typesWithOptions.includes(payload.question_type) && q.question_based_selected) {
          payload.question_based_selected = q.question_based_selected;
        }

        await UpdateSurveyQuestion(q.question_id, payload);
      }
      showSnackbar("All questions updated successfully ✅", "success");
      router.push("/dashboard/merchandiser/survey");
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
            <button
              type="button"
              onClick={() =>
                handleUpdateSurvey(values, {
                  setErrors: () => {},
                  setSubmitting: () => {},
                } as Partial<FormikHelpers<SurveyFormValues>> as FormikHelpers<SurveyFormValues>)
              }
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
            >


              Update Survey & Go to Questions
            </button>
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
                  <div key={idx} className="grid grid-cols-2 gap-4 mb-4">
                    <InputFields
                      label={`Question ${idx + 1}`}
                      name={`question-${idx}`}
                      value={q.question}
                      onChange={(e) => {
                        const newQuestions = [...questions];
                        newQuestions[idx].question = e.target.value;
                        setQuestions(newQuestions);
                      }}
                    />
                    <InputFields
                      label="Question Type"
                      type="select"
                      name={`questionType-${idx}`}
                      value={q.question_type}
                      onChange={(e) => {
                        const newQuestions = [...questions];
                        newQuestions[idx].question_type = e.target.value;
                        setQuestions(newQuestions);
                      }}
                      options={questionTypes.map((t) => ({ value: t, label: t }))}
                    />
                  </div>
                ))}
                <div className="flex justify-end mt-6">
                  <button
                    type="button"
                    className="bg-red-600 text-white px-5 py-2 rounded-lg"
                    onClick={handleUpdateAllQuestions}
                  >
                    Update All Questions
                  </button>
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
        <Link href="/dashboard/merchandiser/survey">
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
    </div>
  );
}
