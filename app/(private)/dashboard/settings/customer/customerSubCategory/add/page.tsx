"use client";

import ContainerCard from "@/app/components/containerCard";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import InputFields from "@/app/components/inputFields";
import SearchableDropdown from "@/app/components/SearchableDropdown";
import { addCustomerSubCategory, customerCategoryList } from "@/app/services/allApi";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import { useFormik } from "formik";
import Link from "next/link";
import { useEffect, useState } from "react";
import * as Yup from "yup";
import { useRouter } from "next/navigation";

// ✅ API type
interface CustomerCategory {
  id: number;
  customer_category_name: string;
}

export default function AddCustomerSubCategory() {
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([]);
  const { showSnackbar } = useSnackbar();
  const router = useRouter();

  // ✅ Fetch categories for dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await customerCategoryList();
        const dataArray: CustomerCategory[] = res?.data || [];
        const options = dataArray.map((cat) => ({
          value: String(cat.id),
          label: cat.customer_category_name,
        }));
        setCategories(options);
      } catch (error) {
        console.error("Failed to fetch categories ❌", error);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // ✅ Formik setup
  const formik = useFormik({
    initialValues: {
      customer_category_id: "",
      customer_sub_category_name: "",
      status: "1",
    },
    validationSchema: Yup.object({
      customer_category_id: Yup.string().required("Customer category is required"),
      customer_sub_category_name: Yup.string().required("Sub category name is required"),
      status: Yup.string().required("Status is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const payload = {
          customer_category_id: Number(values.customer_category_id),
          customer_sub_category_name: values.customer_sub_category_name,
          status: Number(values.status),
        };
        const res = await addCustomerSubCategory(payload);
        console.log("✅ Sub Category Added:", res);
        showSnackbar("Customer Sub Category added successfully ✅", "success");
        resetForm();
        router.push("/dashboard/settings/customer/customerSubCategory");
      } catch (error) {
        console.error("❌ Add Customer Sub Category failed", error);
        showSnackbar("Failed to add sub category ❌", "error");
      }
    },
  });

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-[20px]">
        <div className="flex items-center gap-[16px]">
          <Link href="/dashboard/settings/customer/customerSubCategory">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-[20px] font-semibold text-[#181D27] flex items-center leading-[30px] mb-[5px]">
            Add Customer Sub Category
          </h1>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={formik.handleSubmit}>
        <ContainerCard>
          <h2 className="text-lg font-semibold mb-6">
            Customer Sub Category Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Customer Category Dropdown */}
            <InputFields
              label="Customer Category"
              name="customer_category_id"
              value={formik.values.customer_category_id}
              options={categories}
              onChange={(val) => formik.setFieldValue("customer_category_id", String(val))}
              error={
                formik.touched.customer_category_id &&
                formik.errors.customer_category_id
              }
            />

            {/* Sub Category Name */}
            <InputFields
              name="customer_sub_category_name"
              label="Sub Category Name"
              value={formik.values.customer_sub_category_name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.customer_sub_category_name &&
                formik.errors.customer_sub_category_name
              }
            />

            {/* Status */}
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

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            className="px-4 py-2 h-[40px] w-[80px] rounded-md font-semibold border border-gray-300 text-gray-700 hover:bg-gray-100"
            type="button"
            onClick={() => router.back()}
          >
            Cancel
          </button>
          <SidebarBtn
            label="Submit"
            isActive={true}
            leadingIcon="mdi:check"
            type="submit"
          />
        </div>
      </form>
    </>
  );
}
