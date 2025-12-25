"use client";

import { Icon } from "@iconify-icon/react";
import {
  ErrorMessage,
  Form,
  Formik,
  FormikErrors,
  FormikHelpers,
  FormikTouched,
} from "formik";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import * as Yup from "yup";

import ContainerCard from "@/app/components/containerCard";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import CustomCheckbox from "@/app/components/customCheckbox";
import CustomPasswordInput from "@/app/components/customPasswordInput";
import InputFields from "@/app/components/inputFields";
import Loading from "@/app/components/Loading";
import StepperForm, {
  StepperStep,
  useStepperForm,
} from "@/app/components/stepperForm";
import {
  addSalesman,
  genearateCode,
  getSalesmanById,
  routeList,
  saveFinalCode,
  updateSalesman,
  warehouseList
} from "@/app/services/allApi";
import { useSnackbar } from "@/app/services/snackbarContext";

interface SalesmanFormValues {
  osa_code: string;
  name: string;
  type: string;
  sub_type: string;
  designation: string;
  route_id: string;
  password: string;
  contact_no: string;
  warehouse_id: string | string[];
  forceful_login: string;
  is_block: string;
  status: string;
  block_date_from: string;
  block_date_to: string;
  cashier_description_block?: string;
  invoice_block?: string;
  reason: string;
  email: string;
  is_take: string;
}

interface contactCountry {
  name: string;
  code?: string;
  flag?: string;
}

// ✅ Validation Schema


type props = {
  selectedCountry: { name: string; code?: string; flag?: string };
  setSelectedCountry: { name: string; code?: string; flag?: string };
};

export default function AddEditSalesman() {
  const [prefix, setPrefix] = useState("");
  const [loading, setLoading] = useState(true);
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const params = useParams<{ uuid?: string | string[] }>();
  const salesmanId = params?.uuid as string | undefined;
  const isEditMode = salesmanId && salesmanId !== "add";
  const codeGeneratedRef = useRef(false);

  const { 
    salesmanTypeOptions, 
    warehouseOptions, 
    warehouseAllOptions,
    routeOptions, 
    projectOptions,
    ensureWarehouseLoaded,
    ensureWarehouseAllLoaded,
    ensureSalesmanTypeLoaded,
    ensureProjectLoaded
  } = useAllDropdownListData();
  
  const [filteredRouteOptions, setFilteredRouteOptions] =
    useState(routeOptions);
  const [extraTypeOption, setExtraTypeOption] = useState<{ value: string; label: string } | null>(null);

  // Load dropdown data
  useEffect(() => {
    ensureWarehouseLoaded();
    ensureSalesmanTypeLoaded();
    ensureProjectLoaded();
    if (isEditMode) {
      ensureWarehouseAllLoaded();
    }
  }, [ensureWarehouseLoaded, ensureWarehouseAllLoaded, ensureSalesmanTypeLoaded, ensureProjectLoaded, isEditMode]);

  const [country, setCountry] = useState<Record<string, contactCountry>>({
    contact_no: { name: "Uganda", code: "+256", flag: "🇺🇬" },
    contact_no2: { name: "Uganda", code: "+256", flag: "🇺🇬" },
    whatsapp_no: { name: "Uganda", code: "+256", flag: "🇺🇬" },
  });

  const [initialValues, setInitialValues] = useState<SalesmanFormValues>({
    osa_code: "",
    name: "",
    type: "",
    designation: "",
    route_id: "",
    forceful_login: "0",
    is_block: "0",
    password: "",
    contact_no: "",
    sub_type: "",
    warehouse_id: "",
    status: "1",
    cashier_description_block: "0",
    invoice_block: "0",
    block_date_from: "",
    block_date_to: "",
    reason: "",
    email: "",
    is_take: "0",
  });

  const steps: StepperStep[] = [
    { id: 1, label: "Sales Team Details" },
    { id: 2, label: "Contact & Login" },
    { id: 3, label: "Additional Info" },
  ];
  const SalesmanSchema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    type: Yup.string().required("Type is required"),
    designation: Yup.string().required("Designation is required"),
    contact_no: Yup.string()
      .required("Owner Contact number is required")
      .matches(/^[0-9]+$/, "Only numbers are allowed")
      .min(9, "Must be at least 9 digits")
      .max(10, "Must be at most 10 digits"),
    password: Yup.string(),
    warehouse_id: Yup.mixed()
      .required("Distributor is required")
      .test("warehouse-type", "Invalid distributor format", function (value) {
        const { type } = this.parent;

        // ✅ When Project type (6), must be array with at least one item
        if (type === "6") {
          return Array.isArray(value) && value.length > 0;
        }

        // ✅ For other types, must be a non-empty string
        return typeof value === "string" && value.trim() !== "";
      }),
    email: Yup.string(),
  });

  // ✅ Step-wise validation
  const stepSchemas = [
    Yup.object({
      name: Yup.string().required("Name is required"),
      type: Yup.string().required("Type is required"),
      designation: Yup.string().required("Designation is required"),
      warehouse_id: Yup.mixed()
        .required("Distributor is required")
        .test("warehouse-type", "Invalid distributor format", function (value) {
          const { type } = this.parent;

          // ✅ When Project type (6), must be array with at least one item
          if (type === "6") {
            return Array.isArray(value) && value.length > 0;
          }

          // ✅ For other types, must be a non-empty string
          return typeof value === "string" && value.trim() !== "";
        }),
    }),
    Yup.object({
      contact_no: Yup.string()
        .required("Contact number is required")
        .matches(/^[0-9]+$/, "Only numbers are allowed")
        .min(9, "Must be at least 9 digits")
        .max(13, "Must be at most 13 digits"),
      password: Yup.string(),
      email: Yup.string(),
    }),
    Yup.object({
      status: Yup.string().required("Status is required"),
      is_block: Yup.string(),
      cashier_description_block: Yup.string(),
      invoice_block: Yup.string(),
    }).test(
      "only-one-block",
      "Select only one: Is Block, Cashier Description Block, or Invoice Block",
      (values) => {
        const selected = [
          values.is_block,
          values.cashier_description_block,
          values.invoice_block,
        ].filter((v) => v === "1");
        return selected.length <= 1;
      }
    ),
  ];

  const {
    currentStep,
    nextStep,
    prevStep,
    markStepCompleted,
    isStepCompleted,
    isLastStep,
  } = useStepperForm(steps.length);

  const fetchRoutes = async (value: string | string[]) => {
    const warehouseId = Array.isArray(value) ? value[0] : value;

    // 🛑 STOP if no warehouse selected
    if (!warehouseId) {
      setFilteredRouteOptions([]);  // or keep it empty
      return;
    }
     let filteredOptions;
     if(!isEditMode){
      filteredOptions = await routeList({
      warehouse_id: warehouseId,
      dropdown:"true"
    });
  }else{
       filteredOptions = await routeList({
      warehouse_id: warehouseId,
    });
    }

    if (filteredOptions.error) {
      showSnackbar(
        filteredOptions.data?.message || "Failed to fetch routes",
        "error"
      );
      return;
    }

    const options = filteredOptions?.data || [];

    const newroutesOptions = options.map((route: { id: number; route_name: string }) => ({
      value: route.id.toString(),
      label: route.route_name,
    }));

    setFilteredRouteOptions(newroutesOptions);
  };


  // ✅ Fetch data
  useEffect(() => {
    (async () => {
      if (isEditMode) {
        try {
          const res = await getSalesmanById(salesmanId as string);
          if (res && !res.error && res.data) {
            const d = res.data;
            const derivedType = d.salesman_type?.id?.toString() || d.type?.toString() || d.salesman_type_id?.toString() || "";
            
            if (d.salesman_type?.id && d.salesman_type?.salesman_type_name) {
                setExtraTypeOption({
                    value: d.salesman_type.id.toString(),
                    label: d.salesman_type.salesman_type_name
                });
            }

            const idsWareHouses: string[] = []
            d.warehouses?.map((dta: any) => {
              console.log(dta.id, "warehouse id")
              idsWareHouses.push(dta.id.toString());
            })

            setInitialValues({
              osa_code: d.osa_code || "",
              name: d.name || "",
              type: derivedType,
              sub_type: d.project_type?.id?.toString() || d.sub_type?.toString() || d.project_type_id?.toString() || "",
              designation: d.designation || "",
              route_id: d.route?.id?.toString() || "",
              password: "", // password is not returned from API → leave empty
              contact_no: d.contact_no || "",
              warehouse_id: d.salesman_type?.id?.toString() === "6" ? idsWareHouses : d.warehouses?.[0]?.id?.toString(),
              is_block: d.is_block?.toString() || "0",
              forceful_login: d.forceful_login?.toString() || "1",
              status: d.status?.toString() || "1",
              block_date_from: d.block_date_from || "",
              block_date_to: d.block_date_to || "",
              reason: d.is_block_reason || "",
              cashier_description_block:
                d.cashier_description_block?.toString() || "0",
              invoice_block: d.invoice_block?.toString() || "0",
              email: d.email || "",
              is_take: d.is_take?.toString() || "0",
            });
          }
        } catch (e) {
          console.error("Failed to fetch sales team:", e);
        }
        setLoading(false);
      } else if (!codeGeneratedRef.current) {
        codeGeneratedRef.current = true;
        try {
          const res = await genearateCode({ model_name: "salesman" });
          if (res?.code) {
            setInitialValues((prev) => ({ ...prev, osa_code: res.code }));
          }
          if (res?.prefix) {
            setPrefix(res.prefix);
          }
        } catch (e) {
          console.error("Code generation failed:", e);
        }
        setLoading(false);
      }
    })();
    console.log(salesmanTypeOptions, "salesmanTypeOptions")

  }, [isEditMode, salesmanId]);

  const handleNext = async (
    values: SalesmanFormValues,
    actions: FormikHelpers<SalesmanFormValues>
  ) => {
    try {
      const schema = stepSchemas[currentStep - 1];
      await schema.validate(values, { abortEarly: false });

      markStepCompleted(currentStep);
      actions.setErrors({});
      actions.setTouched({});
      nextStep();
    } catch (err: unknown) {
      if (err instanceof Yup.ValidationError) {
        const fieldErrors = err.inner.reduce(
          (acc, curr) => ({
            ...acc,
            [curr.path as keyof SalesmanFormValues]: curr.message,
          }),
          {}
        );
        actions.setErrors(fieldErrors);
        actions.setTouched(
          Object.keys(fieldErrors).reduce(
            (acc, key) => ({ ...acc, [key]: true }),
            {}
          )
        );
      }
      // showSnackbar("Please fix validation errors before proceeding", "error");
    }
  };

  const handlePrev = (actions: FormikHelpers<SalesmanFormValues>) => {
    actions.setErrors({});
    actions.setTouched({});
    prevStep();
  };

  // ✅ Submit handler
  const handleSubmit = async (
    values: SalesmanFormValues,
    { setSubmitting }: FormikHelpers<SalesmanFormValues>
  ) => {
    try {
      console.log("Submitting form data: 1");

      await SalesmanSchema.validate(values, { abortEarly: false });

      const formData = new FormData();
      (Object.keys({...values,warehouse_id:[values.warehouse_id]}) as (keyof SalesmanFormValues)[]).forEach((key) => {
        const val = values[key];

        if (Array.isArray(val)) {
      console.log("Submitting form data: 2", Array.from(formData.entries()));

          // For arrays (like warehouse_id when multiple selected)
          val.forEach((v) => formData.append(`${key}[]`, v));
        } else if (val !== undefined && val !== null) {
      console.log("Submitting form data: 3", Array.from(formData.entries()));

          // Normal string or single value
          formData.append(key, val.toString());
        } else {
      console.log("Submitting form data: 4", Array.from(formData.entries()));

          formData.append(key, "");
        }
      });
      // console.log("Submitting form data: 5", formData);

      const payload = {
        osa_code: values.osa_code,
        name: values.name,
        type: values.type,
        sub_type: values.sub_type,
        designation: values.designation,
        route_id: Number(values.route_id),
        forceful_login: values.forceful_login,
        is_block: values.is_block,
        password: values.password,
        contact_no: values.contact_no,
        warehouse_id: values.warehouse_id.toString(),
        status: values.status,
        cashier_description_block: values.cashier_description_block,
        invoice_block: values.invoice_block,
        block_date_from: values.block_date_from,
        block_date_to: values.block_date_to,
        reason: values.reason,
        email: values.email,
        is_take: Number(values.is_take),
      };

      let res;
      if (isEditMode) {
        res = await updateSalesman(salesmanId as string, payload);
      } else {
        res = await addSalesman(payload);
      }

      if (res.error) {
        showSnackbar(res.data?.message || "Failed to submit form", "error");
      } else {
        showSnackbar(
          isEditMode
            ? "Sales Team Updated Successfully"
            : "Sales Team Created Successfully",
          "success"
        );
        router.push("/salesTeam");
        try {
          await saveFinalCode({
            reserved_code: values.osa_code,
            model_name: "salesman",
          });
        } catch { /** */ }
      }
    } catch {
      showSnackbar("Validation failed, please check your inputs", "error");
    } finally {
      setSubmitting(false);
    }
  }

  // ✅ Step content renderer
  const renderStepContent = (
    values: SalesmanFormValues,
    setFieldValue: (
      field: keyof SalesmanFormValues,
      value: string | string[],
      shouldValidate?: boolean
    ) => void,
    errors: FormikErrors<SalesmanFormValues>,
    touched: FormikTouched<SalesmanFormValues>
  ) => {
    switch (currentStep) {
      case 1:
        return (
          <ContainerCard>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputFields
                required
                label="OSA Code"
                disabled
                name="osa_code"
                value={values.osa_code}
                onChange={(e) => setFieldValue("osa_code", e.target.value)}
                error={touched.osa_code && errors.osa_code}
              />

              <div>
                <InputFields
                  required
                  label="Name"
                  name="name"
                  value={values.name}
                  onChange={(e) => setFieldValue("name", e.target.value)}
                  error={touched.name && errors.name}
                />
              </div>
              <div className="flex flex-col w-full">
                <InputFields
                  label="Sales Team Type"
                  name="type"
                  value={values.type}
                  // showSearchInDropdown={true}
                  // searchable={true}
                  options={[
                    ...salesmanTypeOptions.map((o: any) => ({ ...o, value: String(o.value) })),
                    ...(extraTypeOption && !salesmanTypeOptions.find((o: any) => String(o.value) === extraTypeOption.value) ? [extraTypeOption] : [])
                  ]}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFieldValue("type", value);

                    // Reset fields when type changes
                    setFieldValue("sub_type", "");
                    setFieldValue("is_take", "");
                  }}

                  error={touched.type && errors.type}
                />
              </div>

              {/* Show Project List only when salesman_type id = 6 */}
              {values.type === "6" && (
                <div className="flex flex-col w-full">
                  <InputFields
                    label="Project List"
                    value={values.sub_type}
                    options={projectOptions}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFieldValue("sub_type", value);

                      if (value !== "1") {
                        setFieldValue("is_take", "");
                      }
                    }}

                    error={touched.sub_type && errors.sub_type}
                  />
                </div>
              )}

              {values.sub_type === "1" && (
                <div className="flex flex-col w-full">
                  <InputFields
                    label="Is Take Customer Order"
                    type="radio"
                    name="is_take"
                    value={values.is_take}
                    options={[
                      { value: "1", label: "Enable" },
                      { value: "0", label: "Disable" },
                    ]}
                    onChange={(e) => setFieldValue("is_take", e.target.value)}
                    error={touched.is_take && errors.is_take}
                  />
                </div>
              )}

              <div>
                <InputFields
                  required
                  label="Designation"
                  name="designation"
                  value={values.designation}
                  onChange={(e) => setFieldValue("designation", e.target.value)}
                />
                <ErrorMessage
                  name="designation"
                  component="span"
                  className="text-xs text-red-500"
                />
              </div>

              {values.type === "6" ? <div>
                <InputFields
                  required
                  label="Distributor"
                  type="select"
                  name="warehouse_id"
                  value={values.warehouse_id || []}
                  options={isEditMode ? warehouseAllOptions : warehouseOptions}
                  disabled={isEditMode ? warehouseAllOptions.length === 0 : warehouseOptions.length === 0}
                  isSingle={false}
                  searchable={true}
                  onChange={(e: any) => {
                    if (values.type === "6") {
                      let selectedValues: string[] = [];

                      // Case 1: Real browser event
                      if (e?.target?.selectedOptions) {
                        selectedValues = Array.from(
                          e.target.selectedOptions,
                          (opt: any) => opt.value
                        );
                      }

                      // Case 2: Your InputFields sends array directly
                      else if (Array.isArray(e)) {
                        selectedValues = e.map((v: any) => v?.value ?? v);
                      }

                      // Case 3: InputFields sends array inside target.value (MultiSelect)
                      else if (e?.target && Array.isArray(e.target.value)) {
                        selectedValues = e.target.value;
                      }

                      // Case 4: InputFields sends just a value (Single Select fallback or weird case)
                      else if (e?.target?.value) {
                        selectedValues = [e.target.value];
                      }

                      setFieldValue("warehouse_id", selectedValues);
                      fetchRoutes(selectedValues);
                    } else {
                      // SINGLE SELECT
                      const val =
                        e?.target?.value ??
                        e?.value ??
                        (Array.isArray(e) ? e[0]?.value : "");

                      setFieldValue("warehouse_id", val);
                      fetchRoutes(val);
                    }
                  }}


                />

                <ErrorMessage
                  name="warehouse_id"
                  component="span"
                  className="text-xs text-red-500"
                />
              </div> : <div>
                <InputFields
                  required
                  label="Distributor"
                  type="select"
                  name="warehouse_id"
                  value={values.warehouse_id}
                  options={isEditMode ? warehouseAllOptions : warehouseOptions}
                  disabled={isEditMode ? warehouseAllOptions.length === 0 : warehouseOptions.length === 0}
                  isSingle={true}
                  // showSearchInDropdown={true}
                  searchable={true}
                  onChange={(e) => {
                    setFieldValue("warehouse_id", e.target.value);
                    if (values.warehouse_id !== e.target.value) {
                      fetchRoutes(e.target.value);
                    }
                  }}
                  error={touched.warehouse_id && errors.warehouse_id}
                />
              </div>}

              {values.type !== "6" ? <div>
                <InputFields
                  label="Route"
                  name="route_id"
                  value={values.route_id?.toString() ?? ""}
                  onChange={(e) => setFieldValue("route_id", e.target.value)}
                  options={filteredRouteOptions}
                  disabled={!!values.sub_type || !values.warehouse_id}
                  showSkeleton={loading}
                  error={touched.route_id && errors.route_id}
                />
              </div> : ""}

            </div>
          </ContainerCard>
        );
      case 2:
        return (
          <ContainerCard>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div >
                <InputFields
                  required
                  type="contact"
                  label="Owner Contact Number"
                  name="contact_no"
                  // setSelectedCountry={(country: contactCountry) => setCountry(prev => ({ ...prev, contact_no: country }))}
                  selectedCountry={country.contact_no}
                  value={`${values.contact_no ?? ""}`}
                  onChange={(e) => setFieldValue("contact_no", e.target.value)}
                // error={
                //   errors?.contact_no && touched?.contact_no
                //     ? errors.contact_no
                //     : false
                // }
                />
                {errors?.contact_no && touched?.contact_no && (
                  <span className="text-xs text-red-500 mt-1">
                    {/* {errors.contact_no} */}
                  </span>
                )}
              </div>

              <div>
                <InputFields

                  label="Email"
                  name="email"
                  value={values.email}
                  onChange={(e) => setFieldValue("email", e.target.value)}
                />

              </div>
              <div>
                <CustomPasswordInput

                  label="Password"
                  value={values.password}
                  onChange={(e) => setFieldValue("password", e.target.value)}
                />

              </div>

              <div></div>
            </div>
          </ContainerCard>
        );
      case 3:
        return (
          <ContainerCard>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <InputFields
                  required
                  label="Forceful login"
                  type="radio"
                  name="forceful_login"
                  value={values.forceful_login}
                  onChange={(e) =>
                    setFieldValue("forceful_login", e.target.value)
                  }
                  options={[
                    { value: "1", label: "Yes" },
                    { value: "0", label: "No" },
                  ]}
                />
                <ErrorMessage
                  name="forceful_login"
                  component="span"
                  className="text-xs text-red-500"
                />
              </div>
              <div>
                <InputFields
                  required
                  label="Status"
                  name="status"
                  type="radio"
                  value={values.status}
                  onChange={(e) => setFieldValue("status", e.target.value)}
                  options={[
                    { value: "1", label: "Active" },
                    { value: "0", label: "Inactive" },
                  ]}
                />
                <ErrorMessage
                  name="status"
                  component="span"
                  className="text-xs text-red-500"
                />
              </div>
              <div className="col-span-3">
                <div className="font-medium mb-2"></div>
                <div className="flex gap-10">
                  <CustomCheckbox
                    id="is_block"
                    label="Is Block"
                    checked={values.is_block === "1"}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFieldValue("is_block", "1");
                        setFieldValue("cashier_description_block", "0");
                        setFieldValue("invoice_block", "0");
                      } else {
                        setFieldValue("is_block", "0");
                      }
                    }}
                  />
                  <CustomCheckbox
                    id="cashier_description_block"
                    label="Cashier Description Block"
                    checked={values.cashier_description_block === "1"}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFieldValue("is_block", "0");
                        setFieldValue("cashier_description_block", "1");
                        setFieldValue("invoice_block", "0");
                      } else {
                        setFieldValue("cashier_description_block", "0");
                      }
                    }}
                  />
                  <CustomCheckbox
                    id="invoice_block"
                    label="Invoice Block"
                    checked={values.invoice_block === "1"}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFieldValue("is_block", "0");
                        setFieldValue("cashier_description_block", "0");
                        setFieldValue("invoice_block", "1");
                      } else {
                        setFieldValue("invoice_block", "0");
                      }
                    }}
                  />
                </div>
                {errors.is_block && (
                  <span className="text-xs text-red-500">
                    {errors.is_block}
                  </span>
                )}
              </div>
              {values.is_block === "1" && (
                <>
                  {console.log(values.block_date_from, "values.block_date_from")}
                  <div>
                    <InputFields
                      label="Block Date From"
                      type="date"
                      name="block_date_from"
                      value={values.block_date_from ? new Date(values.block_date_from).toISOString().slice(0, 10) : values.block_date_from}
                      onChange={(e) =>
                        setFieldValue("block_date_from", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <InputFields
                      label="Block Date To"
                      type="date"
                      name="block_date_to"
                      value={values.block_date_to ? new Date(values.block_date_to).toISOString().slice(0, 10) : values.block_date_to}
                      onChange={(e) =>
                        setFieldValue("block_date_to", e.target.value)
                      }
                    />
                  </div>
                </>
              )}
              {values.invoice_block === "1" && (
                <div>
                  <InputFields
                    label="Reason"
                    name="reason"
                    value={values.reason || ""}
                    onChange={(e) => setFieldValue("reason", e.target.value)}
                  />
                </div>
              )}
            </div>
          </ContainerCard>
        );
      default:
        return null;
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/salesTeam">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">
            {isEditMode ? "Update Sales Team" : "Add New Sales Team"}
          </h1>
        </div>
      </div>

      <Formik
        initialValues={initialValues}
        enableReinitialize
        validationSchema={SalesmanSchema}
        onSubmit={handleSubmit}
      >
        {({
          values,
          setFieldValue,
          errors,
          touched,
          handleSubmit: formikSubmit,
          setErrors,
          setTouched,
          isSubmitting: isSubmitting,
        }) => (
          <Form>
            {/* <>{console.log(values, "lk")}</> */}
            <StepperForm
              steps={steps.map((step) => ({
                ...step,
                isCompleted: isStepCompleted(step.id),
              }))}
              currentStep={currentStep}
              onStepClick={() => { }}
              onBack={() =>
                handlePrev({
                  setErrors,
                  setTouched,
                } as FormikHelpers<SalesmanFormValues>)
              }
              onNext={() =>
                handleNext(values, {
                  setErrors,
                  setTouched,
                } as FormikHelpers<SalesmanFormValues>)
              }
              onSubmit={() => formikSubmit()}
              showSubmitButton={isLastStep}
              showNextButton={!isLastStep}
              nextButtonText="Save & Next"
              submitButtonText={
                isSubmitting
                  ? (isEditMode ? "Updating..." : "Submitting...")
                  : isEditMode
                    ? "Update"
                    : "Submit"
              }
            >
              {renderStepContent(values, setFieldValue, errors, touched)}
            </StepperForm>
          </Form>
        )}
      </Formik>
    </div>
  );
}
