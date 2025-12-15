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
  shelf_id: Yup.array().of(Yup.number()).min(1, "Select at least one Shelf"),
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
    shelf_id: validationSchema.fields.shelf_id,
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
  const [shelfPayload, setShelfPayload] = useState<{
    customer_groups: { [key: string]: string[] };
  }>();
  const [merchendiserOptions, setMerchendiserOptions] = useState<
    CustomerOption[]
  >([]);
  const [shelfOptions, setShelfOptions] = useState<ShelfOption[]>([]);
  const [customerOptions, setCustomerOptions] = useState<CustomerOption[]>([]);
  const [existingImages, setExistingImages] = useState<Record<number, string>>(
    {}
  );

  console.log(shelfPayload);

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
      setShelfPayload({ customer_groups: payload });

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

  // ---------------- FETCH SHELVES ----------------
  const fetchShelves = async (payload: {
    customer_groups: {
      [key: string]: string[];
    };
  }) => {
    if (!payload) {
      setShelfOptions([]);
      return;
    }
    try {
      const response = await shelfList(payload);
      const shelves: ShelfOption[] = [];

      // Flatten the nested structure
      for (const merchId in response.data) {
        for (const custId in response.data[merchId]) {
          response.data[merchId][custId].forEach(
            (shelf: { shelf_id: number; shelf_name: string; code: string }) => {
              console.log(shelf);
              shelves.push({
                value: String(shelf.shelf_id),
                label: `${shelf.code || ""} - ${shelf.shelf_name || ""}`,
                shelf_id: shelf.shelf_id,
                merch_id: merchId,
                cust_id: custId,
              });
            }
          );
        }
      }

      setShelfOptions(shelves);
    } catch (err) {
      console.error(err);
      setShelfOptions([]);
    }
  };

  useEffect(() => {
    if (shelfPayload) {
      fetchShelves(shelfPayload);
    }
  }, [shelfPayload]);

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
    try {
      if (!values.customer_ids.length) {
        showSnackbar("Please select at least one customer", "error");
        return;
      }

      const formData = new FormData();
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
      values.shelf_id.forEach((id) =>
        formData.append("shelf_id[]", String(id))
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
        router.push("/merchandiser/planogram");
      }
    } catch (err) {
      console.error(err);
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
                    setFieldValue("shelf_id", []);
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
                    setFieldValue("shelf_id", []);
                    setFieldValue("images", {});
                    shelfPayload && fetchShelves(shelfPayload);
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
              <div>
                <InputFields
                  width="max-w-[500px]"
                  placeholder={
                    values.customer_ids.length === 0
                      ? "A customer must be selected"
                      : shelfOptions.length === 0
                        ? "No shelf found"
                        : ""
                  }
                  required
                  label="Shelf"
                  name="shelf_id"
                  value={values.shelf_id.map(String)}
                  options={shelfOptions}
                  disabled={
                    values.customer_ids.length === 0 ||
                    shelfOptions.length === 0
                  }
                  isSingle={false}
                  onChange={(e) => {
                    const selectedIds = (
                      Array.isArray(e.target.value) ? e.target.value : []
                    ).map(Number);
                    setFieldValue("shelf_id", selectedIds);
                  }}
                // error={
                //   touched.shelf_id &&
                //   (Array.isArray(errors.shelf_id)
                //     ? errors.shelf_id[0]
                //     : errors.shelf_id)
                // }
                />
                {/* <ErrorMessage
                  name="shelf_id"
                  component="span"
                  className="text-xs text-red-500"
                /> */}

                {/* Selected shelves with image upload */}
                {values.shelf_id.length > 0 && (
                  <div className="col-span-full w-full mt-4 p-4 border border-gray-300 rounded-lg bg-gray-50">
                    <h3 className="font-medium mb-4">
                      Selected Shelves ({values.shelf_id.length}):
                    </h3>

                    {/* Flex wrap grid style */}
                    <div className="flex flex-wrap gap-4">
                      {values.shelf_id.map((shelfId) => {
                        const shelf = shelfOptions.find(
                          (s) => s.shelf_id === shelfId
                        );
                        const currentImage = values.images[
                          shelf?.merch_id || ""
                        ]?.[shelf?.cust_id || ""]?.find(
                          (img: ShelfImage) => img.shelf_id === shelfId
                        )?.image;
                        const existingImage = existingImages[shelfId];

                        return (
                          <div
                            key={shelfId}
                            className="flex-1 min-w-[250px] max-w-[320px] p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all"
                          >
                            <div className="mb-3">
                              <h4 className="font-medium text-gray-800 text-base truncate">
                                {shelf?.label}
                              </h4>
                              <p className="text-xs text-gray-500">
                                Shelf ID: {shelfId}
                              </p>
                            </div>

                            <div className="mt-2">
                              <InputFields
                                label="Add Image"
                                name={`image_${shelfId}`}
                                type="file"
                                onChange={(e) => {
                                  const file =
                                    (e.target as HTMLInputElement).files?.[0] ||
                                    null;
                                  handleImageUpload(
                                    shelfId,
                                    file,
                                    setFieldValue,
                                    values
                                  );
                                }}
                              />

                              {(currentImage || existingImage) && (
                                <div className="flex flex-col items-start gap-2 mt-3">
                                  <Image
                                    width={128}
                                    height={128}
                                    src={
                                      currentImage
                                        ? URL.createObjectURL(currentImage)
                                        : process.env.NEXT_PUBLIC_API_URL +
                                        existingImage || ""
                                    }
                                    alt={`Shelf ${shelfId}`}
                                    className="h-32 w-32 object-cover rounded-lg border bg-gray-100"
                                  />
                                  {currentImage && (
                                    <span className="text-xs text-green-600">
                                      {currentImage.name}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
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
