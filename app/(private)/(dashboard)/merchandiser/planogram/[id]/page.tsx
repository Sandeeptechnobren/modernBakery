"use client";

import StepperForm, {
  useStepperForm,
  StepperStep,
} from "@/app/components/stepperForm";
import ContainerCard from "@/app/components/containerCard";
import InputFields from "@/app/components/inputFields";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useRouter, useParams } from "next/navigation";
import * as Yup from "yup";
import {
  Formik,
  Form,
  FormikHelpers,
  FormikErrors,
  FormikTouched,
  ErrorMessage,
} from "formik";
import { useEffect, useState } from "react";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import { Icon } from "@iconify-icon/react/dist/iconify.mjs";
import {
  addPlanogram,
  getPlanogramById,
  updatePlanogram,
} from "@/app/services/merchandiserApi";
import { useLoading } from "@/app/services/loadingContext";
import { genearateCode } from "@/app/services/allApi";

// ✅ Validation Schema
const validationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .matches(/^[A-Za-z][A-Za-z\s]*$/, "Name must start with a letter and contain only alphabets")
    .required("Name is required"),
  validFrom: Yup.string().required("Valid From is required"),
  validTo: Yup.string().required("Valid To is required"),
  muchandiser_id: Yup.array()
    .of(Yup.string().required("ID is required"))
    .min(1, "Select at least one vendor")
    .required("Vendor details are required"),
  country_id: Yup.number()
    .required("Country is required")
    .typeError("Country ID must be a number"),
});

// ✅ Step-wise validation schema
const stepSchemas = [
  Yup.object().shape({
    name: validationSchema.fields.name,
    validFrom: validationSchema.fields.validFrom,
    validTo: validationSchema.fields.validTo,
  }),
  Yup.object().shape({
    muchandiser_id: validationSchema.fields.muchandiser_id,
    country_id: validationSchema.fields.country_id,
  }),
];

// ✅ Type
type Planogram = {
  name: string;
  validFrom: string;
  validTo: string;
  muchandiser_id: string[];
  country_id: number;
  serial_number?: string;
};

export default function AddOrEditPlanogram() {
  const [prefix, setPrefix] = useState("PLN");
  const { companyCustomersOptions, vendorOptions } = useAllDropdownListData();
  const { showSnackbar } = useSnackbar();
  const { setLoading } = useLoading();
  const router = useRouter();
  const params = useParams();

  const isEditMode = params?.id && params.id !== "add";
  const planogramId = isEditMode ? (params?.id as string) : null;

  const steps: StepperStep[] = [
    { id: 1, label: "Planogram Details" },
    { id: 2, label: "Vendor & Country" },
  ];

  const {
    currentStep,
    nextStep,
    prevStep,
    markStepCompleted,
    isStepCompleted,
    isLastStep,
  } = useStepperForm(steps.length);

  const [planogram, setPlanogram] = useState<Planogram>({
    name: "",   
    validFrom: "",
    validTo: "",
    muchandiser_id: [],
    country_id: parseInt(companyCustomersOptions[0]?.value || "0"),
  });

  const codeGeneratedRef = useState<{ current: boolean }>({ current: false });

  // ✅ Fetching existing data (edit mode)
  useEffect(() => {
    async function fetchData() {
      if (isEditMode && planogramId) {
        setLoading(true);
        const res = await getPlanogramById(planogramId);
        setLoading(false);

        if (res.error) {
          showSnackbar(res.data?.message || "Failed to fetch planogram", "error");
        } else {
          setPlanogram({
            ...res.data,
            vender_details: res.data.vender_details.map((v: { id: number }) =>
              String(v.id)
            ),
            country_id: res.data.country_id || parseInt(companyCustomersOptions[0]?.value || "0"),
          });
        }
      } else if (!isEditMode && !codeGeneratedRef[0].current) {
        codeGeneratedRef[0].current = true;
        const res = await genearateCode({ model_name: "planogram" });
        if (res?.code) {
          setPlanogram((prev) => ({ ...prev, serial_number: res.code }));
        }
        if (res?.prefix) {
          setPrefix(res.prefix);
        }
      }
    }
    fetchData();
  }, [isEditMode, planogramId]);

  // ✅ Step validation
  const handleNext = async (values: Planogram, actions: FormikHelpers<Planogram>) => {
    try {
      const schema = stepSchemas[currentStep - 1];
      await schema.validate(values, { abortEarly: false });
      markStepCompleted(currentStep);
      nextStep();
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const fields = err.inner.map((e) => e.path);
        actions.setTouched(
          fields.reduce((acc, key) => ({ ...acc, [key!]: true }), {})
        );
        actions.setErrors(
          err.inner.reduce(
            (acc, curr) => ({ ...acc, [curr.path as keyof Planogram]: curr.message }),
            {}
          )
        );
      }
      showSnackbar("Please fix validation errors before proceeding", "error");
    }
  };

  // ✅ Final submission
  // const handleSubmit = async (values: Planogram) => {
  //   try {
  //     await validationSchema.validate(values, { abortEarly: false });

  //     const payload = {
  //       name: values.name,
  //       validFrom: values.validFrom,
  //       validTo: values.validTo,
  //       muchandiser_id: values.muchandiser_id,
  //       customer_id: Number(values.country_id),
  //     };

  //     let res;
  //     if (isEditMode && planogramId) {
  //       res = await updatePlanogram(planogramId, payload);
  //     } else {
  //       res = await addPlanogram(payload);
  //     }

  //     if (res.error) {
  //       showSnackbar(res.data?.message || "Failed to save Planogram", "error");
  //     } else {
  //       showSnackbar(
  //         `${isEditMode ? "Planogram updated" : "Planogram added"} successfully`,
  //         "success"
  //       );
  //       router.push("/merchandiser/planogram");
  //     }
  //   } catch {
  //     showSnackbar("Add Planogram failed ❌", "error");
  //   }
  // };

  // ✅ Step content render
  const renderStepContent = (
    values: Planogram,
    setFieldValue: (
      field: keyof Planogram,
      value: string | number,
      shouldValidate?: boolean
    ) => void,
    errors: FormikErrors<Planogram>,
    touched: FormikTouched<Planogram>
  ) => {
    switch (currentStep) {
      case 1:
        return (
          <ContainerCard>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
 <InputFields
  label="Name"
  name="name"
  value={values.name}
  onChange={(e) => {
    const value = e.target.value;
    // allow only letters and spaces, but prevent number/symbol at start
    if (/^[A-Za-z\s]*$/.test(value)) {
      setFieldValue("name", value);
    }
  }}
  error={touched.name && errors.name}
/>
  <ErrorMessage name="name" component="span" className="text-xs text-red-500" />
            </div>
            <div>
                  <InputFields
                required
                type="date"
                label="Valid From"
                name="validFrom"
                value={values.validFrom}
                onChange={(e) => setFieldValue("validFrom", e.target.value)}
                error={touched.validFrom && errors.validFrom}
              />
                  <ErrorMessage name="validFrom" component="span" className="text-xs text-red-500" />
            </div>
       <div>
               <InputFields
                required
                type="date"
                label="Valid To"
                name="validTo"
                value={values.validTo}
                onChange={(e) => setFieldValue("validTo", e.target.value)}
                error={touched.validTo && errors.validTo}
              />
                 <ErrorMessage name="validTo" component="span" className="text-xs text-red-500" />
       </div>
            </div>
          </ContainerCard>
        );
      case 2:
        return (
          <ContainerCard>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
<div>
                  <InputFields
                required
                label="Mechandiser"
                name="vender_details"
                value={values.muchandiser_id}
                isSingle={false}
                options={companyCustomersOptions}
                onChange={(e) => setFieldValue("muchandiser_id", e.target.value)}
                error={
                  touched.muchandiser_id
                    ? Array.isArray(errors.muchandiser_id)
                      ? errors.muchandiser_id[0]
                      : errors.muchandiser_id
                    : false
                }
              />
                
</div>
              <InputFields
                required
                label="Costomer"
                name="country_id"
                value={values.country_id.toString()}
                options={companyCustomersOptions}
                onChange={(e) =>
                  setFieldValue("country_id", Number(e.target.value))
                }
                error={
                  touched.country_id && errors.country_id ? errors.country_id : false
                }
              />
            </div>
          </ContainerCard>
        );
      default:
        return null;
    }
  };

  // ✅ Render form
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div onClick={() => router.back()} className="cursor-pointer">
            <Icon icon="lucide:arrow-left" width={24} />
          </div>
          <h1 className="text-xl font-semibold text-gray-900">
            {isEditMode ? "Edit Planogram" : "Add New Planogram"}
          </h1>
        </div>
      </div>

      {/* <Formik
        initialValues={planogram}
        validationSchema={validationSchema}
        // onSubmit={handleSubmit}
        enableReinitialize
      >
        {({
          values,
          setFieldValue,
          errors,
          touched,
          // handleSubmit: formikSubmit,
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
                } as unknown as FormikHelpers<Planogram>)
              }
              // onSubmit={() => formikSubmit()}
              showSubmitButton={isLastStep}
              showNextButton={!isLastStep}
              nextButtonText="Save & Next"
              submitButtonText={isSubmitting ? "Submitting..." : "Submit"}
            >
              {renderStepContent(values, setFieldValue, errors, touched)}
            </StepperForm>
          </Form>
        )}
      </Formik> */}
    </div>
  );
}
