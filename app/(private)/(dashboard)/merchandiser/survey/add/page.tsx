"use client";

import React from "react";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Formik, Form, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";
import ContainerCard from "@/app/components/containerCard";
import InputFields from "@/app/components/inputFields";
import { useSnackbar } from "@/app/services/snackbarContext";
import IconButton from "@/app/components/iconButton";
import SettingPopUp from "@/app/components/settingPopUp";
import { addSurvey, addSurveyQuestion } from "@/app/services/allApi";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";

// ✅ Question type definitions
const typesWithOptions = ["check box", "radio", "selectbox"];
const questionTypes = ["comment box", "check box", "radio", "textbox", "selectbox"];

// ✅ Validation Schemas
const stepSchemas = [
  Yup.object({
    surveyName: Yup.string().required("Survey Name is required."),
    surveyCode: Yup.string().required("Survey Code is required."),
    startDate: Yup.date()
      .required("Start Date is required")
      .typeError("Invalid date"),
    endDate: Yup.date()
      .required("End Date is required")
      .typeError("Invalid date")
      .min(Yup.ref("startDate"), "End Date cannot be before Start Date"),
    status: Yup.string().required("Status is required."),
  }),
  Yup.object({
    question: Yup.string().required("Question is required"),
    questionType: Yup.string().required("Question type is required"),
    options: Yup.array().when("questionType", {
      is: (type: string) => typesWithOptions.includes(type),
      then: (schema) =>
        schema
          .of(Yup.string().required("Option cannot be empty"))
          .min(1, "At least one option is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
  }),
];

// ✅ Form Type
type SurveyFormValues = {
  surveyCode: string;
  surveyName: string;
  startDate: string;
  endDate: string;
  status: string;
  question: string;
  questionType: string;
  survey_id: string;
  options: string[];
};

export default function AddSurveyTabs() {
  const { showSnackbar } = useSnackbar();
  const router = useRouter();

  const [isOpen, setIsOpen] = React.useState(false);
  const [createdSurveyId, setCreatedSurveyId] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<number>(1);
  const [questions, setQuestions] = React.useState<
    {
      survey_id: string;
      question: string;
      questionType: string;
      options: string[];
    }[]
  >([{ survey_id: "", question: "", questionType: "", options: [""] }]);

  const tabs = [
    { id: 1, label: "Create Survey" },
    { id: 2, label: "Add Question" },
  ];

  const initialValues: SurveyFormValues = {
    surveyCode: "",
    surveyName: "",
    startDate: "",
    endDate: "",
    status: "",
    question: "",
    questionType: "",
    survey_id: "",
    options: [],
  };

  // ✅ Create Survey
  const handleCreateSurvey = async (
    values: SurveyFormValues,
    actions: FormikHelpers<SurveyFormValues>
  ) => {
    try {
      await stepSchemas[0].validate(values, { abortEarly: false });
      const payload = {
        survey_code: values.surveyCode.trim(),
        survey_name: values.surveyName.trim(),
        start_date: values.startDate,
        end_date: values.endDate,
        status: values.status,
      };
      const res = await addSurvey(payload);

      if (res?.error) {
        showSnackbar(Object.values(res.error).flat().join(" | "), "error");
        return;
      }

      setCreatedSurveyId(res.data.id.toString());
      showSnackbar("Survey created successfully ✅", "success");
      setActiveTab(2);
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const errors = err.inner.reduce(
          (acc, curr) => ({ ...acc, [curr.path!]: curr.message }),
          {} as Record<string, string>
        );
        actions.setErrors(errors);
      }
      showSnackbar("Please fix validation errors before proceeding.", "error");
    } finally {
      actions.setSubmitting(false);
    }
  };

  // ✅ Add Question API
  const handleAddQuestion = async (
    values: SurveyFormValues,
    actions: FormikHelpers<SurveyFormValues>
  ) => {
    try {
      if (!createdSurveyId) {
        showSnackbar("Please create a survey first.", "error");
        return;
      }

      for (const q of questions) {
        await stepSchemas[1].validate(q, { abortEarly: false });

        const payload = { survey_id: Number(values.survey_id), question: values.question, question_type: values.questionType as | "checkbox" | "radio" | "textbox" | "selectbox" | "commentbox", question_based_selected: typesWithOptions.includes(values.questionType) ? values.options.join(",") : undefined, };

        await addSurveyQuestion(payload);
      }

      showSnackbar("All questions added successfully ✅", "success");
      router.push("/merchandiser/survey");
    } catch (err) {
      showSnackbar("Please check all question fields carefully.", "error");
    } finally {
      actions.setSubmitting(false);
    }
  };

  // ✅ Add another question UI block
  const handleAddNewQuestion = () => {
    setQuestions([
      ...questions,
      { survey_id: "", question: "", questionType: "", options: [""] },
    ]);
  };

  // ✅ Dynamic Tab Renderer
  const renderTabContent = (
    values: SurveyFormValues,
    setFieldValue: FormikHelpers<SurveyFormValues>["setFieldValue"],
    formikHelpers: FormikHelpers<SurveyFormValues>
  ) => {
    switch (activeTab) {
      case 1:
        return (
          <ContainerCard>
            <h2 className="text-lg font-semibold mb-4">Survey Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="flex flex-col gap-1 max-w-[406px]">
                <div className="flex items-start gap-2">
                  <InputFields
                    label="Survey Code"
                    name="surveyCode"
                    value={values.surveyCode}
                    onChange={(e) => setFieldValue("surveyCode", e.target.value)}
                  />
                  <IconButton
                    bgClass="white"
                    className="cursor-pointer text-[#252B37] pt-12"
                    icon="mi:settings"
                    onClick={() => setIsOpen(true)}
                  />
                  <SettingPopUp
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                    title="Survey Code"
                  />
                </div>
                <ErrorMessage name="surveyCode" component="span" className="text-xs text-red-500" />
              </div>

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
                name="status"
                value={values.status}
                onChange={(e) => setFieldValue("status", e.target.value)}
                type="select"
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
                className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <SidebarBtn
                type="button"
                leadingIcon="mdi:check"
                label="Create Survey"
                labelTw="hidden sm:block"
                isActive
                onClick={() => handleCreateSurvey(values, formikHelpers)}
              />
            </div>
          </ContainerCard>
        );

      case 2:
        return (
          <ContainerCard>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold">Add Questions</h2>
                <p className="text-gray-500 text-sm">
                  Survey Name:{" "}
                  <span className="font-medium text-gray-700">
                    {values.surveyName || "Unnamed Survey"}
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleAddQuestion(values, formikHelpers)}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-medium"
              >
                Submit
              </button>
            </div>

            <div className="space-y-6">
              {questions.map((q, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
                  <h3 className="text-base font-semibold mb-4">Question {index + 1}</h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="md:col-span-2">
                      <InputFields
                        label="Question"
                        name={`question_${index}`}
                        value={q.question}
                        onChange={(e) => {
                          const newQs = [...questions];
                          newQs[index].question = e.target.value;
                          setQuestions(newQs);
                        }}
                      />
                    </div>
                    <div>
                      <InputFields
                        label="Question Type"
                        name={`questionType_${index}`}
                        value={q.questionType}
                        onChange={(e) => {
                          const newQs = [...questions];
                          newQs[index].questionType = e.target.value;
                          newQs[index].options =
                            typesWithOptions.includes(e.target.value) ? [""] : [];
                          setQuestions(newQs);
                        }}
                        type="select"
                        options={questionTypes.map((type) => ({
                          value: type,
                          label: type,
                        }))}
                      />
                    </div>
                  </div>

                  {/* ✅ Dynamic Options / Preview */}
                  {(() => {
                    if (typesWithOptions.includes(q.questionType)) {
                      return (
                        <div className="mt-5">
                          <h3 className="text-sm font-semibold mb-2">Enter the options</h3>

                          <div className="flex flex-col gap-3">
                            {q.options.map((opt, optIndex) => (
                              <div key={optIndex} className="flex items-center gap-3">
                                {q.questionType === "check box" && (
                                  <input type="checkbox" disabled className="accent-red-600" />
                                )}
                                {q.questionType === "radio" && (
                                  <input type="radio" disabled className="accent-red-600" />
                                )}

                                <input
                                  type="text"
                                  value={opt}
                                  onChange={(e) => {
                                    const newQs = [...questions];
                                    newQs[index].options[optIndex] = e.target.value;
                                    setQuestions(newQs);
                                  }}
                                  placeholder={`Option ${optIndex + 1}`}
                                  className="border border-gray-300 rounded-lg px-3 py-2 w-[300px] focus:ring-2 focus:ring-red-500 focus:outline-none"
                                />

                                <button
                                  type="button"
                                  onClick={() => {
                                    const newQs = [...questions];
                                    newQs[index].options.splice(optIndex, 1);
                                    setQuestions(newQs);
                                  }}
                                  className="text-gray-500 hover:text-red-600 transition-all"
                                >
                                  <Icon icon="lucide:x" width={22} height={22} />
                                </button>
                              </div>
                            ))}

                            {q.options.length < 6 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const newQs = [...questions];
                                  newQs[index].options.push("");
                                  setQuestions(newQs);
                                }}
                                className="flex items-center gap-1 text-red-600 font-medium hover:underline mt-2"
                              >
                                <Icon icon="lucide:plus-circle" width={18} height={18} />
                                Add option
                              </button>
                            )}

                            {q.questionType === "selectbox" && (
                              <div className="mt-4">
                                <h4 className="text-sm font-semibold mb-1">Preview:</h4>
                                <select
                                  disabled
                                  className="border border-gray-300 rounded-lg px-3 py-2 w-[300px] bg-gray-50"
                                >
                                  {q.options
                                    .filter((opt) => opt.trim() !== "")
                                    .map((opt, i) => (
                                      <option key={i}>{opt}</option>
                                    ))}
                                </select>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }

                    if (["textbox", "comment box"].includes(q.questionType)) {
                      return (
                        <div className="mt-5">
                          <h3 className="text-sm font-semibold mb-2">Preview</h3>
                          <input
                            type="text"
                            disabled
                            placeholder={
                              q.questionType === "textbox"
                                ? "User will type here..."
                                : "User will write a comment..."
                            }
                            className="border border-gray-300 rounded-lg px-3 py-2 w-[400px] bg-gray-50"
                          />
                        </div>
                      );
                    }

                    return null;
                  })()}
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddNewQuestion}
                className="flex items-center gap-1 text-red-600 font-medium hover:underline"
              >
                <Icon icon="lucide:plus-circle" width={18} height={18} />
                Add New Question
              </button>
            </div>
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
        <h1 className="text-xl font-semibold">Add New Survey</h1>
      </div>

      <Formik initialValues={initialValues} onSubmit={() => {}}>
        {(formikHelpers) => {
          const { values, setFieldValue } = formikHelpers;

          return (
            <Form>
              <div className="flex gap-4 mb-4 border-b">
                {tabs.map((tab) => (
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

              {renderTabContent(values, setFieldValue, formikHelpers)}
            </Form>
          );
        }}
      </Formik>
    </div>
  );
}
