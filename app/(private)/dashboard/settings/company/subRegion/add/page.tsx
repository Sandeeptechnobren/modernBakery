"use client";

import React, { useState } from "react";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Formik, Form, ErrorMessage, type FormikHelpers } from "formik";
import * as Yup from "yup";

// Components
import ContainerCard from "@/app/components/containerCard";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import InputFields from "@/app/components/inputFields";
import IconButton from "@/app/components/iconButton";
import SettingPopUp from "@/app/components/settingPopUp";

// Contexts & Services
import { useSnackbar } from "@/app/services/snackbarContext";
import { addArea } from "@/app/services/allApi";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";

// ✅ Yup Validation Schema
const SubRegionSchema = Yup.object().shape({
  areacode: Yup.string().required("SubRegion code is required."),
  companyName: Yup.string().required("SubRegion name is required."),
  status: Yup.string().required("Status is required."),
  region: Yup.string().required("Please select a region."),
});

// ✅ Types
type SubRegionFormValues = {
  areacode: string;
  companyName: string;
  status: string;
  region: string;
};

export default function AddSubRegion() {
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const { regionOptions } = useAllDropdownListData();
  const [isOpen, setIsOpen] = useState(false);

  // ✅ Initial Form Values
  const initialValues: SubRegionFormValues = {
    areacode: "",
    companyName: "",
    status: "1",
    region: "",
  };

  // ✅ Handle Submit
  const handleSubmit = async (
    values: SubRegionFormValues,
    { setSubmitting }: FormikHelpers<SubRegionFormValues>
  ) => {
    try {
      const area_code = values.areacode;
      const area_name = values.companyName;
      const region_id = Number(values.region);
      const status = Number(values.status);

      if (!area_code || !area_name || !region_id) {
        showSnackbar("Please fill all required fields.", "error");
        setSubmitting(false);
        return;
      }

      const payload = {
        area_code,
        area_name,
        region_id,
        status,
      };

      console.log("👉 Sending payload:", payload);

      const res = await addArea(payload);

      if (res?.errors) {
        const errs: string[] = [];
        for (const key in res.errors) {
          errs.push(...res.errors[key]);
        }
        showSnackbar(errs.join(" | "), "error");
        console.error("API validation errors:", res.errors);
        setSubmitting(false);
        return;
      }

      showSnackbar("SubRegion added successfully ✅", "success");
      router.push("/dashboard/settings/company/subRegion");
    } catch (error: unknown) {
      console.error("Add SubRegion failed ❌", error);
      showSnackbar("Failed to add SubRegion", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full h-full overflow-x-hidden p-4">
      {/* ✅ Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/settings/company/subRegion">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">
            Add New Sub Region
          </h1>
        </div>
      </div>

      {/* ✅ Formik Wrapper */}
      <Formik
        initialValues={initialValues}
        validationSchema={SubRegionSchema}
        onSubmit={handleSubmit}
      >
        {({ handleSubmit, values, setFieldValue, isSubmitting }) => (
          <Form onSubmit={handleSubmit}>
            <ContainerCard>
              <h2 className="text-lg font-semibold mb-6">Sub Region Details</h2>

              <div className="flex items-end gap-2 max-w-4xl flex-wrap">
                {/* SubRegion Code */}
                <div className="w-full">
                  <InputFields
                    name="areacode"
                    label="SubRegion Code"
                    value={values.areacode}
                    onChange={(e) => setFieldValue("areacode", e.target.value)}
                  />
                  <ErrorMessage
                    name="areacode"
                    component="span"
                    className="text-xs text-red-500"
                  />
                  <IconButton
                    bgClass="white"
                    className="mb-2 cursor-pointer text-[#252B37]"
                    icon="mi:settings"
                    onClick={() => setIsOpen(true)}
                  />
                  <SettingPopUp
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                    title="SubRegion Code"
                  />
                </div>

                {/* SubRegion Name */}
                <div>
                  <InputFields
                    name="companyName"
                    label="SubRegion Name"
                    value={values.companyName}
                    onChange={(e) =>
                      setFieldValue("companyName", e.target.value)
                    }
                  />
                  <ErrorMessage
                    name="companyName"
                    component="span"
                    className="text-xs text-red-500"
                  />
                </div>

                {/* Status */}
                <div>
                  <InputFields
                    label="Status"
                    name="status"
                    value={values.status}
                    onChange={(e) => setFieldValue("status", e.target.value)}
                    options={[
                      { value: "1", label: "Active" },
                      { value: "0", label: "Inactive" },
                    ]}
                  />
                  <ErrorMessage
                    name="status"
                    component="span"
                    className="text-xs text-red-500"
                  />
                </div>

                {/* Region */}
                <div>
                  <InputFields
                    label="Region"
                    name="region"
                    value={values.region}
                    onChange={(e) => setFieldValue("region", e.target.value)}
                    options={regionOptions}
                  />
                  <ErrorMessage
                    name="region"
                    component="span"
                    className="text-xs text-red-500"
                  />
                </div>
              </div>
            </ContainerCard>

            {/* ✅ Footer Actions */}
            <div className="flex justify-end gap-4 mt-6">
              <button
                type="reset"
                className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <SidebarBtn
                label={isSubmitting ? "Submitting..." : "Submit"}
                isActive={!isSubmitting}
                leadingIcon="mdi:check"
                type="submit"
              />
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
