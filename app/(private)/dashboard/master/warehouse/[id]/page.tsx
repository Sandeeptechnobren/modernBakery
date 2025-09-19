"use client";
import WarehouseDetails from "./warehouseDetails";
import WarehouseContact from "./warehouseContact";
import WarehouseLocationInformation from "./warehouseLocationInfo";
import WarehouseAdditionalInformation from "./warehouseAdditionalInformation";
import ContainerCard from "@/app/components/containerCard";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { Formik, Form, type FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { addWarehouse, getWarehouseById, updateWarehouse } from '@/app/services/allApi';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useState } from 'react';
import { useSnackbar } from "@/app/services/snackbarContext";

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
    created_user: string;
    updated_user: string;
    stock_capital: string;
    deposite_amount: string;
};

export default function EditWarehouse() {
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
        city: '',
        location: '',
        address: '',
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
        created_user: '',
        updated_user: '',
        stock_capital: '',
        deposite_amount: '',
    };

    const params = useParams();
    const router = useRouter();
    const { showSnackbar } = useSnackbar();
    const routeId = params?.id ?? "";
    const [fetched, setFetched] = useState<FormValues | null>(null);

    useEffect(() => {
        if (!routeId) return;
        let mounted = true;
        (async () => {
            try {
                const res = await getWarehouseById(String(routeId));
                const data = res?.data ?? res;
                if (!mounted) return;
                // map API fields to form keys used in this page
                setFetched({
                    registation_no: data?.registration_no ?? '',
                    password: '', // password should not be prefilled for security
                    warehouse_type: data?.warehouse_type?.toString() ?? '',
                    warehouse_name: data?.warehouse_name ?? '',
                    warehouse_code: data?.warehouse_code ?? '',
                    agent_id: data?.agent_id?.toString() ?? '',
                    owner_name: data?.owner_name ?? '',
                    business_type: data?.business_type ?? '',
                    status: data?.status ?? '',
                    ownerContactCountry: data?.ownerContactCountry ?? '',
                    tinCode: data?.tinCode ?? '',
                    tin_no: data?.tin_no ?? '',
                    owner_number: data?.owner_number ?? '',
                    owner_email: data?.owner_email ?? '',
                    company_customer_id: data?.company_customer_id ?? '',
                    warehouse_manager: data?.warehouse_manager ?? '',
                    warehouse_manager_contact: data?.warehouse_manager_contact ?? '',
                    region_id: data?.region_id ?? '',
                    area_id: data?.area_id ?? '',
                    city: data?.city ?? '',
                    location: data?.location ?? '',
                    address: data?.address ?? '',
                    district: data?.district ?? '',
                    town_village: data?.town_village ?? '',
                    street: data?.street ?? '',
                    landmark: data?.landmark ?? '',
                    latitude: data?.latitude ?? '',
                    longitude: data?.longitude ?? '',
                    threshold_radius: data?.threshold_radius ?? '',
                    device_no: data?.device_no ?? '',
                    p12_file: data?.p12_file ?? '',
                    branch_id: data?.branch_id ?? '',
                    is_branch: data?.is_branch ?? '',
                    invoice_sync: data?.invoice_sync ?? '',
                    is_efris: data?.is_efris ?? '',
                    created_user: data?.created_user ?? '',
                    updated_user: data?.updated_user ?? '',
                    stock_capital: data?.stock_capital ?? '',
                    deposite_amount: data?.deposite_amount ?? '',
                });
        } catch (err: unknown) {
            console.error('Failed to fetch warehouse', err);
            }
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
            .required('Device Number is required')
            .matches(/^\d+$/, 'Device Number must be numeric'),
        p12_file: Yup.string().required('P12 File is required'),
        password: Yup.string()
            .required('Password is required')
            .min(6, 'Password must be at least 6 characters'),
        status: Yup.string().required('Status is required'),
        is_efris: Yup.string().required('EFRIS Configuration is required'),
        created_user: Yup.string().required('Created User is required'),
        updated_user: Yup.string().required('Updated User is required'),
        
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
        try {
            setSubmitting(true);
            const payload = { ...values };
            console.log('updateWarehouse payload:', JSON.stringify(payload, null, 2));
            
            if (routeId) {
                await updateWarehouse(String(routeId), payload);
                showSnackbar('Warehouse updated successfully!', 'success');
                router.push('/dashboard/master/warehouse');
            } else {
                await addWarehouse(payload);
                showSnackbar('Warehouse added successfully!', 'success');
                resetForm();
            }
        } catch (err: unknown) {
            console.error('Error saving warehouse:', err);
            showSnackbar('Failed to save warehouse. Please try again.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const formInitial = fetched ?? initialValues;

    return (
        <Formik initialValues={formInitial} validationSchema={validationSchema} enableReinitialize onSubmit={handleSubmit}>
            {({ isSubmitting, values, handleChange, setFieldValue, errors, touched }) => (
                <Form>
                    {/* header */}
                    <div className="flex justify-between items-center mb-[20px]">
                        <div className="flex items-center gap-[16px]">
                            <Link href="/dashboard/master/warehouse">
                                <Icon icon="lucide:arrow-left" width={24} />
                            </Link>
                            <h1 className="text-[20px] font-semibold text-[#181D27] flex items-center leading-[30px] mb-[5px]">
                                Edit Warehouse
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
                                className="px-6 py-2 h-[40px] rounded-md font-semibold border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
                                type="button"
                                onClick={() => router.push('/dashboard/master/warehouse')}
                            >
                                Cancel
                            </button>

                            {/* Submit button with icon */}
                            <SidebarBtn
                                label={isSubmitting ? 'Updating...' : 'Update'}
                                isActive={!isSubmitting}
                                leadingIcon="mdi:check"
                                type="submit"
                                
                            />
                        </div>
                    </div>
                </Form>
            )}
        </Formik>
    );
}