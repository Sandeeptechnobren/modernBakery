"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { promotionHeaderById } from "@/app/services/allApi";
import ContainerCard from "@/app/components/containerCard";
import KeyValueData from "@/app/components/keyValueData";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import { useLoading } from "@/app/services/loadingContext";
import Loading from "@/app/components/Loading";
import StatusBtn from "@/app/components/statusBtn2";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";

export default function PromotionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const uuid = Array.isArray(params.uuid) ? params.uuid[0] : (params.uuid as string);
  const [promotion, setPromotion] = useState<any>(null);
  const { setLoading } = useLoading();
  const [internalLoading, setInternalLoading] = useState(true);
  const { showSnackbar } = useSnackbar();

  const {
    companyOptions, regionOptions, warehouseOptions, areaOptions,
    channelOptions, customerCategoryOptions, customerSubCategoryOptions, agentCustomerOptions,
    itemCategoryOptions, itemOptions, salesmanTypeOptions, projectOptions, uomOptions,
    ensureCompanyLoaded, ensureRegionLoaded, ensureWarehouseLoaded, ensureAreaLoaded,
    ensureChannelLoaded, ensureCustomerCategoryLoaded, ensureCustomerSubCategoryLoaded, ensureAgentCustomerLoaded,
    ensureItemCategoryLoaded, ensureItemLoaded, ensureSalesmanTypeLoaded, ensureProjectLoaded, ensureUomLoaded
  } = useAllDropdownListData();

  useEffect(() => {
    ensureCompanyLoaded();
    ensureRegionLoaded();
    ensureWarehouseLoaded();
    ensureAreaLoaded();
    ensureChannelLoaded();
    ensureCustomerCategoryLoaded();
    ensureCustomerSubCategoryLoaded();
    ensureAgentCustomerLoaded();
    ensureItemCategoryLoaded();
    ensureItemLoaded();
    ensureSalesmanTypeLoaded();
    ensureProjectLoaded();
    ensureUomLoaded();
  }, []);

  const getLabel = (value: string | number, options: any[]) => {
    const opt = options.find(o => String(o.value) === String(value));
    return opt ? opt.label : value;
  };

  const getLocationOptions = (type: string) => {
    switch (type) {
      case "Company": return companyOptions;
      case "Region": return regionOptions;
      case "Warehouse": return warehouseOptions;
      case "Area": return areaOptions;
      default: return [];
    }
  };

  const getCustomerOptions = (type: string) => {
    switch (type) {
      case "Channel": return channelOptions;
      case "Customer Category": return customerCategoryOptions;
      case "Customer SubCategory": return customerSubCategoryOptions;
      case "Customer": return agentCustomerOptions;
      default: return [];
    }
  };

  useEffect(() => {
    if (!uuid) return;
    const fetchDetails = async () => {
      setInternalLoading(true);
      try {
        const res = await promotionHeaderById(uuid);
        if (res.error) {
          showSnackbar(res.data?.message || "Unable to fetch promotion details", "error");
          router.push("/promotion");
          return;
        }
        setPromotion(res.data);
      } catch (error) {
        showSnackbar("Unable to fetch promotion details", "error");
        router.push("/promotion");
      } finally {
        setInternalLoading(false);
      }
    };
    fetchDetails();
  }, [uuid, router, showSnackbar]);

  if (internalLoading) return <Loading />;

  const locationType = promotion?.key?.Location?.[0];
  const customerType = promotion?.key?.Customer?.[0];
  const itemType = promotion?.key?.Item?.[0];

  return (
    <div className="pb-10 bg-[#F9FAFB] min-h-screen">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 rounded-lg bg-white border border-[#E9EAEB] hover:bg-gray-50 transition-all cursor-pointer shadow-sm">
          <Icon icon="lucide:arrow-left" width={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#181D27]">Promotion Details</h1>
          <p className="text-sm text-gray-500">View configuration and scope for this promotional campaign</p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Top Row: Main Info & Logic */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ContainerCard className="lg:col-span-2 shadow-sm border-[#E9EAEB]">
            <div className="flex items-center gap-2 text-lg font-bold text-[#181D27] mb-6 border-b border-[#F2F4F7] pb-3">
              <Icon icon="lucide:info" className="text-primary" />
              General Information
            </div>
            <KeyValueData
              data={[
                { key: "Promotion Name", value: <span className="font-bold text-[#181D27]">{promotion?.promotion_name || "-"}</span> },
                { key: "Active Period", value: `${promotion?.from_date?.split('T')[0] || "-"} to ${promotion?.to_date?.split('T')[0] || "-"}` },
                { key: "Campaign Mode", value: <span className="capitalize px-2 py-0.5 bg-gray-100 rounded text-gray-700 font-medium">{promotion?.bundle_combination || "-"}</span> },
                { key: "Logic Type", value: <span className="capitalize font-medium text-gray-700">{promotion?.promotion_type || "-"}</span> },
                {
                  key: "Operational Status",
                  value: <StatusBtn isActive={String(promotion?.status) === "1"} />
                },
              ]}
            />
          </ContainerCard>

          <ContainerCard className="shadow-sm border-[#E9EAEB]">
            <div className="flex items-center gap-2 text-lg font-bold text-[#181D27] mb-6 border-b border-[#F2F4F7] pb-3">
              <Icon icon="lucide:layers" className="text-primary" />
              Key Combination
            </div>
            <div className="flex flex-col gap-3 py-1">
              <div className="flex items-center justify-between p-3 bg-blue-50/50 rounded-xl border border-blue-100 transition-all hover:bg-blue-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg"><Icon icon="lucide:map-pin" className="text-blue-600" /></div>
                  <span className="text-sm font-semibold text-blue-900">Location</span>
                </div>
                <span className="text-sm font-bold text-blue-700">{locationType || "None"}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50/50 rounded-xl border border-green-100 transition-all hover:bg-green-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg"><Icon icon="lucide:users" className="text-green-600" /></div>
                  <span className="text-sm font-semibold text-green-900">Customer</span>
                </div>
                <span className="text-sm font-bold text-green-700">{customerType || "None"}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50/50 rounded-xl border border-orange-100 transition-all hover:bg-orange-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg"><Icon icon="lucide:package" className="text-orange-600" /></div>
                  <span className="text-sm font-semibold text-orange-900">Item Scope</span>
                </div>
                <span className="text-sm font-bold text-orange-700">{itemType || "None"}</span>
              </div>
            </div>
          </ContainerCard>
        </div>

        {/* Middle Row: Selection Scopes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ContainerCard className="shadow-sm border-[#E9EAEB]">
            <div className="flex items-center justify-between mb-4 border-b border-[#F2F4F7] pb-3">
              <div className="text-base font-bold text-[#344054]">Applied Locations</div>
              <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">{promotion?.location?.length || 0}</span>
            </div>
            <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
              {promotion?.location?.map((id: any, i: number) => (
                <span key={i} className="bg-white text-[#344054] px-2.5 py-1 rounded-md text-[11px] border border-[#D0D5DD] shadow-xs font-medium">
                  {getLabel(id, getLocationOptions(locationType))}
                </span>
              )) || <span className="text-gray-400 text-sm italic">No locations found</span>}
            </div>
          </ContainerCard>

          <ContainerCard className="shadow-sm border-[#E9EAEB]">
            <div className="flex items-center justify-between mb-4 border-b border-[#F2F4F7] pb-3">
              <div className="text-base font-bold text-[#344054]">Target Customers</div>
              <span className="bg-green-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">{promotion?.customer?.length || 0}</span>
            </div>
            <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
              {promotion?.customer?.map((id: any, i: number) => (
                <span key={i} className="bg-white text-[#344054] px-2.5 py-1 rounded-md text-[11px] border border-[#D0D5DD] shadow-xs font-medium">
                  {getLabel(id, getCustomerOptions(customerType))}
                </span>
              )) || <span className="text-gray-400 text-sm italic">No customers found</span>}
            </div>
          </ContainerCard>

          <ContainerCard className="shadow-sm border-[#E9EAEB]">
            <div className="flex items-center justify-between mb-4 border-b border-[#F2F4F7] pb-3">
              <div className="text-base font-bold text-[#344054]">{itemType}</div>
              <span className="bg-orange-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">
                {(promotion?.items?.length || 0) + (promotion?.item_category?.length || 0)}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
              {promotion?.items?.map((id: any, i: number) => (
                <span key={i} className="bg-white text-[#344054] px-2.5 py-1 rounded-md text-[11px] border border-[#D0D5DD] shadow-xs font-medium">
                  {getLabel(id, itemOptions)}
                </span>
              ))}
              {promotion?.item_category?.map((id: any, i: number) => (
                <span key={i} className="bg-[#FFF9F5] text-orange-800 px-2.5 py-1 rounded-md text-[11px] border border-orange-200 shadow-xs font-bold uppercase">
                  {getLabel(id, itemCategoryOptions)} (Cat)
                </span>
              ))}
              {(!promotion?.items?.length && !promotion?.item_category?.length) && <span className="text-gray-400 text-sm italic">No items found</span>}
            </div>
          </ContainerCard>
        </div>

        {/* Bottom Row: Detailed Rules & Free Gifts */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 flex flex-col gap-6">
            {promotion?.promotion_details?.length > 0 && (
              <ContainerCard className="shadow-sm border-[#E9EAEB]">
                <div className="text-lg font-bold text-[#181D27] mb-4 flex items-center gap-2">
                  <Icon icon="lucide:calculator" className="text-primary" />
                  Slab & Range Configuration
                </div>
                <div className="overflow-hidden rounded-xl border border-[#EAECF0] shadow-xs">
                  <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-[#F9FAFB] text-[#475467] text-xs uppercase font-bold tracking-wider">
                      <tr>
                        <th className="px-6 py-4 border-b border-[#EAECF0]">From Qty</th>
                        <th className="px-6 py-4 border-b border-[#EAECF0]">To Qty</th>
                        <th className="px-6 py-4 border-b border-[#EAECF0] text-red-600">Free Qty Reward</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAECF0] bg-white">
                      {promotion.promotion_details.map((detail: any, i: number) => (
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-semibold text-[#101828]">{detail.from_qty}</td>
                          <td className="px-6 py-4 font-semibold text-[#101828]">{detail.to_qty}</td>
                          <td className="px-6 py-4 font-bold text-red-600 bg-red-50/20">{detail.free_qty}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ContainerCard>
            )}

            {promotion?.percentage_discounts?.length > 0 && (
              <ContainerCard className="shadow-sm border-[#E9EAEB]">
                <div className="text-lg font-bold text-[#181D27] mb-4 flex items-center gap-2">
                  <Icon icon="lucide:percent" className="text-green-600" />
                  Applied Discounts
                </div>
                <div className="overflow-hidden rounded-xl border border-[#EAECF0] shadow-xs">
                  <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-[#F9FAFB] text-[#475467] text-xs uppercase font-bold tracking-wider">
                      <tr>
                        <th className="px-6 py-4 border-b border-[#EAECF0]">Item / Category Target</th>
                        <th className="px-6 py-4 border-b border-[#EAECF0]">Discount Benefit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAECF0] bg-white">
                      {promotion.percentage_discounts.map((pd: any, i: number) => (
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-[#101828]">
                            {pd.percentage_item_id ? getLabel(pd.percentage_item_id, itemOptions) :
                              pd.percentage_item_category ? getLabel(pd.percentage_item_category, itemCategoryOptions) : "-"}
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-bold text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-100">{pd.percentage}%</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ContainerCard>
            )}

            {promotion?.offer_items?.length > 0 && (
              <ContainerCard className="shadow-sm border-[#E9EAEB]">
                <div className="text-lg font-bold text-[#181D27] mb-4 flex items-center gap-2">
                  <Icon icon="lucide:gift" className="text-purple-600" />
                  Free Gift Entitlements
                </div>
                <div className="overflow-hidden rounded-xl border border-[#EAECF0] shadow-xs">
                  <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-[#F9FAFB] text-[#475467] text-xs uppercase font-bold tracking-wider">
                      <tr>
                        <th className="px-6 py-4 border-b border-[#EAECF0]">Gift Product</th>
                        <th className="px-6 py-4 border-b border-[#EAECF0]">UOM</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAECF0] bg-white">
                      {promotion.offer_items.map((item: any, i: number) => (
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-bold text-[#101828]">
                            {getLabel(item.item_id, itemOptions)}
                          </td>
                          <td className="px-6 py-4 font-medium text-[#475467] uppercase">{getLabel(item.uom, uomOptions)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ContainerCard>
            )}
          </div>

          <div className="lg:col-span-1">
            <ContainerCard className="h-full shadow-sm border-[#E9EAEB]">
              <div className="text-lg font-bold text-[#181D27] mb-6 border-b border-[#F2F4F7] pb-3">Campaign Meta</div>
              <div className="flex flex-col gap-8 py-2">
                <div className="group">
                  <div className="text-[10px] text-gray-400 uppercase font-extrabold mb-2 tracking-widest group-hover:text-primary transition-colors">Sales Team Assignment</div>
                  <div className="text-sm font-semibold text-[#344054] leading-relaxed">
                    {(Array.isArray(promotion?.sales_team_type) ? promotion.sales_team_type : [promotion?.sales_team_type])
                      .map((id: any) => getLabel(id, salesmanTypeOptions)).join(", ") || <span className="text-gray-300 font-normal italic">No teams assigned</span>}
                  </div>
                </div>
                <div className="group">
                  <div className="text-[10px] text-gray-400 uppercase font-extrabold mb-2 tracking-widest group-hover:text-primary transition-colors">Project Linkage</div>
                  <div className="text-sm font-semibold text-[#344054] leading-relaxed">
                    {(Array.isArray(promotion?.project_list) ? promotion.project_list : [promotion?.project_list])
                      .map((id: any) => getLabel(id, projectOptions)).join(", ") || <span className="text-gray-300 font-normal italic">No project links</span>}
                  </div>
                </div>
                <div className="group">
                  <div className="text-[10px] text-gray-400 uppercase font-extrabold mb-2 tracking-widest group-hover:text-primary transition-colors">UOM</div>
                  <div className="inline-flex px-4 py-1.5 bg-[#F2F4F7] rounded-lg font-black text-[#1D2939] border border-[#D0D5DD] uppercase shadow-inner">
                    {getLabel(promotion?.uom, uomOptions)}
                  </div>
                </div>
              </div>
            </ContainerCard>
          </div>
        </div>
      </div>
    </div>
  );
}