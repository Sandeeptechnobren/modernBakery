"use client";

import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";

import ContainerCard from "@/app/components/containerCard";
import FormInputField from "@/app/components/formInputField";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import InputFields from "@/app/components/inputFields";
import IconButton from "@/app/components/iconButton";
import SettingPopUp from "@/app/components/settingPopUp";
import Loading from "@/app/components/Loading";

import {
  getCompanyById,
  updateCompany,
  countryList,
  regionList,
  subRegionList,
} from "@/app/services/allApi";
import { useSnackbar } from "@/app/services/snackbarContext";

// ✅ Yup Schema
const CompanySchema = Yup.object({
  companyName: Yup.string().required("Company name is required"),
  companyCode: Yup.string().required("Company code is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  tinNumber: Yup.string().required("TIN Number is required"),
  vatNo: Yup.number().typeError("VAT must be a number"),
  primaryContact: Yup.string().required("Primary contact is required"),
  country: Yup.string().required("Country is required"),
});

// ✅ Types
interface DropdownOption {
  value: string;
  label: string;
}

interface Company {
  company_code: string;
  company_name: string;
  company_type: string;
  country_id: string;
  district: string;
  email: string;
  landmark: string;
  primary_contact: string;
  purchase_currency: string;
  region: string;
  selling_currency: string;
  service_type: string;
  status: string;
  street: string;
  sub_region: string;
  tin_number: string;
  toll_free_no: string;
  town: string;
  vat: string;
  website: string;
  module_access: string[];
}

interface Country {
  id?: string;
  name?: string;
  country_name?: string;
  currency?: string;
}

interface Region {
  id?: string;
  name?: string;
  region_name?: string;
}

interface SubRegion {
  id?: string;
  name?: string;
  area_name?: string;
}

// ✅ Main Component
export default function EditCompany() {
  const { id: queryId } = useParams();
  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [countries, setCountries] = useState<DropdownOption[]>([]);
  const [regions, setRegions] = useState<DropdownOption[]>([]);
  const [subRegions, setSubRegions] = useState<DropdownOption[]>([]);
  const [currencies, setCurrencies] = useState<DropdownOption[]>([]);

  // ✅ Formik
  const formik = useFormik({
    initialValues: {
      companyType: "",
      companyCode: "",
      companyName: "",
      companyLogo: null as File | null,
      companyWebsite: "",
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
      status: "1",
    },
    validationSchema: CompanySchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      if (!queryId) return;

      const modulesArray = values.modules
        ? values.modules.split(",").map((m) => m.trim())
        : [];

      const payload: Company = {
        company_code: values.companyCode,
        company_name: values.companyName,
        company_type: values.companyType,
        country_id: values.country,
        district: values.district,
        email: values.email,
        landmark: values.landmark,
        primary_contact: `${values.primaryCode}${values.primaryContact}`,
        purchase_currency: values.purchaseCurrency,
        region: values.region,
        selling_currency: values.sellingCurrency,
        service_type: values.serviceType,
        status: values.status,
        street: values.street,
        sub_region: values.subRegion,
        tin_number: values.tinNumber,
        toll_free_no: `${values.tollFreeCode}${values.tollFreeNumber}`,
        town: values.town,
        vat: values.vatNo,
        website: values.companyWebsite,
        module_access: modulesArray,
      };

      const res = await updateCompany(queryId as string, payload);
      if (res?.error) {
        showSnackbar(res?.data?.message || "Failed to update company ❌", "error");
      } else {
        showSnackbar("Company updated successfully ✅", "success");
        router.push("/dashboard/company");
      }
    },
  });

  // ✅ Fetch Dropdowns and Company Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Countries
        const countryRes = await countryList({ page: "1", limit: "200" });
        const countryOptions: DropdownOption[] = countryRes.data.map((c: Country) => ({
          value: c.id ?? "",
          label: c.name ?? c.country_name ?? "",
        }));
        const currencyOptions: DropdownOption[] = countryRes.data.map((c: Country) => ({
          value: c.currency ?? "",
          label: c.currency ?? "",
        }));
        setCountries(countryOptions);
        setCurrencies(currencyOptions);

        // Regions
        const regionRes = await regionList();
        const regionOptions: DropdownOption[] = regionRes.data.map((r: Region) => ({
          value: r.id ?? "",
          label: r.name ?? r.region_name ?? "",
        }));
        setRegions(regionOptions);

        // SubRegions
        const subRegionRes = await subRegionList();
        const subRegionOptions: DropdownOption[] = subRegionRes.data.map((sr: SubRegion) => ({
          value: sr.id ?? "",
          label: sr.name ?? sr.area_name ?? "",
        }));
        setSubRegions(subRegionOptions);

        // Company
        if (queryId) {
          const res = await getCompanyById(queryId as string);
          const company: Company = res?.data?.data || res?.data || res;

          formik.setValues({
            companyType: company.company_type,
            companyCode: company.company_code,
            companyName: company.company_name,
            companyLogo: null,
            companyWebsite: company.website,
            primaryCode: "uae",
            primaryContact: company.primary_contact || "",
            tollFreeCode: "uae",
            tollFreeNumber: company.toll_free_no || "",
            email: company.email,
            region: company.region,
            subRegion: company.sub_region,
            district: company.district,
            town: company.town,
            street: company.street,
            landmark: company.landmark,
            country: company.country_id || "",
            tinNumber: company.tin_number,
            sellingCurrency: company.selling_currency,
            purchaseCurrency: company.purchase_currency,
            vatNo: company.vat,
            modules: company.module_access ? company.module_access.join(", ") : "",
            serviceType: company.service_type,
            status: company.status,
          });
        }
      } catch (err) {
        console.error(err);
        showSnackbar("Failed to load data ❌", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [queryId]);

  if (loading) return <Loading />;

  const safeString = (val: string | string[] | undefined) =>
    Array.isArray(val) ? val[0] : val || "";

  return (
    <div className="w-full p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/company">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">Edit Company</h1>
        </div>
      </div>

      <form onSubmit={formik.handleSubmit}>
        {/* Company Details */}
        <ContainerCard>
          <h2 className="text-lg font-medium mb-4">Company Details</h2>
          <div className="flex flex-wrap gap-4">
            <InputFields
              name="companyName"
              label="Company Name"
              value={formik.values.companyName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            <InputFields
              name="companyType"
              label="Company Type"
              value={formik.values.companyType}
              onChange={formik.handleChange}
              options={[
                { value: "manufacturing", label: "Manufacturing" },
                { value: "trading", label: "Trading" },
              ]}
            />
            <div className="flex items-end gap-2 max-w-[406px]">
              <InputFields
                name="companyCode"
                label="Company Code"
                value={formik.values.companyCode}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
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
              name="companyWebsite"
              label="Website"
              value={formik.values.companyWebsite}
              onChange={formik.handleChange}
            />
          </div>
        </ContainerCard>

        {/* Contact */}
        <ContainerCard>
          <h2 className="text-lg font-medium mb-4">Contact</h2>
          <div className="flex flex-wrap gap-4">
            <div className="w-[406px]">
            <FormInputField
              type="contact"
              label="Primary Contact"
              contact={formik.values.primaryContact}
              code={formik.values.primaryCode}
              onContactChange={(e) =>
                formik.setFieldValue("primaryContact", e.target.value)
              }
              onCodeChange={(e) =>
                formik.setFieldValue("primaryCode", e.target.value)
              }
              options={currencies}
            /></div>
            <div className="w-[406px]">
            <FormInputField
              type="contact"
              label="Toll Free Number"
              contact={formik.values.tollFreeNumber}
              code={formik.values.tollFreeCode}
              options={currencies}
              onContactChange={(e) =>
                formik.setFieldValue("tollFreeNumber", e.target.value)
              }
              onCodeChange={(e) =>
                formik.setFieldValue("tollFreeCode", e.target.value)
              }
            /></div>
            <InputFields
              name="email"
              label="Email"
              value={formik.values.email}
              onChange={formik.handleChange}
            />
          </div>
        </ContainerCard>

        {/* Location */}
        <ContainerCard>
          <h2 className="text-lg font-medium mb-4">Location</h2>
          <div className="flex flex-wrap gap-4">
            <InputFields
              name="district"
              label="District"
              value={formik.values.district}
              onChange={formik.handleChange}
            />
            <InputFields
              name="town"
              label="Town/Village"
              value={formik.values.town}
              onChange={formik.handleChange}
            />
            <InputFields
              name="street"
              label="Street"
              value={formik.values.street}
              onChange={formik.handleChange}
            />
            <InputFields
              name="landmark"
              label="Landmark"
              value={formik.values.landmark}
              onChange={formik.handleChange}
            />
            <InputFields
              name="region"
              label="Region"
              value={safeString(formik.values.region)}
              onChange={formik.handleChange}
              options={regions}
            />
            <InputFields
              name="subRegion"
              label="Sub Region"
              value={safeString(formik.values.subRegion)}
              onChange={formik.handleChange}
              options={subRegions}
            />
            <InputFields
              name="country"
              label="Country"
              value={safeString(formik.values.country)}
              onChange={formik.handleChange}
              options={countries}
            />
            <InputFields
              name="tinNumber"
              label="TIN Number"
              value={formik.values.tinNumber}
              onChange={formik.handleChange}
            />
          </div>
        </ContainerCard>

        {/* Financial */}
        <ContainerCard>
          <h2 className="text-lg font-medium mb-4">Financial</h2>
          <div className="flex flex-wrap gap-4">
            <InputFields
              name="sellingCurrency"
              label="Selling Currency"
              value={formik.values.sellingCurrency}
              onChange={formik.handleChange}
            />
            <InputFields
              name="purchaseCurrency"
              label="Purchase Currency"
              value={formik.values.purchaseCurrency}
              onChange={formik.handleChange}
            />
            <InputFields
              name="vatNo"
              label="VAT (%)"
              value={formik.values.vatNo}
              onChange={formik.handleChange}
            />
          </div>
        </ContainerCard>

        {/* Additional */}
        <ContainerCard>
          <h2 className="text-lg font-medium mb-4">Additional</h2>
          <div className="flex flex-wrap gap-4">
            <InputFields
              name="modules"
              label="Modules"
              value={formik.values.modules}
              onChange={formik.handleChange}
            />
            <InputFields
              name="serviceType"
              label="Service Type"
              value={formik.values.serviceType}
              onChange={formik.handleChange}
            />
            <InputFields
              name="status"
              label="Status"
              type="select"
              value={formik.values.status}
              onChange={formik.handleChange}
              options={[
                { value: "1", label: "Active" },
                { value: "0", label: "Inactive" },
              ]}
            />
          </div>
        </ContainerCard>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            className="px-4 py-2 rounded border"
            onClick={() => router.push("/dashboard/company")}
          >
            Cancel
          </button>
          <SidebarBtn label="Update" isActive type="submit" leadingIcon="mdi:check" />
        </div>
      </form>
    </div>
  );
}