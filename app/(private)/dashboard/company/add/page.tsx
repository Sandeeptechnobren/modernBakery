"use client";

import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import ContainerCard from "@/app/components/containerCard";
import FormInputField from "@/app/components/formInputField";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import InputFields from "@/app/components/inputFields";
import IconButton from "@/app/components/iconButton";
import SettingPopUp from "@/app/components/settingPopUp";
import { useState, useEffect } from "react";
import { countryList } from "@/app/services/allApi";

export default function AddCustomer() {
  const [isOpen, setIsOpen] = useState(false);

  // Form states
  const [companyType, setCompanyType] = useState("");
  const [companyCode, setCompanyCode] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyLogo, setCompanyLogo] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [primaryCode, setPrimaryCode] = useState("uae");
  const [primaryContact, setPrimaryContact] = useState("");
  const [tollFreeCode, setTollFreeCode] = useState("uae");
  const [tollFreeNumber, setTollfreeNumber] = useState("");
  const [email, setEmail] = useState("");
  const [region, setRegion] = useState("");
  const [subRegion, setSubRegion] = useState("");
  const [district, setDistrict] = useState("");
  const [town, setTown] = useState("");
  const [street, setStreet] = useState("");
  const [landmark, setLandmark] = useState("");
  const [country, setCountry] = useState("");
  const [tinNumber, setTinNumber] = useState("");
  const [sellingCurrency, setSellingCurrency] = useState("usd");
  const [sellingAmount, setSellingAmount] = useState("");
  const [purchaseCurrency, setPurchaseCurrency] = useState("usd");
  const [purchaseAmount, setPurchaseAmount] = useState("");
  const [vatNo, setVatNo] = useState("");
  const [modules, setModules] = useState("");
  const [company, setCompany] = useState("");

  
  const [countries, setCountries] = useState<{ value: string; label: string }[]>([]);
  const [currency, setCurrency ] = useState<{ value: string; label: string }[]>([]);

  type ApiCountry = {
  id?: string;
  code?: string;
  name?: string;
  country_name?: string;
};

useEffect(() => {
  const fetchCountries = async () => {
    try {
      const res = await countryList({ page: "1", limit: "200" });

      const options = res.data.map((c: ApiCountry) => ({
        value: c.code ?? c.id ?? "",
        label: c.name ?? c.country_name ?? "",
      }));

      setCountries(options);
    } catch (error) {
      console.error("Failed to fetch countries ❌", error);
    }
  };

  fetchCountries();
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

      <div>
        {/* Company Details */}
        <ContainerCard>
          <h2 className="text-lg font-semibold mb-6">Company Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <InputFields
              label="Company Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />

            <InputFields
              label="Company Type"
              value={companyType}
              onChange={(e) => setCompanyType(e.target.value)}
             options={countries}
            />

            <div className="flex items-end gap-2 max-w-[406px]">
              <InputFields
                label="Company Code"
                value={companyCode}
                onChange={(e) => setCompanyCode(e.target.value)}
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
              label="Company Logo"
              type="file"
              value={companyLogo}
              onChange={(e) => setCompanyLogo(e.target.value)}
            />

            <InputFields
              label="Company Website"
              value={companyWebsite}
              onChange={(e) => setCompanyWebsite(e.target.value)}
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
              contact={primaryContact}
              code={primaryCode}
              onContactChange={(e) => setPrimaryContact(e.target.value)}
              onCodeChange={(e) => setPrimaryCode(e.target.value)}
              options={countries}
            />

            <FormInputField
              type="contact"
              label="Toll Free Number"
              contact={tollFreeNumber}
              code={tollFreeCode}
              onContactChange={(e) => setTollfreeNumber(e.target.value)}
              onCodeChange={(e) => setTollFreeCode(e.target.value)}
              options={countries}
            />

            <InputFields
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </ContainerCard>

        {/* Location */}
        <ContainerCard>
          <h2 className="text-lg font-semibold mb-6">Location Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <InputFields
              label="Region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              options={countries}
            />
            <InputFields
              label="Sub Region"
              value={subRegion}
              onChange={(e) => setSubRegion(e.target.value)}
              options={countries}
            />
            <InputFields
              label="District"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
            />

            <InputFields
              label="Town/Village"
              value={town}
              onChange={(e) => setTown(e.target.value)}
            />
            <InputFields
              label="Street"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
            />
            <InputFields
              label="Landmark"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
            />


            <InputFields
              label="Country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              options={countries}
            />

            <InputFields
              label="TIN Number"
              value={tinNumber}
              onChange={(e) => setTinNumber(e.target.value)}
            />
          </div>
        </ContainerCard>

        {/* Financial */}
        <ContainerCard>
          <h2 className="text-lg font-semibold mb-6">Financial Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <FormInputField
              type="amount"
              label="Selling Currency"
              amount={sellingAmount}
              currency={sellingCurrency}
              onAmountChange={(e) => setSellingAmount(e.target.value)}
              onCurrencyChange={(e) => setSellingCurrency(e.target.value)}
              options={currency}
            />

            <FormInputField
              type="amount"
              label="Purchase Currency"
              amount={purchaseAmount}
              currency={purchaseCurrency}
              onAmountChange={(e) => setPurchaseAmount(e.target.value)}
              onCurrencyChange={(e) => setPurchaseCurrency(e.target.value)}
              options={currency}
            />

            <InputFields
              id="vatNo"
              label="VAT No (%)"
              value={vatNo}
              onChange={(e) => setVatNo(e.target.value)}
            />
          </div>
        </ContainerCard>

        {/* Additional */}
        <ContainerCard>
          <h2 className="text-lg font-semibold mb-6">Additional Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <InputFields
              label="Modules"
              value={modules}
              onChange={(e) => setModules(e.target.value)}
             options={countries}
            />

            <InputFields
              label="Company Type"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              options={countries}
            />
          </div>
        </ContainerCard>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end gap-3 mt-6">
        <button
          className="px-4 py-2 h-[40px] w-[80px] rounded-md font-semibold border border-gray-300 text-gray-700 hover:bg-gray-100"
          type="button"
        >
          Cancel
        </button>

        <SidebarBtn
          label="Submit"
          isActive={true}
          leadingIcon="mdi:check"
          onClick={() => console.log("Form submitted ✅")}
        />
      </div>
    </>
  );
}
