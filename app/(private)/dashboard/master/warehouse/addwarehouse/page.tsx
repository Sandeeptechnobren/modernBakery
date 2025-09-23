"use client";
import WarehouseDetails from "./warehouseDetails";
import WarehouseContact from "./warehouseContact";
import WarehouseLocationInformation from "./warehouseLocationInfo";
import WarehouseAdditionalInformation from "./warehouseAdditionalInformation";
import { useRouter } from "next/navigation";
import ContainerCard from "@/app/components/containerCard";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { Formik, Form, type FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { addWarehouse } from '@/app/services/allApi';

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
    const router = useRouter();
    const { showSnackbar } = useSnackbar();
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

    const handleSubmit = async (values: FormValues, { setSubmitting, resetForm }: FormikHelpers<FormValues>) => {
        const payload = { ...values };
        const res = await addWarehouse(payload);
        if(res.error) showSnackbar(res.data.message || "Failed to submit form", "error");
        else {
            showSnackbar("Warehouse added successfully ", "success");
            router.push("/dashboard/master/warehouse");
            resetForm();
        }
        setSubmitting(false);
    };

    return (
        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
            {({ isSubmitting, values, handleChange, setFieldValue, errors, touched }) => (
                <Form>
                    {/* header */}
                    <div className="flex justify-between items-center mb-[20px]">
                        <div className="flex items-center gap-[16px]">
                            <Link href="/dashboard/master/warehouse">
                                <Icon icon="lucide:arrow-left" width={24} />
                            </Link>
                            <h1 className="text-[20px] font-semibold text-[#181D27] flex items-center leading-[30px] mb-[5px]">
                                Add New Warehouse
                            </h1>
                        </div>
                    </div>

                    {/* content */}
                    <div>
                        <ContainerCard>
                            <h2 className="mb-4 font-semibold text-[18px] leading-[100%] text-[#181D27] tracking-[0%]">
                                Warehouse Details
                            </h2>
                            <WarehouseDetails values={values} errors={errors} touched={touched} handleChange={handleChange} setFieldValue={setFieldValue} />
                        </ContainerCard>
                        <ContainerCard>
                            <h2 className="mb-4 font-semibold text-[18px] leading-[100%] text-[#181D27] tracking-[0%]">
                                Warehouse Contact
                            </h2>
                            <WarehouseContact values={values} errors={errors} touched={touched} handleChange={handleChange} setFieldValue={setFieldValue} />
                        </ContainerCard>
                        <ContainerCard>
                            <h2 className="mb-4 font-semibold text-[18px] leading-[100%] text-[#181D27] tracking-[0%]">
                                {" "}
                                Location Information
                            </h2>
                            <WarehouseLocationInformation values={values} errors={errors} touched={touched} handleChange={handleChange} setFieldValue={setFieldValue} />
                        </ContainerCard>
                        <ContainerCard>
                            <h2 className="mb-4 font-semibold text-[18px] leading-[100%] text-[#181D27] tracking-[0%]">
                                {" "}
                                Additional Information
                            </h2>
                            <WarehouseAdditionalInformation values={values} errors={errors} touched={touched} handleChange={handleChange} setFieldValue={setFieldValue} />
                        </ContainerCard>

                        <div className="flex justify-end gap-3 mt-6">
                            {/* Cancel button */}
                            <button
                                className="px-4 py-2 h-[40px] w-[80px] rounded-md font-semibold border border-gray-300 text-gray-700 hover:bg-gray-100"
                                type="button"
                            >
                                Cancel
                            </button>

                            {/* Submit button with icon */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-4 py-2 h-[40px] rounded-md font-semibold bg-red-500 text-white disabled:opacity-60 flex items-center gap-2"
                            >
                                <Icon icon="mdi:check" width={18} />
                                {isSubmitting ? 'Submitting...' : 'Submit'}
                            </button>
                        </div>
                    </div>
                </Form>
            )}
        </Formik>
    );
}
