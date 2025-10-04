"use client";
import { useSnackbar } from "@/app/services/snackbarContext";
import { addPricingHeader, addPricingDetail,editPricingDetail,editPricingHeader,pricingHeaderById,pricingDetailById } from "@/app/services/allApi";
import InputFields from "@/app/components/inputFields";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import Loading from "@/app/components/Loading";
import { Formik, Form, ErrorMessage, type FormikHelpers } from "formik";
import * as Yup from "yup";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@iconify-icon/react";
import { useRouter } from "next/navigation";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import StepperForm, { useStepperForm, StepperStep } from "@/app/components/stepperForm";

// Step 1: Pricing Header fields and validation
const PricingHeaderSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  description: Yup.string().required("Description is required"),
  start_date: Yup.string().required("Start date is required"),
  end_date: Yup.string().required("End date is required"),
  apply_on: Yup.number().required("Apply On is required"),
  warehouse_id: Yup.number().required("Warehouse is required"),
  item_type: Yup.number().required("Item Type is required"),
  status: Yup.number().required("Status is required"),
});

// Step 2: Pricing Detail fields and validation
const PricingDetailSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  item_id: Yup.number().required("Item is required"),
  buom_ctn_price: Yup.number().required("BUOM CTN Price is required"),
  auom_pc_price: Yup.number().required("AUOM PC Price is required"),
  status: Yup.number().required("Status is required"),
});

export default function PricingDetailPage() {
  const { itemOptions, warehouseOptions } = useAllDropdownListData();
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  // Get pricingDetail uuid from URL
  const detailUuid = typeof window !== "undefined" ? window.location.pathname.split("/").pop() : undefined;
  const isEditMode = detailUuid && detailUuid !== "new";
  const steps: StepperStep[] = [
    { id: 1, label: "Pricing Header" },
    { id: 2, label: "Pricing Detail" },
  ];
  const {
    currentStep,
    nextStep,
    prevStep,
    markStepCompleted,
    isStepCompleted,
    isLastStep
  } = useStepperForm(steps.length);
  const [headerId, setHeaderId] = useState<number | null>(null);
  const [headerUuid, setHeaderUuid] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [headerInitialValues, setHeaderInitialValues] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    apply_on: "",
    warehouse_id: "",
    item_type: "",
    status: 1,
  });
  const [detailInitialValues, setDetailInitialValues] = useState({
    name: "",
    item_id: "",
    buom_ctn_price: "",
    auom_pc_price: "",
    status: 1,
  });

  useEffect(() => {
    const fetchData = async () => {
      if (isEditMode && detailUuid) {
        setLoading(true);
        try {
          // 1. Fetch detail by uuid
          const detailRes = await pricingDetailById(detailUuid);
          if (detailRes && detailRes.data) {
            setDetailInitialValues({
              name: detailRes.data.name || "",
              item_id: detailRes.data.item_id?.toString() ?? "",
              buom_ctn_price: detailRes.data.buom_ctn_price?.toString() ?? "",
              auom_pc_price: detailRes.data.auom_pc_price?.toString() ?? "",
              status: detailRes.data.status ?? 1,
            });
            // 2. Use header_id from detail to fetch header and its uuid
            if (detailRes.data.header_id) {
              setHeaderId(detailRes.data.header_id);
              const headerRes = await pricingHeaderById(detailRes.data.header_id);
              if (headerRes && headerRes.data) {
                setHeaderInitialValues({
                  name: headerRes.data.name || "",
                  description: headerRes.data.description || "",
                  start_date: headerRes.data.start_date || "",
                  end_date: headerRes.data.end_date || "",
                  apply_on: headerRes.data.apply_on?.toString() ?? "",
                  warehouse_id: headerRes.data.warehouse_id?.toString() ?? "",
                  item_type: headerRes.data.item_type?.toString() ?? "",
                  status: headerRes.data.status ?? 1,
                });
                if (headerRes.data.uuid) {
                  setHeaderUuid(headerRes.data.uuid);
                }
              }
            }
          }
        } catch (err) {
          showSnackbar("Failed to fetch pricing data", "error");
        }
        setLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, detailUuid]);

  const applyOnOptions = [
    { value: "1", label: "Customer" },
    { value: "2", label: "Channel" },
    { value: "3", label: "Category" },
  ];


  const handleHeaderSubmit = async (values: typeof headerInitialValues, { setSubmitting }: FormikHelpers<typeof headerInitialValues>) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        apply_on: Number(values.apply_on),
        warehouse_id: Number(values.warehouse_id),
        item_type: Number(values.item_type),
        status: Number(values.status),
      };
      let res;
      if (isEditMode && headerUuid) {
        res = await editPricingHeader(headerUuid, payload);
      } else {
        res = await addPricingHeader(payload);
      }
      if (res?.error) {
        showSnackbar(res?.data?.message || (isEditMode ? "Failed to update pricing header" : "Failed to add pricing header"), "error");
      } else {
        showSnackbar(isEditMode ? "Pricing header updated successfully" : "Pricing header added successfully", "success");
        setHeaderId(res?.data?.id || headerId);
        if (res?.data?.uuid) setHeaderUuid(res.data.uuid);
        markStepCompleted(1);
        nextStep();
      }
    } catch (err) {
      showSnackbar(isEditMode ? "Update Pricing Header failed" : "Add Pricing Header failed", "error");
    }
    setLoading(false);
    setSubmitting(false);
  };

  const handleDetailSubmit = async (values: typeof detailInitialValues, { setSubmitting }: FormikHelpers<typeof detailInitialValues>) => {
    if (!headerId) {
      showSnackbar("Header ID missing. Please complete step 1 first.", "error");
      setSubmitting(false);
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...values,
        header_id: headerId,
        item_id: Number(values.item_id),
        buom_ctn_price: Number(values.buom_ctn_price),
        auom_pc_price: Number(values.auom_pc_price),
        status: Number(values.status),
      };
      let res;
      if (isEditMode && headerId) {
        res = await editPricingDetail(headerId.toString(), payload);
      } else {
        res = await addPricingDetail(payload);
      }
      if (res?.error) {
        showSnackbar(res?.data?.message || (isEditMode ? "Failed to update pricing detail" : "Failed to add pricing detail"), "error");
      } else {
        showSnackbar(isEditMode ? "Pricing detail updated successfully" : "Pricing detail added successfully", "success");
        router.push("/dashboard/master/pricing");
      }
    } catch (err) {
      showSnackbar(isEditMode ? "Update Pricing Detail failed" : "Add Pricing Detail failed", "error");
    }
    setLoading(false);
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/master/pricing">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">
            {currentStep === 1 ? (isEditMode ? "Edit Pricing Header" : "Add Pricing Header") : (isEditMode ? "Edit Pricing Detail" : "Add Pricing Detail")}
          </h1>
        </div>
      </div>
      <StepperForm
        steps={steps.map(step => ({ ...step, isCompleted: isStepCompleted(step.id) }))}
        currentStep={currentStep}
        onStepClick={() => {}}
        onBack={prevStep}
        onNext={() => {}}
        onSubmit={() => {}}
        showSubmitButton={false}
        showNextButton={false}
        nextButtonText="Save & Next"
        submitButtonText={isEditMode ? "Update" : "Submit"}
      >
        {currentStep === 1 && (
          <Formik
            enableReinitialize
            initialValues={headerInitialValues}
            validationSchema={PricingHeaderSchema}
            onSubmit={handleHeaderSubmit}
          >
            {({ handleSubmit, values, setFieldValue, errors, touched }) => (
              <Form onSubmit={handleSubmit}>
                <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 mb-6">
                  <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-800 mb-4">Pricing Header Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <InputFields required label="Name" name="name" value={values.name} onChange={e => setFieldValue("name", e.target.value)} />
                        <ErrorMessage name="name" component="span" className="text-xs text-red-500" />
                      </div>
                      <div>
                        <InputFields required label="Description" name="description" value={values.description} onChange={e => setFieldValue("description", e.target.value)} />
                        <ErrorMessage name="description" component="span" className="text-xs text-red-500" />
                      </div>
                      <div>
                        <InputFields required label="Start Date" name="start_date" type="date" value={values.start_date} onChange={e => setFieldValue("start_date", e.target.value)} />
                        <ErrorMessage name="start_date" component="span" className="text-xs text-red-500" />
                      </div>
                      <div>
                        <InputFields required label="End Date" name="end_date" type="date" value={values.end_date} onChange={e => setFieldValue("end_date", e.target.value)} />
                        <ErrorMessage name="end_date" component="span" className="text-xs text-red-500" />
                      </div>
                      <div>
                        <InputFields required label="Apply On" name="apply_on" value={values.apply_on?.toString() ?? ""} options={applyOnOptions} onChange={e => setFieldValue("apply_on", e.target.value)} />
                        <ErrorMessage name="apply_on" component="span" className="text-xs text-red-500" />
                      </div>
                      <div>
                        <InputFields required label="Warehouse" name="warehouse_id" value={values.warehouse_id?.toString() ?? ""} options={warehouseOptions} onChange={e => setFieldValue("warehouse_id", e.target.value)} />
                        <ErrorMessage name="warehouse_id" component="span" className="text-xs text-red-500" />
                      </div>
                      <div>
                        <InputFields required label="Item Type" name="item_type" value={values.item_type?.toString() ?? ""} options={itemOptions} onChange={e => setFieldValue("item_type", e.target.value)} />
                        <ErrorMessage name="item_type" component="span" className="text-xs text-red-500" />
                      </div>
                      <div>
                        <InputFields required label="Status" name="status" value={values.status?.toString() ?? ""} options={[{ value: "1", label: "Active" }, { value: "0", label: "Inactive" }]} onChange={e => setFieldValue("status", e.target.value)} type="radio" />
                        <ErrorMessage name="status" component="span" className="text-xs text-red-500" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-4 mt-6 pr-0">
                  <button type="reset" className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100">Cancel</button>
                  <SidebarBtn label="Save & Next" isActive={true} leadingIcon="mdi:check" type="submit" />
                </div>
              </Form>
            )}
          </Formik>
        )}
        {currentStep === 2 && (
          <Formik
            enableReinitialize
            initialValues={detailInitialValues}
            validationSchema={PricingDetailSchema}
            onSubmit={handleDetailSubmit}
          >
            {({ handleSubmit, values, setFieldValue, errors, touched }) => (
              <Form onSubmit={handleSubmit}>
                <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 mb-6">
                  <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-800 mb-4">Pricing Detail</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <InputFields required label="Name" name="name" value={values.name} onChange={e => setFieldValue("name", e.target.value)} />
                        <ErrorMessage name="name" component="span" className="text-xs text-red-500" />
                      </div>
                      <div>
                        <InputFields required label="Item" name="item_id" value={values.item_id?.toString() ?? ""} options={itemOptions} onChange={e => setFieldValue("item_id", e.target.value)} />
                        <ErrorMessage name="item_id" component="span" className="text-xs text-red-500" />
                      </div>
                      <div>
                        <InputFields required label="BUOM CTN Price" name="buom_ctn_price" value={values.buom_ctn_price} onChange={e => setFieldValue("buom_ctn_price", e.target.value)} />
                        <ErrorMessage name="buom_ctn_price" component="span" className="text-xs text-red-500" />
                      </div>
                      <div>
                        <InputFields required label="AUOM PC Price" name="auom_pc_price" value={values.auom_pc_price} onChange={e => setFieldValue("auom_pc_price", e.target.value)} />
                        <ErrorMessage name="auom_pc_price" component="span" className="text-xs text-red-500" />
                      </div>
                      <div>
                        <InputFields required label="Status" name="status" value={values.status?.toString() ?? ""} options={[{ value: "1", label: "Active" }, { value: "0", label: "Inactive" }]} onChange={e => setFieldValue("status", e.target.value)} type="radio" />
                        <ErrorMessage name="status" component="span" className="text-xs text-red-500" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-4 mt-6 pr-0">
                  <button type="button" className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100" onClick={prevStep}>Back</button>
                  <SidebarBtn label={isEditMode ? "Update" : "Submit"} isActive={true} leadingIcon="mdi:check" type="submit" />
                </div>
              </Form>
            )}
          </Formik>
        )}
      </StepperForm>
    </>
  );

}