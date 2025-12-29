"use client";

import React, { useEffect, useState } from "react";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Formik, Form, ErrorMessage, FormikHelpers, FormikProps } from "formik";
import * as Yup from "yup";
import ContainerCard from "@/app/components/containerCard";
import InputFields from "@/app/components/inputFields";
import { useSnackbar } from "@/app/services/snackbarContext";
// IconButton and SettingPopUp removed - not used in this page
import {
  addSurvey,
  updateSurvey,
  addSurveyQuestion,
  getSurveyById,
  getSurveyQuestionBySurveyId,
  UpdateSurveyQuestion,
  deleteSurveyQuestion,
  merchendiserList,
} from "@/app/services/allApi";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { useLoading } from "@/app/services/loadingContext";
import TabBtn from "@/app/components/tabBtn";
import CustomCheckbox from "@/app/components/customCheckbox";
import { shelvesDropdown } from "@/app/services/merchandiserApi";

//  Question type definitions (match update page)
const typesWithOptions = ["check box", "radio button", "selectbox"];
const questionTypes = [
  "comment box",
  "check box",
  "radio button",
  "textbox",
  "selectbox",
];

// Normalize incoming API question_type to our UI labels
const normalizeQuestionType = (type: string): (typeof questionTypes)[number] => {
  const t = (type || "").toLowerCase();
  if (t.includes("radio")) return "radio button";
  if (t.includes("check")) return "check box";
  if (t.includes("comment")) return "comment box";
  if (t.includes("select")) return "selectbox";
  return "textbox";
};

// Map UI question type labels to the API-expected labels (per your spec)
const mapQuestionTypeForApi = (
  type: string
): "check box" | "radio button" | "textbox" | "selectbox" | "comment box" => {
  const t = (type || "").toLowerCase();
  if (t.includes("radio")) return "radio button";
  if (t.includes("check")) return "check box";
  if (t.includes("comment")) return "comment box";
  if (t.includes("select")) return "selectbox";
  return "textbox";
};

// Status helpers: UI uses "1" for active and "0" for inactive in the select input.
const mapStatusForApi = (statusOption: string): "active" | "inactive" => {
  return statusOption === "1" ? "active" : "inactive";
};

const normalizeStatusOption = (status: any): string => {
  // incoming status may be 'active'/'inactive' or 1/0 or '1'/'0'
  if (status === 1 || status === "1" || String(status).toLowerCase() === "active") return "1";
  return "0";
};

// Generate a short random survey question code (used when adding/updating questions)
const generateSurveyQuestionCode = (): string => {
  // e.g. SQ-5FJ8K2ZM
  return "SQ-" + Math.random().toString(36).slice(2, 10).toUpperCase();
};

//  Validation Schemas
const stepSchemas = [
  Yup.object({
    surveyName: Yup.string().required("Survey Name is required."),
    // surveyCode: Yup.string().required("Survey Code is required."),
    startDate: Yup.date()
      .required("Start Date is required")
      .typeError("Invalid date"),
    endDate: Yup.date()
      .required("End Date is required")
      .typeError("Invalid date")
      .min(Yup.ref("startDate"), "End Date cannot be before Start Date"),
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

//  Form Type
type SurveyFormValues = {
  surveyCode: string;
  surveyName: string;
  startDate: string;
  endDate: string;
  status: string;
  survey_type?: string;
  merchendisher_id: number[];
  customer_id: number[];
  asset_id: number[];
  question: string;
  questionType: string;
  survey_id: string;
  options: string[];
};

type MerchandiserResponse = { id: number; name: string };
type CustomerFromBackend = {
  id: number;
  customer_code: string;
  business_name: string;
  merchendisher_id?: string;
};
type CustomerOption = {
  value: string;
  label: string;
  merchendisher_id: string;
  id: string;
};

export default function AddSurveyTabs() {
  const { showSnackbar } = useSnackbar();
  const { setLoading } = useLoading();
  const router = useRouter();
  const params = useParams();
  const routeId = (params as { id?: string })?.id ?? "";

  // isEditMode will be true when route id is NOT `add` (i.e. editing an existing survey)
  const isEditMode = routeId !== "add" && routeId !== "";

  const [isOpen, setIsOpen] = React.useState(false);
  const [createdSurveyId, setCreatedSurveyId] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<number>(1);
  // when true, questions are shown in preview (read-only) mode; when false they're editable
  const [isPreviewMode, setIsPreviewMode] = React.useState<boolean>(false);
  const [savingQuestionIndex, setSavingQuestionIndex] = React.useState<number | null>(null);
  const [savingAll, setSavingAll] = React.useState<boolean>(false);
  const { chillerOptions, ensureChillerLoaded } = useAllDropdownListData();
  const [questionErrors, setQuestionErrors] = React.useState<Record<number, Record<string, string>>>({});
  const [merchendiserOptions, setMerchendiserOptions] = useState<
    CustomerOption[]
  >([]);
  const [customerOptions, setCustomerOptions] = useState<CustomerOption[]>([]);
  const [questions, setQuestions] = React.useState<
    {
      survey_id: string;
      question: string;
      questionType: string;
      options: string[];
      survey_question_code?: string;
      question_id?: string | number;
      editable?: boolean;
    }[]
  >([{ survey_id: "", question: "", questionType: "", options: [""], survey_question_code: generateSurveyQuestionCode(), editable: true }]);

  const tabs = [
    // labels depend on mode
    ...(isEditMode
      ? [
        { id: 1, label: "Update Survey" },
        // keep second tab labeled "Add Question" even in edit mode
        { id: 2, label: "Add Question" },
      ]
      : [
        { id: 1, label: "Create Survey" },
        { id: 2, label: "Add Question" },
      ]),
  ];

  const [initialValues, setInitialValues] = React.useState<SurveyFormValues>({
    surveyCode: "",
    surveyName: "",
    startDate: "",
    endDate: "",
    status: "",
    survey_type: "",
    merchendisher_id: [],
    customer_id: [],
    asset_id: [],
    question: "",
    questionType: "",
    survey_id: "",
    options: [],
  });

  useEffect(() => {
    ensureChillerLoaded();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const merchRes = await merchendiserList();
        const merchOptions =
          merchRes.data?.map((m: MerchandiserResponse) => ({
            value: String(m.id),
            label: m.name,
          })) || [];

        setMerchendiserOptions(merchOptions);
      } catch (err) {
        showSnackbar("Unable to fetch merchandisers", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [showSnackbar]);


  const fetchCustomers = async (merchIds: number[]) => {
    if (!merchIds.length) {
      setCustomerOptions([]);
      return;
    }
    try {
      const response = await shelvesDropdown({
        merchandiser_id: merchIds.map(String),
      });

      const customerOptions: CustomerOption[] = response.data.map(
        (customer: CustomerFromBackend) => ({
          value: String(customer.id),
          label: formatCustomerLabel(customer),
          merchendisher_id: customer.merchendisher_id || "",
          id: String(customer.id),
        })
      );

      setCustomerOptions(customerOptions);
    } catch (err) {
      console.error(err);
      showSnackbar("Unable to fetch customers", "error");
    }
  };

  const formatCustomerLabel = (customer: CustomerFromBackend): string => {
    return `${customer.customer_code || ""} - ${customer.business_name || ""}`;
  };

  // Fetch survey and questions when in edit mode
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        if (isEditMode) {
          setLoading(true);
          const res = await getSurveyById(routeId.toString());
          const surveyData = res?.data?.data || res?.data;
          setLoading(false);

          if (surveyData) {
            setInitialValues((prev) => ({
              ...prev,
              surveyCode: surveyData.survey_code || "",
              surveyName: surveyData.survey_name || "",
              startDate: surveyData.start_date?.split("T")[0] || "",
              endDate: surveyData.end_date?.split("T")[0] || "",
              merchendisher_id: Array.isArray(surveyData.merchendisher_id)
                ? surveyData.merchendisher_id.map(Number)
                : [],

              customer_id: Array.isArray(surveyData.customer_id)
                ? surveyData.customer_id.map(Number)
                : [],
              asset_id: Array.isArray(surveyData.asset_id)
                ? surveyData.asset_id.map(Number)
                : [],
              survey_id: routeId.toString(),
              survey_type: surveyData.survey_type || "",
            }));

            setCreatedSurveyId(routeId.toString());
          }

          // fetch questions for this survey
          setLoading(true);
          const qs = await getSurveyQuestionBySurveyId(routeId.toString());
          setLoading(false);

          if (qs && Array.isArray(qs)) {
            const formatted = qs.map((q: any) => ({
              survey_id: q.survey_id?.toString() || routeId.toString(),
              question: q.question || "",
              questionType: normalizeQuestionType(q.question_type || q.question_type || ""),
              survey_question_code:
                q.survey_question_code || q.question_code || q.code || generateSurveyQuestionCode(),
              options: q.question_based_selected
                ? String(q.question_based_selected).split(",").map((o: string) => o)
                : [],
              // existing questions loaded from API should be read-only by default
              editable: false,
              question_id: q.question_id || q.id || undefined,
            }));

            setQuestions(
              formatted.length
                ? formatted
                : [
                  {
                    survey_id: "",
                    question: "",
                    questionType: "",
                    options: [""],
                    survey_question_code: generateSurveyQuestionCode(),
                    editable: true,
                  },
                ]
            );
            // show preview mode when editing existing survey with questions
            if (formatted.length) setIsPreviewMode(true);
          }
        }
      } catch (err) {
        showSnackbar("Failed to load survey for editing.", "error");
      }
    };

    fetchData();
  }, [isEditMode, routeId]);

  //  Create Survey
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
        survey_type: values.survey_type,
        merchendisher_id: values.merchendisher_id,
        customer_id: values.customer_id,
        asset_id: values.asset_id,
        status: mapStatusForApi(values.status),
      };

      setLoading(true);

      const res = isEditMode
        ? await updateSurvey(routeId.toString(), payload)
        : await addSurvey(payload);

      setLoading(false);

      if (res?.error) {
        showSnackbar("Failed to save survey", "error");
        return;
      }

      const surveyId = isEditMode
        ? routeId.toString()
        : res.data.id.toString();

      setCreatedSurveyId(surveyId);

      showSnackbar(
        isEditMode ? "Survey updated successfully" : "Survey created successfully",
        "success"
      );

      setActiveTab(2);
    } catch (err: any) {
      if (err instanceof Yup.ValidationError) {
        const errors = err.inner.reduce(
          (acc: any, curr: any) => ({ ...acc, [curr.path]: curr.message }),
          {}
        );
        actions.setErrors(errors);
        actions.setTouched(
          Object.keys(errors).reduce((a: any, k) => ({ ...a, [k]: true }), {})
        );
      }
    } finally {
      actions.setSubmitting(false);
    }
  };


  //  Add Question API
  const handleAddQuestion = async (
    values: SurveyFormValues,
    actions: FormikHelpers<SurveyFormValues>
  ) => {
    try {
      if (!createdSurveyId) {
        showSnackbar("Please create a survey first.", "error");
        return;
      }

      // ✅ Validate all questions first (NO API CALL YET)
      for (const [idx, q] of questions.entries()) {
        try {
          await stepSchemas[1].validate(q, { abortEarly: false });
        } catch (err: any) {
          if (err instanceof Yup.ValidationError) {
            const map: Record<string, string> = {};
            err.inner.forEach((e: any) => {
              if (!e.path) return;
              if (e.path.startsWith("options")) {
                map.options = e.message;
              } else {
                map[e.path] = e.message;
              }
            });
            setQuestionErrors((prev) => ({ ...prev, [idx]: map }));
            return;
          }
        }
      }

      // ✅ BUILD FINAL PAYLOAD (THIS IS THE MAGIC)
      const payload = buildSurveyQuestionsPayload(
        createdSurveyId,
        questions
      );

      console.log("FINAL PAYLOAD 🔥", payload);

      // ✅ SINGLE API CALL
      await addSurveyQuestion(payload as any);

      showSnackbar("Questions added successfully", "success");
      router.push("/survey");
    } catch (err) {
      showSnackbar("Please check all question fields carefully.", "error");
    } finally {
      actions.setSubmitting(false);
    }
  };


  // Save questions without navigating away — used for Save -> Preview flow
  const handleSaveQuestions = async (
    values: SurveyFormValues,
    redirectAfter = true
  ): Promise<boolean> => {
    setSavingAll(true);

    try {
      if (!createdSurveyId) {
        showSnackbar("Please create a survey first.", "error");
        return false;
      }

      // ✅ Validate all questions
      for (const [idx, q] of questions.entries()) {
        try {
          await stepSchemas[1].validate(q, { abortEarly: false });
        } catch (err: any) {
          if (err instanceof Yup.ValidationError) {
            const map: Record<string, string> = {};
            err.inner.forEach((e: any) => {
              if (!e.path) return;
              if (e.path.startsWith("options")) {
                map.options = e.message;
              } else {
                map[e.path] = e.message;
              }
            });
            setQuestionErrors((prev) => ({ ...prev, [idx]: map }));
            return false;
          }
        }
      }

      // ✅ FINAL PAYLOAD
      const payload = buildSurveyQuestionsPayload(
        createdSurveyId,
        questions
      );

      console.log("FINAL PAYLOAD 🔥", payload);

      // ✅ SINGLE API CALL
      await addSurveyQuestion(payload as any);

      showSnackbar("Questions saved successfully", "success");

      setQuestions((prev) => prev.map((q) => ({ ...q, editable: false })));
      setIsPreviewMode(true);

      if (redirectAfter) {
        router.push("/survey");
      }

      return true;
    } catch (err) {
      showSnackbar("Please check all question fields carefully.", "error");
      return false;
    } finally {
      setSavingAll(false);
    }
  };


  // Save a single question (per-question Save button)
  const handleSaveSingleQuestion = async (
    index: number,
    values: SurveyFormValues
  ) => {
    setSavingQuestionIndex(index);
    try {
      const q = questions[index];

      // validate the question first
      await stepSchemas[1].validate(q, { abortEarly: false });

      // If we're in add-mode and survey isn't created yet, just mark the question saved locally
      if (!createdSurveyId && !isEditMode) {
        setQuestions((prev) => {
          const copy = [...prev];
          copy[index] = { ...copy[index], editable: false };
          return copy;
        });
        showSnackbar("Question saved locally", "success");
        return;
      }

      const payload = {
        survey_id: Number(q.survey_id || createdSurveyId || values.survey_id),
        question: q.question,
        survey_question_code: q.survey_question_code || generateSurveyQuestionCode(),
        question_type: mapQuestionTypeForApi(q.questionType),
        question_based_selected: typesWithOptions.includes(q.questionType)
          ? q.options.filter((o) => o.trim() !== "").join(",")
          : ["textbox", "comment box"].includes(q.questionType)
            ? ""
            : undefined,
      };

      if (q.question_id) {
        await UpdateSurveyQuestion(q.question_id.toString(), payload as any);
      } else {
        await addSurveyQuestion(payload as any);
      }

      // mark this question read-only after save
      setQuestions((prev) => {
        const copy = [...prev];
        copy[index] = { ...copy[index], editable: false };
        return copy;
      });

      showSnackbar("Question saved", "success");
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const map: Record<string, string> = {};
        err.inner.forEach((e: any) => {
          if (!e.path) return;
          if (e.path.startsWith("options")) {
            map.options = e.message;
          } else {
            map[e.path] = e.message;
          }
        });
        setQuestionErrors((prev) => ({ ...prev, [index]: map }));
        return;
      }
      showSnackbar("Failed to save question. Please check fields.", "error");
    } finally {
      setSavingQuestionIndex(null);
    }
  };

  // Delete a question (per-question delete)
  const handleDeleteQuestion = async (index: number) => {
    const q = questions[index];

    if (!q) return;

    const confirmDelete = window.confirm("Are you sure you want to delete this question?");
    if (!confirmDelete) return;

    try {
      if (q.question_id && isEditMode) {
        // show global loading while deleting persisted question
        setLoading(true);
        try {
          const res = await deleteSurveyQuestion(q.question_id.toString());
          if (res?.error) {
            showSnackbar(res.data?.message || "Failed to delete question ❌", "error");
            return;
          }
        } finally {
          setLoading(false);
        }
      }

      setQuestions((prev) => prev.filter((_, i) => i !== index));
      showSnackbar("Question deleted", "success");
    } catch (err) {
      console.error(err);
      showSnackbar("Failed to delete question ❌", "error");
    }
  };

  //  Add another question UI block
  const handleAddNewQuestion = () => {
    // ensure new questions are editable by default and open the editable UI
    setIsPreviewMode(false);
    setQuestions([
      ...questions,
      {
        survey_id: "",
        question: "",
        questionType: "",
        options: [""],
        survey_question_code: generateSurveyQuestionCode(),
        editable: true,
      },
    ]);
  };

  // 🔥 BUILD FINAL PAYLOAD (DO NOT CHANGE UI)
  const buildSurveyQuestionsPayload = (
    surveyId: string,
    questions: {
      question: string;
      questionType: string;
      options: string[];
    }[]
  ) => ({
    survey_id: Number(surveyId),
    questions: questions.map((q) => ({
      question: q.question,
      question_type: mapQuestionTypeForApi(q.questionType),
      question_based_selected: typesWithOptions.includes(q.questionType)
        ? q.options.filter(Boolean).join(",")
        : "",
    })),
  });



  //  Dynamic Tab Renderer
  const renderTabContent = (
    values: SurveyFormValues,
    setFieldValue: FormikHelpers<SurveyFormValues>["setFieldValue"],
    formik: FormikProps<SurveyFormValues>
  ) => {
    switch (activeTab) {
      case 1:
        return (
          <ContainerCard>
            <h2 className="text-lg font-semibold mb-4">Survey Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Survey Code removed from UI (kept as hidden input so form still submits it) */}
              <input type="hidden" name="surveyCode" value={values.surveyCode} />

              <div>
                <InputFields
                  label="Survey Name"
                  name="surveyName"
                  value={values.surveyName}
                  onChange={(e) => setFieldValue("surveyName", e.target.value)}
                  error={formik.touched.surveyName && formik.errors.surveyName}
                />
              </div>

              <div>
                <InputFields
                  label="Start Date"
                  type="date"
                  name="startDate"
                  value={values.startDate}
                  onChange={(e) => setFieldValue("startDate", e.target.value)}
                  error={formik.touched.startDate && formik.errors.startDate}
                />
              </div>

              <div>
                <InputFields
                  label="End Date"
                  type="date"
                  name="endDate"
                  value={values.endDate}
                  onChange={(e) => setFieldValue("endDate", e.target.value)}
                  error={formik.touched.endDate && formik.errors.endDate}
                />
              </div>
              <div>
                <InputFields
                  label="Survey Type"
                  type="select"
                  options={[
                    { value: "1", label: "Consumer Survey" },
                    { value: "2", label: "Sensory Survey" },
                    { value: "3", label: "Asset Survey" },
                  ]}
                  name="survey_type"
                  value={values.survey_type}
                  onChange={(e) => setFieldValue("survey_type", e.target.value)}
                  error={formik.touched.survey_type && formik.errors.survey_type}
                />
              </div>

              {values.survey_type === "1" && (
                <>
                  <div>
                    <InputFields
                      width="max-w-[500px]"
                      required
                      searchable
                      label="Merchandisers"
                      name="merchendisher_id"
                      value={values.merchendisher_id.map(String)}
                      options={merchendiserOptions}
                      isSingle={false}
                      onChange={(e) => {
                        const selectedIds = (
                          Array.isArray(e.target.value) ? e.target.value : []
                        ).map(Number);
                        setFieldValue("merchendisher_id", selectedIds);
                        setFieldValue("customer_id", []);
                        setFieldValue("images", {});
                        fetchCustomers(selectedIds);
                      }}
                    // error={
                    //   touched.merchendisher_ids &&
                    //   (Array.isArray(errors.merchendisher_ids)
                    //     ? errors.merchendisher_ids[0]
                    //     : errors.merchendisher_ids)
                    // }
                    />
                  </div>
                  <div>
                    <InputFields
                      width="max-w-[500px]"
                      searchable
                      placeholder={
                        values.merchendisher_id.length === 0
                          ? "A merchandiser must be selected"
                          : customerOptions.length === 0
                            ? "No customer found"
                            : ""
                      }
                      required
                      label="Customers"
                      name="customer_id"
                      value={values.customer_id.map(String)}
                      options={customerOptions}
                      isSingle={false}
                      disabled={
                        values.merchendisher_id.length === 0 ||
                        customerOptions.length === 0
                      }
                      onChange={(e) => {
                        const selectedIds = (
                          Array.isArray(e.target.value) ? e.target.value : []
                        ).map(Number);
                        setFieldValue("customer_id", selectedIds);
                        setFieldValue("images", {});
                      }}
                    // error={
                    //   touched.customer_ids &&
                    //   (Array.isArray(errors.customer_ids)
                    //     ? errors.customer_ids[0]
                    //     : errors.customer_ids)
                    // }
                    />
                  </div>
                </>
              )}

              {values.survey_type === "3" && (
                <div className="flex flex-col w-full">
                  <InputFields
                    label="Assets"
                    searchable
                    value={values.asset_id.map(String)}
                    options={chillerOptions}
                    isSingle={false}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFieldValue("asset_id", value);
                    }}
                  // error={touched.asset && errors.asset}
                  />
                </div>
              )}

            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={() => router.push("/survey")}
                className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              {
                // When editing an existing survey, show "Next" if there are no changes
                (() => {
                  const hasSurveyChanged = (): boolean => {
                    // compare relevant fields
                    return (
                      values.surveyName !== initialValues.surveyName ||
                      values.startDate !== initialValues.startDate ||
                      values.endDate !== initialValues.endDate ||
                      values.survey_type !== initialValues.survey_type ||
                      values.surveyCode !== initialValues.surveyCode

                    );
                  };

                  if (isEditMode) {
                    if (!hasSurveyChanged()) {
                      return (
                        <SidebarBtn
                          type="button"
                          leadingIcon="mdi:arrow-right"
                          label="Next"
                          labelTw="hidden sm:block"
                          isActive
                          onClick={() => setActiveTab(2)}
                        />
                      );
                    }
                    return (
                      <SidebarBtn
                        type="button"
                        leadingIcon="mdi:check"
                        label="Update Survey"
                        labelTw="hidden sm:block"
                        isActive
                        onClick={() => handleCreateSurvey(values, formik)}
                      />
                    );
                  }

                  return (
                    <SidebarBtn
                      type="button"
                      leadingIcon="mdi:check"
                      label="Create Survey"
                      labelTw="hidden sm:block"
                      isActive
                      onClick={() => handleCreateSurvey(values, formik)}
                    />
                  );
                })()
              }
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
            </div>
            <div className="space-y-6">
              {questions.map((q, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
                  {!q.editable ? (
                    <div>
                      <div className="flex items-start justify-between">
                        <h3 className="text-base font-semibold mb-2">Q{index + 1}. {q.question || "Untitled question"}</h3>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const newQs = [...questions];
                              newQs[index].editable = true;
                              setQuestions(newQs);
                            }}
                            className="text-gray-400 hover:text-gray-700"
                            aria-label={`Edit question ${index + 1}`}
                          >
                            <Icon icon="lucide:edit-2" width={18} height={18} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteQuestion(index)}
                            className="text-gray-400 hover:text-red-600"
                            aria-label={`Delete question ${index + 1}`}
                            disabled={savingAll || savingQuestionIndex === index}
                          >
                            <Icon icon="lucide:trash-2" width={18} height={18} />
                          </button>
                        </div>
                      </div>

                      {typesWithOptions.includes(q.questionType) ? (
                        <div className="space-y-2">
                          {q.options
                            .filter((opt) => opt.trim() !== "")
                            .map((opt, i) => (
                              <div key={i} className="flex items-center gap-3">
                                {q.questionType === "check box" && (
                                  <input type="checkbox" disabled className="accent-red-600" />
                                )}
                                {q.questionType === "radio button" && (
                                  <input type="radio" disabled className="accent-red-600" />
                                )}
                                <span className="text-gray-700">{opt}</span>
                              </div>
                            ))}

                          {q.questionType === "selectbox" && (
                            <div className="mt-3">
                              <select disabled className="border border-gray-300 rounded-lg px-3 py-2 w-[300px] bg-gray-50">
                                {q.options
                                  .filter((opt) => opt.trim() !== "")
                                  .map((opt, i) => (
                                    <option key={i}>{opt}</option>
                                  ))}
                              </select>
                            </div>
                          )}
                        </div>
                      ) : (["textbox", "comment box"].includes(q.questionType) ? (
                        <div>
                          <input
                            type="text"
                            disabled
                            placeholder={""}
                            className="border border-gray-300 rounded-lg px-3 py-2 w-[400px] w-full"
                          />
                        </div>
                      ) : null)}
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between">
                        <h3 className="text-base font-semibold mb-4">Question {index + 1}</h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="md:col-span-2">
                          <InputFields
                            width="max-w-full"
                            label="Question"
                            name={`question_${index}`}
                            value={q.question}
                            onChange={(e) => {
                              const newQs = [...questions];
                              newQs[index].question = e.target.value;
                              setQuestions(newQs);
                              // clear question error for this index
                              setQuestionErrors((prev) => {
                                const copy = { ...prev };
                                if (copy[index]) {
                                  delete copy[index].question;
                                  if (Object.keys(copy[index]).length === 0) delete copy[index];
                                }
                                return copy;
                              });
                            }}
                          />
                          {questionErrors[index]?.question && (
                            <div className="text-sm text-red-600 mt-1">{questionErrors[index].question}</div>
                          )}
                        </div>
                        <div>
                          <InputFields
                            label="Question Type"
                            name={`questionType_${index}`}
                            value={q.questionType}
                            onChange={(e) => {
                              const newQs = [...questions];
                              newQs[index].questionType = e.target.value;
                              newQs[index].options = typesWithOptions.includes(e.target.value) ? [""] : [];
                              setQuestions(newQs);
                              // clear questionType error
                              setQuestionErrors((prev) => {
                                const copy = { ...prev };
                                if (copy[index]) {
                                  delete copy[index].questionType;
                                  if (Object.keys(copy[index]).length === 0) delete copy[index];
                                }
                                return copy;
                              });
                            }}
                            type="select"
                            options={questionTypes.map((type) => ({
                              value: type,
                              label: type.replace(/\b\w/g, (c) => c.toUpperCase()),
                            }))}
                          />
                          {questionErrors[index]?.questionType && (
                            <div className="text-sm text-red-600 mt-1">{questionErrors[index].questionType}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-3 ps-163">
                        <button
                          type="button"
                          onClick={() => handleSaveSingleQuestion(index, values)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm"
                          disabled={savingQuestionIndex === index}
                        >
                          {savingQuestionIndex === index ? (
                            <span className="flex items-center gap-2">
                              <Icon icon="lucide:loader" width={14} height={14} className="animate-spin" />
                              {"Saving"}
                            </span>
                          ) : (
                            "Save"
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteQuestion(index)}
                          className="bg-white border border-gray-300 px-3 py-1 rounded-lg text-sm text-red-600 hover:bg-red-50"
                          disabled={savingQuestionIndex === index || savingAll}
                        >
                          Delete
                        </button>
                      </div>

                      {/*  Dynamic Options / Preview */}
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
                                    {q.questionType === "radio button" && (
                                      <input type="radio" disabled className="accent-red-600" />
                                    )}

                                    <input
                                      type="text"
                                      value={opt}
                                      onChange={(e) => {
                                        const newQs = [...questions];
                                        newQs[index].options[optIndex] = e.target.value;
                                        setQuestions(newQs);
                                        // clear options error for this question
                                        setQuestionErrors((prev) => {
                                          const copy = { ...prev };
                                          if (copy[index]) {
                                            delete copy[index].options;
                                            if (Object.keys(copy[index]).length === 0) delete copy[index];
                                          }
                                          return copy;
                                        });
                                      }}
                                      placeholder={`Option ${optIndex + 1}`}
                                      className="border-b-1 border-gray-300 px-5 py-2 focus:outline-none focus:border-red-600"
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

                                {questionErrors[index]?.options && (
                                  <div className="text-sm text-red-600 mt-1">{questionErrors[index].options}</div>
                                )}

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
                              </div>
                            </div>
                          );
                        }

                        return null;
                      })()}
                    </>
                  )}
                </div>
              ))}

              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={handleAddNewQuestion}
                  className="flex items-center gap-1 text-red-600 font-medium hover:underline"
                >
                  <Icon icon="lucide:plus-circle" width={18} height={18} />
                  Add New Question
                </button>


                {!isPreviewMode ? (
                  <button
                    type="button"
                    onClick={() => handleSaveQuestions(values)}
                    className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-medium"
                    disabled={savingAll}
                  >
                    {savingAll ? (
                      <span className="flex items-center gap-2">
                        <Icon icon="lucide:loader" width={16} height={16} className="animate-spin" />
                        {isEditMode ? "Updating..." : "Saving..."}
                      </span>
                    ) : (
                      <div className="flex items-center">
                        <Icon icon="mdi:check" width={22} height={22} className="mr-2" />
                        <span>Submit</span>
                      </div>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={async () => {
                      const ok = await handleSaveQuestions(values, true);
                      if (ok) {
                        // router.push handled inside handleSaveQuestions when redirectAfter=true
                      }
                    }}
                    className="bg-white border border-gray-300 px-4 py-2 rounded-lg font-medium"
                  >
                    Submit
                  </button>
                )}
              </div>
            </div>
          </ContainerCard>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/survey">
          <Icon icon="lucide:arrow-left" width={24} />
        </Link>
        <h1 className="text-xl font-semibold">{isEditMode ? "Update Survey" : "Add New Survey"}</h1>
      </div>

      <Formik enableReinitialize initialValues={initialValues} validationSchema={stepSchemas[0]} onSubmit={() => { }}>
        {(formikHelpers) => {
          const { values, setFieldValue } = formikHelpers;

          return (
            <Form>
              <ContainerCard className="w-full flex gap-[4px] overflow-x-auto" padding="5px">
                {tabs.map((tab, index) => (
                  <div key={index}>
                    <TabBtn
                      label={tab.label}
                      isActive={activeTab === tab.id}
                      onClick={() => setActiveTab(tab.id)}
                    />
                  </div>
                ))}
              </ContainerCard>

              {renderTabContent(values, setFieldValue, formikHelpers)}
            </Form>
          );
        }}
      </Formik>
    </div>
  );
}
