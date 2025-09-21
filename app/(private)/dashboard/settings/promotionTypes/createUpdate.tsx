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
import { useState } from "react";

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

    const formik = useFormik({
        initialValues: {
            code: updateItemCategoryData?.code || "",
            name: updateItemCategoryData?.name || "",
            status: updateItemCategoryData?.status || 0,
        },
        validationSchema: Yup.object({
            code: Yup.string()
                .required("Code is required")
                .min(2, "Code must be at least 2 characters")
                .max(50, "Code cannot exceed 50 characters"),
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
                if (res.error) return showSnackbar(res.data.message, "error");
                else {
                    showSnackbar(
                        res.message || "Item Category Created Successfully",
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
                        res.message || "Item Category Updated Successfully",
                        "success"
                    );
                    onClose();
                    onRefresh();
                }
            }
        },
    });

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
                        error={
                            formik.touched.code &&
                            formik.errors.code
                        }
                    />
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
                    />
                </div>

                <InputFields
                    id="name"
                    name="name"
                    value={formik.values.name}
                    label="Promotion Name"
                    error={formik.touched.name && formik.errors.name}
                    onChange={formik.handleChange}
                />

                <InputDropdown
                    label="Status"
                    defaultText="Select Status"
                    defaultOption={formik.values.status}
                    dropdownTw="w-full h-fit"
                    options={[
                        { label: "Inactive", value: "0" },
                        { label: "Active", value: "1" }
                    ]}
                    onOptionSelect={(option) => {
                        formik.setFieldValue("status", parseInt(option.value));
                    }}
                />
                {formik.touched.status && formik.errors.status ? (
                    <span className="text-xs text-red-500">
                        {formik.errors.status}
                    </span>
                ) : null}

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
