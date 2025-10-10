"use client";

import { useEffect, useState, useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import IconButton from "@/app/components/iconButton";
import SettingPopUp from "@/app/components/settingPopUp";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import ContainerCard from "@/app/components/containerCard";
import InputFields from "@/app/components/inputFields";
import Loading from "@/app/components/Loading";
import { updateUser, addUser, getUserById, genearateCode, saveFinalCode } from "@/app/services/allApi";

import { useSnackbar } from "@/app/services/snackbarContext";

type CountryFormValues = {
  code: string;
  name: string;
  status: string;
};

export default function AddOrEditUserType() {
 
const [isOpen, setIsOpen] = useState(false);

  const [codeMode, setCodeMode] = useState<'auto'|'manual'>('auto');
  const [prefix, setPrefix] = useState('');
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const params = useParams();
  console.log("Params:", params);

  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  // Prevent double call of genearateCode in add mode
  const codeGeneratedRef = useRef(false);

  // ✅ Formik setup
  const formik = useFormik<CountryFormValues>({
    initialValues: {
      code: "",
      name: "",
      status: "active",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
      code: Yup.string().required("Code is required"),
      status: Yup.string().required("Status is required"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const payload = {
          code: values.code,
          name: values.name,
          status: values.status === "active" ? 1 : 0,
        };

        let res;
        if (isEditMode && params?.id && params.id !== "add") {
          res = await updateUser(String(params.id), payload);
        } else {
          res = await addUser(payload);
          if (!res?.error) {
            try {
              await saveFinalCode({ reserved_code: values.code, model_name: "user_types" });
            } catch (e) {
              // Optionally handle error, but don't block success
            }
          }
        }

        if (res.error) {
          showSnackbar(res.data?.message || "Failed to submit form", "error");
        } else {
          showSnackbar(
            res.message ||
              (isEditMode
                ? "User Type Updated Successfully"
                : "User Type Created Successfully"),
            "success"
          );
          router.push("/settings/user-types");
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
          const res = await getUserById(String(params.id));
          if (res?.data) {
            formik.setValues({
              name: res.data.name || "",
              code: res.data.code || "",
              status: res.data.status === 1 ? "active" : "inactive",
            });
          }
        } catch (error) {
          console.error("Failed to fetch user type", error);
        } finally {
          setLoading(false);
        }
      })();
    } else if (!isEditMode && !codeGeneratedRef.current) {
      codeGeneratedRef.current = true;
      (async () => {
        const res = await genearateCode({ model_name: "user_types" });
        if (res?.code) {
          formik.setFieldValue("code", res.code);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.id]);

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-[20px]">
        <div className="flex items-center gap-[16px]">
          <Link href="/settings/user-types">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-[20px] font-semibold text-[#181D27] flex items-center leading-[30px] mb-[5px]">
            {isEditMode ? "Edit User Type" : "Add User Type"}
          </h1>
        </div>
      </div>

      {/* Form */}
      {loading ? (
        <Loading />
      ) : (
        <form onSubmit={formik.handleSubmit}>
          <ContainerCard>
            <h2 className="text-lg font-semibold mb-6">User Type Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* User Type Code (pattern-matched UI) */}
              <div className="flex items-start gap-2 max-w-[406px]">
                <InputFields
                  label="User Type Code"
                  name="code"
                  value={formik.values.code}
                  onChange={formik.handleChange}
                  disabled={codeMode === 'auto'}
                  onBlur={formik.handleBlur}
                  error={formik.touched.code && formik.errors.code}
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
                      title="User Type Code"
                      prefix={prefix}
                      setPrefix={setPrefix}
                      onSave={(mode, code) => {
                        setCodeMode(mode);
                        if (mode === 'auto' && code) {
                          formik.setFieldValue('code', code);
                        } else if (mode === 'manual') {
                          formik.setFieldValue('code', '');
                        }
                      }}
                    />
                  </>
                )}
              </div>
              <InputFields
                type="text"
                name="name"
                label="User Name"
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
