"use client";

import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Formik, Form } from "formik";

import ContainerCard from "@/app/components/containerCard";
import InputFields from "@/app/components/inputFields";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import IconButton from "@/app/components/iconButton";
import SettingPopUp from "@/app/components/settingPopUp";
import { useSnackbar } from "@/app/services/snackbarContext";
import { updateCompany, companyList } from "@/app/services/allApi";
import Loading from "@/app/components/Loading";

// ✅ Company type with all fields you’re accessing
interface Company {
  id: string | number;
  company_type?: string;
  company_code?: string;
  company_name?: string;
  website?: string;
  primary_contact?: string;
  toll_free_no?: string;
  email?: string;
  region?: string;
  sub_region?: string;
  district?: string;
  town?: string;
  street?: string;
  landmark?: string;
  country_id?: string;
  tin_number?: string;
  selling_currency?: string;
  purchase_currency?: string;
  vat?: string;
  module_access?: string[];
  service_type?: string;
}

// ✅ Form values type
interface CompanyFormValues {
  companyType: string;
  companyCode: string;
  companyName: string;
  companyWebsite: string;
  companyLogo: File | null;
  primaryCode: string;
  primaryContact: string;
  tollFreeCode: string;
  tollFreeNumber: string;
  email: string;
  region: string;
  subRegion: string;
  district: string;
  town: string;
  street: string;
  landmark: string;
  country: string;
  tinNumber: string;
  sellingCurrency: string;
  purchaseCurrency: string;
  vatNo: string;
  modules: string;
  serviceType: string;
}

// ✅ Static dropdowns
const companyTypeOptions = [
  { value: "manufacturing", label: "Manufacturing" },
  { value: "trading", label: "Trading" },
];

const serviceTypeOptions = [
  { value: "branch", label: "Branch" },
  { value: "warehouse", label: "Warehouse" },
];

export default function EditCompany() {
  const router = useRouter();
  const { id: queryId } = useParams();
  const { showSnackbar } = useSnackbar();

  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const defaultValues: CompanyFormValues = {
    companyType: "",
    companyCode: "",
    companyName: "",
    companyWebsite: "",
    companyLogo: null,
    primaryCode: "uae",
    primaryContact: "",
    tollFreeCode: "uae",
    tollFreeNumber: "",
    email: "",
    region: "",
    subRegion: "",
    district: "",
    town: "",
    street: "",
    landmark: "",
    country: "",
    tinNumber: "",
    sellingCurrency: "USD",
    purchaseCurrency: "USD",
    vatNo: "",
    modules: "",
    serviceType: "",
  };

  const [initialValues, setInitialValues] = useState<CompanyFormValues>(defaultValues);

  // ✅ Fetch company
  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await companyList();
        const companies: Company[] = res?.data?.data || res?.data || [];

        const company = companies.find((c) => String(c.id) === String(queryId));

        if (!company) {
          showSnackbar("Company not found ❌", "error");
          router.push("/dashboard/company");
          return;
        }

        setInitialValues({
          companyType: company.company_type || "",
          companyCode: company.company_code || "",
          companyName: company.company_name || "",
          companyWebsite: company.website || "",
          companyLogo: null,
          primaryCode: "uae",
          primaryContact: company.primary_contact || "",
          tollFreeCode: "uae",
          tollFreeNumber: company.toll_free_no || "",
          email: company.email || "",
          region: company.region || "",
          subRegion: company.sub_region || "",
          district: company.district || "",
          town: company.town || "",
          street: company.street || "",
          landmark: company.landmark || "",
          country: company.country_id || "",
          tinNumber: company.tin_number || "",
          sellingCurrency: company.selling_currency || "USD",
          purchaseCurrency: company.purchase_currency || "USD",
          vatNo: company.vat || "",
          modules: Array.isArray(company.module_access) ? company.module_access.join(", ") : "",
          serviceType: company.service_type || "",
        });
      } catch (err) {
        console.error(err);
        showSnackbar("Failed to load company ❌", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [queryId, router, showSnackbar]);

  const handleSubmit = async (values: CompanyFormValues) => {
    try {
      const res = await updateCompany(queryId as string, { ...values, status: 1 });
      if (res?.error) {
        showSnackbar(res?.data?.message || "Failed to update company ❌", "error");
      } else {
        showSnackbar("Company updated successfully ✅", "success");
        router.push("/dashboard/company");
      }
    } catch (err) {
      console.error(err);
      showSnackbar("Unexpected error ❌", "error");
    }
  };

  if (loading) return <Loading />;

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

      <Formik initialValues={initialValues} enableReinitialize onSubmit={handleSubmit}>
        {({ values, setFieldValue, handleSubmit }) => (
          <Form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Details */}
            <ContainerCard>
              <h2 className="text-lg font-semibold mb-4">Company Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-end gap-2 max-w-[406px]">
                  <InputFields
                    label="Company Code"
                    value={values.companyCode}
                    onChange={(e) => setFieldValue("companyCode", e.target.value)}
                  />
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

                <InputFields
                  label="Company Name"
                  value={values.companyName}
                  onChange={(e) => setFieldValue("companyName", e.target.value)}
                />

                <InputFields
                  label="Company Type"
                  value={values.companyType}
                  onChange={(e) => setFieldValue("companyType", e.target.value)}
                  options={companyTypeOptions}
                />

                <InputFields
                  label="Company Website"
                  value={values.companyWebsite}
                  onChange={(e) => setFieldValue("companyWebsite", e.target.value)}
                />

                <InputFields
                  label="Company Logo"
                  type="file"
                  onChange={(e) =>
                    setFieldValue("companyLogo", (e.target as HTMLInputElement).files?.[0])
                  }
                />
              </div>
            </ContainerCard>

            {/* Contact */}
            <ContainerCard>
              <h2 className="text-lg font-semibold mb-4">Contact</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InputFields
                  label="Primary Contact"
                  value={values.primaryContact}
                  onChange={(e) => setFieldValue("primaryContact", e.target.value)}
                />
                <InputFields
                  label="Toll Free Number"
                  value={values.tollFreeNumber}
                  onChange={(e) => setFieldValue("tollFreeNumber", e.target.value)}
                />
                <InputFields
                  label="Email"
                  value={values.email}
                  onChange={(e) => setFieldValue("email", e.target.value)}
                />
              </div>
            </ContainerCard>

            {/* Location */}
            <ContainerCard>
              <h2 className="text-lg font-semibold mb-4">Location Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InputFields
                  label="Region"
                  value={values.region}
                  onChange={(e) => setFieldValue("region", e.target.value)}
                />
                <InputFields
                  label="Sub Region"
                  value={values.subRegion}
                  onChange={(e) => setFieldValue("subRegion", e.target.value)}
                />
                <InputFields
                  label="District"
                  value={values.district}
                  onChange={(e) => setFieldValue("district", e.target.value)}
                />
                <InputFields
                  label="Town/Village"
                  value={values.town}
                  onChange={(e) => setFieldValue("town", e.target.value)}
                />
                <InputFields
                  label="Street"
                  value={values.street}
                  onChange={(e) => setFieldValue("street", e.target.value)}
                />
                <InputFields
                  label="Landmark"
                  value={values.landmark}
                  onChange={(e) => setFieldValue("landmark", e.target.value)}
                />
                <InputFields
                  label="Country"
                  value={values.country}
                  onChange={(e) => setFieldValue("country", e.target.value)}
                />
                <InputFields
                  label="TIN Number"
                  value={values.tinNumber}
                  onChange={(e) => setFieldValue("tinNumber", e.target.value)}
                />
              </div>
            </ContainerCard>

            {/* Finance */}
            <ContainerCard>
              <h2 className="text-lg font-semibold mb-4">Finance</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InputFields
                  label="VAT No"
                  value={values.vatNo}
                  onChange={(e) => setFieldValue("vatNo", e.target.value)}
                />
                <InputFields
                  label="Selling Currency"
                  value={values.sellingCurrency}
                  onChange={(e) => setFieldValue("sellingCurrency", e.target.value)}
                />
                <InputFields
                  label="Purchase Currency"
                  value={values.purchaseCurrency}
                  onChange={(e) => setFieldValue("purchaseCurrency", e.target.value)}
                />
              </div>
            </ContainerCard>

            {/* Modules & Access */}
            <ContainerCard>
              <h2 className="text-lg font-semibold mb-4">Modules & Access</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InputFields
                  label="Modules"
                  value={values.modules}
                  onChange={(e) => setFieldValue("modules", e.target.value)}
                />
                <InputFields
                  label="Service Type"
                  value={values.serviceType}
                  onChange={(e) => setFieldValue("serviceType", e.target.value)}
                  options={serviceTypeOptions}
                />
              </div>
            </ContainerCard>

            {/* Buttons */}
            <div className="flex justify-end gap-4 mt-6">
              <button
                type="reset"
                className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <SidebarBtn label="Update" isActive={true} leadingIcon="mdi:check" type="submit" />
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
