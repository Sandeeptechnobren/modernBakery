"use client";

import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import ContainerCard from "@/app/components/containerCard";
import StepperForm, { useStepperForm, StepperStep } from "@/app/components/stepperForm";
import { useState } from "react";
import InputFields from "@/app/components/inputFields";
import FormInputField from "@/app/components/formInputField";
import IconButton from "@/app/components/iconButton";
import SettingPopUp from "@/app/components/settingPopUp";

export default function AddCustomerWithStepper() {
    // Stepper configuration
    const steps: StepperStep[] = [
        { id: 1, label: "Customer" },
        { id: 2, label: "Contact" },
        { id: 3, label: "Location" },
        { id: 4, label: "Financial" },
        { id: 5, label: "Transaction" },
        { id: 6, label: "Additional" },
    ];

    const {
        currentStep,
        nextStep,
        prevStep,
        goToStep,
        markStepCompleted,
        isStepCompleted,
        isLastStep
    } = useStepperForm(steps.length);

    // Form state (same as original)
    const [isOpen, setIsOpen] = useState(false);
    const [customerType, setCustomerType] = useState("");
    const [customerCode, setCustomerCode] = useState("");
    const [sapId, setSapId] = useState("");
    const [category, setCategory] = useState("");
    const [subCategory, setSubCategory] = useState("");
    const [outletChannel, setOutletChannel] = useState("");
    const [primaryCode, setPrimaryCode] = useState("uae");
    const [primaryContact, setPrimaryContact] = useState("");
    const [secondaryCode, setSecondaryCode] = useState("uae");
    const [secondaryContact, setSecondaryContact] = useState("");
    const [email, setEmail] = useState("");
    const [region, setRegion] = useState("");
    const [subRegion, setSubRegion] = useState("");
    const [district, setDistrict] = useState("");
    const [town, setTown] = useState("");
    const [street, setStreet] = useState("");
    const [landmark, setLandmark] = useState("");
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");
    const [thresholdRadius, setThresholdRadius] = useState("");
    const [creditCurrency, setCreditCurrency] = useState("AED")
    const [creditAmount, setCreditAmount] = useState("")
    const [creditLimitCurrency, setCreditLimitCurrency] = useState("AED")
    const [creditLimitAmount, setCreditLimitAmount] = useState("")
    const [paymentType, setPaymentType] = useState("")
    const [creditDays, setCreditDays] = useState("")
    const [feesType, setFeesType] = useState("")
    const [vatNo, setVatNo] = useState("")
    const [barcode, setBarcode] = useState("");
    const [assignQrValue, setAssignQrValue] = useState("");
    const [enablePromo, setEnablePromo] = useState<"yes" | "no" | "">("");
    const [assignAccuracy, setAssignAccuracy] = useState("");
    const [route, setRoute] = useState("");
    const [assignLatitude, setAssignLatitude] = useState("");
    const [assignLongitude, setAssignLongitude] = useState("");
    const [days, setDays] = useState<string[]>([]);

    const toggleDay = (day: string) => {
        setDays((prev) =>
            prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
        );
    };

    // Options (same as original)
    const currencyOptions = [
        { value: "aed", label: "AED" },
        { value: "usd", label: "USD" },
        { value: "inr", label: "INR" },
        { value: "eur", label: "EUR" },
    ];

    const paymentTypes = [
        { value: "cash", label: "Cash" },
        { value: "card", label: "Card" },
        { value: "credit", label: "Credit" },
    ];

    const feesTypes = [
        { value: "service", label: "Service Fee" },
        { value: "transaction", label: "Transaction Fee" },
        { value: "other", label: "Other" },
    ];

    const countryOptions = [
        { value: "uae", label: "UAE" },
        { value: "in", label: "India" },
        { value: "us", label: "USA" },
        { value: "uk", label: "UK" },
    ];

    // Step validation functions
    const validateStep = (step: number): boolean => {
        switch (step) {
            case 1:
                return customerType !== "" && customerCode !== "";
            case 2:
                return primaryContact !== "" && email !== "";
            case 3:
                return region !== "" && district !== "";
            case 4:
                return paymentType !== "";
            case 5:
                return true; // Transaction step is optional
            case 6:
                return true; // Additional step is optional
            default:
                return false;
        }
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            markStepCompleted(currentStep);
            nextStep();
        } else {
            alert("Please fill in all required fields before proceeding.");
        }
    };

    const handleSubmit = () => {
        console.log("Form submitted with all data");
        // Handle form submission here
    };

    // Render step content
    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <ContainerCard>
                        <h2 className="text-lg font-semibold mb-6">Customer Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <InputFields
                                label="Customer Type *"
                                value={customerType}
                                onChange={(e) => setCustomerType(e.target.value)}
                                options={[
                                    { value: "retail", label: "Retail" },
                                    { value: "wholesale", label: "Wholesale" },
                                    { value: "distributor", label: "Distributor" },
                                ]}
                            />
                            
                            <div className="flex items-end gap-2 max-w-[406px]">
                                <InputFields
                                    label="Customer Code *"
                                    value={customerCode}
                                    onChange={(e) => setCustomerCode(e.target.value)}
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
                                    title="Customer Code"
                                />
                            </div>

                            <InputFields
                                label="SAP ID"
                                value={sapId}
                                onChange={(e) => setSapId(e.target.value)}
                            />

                            <InputFields
                                label="Category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                options={[
                                    { value: "retail", label: "Retail" },
                                    { value: "wholesale", label: "Wholesale" },
                                    { value: "distributor", label: "Distributor" },
                                ]}
                            />

                            <InputFields
                                label="Sub Category"
                                value={subCategory}
                                onChange={(e) => setSubCategory(e.target.value)}
                                options={[
                                    { value: "retail", label: "Retail" },
                                    { value: "wholesale", label: "Wholesale" },
                                    { value: "distributor", label: "Distributor" },
                                ]}
                            />

                            <InputFields
                                label="Outlet Channel"
                                value={outletChannel}
                                onChange={(e) => setOutletChannel(e.target.value)}
                                options={[
                                    { value: "retail", label: "Retail" },
                                    { value: "wholesale", label: "Wholesale" },
                                    { value: "distributor", label: "Distributor" },
                                ]}
                            />
                        </div>
                    </ContainerCard>
                );

            case 2:
                return (
                    <ContainerCard>
                        <h2 className="text-lg font-semibold mb-6">Contact Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full overflow-x-hidden">
                            <FormInputField
                                type="contact"
                                label="Primary Contact *"
                                contact={primaryContact}
                                code={primaryCode}
                                onContactChange={(e) => setPrimaryContact(e.target.value)}
                                onCodeChange={(e) => setPrimaryCode(e.target.value)}
                                options={countryOptions}
                            />

                            <FormInputField
                                type="contact"
                                label="Secondary Contact"
                                contact={secondaryContact}
                                code={secondaryCode}
                                onContactChange={(e) => setSecondaryContact(e.target.value)}
                                onCodeChange={(e) => setSecondaryCode(e.target.value)}
                                options={countryOptions}
                            />

                            <InputFields
                                label="Email *"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </ContainerCard>
                );

            case 3:
                return (
                    <ContainerCard>
                        <h2 className="text-lg font-semibold mb-6">Location Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <InputFields
                                label="Region *"
                                value={region}
                                onChange={(e) => setRegion(e.target.value)}
                                options={[
                                    { value: "north", label: "North" },
                                    { value: "south", label: "South" },
                                    { value: "east", label: "East" },
                                    { value: "west", label: "West" },
                                ]}
                            />
                            <InputFields
                                label="Sub Region"
                                value={subRegion}
                                onChange={(e) => setSubRegion(e.target.value)}
                                options={[
                                    { value: "zone1", label: "Zone 1" },
                                    { value: "zone2", label: "Zone 2" },
                                    { value: "zone3", label: "Zone 3" },
                                ]}
                            />
                            <InputFields
                                label="District *"
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
                                label="Latitude"
                                value={latitude}
                                onChange={(e) => setLatitude(e.target.value)}
                            />
                            <InputFields
                                label="Longitude"
                                value={longitude}
                                onChange={(e) => setLongitude(e.target.value)}
                            />
                            <InputFields
                                label="Threshold Radius"
                                value={thresholdRadius}
                                onChange={(e) => setThresholdRadius(e.target.value)}
                            />
                        </div>
                    </ContainerCard>
                );

            case 4:
                return (
                    <ContainerCard>
                        <h2 className="text-lg font-semibold mb-6">Financial Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <FormInputField
                                type="amount"
                                label="Credit"
                                amount={creditAmount}
                                currency={creditCurrency}
                                onAmountChange={(e) => setCreditAmount(e.target.value)}
                                onCurrencyChange={(e) => setCreditCurrency(e.target.value)}
                                options={currencyOptions}
                            />

                            <FormInputField
                                type="amount"
                                label="Credit Limit"
                                amount={creditLimitAmount}
                                currency={creditLimitCurrency}
                                onAmountChange={(e) => setCreditLimitAmount(e.target.value)}
                                onCurrencyChange={(e) => setCreditLimitCurrency(e.target.value)}
                                options={currencyOptions}
                            />

                            <InputFields
                                label="Payment Type *"
                                value={paymentType}
                                onChange={(e) => setPaymentType(e.target.value)}
                                options={paymentTypes}
                            />

                            <InputFields
                                label="Credit Days"
                                value={creditDays}
                                onChange={(e) => setCreditDays(e.target.value)}
                            />

                            <InputFields
                                label="Fees Type"
                                value={feesType}
                                onChange={(e) => setFeesType(e.target.value)}
                                options={feesTypes}
                            />

                            <InputFields
                                label="VAT No"
                                value={vatNo}
                                onChange={(e) => setVatNo(e.target.value)}
                            />
                        </div>
                    </ContainerCard>
                );

            case 5:
                return (
                    <ContainerCard>
                        <h2 className="text-lg font-semibold mb-6">Transaction Promotion</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <InputFields
                                label="Barcode"
                                value={barcode}
                                onChange={(e) => setBarcode(e.target.value)}
                            />

                            <div>
                                <label className="block mb-2 font-medium text-gray-700">Enable Promo</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="enablePromo"
                                            value="yes"
                                            checked={enablePromo === "yes"}
                                            onChange={() => setEnablePromo("yes")}
                                        />
                                        Yes
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="enablePromo"
                                            value="no"
                                            checked={enablePromo === "no"}
                                            onChange={() => setEnablePromo("no")}
                                        />
                                        No
                                    </label>
                                </div>
                            </div>

                            <InputFields
                                label="Assign QR Value"
                                value={assignQrValue}
                                onChange={(e) => setAssignQrValue(e.target.value)}
                            />
                        </div>
                    </ContainerCard>
                );

            case 6:
                return (
                    <ContainerCard>
                        <h2 className="text-lg font-semibold mb-6">Additional Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <InputFields
                                label="Route"
                                value={route}
                                onChange={(e) => setRoute(e.target.value)}
                                options={[
                                    { value: "Route 1", label: "Route 1" },
                                    { value: "Route 2", label: "Route 2" },
                                    { value: "Route 3", label: "Route 3" },
                                ]}
                            />

                            <InputFields
                                label="Assign Latitude"
                                value={assignLatitude}
                                onChange={(e) => setAssignLatitude(e.target.value)}
                            />

                            <InputFields
                                label="Assign Longitude"
                                value={assignLongitude}
                                onChange={(e) => setAssignLongitude(e.target.value)}
                            />

                            <InputFields
                                label="Assign Accuracy"
                                value={assignAccuracy}
                                onChange={(e) => setAssignAccuracy(e.target.value)}
                            />

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Available Days
                                </label>
                                <div className="flex gap-2 flex-wrap">
                                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                                        <button
                                            key={day}
                                            type="button"
                                            onClick={() => toggleDay(day)}
                                            className={`px-3 py-1 rounded-full border text-sm font-medium ${
                                                days.includes(day)
                                                    ? "bg-red-50 border-red-400 text-red-500"
                                                    : "bg-gray-100 border-gray-300 text-gray-600"
                                            }`}
                                        >
                                            {day}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </ContainerCard>
                );

            default:
                return null;
        }
    };

    return (
        <>
            {/* Header */}
            <div className="flex justify-between items-center mb-[20px]">
                <div className="flex items-center gap-[16px]">
                    <Link href="/dashboard/master/customer">
                        <Icon icon="lucide:arrow-left" width={24} />
                    </Link>
                    <h1 className="text-[20px] font-semibold text-[#181D27] flex items-center leading-[30px] mb-[5px]">
                        Add New Customer
                    </h1>
                </div>
            </div>

            {/* Stepper Form */}
            <StepperForm
                steps={steps.map(step => ({
                    ...step,
                    isCompleted: isStepCompleted(step.id)
                }))}
                currentStep={currentStep}
                onStepClick={goToStep}
                onBack={prevStep}
                onNext={handleNext}
                onSubmit={handleSubmit}
                showSubmitButton={isLastStep}
                showNextButton={!isLastStep}
            >
                {renderStepContent()}
            </StepperForm>
        </>
    );
}