"use client";

import ContainerCard from "@/app/components/containerCard";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import { listReturnType } from "@/app/components/customTable";
import InputFields from "@/app/components/inputFields";
import StepperForm, { StepperStep, useStepperForm } from "@/app/components/stepperForm";
import { genearateCode } from "@/app/services/allApi";
import { addCallRegister, callRegisterGlobalSearch, callRegisterByUUID, updateCallRegister } from "@/app/services/assetsApi";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react/dist/iconify.mjs";
import { Form, Formik, FormikValues } from "formik";
import { useParams, useRouter } from "next/navigation";
import { JSX, useCallback, useEffect, useState } from "react";



export default function AddOrEditChiller() {
    const [codeMode] = useState<"auto" | "manual">("auto");
    const {
        vendorOptions,
        manufacturerOptions,
        onlyCountryOptions,
        assetsTypeOptions,
        assetsModelOptions,
        brandingOptions,
    } = useAllDropdownListData();

    const steps: StepperStep[] = [
        { id: 1, label: "Basic Information" },
        { id: 2, label: "Assign Customer Details" },
        { id: 3, label: "Current Customer Details" },
    ];

    const { currentStep, nextStep, prevStep, markStepCompleted, isStepCompleted, isLastStep } =
        useStepperForm(steps.length);

    const { showSnackbar } = useSnackbar();
    const router = useRouter();
    const params = useParams();
    console.log(params)
    const { setLoading } = useLoading();

    const isEditMode = params.uuid && params.uuid !== "add";
    console.log(isEditMode)
    const chillerId = isEditMode ? String(params.uuid) : null;

    /* ----------------------------------------------------
       INITIAL VALUES
    ---------------------------------------------------- */
    const [chiller, setChiller] = useState({
        ticket_type: "",
        osa_code: "",
        ticket_date: "",
        chiller_serial_number: "",
        assets_category: "",
        model_number: "",
        chiller_code: "",
        brand: "",
        outlet_code: "",
        outlet_name: "",
        owner_name: "",
        street: "",
        landmark: "",
        town: "",
        district: "",
        contact_no1: "",
        contact_no2: "",
        current_outlet_code: "",
        current_outlet_name: "",
        current_owner_name: "",
        current_warehouse: "",
        current_asm: "",
        current_rm: "",
        current_road_street: "",
        current_landmark: "",
        current_town: "",
        current_district: "",
        current_contact_no1: "",
        current_contact_no2: "",
        technician_id: "",
        ctc_status: "",
        status: "1",
        sales_valume: "",
        followup_status: "",
        nature_of_call: "",
        follow_up_action: "",
    });

    /* ----------------------------------------------------
       FETCH + PREFILL + AUTO CODE GENERATION
    ---------------------------------------------------- */
    useEffect(() => {
        async function fetchData() {
            if (isEditMode && chillerId) {
                // ---------- EDIT MODE ----------
                setLoading(true);
                const res = await callRegisterByUUID(chillerId);
                setLoading(false);

                if (res.error) {
                    showSnackbar(res.data?.message || "Failed to fetch details", "error");
                    return;
                }

                const d = res.data;

                setChiller({
                    ticket_type: d.ticket_type || "",
                    osa_code: d.osa_code || "",
                    ticket_date: d.ticket_date || "",
                    chiller_serial_number: d.chiller_serial_number || "",
                    assets_category: d.assets_category || "",
                    model_number: d.model_number || "",
                    chiller_code: d.chiller_code || "",
                    brand: d.brand || "",
                    outlet_code: d.outlet_code || "",
                    outlet_name: d.outlet_name || "",
                    owner_name: d.owner_name || "",
                    street: d.road_street || "",
                    landmark: d.landmark || "",
                    town: d.town || "",
                    district: d.district || "",
                    contact_no1: d.contact_no1 || "",
                    contact_no2: d.contact_no2 || "",
                    current_outlet_code: d.current_outlet_code || "",
                    current_outlet_name: d.current_outlet_name || "",
                    current_owner_name: d.current_owner_name || "",
                    current_warehouse: d.current_warehouse || "",
                    current_asm: d.current_asm || "",
                    current_rm: d.current_rm || "",
                    current_road_street: d.current_road_street || "",
                    current_landmark: d.current_landmark || "",
                    current_town: d.current_town || "",
                    current_district: d.current_district || "",
                    current_contact_no1: d.current_contact_no1 || "",
                    current_contact_no2: d.current_contact_no2 || "",
                    technician_id: d.technician_id || "",
                    ctc_status: d.ctc_status || "",
                    status: String(d.status ?? "1"),
                    sales_valume: d.sales_valume || "",
                    followup_status: d.followup_status || "",
                    nature_of_call: d.nature_of_call || "",
                    follow_up_action: d.follow_up_action || "",
                });

            } else {
                if (chiller.ticket_type) {
                    const res = await genearateCode({ model_name: chiller.ticket_type });
                    setChiller((prev) => ({ ...prev, osa_code: res?.code || "" }));
                }
            }
        }

        fetchData();
    }, [chiller.ticket_type]); // 👈 IMPORTANT DEPENDENCY


    const fetchSerialNumber = useCallback(
        async (
            serial_number: string,
        ): Promise<listReturnType> => {
            try {
                // setLoading(true);
                const res = await callRegisterGlobalSearch({ serial_number: serial_number, });
                // setLoading(false);
                const data = res.data.map((item: any) => ({
                    ...item,
                }));
                return { data, total: res.total, currentPage: 1, pageSize: data.length };

            } catch (error) {
                setLoading(false);
                console.error(error);
                throw error;
            }
        },
        []
    );

    const handleSerialNumber = async (serial: string, setFieldValue: any) => {
        setFieldValue("chiller_serial_number", serial);

        if (serial.length < 3) return;

        try {
            const res = await callRegisterGlobalSearch({ serial_number: serial });

            if (!res?.data?.length) {
                showSnackbar("No record found for this serial number", "warning");
                return;
            }

            const d = res.data[0];

            // Ticket No
            setFieldValue("chiller_code", d.chiller_code || "");

            // CATEGORY → show NAME but save ID
            setFieldValue("assets_category", d.assets_category?.name || "");
            setFieldValue("assets_category_id", d.assets_category?.id || "");

            // MODEL NUMBER → show NAME but save ID
            setFieldValue("model_number", d.model_number?.name || "");
            setFieldValue("model_number_id", d.model_number?.id || "");

            // BRANDING → show NAME but save ID
            setFieldValue("brand", d.brand?.name || "");
            setFieldValue("brand_id", d.brand?.id || "");

        } catch (error) {
            console.error(error);
            showSnackbar("Error fetching serial number details", "error");
        }
    };






    /* ----------------------------------------------------
         FINAL SUBMIT
      ---------------------------------------------------- */
    const handleSubmit = async (values: any) => {
        const payload = {
            ticket_type: values.ticket_type,
            osa_code: values.osa_code,
            ticket_date: values.ticket_date,
            chiller_serial_number: values.chiller_serial_number,
            assets_category: values.assets_category,
            model_number: values.model_number,
            chiller_code: values.chiller_code,
            brand: values.brand,

            outlet_code: values.outlet_code,
            outlet_name: values.outlet_name,
            owner_name: values.owner_name,
            road_street: values.street, // FIXED
            landmark: values.landmark,
            town: values.town,
            district: values.district,
            contact_no1: values.contact_no1,
            contact_no2: values.contact_no2,

            current_outlet_code: values.current_outlet_code,
            current_outlet_name: values.current_outlet_name,
            current_owner_name: values.current_owner_name,
            current_warehouse: values.current_warehouse,
            current_asm: values.current_asm,
            current_rm: values.current_rm,
            current_road_street: values.current_road_street,
            current_landmark: values.current_landmark,
            current_town: values.current_town,
            current_district: values.current_district,
            current_contact_no1: values.current_contact_no1,
            current_contact_no2: values.current_contact_no2,

            technician_id: values.technician_id,
            ctc_status: values.ctc_status,
            status: values.status,
            sales_valume: values.sales_valume,
            followup_status: values.followup_status,

            nature_of_call: values.nature_of_call,
            follow_up_action: values.follow_up_action,
        };


        let res;
        if (isEditMode) res = await updateCallRegister(chillerId!, payload as any);
        else res = await addCallRegister(payload as any);

        if (res.error) {
            showSnackbar(res.data?.message || "Failed to save", "error");
        } else {
            showSnackbar(`Chiller ${isEditMode ? "updated" : "added"} successfully`, "success");
            router.push("/callRegister");
        }
    };

    /* ----------------------------------------------------
       RENDER STEP CONTENT
    ---------------------------------------------------- */
    const renderStepContent = (
        values: FormikValues,
        setFieldValue: (field: string, value: any) => void,
        errors: FormikValues,
        touched: FormikValues
    ): JSX.Element | null => {
        switch (currentStep) {
            case 1:
                return (
                    <ContainerCard>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <InputFields
                                label="Ticket Type"
                                name="ticket_type"
                                options={[
                                    { value: "RB", label: "RB" },
                                    { value: "BD", label: "BD" },
                                    { value: "TR", label: "TR" }
                                ]}
                                value={values.ticket_type}
                                onChange={(e) => {
                                    const type = e.target.value;
                                    setFieldValue("ticket_type", type);
                                    setChiller((prev) => ({ ...prev, ticket_type: type }));
                                }}
                            />
                            <InputFields
                                // required
                                label="Ticket Number"
                                name="osa_code"
                                value={values.osa_code}
                                disabled={codeMode === "auto"}
                                onChange={(e) => setFieldValue("osa_code", e.target.value)}
                                error={touched.osa_code && errors.osa_code}
                            />

                            <InputFields
                                label="Ticket Date"
                                type="date"
                                name="ticket_date"
                                value={values.ticket_date}
                                min={new Date().toISOString().split("T")[0]}
                                max={new Date().toISOString().split("T")[0]}
                                onChange={(e) => setFieldValue("ticket_date", e.target.value)}
                            />

                            <InputFields
                                label="Chiller Serial Number"
                                name="chiller_serial_number"
                                value={values.chiller_serial_number}
                                onChange={(e) => handleSerialNumber(e.target.value, setFieldValue)}
                            />



                            <InputFields
                                // required
                                label="Chiller Code"
                                name="chiller_code"
                                value={values.chiller_code}
                                onChange={(e) => setFieldValue("chiller_code", e.target.value)}
                            // error={touched.sap_code && errors.sap_code}
                            />

                            <InputFields
                                // required
                                label="Asset Number"
                                name="assets_category"
                                value={values.assets_category}
                                onChange={(e) => setFieldValue("assets_category", e.target.value)}
                            // error={touched.model_number && errors.model_number}
                            />

                            <InputFields
                                // required
                                label="Model Number"
                                name="model_number"
                                value={values.model_number}
                                onChange={(e) => setFieldValue("model_number", e.target.value)}
                            // error={touched.model_number && errors.model_number}
                            />

                            <InputFields
                                // required
                                label="Branding"
                                name="brand"
                                value={values.brand}
                                onChange={(e) => setFieldValue("brand", e.target.value)}
                            // error={touched.sap_code && errors.sap_code}
                            />
                        </div>
                    </ContainerCard>
                );

            case 2:
                return (
                    <ContainerCard>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                            <InputFields
                                // required
                                label="Outlet Code"
                                name="outlet_code"
                                value={values.outlet_code}
                                onChange={(e) => setFieldValue("outlet_code", e.target.value)}
                            />

                            <InputFields
                                // required
                                label="outlet Name"
                                name="outlet_name"
                                value={values.outlet_name}
                                onChange={(e) => setFieldValue("outlet_name", e.target.value)}
                            // error={touched.vender && errors.vender}
                            />

                            <InputFields
                                // required
                                label="Owner Name"
                                name="owner_name"
                                value={values.owner_name}
                                onChange={(e) => setFieldValue("owner_name", e.target.value)}
                            // error={touched.manufacturer && errors.manufacturer}
                            />

                            <InputFields
                                // required
                                label="Road/Street"
                                name="road_street"
                                value={values.street}
                                onChange={(e) => setFieldValue("street", e.target.value)}
                            // error={touched.country_id && errors.country_id}
                            />

                            <InputFields
                                // required
                                label="Landmark"
                                name="landmark"
                                value={values.landmark}
                                onChange={(e) => setFieldValue("landmark", e.target.value)}
                            // error={touched.country_id && errors.country_id}
                            />

                            <InputFields
                                // required
                                label="Village/Town"
                                name="town"
                                value={values.town}
                                onChange={(e) => setFieldValue("town", e.target.value)}
                            // error={touched.country_id && errors.country_id}
                            />

                            <InputFields
                                // required
                                label="District"
                                name="district"
                                value={values.district}
                                onChange={(e) => setFieldValue("district", e.target.value)}
                            // error={touched.country_id && errors.country_id}
                            />

                            <InputFields
                                // required
                                label="Contact No1"
                                name="contact_no1"
                                value={values.contact_no1}
                                onChange={(e) => setFieldValue("contact_no1", e.target.value)}
                            // error={touched.country_id && errors.country_id}
                            />

                            <InputFields
                                // required
                                label="Contact No2"
                                name="contact_no2"
                                value={values.contact_no2}
                                onChange={(e) => setFieldValue("contact_no2", e.target.value)}
                            // error={touched.country_id && errors.country_id}
                            />
                        </div>
                    </ContainerCard>
                );
            case 3:
                return (
                    <ContainerCard>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                            <InputFields
                                // required
                                label="Outlet Code"
                                name="current_outlet_code"
                                value={values.current_outlet_code}
                                onChange={(e) => setFieldValue("current_outlet_code", e.target.value)}
                            // error={touched.branding && errors.branding}
                            />

                            <InputFields
                                // required
                                label="Outlet Name"
                                name="current_outlet_name"
                                value={values.current_outlet_name}
                                onChange={(e) =>
                                    setFieldValue("current_outlet_name", e.target.value)
                                }
                            // error={touched.trading_partner_number && errors.trading_partner_number}
                            />

                            <InputFields
                                // required
                                label="Owner Name"
                                name="current_owner_name"
                                value={values.current_owner_name}
                                onChange={(e) => setFieldValue("current_owner_name", e.target.value)}
                            // error={touched.capacity && errors.capacity}
                            />

                            <InputFields
                                // required
                                label="Distributors"
                                name="current_warehouse"
                                value={values.current_warehouse}
                                onChange={(e) => setFieldValue("current_warehouse", e.target.value)}
                            // error={touched.assets_type && errors.assets_type}
                            />

                            <InputFields
                                // required
                                label="Area Sales Manager"
                                name="current_asm"
                                value={values.current_asm}
                                onChange={(e) => setFieldValue("current_asm", e.target.value)}
                            // error={touched.manufacturing_year && errors.manufacturing_year}
                            />

                            <InputFields
                                // required
                                label="Regional Manager"
                                name="current_rm"
                                value={values.current_rm}
                                onChange={(e) => setFieldValue("current_rm", e.target.value)}
                            // error={touched.remarks && errors.remarks}
                            />

                            <InputFields
                                // required
                                label="Road/Street"
                                name="current_road_street"
                                value={values.current_road_street}
                                onChange={(e) => setFieldValue("current_road_street", e.target.value)}
                            // error={touched.remarks && errors.remarks}
                            />

                            <InputFields
                                // required
                                label="Landmark"
                                name="current_landmark"
                                value={values.current_landmark}
                                onChange={(e) => setFieldValue("current_landmark", e.target.value)}
                            // error={touched.remarks && errors.remarks}
                            />

                            <InputFields
                                // required
                                label="Village/Town"
                                name="current_town"
                                value={values.current_town}
                                onChange={(e) => setFieldValue("current_town", e.target.value)}
                            // error={touched.remarks && errors.remarks}
                            />

                            <InputFields
                                // required
                                label="District"
                                name="current_district"
                                value={values.current_district}
                                onChange={(e) => setFieldValue("current_district", e.target.value)}
                            // error={touched.remarks && errors.remarks}
                            />

                            <InputFields
                                // required
                                label="Contact No1"
                                name="current_contact_no1"
                                value={values.current_contact_no1}
                                onChange={(e) => setFieldValue("current_contact_no1", e.target.value)}
                            // error={touched.remarks && errors.remarks}
                            />

                            <InputFields
                                // required
                                label="Contact No2"
                                name="current_contact_no2"
                                value={values.current_contact_no2}
                                onChange={(e) => setFieldValue("current_contact_no2", e.target.value)}
                            // error={touched.remarks && errors.remarks}
                            />

                            <InputFields
                                // required
                                label="Technician Name"
                                name="technician_id"
                                value={values.technician_id}
                                onChange={(e) => setFieldValue("technician_id", e.target.value)}
                            // error={touched.remarks && errors.remarks}
                            />

                            <InputFields
                                // required
                                label="CTC Status"
                                name="ctc_status"
                                value={values.ctc_status}
                                onChange={(e) => setFieldValue("ctc_status", e.target.value)}
                            // error={touched.remarks && errors.remarks}
                            />

                            <InputFields
                                // required
                                label="Call Status"
                                name="status"
                                value={values.status}
                                onChange={(e) => setFieldValue("status", e.target.value)}
                            // error={touched.remarks && errors.remarks}
                            />

                            <InputFields
                                // required
                                label="Sales Volume(Last 3 Months)"
                                name="sales_valume"
                                value={values.sales_valume}
                                onChange={(e) => setFieldValue("sales_valume", e.target.value)}
                            // error={touched.remarks && errors.remarks}
                            />

                            <InputFields
                                // required
                                label="Follow Up Status"
                                name="followup_status"
                                value={values.followup_status}
                                onChange={(e) => setFieldValue("followup_status", e.target.value)}
                            // error={touched.remarks && errors.remarks}
                            />

                            <InputFields
                                // required
                                type="textarea"
                                label="Nature of Complaint"
                                name="nature_of_call"
                                value={values.nature_of_call}
                                onChange={(e) => setFieldValue("nature_of_call", e.target.value)}
                            // error={touched.status && errors.status}
                            />

                            <InputFields
                                // required
                                type="textarea"
                                label="Follow Up Action"
                                name="follow_up_action"
                                value={values.follow_up_action}
                                onChange={(e) => setFieldValue("follow_up_action", e.target.value)}
                            // error={touched.status && errors.status}
                            />
                        </div>
                    </ContainerCard>
                );

            default:
                return null;
        }
    };

    return (
        <div>
            {/* HEADER */}
            <div className="flex items-center gap-4 mb-6">
                <div onClick={() => router.back()}>
                    <Icon icon="lucide:arrow-left" width={24} />
                </div>
                <h1 className="text-xl font-semibold">
                    {isEditMode ? "Update Call Register" : "Add Call Register"}
                </h1>
            </div>

            {/* FORMIK */}
            <Formik
                initialValues={chiller}
                // validationSchema={validationSchema}
                onSubmit={handleSubmit}
                enableReinitialize
            >
                {({ values, setFieldValue, errors, touched, handleSubmit, setErrors, setTouched }) => (
                    <Form>
                        <StepperForm
                            steps={steps.map((step) => ({
                                ...step,
                                isCompleted: isStepCompleted(step.id),
                            }))}
                            currentStep={currentStep}
                            onBack={prevStep}
                            onNext={() => {
                                markStepCompleted(currentStep); // mark current step completed
                                nextStep(); // go to next step
                            }}
                            onSubmit={handleSubmit}
                            showSubmitButton={isLastStep}
                            showNextButton={!isLastStep}
                            nextButtonText="Save & Next"
                            submitButtonText="Submit"
                        >
                            {renderStepContent(values, setFieldValue, errors, touched)}
                        </StepperForm>
                    </Form>
                )}
            </Formik>
        </div>
    );
}
