"use client";

import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import ContainerCard from "@/app/components/containerCard";
import FormInputField from "@/app/components/formInputField";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import InputFields from "@/app/components/inputFields";
import IconButton from "@/app/components/iconButton";
import SettingPopUp from "@/app/components/settingPopUp";
import SearchableDropdown from "@/app/components/SearchableDropdown";
import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import {
  countryList,
  addCompany,
  regionList,
  getArea,
} from "@/app/services/allApi";
import { useSnackbar } from "@/app/services/snackbarContext";

interface Country {
  id: string | number;
  name?: string;
  country_name?: string;
  currency?: string;
}

interface Region {
  id: string | number;
  name?: string;
  region_name?: string;
}

interface SubRegion {
  id: string | number;
  name?: string;
  area_name?: string;
}

export default function AddCompany() {
  const [isOpen, setIsOpen] = useState(false);
  const [countries, setCountries] = useState<{ value: string; label: string }[]>([]);
  const [currency, setCurrency] = useState<{ value: string; label: string }[]>([]);
  const [regions, setRegions] = useState<{ value: string; label: string }[]>([]);
  const [subRegions, setSubRegions] = useState<{ value: string; label: string }[]>([]);
  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  // Yup Validation
  const CompanySchema = Yup.object({
    companyName: Yup.string().required("Company name is required"),
    companyCode: Yup.string().required("Company code is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    tinNumber: Yup.string().required("TIN Number is required"),
    vatNo: Yup.number().typeError("VAT must be a number"),
    primaryContact: Yup.string().required("Primary contact is required"),
    country: Yup.string().required("Country is required"),
    companyType: Yup.string().required("Company type is required"),
    serviceType: Yup.string().required("Service type is required"),
  });

  // Formik Setup
  const formik = useFormik({
    initialValues: {
      companyType: "",
      companyCode: "",
      companyName: "",
      companyLogo: null,
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
    onSubmit: async (values) => {
      try {
        // Convert modules string to object
        const modulesArray = values.modules
          ? values.modules.split(",").map((m) => m.trim())
          : [];
        const moduleAccess: Record<string, boolean> = {};
        modulesArray.forEach((m) => {
          if (m) moduleAccess[m] = true;
        });

        // Prepare payload
        const payload = {
          company_name: values.companyName,
          company_type: values.companyType,
          email: values.email,
          tin_number: values.tinNumber,
          vat: values.vatNo,
          country_id: Number(values.country),
          selling_currency: values.sellingCurrency,
          purchase_currency: values.purchaseCurrency,
          toll_free_no: values.tollFreeNumber,
          logo: values.companyLogo,
          website: values.companyWebsite,
          service_type: values.serviceType,
          status: values.status === "1" ? "active" : "inactive",
          module_access: moduleAccess,
          district: values.district,
          town: values.town,
          street: values.street,
          landmark: values.landmark,
          region: Number(values.region),
          sub_region: Number(values.subRegion),
          primary_contact: values.primaryContact,
        };

        // Convert to FormData to support file upload
      const formData = new FormData();
for (const key in payload) {
  const typedKey = key as keyof typeof payload;
  const value = payload[typedKey];

  if (typedKey === "module_access") {
    formData.append(typedKey, JSON.stringify(value));
  } else if (typedKey === "logo" && value instanceof File) {
    formData.append("logo", value);
  } else if (value !== undefined && value !== null) {
    // Convert numbers to strings
    formData.append(typedKey, String(value));
  }
}



        const res = await addCompany(formData);
        if (res.error) {
          showSnackbar(res.data.message || "Failed to add company!", "error");
        } else {
          showSnackbar("Company added successfully ✅", "success");
          formik.resetForm();
          router.push("/dashboard/company");
        }
      } catch (error) {
        console.error(error);
        showSnackbar("Unexpected error ❌", "error");
      }
    },
  });

  // Fetch Dropdown Data
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const countryRes = await countryList({ page: "1", limit: "200" });
        const countryOptions = (countryRes.data as Country[]).map((c) => ({
          value: String(c.id ?? ""),
          label: c.name ?? c.country_name ?? "",
        }));
        setCountries(countryOptions);

        const currencyOptions = (countryRes.data as Country[]).map((c) => ({
          value: c.currency ?? "",
          label: c.currency ?? "",
        }));
        setCurrency(currencyOptions);

        const regionRes = await regionList();
        const regionOptions = (regionRes.data as Region[]).map((r) => ({
          value: String(r.id ?? ""),
          label: r.name ?? r.region_name ?? "",
        }));
        setRegions(regionOptions);

        const subRegionRes = await getArea();
        const subRegionOptions = (subRegionRes.data as SubRegion[]).map((sr) => ({
          value: String(sr.id ?? ""),
          label: sr.name ?? sr.area_name ?? "",
        }));
        setSubRegions(subRegionOptions);
      } catch (error) {
        console.error("Failed to fetch dropdown data ❌", error);
      }
    };

    fetchDropdowns();
  }, []);

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-[20px]">
        <div className="flex items-center gap-[16px]">
          <Link href="/dashboard/company">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-[20px] font-semibold text-[#181D27] flex items-center leading-[30px] mb-[5px]">
            Add New Company
          </h1>
        </div>
      </div>

      <form onSubmit={formik.handleSubmit}>
        {/* Company Details */}
        <ContainerCard>
          <h2 className="text-lg font-semibold mb-6">Company Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <InputFields
              name="companyName"
              label="Company Name"
              value={formik.values.companyName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.companyName && formik.errors.companyName}
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
              error={formik.touched.companyType && formik.errors.companyType}
            />
            <div className="flex items-end gap-2 max-w-[406px]">
              <InputFields
                name="companyCode"
                label="Company Code"
                value={formik.values.companyCode}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.companyCode && formik.errors.companyCode}
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
              name="companyLogo"
              label="Company Logo"
              type="file"
              onChange={(e) =>
                formik.setFieldValue(
                  "companyLogo",
                  (e.currentTarget as HTMLInputElement).files?.[0] ?? null
                )
              }
            />
            <InputFields
              name="companyWebsite"
              label="Company Website"
              value={formik.values.companyWebsite}
              onChange={formik.handleChange}
            />
          </div>
        </ContainerCard>

        {/* Contact */}
        <ContainerCard>
          <h2 className="text-lg font-semibold mb-6">Contact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <FormInputField
              type="contact"
              label="Primary Contact"
              contact={formik.values.primaryContact}
              code={formik.values.primaryCode}
              onContactChange={(e) =>
                formik.setFieldValue("primaryContact", e.target.value)
              }
              onCodeChange={(e) => formik.setFieldValue("primaryCode", e.target.value)}
              options={countries}
              onBlur={formik.handleBlur}
              error={formik.touched.primaryContact && formik.errors.primaryContact}
            />
            <FormInputField
              type="contact"
              label="Toll Free Number"
              contact={formik.values.tollFreeNumber}
              code={formik.values.tollFreeCode}
              onContactChange={(e) =>
                formik.setFieldValue("tollFreeNumber", e.target.value)
              }
              onCodeChange={(e) => formik.setFieldValue("tollFreeCode", e.target.value)}
              options={countries}
            />
            <InputFields
              name="email"
              label="Email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && formik.errors.email}
            />
          </div>
        </ContainerCard>

        {/* Location */}
        <ContainerCard>
          <h2 className="text-lg font-semibold mb-6">Location Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <SearchableDropdown
              label="Region"
              name="region"
              value={formik.values.region}
              options={regions}
              onChange={(val) => formik.setFieldValue("region", val)}
            />
            <SearchableDropdown
              label="Sub Region"
              name="subRegion"
              value={formik.values.subRegion}
              options={subRegions}
              onChange={(val) => formik.setFieldValue("subRegion", val)}
            />
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
            <SearchableDropdown
              label="Country"
              name="country"
              value={formik.values.country}
              options={countries}
              onChange={(val) => formik.setFieldValue("country", val)}
              error={formik.touched.country && formik.errors.country}
            />
            <InputFields
              name="tinNumber"
              label="TIN Number"
              value={formik.values.tinNumber}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.tinNumber && formik.errors.tinNumber}
            />
          </div>
        </ContainerCard>

        {/* Financial */}
        <ContainerCard>
          <h2 className="text-lg font-semibold mb-6">Financial Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <InputFields
              name="sellingCurrency"
              label="Selling Currency"
              value={formik.values.sellingCurrency}
              onChange={formik.handleChange}
              options={currency}
            />
            <InputFields
              name="purchaseCurrency"
              label="Purchase Currency"
              value={formik.values.purchaseCurrency}
              onChange={formik.handleChange}
              options={currency}
            />
            <InputFields
              name="vatNo"
              label="VAT No (%)"
              value={formik.values.vatNo}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.vatNo && formik.errors.vatNo}
            />
          </div>
        </ContainerCard>

        {/* Additional */}
        <ContainerCard>
          <h2 className="text-lg font-semibold mb-6">Additional Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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
              options={[
                { value: "branch", label: "Branch" },
                { value: "warehouse", label: "Warehouse" },
              ]}
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

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            className="px-4 py-2 h-[40px] w-[80px] rounded-md font-semibold border border-gray-300 text-gray-700 hover:bg-gray-100"
            type="button"
            onClick={() => router.back()}
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
    </>
  );
}
