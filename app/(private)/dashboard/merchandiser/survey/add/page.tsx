"use client";

import React from "react";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Formik, Form, FieldArray, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";
import ContainerCard from "@/app/components/containerCard";
import InputFields from "@/app/components/inputFields";
import { useSnackbar } from "@/app/services/snackbarContext";
import IconButton from "@/app/components/iconButton";
import SettingPopUp from "@/app/components/settingPopUp";
import { addSurvey, addSurveyQuestion } from "@/app/services/allApi";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";

// Question types
const typesWithOptions = ["check box", "radio", "selectbox"];
const questionTypes = ["comment box", "check box", "radio", "textbox", "selectbox"];

// Step-wise validation
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
  const { surveyOptions } = useAllDropdownListData();
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const [isOpen, setIsOpen] = React.useState(false);
  const [createdSurveyId, setCreatedSurveyId] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<number>(1);

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
        const touched = err.inner.reduce(
          (acc, curr) => ({ ...acc, [curr.path!]: true }),
          {} as Record<string, boolean>
        );
        const errors = err.inner.reduce(
          (acc, curr) => ({ ...acc, [curr.path!]: curr.message }),
          {} as Record<string, string>
        );
        actions.setTouched(touched);
        actions.setErrors(errors);
      }
      showSnackbar("Please fix validation errors before proceeding.", "error");
    } finally {
      actions.setSubmitting(false);
    }
  };

 const handleAddQuestion = async (
  values: SurveyFormValues,
  actions: FormikHelpers<SurveyFormValues>
) => {
  try {
    if (!values.survey_id) {
      showSnackbar("Please select a survey first.", "error");
      return;
    }

    await stepSchemas[1].validate(values, { abortEarly: false });

    const payload = {
      survey_id: Number(values.survey_id),
      question: values.question,
      question_type: values.questionType as
        | "checkbox"
        | "radio"
        | "textbox"
        | "selectbox"
        | "commentbox",
      question_based_selected: typesWithOptions.includes(values.questionType)
        ? values.options.join(",")
        : undefined,
    };

    const res = await addSurveyQuestion(payload);

    if (res?.errors) {
      showSnackbar(Object.values(res.errors).flat().join(" | "), "error");
      return;
    }

    showSnackbar("Question added successfully ✅", "success");
    router.push("/dashboard/merchandiser/survey");
  } catch (err) {
    if (err instanceof Yup.ValidationError) {
      const touched = err.inner.reduce(
        (acc, curr) => ({ ...acc, [curr.path!]: true }),
        {} as Record<string, boolean>
      );
      const errors = err.inner.reduce(
        (acc, curr) => ({ ...acc, [curr.path!]: curr.message }),
        {} as Record<string, string>
      );
      actions.setTouched(touched);
      actions.setErrors(errors);
    }
    showSnackbar("Please fix validation errors before submitting.", "error");
  } finally {
    actions.setSubmitting(false);
  }
};


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
                <div className="flex items-end gap-2">
                  <InputFields
                    label="Survey Code"
                    name="surveyCode"
                    value={values.surveyCode}
                    onChange={(e) => setFieldValue("surveyCode", e.target.value)}
                  />
                  <IconButton
                    bgClass="white"
                    className="mb-2 cursor-pointer text-[#252B37]"
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

              <div>
                <InputFields
                  label="Survey Name"
                  name="surveyName"
                  value={values.surveyName}
                  onChange={(e) => setFieldValue("surveyName", e.target.value)}
                />
                <ErrorMessage name="surveyName" component="span" className="text-xs text-red-500" />
              </div>

              <div>
                <InputFields
                  label="Start Date"
                  type="date"
                  name="startDate"
                  value={values.startDate}
                  onChange={(e) => setFieldValue("startDate", e.target.value)}
                />
                <ErrorMessage name="startDate" component="span" className="text-xs text-red-500" />
              </div>

              <div>
                <InputFields
                  label="End Date"
                  type="date"
                  name="endDate"
                  value={values.endDate}
                  onChange={(e) => setFieldValue("endDate", e.target.value)}
                />
                <ErrorMessage name="endDate" component="span" className="text-xs text-red-500" />
              </div>

              <div>
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
                <ErrorMessage name="status" component="span" className="text-xs text-red-500" />
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleCreateSurvey(values, formikHelpers)}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
            >
              Create Survey & Go to Questions
            </button>
          </ContainerCard>
        );

      case 2:
        return (
          <ContainerCard>
            <h2 className="text-lg font-semibold mb-4">Add Question</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <InputFields
                  label="Question"
                  name="question"
                  value={values.question}
                  onChange={(e) => setFieldValue("question", e.target.value)}
                />
                <ErrorMessage name="question" component="span" className="text-xs text-red-500" />
              </div>

              <div>
                <InputFields
                  label="Survey Id"
                  name="survey_id"
                  value={values.survey_id}
                  onChange={(e) => setFieldValue("survey_id", e.target.value)}
                  type="select"
                  options={surveyOptions}
                />
                <ErrorMessage name="survey_id" component="span" className="text-xs text-red-500" />
              </div>

              <div>
                <InputFields
                  label="Question Type"
                  name="questionType"
                  value={values.questionType}
                  onChange={(e) => setFieldValue("questionType", e.target.value)}
                  type="select"
                  options={questionTypes.map((type) => ({ value: type, label: type }))}
                />
                <ErrorMessage name="questionType" component="span" className="text-xs text-red-500" />
              </div>

              {typesWithOptions.includes(values.questionType) && (
                <div className="col-span-3">
                  <h3 className="text-sm font-semibold mb-2">Options</h3>
                  <FieldArray
                    name="options"
                    render={(arrayHelpers) => (
                      <div className="flex flex-col gap-2">
                        {values.options.map((opt, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => setFieldValue(`options.${index}`, e.target.value)}
                              className="border border-gray-300 rounded px-2 py-1 w-[400px] h-[44px]"
                            />
                            <button
                              type="button"
                              onClick={() => arrayHelpers.remove(index)}
                              className="bg-red-500 text-white p-1 rounded"
                            >
                              <Icon icon="lucide:x" width={25} height={25} />
                            </button>
                          </div>
                        ))}
                        {values.options.length < 6 && (
                          <button
                            type="button"
                            onClick={() => arrayHelpers.push("")}
                            className="px-2 py-2 mt-2 bg-red-600 text-white rounded w-32"
                          >
                            + Add Option
                          </button>
                        )}
                      </div>
                    )}
                  />
                  <ErrorMessage name="options" component="span" className="text-xs text-red-500" />
                </div>
              )}
            </div>

              <button
                type="button"
                onClick={() => handleAddQuestion(values, formikHelpers)}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
              >
                Submit Question
              </button>
              
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
                      activeTab === tab.id ? "border-b-2 border-red-600 font-semibold" : "text-gray-500"
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
