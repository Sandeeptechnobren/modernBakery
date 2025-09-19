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
import { getAreaById, updateAreaById } from "@/app/services/allApi";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";

// ✅ Yup Schema for validation
const SubRegionSchema = Yup.object().shape({
  area_code: Yup.string().required("SubRegion Name is required."),
  area_name: Yup.string().required("SubRegion Name is required."),
  status: Yup.string().required("Status is required."),
  region_id: Yup.string().required("Please select a region."),
});

// ✅ Types
type SubRegionFormValues = {
  area_code: string;
  area_name: string;
  status: string;
  region_id: string;
};

export default function EditSubRegion() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();
  const { showSnackbar } = useSnackbar();
  const { regionOptions, loading: regionLoading } = useAllDropdownListData();

  // Get ID from route or query
  const routeId = params?.id ?? "";
  const queryId = searchParams.get("id") || routeId || "";

  const [loading, setLoading] = useState<boolean>(false);
  const [fetched, setFetched] = useState<null | {
    area_code?: string;
    area_name?: string;
    status?: number;
    region_id?: number;
  }>(null);

  // Fetch SubRegion details by ID
  useEffect(() => {
    if (!queryId) return;
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const res = await getAreaById(String(queryId));
        if (!mounted) return;
        setFetched({
          area_code: res?.data.area_code,
          area_name: res?.data.area_name,
          status: res?.data.status,
          region_id: res?.data.region_id,
        });
      } catch (err) {
        console.error("Failed to fetch SubRegion by id", err);
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [queryId]);

  // ✅ Initial Values
  const initialValues: SubRegionFormValues = {
    area_code: fetched?.area_code ?? "",
    area_name: fetched?.area_name ?? "",
    status: fetched?.status?.toString() ?? "1",
    region_id: fetched?.region_id?.toString() ?? "",
  }; useEffect(()=>console.log("not find",initialValues))

  // ✅ Submit Handler
  const handleSubmit = async (values: SubRegionFormValues) => {
    if (!queryId) return;


// area_code": "AR001",
//         "area_name": "Central Area",
//         "region_id": 71,
//         "status":


    try {
      const payload = {
        area_code: values.area_code,
        area_name: values.area_name,
        status: Number(values.status),
        region_id: Number(values.region_id),
      };

      await updateAreaById(String(queryId), payload);
      showSnackbar("SubRegion updated successfully ✅", "success");
      router.push("/dashboard/settings/company/subRegion");
    } catch (error) {
      console.error("Failed to update SubRegion ❌", error);
      showSnackbar("Failed to update SubRegion", "error");
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
            Edit SubRegion
          </h1>
        </div>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={SubRegionSchema}
        enableReinitialize
        onSubmit={handleSubmit}
      >
        {({ handleSubmit, values, setFieldValue }) => (
          <Form onSubmit={handleSubmit}>
            <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 mb-6">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-800 mb-4">
                  SubRegion Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* SubRegion Name */}
                  <div>
                    <InputFields
                      label="SubRegion Code"
                      value={values.area_code}
                      onChange={(e) =>
                        setFieldValue("area_code", e.target.value)
                      }
                    />
                    <ErrorMessage
                      name="area_code"
                      component="span"
                      className="text-xs text-red-500"
                    />
                  </div>
                  <div>
                    <InputFields
                      label="SubRegion Name"
                      value={values.area_name}
                      onChange={(e) =>
                        setFieldValue("area_name", e.target.value)
                      }
                    />
                    <ErrorMessage
                      name="area_name"
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
                    {/* <select
                      className="border px-3 py-2 rounded w-full"
                      value={values.status}
                      onChange={(e) => setFieldValue("status", e.target.value)}
                    >
                      <option value="1">Active</option>
                      <option value="0">Inactive</option>
                    </select>
                    */}
                  </div>

                  {/* Region */}
                  <div>
                     <InputFields
                      label="Region id"
                      value={values.region_id}
                      onChange={(e) =>
                        setFieldValue("region_id", e.target.value)
                        
                      }
                      options={regionOptions}
                    />
                    {/* <select
                      className="border px-3 py-2 rounded w-full"
                      value={values.region_id}
                      onChange={(e) =>
                        setFieldValue("region_id", e.target.value)
                      }
                    >
                      <option value="region_id">Select region</option>
                      {regionLoading ? (
                        <option value="region_id" disabled>
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
                      name="region_id"
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
