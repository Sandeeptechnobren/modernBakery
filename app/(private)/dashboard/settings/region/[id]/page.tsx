"use client";

import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Formik, Form, ErrorMessage, type FormikHelpers } from "formik";
import * as Yup from "yup";
import InputFields from "@/app/components/inputFields";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import Loading from "@/app/components/Loading";
import { useSnackbar } from "@/app/services/snackbarContext";
import { addRegion, getRegionById, updateRegion } from "@/app/services/allApi";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";

const RegionSchema = Yup.object().shape({
  region_name: Yup.string().required("Region Name is required."),
  status: Yup.string().required("Status is required."),
  country_id: Yup.string().required("Please select a country."),
});

type RegionFormValues = {
  region_name: string;
  status: string;
  country_id: string;
};

export default function AddEditRegion() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const { showSnackbar } = useSnackbar();
  const { onlyCountryOptions } = useAllDropdownListData();

  // Determine if edit mode (edit if id is present and not 'add')
  const routeId = params?.id ?? "";
  const isEditMode = routeId && routeId !== "add";
  const queryId = isEditMode ? routeId : "";

  const [initialValues, setInitialValues] = useState<RegionFormValues>({
    region_name: "",
    status: "1",
    country_id: "",
  });

  // Fetch region data if editing
  useEffect(() => {
    if (!isEditMode) return;
    let mounted = true;
    setLoading(true);
    (async () => {
      try {
        const res = await getRegionById(String(queryId));
        if (!mounted) return;
        setInitialValues({
          region_name: res?.data.region_name || "",
          status: res?.data.status?.toString() ?? "1",
          country_id: res?.data.country_id?.toString() ?? "",
        });
      } catch (err) {
        console.error("Failed to fetch Region by id", err);
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [isEditMode, queryId]);

  // Submit handler
  const handleSubmit = async (
    values: RegionFormValues,
    { setSubmitting }: FormikHelpers<RegionFormValues>
  ) => {
    try {
      const payload = {
        region_name: values.region_name.trim(),
        status: Number(values.status),
        country_id: Number(values.country_id),
      };
      if (isEditMode) {
        await updateRegion(String(queryId), payload);
        showSnackbar("Region updated successfully ✅", "success");
      } else {
        await addRegion(payload);
        showSnackbar("Region added successfully ✅", "success");
      }
      router.push("/dashboard/settings/region");
    } catch (error) {
      showSnackbar(isEditMode ? "Failed to update Region" : "Failed to add Region", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (isEditMode && loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="w-full h-full p-4">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/settings/region">
          <Icon icon="lucide:arrow-left" width={24} />
        </Link>
        <h1 className="text-xl font-semibold">
          {isEditMode ? "Edit Region" : "Add New Region"}
        </h1>
      </div>
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={RegionSchema}
        onSubmit={handleSubmit}
      >
        {({ values, setFieldValue, isSubmitting }) => (
          <Form>
            <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 mb-6">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-800 mb-4">Region Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <InputFields
                      label="Region Name"
                      name="region_name"
                      value={values.region_name}
                      onChange={(e) => setFieldValue("region_name", e.target.value)}
                    />
                    <ErrorMessage
                      name="region_name"
                      component="span"
                      className="text-xs text-red-500"
                    />
                  </div>
                   <div>
                    <InputFields
                      label="Country"
                      name="country_id"
                      value={values.country_id}
                      onChange={(e) => setFieldValue("country_id", e.target.value)}
                      options={onlyCountryOptions}
                    />
                    <ErrorMessage
                      name="country_id"
                      component="span"
                      className="text-xs text-red-500"
                    />
                  </div>
                  <div>
                    <InputFields
                      label="Status"
                      name="status"
                      type="radio"
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
                 
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button
                type="reset"
                className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <SidebarBtn
                label={isEditMode ? (isSubmitting ? "Updating..." : "Update") : (isSubmitting ? "Submitting..." : "Submit")}
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
