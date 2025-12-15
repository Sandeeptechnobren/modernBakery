"use client";

import ContainerCard from "@/app/components/containerCard";
import InputFields from "@/app/components/inputFields";
import StepperForm, {
  StepperStep,
  useStepperForm,
} from "@/app/components/stepperForm";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react/dist/iconify.mjs";
import {
  Form,
  Formik,
  FormikErrors,
  FormikHelpers,
  FormikTouched
} from "formik";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import * as Yup from "yup";

import Loading from "@/app/components/Loading";
import { merchendiserList } from "@/app/services/allApi";
import {
  addPlanogram,
  getPlanogramById,
  shelvesDropdown,
  updatePlanogramById,
} from "@/app/services/merchandiserApi";

// ---------------- TYPES ----------------
type ShelfImage = {
  shelf_id: number;
  image: File | null;
};

type PlanogramFormValues = {
  name: string;
  valid_from: string;
  valid_to: string;
  merchendiser_ids: number[];
  customer_ids: number[];
  shelf_id: number[];
  images: Record<string, Record<string, ShelfImage[]>>;
};

type MerchandiserResponse = { id: number; name: string };
type CustomerFromBackend = {
  id: number;
  customer_code: string;
  business_name: string;
  merchendiser_ids?: string;
};
type CustomerOption = {
  value: string;
  label: string;
  merchendiser_ids: string;
  id: string;
};
type ShelfOption = {
  value: string;
  label: string;
  shelf_id: number;
  merch_id?: string;
  cust_id?: string;
};

// ---------------- VALIDATION ----------------
const validationSchema = Yup.object({
  name: Yup.string().trim().required("Name is required").max(100),
  valid_from: Yup.date()
    .required("Valid From is required")
    .typeError("Please enter a valid date"),
  valid_to: Yup.date()
    .required("Valid To is required")
    .typeError("Please enter a valid date")
    .min(
      Yup.ref("valid_from"),
      "Valid To date cannot be before Valid From date"
    ),
  merchendiser_ids: Yup.array()
    .of(Yup.number())
    .min(1, "Select at least one merchandiser"),
  customer_ids: Yup.array()
    .of(Yup.number())
    .min(1, "Select at least one customer"),
});

// Only validate specific fields for each step
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

// ---------------- COMPONENT ----------------
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
  const [merchendiserOptions, setMerchendiserOptions] = useState<
    CustomerOption[]
  >([]);
  const [shelfOptions, setShelfOptions] = useState<ShelfOption[]>([]);
  const [customerOptions, setCustomerOptions] = useState<CustomerOption[]>([]);
  const [existingImages, setExistingImages] = useState<Record<number, string>>(
    {}
  );
  const [planogramImageError, setPlanogramImageError] = useState<string | null>(null);
  const ALLOWED_LOGO_TYPES = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
    "image/svg+xml",
  ];
  const MAX_LOGO_SIZE = 1 * 1024 * 1024;


  const [initialValues, setInitialValues] = useState<PlanogramFormValues>({
    name: "",
    valid_from: "",
    valid_to: "",
    merchendiser_ids: [],
    customer_ids: [],
    shelf_id: [],
    images: {},
  });

  const {
    currentStep,
    nextStep,
    prevStep,
    markStepCompleted,
    isStepCompleted,
    isLastStep,
  } = useStepperForm(steps.length);

  // ---------------- HELPERS ----------------
  const formatCustomerLabel = (customer: CustomerFromBackend): string => {
    return `${customer.customer_code || ""} - ${customer.business_name || ""}`;
  };

  // Each image object
  type ImageObject = {
    shelf_id: number;
    image: string;
  };

  // Each custGroup is an array of ImageObjects
  type CustGroup = ImageObject[];

  // Each merchGroup is an array of CustGroups
  type MerchGroup = CustGroup[];

  // ---------------- FETCH DATA ----------------
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

        if (id && id !== "add") {
          setIsEditMode(true);
          const res = await getPlanogramById(String(id));

          if (res?.data) {
            const planogramData = res.data;

            const merchIds =
              planogramData.merchendishers?.map((m: { id: number }) => m.id) ||
              [];
            const custIds =
              planogramData.customers?.map((c: { id: number }) => c.id) || [];
            const shelfIds =
              planogramData.shelves?.map((s: { id: number }) => s.id) || [];

            // Store existing images for display
            const imagesMap: Record<number, string> = {};
            if (planogramData.images && Array.isArray(planogramData.images)) {
              planogramData.images.forEach((merchGroup: MerchGroup) => {
                console.log(merchGroup);

                merchGroup.forEach((custGroup: CustGroup) => {
                  console.log(custGroup);

                  custGroup.forEach((imgObj: ImageObject) => {
                    imagesMap[imgObj.shelf_id] = imgObj.image;
                  });
                });
              });
            }

            setExistingImages(imagesMap);

            if (merchIds.length > 0) {
              await fetchCustomers(merchIds);
            }

            setInitialValues({
              name: planogramData.name || "",
              valid_from: planogramData.valid_from
                ? planogramData.valid_from.split("T")[0]
                : "",
              valid_to: planogramData.valid_to
                ? planogramData.valid_to.split("T")[0]
                : "",
              merchendiser_ids: merchIds,
              customer_ids: custIds,
              shelf_id: shelfIds,
              images: {},
            });
          }
        } else {
          setIsEditMode(false);
        }
      } catch (err) {
        console.error(err);
        showSnackbar("Unable to fetch Planogram or merchandiser data", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, showSnackbar]);

  // ---------------- FETCH CUSTOMERS ----------------
  const fetchCustomers = async (merchIds: number[]) => {
    if (!merchIds.length) {
      setCustomerOptions([]);
      return;
    }
    try {
      const response = await shelvesDropdown({
        merchandiser_ids: merchIds.map(String),
      });

      const payloadMap = new Map<string, string[]>();
      response.data.forEach((customer: CustomerFromBackend) => {
        if (!customer?.merchendiser_ids) return;
        const merchIds = customer.merchendiser_ids
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean);
        merchIds.forEach((merchId: string) => {
          const existing = payloadMap.get(merchId) || [];
          existing.push(customer.id.toString());
          payloadMap.set(merchId, existing);
        });
      });

      const payload = Object.fromEntries(payloadMap);

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
      console.error(err);
      setCustomerOptions([]);
    }
  };

  // ---------------- STEP NAVIGATION ----------------
  const handleNext = async (
    values: PlanogramFormValues,
    actions: FormikHelpers<PlanogramFormValues>
  ) => {
    try {
      const schema = stepSchemas[currentStep - 1];
      await schema.validate(values, { abortEarly: false });

      // 🧼 Clear old validation when step changes
      actions.setTouched({});
      actions.setErrors({});

      // Continue to next step
      markStepCompleted(currentStep);
      nextStep();
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const errorMap: FormikErrors<PlanogramFormValues> = {};
        const touchedMap: FormikTouched<PlanogramFormValues> = {};

        err.inner.forEach((error) => {
          if (error.path) {
            // Only set errors for fields that exist in our form values
            const fieldName = error.path as keyof PlanogramFormValues;

            if (fieldName in values) {
              (errorMap as any)[fieldName] = error.message;
            }
            (touchedMap as any)[fieldName] = true; // Keep touched for all validated fields
          }
        });

        actions.setErrors(errorMap);
        actions.setTouched(touchedMap);

        return;
      }
    }
  };


  // ---------------- IMAGE HANDLING ----------------
  const handleImageUpload = (
    shelfId: number,
    file: File | null,
    setFieldValue: (field: keyof PlanogramFormValues, value: unknown) => void,
    values: PlanogramFormValues
  ) => {
    const shelfOption = shelfOptions.find((s) => s.shelf_id === shelfId);
    if (!shelfOption?.merch_id || !shelfOption?.cust_id) return;

    const updatedImages = { ...values.images };

    if (!updatedImages[shelfOption.merch_id]) {
      updatedImages[shelfOption.merch_id] = {};
    }
    if (!updatedImages[shelfOption.merch_id][shelfOption.cust_id]) {
      updatedImages[shelfOption.merch_id][shelfOption.cust_id] = [];
    }

    const existingIndex = updatedImages[shelfOption.merch_id][
      shelfOption.cust_id
    ].findIndex((item: ShelfImage) => item.shelf_id === shelfId);

    if (existingIndex >= 0) {
      updatedImages[shelfOption.merch_id][shelfOption.cust_id][existingIndex] =
      {
        shelf_id: shelfId,
        image: file,
      };
    } else {
      updatedImages[shelfOption.merch_id][shelfOption.cust_id].push({
        shelf_id: shelfId,
        image: file,
      });
    }

    setFieldValue("images", updatedImages);
  };

  // ---------------- SUBMIT ----------------
  const handleSubmit = async (values: PlanogramFormValues) => {
    const formData = new FormData();
    try {
      if (!values.customer_ids.length) {
        showSnackbar("Please select at least one customer", "error");
        return;
      }
      formData.append("name", values.name);
      formData.append("valid_from", values.valid_from);
      formData.append("valid_to", values.valid_to);
      formData.append("code", `PLN-${Date.now()}`);

      values.merchendiser_ids.forEach((id) =>
        formData.append("merchendisher_id[]", String(id))
      );
      values.customer_ids.forEach((id) =>
        formData.append("customer_id[]", String(id))
      );

      // Append images in the correct format
      for (const merchId in values.images) {
        for (const custId in values.images[merchId]) {
          values.images[merchId][custId].forEach(
            (imgObj: ShelfImage, index: number) => {
              if (imgObj.image instanceof File) {
                formData.append(
                  `images[${merchId}][${custId}][${index}][shelf_id]`,
                  String(imgObj.shelf_id)
                );
                formData.append(
                  `images[${merchId}][${custId}][${index}][image]`,
                  imgObj.image
                );
              }
            }
          );
        }
      }

      const res = isEditMode
        ? await updatePlanogramById(String(id), formData)
        : await addPlanogram(formData);

      if (res.error) {
        showSnackbar(res.data?.message || "Failed to save planogram", "error");
      } else {
        showSnackbar(
          isEditMode
            ? "Planogram updated successfully"
            : "Planogram added successfully",
          "success"
        );
        router.push("/planogram");
      }
    } catch (err) {
      console.error(err);
      if (formData) {
        console.error("FormData:", Object.fromEntries(formData.entries()));
      }
      console.error("Error details:", err);
      showSnackbar("Something went wrong", "error");
    }
  };

  // ---------------- RENDER ----------------
  const renderStepContent = (
    values: PlanogramFormValues,
    setFieldValue: (field: keyof PlanogramFormValues, value: unknown) => void,
    errors: FormikErrors<PlanogramFormValues>,
    touched: FormikTouched<PlanogramFormValues>
  ) => {
    switch (currentStep) {
      case 1:
        return (
          <ContainerCard>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <InputFields
                  required
                  type="text"
                  label="Name"
                  name="name"
                  value={values.name}
                  onChange={(e) => setFieldValue("name", e.target.value)}
                // error={touched.name && errors.name}
                // error={touched.name && errors.name}
                />
                {/* <ErrorMessage
                  name="name"
                  component="span"
                  className="text-xs text-red-500"
                /> */}
              </div>
              <div>
                <InputFields
                  required
                  type="date"
                  label="Valid From"
                  name="valid_from"
                  value={values.valid_from}
                  onChange={(e) => setFieldValue("valid_from", e.target.value)}
                // error={touched.valid_from && errors.valid_from}
                // error={touched.valid_from && errors.valid_from}
                />
                {/* <ErrorMessage
                  name="valid_from"
                  component="span"
                  className="text-xs text-red-500"
                /> */}
              </div>
              <div>
                <InputFields
                  disabled={!values.valid_from}
                  required
                  type="date"
                  label="Valid To"
                  name="valid_to"
                  value={values.valid_to}
                  onChange={(e) => setFieldValue("valid_to", e.target.value)}
                // error={touched.valid_to && errors.valid_to}
                // error={touched.valid_to && errors.valid_to}
                />
                {/* <ErrorMessage
                  name="valid_to"
                  component="span"
                  className="text-xs text-red-500"
                /> */}
              </div>
            </div>
          </ContainerCard>
        );
      case 2:
        return (
          <ContainerCard>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <InputFields
                  width="max-w-[500px]"
                  required
                  label="Merchandisers"
                  name="merchendiser_ids"
                  value={values.merchendiser_ids.map(String)}
                  options={merchendiserOptions}
                  isSingle={false}
                  onChange={(e) => {
                    const selectedIds = (
                      Array.isArray(e.target.value) ? e.target.value : []
                    ).map(Number);
                    setFieldValue("merchendiser_ids", selectedIds);
                    setFieldValue("customer_ids", []);
                    setFieldValue("images", {});
                    fetchCustomers(selectedIds);
                  }}
                  error={
                    touched.merchendiser_ids &&
                    (Array.isArray(errors.merchendiser_ids)
                      ? errors.merchendiser_ids[0]
                      : errors.merchendiser_ids)
                  }
                />
                {/* <ErrorMessage
                  name="merchendiser_ids"
                  component="span"
                  className="text-xs text-red-500"
                /> */}
              </div>
              <div>
                <InputFields
                  width="max-w-[500px]"
                  placeholder={
                    values.merchendiser_ids.length === 0
                      ? "A merchandiser must be selected"
                      : customerOptions.length === 0
                        ? "No customer found"
                        : ""
                  }
                  required
                  label="Customers"
                  name="customer_ids"
                  value={values.customer_ids.map(String)}
                  options={customerOptions}
                  isSingle={false}
                  disabled={
                    values.merchendiser_ids.length === 0 ||
                    customerOptions.length === 0
                  }
                  onChange={(e) => {
                    const selectedIds = (
                      Array.isArray(e.target.value) ? e.target.value : []
                    ).map(Number);
                    setFieldValue("customer_ids", selectedIds);
                    setFieldValue("images", {});
                  }}
                  error={
                    touched.customer_ids &&
                    (Array.isArray(errors.customer_ids)
                      ? errors.customer_ids[0]
                      : errors.customer_ids)
                  }
                />
                {/* <ErrorMessage
                  name="customer_ids"
                  component="span"
                  className="text-xs text-red-500"
                /> */}
              </div>
              <div className="relative">
                <InputFields
                  required
                  label="Planogram Image"
                  name="images"
                  type="file"
                  value={typeof values.images === 'string' ? values.images : ''}
                  onChange={(e) => {
                    const input = e.target as HTMLInputElement;
                    const file = input.files?.[0] ?? null;
                    setPlanogramImageError(null);
                    if (file) {
                      if (!ALLOWED_LOGO_TYPES.includes(file.type)) {
                        setPlanogramImageError('Unsupported file type. Please upload png, jpeg, webp or svg.');
                        setFieldValue('images', null as any);
                        return;
                      }
                      if (file.size > MAX_LOGO_SIZE) {
                        setPlanogramImageError('File too large. Maximum size is 1MB.');
                        setFieldValue('images', null as any);
                        return;
                      }
                      setFieldValue('images', file as any);

                    }
                  }
                  }
                />
                {planogramImageError && <div className="text-xs text-red-500 mt-1">{planogramImageError}</div>}
              </div>
            </div>
          </ContainerCard>
        );
      default:
        return null;
    }
  };

  const backBtnUrl = "/planogram";

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href={backBtnUrl}>
          <Icon icon="lucide:arrow-left" width={24} />
        </Link>
        <h1 className="text-xl font-semibold mb-1">
          {isEditMode ? "Update Planogram" : "Add Planogram"}
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
                  } as FormikHelpers<PlanogramFormValues>)
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
