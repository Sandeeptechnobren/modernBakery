"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import ContainerCard from "@/app/components/containerCard";
import InputFields from "@/app/components/inputFields";
import StepperForm, { useStepperForm, StepperStep } from "@/app/components/stepperForm";
import { Formik, Form, FormikHelpers, FormikErrors, FormikTouched } from "formik";
import * as Yup from "yup";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useRouter, useParams } from "next/navigation";
import { updateDiscount, getDiscountById } from "@/app/services/allApi";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";

/* ---------------- TYPES ---------------- */
interface DiscountFormValues {
  item_id: string;
  category_id: string;
  customer_id: string;
  customer_channel_id: string;
  discount_type_id: string;
  discount_value: number;
  min_quantity: number;
  min_order_value: number;
  start_date: string;
  end_date: string;
  status: string;
}

/* ---------------- SCHEMAS ---------------- */
const DiscountSchema = Yup.object().shape({
  item_id: Yup.string().required("Item is required"),
  category_id: Yup.string().required("Category is required"),
  customer_id: Yup.string().required("Customer is required"),
  customer_channel_id: Yup.string().required("Customer Channel is required"),
  discount_type_id: Yup.string().required("Discount Type is required"),
  discount_value: Yup.number().min(0).required("Discount value is required"),
  min_quantity: Yup.number().min(0),
  min_order_value: Yup.number().min(0),
  start_date: Yup.string().required("Start date is required"),
  end_date: Yup.string().required("End date is required"),
  status: Yup.string().required("Status is required"),
});

const stepSchemas = [
  Yup.object({
    item_id: Yup.string().required("Item is required"),
    category_id: Yup.string().required("Category is required"),
    customer_id: Yup.string().required("Customer is required"),
    customer_channel_id: Yup.string().required("Customer Channel is required"),
  }),
  Yup.object({
    discount_type_id: Yup.string().required("Discount Type is required"),
    discount_value: Yup.number().min(0).required("Discount value is required"),
    min_quantity: Yup.number().min(0),
    min_order_value: Yup.number().min(0),
  }),
  Yup.object({
    start_date: Yup.string().required("Start date is required"),
    end_date: Yup.string().required("End date is required"),
    status: Yup.string().required("Status is required"),
  }),
];

/* ---------------- COMPONENT ---------------- */
export default function UpdateDiscountStepper() {
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const params = useParams();
  const uuid = params?.uuid as string;

  const { itemOptions, discountTypeOptions, itemCategoryOptions } = useAllDropdownListData();

  const steps: StepperStep[] = [
    { id: 1, label: "Basic Info" },
    { id: 2, label: "Discount Details" },
    { id: 3, label: "Validity & Status" },
  ];

  const { currentStep, nextStep, prevStep, markStepCompleted, isStepCompleted, isLastStep } =
    useStepperForm(steps.length);

  const [initialValues, setInitialValues] = useState<DiscountFormValues>({
    item_id: "",
    category_id: "",
    customer_id: "",
    customer_channel_id: "",
    discount_type_id: "",
    discount_value: 0,
    min_quantity: 0,
    min_order_value: 0,
    start_date: "",
    end_date: "",
    status: "1",
  });

  /* ---------------- FETCH DATA ---------------- */
  useEffect(() => {
    const fetchDiscount = async () => {
      try {
        const res = await getDiscountById(uuid);
        if (res?.status === "success" && res.data) {
          setInitialValues({
            item_id: String(res.data.item.id),
            category_id: String(res.data.item_category.id),
            customer_id: String(res.data.customer_id),
            customer_channel_id: String(res.data.customer_channel_id),
            discount_type_id: String(res.data.discount_type.id),
            discount_value: parseFloat(res.data.discount_value),
            min_quantity: res.data.min_quantity,
            min_order_value: parseFloat(res.data.min_order_value),
            start_date: res.data.start_date,
            end_date: res.data.end_date,
            status: String(res.data.status),
          });
        }
      } catch {
        showSnackbar("Failed to fetch discount details ❌", "error");
      }
    };
    if (uuid) fetchDiscount();
  }, [uuid, showSnackbar]);

  /* ---------------- HANDLE STEP NAVIGATION ---------------- */
  const handleNext = async (
    values: DiscountFormValues,
    actions: FormikHelpers<DiscountFormValues>
  ) => {
    try {
      const schema = stepSchemas[currentStep - 1];
      await schema.validate(values, { abortEarly: false });
      markStepCompleted(currentStep);
      nextStep();
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const fields = err.inner.map((e) => e.path);
        actions.setTouched(
          fields.reduce((acc, key) => ({ ...acc, [key!]: true }), {} as Record<string, boolean>)
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

  /* ---------------- HANDLE SUBMIT ---------------- */
  const handleSubmit = async (values: DiscountFormValues) => {
    try {
      const payload = {
        item_id: Number(values.item_id),
        category_id: Number(values.category_id),
        customer_id: Number(values.customer_id),
        customer_channel_id: Number(values.customer_channel_id),
        discount_type_id: Number(values.discount_type_id),
        discount_value: Number(values.discount_value),
        min_quantity: Number(values.min_quantity),
        min_order_value: Number(values.min_order_value),
        start_date: values.start_date,
        end_date: values.end_date,
        status: Number(values.status),
      };

      const res = await updateDiscount(uuid, payload);
      if (!res || res.status !== "success") {
        showSnackbar(res.message || "Failed to update discount ❌", "error");
      } else {
        showSnackbar("Discount updated successfully ✅", "success");
        router.push("/dashboard/master/discount");
      }
    } catch {
      showSnackbar("Update discount failed ❌", "error");
    }
  };

  /* ---------------- RENDER STEP CONTENT ---------------- */
  const renderStepContent = (
    values: DiscountFormValues,
    setFieldValue: (field: keyof DiscountFormValues, value: string, shouldValidate?: boolean) => void,
    errors: FormikErrors<DiscountFormValues>,
    touched: FormikTouched<DiscountFormValues>
  ) => {
    switch (currentStep) {
      case 1:
        return (
          <ContainerCard>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputFields label="Item" name="item_id" value={values.item_id} onChange={(e) => setFieldValue("item_id", e.target.value)} options={itemOptions} />
              <InputFields label="Category" name="category_id" value={values.category_id} onChange={(e) => setFieldValue("category_id", e.target.value)} options={itemCategoryOptions} />
              <InputFields label="Customer" name="customer_id" value={values.customer_id} onChange={(e) => setFieldValue("customer_id", e.target.value)} />
              <InputFields label="Customer Channel" name="customer_channel_id" value={values.customer_channel_id} onChange={(e) => setFieldValue("customer_channel_id", e.target.value)} />
            </div>
          </ContainerCard>
        );
      case 2:
        return (
          <ContainerCard>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputFields label="Discount Type" name="discount_type_id" value={values.discount_type_id} onChange={(e) => setFieldValue("discount_type_id", e.target.value)} options={discountTypeOptions} />
              <InputFields label="Discount Value" name="discount_value" value={String(values.discount_value)} onChange={(e) => setFieldValue("discount_value", e.target.value)} />
              <InputFields label="Min Quantity" name="min_quantity" value={String(values.min_quantity)} onChange={(e) => setFieldValue("min_quantity", e.target.value)} />
              <InputFields label="Min Order Value" name="min_order_value" value={String(values.min_order_value)} onChange={(e) => setFieldValue("min_order_value", e.target.value)} />
            </div>
          </ContainerCard>
        );
      case 3:
        return (
          <ContainerCard>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputFields label="Start Date" name="start_date" type="date" value={values.start_date} onChange={(e) => setFieldValue("start_date", e.target.value)} />
              <InputFields label="End Date" name="end_date" type="date" value={values.end_date} onChange={(e) => setFieldValue("end_date", e.target.value)} />
              <InputFields label="Status" name="status" value={values.status} onChange={(e) => setFieldValue("status", e.target.value)} options={[{ value: "1", label: "Active" }, { value: "0", label: "Inactive" }]} />
            </div>
          </ContainerCard>
        );
      default:
        return null;
    }
  };

  /* ---------------- RENDER ---------------- */
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/master/discount">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">Update Discount</h1>
        </div>
      </div>

      <Formik enableReinitialize initialValues={initialValues} validationSchema={DiscountSchema} onSubmit={handleSubmit}>
        {({ values, setFieldValue, errors, touched, handleSubmit: formikSubmit, setErrors, setTouched }) => (
          <Form>
            <StepperForm
              steps={steps.map((step) => ({ ...step, isCompleted: isStepCompleted(step.id) }))}
              currentStep={currentStep}
              onStepClick={() => {}}
              onBack={prevStep}
              onNext={() => handleNext(values, { setErrors, setTouched } as FormikHelpers<DiscountFormValues>)}
              onSubmit={formikSubmit}
              showSubmitButton={isLastStep}
              showNextButton={!isLastStep}
              nextButtonText="Save & Next"
              submitButtonText="Update"
            >
              {renderStepContent(values, setFieldValue, errors, touched)}
            </StepperForm>
          </Form>
        )}
      </Formik>
    </div>
  );
}