"use client";

import { ErrorMessage, Form, Formik } from "formik";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import * as Yup from "yup";

import ContainerCard from "@/app/components/containerCard";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import InputFields from "@/app/components/inputFields";
import SearchableDropdown from "@/app/components/SearchableDropdown";
import Loading from "@/app/components/Loading";
import { getCustomerCategoryById, updateCustomerCategory, channelList } from "@/app/services/allApi";
import { useSnackbar } from "@/app/services/snackbarContext";

interface CustomerCategoryForm {
  outlet_channel_id: string;
  code: string;
  name: string;
  status: "Active" | "Inactive";
}

interface OutletChannel {
  id: string;
  outlet_channel_code: string;
}

const validationSchema = Yup.object({
  outlet_channel_id: Yup.string().required("Outlet Channel is required"),
  code: Yup.string().required("Code is required"),
  name: Yup.string().required("Name is required"),
  status: Yup.string().oneOf(["Active", "Inactive"]).required(),
});

export default function UpdateCustomerCategory() {
  const [loading, setLoading] = useState(true);
  const [outletChannels, setOutletChannels] = useState<{ value: string; label: string }[]>([]);
  const [initialValues, setInitialValues] = useState<CustomerCategoryForm>({
    outlet_channel_id: "",
    code: "",
    name: "",
    status: "Active",
  });

  const router = useRouter();
  const params = useParams();
  const { showSnackbar } = useSnackbar();

  const categoryId = params?.id as string | undefined;

  // Fetch Outlet Channels
  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const res = await channelList();
        const options = (res.data || []).map((oc: OutletChannel) => ({
          value: oc.id,
          label: oc.outlet_channel_code,
        }));
        setOutletChannels(options);
      } catch (error) {
        console.error("Failed to fetch outlet channels ❌", error);
      }
    };
    fetchChannels();
  }, []);

  // Fetch category data
  useEffect(() => {
    if (!categoryId) {
      setLoading(false);
      return;
    }

    const fetchCategory = async () => {
      try {
        const res = await getCustomerCategoryById(categoryId);
        const category = res?.data?.data || res?.data;

        if (!category) throw new Error("Customer Category not found");

        setInitialValues({
          outlet_channel_id: category.outlet_channel_id, // set the ID
          code: category.customer_category_code || "",
          name: category.customer_category_name || "",
          status: category.status === 1 ? "Active" : "Inactive",
        });
      } catch (error) {
        console.error("Failed to fetch customer category ❌", error);
        showSnackbar("Failed to fetch customer category ❌", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [categoryId, showSnackbar]);

  const handleSubmit = async (values: CustomerCategoryForm) => {
    if (!categoryId) return;

    try {
      const payload = {
        outlet_channel_id: values.outlet_channel_id, // send ID
        customer_category_code: values.code,
        customer_category_name: values.name,
        status: values.status === "Active" ? 1 : 0,
      };

      await updateCustomerCategory(categoryId, payload);

      showSnackbar("Customer Category updated ✅", "success");
      router.push("/dashboard/settings/customer/customerCategory");
    } catch (error) {
      console.error("Update failed ❌", error);
      showSnackbar("Failed to update customer category ❌", "error");
    }
  };

  if (loading) return <Loading />;

  return (
    <ContainerCard>
      <div className="flex justify-between mb-4">
        <h1 className="text-[20px] font-semibold">Update Customer Category</h1>
        <SidebarBtn
          href="/dashboard/settings/customer/customerCategory"
          label="Back"
        />
      </div>

      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, setFieldValue }) => (
          <Form className="flex flex-col gap-4">
            {/* Outlet Channel */}
            <div>
              <SearchableDropdown
                label="Outlet Channel"
                name="outlet_channel_id"
                value={values.outlet_channel_id}
                options={outletChannels}
                onChange={(val) => setFieldValue("outlet_channel_id", val)}
              />
              <ErrorMessage
                name="outlet_channel_id"
                component="div"
                className="text-red-500 text-sm"
              />
            </div>

            {/* Code */}
            <div>
              <InputFields
                label="Code"
                name="code"
                value={values.code}
                onChange={(e) => setFieldValue("code", e.target.value)}
              />
              <ErrorMessage
                name="code"
                component="div"
                className="text-red-500 text-sm"
              />
            </div>

            {/* Name */}
            <div>
              <InputFields
                label="Name"
                name="name"
                value={values.name}
                onChange={(e) => setFieldValue("name", e.target.value)}
              />
              <ErrorMessage
                name="name"
                component="div"
                className="text-red-500 text-sm"
              />
            </div>

            {/* Status */}
            <div>
              <InputFields
                label="Status"
                name="status"
                value={values.status}
                type="select"
                options={[
                  { label: "Active", value: "Active" },
                  { label: "Inactive", value: "Inactive" },
                ]}
                onChange={(e) => setFieldValue("status", e.target.value)}
              />
              <ErrorMessage
                name="status"
                component="div"
                className="text-red-500 text-sm"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={() =>
                  router.push("/dashboard/settings/customer/customerCategory")
                }
                className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>

              <SidebarBtn
                label="Update"
                isActive
                leadingIcon="mdi:check"
                type="submit"
              />
            </div>
          </Form>
        )}
      </Formik>
    </ContainerCard>
  );
}
