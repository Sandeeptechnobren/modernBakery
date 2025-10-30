"use client";

import { useEffect, useState, useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import Loading from "@/app/components/Loading";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import ContainerCard from "@/app/components/containerCard";
import InputFields from "@/app/components/inputFields";
import IconButton from "@/app/components/iconButton";
import SettingPopUp from "@/app/components/settingPopUp";
import {
  addCustomerType,
  getCustomerTypeById,
  updateCustomerType,
  genearateCode,
  saveFinalCode,
} from "@/app/services/allApi";
import { useSnackbar } from "@/app/services/snackbarContext";

interface CustomerTypeFormValues {
  customer_type_code: string;
  name: string;
  status: string; // "active" | "inactive"
}

export default function AddCustomerTypePage() {
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const params = useParams();

  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const codeGeneratedRef = useRef(false);

  // ✅ Formik setup
  const formik = useFormik<CustomerTypeFormValues>({
    initialValues: {
      customer_type_code: "",
      name: "",
      status: "active",
    },
    validationSchema: Yup.object({
      customer_type_code: Yup.string().required("Customer Type Code is required"),
      name: Yup.string().required("Name is required"),
      status: Yup.string().required("Status is required"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const payload = {
          customer_type_code: values.customer_type_code,
          name: values.name,
          status: values.status === "active" ? 1 : 0,
        };

        let res;
        if (isEditMode && params?.id && params.id !== "add") {
          res = await updateCustomerType(String(params.id), payload);
        } else {
          res = await addCustomerType(payload);
        }

        if (res.error) {
          showSnackbar(res.data?.message || "Failed to submit form", "error");
        } else {
          showSnackbar(
            res.message ||
              (isEditMode
                ? "Customer Type Updated Successfully"
                : "Customer Type Created Successfully"),
            "success"
          );
          // Finalize the reserved code only after successful add
          if (!isEditMode || params?.id === "add") {
            try {
              await saveFinalCode({ reserved_code: values.customer_type_code, model_name: "customer_types" });
            } catch (e) {}
          }
          router.push("/settings/customer/customerType");
        }
      } catch (error) {
        showSnackbar("Something went wrong", "error");
      } finally {
        setSubmitting(false);
      }
    },
  });

  // ✅ Load existing data for edit mode and generate code in add mode
  useEffect(() => {
    if (params?.id && params.id !== "add") {
      setIsEditMode(true);
      setLoading(true);
      (async () => {
        try {
          const res = await getCustomerTypeById(String(params.id));
          if (res?.data) {
            formik.setValues({
              customer_type_code: res.data.code || "",
              name: res.data.name || "",
              status: res.data.status === 1 ? "active" : "inactive",
            });
          }
        } catch (error) {
          console.error("Failed to fetch customer type", error);
        } finally {
          setLoading(false);
        }
      })();
    } else if (!isEditMode && !codeGeneratedRef.current) {
      codeGeneratedRef.current = true;
      (async () => {
        const res = await genearateCode({ model_name: "customer_types" });
        if (res?.code) {
          formik.setFieldValue("customer_type_code", res.code);
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.id]);

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-[20px]">
        <div className="flex items-center gap-[16px]">
          <Link href="/settings/customer/customerType">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-[20px] font-semibold text-[#181D27] flex items-center leading-[30px] mb-[5px]">
            {isEditMode ? "Edit Customer Type" : "Add Customer Type"}
          </h1>
        </div>
      </div>

      {/* Form */}
      {loading ? (
        <Loading></Loading>
      ) : (
        <form onSubmit={formik.handleSubmit}>
          <ContainerCard>
            <h2 className="text-lg font-semibold mb-6">
              Customer Type Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Customer Type Code (pattern-matched UI) */}
              <div className="flex items-start gap-2 max-w-[406px]">
                <InputFields
                  label="Customer Type Code"
                  name="customer_type_code"
                  value={formik.values.customer_type_code}
                  onChange={formik.handleChange}
                  disabled
                  error={formik.touched.customer_type_code && formik.errors.customer_type_code}
                />
                {!isEditMode && (
                  <>    
                    <IconButton
                      bgClass="white"
                       className="  cursor-pointer text-[#252B37] pt-12"
                      icon="mi:settings"
                      onClick={() => setIsOpen(true)}
                    />
                    <SettingPopUp isOpen={isOpen} onClose={() => setIsOpen(false)} title="Customer Type Code" />
                  </>
                )}
              </div>
              {/* Name */}
              <InputFields
                type="text"
                name="name"
                label="Customer Name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && formik.errors.name}
              />
              {/* Status */}
              <InputFields
                type="radio"
                name="status"
                label="Status"
                value={formik.values.status}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.status && formik.errors.status}
                options={[
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                ]}
              />
            </div>
          </ContainerCard>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              className="px-4 py-2 h-[40px] w-[80px] rounded-md font-semibold border border-gray-300 text-gray-700 hover:bg-gray-100"
              type="button"
              onClick={() => formik.resetForm()}
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
      )}
    </>
  );
}
