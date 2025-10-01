"use client";

import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import InputFields from "@/app/components/inputFields";
import SettingPopUp from "@/app/components/settingPopUp";
import IconButton from "@/app/components/iconButton";
import StepperForm, { useStepperForm, StepperStep } from "@/app/components/stepperForm";
import { useSnackbar } from "@/app/services/snackbarContext";
import { agentCustomerById, editAgentCustomer } from "@/app/services/allApi";
import * as Yup from "yup";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";

interface AgentCustomerFormValues {
	agent_customer_code: string;
	name: string;
	business_name: string;
	customer_type: number | string;
	route_id: number | string;
	owner_name: string;
	owner_no: string;
	is_whatsapp: number | string;
	whatsapp_no: string;
	email: string;
	language: string;
	contact_no2: string;
	buyertype: number | string;
	payment_type: number | string;
	creditday: number | string;
	tin_no: string;
	threshold_radius: number | string;
	outlet_channel_id: number | string;
	category_id: number | string;
	subcategory_id: number | string;
	region_id: number | string;
	area_id: number | string;
	status: number | string;
}

export default function EditAgentCustomer() {

	const { itemCategoryOptions, itemSubCategoryOptions, customerTypeOptions, routeOptions, customerCategoryOptions, customerSubCategoryOptions, channelOptions, regionOptions, areaOptions } = useAllDropdownListData();
	const [isOpen, setIsOpen] = useState(false);
	const { showSnackbar } = useSnackbar();
	const router = useRouter();
	const params = useParams();
	const agentCustomerId = params?.uuid as string;
	const steps: StepperStep[] = [
		{ id: 1, label: "Agent Customer Details" },
		{ id: 2, label: "Location & Channel" },
	];
	const {
		currentStep,
		nextStep,
		prevStep,
		markStepCompleted,
		isStepCompleted,
		isLastStep
	} = useStepperForm(steps.length);

	const [form, setForm] = useState<AgentCustomerFormValues>({
		agent_customer_code: "",
		name: "",
		business_name: "",
		customer_type: "",
		route_id: "",
		owner_name: "",
		owner_no: "",
		is_whatsapp: "",
		whatsapp_no: "",
		email: "",
		language: "",
		contact_no2: "",
		buyertype: "",
		payment_type: "",
		creditday: "",
		tin_no: "",
		threshold_radius: "",
		outlet_channel_id: "",
		category_id: "",
		subcategory_id: "",
		region_id: "",
		area_id: "",
		status: "1",
	});
	const [errors, setErrors] = useState<Partial<Record<keyof AgentCustomerFormValues, string>>>({});
	const [touched, setTouched] = useState<Partial<Record<keyof AgentCustomerFormValues, boolean>>>({});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!agentCustomerId) return;
		setLoading(true);
		const fetchData = async () => {
			const res = await agentCustomerById(String(agentCustomerId));
			const data = res?.data ?? res;
			if (res && !res.error) {
				setForm({
					agent_customer_code: data.osa_code || "",
					name: data.name || "",
					business_name: data.business_name || "",
					customer_type: data.customer_type ?? "",
					route_id: data.route_id ?? "",
					owner_name: data.owner_name || "",
					owner_no: data.owner_no || "",
					is_whatsapp: data.is_whatsapp ?? "",
					whatsapp_no: data.whatsapp_no || "",
					email: data.email || "",
					language: data.language || "",
					contact_no2: data.contact_no2 || "",
					buyertype: data.buyertype ?? "",
					payment_type: data.payment_type ?? "",
					creditday: data.creditday ?? "",
					tin_no: data.tin_no || "",
					threshold_radius: data.threshold_radius ?? "",
					outlet_channel_id: data.outlet_channel_id ?? "",
					category_id: data.category_id ?? "",
					subcategory_id: data.subcategory_id ?? "",
					region_id: data.region_id ?? "",
					area_id: data.area_id ?? "",
					status: data.status ?? "1",
				});
			}
			setLoading(false);
		};
		fetchData();
	}, [agentCustomerId]);

	const AgentCustomerSchema = Yup.object().shape({
		agent_customer_code: Yup.string().required("Agent Customer Code is required"),
		name: Yup.string().required("Name is required"),
		business_name: Yup.string().required("Business Name is required"),
		customer_type: Yup.string().required("Customer Type is required"),
		route_id: Yup.string().required("Route is required"),
		owner_name: Yup.string().required("Owner Name is required"),
		owner_no: Yup.string().required("Owner Number is required"),
		is_whatsapp: Yup.string().required("Is Whatsapp is required"),
		whatsapp_no: Yup.string().required("Whatsapp Number is required"),
		email: Yup.string().email("Invalid email").required("Email is required"),
		language: Yup.string().required("Language is required"),
		contact_no2: Yup.string(),
		buyertype: Yup.string().required("Buyer Type is required"),
		payment_type: Yup.string().required("Payment Type is required"),
		creditday: Yup.string().required("Credit Day is required"),
		tin_no: Yup.string().required("TIN No is required"),
		threshold_radius: Yup.string().required("Threshold Radius is required"),
		outlet_channel_id: Yup.string().required("Outlet Channel is required"),
		category_id: Yup.string().required("Category is required"),
		subcategory_id: Yup.string().required("Subcategory is required"),
		region_id: Yup.string().required("Region is required"),
		area_id: Yup.string().required("Area is required"),
		status: Yup.string().required("Status is required"),
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name as keyof AgentCustomerFormValues]: value }));
		setTouched((prev) => ({ ...prev, [name as keyof AgentCustomerFormValues]: true }));
	};

	const setFieldValue = (field: keyof AgentCustomerFormValues, value: string) => {
		setForm((prev) => ({ ...prev, [field]: value }));
		setTouched((prev) => ({ ...prev, [field]: true }));
	};

	const validateCurrentStep = async (step: number) => {
		let fields: (keyof AgentCustomerFormValues)[] = [];
		if (step === 1) fields = [
		  "agent_customer_code", "name", "business_name", "customer_type", "route_id", "owner_name", "owner_no", "is_whatsapp", "whatsapp_no", "email", "language"
		];
		if (step === 2) fields = [
		  "buyertype", "payment_type", "creditday", "tin_no", "threshold_radius", "outlet_channel_id", "category_id", "subcategory_id", "region_id", "area_id"
		];
		if (step === 3) fields = ["status"];
		try {
		  await AgentCustomerSchema.validate(form, { abortEarly: false });
		  setErrors({});
		  return true;
		} catch (err) {
		  if (err instanceof Yup.ValidationError) {
			const stepErrors: Partial<Record<keyof AgentCustomerFormValues, string>> = {};
			if (Array.isArray(err.inner)) {
			  err.inner.forEach((validationErr) => {
				const path = validationErr.path as keyof AgentCustomerFormValues;
				if (fields.includes(path)) {
				  stepErrors[path] = validationErr.message;
				}
			  });
			}
			setErrors((prev) => ({ ...prev, ...stepErrors }));
			setTouched((prev) => ({ ...prev, ...Object.fromEntries(fields.map(f => [f, true])) }));
			return Object.keys(stepErrors).length === 0;
		  }
		  return false;
		}
	};

	const handleNext = async () => {
		const valid = await validateCurrentStep(currentStep);
		if (valid) {
			markStepCompleted(currentStep);
			nextStep();
		} else {
			showSnackbar("Please fill in all required fields before proceeding.", "error");
		}
	};

	const handleSubmit = async () => {
		const valid = await validateCurrentStep(currentStep);
		if (!valid) {
			showSnackbar("Please fill in all required fields before submitting.", "error");
			return;
		}
		try {
			const payload = {
				...form,
				customer_type: Number(form.customer_type),
				route_id: Number(form.route_id),
				is_whatsapp: Number(form.is_whatsapp),
				buyertype: Number(form.buyertype),
				payment_type: Number(form.payment_type),
				creditday: Number(form.creditday),
				threshold_radius: Number(form.threshold_radius),
				outlet_channel_id: Number(form.outlet_channel_id),
				category_id: Number(form.category_id),
				subcategory_id: Number(form.subcategory_id),
				region_id: Number(form.region_id),
				area_id: Number(form.area_id),
				status: Number(form.status),
			};
			const res = await editAgentCustomer(agentCustomerId, payload);
			if (res?.error) {
				showSnackbar(res.message || "Failed to update Agent Customer", "error");
			} else {
				showSnackbar("Agent Customer updated successfully", "success");
				router.push("/dashboard/master/agentCustomer");
			}
		} catch (err) {
			showSnackbar("Update Agent Customer failed", "error");
		}
	};

// ...existing code...
  const renderStepContent = () => {
	switch (currentStep) {
	  case 1:
		return (
		  <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 mb-6">
			<div className="p-6">
			  <h2 className="text-lg font-medium text-gray-800 mb-4">Agent Customer Details</h2>
			  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div className="flex items-end gap-2 max-w-[406px]">
				  <InputFields
					label="Agent Customer Code"
					name="agent_customer_code"
					value={form.agent_customer_code}
					onChange={handleChange}
					disabled
				  />
				  <IconButton
					bgClass="white"
					className="mb-2 cursor-pointer text-[#252B37]"
					icon="mi:settings"
					onClick={() => setIsOpen(true)}
				  />
				  <SettingPopUp isOpen={isOpen} onClose={() => setIsOpen(false)} title="Agent Customer Code" />
				</div>
				 <div>
				  <InputFields required label="TIN No" name="tin_no" value={form.tin_no} onChange={handleChange} error={touched.tin_no && errors.tin_no}/>
				  {touched.tin_no && errors.tin_no && (
					<div className="text-red-500 text-xs mt-1">{errors.tin_no}</div>
				  )}
				</div>
				<div>
				  <InputFields required label="Name" name="name" value={form.name} onChange={handleChange} error={touched.name && errors.name}/>
				  {touched.name && errors.name && (
					<div className="text-red-500 text-xs mt-1">{errors.name}</div>
				  )}
				</div>
				<div>
				  <InputFields required label="Business Name" name="business_name" value={form.business_name} onChange={handleChange} error={touched.business_name && errors.business_name}/>
				  {touched.business_name && errors.business_name && (
					<div className="text-red-500 text-xs mt-1">{errors.business_name}</div>
				  )}
				</div>
				<div>
				  <InputFields required label="Customer Type" name="customer_type" value={form.customer_type?.toString() ?? ""} options={customerTypeOptions} onChange={handleChange} error={touched.customer_type && errors.customer_type} />
				  {touched.customer_type && errors.customer_type && (
					<div className="text-red-500 text-xs mt-1">{errors.customer_type}</div>
				  )}
				</div>
			   
				<div>
				  <InputFields required label="Owner Name" name="owner_name" value={form.owner_name} onChange={handleChange} error={touched.owner_name && errors.owner_name}/>
				  {touched.owner_name && errors.owner_name && (
					<div className="text-red-500 text-xs mt-1">{errors.owner_name}</div>
				  )}
				</div>
				<div>
				  <InputFields required label="Owner No" name="owner_no" value={form.owner_no} onChange={handleChange} error={touched.owner_no && errors.owner_no}/>
				  {touched.owner_no && errors.owner_no && (
					<div className="text-red-500 text-xs mt-1">{errors.owner_no}</div>
				  )}
				</div>
				<div>
				  <InputFields required label="Is Whatsapp" name="is_whatsapp" value={form.is_whatsapp?.toString() ?? ""} onChange={handleChange} error={touched.is_whatsapp && errors.is_whatsapp} options={[{value: "1", label: "Yes"}, {value: "0", label: "No"}]} />
				  {touched.is_whatsapp && errors.is_whatsapp && (
					<div className="text-red-500 text-xs mt-1">{errors.is_whatsapp}</div>
				  )}
				</div>
				<div>
				  <InputFields required label="Whatsapp No" name="whatsapp_no" value={form.whatsapp_no} onChange={handleChange} error={touched.whatsapp_no && errors.whatsapp_no}/>
				  {touched.whatsapp_no && errors.whatsapp_no && (
					<div className="text-red-500 text-xs mt-1">{errors.whatsapp_no}</div>
				  )}
				</div>
				<div>
				  <InputFields required label="Email" name="email" value={form.email} onChange={handleChange} error={touched.email && errors.email}/>
				  {touched.email && errors.email && (
					<div className="text-red-500 text-xs mt-1">{errors.email}</div>
				  )}
				</div>
				<div>
				  <InputFields required label="Language" name="language" value={form.language} onChange={handleChange}  options={[
                    { value: "1", label: "English" },
                    { value: "2", label: "Hindi" },
                    { value: "3", label: "Spanish" },
                    { value: "4", label: "French" },
                    { value: "5", label: "German" }
                  ]} error={touched.language && errors.language}/>
				  {touched.language && errors.language && (
					<div className="text-red-500 text-xs mt-1">{errors.language}</div>
				  )}
				</div>
			   
			  </div>
			</div>
		  </div>
		);
	  case 2:
		return (
		  <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 mb-6">
			<div className="p-6">
			  <h2 className="text-lg font-medium text-gray-800 mb-4">Location & Channel</h2>
			  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				 <div>
				  <InputFields required label="Outlet Channel" name="outlet_channel_id" value={form.outlet_channel_id?.toString() ?? ""} onChange={handleChange} error={touched.outlet_channel_id && errors.outlet_channel_id} options={channelOptions} />
				  {touched.outlet_channel_id && errors.outlet_channel_id && (
					<div className="text-red-500 text-xs mt-1">{errors.outlet_channel_id}</div>
				  )}
				</div>
				 <div>
				  <InputFields required label="Category" name="category_id" value={form.category_id?.toString() ?? ""} onChange={handleChange} error={touched.category_id && errors.category_id} options={customerCategoryOptions} />
				  {touched.category_id && errors.category_id && (
					<div className="text-red-500 text-xs mt-1">{errors.category_id}</div>
				  )}
				</div>
				<div>
				  <InputFields required label="Subcategory" name="subcategory_id" value={form.subcategory_id?.toString() ?? ""} onChange={handleChange} error={touched.subcategory_id && errors.subcategory_id} options={customerSubCategoryOptions} />
				  {touched.subcategory_id && errors.subcategory_id && (
					<div className="text-red-500 text-xs mt-1">{errors.subcategory_id}</div>
				  )}
				</div>
				 <div>
				  <InputFields required label="Region" name="region_id" value={form.region_id?.toString() ?? ""} onChange={handleChange} error={touched.region_id && errors.region_id} options={regionOptions} />
				  {touched.region_id && errors.region_id && (
					<div className="text-red-500 text-xs mt-1">{errors.region_id}</div>
				  )}
				</div>
				
				<div>
				  <InputFields required label="Area" name="area_id" value={form.area_id?.toString() ?? ""} onChange={handleChange} error={touched.area_id && errors.area_id} options={areaOptions} />
				  {touched.area_id && errors.area_id && (
					<div className="text-red-500 text-xs mt-1">{errors.area_id}</div>
				  )}
				</div>
				 <div>
				  <InputFields required label="Route" name="route_id" value={form.route_id?.toString() ?? ""} onChange={handleChange} error={touched.route_id && errors.route_id} options={routeOptions} />
				  {touched.route_id && errors.route_id && (
					<div className="text-red-500 text-xs mt-1">{errors.route_id}</div>
				  )}
				</div>
				<div>
				  <InputFields required label="Buyer Type" name="buyertype" value={form.buyertype?.toString() ?? ""} onChange={handleChange} error={touched.buyertype && errors.buyertype} options={[]} />
				  {touched.buyertype && errors.buyertype && (
					<div className="text-red-500 text-xs mt-1">{errors.buyertype}</div>
				  )}
				</div>
				<div>
				  <InputFields required label="Payment Type" name="payment_type" value={form.payment_type?.toString() ?? ""} onChange={handleChange} error={touched.payment_type && errors.payment_type} options={[]} />
				  {touched.payment_type && errors.payment_type && (
					<div className="text-red-500 text-xs mt-1">{errors.payment_type}</div>
				  )}
				</div>
				<div>
				  <InputFields required label="Credit Day" name="creditday" value={form.creditday?.toString() ?? ""} onChange={handleChange} error={touched.creditday && errors.creditday}/>
				  {touched.creditday && errors.creditday && (
					<div className="text-red-500 text-xs mt-1">{errors.creditday}</div>
				  )}
				</div>
			   
				<div>
				  <InputFields required label="Threshold Radius" name="threshold_radius" value={form.threshold_radius?.toString() ?? ""} onChange={handleChange} error={touched.threshold_radius && errors.threshold_radius}/>
				  {touched.threshold_radius && errors.threshold_radius && (
					<div className="text-red-500 text-xs mt-1">{errors.threshold_radius}</div>
				  )}
				</div>
			   
			   

			   
				 <div>
				  <InputFields label="Contact No 2" name="contact_no2" value={form.contact_no2} onChange={handleChange}/>
				</div>
			  </div>
			</div>
		  </div>
		);
	}
  };

	return (
		<>
			{/* Header */}
			<div className="flex justify-between items-center mb-6">
				<div className="flex items-center gap-4">
					<Link href="/dashboard/master/agentCustomer">
					<Icon icon="lucide:arrow-left" width={24} />
					</Link>
					<h1 className="text-xl font-semibold text-gray-900">Edit Agent Customer</h1>
				</div>
			</div>
			<StepperForm
				steps={steps.map(step => ({ ...step, isCompleted: isStepCompleted(step.id) }))}
				currentStep={currentStep}
				onStepClick={() => {}}
				onBack={prevStep}
				onNext={handleNext}
				onSubmit={handleSubmit}
				showSubmitButton={isLastStep}
				showNextButton={!isLastStep}
				nextButtonText="Save & Next"
				submitButtonText="Update"
			>
				{renderStepContent()}
			</StepperForm>
		</>
	);
}
