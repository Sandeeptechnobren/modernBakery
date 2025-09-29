"use client";
import WarehouseDetails from "./warehouseDetails";
import WarehouseContact from "./warehouseContact";
import WarehouseLocationInformation from "./warehouseLocationInfo";
import WarehouseAdditionalInformation from "./warehouseAdditionalInformation";
import { useParams, useRouter } from "next/navigation";
import ContainerCard from "@/app/components/containerCard";
import { useSnackbar } from "@/app/services/snackbarContext";
import * as Yup from 'yup';
import { addWarehouse, getWarehouseById, updateWarehouse } from '@/app/services/allApi';
import StepperForm, { StepperStep, useStepperForm } from "@/app/components/stepperForm";
import { useEffect, useState } from "react";

type FormValues = {
    registation_no: string;
    password: string;
    warehouse_type: string;
    warehouse_name: string;
    warehouse_code: string;
    agent_id: string;
    owner_name: string;
    business_type: string;
    status: string;
    ownerContactCountry: string;
    tinCode: string;
    tin_no: string;
    owner_number: string;
    owner_email: string;
    company_customer_id: string;
    warehouse_manager: string;
    warehouse_manager_contact: string;
    region_id: string;
    area_id: string;
    city: string;
    location: string;
    address: string;
    district: string;
    town_village: string;
    street: string;
    landmark: string;
    latitude: string;
    longitude: string;
    threshold_radius: string;
    device_no: string;
    p12_file: string;
    branch_id: string;
    is_branch: string;
    invoice_sync: string;
    is_efris: string;
    stock_capital: string;
    deposite_amount: string;
};

export default function AddWarehouse() {
    const params = useParams();
    const routeId = params.id ?? "";
    const steps: StepperStep[] = [
        { id: 1, label: "Warehouse Details" },
        { id: 2, label: "Warehouse Contact" },
        { id: 3, label: "Location Information" },
        { id: 4, label: "Additional Information" }
    ];

    const {
        currentStep,
        nextStep,
        prevStep,
        markStepCompleted,
        isStepCompleted,
        isLastStep
    } = useStepperForm(steps.length);
    const router = useRouter();
    const { showSnackbar } = useSnackbar();
    
    const [form, setForm] = useState<FormValues>({
        registation_no: "",
        password: "",
        warehouse_type: "",
        warehouse_name: "",
        warehouse_code: "",
        agent_id: "",
        owner_name: "",
        business_type: "",
        status: "",
        ownerContactCountry: "",
        tinCode: "",
        tin_no: "",
        owner_number: "",
        owner_email: "",
        company_customer_id: "",
        warehouse_manager: "",
        warehouse_manager_contact: "",
        region_id: "",
        area_id: "",
        city: "",
        location: "",
        address: "",
        district: "",
        town_village: "",
        street: "",
        landmark: "",
        latitude: "",
        longitude: "",
        threshold_radius: "",
        device_no: "",
        p12_file: "",
        branch_id: "",
        is_branch: "",
        invoice_sync: "",
        is_efris: "",
        stock_capital: "",
        deposite_amount: "",
    });
    const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
    const [touched, setTouched] = useState<Partial<Record<keyof FormValues, boolean>>>({});
    const initialValues: FormValues = {
        registation_no: '',
        password: '',
        warehouse_type: '',
        warehouse_name: '',
        warehouse_code: '',
        agent_id: '',
        owner_name: '',
        business_type: '',
        status: '',
        ownerContactCountry: '',
        tinCode: '',
        tin_no: '',
        city:'',
        location:'',
        address:'',
        owner_number: '',
        owner_email: '',
        company_customer_id: '',
        warehouse_manager: '',
        warehouse_manager_contact: '',
        region_id: '',
        area_id: '',
        district: '',
        town_village: '',
        street: '',
        landmark: '',
        latitude: '',
        longitude: '',
        threshold_radius: '',
        device_no: '',
        p12_file: '',
        branch_id: '',
        is_branch: '',
        invoice_sync: '',
        is_efris: '',
        stock_capital: '',
        deposite_amount: '',
    };

    useEffect(() => {
        if (!routeId) return;
        let mounted = true;
        (async () => {
                const res = await getWarehouseById(String(routeId));
                const data = res.data;
                console.log('API Response for warehouse edit:', JSON.stringify(data, null, 2)); // Debug log
                if (!mounted) return;
                // map API fields to form keys used in this page - updated to match your exact API response
                const mappedData = {
                    registation_no: data?.registation_no || '',
                    password: data?.password || '', // Keep existing password or empty for new entry
                    warehouse_type: String(data?.warehouse_type || ''),
                    warehouse_name: data?.warehouse_name || '',
                    warehouse_code: data?.warehouse_code || '',
                    agent_id: String(data?.agent_id || ''),
                    owner_name: data?.owner_name || '',
                    business_type: String(data?.business_type || ''),
                    status: String(data?.status || ''),
                    ownerContactCountry: data?.ownerContactCountry || '',
                    tinCode: data?.tinCode || '',
                    tin_no: data?.tin_no || '',
                    owner_number: data?.owner_number || '',
                    owner_email: data?.owner_email || '',
                    company_customer_id: String(data?.company_customer_id || ''),
                    warehouse_manager: data?.warehouse_manager || '',
                    warehouse_manager_contact: data?.warehouse_manager_contact || '',
                    region_id: String(data?.region_id || ''),
                    area_id: String(data?.area_id || ''),
                    city: data?.city || '',
                    location: data?.location || '',
                    address: data?.address || '',
                    district: data?.district || '',
                    town_village: data?.town_village || '',
                    street: data?.street || '',
                    landmark: data?.landmark || '',
                    latitude: String(data?.latitude || ''),
                    longitude: String(data?.longitude || ''),
                    threshold_radius: String(data?.threshold_radius || ''),
                    device_no: data?.device_no || '',
                    p12_file: data?.p12_file || '',
                    branch_id: String(data?.branch_id || ''),
                    is_branch: String(data?.is_branch || ''),
                    invoice_sync: String(data?.invoice_sync || ''),
                    is_efris: String(data?.is_efris || ''),
                    stock_capital: String(data?.stock_capital || ''),
                    deposite_amount: String(data?.deposite_amount || ''),
                };
                
                setForm(mappedData);
                // console.log('Mapped form data:', JSON.stringify({
                //     registation_no: mappedData.registation_no,
                //     company_customer_id: mappedData.company_customer_id,
                //     agent_id: mappedData.agent_id,
                //     p12_file: mappedData.p12_file,
                //     password: 'HIDDEN_FOR_SECURITY'
                // }, null, 2)); // Debug specific problematic fields
        })();
        return () => { mounted = false; };
    }, [routeId]);

    const validationSchema = Yup.object().shape({
        // Required fields marked with *
        warehouse_code: Yup.string().required('Warehouse Code is required'),
        warehouse_name: Yup.string().required('Warehouse Name is required'),
        company_customer_id: Yup.string().required('Company Customer ID is required'),
        warehouse_manager: Yup.string().required('Warehouse Manager is required'),
        warehouse_manager_contact: Yup.string()
            .required('Warehouse Manager Contact is required')
            .matches(/^\d+$/, 'Contact must be numeric')
            .min(7, 'Contact must be at least 7 digits'),
        tin_no: Yup.string().required('TIN Number is required'),
        registation_no: Yup.string().required('Registration Number is required'),
        business_type: Yup.string().required('Business Type is required'),
        warehouse_type: Yup.string().required('Warehouse Type is required'),
        city: Yup.string().required('City is required'),
        location: Yup.string().required('Location is required'),
        address: Yup.string().required('Address is required'),
        region_id: Yup.string().required('Region is required'),
        latitude: Yup.string()
            .required('Latitude is required')
            .matches(/^[-+]?\d{1,3}(?:\.\d+)?$/, 'Latitude must be a valid decimal number'),
        longitude: Yup.string()
            .required('Longitude is required')
            .matches(/^[-+]?\d{1,3}(?:\.\d+)?$/, 'Longitude must be a valid decimal number'),
        area_id: Yup.string().required('Area ID is required'),
        device_no: Yup.string()
            .required('Device Number is required'),
        p12_file: Yup.string().required('P12 File is required'),
        password: Yup.string()
            .required('Password is required')
            .min(6, 'Password must be at least 6 characters'),
        status: Yup.string().required('Status is required'),
        is_efris: Yup.string().required('EFRIS Configuration is required'),
        // Optional fields validation (for better UX)
        owner_name: Yup.string(),
        owner_number: Yup.string()
            .matches(/^\d+$/, 'Contact must be numeric')
            .min(7, 'Contact must be at least 7 digits'),
        owner_email: Yup.string().email('Invalid email format'),
        threshold_radius: Yup.string()
            .matches(/^\d+(?:\.\d+)?$/, 'Threshold Radius must be numeric'),
        stock_capital: Yup.string(),
        deposite_amount: Yup.string(),
        district: Yup.string(),
        town_village: Yup.string(),
        street: Yup.string(),
        landmark: Yup.string(),
        branch_id: Yup.string(),
        is_branch: Yup.string(),
        invoice_sync: Yup.string(),
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        setTouched(prev => ({ ...prev, [name]: true }));
    };

    const setFieldValue = (field: string, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    const validateCurrentStep = async (step: number) => {
        let fields: (keyof FormValues)[] = [];
        if (step === 1) fields = ["registation_no", "warehouse_code", "warehouse_name", "owner_name", "company_customer_id", "warehouse_manager", "warehouse_manager_contact", "warehouse_type", "agent_id", "business_type", "status", "password"];
        if (step === 2) fields = ["ownerContactCountry", "owner_number", "tin_no", "owner_email"];
        if (step === 3) fields = ["region_id", "area_id", "city", "district", "location", "address", "town_village", "street", "landmark", "latitude", "longitude", "threshold_radius"];
        if (step === 4) fields = ["device_no", "is_efris", "p12_file", "stock_capital", "deposite_amount", "branch_id", "is_branch", "invoice_sync"];
        try {
            // validate the current step
            await validationSchema.validate(form, { abortEarly: false });
            setErrors({});
            return true;
        } catch (err: unknown) { // found error while validating
        if (err instanceof Yup.ValidationError) {
            const stepErrors: Partial<Record<keyof FormValues, string>> = {};

            // Extract validation errors for the current step
            err.inner.forEach((validationErr: Yup.ValidationError) => {
            if (fields.includes(validationErr.path as keyof FormValues)) {
                stepErrors[validationErr.path as keyof FormValues] = validationErr.message;
            }
            });

            // Update the errors state
            setErrors(prev => ({ ...prev, ...stepErrors }));

            // Update the touched state
            setTouched(prev => ({ ...prev, ...Object.fromEntries(fields.map(f => [f, true])) }));
            return Object.keys(stepErrors).length === 0;
        }
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
        const payload: Record<keyof FormValues, string> = { 
            registation_no: form.registation_no,
            password: form.password,
            warehouse_type: form.warehouse_type,
            warehouse_name: form.warehouse_name,
            warehouse_code: form.warehouse_code,
            agent_id: form.agent_id,
            owner_name: form.owner_name,
            business_type: form.business_type,
            status: form.status === "active" ? "1" : "0",
            ownerContactCountry: form.ownerContactCountry,
            tinCode: form.tinCode,
            tin_no: form.tin_no,
            owner_number: form.owner_number,
            owner_email: form.owner_email,
            company_customer_id: form.company_customer_id,
            warehouse_manager: form.warehouse_manager,
            warehouse_manager_contact: form.warehouse_manager_contact,
            region_id: form.region_id,
            area_id: form.area_id,
            city: form.city,
            location: form.location,
            address: form.address,
            district: form.district,
            town_village: form.town_village,
            street: form.street,
            landmark: form.landmark,
            latitude: form.latitude,
            longitude: form.longitude,
            threshold_radius: form.threshold_radius,
            device_no: form.device_no,
            p12_file: form.p12_file,
            branch_id: form.branch_id,
            is_branch: form.is_branch,
            invoice_sync: form.invoice_sync,
            is_efris: form.is_efris,
            stock_capital: form.stock_capital,
            deposite_amount: form.deposite_amount
        };
        const res = await updateWarehouse(String(routeId), payload);
        if(res.error) showSnackbar(res.data.message || "Failed to submit form", "error");
        else {
            showSnackbar('Warehouse updated successfully!', 'success');
                router.push('/dashboard/master/warehouse');
        }
    };
    const renderStepContent = () => {
        const heading = <h2 className="text-lg font-semibold mb-6">{steps[currentStep - 1].label}</h2>;
        switch (currentStep) {
        case 1:
            return (
            <ContainerCard>
                {heading}
                <WarehouseDetails values={form} errors={errors} touched={touched} handleChange={handleChange} setFieldValue={setFieldValue} />
            </ContainerCard>
            );
        case 2:
            return (
            <ContainerCard>
                {heading}
                <WarehouseContact values={form} errors={errors} touched={touched} handleChange={handleChange} setFieldValue={setFieldValue} />
            </ContainerCard>
            );
        case 3:
            return (
            <ContainerCard>
                {heading}
                <WarehouseLocationInformation values={form} errors={errors} touched={touched} handleChange={handleChange} setFieldValue={setFieldValue} />
            </ContainerCard>
            );
        case 4:
            return (
            <ContainerCard>
                {heading}
                <WarehouseAdditionalInformation values={form} errors={errors} touched={touched} handleChange={handleChange} setFieldValue={setFieldValue} />
            </ContainerCard>
            );
        default:
            return null;
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Add New Warehouse</h1>
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
                submitButtonText="Submit"
            >
                {renderStepContent()}
            </StepperForm>
        </div>
    );
}