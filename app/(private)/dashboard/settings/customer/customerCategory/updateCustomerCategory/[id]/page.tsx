"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";

import ContainerCard from "@/app/components/containerCard";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import InputFields from "@/app/components/inputFields";
import Loading from "@/app/components/Loading";
import {
  getCustomerCategoryById,
  updateCustomerCategory,
  channelList,
} from "@/app/services/allApi";
import { useSnackbar } from "@/app/services/snackbarContext";

// ✅ Form values
interface CustomerCategoryForm {
  outlet_channel: string;
  name: string;
  status: "Active" | "Inactive";
}

// ✅ API type for outlet channels
interface OutletChannel {
  id: string;
  outlet_channel: string;
}

// ✅ Validation schema
const validationSchema = Yup.object({
  outlet_channel: Yup.string().required("Outlet Channel is required"),
  name: Yup.string().required("Name is required"),
  status: Yup.string().oneOf(["Active", "Inactive"]).required(),
});

export default function UpdateCustomerCategory() {
  const [loading, setLoading] = useState(true);
  const [outletChannels, setOutletChannels] = useState<
    { value: string; label: string }[]
  >([]);
  const [initialValues, setInitialValues] = useState<CustomerCategoryForm>({
    outlet_channel: "",
    name: "",
    status: "Active",
  });

  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { showSnackbar } = useSnackbar();

  const categoryId = params?.id;

  // ✅ Fetch Outlet Channels
  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const res = await channelList();
        const options = (res.data || []).map((oc: OutletChannel) => ({
          value: oc.id,
          label: oc.outlet_channel,
        }));
        setOutletChannels(options);
      } catch (error) {
        console.error("Failed to fetch outlet channels ❌", error);
        showSnackbar("Failed to fetch outlet channels ❌", "error");
      }
    };
    fetchChannels();
  }, [showSnackbar]);

  // ✅ Fetch category details
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
          outlet_channel: category.outlet_channel_id || "",
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

  // ✅ Formik setup
  const formik = useFormik<CustomerCategoryForm>({
    enableReinitialize: true,
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      if (!categoryId) return;

      try {
        const payload = {
          outlet_channel_id: values.outlet_channel,
          customer_category_name: values.name.trim(),
          status: values.status === "Active" ? 1 : 0,
        };

        console.log("Submitting payload:", payload);

        await updateCustomerCategory(categoryId, payload);

        showSnackbar("Customer Category updated ✅", "success");
        router.push("/dashboard/settings/customer/customerCategory");
      } catch (error) {
        console.error("Update failed ❌", error);
        showSnackbar("Failed to update customer category ❌", "error");
      }
    },
  });

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

      <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
        {/* Outlet Channel */}
        <div>
          <InputFields
            label="Outlet Channel"
            name="outlet_channel"
            value={formik.values.outlet_channel}
            options={outletChannels}
            onChange={(e) =>
              formik.setFieldValue("outlet_channel", e.target.value)
            }
          />
          {formik.touched.outlet_channel && formik.errors.outlet_channel && (
            <div className="text-red-500 text-sm">
              {formik.errors.outlet_channel}
            </div>
          )}
        </div>

        {/* Name */}
        <div>
          <InputFields
            label="Name"
            name="name"
            value={formik.values.name}
            onChange={(e) => formik.setFieldValue("name", e.target.value)}
          />
          {formik.touched.name && formik.errors.name && (
            <div className="text-red-500 text-sm">{formik.errors.name}</div>
          )}
        </div>

        {/* Status */}
        <div>
          <InputFields
            label="Status"
            name="status"
            type="select"
            value={formik.values.status}
            options={[
              { label: "Active", value: "Active" },
              { label: "Inactive", value: "Inactive" },
            ]}
            onChange={(e) => formik.setFieldValue("status", e.target.value)}
          />
          {formik.touched.status && formik.errors.status && (
            <div className="text-red-500 text-sm">{formik.errors.status}</div>
          )}
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
      </form>
    </ContainerCard>
  );
}
