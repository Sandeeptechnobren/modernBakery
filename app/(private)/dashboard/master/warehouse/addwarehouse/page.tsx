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
import { addWarehouse } from '@/app/services/allApi';

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

export default function addwarehouse() {
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

    const validationSchema = Yup.object().shape({
        registrationNumber: Yup.string().required('Registration Number is required'),
        warehouseType: Yup.string().required('Warehouse Type is required'),
        warehouseName: Yup.string().required('Warehouse Name is required'),
        warehouseCode: Yup.string().required('Warehouse Code is required'),
        agentId: Yup.string().required('Agent ID is required'),
        ownerName: Yup.string().required('Warehouse Owner Name is required'),
        bussinessType: Yup.string().required('Business Type is required'),
        statusType: Yup.string().required('Status is required'),
        contact: Yup.string().required('Contact number is required').matches(/^\d+$/, 'Contact must be numeric').min(7,'Contact must be at least 7 digits'),
        email: Yup.string().email('Invalid email').required('Email is required'),
        region: Yup.string().required('Region is required'),
        subRegion: Yup.string().required('Sub Region is required'),
        latitude: Yup.string().required('Latitude is required').matches(/^[-+]?\d{1,3}(?:\.\d+)?$/, 'Latitude must be a valid decimal number'),
        longitude: Yup.string().required('Longitude is required').matches(/^[-+]?\d{1,3}(?:\.\d+)?$/, 'Longitude must be a valid decimal number'),
        thresholdRadius: Yup.string().required('Threshold Radius is required').matches(/^\d+(?:\.\d+)?$/, 'Threshold Radius must be numeric'),
        deviceNo: Yup.string().required('Device No. is required').matches(/^\d+$/, 'Device No. must be numeric'),
        efris: Yup.string().required('EFRIS Configuration is required').min(3, 'EFRIS Configuration must be at least 3 characters'),
    });

    const handleSubmit = async (values: FormValues, { setSubmitting, resetForm }: FormikHelpers<FormValues>) => {
        try {
            const payload = { ...values };
            console.log('addWarehouse payload:', JSON.stringify(payload, null, 2));
            await addWarehouse(payload);
            resetForm();
        } catch (err: unknown) {
            // if axios error, show server response details when available
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const anyErr = err as any;
            if (anyErr?.response) {
                // response exists but may contain empty body; log full response for debugging
                console.error('Error adding warehouse - response.status:', anyErr.response.status);
            }
        } finally {
            setSubmitting(false);
        }
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
