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
import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { useState } from 'react';

type FormValues = {
    registation_no: string;
    warehouse_type: string;
    warehouse_name: string;
    warehouse_code: string;
    agent_id: string;
    owner_name: string;
    business_type: string;
    statusType: string;
    ownerContactCountry: string;
    tinCode: string;
    tin_no: string;
    owner_number: string;
    owner_email: string;
    region_id: string;
    area_id: string;
    district: string;
    town: string;
    street: string;
    landmark: string;
    latitude: string;
    longitude: string;
    thresholdRadius: string;
    device_no: string;
    is_efris: string;
    stock_capital: string;
    deposite_amount: string;
};

export default function EditWarehouse() {
    const initialValues: FormValues = {
        registation_no: '',
        warehouse_type: '',
        warehouse_name: '',
        warehouse_code: '',
        agent_id: '',
        owner_name: '',
        business_type: '',
        statusType: '',
        ownerContactCountry: '',
        tinCode: '',
        tin_no: '',
        owner_number: '',
        owner_email: '',
        region_id: '',
        area_id: '',
        district: '',
        town: '',
        street: '',
        landmark: '',
        latitude: '',
        longitude: '',
        thresholdRadius: '',
        device_no: '',
        is_efris: '',
        stock_capital: '',
        deposite_amount: '',
    };

    const params = useParams();
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
                    warehouse_type: data?.warehouse_type?.toString() ?? '',
                    warehouse_name: data?.warehouse_name ?? '',
                    warehouse_code: data?.warehouse_code ?? '',
                    agent_id: data?.agent_id?.toString() ?? '',
                    owner_name: data?.owner_name ?? '',
                    business_type: data?.business_type ?? '',
                    statusType: data?.status ?? '',
                    ownerContactCountry: data?.ownerContactCountry ?? '',
                    tinCode: data?.tinCode ?? '',
                    tin_no: data?.tin_no ?? '',
                    owner_number: data?.owner_number ?? '',
                    owner_email: data?.owner_email ?? '',
                    region_id: data?.region_id ?? '',
                    area_id: data?.area_id ?? '',
                    district: data?.district ?? '',
                    town: data?.town ?? '',
                    street: data?.street ?? '',
                    landmark: data?.landmark ?? '',
                    latitude: data?.latitude ?? '',
                    longitude: data?.longitude ?? '',
                    thresholdRadius: data?.thresholdRadius ?? '',
                    device_no: data?.device_no ?? '',
                    is_efris: data?.is_efris ?? '',
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
        registation_no: Yup.string().required('Registration Number is required'),
        warehouse_type: Yup.string().required('Warehouse Type is required'),
        warehouse_name: Yup.string().required('Warehouse Name is required'),
        warehouse_code: Yup.string().required('Warehouse Code is required'),
        agent_id: Yup.string().required('Agent ID is required'),
        owner_name: Yup.string().required('Warehouse Owner Name is required'),
        business_type: Yup.string().required('Business Type is required'),
        statusType: Yup.string().required('Status is required'),
        owner_number: Yup.string().required('Contact number is required').matches(/^\d+$/, 'Contact must be numeric').min(7,'Contact must be at least 7 digits'),
        owner_email: Yup.string().email('Invalid email').required('Email is required'),
        region_id: Yup.string().required('Region is required'),
        area_id: Yup.string().required('Sub Region is required'),
        latitude: Yup.string().required('Latitude is required').matches(/^[-+]?\d{1,3}(?:\.\d+)?$/, 'Latitude must be a valid decimal number'),
        longitude: Yup.string().required('Longitude is required').matches(/^[-+]?\d{1,3}(?:\.\d+)?$/, 'Longitude must be a valid decimal number'),
        thresholdRadius: Yup.string().required('Threshold Radius is required').matches(/^\d+(?:\.\d+)?$/, 'Threshold Radius must be numeric'),
        device_no: Yup.string().required('Device No. is required').matches(/^\d+$/, 'Device No. must be numeric'),
        is_efris: Yup.string().required('EFRIS Configuration is required').min(3, 'EFRIS Configuration must be at least 3 characters'),
    });

    const handleSubmit = async (values: FormValues, { setSubmitting, resetForm }: FormikHelpers<FormValues>) => {
        try {
            const payload = { ...values };
            console.log('updateWarehouse payload:', JSON.stringify(payload, null, 2));
            if (routeId) {
                await updateWarehouse(String(routeId), payload);
                // after update, you probably want to navigate back
                // router.push('/dashboard/master/warehouse');
            } else {
                await addWarehouse(payload);
            }
            resetForm();
        } catch (err: unknown) {
            if (err && typeof err === 'object') {
                const e = err as { response?: { status?: number } };
                if (e.response && typeof e.response.status === 'number') {
                    console.error('Error saving warehouse - response.status:', e.response.status);
                } else {
                    console.error('Error saving warehouse', err);
                }
            } else {
                console.error('Error saving warehouse', err);
            }
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
                            <SidebarBtn
                                label={isSubmitting ? 'Submitting...' : 'Submit'}
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