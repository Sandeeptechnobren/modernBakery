
"use client";

import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Formik, Form, ErrorMessage, type FormikHelpers } from "formik";
import * as Yup from "yup";
import InputFields from "@/app/components/inputFields";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import IconButton from "@/app/components/iconButton";
import SettingPopUp from "@/app/components/settingPopUp";
import { useSnackbar } from "@/app/services/snackbarContext";
import { addUser } from "@/app/services/allApi";
import { TableDataType } from "@/app/components/customTable";

// ✅ Yup Schema
const CountrySchema = Yup.object().shape({
    code: Yup.string().required("User Code is required."),
    name: Yup.string().required("User Name is required."),

});

export default function AddUser() {
    const { showSnackbar } = useSnackbar();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    type CountryFormValues = {
        code: string;
        name: string;

    };

    const initialValues: CountryFormValues = {
        code: "",
        name: "",

    };

    const handleSubmit = async (
        values: CountryFormValues,
        { setSubmitting }: FormikHelpers<CountryFormValues>
    ) => {
        try {
            const payload = {
                ...values,
                status: 1,
            };
            console.log("vvv",values,)

            const res = await addUser(payload);
        
            
            showSnackbar("User added successfully ", "success");

            console.log("API response ✅:", res);
            router.push("/dashboard/settings/user-types");
        } catch (error) {
            console.error("Error submitting User ❌:", error);
            showSnackbar("Failed to submit form", "error");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="w-full h-full overflow-x-hidden p-4">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/settings/country">
                        <Icon icon="lucide:arrow-left" width={24} />
                    </Link>
                    <h1 className="text-xl font-semibold text-gray-900">
                        Add New User
                    </h1>
                </div>
            </div>

            {/* ✅ Formik + Yup */}
            <Formik
                initialValues={initialValues}
                validationSchema={CountrySchema}
                onSubmit={handleSubmit}
            >
                {({ handleSubmit, values, setFieldValue }) => (
                    <Form onSubmit={handleSubmit}>
                        <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 mb-6">
                            <div className="p-6">
                                <h2 className="text-lg font-medium text-gray-800 mb-4">
                                    User Details
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Country Code */}
                                    <div className="flex items-end gap-2 max-w-[406px]">
                                        <div className="w-full">
                                            <InputFields
                                                label="User Code"
                                                value={values.code}
                                                onChange={(e) =>
                                                    setFieldValue("code", e.target.value)
                                                }
                                            />
                                            <ErrorMessage
                                                name="code"
                                                component="span"
                                                className="text-xs text-red-500"
                                            />
                                        </div>
                                        <IconButton
                                            bgClass="white"
                                            className="mb-2 cursor-pointer text-[#252B37]"
                                            icon="mi:settings"
                                            onClick={() => setIsOpen(true)}
                                        />
                                        <SettingPopUp
                                            isOpen={isOpen}
                                            onClose={() => setIsOpen(false)}
                                            title="User Code"
                                        />
                                    </div>

                                    {/* Country Name */}
                                    <div>
                                        <InputFields
                                            label="User Name"
                                            value={values.name}
                                            onChange={(e) =>
                                                setFieldValue("name", e.target.value)
                                            }
                                        />
                                        <ErrorMessage
                                            name="name"
                                            component="span"
                                            className="text-xs text-red-500"
                                        />
                                    </div>

                                    {/* Currency */}

                                </div>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end gap-4 mt-6 pr-0">
                            <button
                                type="reset"
                                className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <SidebarBtn
                                label="Submit"
                                isActive={true}
                                leadingIcon="mdi:check"
                                type="submit" />

                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
}
