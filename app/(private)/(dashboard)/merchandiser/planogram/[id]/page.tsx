"use client";

import StepperForm, {
  useStepperForm,
  StepperStep,
} from "@/app/components/stepperForm";
import ContainerCard from "@/app/components/containerCard";
import InputFields from "@/app/components/inputFields";
import Link from "next/link";
import { Icon } from "@iconify-icon/react/dist/iconify.mjs";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useRouter, useParams } from "next/navigation";
import {
  Formik,
  Form,
  ErrorMessage,
  FormikHelpers,
  FormikErrors,
  FormikTouched,
} from "formik";
import { useState, useEffect } from "react";
import * as Yup from "yup";
import { merchendiserList } from "@/app/services/allApi";
import {
  addPlanogram,
  getPlanogramById,
  updatePlanogramById,
} from "@/app/services/merchandiserApi";
import Loading from "@/app/components/Loading";

// --- Dummy Customers ---
const allCustomers = [
  { value: 1, label: "Customer 1", merchandiserId: 1 },
  { value: 2, label: "Customer 2", merchandiserId: 1 },
  { value: 3, label: "Customer 3", merchandiserId: 2 },
  { value: 4, label: "Customer 4", merchandiserId: 3 },
  { value: 5, label: "Customer 5", merchandiserId: 2 },
];

// --- Types ---
type PlanogramFormValues = {
  name: string;
  valid_from: string;
  valid_to: string;
  merchendiser_ids: number[];
  customer_ids: number[];
};

// --- Validation ---
const validationSchema = Yup.object({
  name: Yup.string().trim().required("Shelf Name is required").max(100),
  valid_from: Yup.date().required("Valid From is required"),
  valid_to: Yup.date().required("Valid To is required"),
  merchendiser_ids: Yup.array()
    .of(Yup.number())
    .min(1, "Select at least one merchandiser"),
  customer_ids: Yup.array()
    .of(Yup.number())
    .min(1, "Select at least one customer"),
});

const stepSchemas = [
  Yup.object().shape({
    name: validationSchema.fields.name,
    valid_from: validationSchema.fields.valid_from,
    valid_to: validationSchema.fields.valid_to,
  }),
  Yup.object().shape({
    merchendiser_ids: validationSchema.fields.merchendiser_ids,
    customer_ids: validationSchema.fields.customer_ids,
  }),
];

export default function Planogram() {
  const steps: StepperStep[] = [
    { id: 1, label: "Planogram Details" },
    { id: 2, label: "Merchandiser & Customers" },
  ];

  const { id } = useParams<{ id?: string }>();
  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [merchandiserOptions, setMerchandiserOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [initialValues, setInitialValues] = useState<PlanogramFormValues>({
    name: "",
    valid_from: "",
    valid_to: "",
    merchendiser_ids: [],
    customer_ids: [],
  });

  const {
    currentStep,
    nextStep,
    prevStep,
    markStepCompleted,
    isStepCompleted,
    isLastStep,
  } = useStepperForm(steps.length);
  console.log(initialValues);

  // --- Fetch Shelf & Merchandiser Data ---
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);

      try {
        // Fetch merchandiser list
        const merchRes = await merchendiserList();
        const merchOptions =
          merchRes.data?.map((m: { id: number; name: string }) => ({
            value: String(m.id),
            label: m.name,
          })) || [];
        setMerchandiserOptions(merchOptions);

        if (id.toString() !== "add") {
          setIsEditMode(true);

          // Fetch shelf details
          const res = await getPlanogramById(String(id));

          if (res?.data) {
            setInitialValues({
              name: res.data.name || "",
              valid_from: res.data.valid_from
                ? res.data.valid_from.split("T")[0]
                : "",
              valid_to: res.data.valid_to
                ? res.data.valid_to.split("T")[0]
                : "",
              merchendiser_ids: res.data.merchendiser_ids || [],
              customer_ids: res.data.customer_ids || [],
            });
          } else {
            showSnackbar("Shelf not found", "error");
          }
        } else {
          setIsEditMode(false);
          // ADD mode: no merch selected by default
          setInitialValues((prev) => ({
            ...prev,
            merchendiser_ids: [],
            customer_ids: [],
          }));
        }
      } catch (error) {
        console.error("Failed to fetch data", error);
        showSnackbar("Unable to fetch shelf or merchandiser data", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, showSnackbar]);

  // --- Step Navigation ---
  const handleNext = async (
    values: PlanogramFormValues,
    actions: FormikHelpers<PlanogramFormValues>
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
          fields.reduce(
            (acc, key) => ({ ...acc, [key!]: true }),
            {} as Record<string, boolean>
          )
        );
        actions.setErrors(
          err.inner.reduce(
            (acc: Partial<Record<keyof PlanogramFormValues, string>>, curr) => ({
              ...acc,
              [curr.path as keyof PlanogramFormValues]: curr.message,
            }),
            {}
          )
        );
      }
      showSnackbar("Please fill all required fields correctly", "error");
    }
  };

  // --- Submit Form ---
  const handleSubmit = async (values: PlanogramFormValues) => {
    try {
      const payload = {
        ...values,
    
      };

      const res = isEditMode
        ? await updatePlanogramById(String(id), payload)
        : await addPlanogram(payload);

        console.log(res)

      if (res.error) {
        showSnackbar(res.data?.message || "Failed to save shelf", "error");
      } else {
        showSnackbar(
          isEditMode
            ? "Shelf updated successfully"
            : "Shelf added successfully",
          "success"
        );
        router.push("/merchandiser/shelfDisplay");
      }
    } catch {
      showSnackbar("Something went wrong", "error");
    }
  };

  // --- Step Content Renderer ---
  const renderStepContent = (
    values: PlanogramFormValues,
    setFieldValue: (field: keyof PlanogramFormValues, value: string | number | number[]) => void,
    errors: FormikErrors<PlanogramFormValues>,
    touched: FormikTouched<PlanogramFormValues>
  ) => {
    switch (currentStep) {
  case 1:
  return (
    <ContainerCard>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Name */}
        <div className="flex flex-col">
          <InputFields
            required
            type="text"
            label="Name"
            name="name"
            value={values.name}
            onChange={(e) => setFieldValue("name", e.target.value)}
            error={touched.name && errors.name}
          />
          <ErrorMessage
            name="name"
            component="span"
            className="text-xs text-red-500 mt-1"
          />
        </div>

        {/* Valid From */}
        <div className="flex flex-col">
          <InputFields
            required
            type="date"
            label="Valid From"
            name="valid_from"
            value={values.valid_from}
            onChange={(e) => setFieldValue("valid_from", e.target.value)}
            error={touched.valid_from && errors.valid_from}
          />
          <ErrorMessage
            name="valid_from"
            component="span"
            className="text-xs text-red-500 mt-1"
          />
        </div>

        {/* Valid To */}
        <div className="flex flex-col">
          <InputFields
            required
            type="date"
            label="Valid To"
            name="valid_to"
            value={values.valid_to}
            onChange={(e) => setFieldValue("valid_to", e.target.value)}
            error={touched.valid_to && errors.valid_to}
          />
          <ErrorMessage
            name="valid_to"
            component="span"
            className="text-xs text-red-500 mt-1"
          />
        </div>
      </div>
    </ContainerCard>
  );

      case 2:

        const filteredCustomers = allCustomers.filter((c) =>
          values.merchendiser_ids.includes(c.merchandiserId)
        );

        return (
          <ContainerCard>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Merchandisers */}
              <div className="flex flex-col">
                <InputFields
                  required
                  label="Merchandisers"
                  name="merchendiser_ids"
                  value={values.merchendiser_ids.map(String)}
             
                  isSingle={false}
                  onChange={(e) => {
                    const vals = Array.isArray(e.target.value)
                      ? e.target.value
                      : [];
                    setFieldValue("merchendiser_ids", vals.map(Number));
                    setFieldValue("customer_ids", []); // reset customers when merch changes
                  }}
                  error={
                    touched.merchendiser_ids && errors.merchendiser_ids
                      ? Array.isArray(errors.merchendiser_ids)
                        ? errors.merchendiser_ids.join(", ")
                        : errors.merchendiser_ids
                      : undefined
                  }
                />
                <ErrorMessage
                  name="merchendiser_ids"
                  component="span"
                  className="text-xs text-red-500 mt-1"
                />
              </div>

              {/* Customers */}
              <div className="flex flex-col">
                <>{console.log(values.merchendiser_ids.length)}</>
                <InputFields
                  required
                  label="Customers"
                  name="customer_ids"
                  value={values.customer_ids.map(String)}
                  options={allCustomers.map((c) => ({
                    value: String(c.value),
                    label: c.label,
                  }))}
                  disabled={values.merchendiser_ids.length === 0 ? true : false}
                  isSingle={false}
                  onChange={(e) => {
                    const vals = Array.isArray(e.target.value)
                      ? e.target.value
                      : [];
                    setFieldValue("customer_ids", vals.map(Number)); // correctly set customer_ids
                  }}
                  error={
                    touched.customer_ids && errors.customer_ids
                      ? Array.isArray(errors.customer_ids)
                        ? errors.customer_ids.join(", ")
                        : errors.customer_ids
                      : undefined
                  }
                />
                <ErrorMessage
                  name="customer_ids"
                  component="span"
                  className="text-xs text-red-500 mt-1"
                />
              </div>
            </div>
          </ContainerCard>
        );

      default:
        return null;
    }
  };

  const backBtnUrl = "/merchandiser/planogram/";

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href={backBtnUrl}>
          <Icon icon="lucide:arrow-left" width={24} />
        </Link>
        <h1 className="text-xl font-semibold mb-1">
          {isEditMode ? "Edit Planogram" : "Add Planogram"}
        </h1>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({
            values,
            setFieldValue,
            errors,
            touched,
            handleSubmit: formikSubmit,
            setErrors,
            setTouched,
            isSubmitting,
          }) => (
            <Form>
              <StepperForm
                steps={steps.map((step) => ({
                  ...step,
                  isCompleted: isStepCompleted(step.id),
                }))}
                currentStep={currentStep}
                onBack={prevStep}
                onNext={() =>
                  handleNext(values, {
                    setErrors,
                    setTouched,
                  } as unknown as FormikHelpers<PlanogramFormValues>)
                }
                onSubmit={() => formikSubmit()}
                showSubmitButton={isLastStep}
                showNextButton={!isLastStep}
                nextButtonText="Save & Next"
                submitButtonText={isSubmitting ? "Submitting..." : "Submit"}
              >
                {renderStepContent(values, setFieldValue, errors, touched)}
              </StepperForm>
            </Form>
          )}
        </Formik>
      )}
    </div>
  );
}