"use client";

import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Formik, Form, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";

import ContainerCard from "@/app/components/containerCard";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import InputFields from "@/app/components/inputFields";
import IconButton from "@/app/components/iconButton";
import SettingPopUp from "@/app/components/settingPopUp";
import Loading from "@/app/components/Loading";

import {
  addCustomerSubCategory,
  updateCustomerSubCategory,
  getCustomerSubCategoryById,
  customerCategoryList,
  genearateCode,
  saveFinalCode,
} from "@/app/services/allApi";

import { useSnackbar } from "@/app/services/snackbarContext";

// ✅ Type Definitions
interface CategoryOption {
  value: string;
  label: string;
  [key: string]: unknown;
}

interface CustomerSubCategoryFormValues {
  customer_category_id: string;
  customer_sub_category_name: string;
  status: string;
  customer_sub_category_code: string;
}

interface CustomerCategoryResponse {
  id: number;
  customer_category_name: string;
}

// ✅ Validation Schema
const CustomerSubCategorySchema = Yup.object().shape({
  customer_category_id: Yup.string().required("Customer category is required"),
  customer_sub_category_name: Yup.string().required("Sub category name is required"),
  status: Yup.string().required("Status is required"),
  customer_sub_category_code: Yup.string().required("Sub category code is required"),
});

export default function AddEditCustomerSubCategory() {
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const params = useParams<{ id?: string }>();

  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  // Code generation logic
  const [isOpen, setIsOpen] = useState(false);
  const [codeMode, setCodeMode] = useState<"auto" | "manual">("auto");
  const [prefix, setPrefix] = useState("");
  const codeGeneratedRef = useRef(false);

  const [initialValues, setInitialValues] = useState<CustomerSubCategoryFormValues>({
    customer_category_id: "",
    customer_sub_category_name: "",
    status: "1", // default Active
    customer_sub_category_code: "",
  });

  // ✅ Fetch Customer Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await customerCategoryList();
        const dataArray: CustomerCategoryResponse[] = res?.data || [];
        const options: CategoryOption[] = dataArray.map((cat: CustomerCategoryResponse) => ({
          value: String(cat.id),
          label: cat.customer_category_name,
        }));
        setCategories(options);
      } catch (error) {
        console.error("Failed to fetch categories", error);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // ✅ Fetch data if editing or generate code if adding
  useEffect(() => {
    const id = params?.id ?? "";

    if (id && id !== "add") {
      setIsEditMode(true);
      setLoading(true);

      (async () => {
        try {
          const res = await getCustomerSubCategoryById(id);
          if (res?.data) {
            setInitialValues({
              customer_category_id: String(res.data.customer_category_id ?? ""),
              customer_sub_category_name: res.data.customer_sub_category_name ?? "",
              status: String(res.data.status ?? "1"),
              customer_sub_category_code: res.data.customer_sub_category_code ?? "",
            });
          } 
        } catch (error) {
          showSnackbar("Failed to fetch sub category", "error");
        } finally {
          setLoading(false);
        }
      })();
    } else if (!codeGeneratedRef.current) {
      codeGeneratedRef.current = true;
      (async () => {
        const res = await genearateCode({ model_name: "customer_sub_categories" });
        if (res?.code) {
          setInitialValues((prev) => ({ ...prev, customer_sub_category_code: res.code }));
        }
        if (res?.prefix) {
          setPrefix(res.prefix);
        }
      })();
    }
  }, [params?.id, showSnackbar]);

  // ✅ Handle form submission
  const handleSubmit = async (
    values: CustomerSubCategoryFormValues,
    { setSubmitting }: FormikHelpers<CustomerSubCategoryFormValues>
  ) => {
    const payload = {
      customer_category_id: Number(values.customer_category_id),
      customer_sub_category_name: values.customer_sub_category_name,
      status: Number(values.status),
      customer_sub_category_code: values.customer_sub_category_code,
    };

    try {
      let res;
      if (isEditMode && params?.id && params.id !== "add") {
        res = await updateCustomerSubCategory(String(params.id), payload);
      } else {
        res = await addCustomerSubCategory(payload);
        try {
          await saveFinalCode({
            reserved_code: values.customer_sub_category_code,
            model_name: "customer_sub_categories",
          });
        } catch (e) {
          console.error("Code reservation failed", e);
        }
      }

      if (res?.error) {
        showSnackbar(res.data?.message || "Failed to submit form", "error");
      } else {
        showSnackbar(
          isEditMode
            ? "Customer Sub Category Updated Successfully ✅"
            : "Customer Sub Category Added Successfully ✅",
          "success"
        );
        router.push("/settings/customer/customerSubCategory");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      showSnackbar("Something went wrong while submitting", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Loading state
  if (isEditMode && loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  // ✅ JSX
  return (
    <div className="w-full h-full overflow-x-hidden p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/settings/customer/customerSubCategory">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">
            {isEditMode ? "Update Customer Sub Category" : "Add Customer Sub Category"}
          </h1>
        </div>
      </div>

      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={CustomerSubCategorySchema}
        onSubmit={handleSubmit}
      >
        {({ handleSubmit, values, setFieldValue, errors, touched ,isSubmitting}) => (
          <Form onSubmit={handleSubmit}>
            <ContainerCard>
              <h2 className="text-lg font-medium text-gray-800 mb-4">
                Customer Sub Category 
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Sub Category Code */}
                <div className="flex items-start gap-2 max-w-[406px]">
                  <div className="w-full">
                    <InputFields
                      required
                      label="Customer Sub Category Code"
                      value={values.customer_sub_category_code}
                      onChange={(e) =>
                        setFieldValue("customer_sub_category_code", e.target.value)
                      }
                      disabled={codeMode === "auto"}
                      error={
                        touched.customer_sub_category_code &&
                        errors.customer_sub_category_code
                      }
                    />
                    <ErrorMessage
                      name="customer_sub_category_code"
                      component="span"
                      className="text-xs text-red-500"
                    />
                  </div>
                  {!isEditMode && (
                    <>
                      <IconButton
                        bgClass="white"
                        className="cursor-pointer text-[#252B37] pt-12"
                        icon="mi:settings"
                        onClick={() => setIsOpen(true)}
                      />
                      <SettingPopUp
                        isOpen={isOpen}
                        onClose={() => setIsOpen(false)}
                        title="Customer Sub Category Code"
                        prefix={prefix}
                        setPrefix={setPrefix}
                        onSave={(mode, code) => {
                          setCodeMode(mode);
                          if (mode === "auto" && code) {
                            setFieldValue("customer_sub_category_code", code);
                          } else if (mode === "manual") {
                            setFieldValue("customer_sub_category_code", "");
                          }
                        }}
                      />
                    </>
                  )}
                </div>

                {/* Category Dropdown */}
                <div>
                  <InputFields
                    required
                    label="Customer Category"
                    name="customer_category_id"
                    value={values.customer_category_id}
                    options={categories}
                    onChange={(e) => setFieldValue("customer_category_id", e.target.value)}
                    error={touched.customer_category_id && errors.customer_category_id}
                  />
               
                </div>

                {/* Sub Category Name */}
                <div>
                  <InputFields
                    required
                    label="Sub Category Name"
                    value={values.customer_sub_category_name}
                    onChange={(e) =>
                      setFieldValue("customer_sub_category_name", e.target.value)
                    }
                    error={
                      touched.customer_sub_category_name &&
                      errors.customer_sub_category_name
                    }
                  />
              
                </div>

                {/* Status */}
                <div>
                  <InputFields
                    label="Status"
                    name="status"
                    value={values.status}
                    options={[
                      { value: "1", label: "Active" },
                      { value: "0", label: "Inactive" },
                    ]}
                    onChange={(e) => setFieldValue("status", e.target.value)}
                    type="radio"
                    required
                    error={errors.status && touched.status ? errors.status : false}
                  />
                </div>
              </div>
            </ContainerCard>

            <div className="flex justify-end gap-4 mt-6 pr-0">
              <button
                type="button"
                // onClick={() => router.back()}
              onClick={() => router.push("/settings/customer/customerSubCategory")}

                className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <SidebarBtn
                label={isEditMode ? (isSubmitting?"Updating..." :"Update" ): (isSubmitting?"Submiting...":"Submit")}
                isActive={true}
                leadingIcon="mdi:check"
                type="submit"
                disabled={isSubmitting}
              />
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
