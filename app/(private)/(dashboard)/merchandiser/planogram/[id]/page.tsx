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
import Image from "next/image";
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
  shelvesDropdown,
  shelfList,
} from "@/app/services/merchandiserApi";
import Loading from "@/app/components/Loading";

// ---------------- TYPES ----------------

// Form values for Formik
type PlanogramfFormValues = {
  name: string;
  valid_from: string;
  valid_to: string;
  merchendiser_ids: number[];
  customer_ids: number[];
  shelf_id: number[];
};

// Backend responses
type MerchandiserResponse = { id: number; name: string };

type CustomerFromBackend = {
  id: number;
  customer_code: string;
  business_name: string;
};

type ShelfFromBackend = {
  id: number;
  code: string;
  shelf_name: string;
};

type CustomerFromEdit = {
  customers: number;
  customer_code: string;
  customer_type: string;
  owner_name: string;
};

type CustomerOption = { value: string; label: string };

// --- Planogram payload type for backend ---
export type PlanogramType = {
  name: string;
  valid_from?: string;
  valid_to?: string;
  merchendisher_id: number[]; // backend expects single merchandiser
  customer_id: number[]; // backend expects single customer
  shelf_id: number[];
};

// ---------------- VALIDATION ----------------

const validationSchema = Yup.object({
  name: Yup.string().trim().required(" Name is required").max(100),
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
  shelf_id: Yup.array().of(Yup.number()).min(1, "Select at least one Shelf"),
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

// ---------------- COMPONENT ----------------

export default function Planogram() {
  const steps: StepperStep[] = [
    { id: 1, label: "Planogram Details" },
    { id: 2, label: "Merchandiser & Customers" },
  ];

  const { id } = useParams<{ id?: string }>();
  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  const [imageUrl, setImageUrl] = useState<string[] | null>([]);
  const [shelfSelected, setShelfSelected] = useState<Number[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [merchendiserOptions, setMerchendiserOptions] = useState<
    CustomerOption[]
  >([]);
  const [shelfOptions, setShelfOptions] = useState([]);
  const [customerOptions, setCustomerOptions] = useState<CustomerOption[]>([]);
  const [initialValues, setInitialValues] = useState<PlanogramfFormValues>({
    name: "",
    valid_from: "",
    valid_to: "",
    merchendiser_ids: [],
    customer_ids: [],
    shelf_id: [],
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

  const formatShelfLabel = (shelf: {
    id: number;
    code: string;
    shelf_name: string;
  }): string => {
    return `${shelf.code || ""} - ${shelf.shelf_name || ""}`;
  };

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

            const merchIds = planogramData.merchendisher_id || [];
            if (merchIds.length > 0) {
              await fetchCustomers(merchIds);
            }

            const custIds = planogramData.customer_id || [];
            if (custIds.length > 0) {
              await fetchShelves(custIds);
            }

            // 4️⃣ NOW set initial form values
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
              shelf_id: planogramData.shelf_id || [],
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

  const fetchShelves = async (cust_ids: number[]) => {
    console.log("------------------------========", cust_ids);
    if (!cust_ids.length) {
      setShelfOptions([]);
      return;
    }
    try {
      const response = await shelfList({
        customer_ids: cust_ids.map(Number),
      });

      console.log(response);
      if (response?.status && Array.isArray(response.data)) {
        const formatted = response.data.map((shelf: ShelfFromBackend) => ({
          value: String(shelf.id),
          label: formatShelfLabel(shelf),
        }));
        console.log(formatted);
        setShelfOptions(formatted);
      } else {
        setShelfOptions([]);
      }
    } catch (err) {
      console.error(err);
      setShelfOptions([]);
    }
  };

  // ---------------- FETCH CUSTOMERS DYNAMICALLY ----------------
  const fetchCustomers = async (merchIds: number[]) => {
    if (!merchIds.length) {
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
      console.error(err);
      setCustomerOptions([]);
    }
  };

  // ---------------- STEP NAVIGATION ----------------
  const handleNext = async (
    values: PlanogramfFormValues,
    actions: FormikHelpers<PlanogramfFormValues>
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
            (
              acc: Partial<Record<keyof PlanogramfFormValues, string>>,
              curr
            ) => ({
              ...acc,
              [curr.path as keyof PlanogramfFormValues]: curr.message,
            }),
            {}
          )
        );
      }
    }
  };

  // ---------------- SUBMIT ----------------
  const handleSubmit = async (values: PlanogramfFormValues) => {
    try {
      if (!values.customer_ids.length) {
        showSnackbar("Please select at least one customer", "error");
        return;
      }

      const payload: PlanogramType = {
        name: values.name,
        valid_from: values.valid_from,
        valid_to: values.valid_to,
        merchendisher_id: values.merchendiser_ids,
        customer_id: values.customer_ids,
        shelf_id: values.shelf_id,
      };

      console.log(payload);

      const res = isEditMode
        ? await updatePlanogramById(String(id), payload)
        : await addPlanogram(payload);

      if (res.error) {
        showSnackbar(res.data?.message || "Failed to save shelf", "error");
      } else {
        showSnackbar(
          isEditMode
            ? "Planogram updated successfully"
            : "Planogram added successfully",
          "success"
        );
        router.push("/merchandiser/planogram");
      }
    } catch (err) {
      console.error(err);
      showSnackbar("Something went wrong", "error");
    }
  };

  // ---------------- RENDER ----------------
  const renderStepContent = (
    values: PlanogramfFormValues,
    setFieldValue: (
      field: keyof PlanogramfFormValues,
      value: string | number | number[]
    ) => void,
    errors: FormikErrors<PlanogramfFormValues>,
    touched: FormikTouched<PlanogramfFormValues>
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
                  label=" Name"
                  name="name"
                  value={values.name}
                  onChange={(e) => setFieldValue("name", e.target.value)}
                  error={touched.name && errors.name}
                />
                <ErrorMessage
                  name="name"
                  component="span"
                  className="text-xs text-red-500"
                />
              </div>
              <div>
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
                  className="text-xs text-red-500"
                />
              </div>
              <>{console.log(values.valid_from)}</>
              <div>
                <InputFields
                  disabled={values.valid_from == "" ? true : false}
                  required
                  type="date"
                  label="Valid To"
                  name="valid_to"
                  value={values.valid_from == "" ? "" : values.valid_to}
                  onChange={(e) => setFieldValue("valid_to", e.target.value)}
                  error={touched.valid_to && errors.valid_to}
                />
                <ErrorMessage
                  name="valid_to"
                  component="span"
                  className="text-xs text-red-500"
                />
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
                    setFieldValue("shelf_id", []);
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
                <ErrorMessage
                  name="merchendiser_ids"
                  component="span"
                  className="text-xs text-red-500"
                />
              </div>
              <div>
                <InputFields
                  placeholder={
                    values.merchendiser_ids.length == 0
                      ? "A merchandiser must be selected"
                      : customerOptions.length == 0
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
                    (values.merchendiser_ids.length === 0 && !isEditMode) ||
                    customerOptions.length == 0
                  }
                  onChange={(e) => {
                    const vals = Array.isArray(e.target.value)
                      ? e.target.value
                      : [];
                    const selectedIds = vals.map(Number);
                    setFieldValue("customer_ids", selectedIds);
                    setFieldValue("shelf_id", []);
                    setShelfSelected(selectedIds);
                    fetchShelves(selectedIds);
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
                  name="customer_ids"
                  component="span"
                  className="text-xs text-red-500"
                />
              </div>
              <div>
                <InputFields
                  placeholder={
                    values.customer_ids.length === 0
                      ? "A customer must be selected"
                      : shelfOptions.length == 0
                      ? "No shelf found"
                      : ""
                  }
                  required
                  label="shelf"
                  name="shelf_id"
                  value={values.shelf_id.map(String)}
                  options={shelfOptions}
                  disabled={
                    (values.customer_ids.length === 0 && !isEditMode) ||
                    shelfOptions.length == 0
                  }
                  isSingle={false}
                  onChange={(e) => {
                    const vals = Array.isArray(e.target.value)
                      ? e.target.value
                      : [];
                    setFieldValue("shelf_id", vals.map(Number));
                  }}
                  error={
                    touched.shelf_id && errors.shelf_id
                      ? Array.isArray(errors.shelf_id)
                        ? errors.shelf_id.join(", ")
                        : errors.shelf_id
                      : undefined
                  }
                />
                <ErrorMessage
                  name="shelf_id"
                  component="span"
                  className="text-xs text-red-500"
                />
              </div>
              {/* {shelfOptions &&
                shelfOptions.map((index, shelf) => {
                  return (
                    <div>
                      <InputFields
                        key={index}
                        label="Add Image"
                        name="image"
                        type="file"
                        onChange={(e) => {
                          const file = (e.target as HTMLInputElement)
                            .files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => {
                              setImageUrl(reader.result as string);
                              setFieldValue(
                                "image",
                                (e.target as HTMLInputElement).files?.[0]
                              );
                            };
                            reader.readAsDataURL(file);
                          } else {
                            setImageUrl(null);
                            setFieldValue("image", null);
                          }
                        }}
                      />
                      <ErrorMessage
                        name="image"
                        component="span"
                        className="text-xs text-red-500"
                      />
                      {imageUrl ? (
                        <div className="flex flex-col gap-[10px]">
                          <Image
                            width={128}
                            height={128}
                            src={imageUrl}
                            alt="Planogram"
                            className="mt-2 h-32 w-32 object-cover rounded-xl bg-blue-100"
                          />
                        </div>
                      ) : (
                        <div className="mt-2 h-32 w-32 flex items-center justify-center rounded-xl bg-gray-200 text-gray-500">
                          No Image
                        </div>
                      )}
                    </div>
                  );
                })} */}
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
                  } as unknown as FormikHelpers<PlanogramfFormValues>)
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
