"use client";

import StepperForm, { useStepperForm, StepperStep } from "@/app/components/stepperForm";
import ContainerCard from "@/app/components/containerCard";
import InputFields from "@/app/components/inputFields";
import { addDiscount } from "@/app/services/allApi";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useRouter } from "next/navigation";
import * as Yup from "yup";
import { Formik, Form, FormikHelpers, FormikErrors, FormikTouched } from "formik";
import Link from "next/link";
import { Icon } from "@iconify-icon/react/dist/iconify.mjs";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";


interface DiscountFormValues {
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

// Validation schemas for each step
const stepSchemas = [
  // Step 1: General Information
  Yup.object({
    item_id: Yup.string().required("Item ID is required"),
    category_id: Yup.string().required("Category ID is required"),
    customer_id: Yup.string().required("Customer ID is required"),
    customer_channel_id: Yup.string().required("Customer Channel ID is required"),
  }),
  // Step 2: Discount Details
  Yup.object({
    discount_type: Yup.string().required("Discount type is required"),
    discount_value: Yup.string().required("Discount value is required"),
    min_quantity: Yup.string().required("Minimum quantity is required"),
    min_order_value: Yup.string().required("Minimum order value is required"),
  }),
  // Step 3: Schedule & Status
  Yup.object({
    start_date: Yup.string().required("Start date is required"),
    end_date: Yup.string().required("End date is required"),
    status: Yup.string().required("Status is required"),
  }),
];

export default function AddDiscountWithStepper() {

  const { itemCategoryOptions, itemOptions, discountTypeOptions } = useAllDropdownListData();


  const steps: StepperStep[] = [
    { id: 1, label: "General Information" },
    { id: 2, label: "Discount Details" },
    { id: 3, label: "Schedule & Status" },
  ];

  const { currentStep, nextStep, prevStep, markStepCompleted, isStepCompleted, isLastStep } =
    useStepperForm(steps.length);

  const { showSnackbar } = useSnackbar();
  const router = useRouter();

  const initialValues: DiscountFormValues = {
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
  };

  const handleNext = async (
    values: DiscountFormValues,
    actions: FormikHelpers<DiscountFormValues>
  ) => {
    try {
      const schema = stepSchemas[currentStep - 1];
      await schema.validate(values, { abortEarly: false });
      markStepCompleted(currentStep);
      nextStep();
    } catch (err: unknown) {
      if (err instanceof Yup.ValidationError) {
        const fields = err.inner.map((e) => e.path);
        actions.setTouched(
          fields.reduce(
            (acc, key) => ({ ...acc, [key!]: true }),
            {} as Record<string, boolean>
          )
        );
        actions.setErrors(
          err.inner.reduce(
            (acc: Partial<Record<keyof DiscountFormValues, string>>, curr) => ({
              ...acc,
              [curr.path as keyof DiscountFormValues]: curr.message,
            }),
            {}
          )
        );
      }
      showSnackbar("Please fix validation errors before proceeding", "error");
    }
  };

  const handleSubmit = async (values: DiscountFormValues) => {
    try {
      const res = await addDiscount(values);
      if (res.error) {
        showSnackbar(res.data?.message || "Failed to add discount ❌", "error");
      } else {
        showSnackbar("Discount added successfully ✅", "success");
        router.push("/dashboard/master/discount");
      }
    } catch {
      showSnackbar("Add discount failed ❌", "error");
    }
  };

  const renderStepContent = (
    values: DiscountFormValues,
    setFieldValue: (
      field: keyof DiscountFormValues,
      value: string,
      shouldValidate?: boolean
    ) => void,
    errors: FormikErrors<DiscountFormValues>,
    touched: FormikTouched<DiscountFormValues>
  ) => {
    switch (currentStep) {
      case 1:
        return (
          <ContainerCard>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputFields
                label="Item"
                name="item_id"
                value={values.item_id}
                onChange={(e) => setFieldValue("item_id", e.target.value)}
                error={touched.item_id && errors.item_id}
                options={itemOptions}
              />
              <InputFields
                label="Item Category"
                name="category_id"
                value={values.category_id}
                onChange={(e) => setFieldValue("category_id", e.target.value)}
                error={touched.category_id && errors.category_id}
                options={itemCategoryOptions}
              />
              <InputFields
                label="Customer"
                name="customer_id"
                value={values.customer_id}
                onChange={(e) => setFieldValue("customer_id", e.target.value)}
                error={touched.customer_id && errors.customer_id}
                options={[
                  { value: "0", label: "Aman" },
                  { value: "1", label: "Amit" },
                  { value: "2", label: "Raghu" },
                ]}
              />
              <InputFields
                label="Customer Channel"
                name="customer_channel_id"
                value={values.customer_channel_id}
                onChange={(e) => setFieldValue("customer_channel_id", e.target.value)}
                error={touched.customer_channel_id && errors.customer_channel_id}
                 options={[
                   { value: "0", label: "Aman" },
                  { value: "1", label: "Abcd" },
                ]}
              />
            </div>
          </ContainerCard>
        );
      case 2:
        return (
          <ContainerCard>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputFields
                label="Discount Type"
                name="discount_type"
                value={values.discount_type}
                onChange={(e) => setFieldValue("discount_type", e.target.value)}
                options={discountTypeOptions}
                error={touched.discount_type && errors.discount_type}
              />
              <InputFields
                label="Discount Value"
                name="discount_value"
                value={values.discount_value}
                onChange={(e) => setFieldValue("discount_value", e.target.value)}
                error={touched.discount_value && errors.discount_value}
              />
              <InputFields
                label="Minimum Quantity"
                name="min_quantity"
                value={values.min_quantity}
                onChange={(e) => setFieldValue("min_quantity", e.target.value)}
                error={touched.min_quantity && errors.min_quantity}
              />
              <InputFields
                label="Minimum Order Value"
                name="min_order_value"
                value={values.min_order_value}
                onChange={(e) => setFieldValue("min_order_value", e.target.value)}
                error={touched.min_order_value && errors.min_order_value}
              />
            </div>
          </ContainerCard>
        );
      case 3:
        return (
          <ContainerCard>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputFields
                label="Start Date"
                name="start_date"
                type="date"
                value={values.start_date}
                onChange={(e) => setFieldValue("start_date", e.target.value)}
                error={touched.start_date && errors.start_date}
              />
              <InputFields
                label="End Date"
                name="end_date"
                type="date"
                value={values.end_date}
                onChange={(e) => setFieldValue("end_date", e.target.value)}
                error={touched.end_date && errors.end_date}
              />
              <InputFields
                label="Status"
                name="status"
                value={values.status}
                onChange={(e) => setFieldValue("status", e.target.value)}
                options={[
                  { value: "1", label: "Active" },
                  { value: "0", label: "Inactive" },
                ]}
                error={touched.status && errors.status}
              />
            </div>
          </ContainerCard>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/master/discount">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">Add New Discount</h1>
        </div>
      </div>
      <Formik initialValues={initialValues} onSubmit={handleSubmit}>
        {({ values, setFieldValue, errors, touched, handleSubmit: formikSubmit }) => (
          <Form>
            <StepperForm
              steps={steps.map((step) => ({ ...step, isCompleted: isStepCompleted(step.id) }))}
              currentStep={currentStep}
              onBack={prevStep}
              onNext={() =>
                handleNext(values, {
                  setErrors: () => {},
                  setTouched: () => {},
                } as unknown as FormikHelpers<DiscountFormValues>)
              }
              onSubmit={() => formikSubmit()}
              showSubmitButton={isLastStep}
              showNextButton={!isLastStep}
              nextButtonText="Save & Next"
              submitButtonText="Submit"
            >
              {renderStepContent(values, setFieldValue, errors, touched)}
            </StepperForm>
          </Form>
        )}
      </Formik>
    </div>
  );
}