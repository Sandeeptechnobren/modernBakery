"use client";

import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import Loading from "@/app/components/Loading";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import ContainerCard from "@/app/components/containerCard";
import InputFields from "@/app/components/inputFields";
import { updateSalesmanType, addSalesmanType, getSalesmanTypeById, genearateCode, saveFinalCode } from "@/app/services/allApi";
import { useRef } from "react";
import IconButton from "@/app/components/iconButton";
import SettingPopUp from "@/app/components/settingPopUp";

import { useSnackbar } from "@/app/services/snackbarContext";

type SalesmanTypeForm = {
  salesman_type_name: string;
  salesman_type_status: string;
  salesman_type_code: string;
};

const validationSchema = Yup.object({
  salesman_type_name: Yup.string()
    .trim()
    .required("Salesman Type Name is required")
    .min(3, "Salesman Type Name must be at least 3 characters")
    .max(50, "Salesman Type Name cannot exceed 50 characters"),
  salesman_type_status: Yup.string()
    .oneOf(["active", "inactive"], "Invalid status selected")
    .required("Status is required"),
  salesman_type_code: Yup.string().required("Code is required"),
});

export default function AddOrEditSalesmanType() {
  
// Code logic
  const [isOpen, setIsOpen] = useState(false);
  const [codeMode, setCodeMode] = useState<'auto'|'manual'>('auto');
  const [prefix, setPrefix] = useState('');
  const codeGeneratedRef = useRef(false);
  const [code, setCode] = useState("");
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const params = useParams();

  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ Formik setup
  const formik = useFormik<SalesmanTypeForm>({
    initialValues: {
      salesman_type_name: "",
      salesman_type_status: "",
      salesman_type_code: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const payload = {
          salesman_type_name: values.salesman_type_name,
          salesman_type_status: values.salesman_type_status === "active" ? 1 : 0,
          salesman_type_code: values.salesman_type_code,
        };
        let res;
        if (isEditMode && params?.id && params.id !== "add") {
          res = await updateSalesmanType(String(params.id), payload);
        } else {
          res = await addSalesmanType(payload);
        }
        if (res.error) {
          showSnackbar(res.data?.message || "Failed to submit form", "error");
        } else {
          // Finalize the reserved code only after successful add
          if (!isEditMode || params?.id === "add") {
            try {
              await saveFinalCode({ reserved_code: values.salesman_type_code, model_name: "salesman_types" });
            } catch (e) {}
          }
          showSnackbar(
            res.message ||
              (isEditMode
                ? "Salesman Type Updated Successfully"
                : "Salesman Type Created Successfully"),
            "success"
          );
          router.push("/settings/salesman-type");
        }
      } catch (error) {
        showSnackbar("Something went wrong", "error");
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Generate code on mount (add mode only)
  useEffect(() => {
    if (!isEditMode && !codeGeneratedRef.current) {
      codeGeneratedRef.current = true;
      (async () => {
        const res = await genearateCode({ model_name: "salesman_types" });
        if (res?.code) {
          setCode(res.code);
          formik.setFieldValue("salesman_type_code", res.code);
        }
        if (res?.prefix) {
          setPrefix(res.prefix);
        } else if (res?.code) {
          // fallback: extract prefix from code if possible (e.g. ABC-00123 => ABC-)
          const match = res.prefix;
          if (match) setPrefix(prefix);
        }
      })();
    }
  }, [isEditMode]);

  // ✅ Load existing data for edit mode
  useEffect(() => {
    if (params?.id && params.id !== "add") {
      setIsEditMode(true);
      setLoading(true);
      (async () => {
        try {
          const res = await getSalesmanTypeById(String(params.id));
          if (res?.data) {
            console.log(res.data);
            formik.setValues({
              salesman_type_name: res.data.salesman_type_name || "",
              salesman_type_status:
                res.data.salesman_type_status === 1 ? "active" : "inactive",
              salesman_type_code: res.data.salesman_type_code || "",
            });
          }
        } catch (error) {
          console.error("Failed to fetch user type", error);
        } finally {
          setLoading(false);
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
          <Link href="/settings/salesman-type">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-[20px] font-semibold text-[#181D27] flex items-center leading-[30px] mb-[5px]">
            {isEditMode ? "Edit Salesman Type" : "Add New Salesman Type"}
          </h1>
        </div>
      </div>

      {/* Form */}
      {loading ? (
        <Loading />
      ) : (
        <form onSubmit={formik.handleSubmit}>
          <ContainerCard>
            <h2 className="text-lg font-semibold mb-6">
              Salesman type Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Salesman Type Code (auto-generated, disabled, with settings icon/popup) */}
              <div className="flex items-start gap-2 max-w-[406px]">
                <InputFields
                  label="Salesman Type Code"
                  name="salesman_type_code"
                  value={formik.values.salesman_type_code}
                  onChange={formik.handleChange}
                  disabled={codeMode === 'auto'}
                  error={formik.touched?.salesman_type_code && formik.errors?.salesman_type_code}
                />
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
                      title="Salesman Type Code"
                      prefix={prefix}
                      setPrefix={setPrefix}
                      onSave={(mode, code) => {
                        setCodeMode(mode);
                        if (mode === 'auto' && code) {
                          formik.setFieldValue('salesman_type_code', code);
                        } else if (mode === 'manual') {
                          formik.setFieldValue('salesman_type_code', '');
                        }
                      }}
                    />
                  </>
                )}
              </div>

              {/* Name */}
              <InputFields
                type="text"
                name="salesman_type_name"
                label="Salesman Type Name"
                value={formik.values.salesman_type_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.salesman_type_name &&
                  formik.errors.salesman_type_name
                }
              />

              {/* Status */}
              <InputFields
                type="radio"
                name="salesman_type_status"
                label="Status"
                value={formik.values.salesman_type_status}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.salesman_type_status &&
                  formik.errors.salesman_type_status
                }
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
