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
                console.log('API Response for warehouse edit:', JSON.stringify(data, null, 2)); // Debug log
                if (!mounted) return;
                // map API fields to form keys used in this page
                const mappedData = {
                    registation_no: data?.registration_no || data?.registation_no || data?.reg_no || '',
                    password: data?.password || '', // password should be empty for security - user needs to enter new one
                    warehouse_type: String(data?.warehouse_type || data?.type || ''),
                    warehouse_name: data?.warehouse_name || data?.name || '',
                    warehouse_code: data?.warehouse_code || data?.code || '',
                    agent_id: String(data?.agent_id || data?.agentId || ''),
                    owner_name: data?.owner_name || data?.ownerName || '',
                    business_type: String(data?.business_type || data?.businessType || ''),
                    status: String(data?.status || ''),
                    ownerContactCountry: data?.ownerContactCountry || data?.owner_contact_country || data?.contact_country || '',
                    tinCode: data?.tinCode || data?.tin_code || data?.tin_country || '',
                    tin_no: data?.tin_no || data?.tinNo || data?.tin_number || '',
                    owner_number: data?.owner_number || data?.ownerNumber || data?.contact_number || '',
                    owner_email: data?.owner_email || data?.ownerEmail || data?.email || '',
                    company_customer_id: String(data?.company_customer_id || data?.companyCustomerId || data?.customer_id || ''),
                    warehouse_manager: data?.warehouse_manager || data?.warehouseManager || data?.manager || '',
                    warehouse_manager_contact: data?.warehouse_manager_contact || data?.warehouseManagerContact || data?.manager_contact || '',
                    region_id: String(data?.region_id || data?.regionId || data?.region || ''),
                    area_id: String(data?.area_id || data?.areaId || data?.area || ''),
                    city: data?.city || '',
                    location: data?.location || '',
                    address: data?.address || '',
                    district: data?.district || '',
                    town_village: data?.town_village || data?.townVillage || data?.town || '',
                    street: data?.street || '',
                    landmark: data?.landmark || '',
                    latitude: String(data?.latitude || data?.lat || ''),
                    longitude: String(data?.longitude || data?.lng || data?.long || ''),
                    threshold_radius: String(data?.threshold_radius || data?.thresholdRadius || data?.radius || ''),
                    device_no: String(data?.device_no || data?.deviceNo || data?.device_number || ''),
                    p12_file: data?.p12_file || data?.p12File || data?.p12_file_name || data?.certificate_file || '',
                    branch_id: String(data?.branch_id || data?.branchId || ''),
                    is_branch: String(data?.is_branch || data?.isBranch || ''),
                    invoice_sync: String(data?.invoice_sync || data?.invoiceSync || ''),
                    is_efris: String(data?.is_efris || data?.isEfris || data?.efris || ''),
                    stock_capital: String(data?.stock_capital || data?.stockCapital || ''),
                    deposite_amount: String(data?.deposite_amount || data?.depositeAmount || data?.deposit_amount || ''),
                };
                
                setFetched(mappedData);
                console.log('Mapped form data:', JSON.stringify({
                    registation_no: mappedData.registation_no,
                    company_customer_id: mappedData.company_customer_id,
                    agent_id: mappedData.agent_id,
                    p12_file: mappedData.p12_file,
                    password: 'HIDDEN_FOR_SECURITY'
                }, null, 2)); // Debug specific problematic fields
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
            .required('Device Number is required'),
        p12_file: Yup.string()
            .test('p12-required', 'P12 File is required for new warehouse', function(value) {
                // For edit mode, P12 file is optional (user can keep existing file)
                // For add mode, P12 file is required
                return !routeId ? !!value : true; // Required only if routeId is empty (add mode)
            }),
        password: Yup.string()
            .min(6, 'Password must be at least 6 characters')
            .test('password-required', 'Password is required for new warehouse or if changing password', function(value) {
                // For edit mode, password is optional (user can keep existing password)
                // For add mode, password is required
                return !routeId ? !!value : true; // Required only if routeId is empty (add mode)
            }),
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