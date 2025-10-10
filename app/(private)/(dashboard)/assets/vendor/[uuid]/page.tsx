"use client";

import { useRouter, useParams } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useSnackbar } from "@/app/services/snackbarContext";
import InputFields from "@/app/components/inputFields";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { Icon } from "@iconify-icon/react";
import {
  addVendor,
  updateVendor,
  vendorByUUID,
} from "@/app/services/assetsApi";
import { useEffect, useRef, useState } from "react";
import { useLoading } from "@/app/services/loadingContext";
import { genearateCode, saveFinalCode } from "@/app/services/allApi";
import IconButton from "@/app/components/iconButton";
import SettingPopUp from "@/app/components/settingPopUp";
import ContainerCard from "@/app/components/containerCard";
import Loading from "@/app/components/Loading";

// ✅ Validation Schema
const validationSchema = Yup.object().shape({
  vendor_code: Yup.string().required("Vendor Code is required"),
  name: Yup.string()
    .trim()
    .required("Vendor name is required")
    .max(100, "Name cannot exceed 100 characters"),
  address: Yup.string()
    .trim()
    .required("Address is required")
    .max(255, "Address cannot exceed 255 characters"),
  contact: Yup.string()
    .trim()
    .required("Contact number is required")
    .matches(/^[0-9]+$/, "Contact must only contain digits")
    .min(10, "Contact must be at least 10 digits")
    .max(15, "Contact cannot exceed 15 digits"),
  email: Yup.string()
    .trim()
    .email("Invalid email format")
    .required("Email is required")
    .max(100, "Email cannot exceed 100 characters"),
  status: Yup.number()
    .required("Status is required")
    .oneOf([0, 1], "Status must be 0 (Inactive) or 1 (Active)"),
});

export default function AddEditVendor() {
  const { showSnackbar } = useSnackbar();
  const { setLoading } = useLoading();
  const router = useRouter();
  const params = useParams();

  // Safely extract uuid
  let uuid = "";
  if (params.uuid) {
    if (Array.isArray(params.uuid)) {
      uuid = params.uuid[0] || "";
    } else {
      uuid = params.uuid as string;
    }
  }

  const isAddMode = uuid === "add" || !uuid;
  const isEditMode = !isAddMode && Boolean(uuid);

  // Local state
  const [isOpen, setIsOpen] = useState(false);
  const [codeMode, setCodeMode] = useState<"auto" | "manual">("auto");
  const [prefix, setPrefix] = useState("");
  const [localLoading, setLocalLoading] = useState(false);
  const codeGeneratedRef = useRef(false);

  // ✅ Formik setup
  const formik = useFormik({
    initialValues: {
      vendor_code: "",
      name: "",
      address: "",
      contact: "",
      email: "",
      status: 1,
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      setLoading(true);
      const payload = {
        vendor_code: values.vendor_code,
        name: values.name.trim(),
        address: values.address.trim(),
        contact: values.contact.trim(),
        email: values.email.trim(),
        status: Number(values.status),
      };

      try {
        let res;
        if (isEditMode) {
          res = await updateVendor(uuid, payload);
        } else {
          res = await addVendor(payload);
        }

        if (res?.error) {
          showSnackbar(res?.data?.message || "Failed to save Vendor", "error");
        } else {
          showSnackbar(
            res?.message ||
              (isEditMode
                ? "Vendor updated successfully"
                : "Vendor added successfully"),
            "success"
          );

          // Save reserved code only after successful add
          if (!isEditMode) {
            try {
              await saveFinalCode({
                reserved_code: values.vendor_code,
                model_name: "vendor",
              });
            } catch (e) {
              console.warn("Code finalization failed:", e);
            }
          }

          resetForm();
          router.push("/assets/vendor");
        }
      } catch (error) {
        showSnackbar("Something went wrong", "error");
      } finally {
        setSubmitting(false);
        setLoading(false);
      }
    },
  });

  // ✅ Load data in edit mode / generate code in add mode
  useEffect(() => {
    const fetchVendorOrGenerateCode = async () => {
      if (isEditMode) {
        setLocalLoading(true);
        try {
          const res = await vendorByUUID(uuid);
          if (res?.data) {
            formik.setValues({
              vendor_code: res.data.code || "",
              name: res.data.name || "",
              address: res.data.address || "",
              contact: res.data.contact || "",
              email: res.data.email || "",
              status: res.data.status ?? 1,
            });
          }
        } catch {
          showSnackbar("Failed to fetch vendor details", "error");
        } finally {
          setLocalLoading(false);
        }
      } else if (!codeGeneratedRef.current) {
        codeGeneratedRef.current = true;
        try {
          const res = await genearateCode({ model_name: "vendor" });
          if (res?.code) {
            formik.setFieldValue("vendor_code", res.code);
          }
          if (res?.prefix) setPrefix(res.prefix);
        } catch {
          showSnackbar("Failed to generate vendor code", "error");
        }
      }
    };

    fetchVendorOrGenerateCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uuid]);

  // ✅ UI
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div onClick={() => router.back()} className="cursor-pointer">
          <Icon icon="lucide:arrow-left" width={24} />
        </div>
        <h1 className="text-xl font-semibold">
          {isEditMode ? "Edit Vendor" : "Add Vendor"}
        </h1>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow p-6">
        {localLoading ? (
          <Loading />
        ) : (
          <form onSubmit={formik.handleSubmit}>
            <ContainerCard>
              <h2 className="text-lg font-semibold mb-6">Vendor Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Vendor Code */}
                <div className="flex items-start gap-2 max-w-[406px]">
                  <InputFields
                    label="Vendor Code"
                    name="vendor_code"
                    value={formik.values.vendor_code}
                    onChange={formik.handleChange}
                    disabled={isEditMode || codeMode === "auto"}
                    error={
                      formik.touched.vendor_code && formik.errors.vendor_code
                    }
                  />
                  {!isEditMode && (
                    <>
                      <IconButton
                        bgClass="white"
                         className="  cursor-pointer text-[#252B37] pt-12"
                        icon="mi:settings"
                        onClick={() => setIsOpen(true)}
                      />
                      <SettingPopUp
                        isOpen={isOpen}
                        onClose={() => setIsOpen(false)}
                        title="Vendor Code"
                        prefix={prefix}
                        setPrefix={setPrefix}
                        onSave={(mode, code) => {
                          setCodeMode(mode);
                          if (mode === "auto" && code) {
                            formik.setFieldValue("vendor_code", code);
                          } else if (mode === "manual") {
                            formik.setFieldValue("vendor_code", "");
                          }
                        }}
                      />
                    </>
                  )}
                </div>

                {/* Vendor Name */}
                <InputFields
                  label="Vendor Name"
                  type="text"
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.name && formik.errors.name
                      ? formik.errors.name
                      : ""
                  }
                />

                {/* Address */}
                <InputFields
                  label="Address"
                  type="text"
                  name="address"
                  value={formik.values.address}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.address && formik.errors.address
                      ? formik.errors.address
                      : ""
                  }
                />

                {/* Contact */}
                <InputFields
                  label="Contact Number"
                  type="text"
                  name="contact"
                  value={formik.values.contact}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.contact && formik.errors.contact
                      ? formik.errors.contact
                      : ""
                  }
                />

                {/* Email */}
                <InputFields
                  label="Email Address"
                  type="text"
                  name="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.email && formik.errors.email
                      ? formik.errors.email
                      : ""
                  }
                />

                {/* Status */}
                <InputFields
                  label="Status"
                  type="select"
                  name="status"
                  value={formik.values.status.toString()}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  options={[
                    { value: "1", label: "Active" },
                    { value: "0", label: "Inactive" },
                  ]}
                  error={
                    formik.touched.status && formik.errors.status
                      ? formik.errors.status
                      : ""
                  }
                />
              </div>
            </ContainerCard>

            {/* Buttons */}
            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                className="px-4 py-2 border rounded-lg"
                onClick={() => formik.resetForm()}
              >
                Cancel
              </button>
              <SidebarBtn
                type="submit"
                label={isEditMode ? "Update" : "Submit"}
                isActive
                leadingIcon="mdi:check"
                disabled={formik.isSubmitting}
              />
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
