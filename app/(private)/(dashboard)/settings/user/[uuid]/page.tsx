"use client";

import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import CustomPasswordInput from "@/app/components/customPasswordInput";
import InputFields from "@/app/components/inputFields";
import StepperForm, { StepperStep, useStepperForm } from "@/app/components/stepperForm";
import {
  agentCustomerList,
  customerCategoryList,
  customerSubCategoryList,
  getRoleById,
  getUserByUuid,
  itemCategoryList,
  itemList,
  itemSubCategoryList,
  outletChannelList,
  regionList,
  registerAuthUser,
  routeList,
  salesmanList,
  subRegionList,
  updateAuthUser,
  userEmailVerification,
  warehouseList
} from "@/app/services/allApi";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import { Form, Formik, FormikErrors, FormikHelpers, FormikProps, FormikTouched } from "formik";
import { useParams, useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import * as Yup from "yup";
// import { CustomTableSkelton } from "@/app/components/customSkeleton";
import Skeleton from "@mui/material/Skeleton";

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
  itemCategory?: string | string[];
  item?: string | string[];
  customerChannel?: string | string[];
  customerCategory?: string | string[];
  customerSubCategory?: string | string[];
  customer?: string | string[];
}

interface ContactCountry {
  name: string;
  code?: string;
  flag?: string;
}

export default function UserAddEdit() {
  const [isValidEmail, setIsValidEmail] = useState<boolean>(false)
  const [isValidUser, setIsValidUser] = useState<boolean>(false)
  const [isNestedDropdownValue, setIsNestedDropdownValue] = useState<boolean>(false)

  const { showSnackbar } = useSnackbar();
  const { setLoading } = useLoading();
  const router = useRouter();
  const params = useParams();
  const userUUID = params?.uuid as string | undefined;
  const isEditMode = userUUID !== undefined && userUUID !== "add";
  const actionsRef = React.useRef<FormikHelpers<User> | null>(null);

  const {
    roleOptions,
    companyOptions
  } = useAllDropdownListData();

  const checkEmail = async (
    type: "email" | "username",
    value: string,
    setFieldError: (field: string, message: string) => void
  ) => {
    if (!value) return;

    try {
      const res = await userEmailVerification(value);
      setIsValidEmail(res?.exists)
    } catch {
      setFieldError(type, `Error verifying ${type}`);
    }
  };

  const checkUsername = async (
    type: "email" | "username",
    value: string,
    setFieldError: (field: string, message: string) => void
  ) => {
    if (!value) return;

    try {
      const res = await userEmailVerification(value);
      setIsValidUser(res?.exists)
    } catch {
      setFieldError(type, `Error verifying ${type}`);
    }
  };

  const [visibleLabels, setVisibleLabels] = useState<string[]>([]);
  const [country, setCountry] = useState<Record<string, ContactCountry>>({
    contact_number: { name: "Uganda", code: "+256", flag: "🇺🇬" },
  });
  const [skeleton, setSkeleton] = useState({
    region: false,
    area: false,
    warehouse: false,
    route: false,
    // salesman: false,
    itemCategory: false,
    item: false,
    customerChannel: false,
    customerCategory: false,
    customerSubCategory: false,
    customer: false
  });
  const [options, setOptions] = useState({
    region: [],
    area: [],
    warehouse: [],
    route: [],
    // salesman: [],
    itemCategory: [],
    item: [],
    customerChannel: [],
    customerCategory: [],
    customerSubCategory: [],
    customer: []
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
    item: "",
  });
  // const [originalUser, setOriginalUser] = useState<Record<string, unknown> | null>(null);

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
          const itemIds = Array.isArray(user?.item) && user.item.length > 0
            ? user.item.map((s: unknown) => String(((s as Record<string, unknown>)?.id) ?? s))
            : (user?.item ? [String(user.item)] : []);

          // also attempt to pick up item category / customer channel / category / sub category / customer ids
          const itemCategoryIds = Array.isArray(user?.item_categories) && user.item_categories.length > 0
            ? user.item_categories.map((c: unknown) => String(((c as Record<string, unknown>)?.id) ?? c))
            : (user?.item_category ? [String(user.item_category)] : []);
          const customerChannelIds = Array.isArray(user?.outlet_channels) && user.outlet_channels.length > 0
            ? user.outlet_channels.map((c: unknown) => String(((c as Record<string, unknown>)?.id) ?? c))
            : (user?.customerChannel ? [String(user.customerChannel)] : []);
          const customerCategoryIds = Array.isArray(user?.customer_categories) && user.customer_categories.length > 0
            ? user.customer_categories.map((c: unknown) => String(((c as Record<string, unknown>)?.id) ?? c))
            : (user?.customerCategory ? [String(user.customerCategory)] : []);
          const customerSubCategoryIds = Array.isArray(user?.customer_sub_categories) && user.customer_sub_categories.length > 0
            ? user.customer_sub_categories.map((c: unknown) => String(((c as Record<string, unknown>)?.id) ?? c))
            : (user?.customerSubCategory ? [String(user.customerSubCategory)] : []);
          const customerIds = Array.isArray(user?.customers) && user.customers.length > 0
            ? user.customers.map((c: unknown) => String(((c as Record<string, unknown>)?.id) ?? c))
            : (user?.customer ? [String(user.customer)] : []);

          // Fetch only the dropdown options required for this user's role (to avoid over-fetching)
          let roleLabels: string[] = [];
          if (roleVal) {
            try {
              const rres = await getRoleById(String(roleVal));
              if (!rres?.error) {
                const rdata = rres.data ?? rres;
                const labelsArr = Array.isArray(rdata?.labels)
                  ? rdata.labels
                  : Array.isArray(rdata?.label)
                    ? rdata.label
                    : [];
                roleLabels = labelsArr.map((l: unknown) => String(((l as Record<string, unknown>)?.name) ?? "").toLowerCase());
                setVisibleLabels(roleLabels);
              }
            } catch (err) {
              console.error("Failed to fetch role labels for init:", err);
            }
          }

          // Helper to map API results to option shape used by InputFields
          const mapToOptions = (arr: any[], mapFn: (it: any) => { value: string; label: string }) => (Array.isArray(arr) ? arr.map(mapFn) : []);

          // Conditionally fetch cascaded options based on labels and existing ids
          const newOptions: Record<string, { value: string; label: string }[]> = { ...options };
          const newSkeleton = { ...skeleton };

          // Regions (depends on company)
          if (roleLabels.includes("region")) {
            if (companyIds.length > 0) {
              newSkeleton.region = true;
              setSkeleton((s) => ({ ...s, region: true }));
              try {
                const resp = await regionList({ company_id: companyIds.join(",") });
                const regions = resp?.data ?? [];
                newOptions.region = mapToOptions(regions, (region: any) => ({ value: String(region.id), label: (region.region_code || "") + (region.region_code && region.region_name ? " - " : "") + (region.region_name || "") }));
              } catch (e) {
                newOptions.region = [];
              } finally {
                newSkeleton.region = false;
                setSkeleton((s) => ({ ...s, region: false }));
              }
            } else {
              newOptions.region = [];
            }
          }

          // Areas (depends on region)
          if (roleLabels.includes("area")) {
            if (regionIds.length > 0) {
              setSkeleton((s) => ({ ...s, area: true }));
              try {
                const resp = await subRegionList({ region_id: regionIds.join(",") });
                const areas = resp?.data ?? [];
                newOptions.area = mapToOptions(areas, (area: any) => ({ value: String(area.id), label: (area.area_code || "") + (area.area_code && area.area_name ? " - " : "") + (area.area_name || "") }));
              } catch (e) {
                newOptions.area = [];
              } finally {
                setSkeleton((s) => ({ ...s, area: false }));
              }
            } else {
              newOptions.area = [];
            }
          }

          // Warehouses (depends on area)
          if (roleLabels.includes("warehouse")) {
            if (areaIds.length > 0) {
              setSkeleton((s) => ({ ...s, warehouse: true }));
              try {
                const resp = await warehouseList({ area_id: areaIds.join(",") });
                const whs = resp?.data ?? [];
                newOptions.warehouse = mapToOptions(whs, (w: any) => ({ value: String(w.id), label: (w.warehouse_code || "") + (w.warehouse_code && w.warehouse_name ? " - " : "") + (w.warehouse_name || "") }));
              } catch (e) {
                newOptions.warehouse = [];
              } finally {
                setSkeleton((s) => ({ ...s, warehouse: false }));
              }
            } else {
              newOptions.warehouse = [];
            }
          }

          // Routes (depends on warehouse)
          if (roleLabels.includes("route")) {
            if (warehouseIds.length > 0) {
              setSkeleton((s) => ({ ...s, route: true }));
              try {
                const resp = await routeList({ warehouse_id: warehouseIds.join(",") });
                const routes = resp?.data ?? [];
                newOptions.route = mapToOptions(routes, (r: any) => ({ value: String(r.id), label: (r.route_code || "") + (r.route_code && r.route_name ? " - " : "") + (r.route_name || "") }));
              } catch (e) {
                newOptions.route = [];
              } finally {
                setSkeleton((s) => ({ ...s, route: false }));
              }
            } else {
              newOptions.route = [];
            }
          }

          // Item Categories (can be global; below handlers sometimes call without params)
          if (roleLabels.includes("item category")) {
            setSkeleton((s) => ({ ...s, itemCategory: true }));
            try {
              const resp = await itemCategoryList();
              const cats = resp?.data ?? [];
              newOptions.itemCategory = mapToOptions(cats, (c: any) => ({ value: String(c.id), label: (c.category_code || "") + (c.category_code && c.category_name ? " - " : "") + (c.category_name || "") }));
            } catch (e) {
              newOptions.itemCategory = [];
            } finally {
              setSkeleton((s) => ({ ...s, itemCategory: false }));
            }
          }

          // Items (depends on itemCategory)
          if (roleLabels.includes("item")) {
            if (itemCategoryIds.length > 0) {
              setSkeleton((s) => ({ ...s, item: true }));
              try {
                const resp = await itemList({ item_category_id: itemCategoryIds.join(",") });
                const its = resp?.data ?? [];
                newOptions.item = mapToOptions(its, (it: any) => ({ value: String(it.id), label: (it.erp_code || "") + (it.erp_code && it.name ? " - " : "") + (it.name || "") }));
              } catch (e) {
                newOptions.item = [];
              } finally {
                setSkeleton((s) => ({ ...s, item: false }));
              }
            } else {
              newOptions.item = [];
            }
          }

          // Customer Channel (depends on item)
          if (roleLabels.includes("customer channel")) {
            if (itemIds.length > 0) {
              setSkeleton((s) => ({ ...s, customerChannel: true }));
              try {
                const resp = await outletChannelList({ item_id: itemIds.join(",") });
                const ch = resp?.data ?? [];
                newOptions.customerChannel = mapToOptions(ch, (c: any) => ({ value: String(c.id), label: (c.outlet_channel_code || "") + (c.outlet_channel_code && c.outlet_channel ? " - " : "") + (c.outlet_channel || "") }));
              } catch (e) {
                newOptions.customerChannel = [];
              } finally {
                setSkeleton((s) => ({ ...s, customerChannel: false }));
              }
            } else {
              newOptions.customerChannel = [];
            }
          }

          // Customer Category (depends on customerChannel)
          if (roleLabels.includes("customer category")) {
            if (customerChannelIds.length > 0) {
              setSkeleton((s) => ({ ...s, customerCategory: true }));
              try {
                const resp = await itemCategoryList({ channel_id: customerChannelIds.join(",") });
                const cats = resp?.data ?? [];
                newOptions.customerCategory = mapToOptions(cats, (c: any) => ({ value: String(c.id), label: (c.category_code || "") + (c.category_code && c.category_name ? " - " : "") + (c.category_name || "") }));
              } catch (e) {
                newOptions.customerCategory = [];
              } finally {
                setSkeleton((s) => ({ ...s, customerCategory: false }));
              }
            } else {
              newOptions.customerCategory = [];
            }
          }

          // Customer Sub Category (depends on customerCategory)
          if (roleLabels.includes("customer sub category")) {
            if (customerCategoryIds.length > 0) {
              setSkeleton((s) => ({ ...s, customerSubCategory: true }));
              try {
                const resp = await itemSubCategoryList({ item_category_id: customerCategoryIds.join(",") });
                const subs = resp?.data ?? [];
                newOptions.customerSubCategory = mapToOptions(subs, (s: any) => ({ value: String(s.id), label: (s.sub_category_code || "") + (s.sub_category_code && s.sub_category_name ? " - " : "") + (s.sub_category_name || "") }));
              } catch (e) {
                newOptions.customerSubCategory = [];
              } finally {
                setSkeleton((s) => ({ ...s, customerSubCategory: false }));
              }
            } else {
              newOptions.customerSubCategory = [];
            }
          }

          // Customers (depends on customerSubCategory)
          if (roleLabels.includes("customer")) {
            if (customerSubCategoryIds.length > 0) {
              setSkeleton((s) => ({ ...s, customer: true }));
              try {
                const resp = await agentCustomerList({ customer_sub_category_id: customerSubCategoryIds.join(",") });
                const custs = resp?.data ?? [];
                newOptions.customer = mapToOptions(custs, (c: any) => ({ value: String(c.id), label: (c.osa_code || "") + (c.osa_code && c.name ? " - " : "") + (c.name || "") }));
              } catch (e) {
                newOptions.customer = [];
              } finally {
                setSkeleton((s) => ({ ...s, customer: false }));
              }
            } else {
              newOptions.customer = [];
            }
          }

          setOptions((prev) => ({ ...prev, ...newOptions }));

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
            itemCategory: itemCategoryIds.length ? itemCategoryIds : [],
            item: itemIds.length ? itemIds : [],
            customerChannel: customerChannelIds.length ? customerChannelIds : [],
            customerCategory: customerCategoryIds.length ? customerCategoryIds : [],
            customerSubCategory: customerSubCategoryIds.length ? customerSubCategoryIds : [],
            customer: customerIds.length ? customerIds : []
          });

          // setOriginalUser(user);

          try {
            if (roleVal) await fetchLabelsForRoles(roleVal);
          } catch (err) {
            console.error("Failed to fetch labels for role during init:", err);
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
    : Yup.string()
      .required("Password is required")
      .min(12, "Password must be at least 12 characters")
      .matches(/(?=.*[a-z])/, "Password must contain a lowercase letter")
      .matches(/(?=.*[A-Z])/, "Password must contain an uppercase letter")
      .matches(/(?=.*\d)/, "Password must contain a number")
      .matches(/(?=.*[^A-Za-z0-9\s])/, "Password must contain a special character");

  const passwordConfirmationField = isEditMode
    ? Yup.string().notRequired()
    : Yup.string()
      .oneOf([Yup.ref("password"), undefined], "Passwords must match")
      .required("Confirm password is required");

  const baseFields = {
    name: Yup.string().required("Name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    username: Yup.string().required("Username is required"),
    contact_number: Yup.string()
      .required("Contact number is required")
      .matches(/^[0-9]+$/, "Contact number must contain only digits")
      .min(9, "Contact number must be at least 9 digits")
      .max(10, "Contact number cannot be more than 10 digits"),
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
    // ...(visibleLabels.includes("salesman") && {
    //   salesman: Yup.mixed().test("salesman-required", "Salesman is required", (v) => {
    //     if (Array.isArray(v)) return v.length > 0;
    //     if (typeof v === "string") return v.trim() !== "";
    //     return false;
    //   }),
    // }),
    ...(visibleLabels.includes("item category") && {
      itemCategory: Yup.mixed().test("item-category-required", "Item category is required", (v) => {
        if (Array.isArray(v)) return v.length > 0;
        if (typeof v === "string") return v.trim() !== "";
        return false;
      }),
    }),
    ...(visibleLabels.includes("item") && {
      item: Yup.mixed().test("item-required", "Item is required", (v) => {
        if (Array.isArray(v)) return v.length > 0;
        if (typeof v === "string") return v.trim() !== "";
        return false;
      }),
    }),
    ...(visibleLabels.includes("customer channel") && {
      customerChannel: Yup.mixed().test("customer-channel-required", "Customer channel is required", (v) => {
        if (Array.isArray(v)) return v.length > 0;
        if (typeof v === "string") return v.trim() !== "";
        return false;
      }),
    }),
    ...(visibleLabels.includes("customer category") && {
      customerCategory: Yup.mixed().test("customer-category-required", "Customer category is required", (v) => {
        if (Array.isArray(v)) return v.length > 0;
        if (typeof v === "string") return v.trim() !== "";
        return false;
      }),
    }),
    ...(visibleLabels.includes("customer sub category") && {
      customerSubCategory: Yup.mixed().test("customer-sub-category-required", "Customer sub category is required", (v) => {
        if (Array.isArray(v)) return v.length > 0;
        if (typeof v === "string") return v.trim() !== "";
        return false;
      }),
    }),
    ...(visibleLabels.includes("customer") && {
      customer: Yup.mixed().test("customer-required", "Customer is required", (v) => {
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
        item: Array.isArray(values.item) ? values.item[0] : values.item,
      } as User;
      const stepSchema =
        currentStep === 1
          ? Yup.object().shape({ ...baseFields })
          : Yup.object().shape({
            ...roleField,
            ...((dynamicSchema as Yup.ObjectSchema<any, any, any, any>).fields)
          });

      await stepSchema.validate(normalized, { abortEarly: false });
      markStepCompleted(currentStep);
      if (!isValidEmail) {
        if (!isValidUser) {
          nextStep();
        }
      }
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
        item: Array.isArray(values.item) ? values.item[0] : values.item,
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
      const item = toArray(values.item).map((id) => Number(String(id)));
      // Always include these keys as arrays (may be empty) per backend requirement
      payload.company = companies;
      payload.region = regions;
      payload.area = areas;
      payload.warehouse = warehouses;
      payload.route = routes;
      payload.salesman = salesmen;
      payload.item = item;

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
    { touched, errors, values, setFieldTouched, setFieldValue, setValues }: FormikProps<User>,
  ) => {
    switch (currentStep) {
      case 1:
        return (
          <div className="bg-white rounded-2xl shadow mb-6 p-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">User Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <InputFields
                required
                label="Name"
                name="name"
                value={values.name}
                onChange={(e) => setFieldValue("name", e.target.value)}
                onBlur={() => setFieldTouched && setFieldTouched('name', true)}
                error={touched.name ? (errors.name as string) : undefined}
              />

              <div>
                <InputFields
                  required
                  label="Email"
                  name="email"
                  // autoComplete={false}

                  value={values.email}
                  onChange={(e) => {
                    setFieldValue("email", e.target.value);
                    // clear previous error if user starts typing again
                    actionsRef?.current?.setFieldError("email", "");
                    setIsValidEmail(false);
                  }}
                  onBlur={async () => {
                    setFieldTouched && setFieldTouched("email", true);
                    if (values.email && !isEditMode) {
                      await checkEmail("email", values.email, (field, message) => {
                        if (message) {
                          actionsRef?.current?.setFieldError(field, message);
                          setIsValidEmail(true);
                        } else {
                          setIsValidEmail(false);
                        }
                      });
                    }
                  }}
                  error={touched.email ? (errors.email as string) : undefined}
                />

                {isValidEmail && (
                  <p className="text-red-500 text-sm mt-1">Email already exists</p>
                )}
              </div>

              <div>
                <InputFields
                  required
                  label="Username"
                  name="username"
                  value={values.username}
                  onChange={(e) => {
                    setFieldValue("username", e.target.value);
                    actionsRef?.current?.setFieldError("username", "");
                    setIsValidUser(false);
                  }}
                  onBlur={async () => {
                    setFieldTouched && setFieldTouched("username", true);
                    if (values.username && !isEditMode) {
                      await checkUsername("username", values.username, (field, message) => {
                        if (message) {
                          actionsRef?.current?.setFieldError(field, message);
                          setIsValidUser(true);
                        } else {
                          setIsValidUser(false);
                        }
                      });
                    }
                  }}
                  error={touched.username ? (errors.username as string) : undefined}
                />

                {isValidUser && (
                  <p className="text-red-500 text-sm mt-1">Username already exists</p>
                )}
              </div>



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
                onBlur={() => setFieldTouched && setFieldTouched('contact_number', true)}
                error={touched.contact_number ? (errors.contact_number as string) : undefined}
              />
              {!isEditMode && (
                <>
                  <CustomPasswordInput
                    label="Password"
                    value={values.password}
                    autoComplete={false}
                    width="max-w-[406px]"
                    onChange={(e) => setFieldValue("password", e.target.value)}
                    onBlur={() => setFieldTouched && setFieldTouched('password', true)}
                    error={touched.password ? (errors.password as string) : undefined}
                  />
                  <CustomPasswordInput
                    label="Confirm Password"
                    value={values.password_confirmation}
                    autoComplete={false}
                    width="max-w-[406px]"
                    onChange={(e) => setFieldValue("password_confirmation", e.target.value)}
                    onBlur={() => setFieldTouched && setFieldTouched('password_confirmation', true)}
                    error={touched.password_confirmation ? (errors.password_confirmation as string) : undefined}
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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <div>
                <InputFields
                  required
                  label="Role"
                  name="role"
                  value={values.role}
                  options={roleOptions}
                  onChange={async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
                    const val = e?.target?.value;
                    if (val === values.role) return;
                    setIsNestedDropdownValue(true);
                    setFieldValue("role", val);
                    setFieldValue("company", []);
                    await fetchLabelsForRoles(val);
                    setValues({ ...values, role: val, company: [], region: [], area: [], warehouse: [], route: [], salesman: [], itemCategory: [], item: [], customerChannel: [], customerCategory: [], customerSubCategory: [], customer: [] });
                    setOptions((prev) => ({ ...prev, company: [], region: [], area: [], warehouse: [], route: [], salesman: [], itemCategory: [], item: [], customerChannel: [], customerCategory: [], customerSubCategory: [], customer: [] }));
                    setIsNestedDropdownValue(false);
                  }}
                  onBlur={() => setFieldTouched && setFieldTouched('role', true)}
                  error={touched.role ? (errors.role as string) : undefined}
                />
              </div>
              {!isNestedDropdownValue ? <>
                {visibleLabels.includes("company") && (
                  <InputFields
                    required
                    label="Company"
                    name="company"
                    isSingle={false}
                    // searchable={true}
                    value={values.company}
                    options={companyOptions}
                    multiSelectChips={true}
                    onChange={async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
                      const raw = e?.target?.value;
                      // allow CSV of company ids or array
                      const vals = normalizeToArray(raw);
                      setFieldValue("company", vals);
                      setFieldValue("region", []);
                      if (vals.length === 0) {
                        setOptions((prev) => ({ ...prev, region: [], area: [], warehouse: [], route: [], salesman: [], itemCategory: [], item: [], customerChannel: [], customerCategory: [], customerSubCategory: [], customer: [] }));
                        return;
                      }
                      setSkeleton((s) => ({ ...s, region: true }));
                      try {
                        const regions = await regionList({ company_id: vals.join(",") });
                        const options = regions.data.map((region: { id: string; region_code: string; region_name: string }) => ({ value: String(region.id), label: (region.region_code || "") + (region.region_code && region.region_name ? " - " : "") + region.region_name })) ?? [];
                        setOptions((prev) => ({ ...prev, region: options, area: [], warehouse: [], route: [], salesman: [], itemCategory: [], item: [], customerChannel: [], customerCategory: [], customerSubCategory: [], customer: [] }));
                      } catch (e: unknown) {
                        setOptions((prev) => ({ ...prev, region: [], area: [], warehouse: [], route: [], salesman: [], itemCategory: [], item: [], customerChannel: [], customerCategory: [], customerSubCategory: [], customer: [] }));
                      } finally {
                        setSkeleton((s) => ({ ...s, region: false }));
                      }
                    }}
                    onBlur={() => setFieldTouched && setFieldTouched('company', true)}
                    error={touched.company ? (errors.company as string) : undefined}
                  // showSkeleton={skeleton.company}
                  />
                )}
                {visibleLabels.includes("region") && (
                  <InputFields
                    required
                    label="Region"
                    name="region"
                    isSingle={false}
                    // searchable={true}
                    multiSelectChips={true}
                    value={values.region}
                    options={options.region}
                    onChange={async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
                      const v = e?.target?.value;
                      const vals = normalizeToArray(v);
                      setFieldValue("region", vals);
                      setFieldValue("area", []);
                      if (vals.length === 0) {
                        setOptions((prev) => ({ ...prev, area: [], warehouse: [], route: [], salesman: [], itemCategory: [], item: [], customerChannel: [], customerCategory: [], customerSubCategory: [], customer: [] }));
                        return;
                      }
                      setSkeleton((s) => ({ ...s, area: true }));
                      try {
                        const area = await subRegionList({ region_id: vals.join(",") });
                        const options = area.data.map((area: { id: string; area_code: string; area_name: string }) => ({ value: String(area.id), label: (area.area_code || "") + (area.area_code && area.area_name ? " - " : "") + area.area_name })) ?? [];
                        setOptions((prev) => ({ ...prev, area: options, warehouse: [], route: [], salesman: [], itemCategory: [], item: [], customerChannel: [], customerCategory: [], customerSubCategory: [], customer: [] }));
                      } catch (e: unknown) {
                        setOptions((prev) => ({ ...prev, area: [], warehouse: [], route: [], salesman: [], itemCategory: [], item: [], customerChannel: [], customerCategory: [], customerSubCategory: [], customer: [] }));
                      } finally {
                        setSkeleton((s) => ({ ...s, area: false }));
                      }
                    }}
                    onBlur={() => setFieldTouched && setFieldTouched('region', true)}
                    error={touched.region ? (errors.region as string) : undefined}
                    showSkeleton={skeleton.region}
                  />
                )}
                {visibleLabels.includes("area") && (
                  <InputFields
                    required
                    label="Area"
                    name="area"
                    isSingle={false}
                    // searchable={true}
                    multiSelectChips={true}
                    value={values.area}
                    options={options.area}
                    onChange={async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
                      const v = e?.target?.value;
                      const vals = normalizeToArray(v);
                      setFieldValue("area", vals);
                      setFieldValue("warehouse", []);
                      if (vals.length === 0) {
                        setOptions((prev) => ({ ...prev, warehouse: [], route: [], salesman: [], itemCategory: [], item: [], customerChannel: [], customerCategory: [], customerSubCategory: [], customer: [] }));
                        return;
                      }
                      setSkeleton((s) => ({ ...s, warehouse: true }));
                      try {
                        const warehouse = await warehouseList({ area_id: vals.join(",") });
                        const options = warehouse.data.map((warehouse: { id: string; warehouse_code: string; warehouse_name: string }) => ({ value: String(warehouse.id), label: (warehouse.warehouse_code || "") + (warehouse.warehouse_code && warehouse.warehouse_name ? " - " : "") + warehouse.warehouse_name })) ?? [];
                        setOptions((prev) => ({ ...prev, warehouse: options, route: [], salesman: [], itemCategory: [], item: [], customerChannel: [], customerCategory: [], customerSubCategory: [], customer: [] }));
                      } catch (e: unknown) {
                        setOptions((prev) => ({ ...prev, warehouse: [], route: [], salesman: [], itemCategory: [], item: [], customerChannel: [], customerCategory: [], customerSubCategory: [], customer: [] }));
                      } finally {
                        setSkeleton((s) => ({ ...s, warehouse: false }));
                      }
                    }}
                    onBlur={() => setFieldTouched && setFieldTouched('area', true)}
                    error={touched.area ? (errors.area as string) : undefined}
                    showSkeleton={skeleton.area}
                  />
                )}
                {visibleLabels.includes("warehouse") && (
                  <InputFields
                    required
                    label="Distributors"
                    name="warehouse"
                    isSingle={false}
                    // searchable={true}
                    multiSelectChips={true}
                    value={values.warehouse}
                    options={options.warehouse}
                    onChange={async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
                      const v = e?.target?.value;
                      const vals = normalizeToArray(v);
                      setFieldValue("warehouse", vals);
                      setFieldValue("route", []);
                      if (vals.length === 0) {
                        setOptions((prev) => ({ ...prev, route: [], salesman: [], itemCategory: [], item: [], customerChannel: [], customerCategory: [], customerSubCategory: [], customer: [] }));
                        return;
                      }
                      setSkeleton((s) => ({ ...s, route: true }));
                      try {
                        const routes = await routeList({ warehouse_id: vals.join(",") });
                        const options = routes.data.map((route: { id: string; route_name: string; route_code: string; }) => ({ value: String(route.id), label: (route.route_code || "") + (route.route_code && route.route_name ? " - " : "") + (route.route_name || "") })) ?? [];
                        setOptions((prev) => ({ ...prev, route: options, salesman: [], itemCategory: [], item: [], customerChannel: [], customerCategory: [], customerSubCategory: [], customer: [] }));
                      } catch (e: unknown) {
                        setOptions((prev) => ({ ...prev, route: [], salesman: [], itemCategory: [], item: [], customerChannel: [], customerCategory: [], customerSubCategory: [], customer: [] }));
                      } finally {
                        setSkeleton((s) => ({ ...s, route: false }));
                      }
                    }}
                    onBlur={() => setFieldTouched && setFieldTouched('warehouse', true)}
                    error={touched.warehouse ? (errors.warehouse as string) : undefined}
                    showSkeleton={skeleton.warehouse}
                  />)}
                {visibleLabels.includes("route") && (
                  <InputFields
                    required
                    label="Route"
                    name="route"
                    isSingle={false}
                    // searchable={true}
                    multiSelectChips={true}
                    value={values.route}
                    options={options.route}
                    onChange={async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
                      const v = e?.target?.value;
                      const vals = normalizeToArray(v);
                      setFieldValue("route", vals);
                      // setFieldValue("itemCategory", []);
                      if (vals.length === 0 || options.itemCategory.length > 0) {
                        setOptions((prev) => ({ ...prev, item: [], customerChannel: [], customerCategory: [], customerSubCategory: [], customer: [] }));
                        return;
                      }
                      setSkeleton((s) => ({ ...s, itemCategory: true }));
                      try {
                        const regions = await itemCategoryList();
                        const options = regions.data.map((region: { id: string; category_code: string; category_name: string }) => ({ value: String(region.id), label: (region.category_code || "") + (region.category_code && region.category_name ? " - " : "") + (region.category_name || "") })) ?? [];
                        setOptions((prev) => ({ ...prev, itemCategory: options, item: [], customerChannel: [], customerCategory: [], customerSubCategory: [], customer: [] }));
                      } catch (e: unknown) {
                        setOptions((prev) => ({ ...prev, itemCategory: [], item: [], customerChannel: [], customerCategory: [], customerSubCategory: [], customer: [] }));
                      } finally {
                        setSkeleton((s) => ({ ...s, itemCategory: false }));
                      }
                    }}
                    onBlur={() => setFieldTouched && setFieldTouched('route', true)}
                    error={touched.route ? (errors.route as string) : undefined}
                    showSkeleton={skeleton.route}
                  />
                )}
                {/* {visibleLabels.includes("salesman") && (
                  <InputFields
                    required
                    label="Salesman"
                    name="salesman"
                    isSingle={false}
                    multiSelectChips={true}
                    value={values.salesman}
                    options={options.salesman}
                    onChange={async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
                      const v = e?.target?.value;
                      const vals = normalizeToArray(v);
                      setFieldValue("salesman", vals);
                      setSkeleton((s) => ({ ...s, itemCategory: true }));
                      try {
                        const regions = await itemCategoryList({ sub_region_id: vals.join(",") });
                        const options = regions.data.map((region: { id: string; name: string }) => ({ value: region.id, label: region.name })) ?? [];
                        setOptions((prev) => ({ ...prev, itemCategory: options, item: [], customerChannel: [], customerCategory: [], customerSubCategory: [], customer: [] }));
                      } catch (e: unknown) {
                        setOptions((prev) => ({ ...prev, itemCategory: [], item: [], customerChannel: [], customerCategory: [], customerSubCategory: [], customer: [] }));
                      } finally {
                        setSkeleton((s) => ({ ...s, itemCategory: false }));
                      }
                    }}
                    onBlur={() => setFieldTouched && setFieldTouched('salesman', true)}
                    error={touched.salesman ? (errors.salesman as string) : undefined}
                  />
                )} */}
                {visibleLabels.includes("item category") && (() => {
                  return (
                    <InputFields
                      required
                      label="Item Category"
                      name="itemCategory"
                      isSingle={false}
                      multiSelectChips={true}
                      value={values.itemCategory || []}
                      options={options.itemCategory}
                      onChange={async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
                        const v = e?.target?.value;
                        const vals = normalizeToArray(v);
                        setFieldValue("itemCategory", vals);
                        setFieldValue("item", []);
                        if (vals.length === 0) {
                          setOptions((prev) => ({ ...prev, item: [], customerChannel: [], customerCategory: [], customerSubCategory: [], customer: [] }));
                          return;
                        }
                        setSkeleton((s) => ({ ...s, item: true }));
                        try {
                          const items = await itemList({ category_id: vals.join(",") });
                          const options = items.data.map((item: { id: string; erp_code: string; name: string }) => ({ value: String(item.id), label: (item.erp_code || "") + (item.erp_code && item.name ? " - " : "") + (item.name || "") })) ?? [];
                          setOptions((prev) => ({ ...prev, item: options, customerChannel: [], customerCategory: [], customerSubCategory: [], customer: [] }));
                        } catch (e: unknown) {
                          setOptions((prev) => ({ ...prev, item: [], customerChannel: [], customerCategory: [], customerSubCategory: [], customer: [] }));
                        } finally {
                          setSkeleton((s) => ({ ...s, item: false }));
                        }
                      }}
                      onBlur={() => setFieldTouched && setFieldTouched('itemCategory', true)}
                      error={touched.itemCategory ? (errors.itemCategory as string) : undefined}
                      showSkeleton={skeleton.itemCategory}
                    />
                  );
                })()}
                {visibleLabels.includes("item") && (() => {
                  return (
                    <InputFields
                      required
                      label="Item"
                      name="item"
                      isSingle={false}
                      multiSelectChips={true}
                      value={values.item || []}
                      options={options.item}
                      onChange={async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
                        const v = e?.target?.value;
                        const vals = normalizeToArray(v);
                        setFieldValue("item", vals);
                        // setFieldValue("customerChannel", []);
                        if (vals.length === 0 || options.customerChannel.length > 0) {
                          setOptions((prev) => ({ ...prev, customerCategory: [], customerSubCategory: [], customer: [] }));
                          return;
                        }
                        setSkeleton((s) => ({ ...s, customerChannel: true }));
                        try {
                          const items = await outletChannelList();
                          const options = items.data.map((item: { id: string; outlet_channel: string; outlet_channel_code: string }) => ({ value: String(item.id), label: (item.outlet_channel_code || "") + (item.outlet_channel_code && item.outlet_channel ? " - " : "") + (item.outlet_channel || "") })) ?? [];
                          setOptions((prev) => ({ ...prev, customerChannel: options, customerCategory: [], customerSubCategory: [], customer: [] }));
                        } catch (e: unknown) {
                          setOptions((prev) => ({ ...prev, customerChannel: [], customerCategory: [], customerSubCategory: [], customer: [] }));
                        } finally {
                          setSkeleton((s) => ({ ...s, customerChannel: false }));
                        }
                      }}
                      onBlur={() => setFieldTouched && setFieldTouched('item', true)}
                      error={touched.item ? (errors.item as string) : undefined}
                      showSkeleton={skeleton.item}
                    />
                  );
                })()}
                {visibleLabels.includes("customer channel") && (() => {
                  return (
                    <InputFields
                      required
                      label="Customer Channel"
                      name="customerChannel"
                      isSingle={false}
                      multiSelectChips={true}
                      value={values.customerChannel || []}
                      options={options.customerChannel}
                      onChange={async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
                        const v = e?.target?.value;
                        const vals = normalizeToArray(v);
                        setFieldValue("customerChannel", vals);
                        setFieldValue("customerCategory", []);
                        if (vals.length === 0) {
                          setOptions((prev) => ({ ...prev, customerCategory: [], customerSubCategory: [], customer: [] }));
                          return;
                        }
                        setSkeleton((s) => ({ ...s, customerCategory: true }));
                        try {
                          const customerCategories = await customerCategoryList({ channel_id: vals.join(",") });
                          const options = customerCategories.data.map((customerCategory: { id: string; customer_category_code: string; customer_category_name: string }) => ({ value: String(customerCategory.id), label: (customerCategory.customer_category_code || "") + (customerCategory.customer_category_code && customerCategory.customer_category_name ? " - " : "") + (customerCategory.customer_category_name || "") })) ?? [];
                          setOptions((prev) => ({ ...prev, customerCategory: options, customerSubCategory: [], customer: [] }));
                        } catch (e: unknown) {
                          setOptions((prev) => ({ ...prev, customerCategory: [], customerSubCategory: [], customer: [] }));
                        } finally {
                          setSkeleton((s) => ({ ...s, customerCategory: false }));
                        }
                      }}
                      onBlur={() => setFieldTouched && setFieldTouched('customerChannel', true)}
                      error={touched.customerChannel ? (errors.customerChannel as string) : undefined}
                      showSkeleton={skeleton.customerChannel}
                    />
                  );
                })()}
                {visibleLabels.includes("customer category") && (() => {
                  return (
                    <InputFields
                      required
                      label="Customer Category"
                      name="customerCategory"
                      isSingle={false}
                      multiSelectChips={true}
                      value={values.customerCategory || []}
                      options={options.customerCategory}
                      onChange={async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
                        const v = e?.target?.value;
                        const vals = normalizeToArray(v);
                        setFieldValue("customerCategory", vals);
                        setFieldValue("customerSubCategory", []);
                        if (vals.length === 0) {
                          setOptions((prev) => ({ ...prev, customerSubCategory: [], customer: [] }));
                          return;
                        }
                        setSkeleton((s) => ({ ...s, customerSubCategory: true }));
                        try {
                          const itemSubCategories = await customerSubCategoryList({ customer_category_id: vals.join(",") });
                          const options = itemSubCategories.data.map((itemSubCategory: { id: string; customer_sub_category_code: string; customer_sub_category_name: string }) => ({ value: String(itemSubCategory.id), label: (itemSubCategory.customer_sub_category_code || "") + (itemSubCategory.customer_sub_category_code && itemSubCategory.customer_sub_category_name ? " - " : "") + (itemSubCategory.customer_sub_category_name || "") })) ?? [];
                          setOptions((prev) => ({ ...prev, customerSubCategory: options, customer: [] }));
                        } catch (e: unknown) {
                          setOptions((prev) => ({ ...prev, customerSubCategory: [], customer: [] }));
                        } finally {
                          setSkeleton((s) => ({ ...s, customerSubCategory: false }));
                        }
                      }}
                      onBlur={() => setFieldTouched && setFieldTouched('customerCategory', true)}
                      error={touched.customerCategory ? (errors.customerCategory as string) : undefined}
                      showSkeleton={skeleton.customerCategory}
                    />
                  );
                })()}
                {visibleLabels.includes("customer sub category") && (() => {
                  return (
                    <InputFields
                      required
                      label="Customer Sub Category"
                      name="customerSubCategory"
                      isSingle={false}
                      multiSelectChips={true}
                      value={values.customerSubCategory || []}
                      options={options.customerSubCategory}
                      onChange={async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
                        const v = e?.target?.value;
                        const vals = normalizeToArray(v);
                        setFieldValue("customerSubCategory", vals);
                        setFieldValue("customer", []);
                        if (vals.length === 0) {
                          setOptions((prev) => ({ ...prev, customer: [] }));
                          return;
                        }
                        setSkeleton((s) => ({ ...s, customer: true }));
                        try {
                          const customers = await agentCustomerList({ subcategory_id: vals.join(",") });
                          const options = customers.data.map((customer: { id: string; osa_code: string; name: string }) => ({ value: customer.id, label: (customer.osa_code || "") + (customer.osa_code && customer.name ? " - " : "") + (customer.name || "") })) ?? [];
                          setOptions((prev) => ({ ...prev, customer: options }));
                        } catch (e: unknown) {
                          setOptions((prev) => ({ ...prev, customer: [] }));
                        } finally {
                          setSkeleton((s) => ({ ...s, customer: false }));
                        }
                      }}
                      onBlur={() => setFieldTouched && setFieldTouched('customerSubCategory', true)}
                      error={touched.customerSubCategory ? (errors.customerSubCategory as string) : undefined}
                      showSkeleton={skeleton.customerSubCategory}
                    />
                  );
                })()}
                {visibleLabels.includes("customer") && (() => {
                  return (
                    <InputFields
                      required
                      label="Customer"
                      name="customer"
                      isSingle={false}
                      multiSelectChips={true}
                      value={values.customer || []}
                      options={options.customer}
                      onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
                        setFieldValue("customer", e?.target?.value);
                      }}
                      onBlur={() => setFieldTouched && setFieldTouched('customer', true)}
                      error={touched.customer ? (errors.customer as string) : undefined}
                      showSkeleton={skeleton.customer}
                    />
                  );
                })()}
              </> : <div className="flex flex-col mt-[10px]"> <Skeleton height={12} /><Skeleton height={12} /><Skeleton height={12} /><Skeleton height={12} /><Skeleton height={12} /></div>}
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
        validateOnMount={true}
        enableReinitialize
        onSubmit={handleSubmit}
      >
        {(formik) => {
          return (
            <Form autoComplete="off">
              <StepperForm
                steps={steps.map((step) => ({
                  ...step,
                  isCompleted: isStepCompleted(step.id),
                }))}
                currentStep={currentStep}
                onBack={prevStep}
                onNext={() => handleNext(formik.values, { setErrors: formik.setErrors, setTouched: formik.setTouched })}
                onSubmit={() => handleSubmit(formik.values, { setErrors: formik.setErrors, setTouched: formik.setTouched })}
                showSubmitButton={isLastStep}
                showNextButton={!isLastStep}
                nextButtonText="Save & Next"
                submitButtonText={formik.isSubmitting ? "Submitting..." : "Submit"}
              >
                {renderStepContent(formik)}
              </StepperForm>
            </Form>
          )
        }}
      </Formik>
    </div>
  );
}