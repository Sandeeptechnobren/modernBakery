"use client";

import ContainerCard from "@/app/components/containerCard";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import InputFields from "@/app/components/inputFields";
import { addArea, getAreaById, updateAreaById } from "@/app/services/allApi";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import { ErrorMessage, Form, Formik, type FormikHelpers } from "formik";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import * as Yup from "yup";

// ✅ Validation schema (use same field names as API: area_code, area_name, region_id)
const SubRegionSchema = Yup.object().shape({
  area_name: Yup.string().required("SubRegion name is required."),
  status: Yup.string().required("Status is required."),
  region_id: Yup.string().required("Please select a region."),
});

type SubRegionFormValues = {
  area_name: string;
  status: string;
  region_id: string;
};

export default function AddSubRegion() {
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const { regionOptions, loading } = useAllDropdownListData();

  // Try to read id from URL path or query param. Next's useParams/useSearchParams cannot be used in file at times, so try fallback to window.
  // If this page is rendered as client component, window is available.
  let routeId = "";
  try {
    const pathParts = typeof window !== "undefined" ? window.location.pathname.split("/") : [];
    routeId = pathParts[pathParts.length - 1] || "";
    // if last segment is 'add' or empty, ignore
    if (routeId === "" || routeId === "add" || routeId === "subRegion") routeId = "";
  } catch {
    routeId = "";
  }

  const queryId = (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("id")) || routeId || "";

  const [fetched, setFetched] = React.useState<null | {
    area_name?: string;
    status?: number;
    region_id?: number;
  }>(null);

  // Initial values (will be reinitialized when fetched changes)
  const initialValues: SubRegionFormValues = {
    area_name: fetched?.area_name ?? "",
    status: fetched?.status?.toString() ?? "1",
    region_id: fetched?.region_id?.toString() ?? "",
  };

  // Fetch when queryId present (edit mode)
  React.useEffect(() => {
    if (!queryId) return;
    let mounted = true;
    (async () => {
      try {
        const res = await getAreaById(String(queryId));
        if (!mounted) return;
        setFetched({
          area_name: res?.data?.area_name,
          status: res?.data?.status,
          region_id: res?.data?.region_id,
        });
      } catch (err) {
        console.error("Failed to fetch SubRegion by id", err);
        showSnackbar("Failed to load SubRegion", "error");
      }
    })();

    return () => {
      mounted = false;
    };
  }, [queryId, showSnackbar]);


  const handleSubmit = async (
    values: SubRegionFormValues,
    { setSubmitting }: FormikHelpers<SubRegionFormValues>
  ) => {
    try {
      const area_name = values.area_name.trim();
      const region_id = Number(values.region_id);
      const status = Number(values.status);

      if (!area_name || !region_id) {
        showSnackbar("Please fill all required fields.", "error");
        setSubmitting(false);
        return;
      }

      const payload = {
        area_name,
        region_id,
        status,
      };

      console.log("👉 Sending payload:", payload);

      if (queryId) {
        // Edit mode
        const res = await updateAreaById(String(queryId), payload);
        if (res?.errors) {
          const errs: string[] = [];
          for (const key in res.errors) {
            errs.push(...res.errors[key]);
          }
          showSnackbar(errs.join(" | "), "error");
          setSubmitting(false);
          return;
        }
        showSnackbar("SubRegion updated successfully ✅", "success");
      } else {
        // Create mode
        const res = await addArea(payload);
        if (res?.errors) {
          const errs: string[] = [];
          for (const key in res.errors) {
            errs.push(...res.errors[key]);
          }
          showSnackbar(errs.join(" | "), "error");
          setSubmitting(false);
          return;
        }
        showSnackbar("SubRegion added successfully ✅", "success");
      }

      router.push("/dashboard/settings/company/subRegion");
    } catch (error) {
      console.error("Submit SubRegion failed ❌", error);
      showSnackbar("Failed to submit SubRegion", "error");
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
                {queryId ? "Edit Sub Region" : "Add New Sub Region"}
              </h1>
        </div>
      </div>

      {/* Formik */}
      <Formik
        initialValues={initialValues}
        enableReinitialize
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
                    name="area_name"
                    label="SubRegion Name"
                    value={values.area_name}
                    onChange={(e) => setFieldValue("area_name", e.target.value)}
                  />
                  <ErrorMessage
                    name="area_name"
                    component="span"
                    className="text-xs text-red-500"
                  />
                </div>
                {/* Region */}
                <div>
                   <InputFields
                      label="Region"
                      name="region_id"
                      value={values.region_id}
                      onChange={(e) => setFieldValue("region_id", e.target.value)}
                      options={regionOptions}
                    />
                  <ErrorMessage
                    name="region_id"
                    component="span"
                    className="text-xs text-red-500"
                  />
                </div>

                {/* Status */}
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
                label={isSubmitting ? (queryId ? "Updating..." : "Submitting...") : (queryId ? "Update" : "Submit")}
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
