"use client";

import StepperForm, { useStepperForm, StepperStep } from "@/app/components/stepperForm";
import ContainerCard from "@/app/components/containerCard";
import InputFields from "@/app/components/inputFields";
import {
  addDiscount,
  updateDiscount,
  getDiscountById,
  genearateCode,
  saveFinalCode,
} from "@/app/services/allApi";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useParams, useRouter } from "next/navigation";
import * as Yup from "yup";
import { Formik, Form, FormikHelpers, FormikErrors, FormikTouched } from "formik";
import Link from "next/link";
import { Icon } from "@iconify-icon/react/dist/iconify.mjs";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import { useEffect, useRef, useState } from "react";
import SettingPopUp from "@/app/components/settingPopUp";
import IconButton from "@/app/components/iconButton";
import Loading from "@/app/components/Loading";

// ---------------- Types -----------------
interface DiscountFormValues {
  discount_code: string;
  item_id: string;
  category_id: string;
  customer_id: string;
  customer_channel_id: string;
  discount_type: string;
  discount_value: string;
  min_quantity: string;
  min_order_value: string;
  start_date: string;
  end_date: string;
  status: string;
}

// ---------------- Validation Schema -----------------
const DiscountSchema = Yup.object().shape({
  item_id: Yup.string().required("Item ID is required"),
  category_id: Yup.string().required("Category ID is required"),
  customer_id: Yup.string().required("Customer ID is required"),
  customer_channel_id: Yup.string().required("Customer Channel ID is required"),
  discount_type: Yup.string().required("Discount type is required"),
  discount_value: Yup.string().required("Discount value is required"),
  min_quantity: Yup.string().required("Minimum quantity is required"),
  min_order_value: Yup.string().required("Minimum order value is required"),
  start_date: Yup.string().required("Start date is required"),
  end_date: Yup.string().required("End date is required"),
  status: Yup.string().required("Status is required"),
});

// Step-wise schemas
const stepSchemas = [
  Yup.object({
    item_id: Yup.string().required("Item ID is required"),
    category_id: Yup.string().required("Category ID is required"),
    customer_id: Yup.string().required("Customer ID is required"),
    customer_channel_id: Yup.string().required("Customer Channel ID is required"),
  }),
  Yup.object({
    discount_type: Yup.string().required("Discount type is required"),
    discount_value: Yup.string().required("Discount value is required"),
    min_quantity: Yup.string().required("Minimum quantity is required"),
    min_order_value: Yup.string().required("Minimum order value is required"),
  }),
  Yup.object({
    start_date: Yup.string().required("Start date is required"),
    end_date: Yup.string().required("End date is required"),
    status: Yup.string().required("Status is required"),
  }),
];

// ---------------- Component -----------------
export default function AddDiscountWithStepper() {
  const [isOpen, setIsOpen] = useState(false);
  const [codeMode, setCodeMode] = useState<"auto" | "manual">("auto");
  const [prefix, setPrefix] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(true);

  const [initialValues, setInitialValues] = useState<DiscountFormValues>({
    discount_code: "",
    item_id: "",
    category_id: "",
    customer_id: "",
    customer_channel_id: "",
    discount_type: "",
    discount_value: "",
    min_quantity: "",
    min_order_value: "",
    start_date: "",
    end_date: "",
    status: "1",
  });

  const params = useParams<{ uuid?: string | string[] }>();
  const uuid = Array.isArray(params?.uuid) ? params.uuid[0] : params?.uuid;

  const {
    itemCategoryOptions,
    itemOptions,
    discountTypeOptions,
    channelOptions,
    agentCustomerOptions,
  } = useAllDropdownListData();

  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const codeGeneratedRef = useRef(false);

  const steps: StepperStep[] = [
    { id: 1, label: "General Information" },
    { id: 2, label: "Discount Details" },
    { id: 3, label: "Schedule & Status" },
  ];

  const { currentStep, nextStep, prevStep, markStepCompleted, isStepCompleted, isLastStep } =
    useStepperForm(steps.length);

  // -------- Load data (Edit or Add mode) ----------
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (uuid && uuid !== "add") {
          setIsEditMode(true);
          const res = await getDiscountById(uuid);

          if (res && !res.error && res.data) {
            const d = res.data;
            setInitialValues({
              discount_code: d.osa_code || "",
              item_id: d.item?.id?.toString() || "",
              category_id: d.item_category?.id?.toString() || "",
              customer_id: d.customer?.id?.toString() || "",
              customer_channel_id: d.outlet_channel?.id?.toString() || "",
              discount_type: d.discount_type?.id?.toString() || "",
              discount_value: d.discount_value?.toString() || "",
              min_quantity: d.min_quantity?.toString() || "",
              min_order_value: d.min_order_value?.toString() || "",
              start_date: d.start_date ? d.start_date.split("T")[0] : "",
              end_date: d.end_date ? d.end_date.split("T")[0] : "",
              status: d.status?.toString() || "1",
            });
          }
        } else if (!codeGeneratedRef.current) {
          codeGeneratedRef.current = true;
          const res = await genearateCode({ model_name: "discounts" });
          if (res?.code)
            setInitialValues((prev) => ({ ...prev, discount_code: res.code }));
          if (res?.prefix) setPrefix(res.prefix);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        showSnackbar("Failed to load data", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [uuid]);

  // -------- Step validation ----------
  // const handleNext = async (
  //   values: DiscountFormValues,
  //   actions: FormikHelpers<DiscountFormValues>
  // ) => {
  //   try {
  //     const schema = stepSchemas[currentStep - 1];
  //     await schema.validate(values, { abortEarly: false });
  //     markStepCompleted(currentStep);
  //     nextStep();
  //   } catch (err: unknown) {
  //     if (err instanceof Yup.ValidationError) {
  //       const fields = err.inner.map((e) => e.path);
  //       actions.setTouched(
  //         fields.reduce((acc, key) => ({ ...acc, [key!]: true }), {} as Record<string, boolean>)
  //       );
  //       actions.setErrors(
  //         err.inner.reduce(
  //           (acc: Partial<Record<keyof DiscountFormValues, string>>, curr) => ({
  //             ...acc,
  //             [curr.path as keyof DiscountFormValues]: curr.message,
  //           }),
  //           {}
  //         )
  //       );
  //     }
  //     showSnackbar("Please fix validation errors before proceeding", "error");
  //   }
  // };

  const handleNext = async (
    values: DiscountFormValues,
    actions: FormikHelpers<DiscountFormValues>
  ) => {
    try {
      // Validate only the current step's fields
      const schema = stepSchemas[currentStep - 1];
      await schema.validate(values, { abortEarly: false });
      markStepCompleted(currentStep);
      nextStep();
    } catch (err: unknown) {
      if (err instanceof Yup.ValidationError) {
        // Only touch fields in the current step
        const fields = err.inner.map((e) => e.path);
        actions.setTouched(
          fields.reduce(
            (acc, key) => ({ ...acc, [key!]: true }),
            {} as Record<string, boolean>
          )
        );
        actions.setErrors(
          err.inner.reduce(
            (
              acc: Partial<
                Record<keyof DiscountFormValues, string>
              >,
              curr
            ) => ({
              ...acc,
              [curr.path as keyof DiscountFormValues]:
                curr.message,
            }),
            {}
          )
        );
      }
    }
  };

  // -------- Form submission ----------
  const handleSubmit = async (
    values: DiscountFormValues,
    { setSubmitting }: FormikHelpers<DiscountFormValues>,
    actions?: Pick<
      FormikHelpers<DiscountFormValues>,
      "setErrors" | "setTouched" | "setSubmitting"
    >
  ) => {
    try {
      await DiscountSchema.validate(values, { abortEarly: false });
      const formData = new FormData();
      (Object.keys(values) as (keyof DiscountFormValues)[]).forEach((key) =>
        formData.append(key, values[key] ?? "")
      );

      let res;
      if (isEditMode) res = await updateDiscount(uuid as string, formData);
      else res = await addDiscount(formData);

      if (res.error) {
        showSnackbar(res.data?.message || "Failed to submit form", "error");
      } else {
        showSnackbar(
          isEditMode ? "Discount Updated Successfully" : "Discount Created Successfully",
          "success"
        );
        if (!isEditMode) {
          await saveFinalCode({
            reserved_code: values.discount_code,
            model_name: "discounts",
          }).catch(() => { });
        }
        router.push("/discount");
      }
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        console.error("Yup ValidationError:", err);

        // Map inner errors to { fieldName: message }
        const fieldErrors = err.inner.reduce<Record<string, string>>(
          (acc, e) => {
            if (e.path) acc[e.path] = e.message;
            return acc;
          },
          {}
        );

        // If caller provided Formik helpers, set field errors + touched so UI shows per-field messages
        if (actions?.setErrors) {
          actions.setErrors(
            fieldErrors as FormikErrors<DiscountFormValues>
          );
        }
        if (actions?.setTouched) {
          const touchedMap = Object.keys(fieldErrors).reduce<
            Record<string, boolean>
          >((acc, k) => {
            acc[k] = true;
            return acc;
          }, {});
          actions.setTouched(
            touchedMap as FormikTouched<DiscountFormValues>
          );
        }

        return;
      }

      // fallback for non-Yup errors
      console.error("Submit error:", err);
      showSnackbar(
        isEditMode
          ? "Update Agent Customer failed"
          : "Add Agent Customer failed",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // -------- Step UI Renderer ----------
  const renderStepContent = (
    values: DiscountFormValues,
    setFieldValue: (field: keyof DiscountFormValues, value: string) => void,
    errors: FormikErrors<DiscountFormValues>,
    touched: FormikTouched<DiscountFormValues>
  ) => {
    switch (currentStep) {
      // ---------------- Step 1 ----------------
      case 1:
        return (
          <ContainerCard>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Discount Code */}
              <div className="flex items-start gap-2 max-w-[406px]">
                <InputFields
                  label="Discount Code"
                  name="discount_code"
                  value={values.discount_code}
                  onChange={(e) => setFieldValue("discount_code", e.target.value)}
                  disabled={codeMode === "auto"}
                />
                {/* {!isEditMode && (
                  <>
                    <IconButton
                      bgClass="white"
                      className="cursor-pointer text-[#252B37] pt-12"
                      icon="mi:settings"
                      onClick={() => setIsOpen(true)}
                    />
                    <SettingPopUp
                      isOpen={isOpen}
                      onClose={() => setIsOpen(false)}
                      title="Discount Code"
                      prefix={prefix}
                      setPrefix={setPrefix}
                      onSave={(mode, code) => {
                        setCodeMode(mode);
                        if (mode === "auto" && code) setFieldValue("discount_code", code);
                        if (mode === "manual") setFieldValue("discount_code", "");
                      }}
                    />
                  </>
                )} */}
              </div>

              {/* Item */}
              <div>
                <InputFields
                required
                  label="Item"
                  name="item_id"
                  value={values.item_id}
                  onChange={(e) => setFieldValue("item_id", e.target.value)}
                  options={itemOptions}
                  error={touched.item_id && errors.item_id}

                />
                {errors?.item_id && touched?.item_id && (
                  <p className="text-red-500 text-sm mt-1">{errors.item_id}</p>
                )}
              </div>

              {/* Item Category */}
              <div>
                <InputFields
                required
                  label="Item Category"
                  name="category_id"
                  value={values.category_id}
                  onChange={(e) => setFieldValue("category_id", e.target.value)}
                  options={itemCategoryOptions}
                  error={touched.category_id && errors.category_id}

                />
                {errors?.category_id && touched?.category_id && (
                  <p className="text-red-500 text-sm mt-1">{errors.category_id}</p>
                )}
              </div>

              {/* Customer */}
              <div>
                <InputFields
                required
                  label="Customer"
                  name="customer_id"
                  value={values.customer_id}
                  onChange={(e) => setFieldValue("customer_id", e.target.value)}
                  options={agentCustomerOptions}
                  error={touched.customer_id && errors.customer_id}

                />
                {errors?.customer_id && touched?.customer_id && (
                  <p className="text-red-500 text-sm mt-1">{errors.customer_id}</p>
                )}
              </div>

              {/* Customer Channel */}
              <div>
                <InputFields
                required
                  label="Customer Channel"
                  name="customer_channel_id"
                  value={values.customer_channel_id}
                  onChange={(e) => setFieldValue("customer_channel_id", e.target.value)}
                  options={channelOptions}
                  error={touched.customer_channel_id && errors.customer_channel_id}

                />
                {errors?.customer_channel_id && touched?.customer_channel_id && (
                  <p className="text-red-500 text-sm mt-1">{errors.customer_channel_id}</p>
                )}
              </div>
            </div>
          </ContainerCard>
        );

      // ---------------- Step 2 ----------------
      case 2:
        return (
          <ContainerCard>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <InputFields
                required
                  label="Discount Type"
                  name="discount_type"
                  value={values.discount_type}
                  onChange={(e) => setFieldValue("discount_type", e.target.value)}
                  options={discountTypeOptions}
                  error={touched.discount_type && errors.discount_type}

                />
                {errors?.discount_type && touched?.discount_type && (
                  <p className="text-red-500 text-sm mt-1">{errors.discount_type}</p>
                )}
              </div>

              <div>
                <InputFields
                required
                  label="Discount Value"
                  name="discount_value"
                  value={values.discount_value}
                  onChange={(e) => setFieldValue("discount_value", e.target.value)}
                  error={touched.discount_value && errors.discount_value}

                />
                {errors?.discount_value && touched?.discount_value && (
                  <p className="text-red-500 text-sm mt-1">{errors.discount_value}</p>
                )}
              </div>

              <div>
                <InputFields
                required
                  label="Minimum Quantity"
                  name="min_quantity"
                  value={values.min_quantity}
                  onChange={(e) => setFieldValue("min_quantity", e.target.value)}
                  error={touched.min_quantity && errors.min_quantity}

                />
                {errors?.min_quantity && touched?.min_quantity && (
                  <p className="text-red-500 text-sm mt-1">{errors.min_quantity}</p>
                )}
              </div>

              <div>
                <InputFields
                required
                  label="Minimum Order Value"
                  name="min_order_value"
                  value={values.min_order_value}
                  onChange={(e) => setFieldValue("min_order_value", e.target.value)}
                  error={touched.min_order_value && errors.min_order_value}

                />
                {errors?.min_order_value && touched?.min_order_value && (
                  <p className="text-red-500 text-sm mt-1">{errors.min_order_value}</p>
                )}
              </div>
            </div>
          </ContainerCard>
        );

      // ---------------- Step 3 ----------------
      case 3:
        return (
          <ContainerCard>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <InputFields
                required
                  label="Start Date"
                  name="start_date"
                  type="date"
                  value={values.start_date}
                  onChange={(e) => setFieldValue("start_date", e.target.value)}
                  error={touched.start_date && errors.start_date}

                />
                {errors?.start_date && touched?.start_date && (
                  <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>
                )}
              </div>

              <div>
                <InputFields
                required
                  label="End Date"
                  name="end_date"
                  type="date"
                  value={values.end_date}
                  onChange={(e) => setFieldValue("end_date", e.target.value)}
                  error={touched.end_date && errors.end_date}

                />
                {errors?.end_date && touched?.end_date && (
                  <p className="text-red-500 text-sm mt-1">{errors.end_date}</p>
                )}
              </div>

              <div>
                <InputFields
                  label="Status"
                  name="status"
                  type="radio"
                  value={values.status}
                  onChange={(e) => setFieldValue("status", e.target.value)}
                  options={[
                    { value: "1", label: "Active" },
                    { value: "0", label: "Inactive" },
                  ]}
                />
                {errors?.status && touched?.status && (
                  <p className="text-red-500 text-sm mt-1">{errors.status}</p>
                )}
              </div>
            </div>
          </ContainerCard>
        );

      default:
        return null;
    }
  };

  // -------- Render ----------
  if (loading) return <Loading />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/discount">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">
            {isEditMode ? "Edit Discount" : "Add New Discount"}
          </h1>
        </div>
      </div>

      <Formik initialValues={initialValues} validationSchema={DiscountSchema} enableReinitialize onSubmit={handleSubmit}>
        {({ values, setFieldValue, errors, touched, handleSubmit: formikSubmit, setErrors, setTouched }) => (
          <Form>
            <StepperForm
              steps={steps.map((s) => ({ ...s, isCompleted: isStepCompleted(s.id) }))}
              currentStep={currentStep}
              onBack={prevStep}
              onNext={() =>
                handleNext(values, { setErrors, setTouched } as FormikHelpers<DiscountFormValues>)
              }
              onSubmit={() => formikSubmit()}
              showSubmitButton={isLastStep}
              showNextButton={!isLastStep}
              nextButtonText="Save & Next"
              submitButtonText={isEditMode ? "Update" : "Submit"}
            >
              {renderStepContent(values, setFieldValue, errors, touched)}
            </StepperForm>
          </Form>
        )}
      </Formik>
    </div>
  );
}
