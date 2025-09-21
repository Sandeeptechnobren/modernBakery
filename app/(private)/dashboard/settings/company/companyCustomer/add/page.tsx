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
import { addRegion } from "@/app/services/allApi";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";

const RegionSchema = Yup.object().shape({
  regionName: Yup.string().required("Region name is required."),
  status: Yup.string().required("Status is required."),
  country: Yup.string().required("Please select a country."),
});

type RegionFormValues = {
  regionName: string;
  status: string;
  country: string;
};

export default function AddCompanyCustomers() {
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const { onlyCountryOptions } = useAllDropdownListData();

  const initialValues: RegionFormValues = {
    regionName: "",
    status: "1", // default Active
    country: "",
  };

  const handleSubmit = async (
    values: RegionFormValues,
    { setSubmitting }: FormikHelpers<RegionFormValues>
  ) => {
    try {
      const payload = {
        region_name: values.regionName.trim(),
        country_id: Number(values.country),
        status: Number(values.status), // send as number
      };

      console.log("Payload ->", payload);
      const res = await addRegion(payload);

      if (res?.errors) {
        const errs: string[] = [];
        for (const key in res.errors) errs.push(...res.errors[key]);
        showSnackbar(errs.join(" | "), "error");
        setSubmitting(false);
        return;
      }

      showSnackbar("Region added successfully ✅", "success");
      router.push("/dashboard/settings/region");
    } catch (error) {
      console.error(error);
      showSnackbar("Failed to add Region ❌", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full h-full p-4">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/settings/company/companyCustomer">
          <Icon icon="lucide:arrow-left" width={24} />
        </Link>
        <h1 className="text-xl font-semibold">Add New Company Customer</h1>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={RegionSchema}
        onSubmit={handleSubmit}
      >
        {({ values, setFieldValue, isSubmitting }) => (
          <Form>
            <ContainerCard>
              <h2 className="text-lg font-semibold mb-6">Company Customer Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <InputFields
                    label="SAP Code"
                    name="sapCode"
                    value={values.regionName}
                    onChange={(e) => setFieldValue("sapCode", e.target.value)}
                  />
                  <ErrorMessage
                    name="sapCode"
                    component="span"
                    className="text-xs text-red-500"
                  />
                </div>
                   <div>
                  <InputFields
                    label="Customer Code"
                    name="sapCode"
                    value={values.regionName}
                    onChange={(e) => setFieldValue("sapCode", e.target.value)}
                  />
                  <ErrorMessage
                    name="sapCode"
                    component="span"
                    className="text-xs text-red-500"
                  />
                </div>
                   <div>
                  <InputFields
                    label="Owner Name"
                    name="sapCode"
                    value={values.regionName}
                    onChange={(e) => setFieldValue("sapCode", e.target.value)}
                  />
                  <ErrorMessage
                    name="sapCode"
                    component="span"
                    className="text-xs text-red-500"
                  />
                </div>

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
                

                <div>
                  <InputFields
                    label="Country"
                    name="country"
                    value={values.country}
                    onChange={(e) => setFieldValue("country", e.target.value)}
                    options={onlyCountryOptions}
                  />
                  <ErrorMessage
                    name="country"
                    component="span"
                    className="text-xs text-red-500"
                  />
                </div>
              </div>
            </ContainerCard>

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
