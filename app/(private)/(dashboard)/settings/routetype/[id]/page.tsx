"use client";

import { useEffect, useState, useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";


import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import ContainerCard from "@/app/components/containerCard";
import InputFields from "@/app/components/inputFields";
import Loading from "@/app/components/Loading";
import IconButton from "@/app/components/iconButton";
import SettingPopUp from "@/app/components/settingPopUp";
import {
  addRouteType,
  getRouteTypeById,
  updateRouteTypeById,
  genearateCode,
  saveFinalCode,
} from "@/app/services/allApi";

import { useSnackbar } from "@/app/services/snackbarContext";

type RouteType = {
  route_type_code: string;
  route_type_name: string;
  status: string;
};

const validationSchema = Yup.object({
  route_type_code: Yup.string().required("Route Type Code is required."),
  route_type_name: Yup.string()
    .trim()
    .required("Route Type Name is required")
    .min(3, "Route Type Name must be at least 3 characters")
    .max(50, "Route Type Name cannot exceed 50 characters"),
  status: Yup.string()
    .oneOf(["active", "inactive"], "Invalid status selected")
    .required("Status is required"),
});

export default function AddOrEditRouteType() {
  
const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const params = useParams();

  const [isOpen, setIsOpen] = useState(false);
  const [codeMode, setCodeMode] = useState<'auto'|'manual'>('auto');
  const [prefix, setPrefix] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  // Prevent double call of genearateCode in add mode
  const codeGeneratedRef = useRef(false);

  // ✅ Formik setup
  const formik = useFormik<RouteType>({
    initialValues: {
      route_type_code: "",
      route_type_name: "",
      status: "active",
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const payload = {
          route_type_code: values.route_type_code,
          route_type_name: values.route_type_name,
          status: values.status === "active" ? 1 : 0,
        };
        let res;
        if (isEditMode && params?.id && params.id !== "add") {
          res = await updateRouteTypeById(String(params.id), payload);
        } else {
          res = await addRouteType(payload);
        }
        if (res.error) {
          showSnackbar(res.data?.message || "Failed to submit form", "error");
        } else {
          showSnackbar(
            res.message ||
              (isEditMode
                ? "Route Type Updated Successfully"
                : "Route Type Created Successfully"),
            "success"
          );
          // Finalize the reserved code after successful add/update
          try {
            await saveFinalCode({ reserved_code: values.route_type_code, model_name: "route_types" });
          } catch (e) {
            // Optionally handle error, but don't block success
          }
          router.push("/settings/routetype");
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
          const res = await getRouteTypeById(String(params.id));
          if (res?.data) {
            formik.setValues({
              route_type_code: res.data.route_type_code || "",
              route_type_name: res.data.route_type_name || "",
              status: res.data.status === 1 ? "active" : "inactive",
            });
          }
        } catch (error) {
          console.error("Failed to fetch route type", error);
        } finally {
          setLoading(false);
        }
      })();
    } else if (!isEditMode && !codeGeneratedRef.current) {
      codeGeneratedRef.current = true;
      (async () => {
        const res = await genearateCode({ model_name: "route_types" });
        if (res?.code) {
          formik.setFieldValue("route_type_code", res.code);
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
          <Link href="/settings/routetype">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-[20px] font-semibold text-[#181D27] flex items-center leading-[30px] mb-[5px]">
            {isEditMode ? "Edit Route Type" : "Add New Route Type"}
          </h1>
        </div>
      </div>

      {/* Form */}
      {loading ? (
        <Loading />
      ) : (
        <form onSubmit={formik.handleSubmit}>
          <ContainerCard>
            <h2 className="text-lg font-semibold mb-6">Route Type Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Route Type Code (pattern-matched UI) */}
              <div className="flex items-start gap-2 max-w-[406px]">
                <InputFields
                  label="Route Type Code"
                  name="route_type_code"
                  value={formik.values.route_type_code}
                  onChange={formik.handleChange}
                  disabled={codeMode === 'auto'}
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
                      title="Route Type Code"
                      prefix={prefix}
                      setPrefix={setPrefix}
                      onSave={(mode, code) => {
                        setCodeMode(mode);
                        if (mode === 'auto' && code) {
                          formik.setFieldValue('route_type_code', code);
                        } else if (mode === 'manual') {
                          formik.setFieldValue('route_type_code', '');
                        }
                      }}
                    />
                  </>
                )}
              </div>
              {/* Route Type Name */}
              <div>
                <InputFields
                type="text"
                required
                name="route_type_name"
                label="Route Type Name"
                value={formik.values.route_type_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.route_type_name &&
                  formik.errors.route_type_name
                }
              />
              <div className="text-xs text-red-500">
                {formik.touched.route_type_name && formik.errors.route_type_name}
              </div>
              </div>
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
