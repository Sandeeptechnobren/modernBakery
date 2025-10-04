"use client";

import React from "react";
import { Formik, Form, FieldArray, ErrorMessage } from "formik";
import * as Yup from "yup";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import ContainerCard from "@/app/components/containerCard";

interface QuestionFormValues {
  question: string;
  survey: string;
  questionType: string;
  options: string[];
}

// Question types
const questionTypes = [
  "Comment Box",
  "Checkbox",
  "Radio Button",
  "Text Box",
  "Select Box",
];

// Types that require options
const typesWithOptions = ["Checkbox", "Radio Button", "Select Box"];

// Validation schema
const QuestionSchema = Yup.object().shape({
  question: Yup.string().required("Question is required"),
  survey: Yup.string().required("Survey is required"),
  questionType: Yup.string().required("Question type is required"),
  options: Yup.array().when("questionType", {
    is: (type: string) => typesWithOptions.includes(type),
    then: (schema) =>
      schema
        .of(Yup.string().required("Option cannot be empty"))
        .min(1, "At least one option is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
});

export default function QuestionPage() {
  const initialValues: QuestionFormValues = {
    question: "",
    survey: "",
    questionType: "Comment Box",
    options: [""],
  };

  const handleSubmit = (values: QuestionFormValues) => {
    console.log("✅ Form Submitted:", values);
    alert("Form submitted! Check console for values");
  };

  return (
    <div className="w-full p-4">
      <h1 className="text-xl font-semibold mb-6">Add Survey Question</h1>

      <Formik
        initialValues={initialValues}
        validationSchema={QuestionSchema}
        onSubmit={handleSubmit}
      >
        {({ values, setFieldValue, isSubmitting }) => (
          <Form>
            <ContainerCard>
              {/* Question, Survey & Type */}
              <div className="mb-4 flex flex-col md:flex-row gap-4">
                {/* Question */}
                <div className="flex-1">
                  <label className="block font-medium mb-1">Question*</label>
                  <input
                    type="text"
                    name="question"
                    value={values.question}
                    onChange={(e) => setFieldValue("question", e.target.value)}
                    className="border border-gray-300 rounded px-3 py-2 w-full"
                    placeholder="Enter your question"
                  />
                  <ErrorMessage
                    name="question"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {/* Survey */}
                <div className="flex-1">
                  <label className="block font-medium mb-1">Survey*</label>
                  <input
                    type="text"
                    name="survey"
                    value={values.survey}
                    onChange={(e) => setFieldValue("survey", e.target.value)}
                    className="border border-gray-300 rounded px-3 py-2 w-full"
                    placeholder="Enter survey name"
                  />
                  <ErrorMessage
                    name="survey"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {/* Question Type */}
                <div className="flex-1">
                  <label className="block font-medium mb-1">Question Type*</label>
                  <select
                    name="questionType"
                    value={values.questionType}
                    onChange={(e) =>
                      setFieldValue("questionType", e.target.value)
                    }
                    className="border border-gray-300 rounded px-3 py-2 w-full"
                  >
                    {questionTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <ErrorMessage
                    name="questionType"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
              </div>

              {/* Dynamic Options */}
              {typesWithOptions.includes(values.questionType) && (
                <FieldArray name="options">
                  {({ remove, push }) => {
                    const maxRows = 6;
                    const canAddMore = values.options.length < maxRows;

                    return (
                      <div className="mb-4">
                        <label className="block font-medium mb-1">
                          Options (for {values.questionType})*
                        </label>

                        {values.options.map((option, index) => (
                          <div key={index} className="flex gap-2 w-[450px] mb-2">
                            <input
                              type="text"
                              value={option}
                              onChange={(e) =>
                                setFieldValue(`options.${index}`, e.target.value)
                              }
                              className="border border-gray-300 rounded px-3 py-2 flex-1"
                              placeholder="" // ❌ Removed Option 1/2 placeholder
                            />
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="bg-red-500 text-white px-3 py-1 rounded"
                            >
                              ✕
                            </button>
                          </div>
                        ))}

                        <ErrorMessage
                          name="options"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />

                        <button
                          type="button"
                          onClick={() => canAddMore && push("")}
                          disabled={!canAddMore}
                          className={`px-4 py-2 rounded mt-2 ${
                            canAddMore
                              ? "bg-red-500 text-white hover:bg-red-600"
                              : "bg-gray-300 text-gray-600 cursor-not-allowed"
                          }`}
                        >
                          + Add Option
                        </button>

                        {!canAddMore && (
                          <p className="text-sm text-red-500 mt-1">
                            You can add a maximum of {maxRows} options.
                          </p>
                        )}
                      </div>
                    );
                  }}
                </FieldArray>
              )}

              {/* Submit & Cancel */}
              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="reset"
                  className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <SidebarBtn
                  label={isSubmitting ? "Submitting..." : "Submit"}
                  isActive={!isSubmitting}
                  leadingIcon="mdi:check"
                  type="submit"
                />
              </div>
            </ContainerCard>
          </Form>
        )}
      </Formik>
    </div>
  );
}
