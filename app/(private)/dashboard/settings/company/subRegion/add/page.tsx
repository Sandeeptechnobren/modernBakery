"use client";

import React from "react";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Formik, Form, ErrorMessage, type FormikHelpers } from "formik";
import * as Yup from "yup";
import ContainerCard from "@/app/components/containerCard";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import InputFields from "@/app/components/inputFields";
import { useSnackbar } from "@/app/services/snackbarContext";
import { addArea } from "@/app/services/allApi";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";

// ✅ Validation schema
const SubRegionSchema = Yup.object().shape({
  areacode: Yup.string().required("SubRegion name is required."),
  companyName: Yup.string().required("SubRegion name is required."),
  status: Yup.string().required("Status is required."),
  region: Yup.string().required("Please select a region."),
});

type SubRegionFormValues = {
  areacode: string;
  companyName: string;
  status: string;
  region: string;
};

export default function AddSubRegion() {
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const { regionOptions, loading } = useAllDropdownListData();

  const initialValues: SubRegionFormValues = {
    areacode: "",
    companyName: "",
    status: "1",
    region: "",
  };

  // Helper: Generate area_code (you can change logic as per requirement)
  // const generateAreaCode = () => {
  //   return "AR" + Date.now(); // Example: AR1695038291234
  // };

  const handleSubmit = async (
    values: SubRegionFormValues,
    { setSubmitting }: FormikHelpers<SubRegionFormValues>
  ) => {
    try {
      const area_code = values.areacode.trim();
      const area_name = values.companyName.trim();
      const region_id = Number(values.region);
      const status = Number(values.status);

      if (!area_code ||!area_name || !region_id) {
        showSnackbar("Please fill all required fields.", "error");
        setSubmitting(false);
        return;
      }

      const payload = {
        // area_code,
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
    } catch (error) {
      console.error("Add SubRegion failed ❌", error);
      showSnackbar("Failed to add SubRegion", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full h-full overflow-x-hidden p-4">
      {/* Header */}
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

      {/* Formik */}
      <Formik
        initialValues={initialValues}
        validationSchema={SubRegionSchema}
        onSubmit={handleSubmit}
      >
        {({ handleSubmit, values, setFieldValue, isSubmitting }) => (
          <Form onSubmit={handleSubmit}>
            <ContainerCard>
              <h2 className="text-lg font-semibold mb-6">Sub Region Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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
                <div>
                  <InputFields
                    name="arecode"
                    label="SubRegion Name"
                    value={values.areacode}
                    onChange={(e) =>
                      setFieldValue("areacode", e.target.value)
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
                  {/* <select
                    className="border px-3 py-2 rounded w-full"
                    value={values.status}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setFieldValue("status", e.target.value)
                    }
                  >
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                  </select> */}
                   <InputFields
                                                      label="Status"
                                                      name="status"
                                                      value={values.status}
                                                      // onChange={handleChange}
                                        onChange={(e) => setFieldValue("status", e.target.value)}
                  
                                                      options={[
                                                          { value: "1", label: "Active" },
                                                          { value: "0", label: "Inactive" },
                                                      ]}
                                                      // error={errors?.statusType && touched?.statusType ? errors.statusType : false}
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
                                        label="Region id"
                                        value={values.region}
                                        onChange={(e) =>
                                          setFieldValue("region", e.target.value)
                                          
                                        }
                                        options={regionOptions}
                                      />
                  {/* <select
                    className="border px-3 py-2 rounded w-full"
                    value={values.region}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setFieldValue("region", e.target.value)
                    }
                  >
                    <option value="">Select region</option>
                    {loading ? (
                      <option value="" disabled>
                        Loading...
                      </option>
                    ) : regionOptions?.length > 0 ? (
                      regionOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))
                    ) : (
                      <option value="">No options available</option>
                    )}
                  </select> */}
                  <ErrorMessage
                    name="region"
                    component="span"
                    className="text-xs text-red-500"
                  />
                </div>
              </div>
            </ContainerCard>

            {/* Footer Actions */}
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
