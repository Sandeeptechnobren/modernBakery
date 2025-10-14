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
  addShelves,
  getShelfById,
  updateShelfById,
  shelvesDropdown,
} from "@/app/services/merchandiserApi";
import Loading from "@/app/components/Loading";

// --- Types ---
type ShelfFormValues = {
  shelf_name: string;
  height: number;
  width: number;
  depth: number;
  valid_from: string;
  valid_to: string;
  merchendiser_ids: number[];
  customer_ids: number[];
};

type MerchandiserResponse = { id: number; name: string };

type CustomerFromBackend = {
  id: number;
  customer_code: string;
  business_name: string;
};

type CustomerFromEdit = {
  customers: number;
  customer_code: string;
  customer_type: string;
  owner_name: string;
};

type CustomerOption = { value: string; label: string };

// --- Validation ---
const validationSchema = Yup.object({
  shelf_name: Yup.string().trim().required("Shelf Name is required").max(100),
  height: Yup.number().required("Height is required"),
  width: Yup.number().required("Width is required"),
  depth: Yup.number().required("Depth is required"),
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
    shelf_name: validationSchema.fields.shelf_name,
    height: validationSchema.fields.height,
    width: validationSchema.fields.width,
    depth: validationSchema.fields.depth,
    valid_from: validationSchema.fields.valid_from,
    valid_to: validationSchema.fields.valid_to,
  }),
  Yup.object().shape({
    merchendiser_ids: validationSchema.fields.merchendiser_ids,
    customer_ids: validationSchema.fields.customer_ids,
  }),
];

export default function ShelfDisplay() {
  const steps: StepperStep[] = [
    { id: 1, label: "Shelf Details" },
    { id: 2, label: "Merchandiser & Customers" },
  ];

  const { id } = useParams<{ id?: string }>();
  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [merchendiserOptions, setMerchendiserOptions] = useState<
    CustomerOption[]
  >([]);
  const [customerOptions, setCustomerOptions] = useState<CustomerOption[]>([]);

  const [initialValues, setInitialValues] = useState<ShelfFormValues>({
    shelf_name: "",
    height: 0,
    width: 0,
    depth: 0,
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

  // --- Format customer label ---
  const formatCustomerLabel = (
    customer: CustomerFromBackend | CustomerFromEdit
  ): string => {
    if ("business_name" in customer) {
      return `${customer.customer_code || ""} - ${
        customer.business_name || ""
      }`;
    } else {
      return `${customer.customer_code || ""} - ${customer.owner_name || ""}`;
    }
  };

  // --- Get customer ID ---
  const getCustomerId = (customer: CustomerFromBackend | CustomerFromEdit) => {
    return "id" in customer ? customer.id : customer.customers;
  };

  // --- Fetch data ---
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

        if (id && id.toString() !== "add") {
          setIsEditMode(true);
          const res = await getShelfById(String(id));
          if (res?.data) {
            const shelfData = res.data;
            const customerOptionsForEdit =
              shelfData.customers?.map((customer: CustomerFromEdit) => ({
                value: String(customer.customers),
                label: formatCustomerLabel(customer),
              })) || [];

            setInitialValues({
              shelf_name: shelfData.shelf_name || "",
              height: shelfData.height || 0,
              width: shelfData.width || 0,
              depth: shelfData.depth || 0,
              valid_from: shelfData.valid_from
                ? shelfData.valid_from.split("T")[0]
                : "",
              valid_to: shelfData.valid_to
                ? shelfData.valid_to.split("T")[0]
                : "",
              merchendiser_ids: shelfData.merchendiser_ids || [],
              customer_ids: shelfData.customer_ids || [],
            });

            setCustomerOptions(customerOptionsForEdit);
          } else {
            showSnackbar("Shelf not found", "error");
          }
        } else {
          setIsEditMode(false);
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

  // --- Fetch customers dynamically ---
  const fetchCustomers = async (merchIds: number[]) => {
    if (merchIds.length === 0) {
      setCustomerOptions([]);
      return;
    }
    try {
      const response = await shelvesDropdown({
        merchandiser_ids: merchIds.map(String),
      });
      if (response?.status && Array.isArray(response.data)) {
        const formatted = response.data.map(
          (customer: CustomerFromBackend) => ({
            value: String(customer.id),
            label: formatCustomerLabel(customer),
          })
        );
        setCustomerOptions(formatted);
      } else {
        setCustomerOptions([]);
      }
    } catch (err) {
      console.error("Error fetching customers:", err);
      setCustomerOptions([]);
    }
  };

  // --- Step navigation ---
  const handleNext = async (
    values: ShelfFormValues,
    actions: FormikHelpers<ShelfFormValues>
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
            (acc: Partial<Record<keyof ShelfFormValues, string>>, curr) => ({
              ...acc,
              [curr.path as keyof ShelfFormValues]: curr.message,
            }),
            {}
          )
        );
      }
      showSnackbar("Please fill all required fields correctly", "error");
    }
  };

  // --- Submit Form ---
  const handleSubmit = async (values: ShelfFormValues) => {
    try {
      const payload = {
        ...values,
        height: Number(values.height),
        width: Number(values.width),
        depth: Number(values.depth),
      };

      const res = isEditMode
        ? await updateShelfById(String(id), payload)
        : await addShelves(payload);

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

  // --- Render step content ---
  const renderStepContent = (
    values: ShelfFormValues,
    setFieldValue: (field: keyof ShelfFormValues, value: ShelfFormValues[keyof ShelfFormValues]) => void,
    errors: FormikErrors<ShelfFormValues>,
    touched: FormikTouched<ShelfFormValues>
  ) => {
    switch (currentStep) {
      case 1:
        return (
          <ContainerCard>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(["shelf_name", "height", "width", "depth"] as const).map(
                (field) => (
                  <div key={field} className="flex flex-col">
                    <InputFields
                      required
                      type={field === "shelf_name" ? "text" : "number"}
                      label={field.replace("_", " ").toUpperCase()}
                      name={field}
                      value={values[field]?.toString() || ""}
                      onChange={(e) => setFieldValue(field, e.target.value)}
                      error={touched[field] && errors[field]}
                    />
                    <ErrorMessage
                      name={field}
                      component="span"
                      className="text-xs text-red-500 mt-1"
                    />
                  </div>
                )
              )}

              <InputFields
                required
                type="date"
                label="Valid From"
                name="valid_from"
                value={values.valid_from}
                onChange={(e) => setFieldValue("valid_from", e.target.value)}
                error={touched.valid_from && errors.valid_from}
              />
              <InputFields
                required
                type="date"
                label="Valid To"
                name="valid_to"
                value={values.valid_to}
                onChange={(e) => setFieldValue("valid_to", e.target.value)}
                error={touched.valid_to && errors.valid_to}
              />
            </div>
          </ContainerCard>
        );

      case 2:
        return (
          <ContainerCard>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputFields
                required
                label="Merchandisers"
                name="merchendiser_ids"
                value={values.merchendiser_ids.map(String)}
                options={merchendiserOptions}
                isSingle={false}
                onChange={(e) => {
                  const vals = Array.isArray(e.target.value)
                    ? e.target.value
                    : [];
                  const selectedIds = vals.map(Number);
                  setFieldValue("merchendiser_ids", selectedIds);
                  setFieldValue("customer_ids", []);
                  fetchCustomers(selectedIds);
                }}
                error={
                  touched.merchendiser_ids && errors.merchendiser_ids
                    ? Array.isArray(errors.merchendiser_ids)
                      ? errors.merchendiser_ids.join(", ")
                      : errors.merchendiser_ids
                    : undefined
                }
              />

              <InputFields
                required
                label="Customers"
                name="customer_ids"
                value={values.customer_ids.map(String)}
                options={customerOptions}
                disabled={values.merchendiser_ids.length === 0 && !isEditMode}
                isSingle={false}
                onChange={(e) => {
                  const vals = Array.isArray(e.target.value)
                    ? e.target.value
                    : [];
                  setFieldValue("customer_ids", vals.map(Number));
                }}
                error={
                  touched.customer_ids && errors.customer_ids
                    ? Array.isArray(errors.customer_ids)
                      ? errors.customer_ids.join(", ")
                      : errors.customer_ids
                    : undefined
                }
              />
            </div>
          </ContainerCard>
        );

      default:
        return null;
    }
  };

  const backBtnUrl = "/merchandiser/shelfDisplay/";

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href={backBtnUrl}>
          <Icon icon="lucide:arrow-left" width={24} />
        </Link>
        <h1 className="text-xl font-semibold mb-1">
          {isEditMode ? "Edit Shelf" : "Add Shelf"}
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
                  } as unknown as FormikHelpers<ShelfFormValues>)
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
