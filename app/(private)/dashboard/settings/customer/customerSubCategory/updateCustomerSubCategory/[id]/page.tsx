"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import Link from "next/link";
import { Icon } from "@iconify-icon/react";

import ContainerCard from "@/app/components/containerCard";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import InputFields from "@/app/components/inputFields";
import SearchableDropdown from "@/app/components/SearchableDropdown";
import { useSnackbar } from "@/app/services/snackbarContext";
import {
  customerCategoryList,
  getCustomerSubCategoryById,
  updateCustomerSubCategory,
} from "@/app/services/allApi";
import Loading from "@/app/components/Loading";

interface CustomerCategory {
  id: number;
  customer_category_name: string;
}

export default function UpdateCustomerSubCategory() {
  const params = useParams();
  const id = params?.id as string; // ✅ force as string
  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  const [categories, setCategories] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch categories + current sub-category
  useEffect(() => {
    const fetchData = async () => {
      try {
        // fetch categories for dropdown
        const catRes = await customerCategoryList();
        const catOptions =
          (catRes?.data || []).map((c: CustomerCategory) => ({
            value: String(c.id),
            label: c.customer_category_name,
          })) || [];
        setCategories(catOptions);

        // fetch current sub-category
        if (id) {
          const subCatRes = await getCustomerSubCategoryById(Number(id)); // convert string → number
          const subCat = subCatRes?.data;

          if (subCat) {
            formik.setValues({
              customer_category_id: String(subCat.customer_category_id),
              customer_sub_category_name: subCat.customer_sub_category_name,
              status: String(subCat.status),
            });
          }
        }
      } catch (err) {
        console.error("❌ Failed to fetch data", err);
        showSnackbar("Failed to load data ❌", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const formik = useFormik({
    initialValues: {
      customer_category_id: "",
      customer_sub_category_name: "",
      status: "1",
    },
    validationSchema: Yup.object({
      customer_category_id: Yup.string().required("Category is required"),
      customer_sub_category_name: Yup.string().required("Sub-category name is required"),
      status: Yup.string().required("Status is required"),
    }),
    onSubmit: async (values) => {
      try {
        const payload = {
          customer_category_id: Number(values.customer_category_id),
          customer_sub_category_name: values.customer_sub_category_name,
          status: Number(values.status),
        };

        // ✅ Convert id (string) → number before API
        await updateCustomerSubCategory((id), payload);

        showSnackbar("Customer Sub-Category updated successfully ✅", "success");
        router.push("/dashboard/settings/customer/customerSubCategory");
      } catch (err) {
        console.error("❌ Update failed", err);
        showSnackbar("Failed to update sub-category ❌", "error");
      }
    },
  });

  if (loading) return <Loading />;

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-[20px]">
        <div className="flex items-center gap-[16px]">
          <Link href="/dashboard/settings/customer/customerSubCategory">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-[20px] font-semibold text-[#181D27]">
            Update Customer Sub-Category
          </h1>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={formik.handleSubmit}>
        <ContainerCard>
          <h2 className="text-lg font-semibold mb-6">Sub-Category Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <InputFields
              label="Category"
              name="customer_category_id"
              value={formik.values.customer_category_id}
              options={categories}
              onChange={(val) =>
                formik.setFieldValue("customer_category_id", String(val))
              }
              error={
                formik.touched.customer_category_id &&
                formik.errors.customer_category_id
              }
            />

            <InputFields
              name="customer_sub_category_name"
              label="Sub-Category Name"
              value={formik.values.customer_sub_category_name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.customer_sub_category_name &&
                formik.errors.customer_sub_category_name
              }
            />

            <InputFields
              name="status"
              label="Status"
              type="select"
              value={formik.values.status}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.status && formik.errors.status}
              options={[
                { value: "1", label: "Active" },
                { value: "0", label: "Inactive" },
              ]}
            />
          </div>
        </ContainerCard>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            className="px-4 py-2 h-[40px] w-[80px] rounded-md font-semibold border border-gray-300 text-gray-700 hover:bg-gray-100"
            type="button"
            onClick={() => router.back()}
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
      </form>
    </>
  );
}
