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
  FormikHelpers,
  FormikErrors,
  FormikTouched,
} from "formik";
import { useState, useEffect } from "react";
import * as Yup from "yup";

import {
  merchandiserList,
  addShelves,
  getShelfById,
  updateShelfById,
  shelvesDropdown,
} from "@/app/services/merchandiserApi";
import Loading from "@/app/components/Loading";

// --------------------- TYPES ---------------------
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
  owner_name: string;
};
type CustomerOption = { value: string; label: string };

// --------------------- VALIDATION ---------------------
const validationSchema = Yup.object({
  shelf_name: Yup.string().trim().required("Shelf Name is required"),
  height: Yup.number().required("Height is required"),
  width: Yup.number().required("Width is required"),
  depth: Yup.number().required("Depth is required"),

  valid_from: Yup.date().nullable().required("Valid From is required"),

  valid_to: Yup.date()
    .nullable()
    .required("Valid To is required")
    .min(Yup.ref("valid_from"), "Valid To must be after Valid From"),

  merchendiser_ids: Yup.array()
    .of(Yup.number())
    .min(1, "Select at least one Merchandiser"),

  customer_ids: Yup.array().of(Yup.number()).min(1, "Select at least one Customer"),
});

// Step-wise schemas
const stepSchemas = [
  Yup.object().shape({
    shelf_name: (validationSchema as any).fields.shelf_name,
    height: (validationSchema as any).fields.height,
    width: (validationSchema as any).fields.width,
    depth: (validationSchema as any).fields.depth,
    valid_from: (validationSchema as any).fields.valid_from,
    valid_to: (validationSchema as any).fields.valid_to,
  }),

  Yup.object().shape({
    merchendiser_ids: (validationSchema as any).fields.merchendiser_ids,
    customer_ids: (validationSchema as any).fields.customer_ids,
  }),
];

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// --------------------- COMPONENT ---------------------
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
  const [merchandiserOptions, setMerchandiserOptions] = useState<CustomerOption[]>(
    []
  );
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

  // Format label for customer dropdown
  const formatCustomerLabel = (customer: CustomerFromBackend | CustomerFromEdit) => {
    if ("business_name" in customer)
      return `${customer.customer_code} - ${customer.business_name}`;
    return `${customer.customer_code} - ${customer.owner_name}`;
  };

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Merchandisers
        const merchRes = await merchandiserList();
        setMerchandiserOptions(
          merchRes.data?.map((m: MerchandiserResponse) => ({
            value: String(m.id),
            label: m.name,
          })) || []
        );

        // If Edit Mode
        if (id && id !== "add") {
          setIsEditMode(true);

          const res = await getShelfById(String(id));

          if (res?.data) {
            const shelf = res.data;

            setInitialValues({
              shelf_name: shelf.shelf_name || "",
              height: shelf.height ?? 0,
              width: shelf.width ?? 0,
              depth: shelf.depth ?? 0,
              valid_from: shelf.valid_from?.split("T")[0] || "",
              valid_to: shelf.valid_to?.split("T")[0] || "",
              merchendiser_ids: shelf.merchendiser_ids || [],
              customer_ids: shelf.customer_ids || [],
            });

            setCustomerOptions(
              shelf.customers?.map((c: CustomerFromEdit) => ({
                value: String(c.customers),
                label: formatCustomerLabel(c),
              })) || []
            );
          }
        }
      } catch (err) {
        showSnackbar("Failed to fetch shelf / merchandiser", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Fetch customers when merchandiser changes
  const fetchCustomers = async (merchIds: number[]) => {
    if (!merchIds.length) return setCustomerOptions([]);

    try {
      const res = await shelvesDropdown({ merchendiser_ids: merchIds.map(String) });

      if (res?.data) {
        setCustomerOptions(
          res.data.map((c: CustomerFromBackend) => ({
            value: String(c.id),
            label: formatCustomerLabel(c),
          }))
        );
      }
    } catch {
      setCustomerOptions([]);
    }
  };

  // Next Step Validation
  const handleNext = async (
    values: ShelfFormValues,
    actions: Partial<FormikHelpers<ShelfFormValues>>
  ) => {
    try {
      await stepSchemas[currentStep - 1].validate(values, { abortEarly: false });
      markStepCompleted(currentStep);
      nextStep();
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const touchedFields = err.inner.reduce((acc: any, curr) => {
          acc[curr.path!] = true;
          return acc;
        }, {});
        const errorFields = err.inner.reduce((acc: any, curr) => {
          acc[curr.path!] = curr.message;
          return acc;
        }, {});
        actions.setTouched && actions.setTouched(touchedFields as any);
        actions.setErrors && actions.setErrors(errorFields as any);
      }
    }
  };

  // Submit Form
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

      if (res?.error) {
        showSnackbar(res.data?.message || "Failed to save shelf", "error");
      } else {
        showSnackbar(isEditMode ? "Shelf updated" : "Shelf added", "success");
        router.push("/merchandiser/shelfDisplay");
      }
    } catch {
      showSnackbar("Something went wrong", "error");
    }
  };

  // --------------------- STEP UI ---------------------
  const renderStepContent = (
    values: ShelfFormValues,
    setFieldValue: (field: string, value: any) => void,
    errors: FormikErrors<ShelfFormValues>,
    touched: FormikTouched<ShelfFormValues>,
    handleBlur: (e: any) => void
  ) => {
    // ---------------- STEP 1 ----------------
    if (currentStep === 1) {
      return (
        <ContainerCard>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(["shelf_name", "height", "width", "depth"] as const).map((field) => {
              // determine value as string because InputFields expects string/string[] for value prop
              const rawValue = (values as any)[field];
              const valueForInput =
                typeof rawValue === "number" ? String(rawValue ?? "") : rawValue ?? "";

              const errorMsg =
                touched[field] && errors[field] ? String((errors as any)[field]) : undefined;

              return (
                <InputFields
                  key={field}
                  required
                  type={field === "shelf_name" ? "text" : "number"}
                  label={
                    capitalize(String(field).replace("_", " ")) +
                    (field !== "shelf_name" ? " (cm)" : "")
                  }
                  name={String(field)}
                  value={valueForInput}
                  onChange={(e: any) => {
                    // e.target.value may be string or string[]
                    const targetValue = e?.target?.value;
                    if (field === "shelf_name") {
                      setFieldValue(field, targetValue ?? "");
                    } else {
                      // numeric fields - convert to number if possible else 0
                      const num =
                        targetValue === "" || targetValue === undefined
                          ? 0
                          : Number(targetValue);
                      setFieldValue(field, Number.isNaN(num) ? 0 : num);
                    }
                  }}
                  onBlur={handleBlur}
                  error={errorMsg}
                />
              );
            })}

            {/* Valid From */}
            <InputFields
              required
              type="date"
              label="Valid From"
              name="valid_from"
              value={values.valid_from ?? ""}
              onChange={(e: any) => setFieldValue("valid_from", e?.target?.value ?? "")}
              onBlur={handleBlur}
              error={
                touched.valid_from && errors.valid_from ? String(errors.valid_from) : undefined
              }
            />

            {/* Valid To */}
            <InputFields
              required
              type="date"
              label="Valid To"
              name="valid_to"
              value={values.valid_to ?? ""}
              onChange={(e: any) => setFieldValue("valid_to", e?.target?.value ?? "")}
              onBlur={handleBlur}
              disabled={!values.valid_from}
              error={touched.valid_to && errors.valid_to ? String(errors.valid_to) : undefined}
            />
          </div>
        </ContainerCard>
      );
    }

    // ---------------- STEP 2 ----------------
    return (
      <ContainerCard>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Merchandiser */}
          <InputFields
            required
            width="max-w-[500px]"
            label="Merchandiser"
            name="merchendiser_ids"
            value={values.merchendiser_ids.map(String)} // string[]
            options={merchandiserOptions}
            isSingle={false}
            onChange={(e: any) => {
              const raw = e?.target?.value;
              // raw may be string or string[]
              const arr = Array.isArray(raw) ? raw : typeof raw === "string" ? [raw] : [];
              const ids = arr.map((v) => Number(v)).filter((n) => !Number.isNaN(n));
              setFieldValue("merchendiser_ids", ids);
              setFieldValue("customer_ids", []);
              fetchCustomers(ids);
            }}
            onBlur={handleBlur}
            error={
              touched.merchendiser_ids && errors.merchendiser_ids
                ? String(errors.merchendiser_ids)
                : undefined
            }
          />

          {/* Customers */}
          <InputFields
            required
            width="max-w-[500px]"
            label="Customers"
            name="customer_ids"
            value={values.customer_ids.map(String)}
            options={customerOptions}
            disabled={!values.merchendiser_ids.length}
            isSingle={false}
            onChange={(e: any) => {
              const raw = e?.target?.value;
              const arr = Array.isArray(raw) ? raw : typeof raw === "string" ? [raw] : [];
              const ids = arr.map((v) => Number(v)).filter((n) => !Number.isNaN(n));
              setFieldValue("customer_ids", ids);
            }}
            onBlur={handleBlur}
            error={
              touched.customer_ids && errors.customer_ids ? String(errors.customer_ids) : undefined
            }
          />
        </div>
      </ContainerCard>
    );
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/merchandiser/shelfDisplay">
          <Icon icon="lucide:arrow-left" width={24} />
        </Link>
        <h1 className="text-xl font-semibold">{isEditMode ? "Update Shelf" : "Add Shelf"}</h1>
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
          {({ values, setFieldValue, errors, touched, handleBlur, handleSubmit, setErrors, setTouched }) => (
            <Form>
              <StepperForm
                steps={steps.map((s) => ({
                  ...s,
                  isCompleted: isStepCompleted(s.id),
                }))}
                currentStep={currentStep}
                onBack={prevStep}
                onNext={() =>
                  handleNext(values, { setTouched, setErrors } as unknown as FormikHelpers<
                    ShelfFormValues
                  >)
                }
                onSubmit={handleSubmit}
                showSubmitButton={isLastStep}
                showNextButton={!isLastStep}
                nextButtonText="Save & Next"
                submitButtonText="Submit"
              >
                {renderStepContent(values, setFieldValue, errors, touched, handleBlur)}
              </StepperForm>
            </Form>
          )}
        </Formik>
      )}
    </div>
  );
}
