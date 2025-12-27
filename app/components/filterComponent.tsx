import { useEffect, useState } from "react";
import { useAllDropdownListData } from "./contexts/allDropdownListData";
import { FilterRendererProps } from "./customTable";

// Extend props to allow specifying which filters to show
type FilterComponentProps = FilterRendererProps & {
  onlyFilters?: string[]; // e.g. ['warehouse_id', 'company_id']
};
import SidebarBtn from "./dashboardSidebarBtn";
import InputFields from "./inputFields";
import { regionList, subRegionList, warehouseList, routeList } from "@/app/services/allApi";

type DropdownOption = {
  value: string;
  label: string;
};

type Region = {
  id: number;
  region_name?: string;
  name?: string;
};

type Area = {
  id: number;
  area_name?: string;
  name?: string;
};

type Warehouse = {
  id: number;
  warehouse_name?: string;
  warehouse_code?: string;
  name?: string;
  code?: string;
};

type Route = {
  id: number;
  route_name?: string;
  name?: string;
};

type ApiResponse<T> = {
  data?: T;
  error?: boolean;
  message?: string;
};

export default function FilterComponent(filterProps: FilterComponentProps) {
  const {
    customerSubCategoryOptions,
    companyOptions,
    salesmanOptions,
    channelOptions,
    ensureCompanyLoaded,
    ensureSalesmanLoaded
  } = useAllDropdownListData();
  const { onlyFilters } = filterProps;

  useEffect(() => {
    ensureCompanyLoaded();
    ensureSalesmanLoaded();
  }, [ensureCompanyLoaded,
    ensureSalesmanLoaded]);
  const [skeleton, setSkeleton] = useState({
    company: false,
    region: false,
    area: false,
    warehouse: false,
    route: false, 
    salesteam: false,
  });
  const [regionOptions, setRegionOptions] = useState<DropdownOption[]>([]);
  const [areaOptions, setAreaOptions] = useState<DropdownOption[]>([]);
  const [warehouseOptions, setWarehouseOptions] = useState<DropdownOption[]>([]);
  const [routeOptions, setRouteOptions] = useState<DropdownOption[]>([]);

  const {
    payload,
    setPayload,
    submit,
    clear,
    activeFilterCount,
    isApplying,
    isClearing,
  } = filterProps;

  const onChangeArray = (key: string, value: any) => {
    setPayload((prev) => ({ ...prev, [key]: value }));
  };

  const toArray = (v: any) => {
    if (Array.isArray(v)) return v;
    if (typeof v === "string") return v.split(",").filter(Boolean);
    if (typeof v === "number") return [String(v)];
    return [];
  };

  const companyVal = toArray(payload.company_id);
  const regionVal = toArray(payload.region_id);
  const areaVal = toArray(payload.sub_region_id);
  const warehouseVal = toArray(payload.warehouse_id);
  const routeVal = toArray(payload.route_id);
  const salesVal = toArray(payload.salesman_id);

  // ✅ When Company changes → Fetch Regions
  useEffect(() => {
    if (!companyVal.length) {
      setRegionOptions([]);
      return;
    }

    const fetchRegions = async () => {
        setSkeleton((prev) => ({ ...prev, region: true }));
      try {
        const regions: ApiResponse<Region[]> = await regionList({
          company_id: companyVal.join(","),
          dropdown: "true",
        });
        setRegionOptions(
          regions?.data?.map((r: Region) => ({
            value: String(r.id),
            label: r.region_name || r.name || "",
          })) || []
        );
      } catch (err) {
        console.error("Failed to fetch region list:", err);
        setRegionOptions([]);
      }
        setSkeleton((prev) => ({ ...prev, region: false }));
    };

    fetchRegions();
  }, [companyVal.join(",")]);

  // ✅ When Region changes → Fetch Areas
  useEffect(() => {
    if (!regionVal.length) {
      setAreaOptions([]);
      return;
    }

    const fetchAreas = async () => {
        setSkeleton((prev) => ({ ...prev, area: true }));
    
      try {
        const res: ApiResponse<{ data: Area[] } | Area[]> = await subRegionList(
          { region_id: regionVal.join(","),dropdown:"true" }
        );
        const areaList =
          (res as { data: Area[] })?.data || (res as Area[]) || [];

        setAreaOptions(
          areaList.map((a: Area) => ({
            value: String(a.id),
            label: a.area_name || a.name || "",
          }))
        );
      } catch (err) {
        console.error("Failed to fetch area list:", err);
        setAreaOptions([]);
      }
        setSkeleton((prev) => ({ ...prev, area: false }));
    };

    fetchAreas();
  }, [regionVal.join(",")]);

  useEffect(() => {
    if (!areaVal.length) {
      setWarehouseOptions([]);
      return;
    }

    const fetchWarehouses = async () => {
        setSkeleton((prev) => ({ ...prev, warehouse: true }));

      try {
        const res: ApiResponse<{ data: Warehouse[] } | Warehouse[]> =
          await warehouseList({ area_id: areaVal.join(","),dropdown:"true" });
        const warehousesList =
          (res as { data: Warehouse[] })?.data || (res as Warehouse[]) || [];

        setWarehouseOptions(
          warehousesList.map((w: Warehouse) => ({
            value: String(w.id),
            label: `${w.warehouse_code || w.code || "-"} - ${w.warehouse_name || w.name || ""}`,
          }))
        );
      } catch (err) {
        console.error("Failed to fetch warehouse list:", err);
        setWarehouseOptions([]);
      }
        setSkeleton((prev) => ({ ...prev, warehouse: false }));

    };

    fetchWarehouses();
  }, [areaVal.join(",")]);

  // ✅ When Warehouse changes → Fetch Routes
  useEffect(() => {
    if (!warehouseVal.length) {
      setRouteOptions([]);
      return;
    }

    const fetchRoutes = async () => {
        setSkeleton((prev) => ({ ...prev, route: true }));
      try {
        const res: ApiResponse<{ data: Route[] } | Route[]> = await routeList({
          warehouse_id: warehouseVal.join(","),
          dropdown:"true",
        });
        const routeListData =
          (res as { data: Route[] })?.data || (res as Route[]) || [];

        setRouteOptions(
          routeListData.map((r: Route) => ({
            value: String(r.id),
            label: r.route_name || r.name || "",
          }))
        );
      } catch (err) {
        console.error("Failed to fetch route list:", err);
        setRouteOptions([]);
      }
        setSkeleton((prev) => ({ ...prev, route: false }));
    };

    fetchRoutes();
  }, [warehouseVal.join(",")]);

  console.log("FilterComponent payload:", payload);

  // Helper to check if a filter should be shown
  const showFilter = (key: string) => {
    if (!onlyFilters) return true;
    return onlyFilters.includes(key);
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Start Date */}
      {showFilter("from_date") && (
        <InputFields
          label="Start Date"
          name="from_date"
          type="date"
          value={
            typeof payload.from_date === "number"
              ? String(payload.from_date)
              : (payload.from_date as string | undefined) ?? ""
          }
          onChange={(e) => {
            const raw = (e as any)?.target?.value ?? e;
            setPayload((prev) => ({ ...prev, from_date: raw }));
          }}
        />
      )}
      {/* End Date */}
      {showFilter("to_date") && (
        <InputFields
          label="End Date"
          name="to_date"
          type="date"
          min={typeof payload.from_date === "number" ? String(payload.from_date) : (payload.from_date as string | undefined) ?? ""}
          value={
            typeof payload.to_date === "number"
              ? String(payload.to_date)
              : (payload.to_date as string | undefined) ?? ""
          }
          disabled={!payload.from_date}
          onChange={(e) => {
            const raw = (e as any)?.target?.value ?? e;
            setPayload((prev) => ({ ...prev, to_date: raw }));
          }}
        />
      )}
      {/* Company */}
      {showFilter("company_id") && (
        <InputFields
          label="Company"
          name="company_id"
          type="select"
          searchable={true}
          isSingle={false}
          multiSelectChips
          showSkeleton={skeleton.company}
          options={Array.isArray(companyOptions) ? companyOptions : []}
          value={companyVal as any}
          onChange={(e) => {
            const raw = (e as any)?.target?.value ?? e;
            const val = Array.isArray(raw)
              ? raw
              : typeof raw === "string"
              ? raw.split(",").filter(Boolean)
              : [];
            onChangeArray("company_id", val);
            // reset downstream when parent changes
            onChangeArray("region_id", []);
            onChangeArray("sub_region_id", []);
            onChangeArray("warehouse_id", []);
            onChangeArray("route_id", []);
          }}
        />
      )}
      {/* Region */}
      {showFilter("region_id") && (
        <InputFields
          label="Region"
          name="region_id"
          type="select"
          searchable={true}
          isSingle={false}
          multiSelectChips
          showSkeleton={skeleton.region}
          disabled={companyVal.length === 0}
          options={Array.isArray(regionOptions) ? regionOptions : []}
          value={regionVal as any}
          onChange={(e) => {
            const raw = (e as any)?.target?.value ?? e;
            const val = Array.isArray(raw)
              ? raw
              : typeof raw === "string"
              ? raw.split(",").filter(Boolean)
              : [];
            onChangeArray("region_id", val);
            onChangeArray("sub_region_id", []);
            onChangeArray("warehouse_id", []);
            onChangeArray("route_id", []);
          }}
        />
      )}
      {/* Area */}
      {showFilter("sub_region_id") && (
        <InputFields
          label="Area"
          name="sub_region_id"
          type="select"
          searchable={true}
          isSingle={false}
          multiSelectChips
          showSkeleton={skeleton.area}
          disabled={regionVal.length === 0}
          options={Array.isArray(areaOptions) ? areaOptions : []}
          value={areaVal as any}
          onChange={(e) => {
            const raw = (e as any)?.target?.value ?? e;
            const val = Array.isArray(raw)
              ? raw
              : typeof raw === "string"
              ? raw.split(",").filter(Boolean)
              : [];
            onChangeArray("sub_region_id", val);
            onChangeArray("warehouse_id", []);
            onChangeArray("route_id", []);
          }}
        />
      )}
      {/* Distributor */}
      {showFilter("warehouse_id") && (
        <InputFields
          label="Distributor"
          name="warehouse_id"
          type="select"
          searchable={true}
          isSingle={false}
          multiSelectChips
          showSkeleton={skeleton.warehouse}
          disabled={areaVal.length === 0 || areaOptions.length === 0}
          options={Array.isArray(warehouseOptions) ? warehouseOptions : []}
          value={warehouseVal as any}
          onChange={(e) => {
            const raw = (e as any)?.target?.value ?? e;
            const val = Array.isArray(raw)
              ? raw
              : typeof raw === "string"
              ? raw.split(",").filter(Boolean)
              : [];
            onChangeArray("warehouse_id", val);
            onChangeArray("route_id", []);
          }}
        />
      )}
      {/* Route */}
      {showFilter("route_id") && (
        <InputFields
          label="Route"
          name="route_id"
          type="select"
          searchable={true}
          isSingle={false}
          multiSelectChips
          showSkeleton={skeleton.route}
          disabled={warehouseVal.length === 0}
          options={Array.isArray(routeOptions) ? routeOptions : []}
          value={routeVal as any}
          onChange={(e) => {
            const raw = (e as any)?.target?.value ?? e;
            const val = Array.isArray(raw)
              ? raw
              : typeof raw === "string"
              ? raw.split(",").filter(Boolean)
              : [];
            onChangeArray("route_id", val);
          }}
        />
      )}
      {/* Sales Team */}
      {showFilter("salesman_id") && (
        <InputFields
          label="Sales Team"
          name="salesman_id"
          type="select"
          searchable={true}
          isSingle={false}
          multiSelectChips
          showSkeleton={skeleton.salesteam}
          disabled={routeVal.length === 0}
          options={Array.isArray(salesmanOptions) ? salesmanOptions : []}
          value={salesVal as any}
          onChange={(e) => {
            const raw = (e as any)?.target?.value ?? e;
            const val = Array.isArray(raw)
              ? raw
              : typeof raw === "string"
              ? raw.split(",").filter(Boolean)
              : [];
            onChangeArray("salesman_id", val);
          }}
        />
      )}
      {/* Buttons */}
      <div className="col-span-2 flex justify-end gap-2 mt-2">
        <SidebarBtn
          isActive={false}
          type="button"
          onClick={() => clear()}
          label="Clear All"
          buttonTw="px-3 py-2 h-9"
          disabled={isClearing || activeFilterCount === 0}
        />
        <SidebarBtn
          isActive={true}
          type="button"
          onClick={() => submit(payload)}
          label="Apply Filter"
          buttonTw="px-4 py-2 h-9"
          disabled={isApplying || activeFilterCount === 0}
        />
      </div>
    </div>
  );
}
