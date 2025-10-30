"use client";

import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import InputDropdown from "@/app/components/inputDropdown";
import InputFields from "@/app/components/inputFields";
import {
    addPromotionType,
    updatePromotionType,
} from "@/app/services/allApi";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useFormik } from "formik";
import * as Yup from "yup";
import { promotionType } from "./page";
import IconButton from "@/app/components/iconButton";
import SettingPopUp from "@/app/components/settingPopUp";
import { useState, useRef, useEffect } from "react";
import { genearateCode, saveFinalCode } from "@/app/services/allApi";

export default function CreateUpdate({
    type,
    updateItemCategoryData,
    onClose,
    onRefresh,
}: {
    type: "create" | "update";
    updateItemCategoryData?: promotionType;
    onClose: () => void;
    onRefresh: () => void;
}) {
    const { showSnackbar } = useSnackbar();
    const [isOpen, setIsOpen] = useState(false);
    const [codeMode, setCodeMode] = useState<'auto'|'manual'>('auto');
    const [prefix, setPrefix] = useState('');
    const [code, setCode] = useState("");
    const codeGeneratedRef = useRef(false);

    const formik = useFormik({
        initialValues: {
            code: updateItemCategoryData?.code || "",
            name: updateItemCategoryData?.name || "",
            status: updateItemCategoryData?.status || 0,
        },
        validationSchema: Yup.object({
            code: Yup.string()
                .required("Promotion Code is required")
                .min(2, "Promotion Code must be at least 2 characters")
                .max(50, "Promotion Code cannot exceed 50 characters"),
            name: Yup.string()
                .required("Promotion Type Name is required")
                .min(2, "Promotion Type Name must be at least 2 characters")
                .max(50, "Promotion Type Name cannot exceed 50 characters"),
            status: Yup.number()
                .oneOf([0, 1], "Status must be either 0 or 1")
                .required("Status is required"),
        }),
        onSubmit: async (values) => {
            if (type === "create") {
                const res = await addPromotionType({
                    code: values.code,
                    name: values.name,
                    status: values.status,
                });
                try {
                  await saveFinalCode({ reserved_code: values.code, model_name: "promotion_type" });
                } catch (e) {}
                if (res.error) return showSnackbar(res.data.message, "error");
                else {
                    showSnackbar(
                        res.message || "Promotion Type Created Successfully",
                        "success"
                    );
                    onClose();
                    onRefresh();
                }
            }
            if (type === "update") {
                const res = await updatePromotionType(
                    {
                        code: values.code || "0",
                        name: values.name,
                        status: values.status || 0,
                    },
                    updateItemCategoryData?.id || 0
                );
                if (res.error) return showSnackbar(res.data.message, "error");
                else {
                    showSnackbar(
                        res.message || "Promotion Type Updated Successfully",
                        "success"
                    );
                    onClose();
                    onRefresh();
                }
            }
        },
    });

    useEffect(() => {
      if (type === "create" && !codeGeneratedRef.current) {
        codeGeneratedRef.current = true;
        (async () => {
          const res = await genearateCode({ model_name: "promotion_type" });
          if (res?.code) {
            setCode(res.code);
            formik.setFieldValue("code", res.code);
          }
          if (res?.prefix) {
            setPrefix(res.prefix);
          } else if (res?.code) {
            // fallback: extract prefix from code if possible
            const match = res.prefix;
            if (match) setPrefix(prefix);
          }
        })();
      }
    }, [type]);

    return (
        <div>
            <h1 className="text-[20px] font-medium">
                {type === "create"
                    ? "Create Promotion Type"
                    : "Update Promotion Type"}
            </h1>
            <form
                onSubmit={formik.handleSubmit}
                className="mt-[20px] space-y-5"
            >
                                <div className="flex items-end gap-2 max-w-[406px]">
                                        <InputFields
                                                name="code"
                                                label="Promotion Code"
                                                value={formik.values.code}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                error={formik.touched.code && formik.errors.code}
                                                disabled={codeMode === 'auto' && type === 'create'}
                                        />
                                        {type === 'create' && (
                                            <>
                                                <IconButton
                                                    bgClass="white"
                                                    className="cursor-pointer text-[#252B37] h-full mb-3"
                                                    icon="mi:settings"
                                                    onClick={() => setIsOpen(true)}
                                                />
                                                <SettingPopUp
                                                    isOpen={isOpen}
                                                    onClose={() => setIsOpen(false)}
                                                    title="Promotion Code"
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
                    id="name"
                    name="name"
                    value={formik.values.name}
                    label="Promotion Name"
                    error={formik.touched.name && formik.errors.name}
                    onChange={formik.handleChange}
                />

                <div>
  <InputFields
    required
    label="Status"
    name="status"
    value={String(formik.values.status)}
    options={[
      { value: "1", label: "Active" },
      { value: "0", label: "Inactive" },
    ]}
    onChange={(e) => formik.setFieldValue("status", e.target.value)}
    type="radio"
    error={
      formik.touched.status && formik.errors.status
        ? formik.errors.status
        : false
    }
  />
  {formik.touched.status && formik.errors.status ? (
    <span className="text-xs text-red-500">{formik.errors.status}</span>
  ) : null}
</div>
 {/* : null} */}

                <div className="flex justify-between gap-[8px] mt-[50px]">
                    <div></div>
                    <div className="flex gap-[8px]">
                        <SidebarBtn
                            isActive={false}
                            buttonTw="h-10"
                            label="Cancel"
                            labelTw="px-[20px]"
                            onClick={onClose}
                        />
                        <SidebarBtn
                            isActive={true}
                            buttonTw="h-10"
                            type="submit"
                            disabled={!formik.isValid}
                            label="Submit"
                            labelTw="px-[20px]"
                        />
                    </div>
                </div>
            </form>
        </div>
    );
}