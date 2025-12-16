"use client";

import Button from "@/app/components/customButton";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import InputDropdown from "@/app/components/inputDropdown";
import InputFields from "@/app/components/inputFields";
import { createItemSubCategory, updateItemSubCategory, genearateCode, saveFinalCode } from "@/app/services/allApi";
import IconButton from "@/app/components/iconButton";
import SettingPopUp from "@/app/components/settingPopUp";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useFormik } from "formik";
import * as Yup from "yup";
import { subCategoryType } from "./page";
import { useEffect, useState, useRef } from "react";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";

export default function CreateUpdate({
    type,
    updateItemCategoryData,
    onClose,
    onRefresh
}: {
    type: "create" | "update";
    updateItemCategoryData?: subCategoryType;
    onClose: () => void;
    onRefresh: () => void
}) {
    const { showSnackbar } = useSnackbar();
    const { itemCategory,ensureItemCategoryLoaded } = useAllDropdownListData();
    const [options, setOptions] = useState<{ value: string; label: string }[]>([]);
    const [defaultOption, setDefaultOption] = useState<number | undefined>(undefined);

    useEffect(() => {
        ensureItemCategoryLoaded();
        const newOptions = itemCategory.map((category) => {
            return {
                value: category.id?.toString() || "",
                label: category.category_name || "",
            };
        });
        setOptions(newOptions);
        if(updateItemCategoryData) {
            const index = itemCategory.findIndex(
                (category) => category.id === updateItemCategoryData?.category_id
            );
            setDefaultOption(index);
        }
    }, [itemCategory]);

    // Code logic
    const [isOpen, setIsOpen] = useState(false);
    const [codeMode, setCodeMode] = useState<'auto'|'manual'>('auto');
    const [prefix, setPrefix] = useState('');
    const codeGeneratedRef = useRef(false);
    const [code, setCode] = useState("");

    const formik = useFormik({
        initialValues: {
            category_id: updateItemCategoryData?.category_id?.toString() || "",
            sub_category_name: updateItemCategoryData?.sub_category_name || "",
            status: updateItemCategoryData?.status || 0,
            sub_category_code: updateItemCategoryData?.sub_category_code || "",
        },
        validationSchema: Yup.object({
            category_id: Yup.number()
                .min(1, "Invalid Category")
                .required("Category Name is required"),
            sub_category_name: Yup.string()
                .required("Sub Category Name is required")
                .min(2, "Sub Category Name must be at least 2 characters")
                .max(50, "Sub Category Name cannot exceed 50 characters"),
            status: Yup.number()
                .oneOf([0, 1], "Status must be either Active or Inactive")
                .required("Status is required"),
            sub_category_code: Yup.string().required("Code is required"),
        }),
        onSubmit: async (values) => {
            let res;
            if (type === "create") {
                res = await createItemSubCategory(
                    parseInt(values.category_id),
                    values.sub_category_name,
                    values.sub_category_code,
                    values.status === "1" ? 1 : 0
                );
                if (!res.error) {
                    await saveFinalCode({ reserved_code: values.sub_category_code, model_name: "item_sub_categories" });
                }
            }
            if (type === "update") {
                res = await updateItemSubCategory(
                    parseInt(values.category_id),
                    updateItemCategoryData?.id || 0,
                    values.sub_category_name,
                    values.sub_category_code,
                    values.status === "1" ? 1 : 0
                );
            }
            if (res.error) showSnackbar(res.data.message, "error") 
            else {
                showSnackbar(res.message ? res.message : "Item Sub Category Created Successfully", "success");
                onClose();
                onRefresh();
            }
        },
    });

    // Generate code on mount (add mode only)
    useEffect(() => {
        if (type === "create" && !codeGeneratedRef.current) {
            codeGeneratedRef.current = true;
            (async () => {
                const res = await genearateCode({ model_name: "item_sub_categories" });
                if (res?.code) {
                    setCode(res.code);
                    formik.setFieldValue("sub_category_code", res.code);
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
    }, [type]);

    return (
        <div>
            <h1 className="text-[20px] font-medium">
                {type === "create"
                    ? "Create Item Sub Category"
                    : "Update Item Sub Category"}
            </h1>
            <form
                onSubmit={formik.handleSubmit}
                className="mt-[20px] space-y-5"
            >

                {/* Item Sub Category Code (auto-generated, disabled, with settings icon/popup) */}
                <div className="flex items-start gap-2 max-w-[406px]">
                    <InputFields
                        label="Item Sub Category Code"
                        name="sub_category_code"
                        value={formik.values.sub_category_code}
                        onChange={formik.handleChange}
                        disabled={codeMode === 'auto'}
                        error={formik.touched?.sub_category_code && formik.errors?.sub_category_code}
                    />
                    {/* <IconButton
                        bgClass="white"
                         className="  cursor-pointer text-[#252B37] pt-12"
                        icon="mi:settings"
                        onClick={() => setIsOpen(true)}
                    />
                    <SettingPopUp
                        isOpen={isOpen}
                        onClose={() => setIsOpen(false)}
                        title="Item Sub Category Code"
                        prefix={prefix}
                        setPrefix={setPrefix}
                        onSave={(mode, code) => {
                            setCodeMode(mode);
                            if (mode === 'auto' && code) {
                                formik.setFieldValue('sub_category_code', code);
                            } else if (mode === 'manual') {
                                formik.setFieldValue('sub_category_code', '');
                            }
                        }}
                    /> */}
                </div>

                <InputDropdown
                    label="Category Name"
                    defaultText="Select Category"
                    defaultOption={defaultOption}
                    options={options}
                    onOptionSelect={(option) => {
                        formik.setFieldValue(
                            "category_id",
                            option.value
                        );
                    }}
                />
                {formik.touched.category_id && formik.errors.category_id ? (
                    <span className="text-xs text-red-500">
                        {formik.errors.category_id}
                    </span>
                ) : null}

                <InputFields
                    id="sub_category_name"
                    name="sub_category_name"
                    value={formik.values.sub_category_name || ""}
                    label="Sub Category Name"
                    error={formik.touched.sub_category_name && formik.errors.sub_category_name}
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

                <div className="flex justify-between gap-[8px] mt-[50px]">
                    <div></div>
                    <div className="flex gap-[8px]">
                        <SidebarBtn
                            isActive={false}
                            label="Cancel"
                            labelTw="px-[20px]"
                            onClick={onClose}
            //   onClick={() => router.push("/settings/manageCompany/salesman-type")}

                        />
                        <Button type="submit" disabled={!formik.isValid || formik.isSubmitting}>
                            {type === "update" ? (formik.isSubmitting ? "Updating..." : "Update") : (formik.isSubmitting ? "Submitting..." : "Submit")}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}