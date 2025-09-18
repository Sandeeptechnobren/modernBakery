"use client";

import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Formik, Form, ErrorMessage } from "formik";
import * as Yup from "yup";

import InputFields from "@/app/components/inputFields";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import IconButton from "@/app/components/iconButton";
import SettingPopUp from "@/app/components/settingPopUp";
import { useSnackbar } from "@/app/services/snackbarContext";
import { editCompany, getCompanyById } from "@/app/services/allApi";
import Loading from "@/app/components/Loading";
import { useParams } from "next/navigation";

// ✅ Yup Schema for company
const CompanySchema = Yup.object().shape({
  company_code: Yup.string().required("Company Code is required."),
  company_name: Yup.string().required("Company Name is required."),
  company_type: Yup.string().required("Company Type is required."),
  email: Yup.string().email("Invalid email").required("Email is required."),
  district: Yup.string().required("District is required."),
});

type CompanyFormValues = {
  company_code: string;
  company_name: string;
  company_type: string;
  email: string;
  district: string;
};

export default function EditCompany() {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  // ✅ Get company id from query
  const queryId = useParams().id as string | undefined;

  const [isOpen, setIsOpen] = useState(false);
  const [initialValues, setInitialValues] = useState<CompanyFormValues | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  // ✅ Fetch company details by ID
  useEffect(() => {
    if (!queryId) {
      setLoading(false); 
      return;
    }

    const fetchCompany = async () => {
      try {
        const res = await getCompanyById(queryId);
        console.log("API response:", res);

        // 🔑 Adjust according to your API response
        const company = res.data?.data || res.data || res;

        if (!company) {
          throw new Error("Company not found in response");
        }

        setInitialValues({
          company_code: company.company_code || "",
          company_name: company.company_name || "",
          company_type: company.company_type || "",
          email: company.email || "",
          district: company.district || "",
        });
      } catch (error) {
        console.error("Failed to fetch company:", error);
        showSnackbar("Failed to load company ❌", "error");

        // ✅ fallback defaults so form still shows
        setInitialValues({
          company_code: "",
          company_name: "",
          company_type: "",
          email: "",
          district: "",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [queryId, showSnackbar]);

  // ✅ Submit handler
  const handleSubmit = async (values: CompanyFormValues) => {
    if (!queryId) return;

    try {
      await editCompany(queryId, { ...values, status: 1 });
      showSnackbar("Company updated successfully ✅", "success");
      router.push("/dashboard/company");
    } catch (error) {
      console.error("Failed to edit company:", error);
      showSnackbar("Failed to update company ❌", "error");
    }
  };

  if (loading || !initialValues) return <Loading />;

  return (
    <div className="w-full h-full overflow-x-hidden p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/company">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">Edit Company</h1>
        </div>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={CompanySchema}
        enableReinitialize
        onSubmit={handleSubmit}
      >
        {({ handleSubmit, values, setFieldValue }) => (
          <Form onSubmit={handleSubmit}>
            <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 mb-6">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-800 mb-4">
                  Company Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Company Code */}
                  <div className="flex items-end gap-2 max-w-[406px]">
                    <div className="w-full">
                      <InputFields
                        label="Company Code"
                        value={values.company_code}
                        onChange={(e) =>
                          setFieldValue("company_code", e.target.value)
                        }
                      />
                      <ErrorMessage
                        name="company_code"
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
                      title="Company Code"
                    />
                  </div>

                  {/* Company Name */}
                  <div>
                    <InputFields
                      label="Company Name"
                      value={values.company_name}
                      onChange={(e) =>
                        setFieldValue("company_name", e.target.value)
                      }
                    />
                    <ErrorMessage
                      name="company_name"
                      component="span"
                      className="text-xs text-red-500"
                    />
                  </div>

                  {/* Company Type */}
                  <div>
                    <InputFields
                      label="Company Type"
                      value={values.company_type}
                      onChange={(e) =>
                        setFieldValue("company_type", e.target.value)
                      }
                    />
                    <ErrorMessage
                      name="company_type"
                      component="span"
                      className="text-xs text-red-500"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <InputFields
                      label="Email"
                      value={values.email}
                      onChange={(e) => setFieldValue("email", e.target.value)}
                    />
                    <ErrorMessage
                      name="email"
                      component="span"
                      className="text-xs text-red-500"
                    />
                  </div>

                  {/* District */}
                  <div>
                    <InputFields
                      label="District"
                      value={values.district}
                      onChange={(e) =>
                        setFieldValue("district", e.target.value)
                      }
                    />
                    <ErrorMessage
                      name="district"
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
                label="Update"
                isActive={true}
                leadingIcon="mdi:check"
                type="submit"
              />
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
  