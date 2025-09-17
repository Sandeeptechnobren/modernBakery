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
import { countryList, addCompany } from "@/app/services/allApi";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";

export default function AddCustomer() {
    const { countryOptions,companyCustomersType, companyOptions } = useAllDropdownListData();

    // Debug: print companyOptions to the console
    useEffect(() => {
        console.log('companyOptions:', countryOptions);
    }, [companyOptions]);
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
    const [sellingCurrency, setSellingCurrency] = useState("USD");
    const [purchaseCurrency, setPurchaseCurrency] = useState("USD");
    const [vatNo, setVatNo] = useState("");
    const [modules, setModules] = useState("");
    const [serviceType, setServiceType] = useState("");

    const [countries, setCountries] = useState<
        { value: string; label: string }[]
    >([]);
    const [currency, setCurrency] = useState<
        { value: string; label: string }[]
    >([]);

    type ApiCountry = {
        id?: string;
        code?: string;
        name?: string;
        country_name?: string;
        currency?: string;
    };

    // type ApiCompany = {
    //   id?: string;
    //   company_code?: string;
    //   company_type?: string;
    //   service_type?: string;
    // };

    // ✅ Fetch dropdown data
    useEffect(() => {
        const fetchDropdowns = async () => {
            try {
                const countryRes = await countryList({
                    page: "1",
                    limit: "200",
                });
                const countryOptions = countryRes.data.map((c: ApiCountry) => ({
                    value: c.id ?? "",
                    label: c.name ?? c.country_name ?? "",
                }));
                const countryCurrency = countryRes.data.map(
                    (c: ApiCountry) => ({
                        value: c.currency ?? "",
                        label: c.currency ?? "",
                    })
                );
                setCurrency(countryCurrency);
                setCountries(countryOptions);

                // const companyRes = await companyList();
                // const companyOptions = companyRes.data.map((c: ApiCompany) => ({
                //   value: c.company_code ?? "",
                //   label: c.company_type ?? "",
                // }));
                // const companyService = companyRes.data.map((c: ApiCompany) => ({
                //   value: c.company_code ?? "",
                //   label: c.service_type ?? "",
                // }));
                // setCompanies(companyOptions);
                // setServiceType(companyService);
            } catch (error) {
                console.error("Failed to fetch dropdown data ❌", error);
            }
        };

        fetchDropdowns();
    }, []);

    const handleSubmit = async () => {
        const payload = {
            company_code: companyCode,
            company_name: companyName,
            email,
            tin_number: tinNumber,
            vat: vatNo,
            country_id: country,
            selling_currency: sellingCurrency,
            purchase_currency: purchaseCurrency,
            toll_free_no: `${tollFreeCode}${tollFreeNumber}`,
            logo: companyLogo,
            website: companyWebsite,
            service_type: serviceType,
            company_type: companyType,
            status: "active",
            module_access: modules,
            district,
            town,
            street,
            landmark,
            region,
            sub_region: subRegion,
            primary_contact: `${primaryCode}${primaryContact}`,
        };

        try {
            const res = await addCompany(payload);
            console.log("Company Added ✅", res);
            alert("Company added successfully!");
        } catch (error) {
            console.error("Add Company failed ❌", error);
            alert("Failed to add company!");
        }
    };

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
                    <h2 className="text-lg font-semibold mb-6">
                        Company Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <InputFields
                            name="companyName"
                            label="Company Name"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                        />
                        <InputFields
                            name="companyType"
                            label="Company Type"
                            value={companyType}
                            onChange={(e) => setCompanyType(e.target.value)}
                            options={[
                                {
                                    value: "manufacturing",
                                    label: "Manufacturing",
                                },
                                { value: "trading", label: "Trading" },
                            ]}
                        />
                        <div className="flex items-end gap-2 max-w-[406px]">
                            <InputFields
                                name="companyCode"
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
                            name="companyLogo"
                            label="Company Logo"
                            type="file"
                            value={companyLogo}
                            onChange={(e) => setCompanyLogo(e.target.value)}
                        />
                        <InputFields
                            name="companyWebsite"
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
                            onContactChange={(e) =>
                                setPrimaryContact(e.target.value)
                            }
                            onCodeChange={(e) => setPrimaryCode(e.target.value)}
                            options={countries}
                        />
                        <FormInputField
                            type="contact"
                            label="Toll Free Number"
                            contact={tollFreeNumber}
                            code={tollFreeCode}
                            onContactChange={(e) =>
                                setTollfreeNumber(e.target.value)
                            }
                            onCodeChange={(e) =>
                                setTollFreeCode(e.target.value)
                            }
                            options={countries}
                        />
                        <InputFields
                            name="email"
                            label="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </ContainerCard>

                {/* Location */}
                <ContainerCard>
                    <h2 className="text-lg font-semibold mb-6">
                        Location Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <InputFields
                            name="region"
                            label="Region"
                            value={region}
                            onChange={(e) => setRegion(e.target.value)}
                        />
                        <InputFields
                            name="subRegion"
                            label="Sub Region"
                            value={subRegion}
                            onChange={(e) => setSubRegion(e.target.value)}
                        />
                        <InputFields
                            name="district"
                            label="District"
                            value={district}
                            onChange={(e) => setDistrict(e.target.value)}
                        />
                        <InputFields
                            name="town"
                            label="Town/Village"
                            value={town}
                            onChange={(e) => setTown(e.target.value)}
                        />
                        <InputFields
                            name="street"
                            label="Street"
                            value={street}
                            onChange={(e) => setStreet(e.target.value)}
                        />
                        <InputFields
                            name="landmark"
                            label="Landmark"
                            value={landmark}
                            onChange={(e) => setLandmark(e.target.value)}
                        />
                        <InputFields
                            name="country"
                            label="Country"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            options={countries}
                        />
                        <InputFields
                            name="tinNumber"
                            label="TIN Number"
                            value={tinNumber}
                            onChange={(e) => setTinNumber(e.target.value)}
                        />
                    </div>
                </ContainerCard>

                {/* Financial */}
                <ContainerCard>
                    <h2 className="text-lg font-semibold mb-6">
                        Financial Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <InputFields
                            name="sellingCurrency"
                            label="Selling Currency"
                            value={sellingCurrency}
                            onChange={(e) => setSellingCurrency(e.target.value)}
                            options={currency}
                        />
                        <InputFields
                            name="purchaseCurrency"
                            label="Purchase Currency"
                            value={purchaseCurrency}
                            onChange={(e) =>
                                setPurchaseCurrency(e.target.value)
                            }
                            options={currency}
                        />
                        <InputFields
                            name="vatNo"
                            label="VAT No (%)"
                            value={vatNo}
                            onChange={(e) => setVatNo(e.target.value)}
                        />
                    </div>
                </ContainerCard>

                {/* Additional */}
                <ContainerCard>
                    <h2 className="text-lg font-semibold mb-6">
                        Additional Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <InputFields
                            name="modules"
                            label="Modules"
                            value={modules}
                            onChange={(e) => setModules(e.target.value)}
                        />

                        <InputFields
                            name="company"
                            label="Service Type"
                            value={serviceType}
                            onChange={(e) => setServiceType(e.target.value)}
                            options={companyOptions}
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
                    onClick={handleSubmit}
                />
            </div>
        </>
    );
}
