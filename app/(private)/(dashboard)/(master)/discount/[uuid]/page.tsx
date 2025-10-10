"use client";

import StepperForm, { useStepperForm, StepperStep } from "@/app/components/stepperForm";
import ContainerCard from "@/app/components/containerCard";
import InputFields from "@/app/components/inputFields";
import { addDiscount, updateDiscount, getDiscountById, genearateCode, saveFinalCode } from "@/app/services/allApi";
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

// Step-wise validation
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

export default function AddDiscountWithStepper() {
  const [isOpen, setIsOpen] = useState(false);
  const [codeMode, setCodeMode] = useState<'auto'|'manual'>('auto');
  const [prefix, setPrefix] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
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

  const { itemCategoryOptions, itemOptions, discountTypeOptions } = useAllDropdownListData();
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

  // Load data for edit or generate code
  useEffect(() => {
    const fetchData = async () => {
      if (uuid && uuid !== "add") {
        setIsEditMode(true);
        const res = await getDiscountById(uuid);
        if (res && !res.error) setInitialValues(res.data);
      } else if (!codeGeneratedRef.current) {
        codeGeneratedRef.current = true;
        try {
          const res = await genearateCode({ model_name: "discounts" });
          if (res?.code) setInitialValues((prev) => ({ ...prev, discount_code: res.code }));
          if (res?.prefix) setPrefix(res.prefix);
        } catch {}
      }
    };
    fetchData();
  }, [uuid]);

  // Step validation
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
        actions.setTouched(fields.reduce((acc, key) => ({ ...acc, [key!]: true }), {} as Record<string, boolean>));
        actions.setErrors(err.inner.reduce(
          (acc: Partial<Record<keyof DiscountFormValues, string>>, curr) => ({
            ...acc,
            [curr.path as keyof DiscountFormValues]: curr.message,
          }),
          {}
        ));
      }
      showSnackbar("Please fix validation errors before proceeding", "error");
    }
  };

  // Form submission
  const handleSubmit = async (values: DiscountFormValues, { setSubmitting }: FormikHelpers<DiscountFormValues>) => {
    try {
      await DiscountSchema.validate(values, { abortEarly: false });
      const formData = new FormData();
      (Object.keys(values) as (keyof DiscountFormValues)[]).forEach((key) => formData.append(key, values[key] ?? ""));

      let res;
      if (isEditMode) {
        res = await updateDiscount(uuid as string, formData);
      } else {
        res = await addDiscount(formData);
      }

      if (res.error) {
        showSnackbar(res.data?.message || "Failed to submit form", "error");
      } else {
        showSnackbar(isEditMode ? "Discount Updated Successfully" : "Discount Created Successfully", "success");
        router.push("/discount");
        if (!isEditMode) {
          try {
            await saveFinalCode({ reserved_code: values.discount_code, model_name: "discounts" });
          } catch {}
        }
      }
    } catch {
      showSnackbar("Validation failed, please check your inputs", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Step renderer
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
              <div className="flex items-start gap-2 max-w-[406px]">
                <InputFields
                  label="Discount Code"
                  name="discount_code"
                  value={values.discount_code}
                  onChange={(e) => setFieldValue("discount_code", e.target.value)}
                  disabled={codeMode === 'auto'}
                />
                {!isEditMode && (
                  <>
                    <IconButton
                      bgClass="white"
                       className="  cursor-pointer text-[#252B37] pt-12"
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
                        if (mode === 'auto' && code) setFieldValue('discount_code', code);
                        if (mode === 'manual') setFieldValue('discount_code', '');
                      }}
                    />
                  </>
                )}
              </div>
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
          <Link href="/discount">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">{isEditMode ? "Edit Discount" : "Add New Discount"}</h1>
        </div>
      </div>
      <Formik initialValues={initialValues} enableReinitialize onSubmit={handleSubmit}>
        {({ values, setFieldValue, errors, touched, handleSubmit: formikSubmit, setErrors, setTouched }) => (
          <Form>
            <StepperForm
              steps={steps.map((step) => ({ ...step, isCompleted: isStepCompleted(step.id) }))}
              currentStep={currentStep}
              onBack={prevStep}
              onNext={() => handleNext(values, { setErrors, setTouched } as FormikHelpers<DiscountFormValues>)}
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
