
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
import { addCountry } from "@/app/services/allApi";
import { TableDataType } from "@/app/components/customTable";

// ✅ Yup Schema
const CountrySchema = Yup.object().shape({
  country_code: Yup.string().required("Country Code is required."),
  country_name: Yup.string().required("Country Name is required."),
  currency: Yup.string().required("Currency is required."),
});

export default function AddCountry() {
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  type CountryFormValues = {
    country_code: string;
    country_name: string;
    currency: string;
  };

  const initialValues: CountryFormValues = {
    country_code: "",
    country_name: "",
    currency: "",
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

      const res = await addCountry(payload);
      showSnackbar("Country added successfully ", "success");

      console.log("API response ✅:", res);
      router.push("/dashboard/settings/country");
    } catch (error) {
      console.error("Error submitting country ❌:", error);
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
            Add New Country
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
                  Country Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Country Code */}
                  <div className="flex items-end gap-2 max-w-[406px]">
                    <div className="w-full">
                      <InputFields
                        label="Country Code"
                        value={values.country_code}
                        onChange={(e) =>
                          setFieldValue("country_code", e.target.value)
                        }
                      />
                      <ErrorMessage
                        name="country_code"
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
                      title="Country Code"
                    />
                  </div>

                  {/* Country Name */}
                  <div>
                    <InputFields
                      label="Country Name"
                      value={values.country_name}
                      onChange={(e) =>
                        setFieldValue("country_name", e.target.value)
                      }
                    />
                    <ErrorMessage
                      name="country_name"
                      component="span"
                      className="text-xs text-red-500"
                    />
                  </div>

                  {/* Currency */}
                  <div>
                    <InputFields
                      label="Currency"
                      value={values.currency}
                      onChange={(e) =>
                        setFieldValue("currency", e.target.value)
                      }
                    />
                    <ErrorMessage
                      name="currency"
                      component="span"
                      className="text-xs text-red-500"
                    />
                  </div>
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
