"use client";

import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { Formik, Form, ErrorMessage } from "formik";
import * as Yup from "yup";

import InputFields from "@/app/components/inputFields";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { useSnackbar } from "@/app/services/snackbarContext";
import { getRegionById, updateRegion } from "@/app/services/allApi";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";

// ✅ Yup Schema for validation (3 required fields)
const RegionSchema = Yup.object().shape({
  region_name: Yup.string().required("Region Name is required."),
  status: Yup.string().required("Status is required."),
  country_id: Yup.string().required("Please select a country."),
});

// ✅ Types
type RegionFormValues = {
  region_name: string;
  status: string;
  country_id: string;
};

export default function EditRegion() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();
  const { showSnackbar } = useSnackbar();
  const { onlyCountryOptions } = useAllDropdownListData();

  // Get ID from route or query
  const routeId = params?.id ?? "";
  const queryId = searchParams.get("id") || routeId || "";

  const [loading, setLoading] = useState<boolean>(false);
  const [fetched, setFetched] = useState<RegionFormValues | null>(null);

  // Fetch Region details by ID
  useEffect(() => {
    if (!queryId) return;
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const res = await getRegionById(String(queryId));
        if (!mounted) return;
        setFetched({
          region_name: res?.data.region_name,
          status: res?.data.status?.toString() ?? "1",
          country_id: res?.data.country_id?.toString() ?? "",
        });
      } catch (err) {
        console.error("Failed to fetch Region by id", err);
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [queryId]);

  // ✅ Initial Values
  const initialValues: RegionFormValues = {
    region_name: fetched?.region_name ?? "",
    status: fetched?.status ?? "1",
    country_id: fetched?.country_id ?? "",
  };

  // ✅ Submit Handler
  const handleSubmit = async (values: RegionFormValues) => {
    if (!queryId) return;

    try {
      const payload = {
        region_name: values.region_name,
        status: Number(values.status),
        country_id: Number(values.country_id),
      };

      await updateRegion(String(queryId), payload);
      showSnackbar("Region updated successfully ✅", "success");
      router.push("/dashboard/settings/region");
    } catch (error) {
      console.error("Failed to update Region ❌", error);
      showSnackbar("Failed to update Region", "error");
    }
  };

  return (
    <div className="w-full h-full overflow-x-hidden p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/settings/region">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">
            Edit Region
          </h1>
        </div>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={RegionSchema}
        enableReinitialize
        onSubmit={handleSubmit}
      >
        {({ handleSubmit, values, setFieldValue }) => (
          <Form onSubmit={handleSubmit}>
            <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 mb-6">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-800 mb-4">
                  Region Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* ✅ Region Name */}
                  <div>
                    <InputFields
                      label="Region Name"
                      value={values.region_name}
                      onChange={(e) =>
                        setFieldValue("region_name", e.target.value)
                      }
                    />
                    <ErrorMessage
                      name="region_name"
                      component="span"
                      className="text-xs text-red-500"
                    />
                  </div>

                  {/* ✅ Status */}
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

                  {/* ✅ Country */}
                  <div>
                    <InputFields
                      label="Country"
                      name="country_id"
                      value={values.country_id}
                      onChange={(e) =>
                        setFieldValue("country_id", e.target.value)
                      }
                      options={onlyCountryOptions}
                    />
                    <ErrorMessage
                      name="country_id"
                      component="span"
                      className="text-xs text-red-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-4 mt-6 pr-0">
              <button
                type="reset"
                className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>

              <SidebarBtn
                label="Update"
                isActive={true}
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
