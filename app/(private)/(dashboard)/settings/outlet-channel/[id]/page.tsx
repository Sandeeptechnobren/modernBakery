"use client";

import { useEffect, useState, useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import ContainerCard from "@/app/components/containerCard";
import InputFields from "@/app/components/inputFields";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import Loading from "@/app/components/Loading";
import IconButton from "@/app/components/iconButton";
import SettingPopUp from "@/app/components/settingPopUp";
import { updateOutletChannel, addOutletChannel, getOutletChannelById } from "@/app/services/allApi";
import { genearateCode, saveFinalCode } from "@/app/services/allApi";

import { useSnackbar } from "@/app/services/snackbarContext";

type OutletChannel = {
  outlet_channel_code: string;
  outlet_channel: string;
  status: string; // "active" | "inactive"
};

  export default function AddEditOutletChannel() {

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
  const formik = useFormik<OutletChannel>({
    initialValues: {
      outlet_channel_code: "",
      outlet_channel: "",
      status: "active", // default
    },
    validationSchema: Yup.object({
      outlet_channel_code: Yup.string().required("Outlet Channel Code is required."),
      outlet_channel: Yup.string().required("Outlet Channel Name is required."),
      status: Yup.string().required("Status is required."),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const payload = {
          outlet_channel_code: values.outlet_channel_code,
          outlet_channel: values.outlet_channel,
          status: values.status === "active" ? 1 : 0,
        };
        let res;
        if (isEditMode && params?.id && params.id !== "add") {
          res = await updateOutletChannel(String(params.id), payload);
        } else {
          res = await addOutletChannel(payload);
          if (!res?.error) {
            try {
              await saveFinalCode({ reserved_code: values.outlet_channel_code, model_name: "outlet_channel" });
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
                ? "Channel Updated Successfully"
                : "Channel Created Successfully"),
            "success"
          );
          router.push("/settings/outlet-channel");
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
          const res = await getOutletChannelById(String(params.id));
          if (res?.data) {
            formik.setValues({
              outlet_channel_code: res.data.outlet_channel_code || "",
              outlet_channel: res.data.outlet_channel || "",
              status: res.data.status === 1 ? "active" : "inactive",
            });
          }
        } catch (error) {
          console.error("Failed to fetch outlet channel", error);
        } finally {
          setLoading(false);
        }
      })();
    } else if (!isEditMode && !codeGeneratedRef.current) {
      codeGeneratedRef.current = true;
      (async () => {
        const res = await genearateCode({ model_name: "outlet_channel" });
        if (res?.code) {
          formik.setFieldValue("outlet_channel_code", res.code);
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
          <Link href="/settings/outlet-channel">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-[20px] font-semibold text-[#181D27] flex items-center leading-[30px] mb-[5px]">
            {isEditMode ? "Edit Channel" : "Add New Channel"}
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
              Outlet Channel Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Outlet Channel Code (pattern-matched UI) */}
              <div className="flex items-start gap-2 max-w-[406px]">
                <InputFields
                  label="Outlet Channel Code"
                  name="outlet_channel_code"
                  value={formik.values.outlet_channel_code}
                  onChange={formik.handleChange}
                  disabled={codeMode === 'auto'}
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
                      title="Outlet Channel Code"
                      prefix={prefix}
                      setPrefix={setPrefix}
                      onSave={(mode, code) => {
                        setCodeMode(mode);
                        if (mode === 'auto' && code) {
                          formik.setFieldValue('outlet_channel_code', code);
                        } else if (mode === 'manual') {
                          formik.setFieldValue('outlet_channel_code', '');
                        }
                      }}
                    />
                  </>
                )}
              </div>
              {/* Outlet Channel Name */}
              <InputFields
                type="text"
                name="outlet_channel"
                label="Outlet Channel Name"
                value={formik.values.outlet_channel}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.outlet_channel && formik.errors.outlet_channel}
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
