"use client";

import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Formik, Form, ErrorMessage, type FormikHelpers } from "formik";
import * as Yup from "yup";
import InputFields from "@/app/components/inputFields";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import IconButton from "@/app/components/iconButton";
import SettingPopUp from "@/app/components/settingPopUp";
import { useSnackbar } from "@/app/services/snackbarContext";
import { addCountry, countryById, editCountry, genearateCode, saveFinalCode } from "@/app/services/allApi";
import Loading from "@/app/components/Loading";

// ✅ Yup Schema
const CountrySchema = Yup.object().shape({
  country_code: Yup.string().required("Country Code is required."),
  country_name: Yup.string().required("Country Name is required."),
  currency: Yup.string().required("Currency is required."),
  status: Yup.string().required("Status is required."),
});

export default function AddEditCountry() {
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const params = useParams();
  const [isOpen, setIsOpen] = useState(false);
  const [codeMode, setCodeMode] = useState<'auto' | 'manual'>('auto');
  const [prefix, setPrefix] = useState('');
  const [code, setCode] = useState("");
  const codeGeneratedRef = useRef(false);
  const [initialValues, setInitialValues] = useState({
    country_code: "",
    country_name: "",
    currency: "",
    status: "1", // default Active
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  type CountryFormValues = {
    country_code: string;
    country_name: string;
    currency: string;
    status: string;
  };

  // ✅ Fetch data if editing
  useEffect(() => {
    if (params?.id && params.id !== "add") {
      setIsEditMode(true);
      setLoading(true);
      (async () => {
        try {
          const res = await countryById(String(params.id));
          if (res?.data) {
            setInitialValues({
              country_code: res.data.country_code || "",
              country_name: res.data.country_name || "",
              currency: res.data.currency || "",
              status: String(res.data.status ?? "1"),
            });
          }
        } catch (error) {
          console.error("Failed to fetch country", error);
        } finally {
          setLoading(false);
        }
      })();
    } else if (!codeGeneratedRef.current) {
      codeGeneratedRef.current = true;
      (async () => {
        const res = await genearateCode({ model_name: "country" });
        if (res?.code) {
          setCode(res.code);
          setInitialValues((prev) => ({ ...prev, country_code: res.code }));
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
  }, [params?.id]);

  // ✅ Handle form submit
  const handleSubmit = async (
    values: CountryFormValues,
    { setSubmitting }: FormikHelpers<CountryFormValues>
  ) => {
    const payload = {
      ...values,
      status: Number(values.status),
    };

    let res;
    if (isEditMode && params?.id !== "add") {
      res = await editCountry(String(params.id), payload); // 👈 API call
    } else {
      res = await addCountry(payload);
      try {
        await saveFinalCode({ reserved_code: values.country_code, model_name: "country" });
      } catch (e) { }
    }

    if (res.error) {
      showSnackbar(res.data?.message || "Failed to submit form", "error");
    } else {
      showSnackbar(
        res.message || (isEditMode ? "Country Updated Successfully" : "Country Created Successfully"),
        "success"
      );
      router.push("/settings/country");
    }
    setSubmitting(false);
  };

  if (isEditMode && loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-x-hidden p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/settings/country">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">
            {isEditMode ? "Update Country" : "Add New Country"}
          </h1>
        </div>
      </div>

      {/* ✅ Formik + Yup */}
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={CountrySchema}
        onSubmit={handleSubmit}
      >
        {({ handleSubmit, values, setFieldValue, errors, touched, isSubmitting }) => (
          <Form onSubmit={handleSubmit}>
            <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 mb-6">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-800 mb-4">
                  Country Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Country Code */}
                  <div>
                    <div className="w-full">
                      <InputFields
                        required
                        label="Country Code"
                        value={values.country_code}
                        onChange={(e) => setFieldValue("country_code", e.target.value)}
                        disabled={isEditMode || (codeMode === 'auto' && !isEditMode)}
                      />
                      <ErrorMessage
                        name="country_code"
                        component="span"
                        className="text-xs text-red-500"
                      />
                    </div>
                    {/* {!isEditMode && (
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
                          title="Country Code"
                          prefix={prefix}
                          setPrefix={setPrefix}
                          onSave={(mode, code) => {
                            setCodeMode(mode);
                            if (mode === 'auto' && code) {
                              setFieldValue('country_code', code);
                            } else if (mode === 'manual') {
                              setFieldValue('country_code', '');
                            }
                          }}
                        />
                      </>
                    )} */}
                  </div>

                  {/* Country Name */}
                  <div>
                    <InputFields
                      required
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

                  {/* Status */}


                  {/* Currency */}
                  <div>
                    <InputFields
                      required
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
                  <div>
                    <InputFields
                      label="Status"
                      name="status"
                      value={values.status}
                      options={[
                        { value: "1", label: "Active" },
                        { value: "0", label: "Inactive" },
                      ]}
                      onChange={(e) => setFieldValue("status", e.target.value)}
                      type="radio"
                      required
                      error={
                        errors?.status && touched?.status ? errors.status : false
                      }
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
                label={isEditMode ? (isSubmitting ? "Updating..." : "Update") : (isSubmitting ? "Submitting..." : "Submit")}
                isActive={true}
                leadingIcon="mdi:check"
                type="submit"
                disabled={isSubmitting}
              />
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
