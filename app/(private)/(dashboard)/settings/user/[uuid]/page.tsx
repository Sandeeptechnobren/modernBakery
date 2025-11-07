"use client";

import { Icon } from "@iconify-icon/react";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import InputFields from "@/app/components/inputFields";
import StepperForm, { useStepperForm, StepperStep } from "@/app/components/stepperForm";
import { useSnackbar } from "@/app/services/snackbarContext";
import {
  updateAuthUser,
  registerAuthUser,
  getRoleById,
  getUserByUuid
} from "@/app/services/allApi";
import * as Yup from "yup";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import { Form, Formik, FormikHelpers, FormikErrors, FormikTouched } from "formik";
import { useLoading } from "@/app/services/loadingContext";
import CustomPasswordInput from "@/app/components/customPasswordInput";

interface User {
  name: string;
  email: string;
  username: string;
  contact_number: string;
  password: string;
  password_confirmation: string;
  role: string;
  company?: string | string[];
  warehouse?: string | string[];
  route?: string | string[];
  region?: string | string[];
  area?: string | string[];
  salesman?: string | string[];
}

interface ContactCountry {
  name: string;
  code?: string;
  flag?: string;
}

export default function UserAddEdit() {
  const { showSnackbar } = useSnackbar();
  const { setLoading } = useLoading();
  const router = useRouter();
  const params = useParams();
  const userUUID = params?.uuid as string | undefined;
  const isEditMode = userUUID !== undefined && userUUID !== "add";

  const {
    roleOptions,
    companyOptions,
    regionOptions,
    areaOptions,
    warehouseOptions,
    routeOptions,
    salesmanOptions,
    fetchRegionOptions,
    fetchAreaOptions,
    fetchWarehouseOptions,
    fetchRouteOptions,
  } = useAllDropdownListData();

  const [visibleLabels, setVisibleLabels] = useState<string[]>([]);
  const [country, setCountry] = useState<Record<string, ContactCountry>>({
    contact_number: { name: "Uganda", code: "+256", flag: "🇺🇬" },
  });
  const [skeleton, setSkeleton] = useState({
    region: false,
    area: false,
    warehouse: false,
    route: false,
  });

  const steps: StepperStep[] = [
    { id: 1, label: "User Information" },
    { id: 2, label: "Roles and Permissions" },
  ];

  const { currentStep, nextStep, prevStep, markStepCompleted, isStepCompleted, isLastStep } =
    useStepperForm(steps.length);

  const [initialValues, setInitialValues] = useState<User>({
    name: "",
    email: "",
    username: "",
    contact_number: "",
    password: "",
    password_confirmation: "",
    role: "",
    company: "",
    warehouse: "",
    route: "",
    region: "",
    area: "",
    salesman: "",
  });
  const [originalUser, setOriginalUser] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    (async () => {
      if (isEditMode && userUUID) {
        setLoading(true);
        const res = await getUserByUuid(String(userUUID));
        const data = res?.data ?? res;
        if (res && !res.error) {
          const user = data?.user ?? data;
          const roleVal = user?.role ? (typeof user.role === "object" ? String(user.role.id ?? user.role) : String(user.role)) : "";
          // Build arrays of ids for multi-select initial values (preserve all selections)
          const companyIds = Array.isArray(user?.companies) && user.companies.length > 0
            ? user.companies.map((c: unknown) => String(((c as Record<string, unknown>)?.id) ?? c))
            : (user?.company ? [String(user.company)] : []);
          const regionIds = Array.isArray(user?.regions) && user.regions.length > 0
            ? user.regions.map((r: unknown) => String(((r as Record<string, unknown>)?.id) ?? r))
            : (user?.region ? [String(user.region)] : []);
          const areaIds = Array.isArray(user?.areas) && user.areas.length > 0
            ? user.areas.map((a: unknown) => String(((a as Record<string, unknown>)?.id) ?? a))
            : (user?.area ? [String(user.area)] : []);
          const warehouseIds = Array.isArray(user?.warehouses) && user.warehouses.length > 0
            ? user.warehouses.map((w: unknown) => String(((w as Record<string, unknown>)?.id) ?? w))
            : (user?.warehouse ? [String(user.warehouse)] : []);
          const routeIds = Array.isArray(user?.routes) && user.routes.length > 0
            ? user.routes.map((r: unknown) => String(((r as Record<string, unknown>)?.id) ?? r))
            : (user?.route ? [String(user.route)] : []);
          const salesmanVals = Array.isArray(user?.salesmen) && user.salesmen.length > 0
            ? user.salesmen.map((s: unknown) => String(((s as Record<string, unknown>)?.id) ?? s))
            : (user?.salesman ? [String(user.salesman)] : []);

          setInitialValues({
            name: String(user?.name ?? ""),
            email: String(user?.email ?? ""),
            username: String(user?.username ?? ""),
            contact_number: String(user?.contact_number ?? ""),
            password: "",
            password_confirmation: "",
            role: roleVal,
            company: companyIds.length ? companyIds : [],
            warehouse: warehouseIds.length ? warehouseIds : [],
            route: routeIds.length ? routeIds : [],
            region: regionIds.length ? regionIds : [],
            area: areaIds.length ? areaIds : [],
            salesman: salesmanVals.length ? salesmanVals : [],
          });
          setOriginalUser(user);

          try {
            if (roleVal) await fetchLabelsForRoles(roleVal);
          } catch (err) {
            console.error("Failed to fetch labels for role during init:", err);
          }

          try {
            // Use first id to fetch dependent dropdowns so options load for the selects
            if (companyIds.length > 0) {
              // pass comma-separated company ids so regions for all selected companies are fetched
              const companyCsv = companyIds.join(",");
              setSkeleton((s) => ({ ...s, region: true }));
              try {
                await fetchRegionOptions(companyCsv);
              } finally {
                setSkeleton((s) => ({ ...s, region: false }));
              }
            }
            if (regionIds.length > 0) {
              const firstRegion = regionIds[0];
              setSkeleton((s) => ({ ...s, area: true }));
              try {
                await fetchAreaOptions(firstRegion);
              } finally {
                setSkeleton((s) => ({ ...s, area: false }));
              }
            }
            if (areaIds.length > 0) {
              const firstArea = areaIds[0];
              setSkeleton((s) => ({ ...s, warehouse: true }));
              try {
                await fetchWarehouseOptions(firstArea);
              } finally {
                setSkeleton((s) => ({ ...s, warehouse: false }));
              }
            }
            if (warehouseIds.length > 0) {
              const firstWarehouse = warehouseIds[0];
              setSkeleton((s) => ({ ...s, route: true }));
              try {
                await fetchRouteOptions(firstWarehouse);
              } finally {
                setSkeleton((s) => ({ ...s, route: false }));
              }
            }
          } catch (err) {
            console.error("Init dropdown fetch failed:", err);
          }
        }
        setLoading(false);
      }
    })();
  }, [isEditMode, userUUID]);

  const fetchLabelsForRoles = async (roleId: string) => {
    if (!roleId) {
      setVisibleLabels([]);
      return;
    }
    try {
      const res = await getRoleById(String(roleId));
      if (res?.error) return;
      const data = res.data ?? res;
      const labelsArr = Array.isArray(data?.labels)
        ? data.labels
        : Array.isArray(data?.label)
        ? data.label
        : [];
      const labelNames = labelsArr.map((l: unknown) => String(((l as Record<string, unknown>)?.name) ?? "").toLowerCase());
      setVisibleLabels(labelNames);
    } catch (err) {
      console.error("Failed to fetch labels:", err);
    }
  };

  // Normalize values passed from InputFields into string[] when appropriate
  const normalizeToArray = (v: unknown): string[] => {
    if (Array.isArray(v)) return v.map(String);
    if (v === null || v === undefined) return [];
    if (typeof v === "string") {
      const s = v.trim();
      if (s === "") return [];
      if (s.includes(",")) return s.split(",").map(x => x.trim()).filter(Boolean);
      return [s];
    }
    return [String(v)];
  };

  const anySelectedPresent = (selected: unknown, optionsArr: Array<Record<string, unknown>> | undefined) => {
    const opts = optionsArr ?? [];
    const sel = normalizeToArray(selected);
    if (sel.length === 0) return false;
    return sel.some(s => opts.some(opt => String(opt?.value ?? "") === String(s)));
  };
  const passwordField = isEditMode
    ? Yup.string().notRequired()
    : Yup.string().required("Password is required").min(6, "Password too short");

  const passwordConfirmationField = isEditMode
    ? Yup.string().notRequired()
    : Yup.string()
        .oneOf([Yup.ref("password"), undefined], "Passwords must match")
        .required("Confirm password is required");

  const baseFields = {
    name: Yup.string().required("Name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    username: Yup.string().required("Username is required"),
    contact_number: Yup.string().required("Contact number is required"),
    password: passwordField,
    password_confirmation: passwordConfirmationField,
  };

  const roleField = {
    role: Yup.string().required("Role is required"),
  };

  const dynamicSchema = Yup.object().shape({
    ...baseFields,
    ...roleField,
    // allow either a single string id or an array of ids (multi-select). Accept non-empty string or non-empty array.
    ...(visibleLabels.includes("company") && {
      company: Yup.mixed().test("company-required", "Company is required", (v) => {
        if (Array.isArray(v)) return v.length > 0;
        if (typeof v === "string") return v.trim() !== "";
        return false;
      }),
    }),
    ...(visibleLabels.includes("region") && {
      region: Yup.mixed().test("region-required", "Region is required", (v) => {
        if (Array.isArray(v)) return v.length > 0;
        if (typeof v === "string") return v.trim() !== "";
        return false;
      }),
    }),
    ...(visibleLabels.includes("area") && {
      area: Yup.mixed().test("area-required", "Area is required", (v) => {
        if (Array.isArray(v)) return v.length > 0;
        if (typeof v === "string") return v.trim() !== "";
        return false;
      }),
    }),
    ...(visibleLabels.includes("warehouse") && {
      warehouse: Yup.mixed().test("warehouse-required", "Warehouse is required", (v) => {
        if (Array.isArray(v)) return v.length > 0;
        if (typeof v === "string") return v.trim() !== "";
        return false;
      }),
    }),
    ...(visibleLabels.includes("route") && {
      route: Yup.mixed().test("route-required", "Route is required", (v) => {
        if (Array.isArray(v)) return v.length > 0;
        if (typeof v === "string") return v.trim() !== "";
        return false;
      }),
    }),
    ...(visibleLabels.includes("salesman") && {
      salesman: Yup.mixed().test("salesman-required", "Salesman is required", (v) => {
        if (Array.isArray(v)) return v.length > 0;
        if (typeof v === "string") return v.trim() !== "";
        return false;
      }),
    }),
  });

  const handleNext = async (
    values: User,
    actions: Pick<FormikHelpers<User>, "setErrors" | "setTouched">
  ) => {
    try {
      const normalized = {
        ...values,
        company: Array.isArray(values.company) ? values.company[0] : values.company,
        region: Array.isArray(values.region) ? values.region[0] : values.region,
        area: Array.isArray(values.area) ? values.area[0] : values.area,
        warehouse: Array.isArray(values.warehouse) ? values.warehouse[0] : values.warehouse,
        route: Array.isArray(values.route) ? values.route[0] : values.route,
        salesman: Array.isArray(values.salesman) ? values.salesman[0] : values.salesman,
      } as User;
      const stepSchema =
        currentStep === 1
          ? Yup.object().shape({ ...baseFields })
          : Yup.object().shape({
              ...roleField,
                  ...(visibleLabels.includes("company") && {
                    company: Yup.mixed().test("company-required", "Company is required", (v) => {
                      if (Array.isArray(v)) return v.length > 0;
                      if (typeof v === "string") return v.trim() !== "";
                      return false;
                    }),
                  }),
                  ...(visibleLabels.includes("region") && {
                    region: Yup.mixed().test("region-required", "Region is required", (v) => {
                      if (Array.isArray(v)) return v.length > 0;
                      if (typeof v === "string") return v.trim() !== "";
                      return false;
                    }),
                  }),
                  ...(visibleLabels.includes("area") && {
                    area: Yup.mixed().test("area-required", "Area is required", (v) => {
                      if (Array.isArray(v)) return v.length > 0;
                      if (typeof v === "string") return v.trim() !== "";
                      return false;
                    }),
                  }),
                  ...(visibleLabels.includes("warehouse") && {
                    warehouse: Yup.mixed().test("warehouse-required", "Warehouse is required", (v) => {
                      if (Array.isArray(v)) return v.length > 0;
                      if (typeof v === "string") return v.trim() !== "";
                      return false;
                    }),
                  }),
                  ...(visibleLabels.includes("route") && {
                    route: Yup.mixed().test("route-required", "Route is required", (v) => {
                      if (Array.isArray(v)) return v.length > 0;
                      if (typeof v === "string") return v.trim() !== "";
                      return false;
                    }),
                  }),
            });

      await stepSchema.validate(normalized, { abortEarly: false });
      markStepCompleted(currentStep);
      nextStep();
      } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const errors = err.inner.reduce((acc: Record<string, string>, curr: Yup.ValidationError) => {
          acc[curr.path!] = curr.message;
          return acc;
        }, {});
        actions.setErrors(errors);
        actions.setTouched(Object.keys(errors).reduce((a, c) => ({ ...a, [c]: true }), {}));
      }
    }
  };

  const handleSubmit = async (
    values: User,
    actions?: Partial<Pick<FormikHelpers<User>, "setErrors" | "setTouched" | "setSubmitting">>
  ) => {
    try {
      const normalized = {
        ...values,
        company: Array.isArray(values.company) ? values.company[0] : values.company,
        region: Array.isArray(values.region) ? values.region[0] : values.region,
        area: Array.isArray(values.area) ? values.area[0] : values.area,
        warehouse: Array.isArray(values.warehouse) ? values.warehouse[0] : values.warehouse,
        route: Array.isArray(values.route) ? values.route[0] : values.route,
        salesman: Array.isArray(values.salesman) ? values.salesman[0] : values.salesman,
      } as User;

      await dynamicSchema.validate(normalized, { abortEarly: false });
    const payload: Record<string, unknown> = { ...normalized };
    if (payload.role) payload.role = Number(payload.role as unknown);

    const toArray = <T,>(v?: T | T[]): T[] => (Array.isArray(v) ? v : v ? [v] : []);
    const companies = toArray(values.company).map((id) => Number(String(id)));
    const regions = toArray(values.region).map((id) => Number(String(id)));
    const areas = toArray(values.area).map((id) => Number(String(id)));
    const warehouses = toArray(values.warehouse).map((id) => Number(String(id)));
    const routes = toArray(values.route).map((id) => Number(String(id)));
    const salesmen = toArray(values.salesman).map((id) => Number(String(id)));
  // Always include these keys as arrays (may be empty) per backend requirement
  payload.company = companies;
  payload.region = regions;
  payload.area = areas;
  payload.warehouse = warehouses;
  payload.route = routes;
  payload.salesman = salesmen;

      if (isEditMode) {
        if (Object.prototype.hasOwnProperty.call(payload, "password_confirmation")) delete (payload as Record<string, unknown>)["password_confirmation"];

        if (!(payload as Record<string, unknown>).password) delete (payload as Record<string, unknown>)["password"];

        if (payload.role) payload.role = Number(payload.role as unknown);
      }

      let res;
      if (isEditMode && userUUID) {
        res = await updateAuthUser(userUUID, payload);
      } else {
        res = await registerAuthUser(payload);
      }
      if (res?.error) {
        showSnackbar(res.data?.message || "Failed to submit form", "error");
      } else {
        showSnackbar(isEditMode ? "User updated successfully" : "User added successfully", "success");
        router.push("/settings/user");
      }
      } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const errors = err.inner.reduce((acc: Record<string, string>, curr: Yup.ValidationError) => {
          if (curr.path) acc[curr.path] = curr.message;
          return acc;
        }, {});
        actions?.setErrors && actions.setErrors(errors);
        actions?.setTouched && actions.setTouched(Object.keys(errors).reduce((a, c) => ({ ...a, [c]: true }), {}));
        actions?.setSubmitting && actions.setSubmitting(false);
        return;
      }
      showSnackbar(isEditMode ? "Update User failed" : "Add User failed", "error");
    }
  };

  const renderStepContent = (
    values: User,
    setFieldValue: (field: string, value: unknown) => void,
    errors: FormikErrors<User>,
    touched: FormikTouched<User>
  ) => {
    switch (currentStep) {
      case 1:
        return (
          <div className="bg-white rounded-2xl shadow mb-6 p-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">User Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputFields
                required
                label="Name"
                name="name"
                value={values.name}
                onChange={(e) => setFieldValue("name", e.target.value)}
                error={touched.name && errors.name}
              />
              <InputFields
                required
                label="Email"
                name="email"
                value={values.email}
                onChange={(e) => setFieldValue("email", e.target.value)}
                error={touched.email && errors.email}
              />
              <InputFields
                required
                label="Username"
                name="username"
                value={values.username}
                onChange={(e) => setFieldValue("username", e.target.value)}
                error={touched.username && errors.username}
              />
              <InputFields
                required
                type="contact"
                label="Contact Number"
                name="contact_number"
                value={values.contact_number}
                selectedCountry={country.contact_number}
                setSelectedCountry={(c: ContactCountry) =>
                  setCountry((prev) => ({ ...prev, contact_number: c }))
                }
                onChange={(e) => setFieldValue("contact_number", e.target.value)}
                error={touched.contact_number && errors.contact_number}
              />
              {!isEditMode && (
                <>
                  <CustomPasswordInput
                    label="Password"
                    value={values.password}
                    width="max-w-[406px]"
                    onChange={(e) => setFieldValue("password", e.target.value)}
                    onBlur={() => {
                      /* optional: touched will be set by step validation; no-op here */
                    }}
                    error={touched.password && (errors.password as string)}
                  />
                  <CustomPasswordInput
                    label="Confirm Password"
                    value={values.password_confirmation}
                    width="max-w-[406px]"
                    onChange={(e) => setFieldValue("password_confirmation", e.target.value)}
                    onBlur={() => {
                      /* optional: touched will be set by step validation; no-op here */
                    }}
                    error={touched.password_confirmation && (errors.password_confirmation as string)}
                  />
                </>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="bg-white rounded-2xl shadow mb-6 p-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Roles and Permissions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputFields
                required
                label="Role"
                name="role"
                value={values.role}
                options={roleOptions}
                onChange={async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
                  const val = e?.target?.value;
                  setFieldValue("role", val);
                  await fetchLabelsForRoles(val);
                }}
                error={touched.role && errors.role}
              />

              {visibleLabels.includes("company") && (
                <InputFields
                  required
                  label="Company"
                  name="company"
                  isSingle={false}
                  value={values.company}
                  options={companyOptions}
                  onChange={async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
                    const raw = e?.target?.value;
                    // allow CSV of company ids or array
                    const vals = normalizeToArray(raw);
                    setFieldValue("company", vals);
                    setSkeleton((s) => ({ ...s, region: true }));
                    try {
                      // fetch regions for all selected companies (CSV)
                      await fetchRegionOptions(vals.join(","));
                    } finally {
                      setSkeleton((s) => ({ ...s, region: false }));
                    }

                    // Clear dependent selects if no regions returned or current value not present
                    const newRegionOptions = (regionOptions as Array<Record<string, unknown>> | undefined) ?? [];
                    const regionExists = anySelectedPresent(values.region, newRegionOptions);
                    if (newRegionOptions.length === 0 || !regionExists) {
                      setFieldValue("region", []);
                      setFieldValue("area", []);
                      setFieldValue("warehouse", []);
                      setFieldValue("route", []);
                    }
                  }}
                  error={touched.company && errors.company}
                  showSkeleton={skeleton.region}
                />
              )}
              {visibleLabels.includes("region") && (regionOptions.length>0?
                <InputFields
                  required
                  label="Region"
                  name="region"
                  isSingle={false}
                  value={values.region}
                  options={regionOptions}
                  onChange={async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
                    const v = e?.target?.value;
                    setFieldValue("region", v);
                    setSkeleton((s) => ({ ...s, area: true }));
                    try {
                      await fetchAreaOptions(v);
                    } finally {
                      setSkeleton((s) => ({ ...s, area: false }));
                    }

                    // Clear dependent selects if no areas returned or current area not present
                    const newAreaOptions = (areaOptions as Array<Record<string, unknown>> | undefined) ?? [];
                    const curArea = values.area;
                    const areaExists = newAreaOptions.some(opt => String(opt?.value ?? "") === String(curArea ?? ""));
                    if (newAreaOptions.length === 0 || !areaExists) {
                      setFieldValue("area", "");
                      setFieldValue("warehouse", "");
                      setFieldValue("route", "");
                    }
                  }}
                  error={touched.region && errors.region}
                  showSkeleton={skeleton.region}
                />: <InputFields
                  required
                  label="Region"
                  name="region"
                  isSingle={false}
                  value={values.region}
                  options={regionOptions}
                  onChange={async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
                    const v = e?.target?.value;
                    setFieldValue("region", v);
                    setSkeleton((s) => ({ ...s, area: true }));
                    try {
                      await fetchAreaOptions(v);
                    } finally {
                      setSkeleton((s) => ({ ...s, area: false }));
                    }

                    // Clear dependent selects if no areas returned or current area not present
                    const newAreaOptions = (areaOptions as Array<Record<string, unknown>> | undefined) ?? [];
                    const curArea = values.area;
                    const areaExists = newAreaOptions.some(opt => String(opt?.value ?? "") === String(curArea ?? ""));
                    if (newAreaOptions.length === 0 || !areaExists) {
                      setFieldValue("area", "");
                      setFieldValue("warehouse", "");
                      setFieldValue("route", "");
                    }
                  }}
                  error={touched.region && errors.region}
                  showSkeleton={skeleton.region}
                  disabled
                />
              )}
              {visibleLabels.includes("area") && (
                areaOptions.length>0?<InputFields
                  required
                  label="Area"
                  name="area"
                  isSingle={false}
                  value={values.area}
                  options={areaOptions}
                  onChange={async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
                    const v = e?.target?.value;
                    setFieldValue("area", v);
                    setSkeleton((s) => ({ ...s, warehouse: true }));
                    try {
                      await fetchWarehouseOptions(v);
                    } finally {
                      setSkeleton((s) => ({ ...s, warehouse: false }));
                    }

                    const newWarehouseOptions = (warehouseOptions as Array<Record<string, unknown>> | undefined) ?? [];
                    const curWarehouse = values.warehouse;
                    const warehouseExists = newWarehouseOptions.some(opt => String(opt?.value ?? "") === String(curWarehouse ?? ""));
                    if (newWarehouseOptions.length === 0 || !warehouseExists) {
                      setFieldValue("warehouse", "");
                      setFieldValue("route", "");
                    }
                  }}
                  error={touched.area && errors.area}
                  showSkeleton={skeleton.area}
                />:<InputFields
                  required
                  label="Area"
                  name="area"
                  isSingle={false}
                  value={values.area}
                  options={areaOptions}
                  onChange={async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
                    const v = e?.target?.value;
                    setFieldValue("area", v);
                    setSkeleton((s) => ({ ...s, warehouse: true }));
                    try {
                      await fetchWarehouseOptions(v);
                    } finally {
                      setSkeleton((s) => ({ ...s, warehouse: false }));
                    }

                    const newWarehouseOptions = (warehouseOptions as Array<Record<string, unknown>> | undefined) ?? [];
                    const curWarehouse = values.warehouse;
                    const warehouseExists = newWarehouseOptions.some(opt => String(opt?.value ?? "") === String(curWarehouse ?? ""));
                    if (newWarehouseOptions.length === 0 || !warehouseExists) {
                      setFieldValue("warehouse", "");
                      setFieldValue("route", "");
                    }
                  }}
                  error={touched.area && errors.area}
                  showSkeleton={skeleton.area}
                  disabled
                />
              )}
              {visibleLabels.includes("warehouse") && (
                warehouseOptions.length>0?<InputFields
                  required
                  label="Warehouse"
                  name="warehouse"
                  isSingle={false}
                  value={values.warehouse}
                  options={warehouseOptions}
                  onChange={async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
                    const v = e?.target?.value;
                    setFieldValue("warehouse", v);
                    setSkeleton((s) => ({ ...s, route: true }));
                    try {
                      await fetchRouteOptions(v);
                    } finally {
                      setSkeleton((s) => ({ ...s, route: false }));
                    }

                    // Clear route if no routes exist or selected route not present
                    const newRouteOptions = (routeOptions as Array<Record<string, unknown>> | undefined) ?? [];
                    const curRoute = values.route;
                    const routeExists = newRouteOptions.some(opt => String(opt?.value ?? "") === String(curRoute ?? ""));
                    if (newRouteOptions.length === 0 || !routeExists) {
                      setFieldValue("route", "");
                    }
                  }}
                  error={touched.warehouse && errors.warehouse}
                  showSkeleton={skeleton.warehouse}
                />
              :<InputFields
                  required
                  label="Warehouse"
                  name="warehouse"
                  isSingle={false}
                  value={values.warehouse}
                  options={warehouseOptions}
                  onChange={async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
                    const v = e?.target?.value;
                    setFieldValue("warehouse", v);
                    setSkeleton((s) => ({ ...s, route: true }));
                    try {
                      await fetchRouteOptions(v);
                    } finally {
                      setSkeleton((s) => ({ ...s, route: false }));
                    }

                    // Clear route if no routes exist or selected route not present
                    const newRouteOptions = (routeOptions as Array<Record<string, unknown>> | undefined) ?? [];
                    const curRoute = values.route;
                    const routeExists = newRouteOptions.some(opt => String(opt?.value ?? "") === String(curRoute ?? ""));
                    if (newRouteOptions.length === 0 || !routeExists) {
                      setFieldValue("route", "");
                    }
                  }}
                  error={touched.warehouse && errors.warehouse}
                  showSkeleton={skeleton.warehouse}
                  disabled
                />)}
              {visibleLabels.includes("route") && (
               routeOptions.length>0? <InputFields
                  required
                  label="Route"
                  name="route"
                  isSingle={false}
                  value={values.route}
                  options={routeOptions}
                  onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setFieldValue("route", e?.target?.value)}
                  error={touched.route && errors.route}
                  showSkeleton={skeleton.route}

                />: <InputFields
                  required
                  label="Route"
                  name="route"
                  isSingle={false}
                  value={values.route}
                  options={routeOptions}
                  onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setFieldValue("route", e?.target?.value)}
                  error={touched.route && errors.route}
                  showSkeleton={skeleton.route}
                  disabled

                />
              )}
              {visibleLabels.includes("salesman") && (
                <InputFields
                  required
                  label="Salesman"
                  name="salesman"
                  isSingle={false}
                  value={values.salesman}
                  options={salesmanOptions}
                  onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setFieldValue("salesman", e?.target?.value)}
                  error={touched.salesman && errors.salesman}
                />
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div className="cursor-pointer" onClick={() => router.back()}>
            <Icon icon="lucide:arrow-left" width={24} />
          </div>
          <h1 className="text-xl font-semibold text-gray-900">
            {isEditMode ? "Update User" : "Add User"}
          </h1>
        </div>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={dynamicSchema}
        enableReinitialize
        onSubmit={handleSubmit}
      >
        {({ values, setFieldValue, errors, touched, setErrors, setTouched, isSubmitting }) => (
          <Form>
              <StepperForm
              steps={steps.map((step) => ({
                ...step,
                isCompleted: isStepCompleted(step.id),
              }))}
              currentStep={currentStep}
              onBack={prevStep}
              onNext={() => handleNext(values, { setErrors, setTouched })}
              onSubmit={() => handleSubmit(values, { setErrors, setTouched })}
              showSubmitButton={isLastStep}
              showNextButton={!isLastStep}
              nextButtonText="Save & Next"
              submitButtonText={isSubmitting ? "Submitting..." : "Submit"}
            >
              {renderStepContent(values, setFieldValue, errors, touched)}
            </StepperForm>
          </Form>
        )}
      </Formik>
    </div>
  );
}
