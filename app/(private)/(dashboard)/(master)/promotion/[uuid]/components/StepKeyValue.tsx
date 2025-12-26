import React, { useState, useRef, useMemo } from "react";
import ContainerCard from "@/app/components/containerCard";
import InputFields from "@/app/components/inputFields";
import { KeyComboType } from "../types";
import { importCustomerExcel } from "@/app/services/allApi";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import Popup from "@/app/components/popUp";

type Props = {
  keyCombo: KeyComboType;
  keyValue: Record<string, string[]>;
  setKeyValue: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  locationDropdownMap: Record<string, any[]>;
  customerDropdownMap: Record<string, any[]>;
  extraOptions: any[];
  setExtraOptions: React.Dispatch<React.SetStateAction<any[]>>;
};

export default function StepKeyValue({ keyCombo, keyValue, setKeyValue, locationDropdownMap, customerDropdownMap, extraOptions, setExtraOptions }: Props) {
  const { showSnackbar } = useSnackbar();
  const [uploading, setUploading] = useState(false);
  // const [extraOptions, setExtraOptions] = useState<any[]>([]); // Removed local state
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [missingCodes, setMissingCodes] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      const res = await importCustomerExcel(formData);
      if (res.error) {
        showSnackbar(res.data?.message || "Failed to upload file", "error");
      } else {
        const importedCustomers = Array.isArray(res.data?.customer_details) ? res.data.customer_details : [];
        const missing = Array.isArray(res.data?.missing_customer_codes) ? res.data.missing_customer_codes : [];
        
        if (importedCustomers.length === 0 && missing.length === 0) {
          showSnackbar("No customers found in file", "warning");
        } else {
          setPreviewData(importedCustomers);
          setMissingCodes(missing);
          setShowPreview(true);
        }
      }
    } catch (err) {
      console.error(err);
      showSnackbar("An error occurred during upload", "error");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleConfirmPreview = () => {
    const newOptions = previewData.map((c: any) => ({
      value: String(c.id),
      label: `${c.osa_code || ""} - ${c.business_name || c.name || ""}`
    }));

    setExtraOptions(newOptions);

    setKeyValue(prev => {
      const current = prev[keyCombo.Customer] || [];
      const newIds = newOptions.map((o: any) => o.value);
      const combined = Array.from(new Set([...current, ...newIds]));
      return { ...prev, [keyCombo.Customer]: combined };
    });

    showSnackbar(`Successfully imported ${previewData.length} customers`, "success");
    setShowPreview(false);
    setPreviewData([]);
    setMissingCodes([]);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setPreviewData([]);
    setMissingCodes([]);
  };

  const allCustomerOptions = useMemo(() => {
    const selectedIds = keyValue[keyCombo.Customer] || [];
    const base = (customerDropdownMap["Customer"] || []).filter(item => selectedIds.includes(item.value));
    const validExtra = extraOptions.filter(eo => !base.some(b => b.value === eo.value));
    return [...base, ...validExtra];
  }, [customerDropdownMap, extraOptions, keyValue, keyCombo.Customer]);
  console.log(allCustomerOptions,"allCustomerOptions",keyValue[keyCombo.Customer])

  const hasCustomerData = extraOptions.length > 0 || (keyValue[keyCombo.Customer] && keyValue[keyCombo.Customer].length > 0);

  return (
    <ContainerCard className="bg-[#fff] p-6 rounded-xl border border-[#E5E7EB]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Key Value</h2>
        <div className="text-sm text-gray-500"><span className="text-red-500">*</span> Required</div>
      </div>
      <div className="flex gap-6">
        <div className="flex-1">
          <ContainerCard className="bg-[#fff] border border-[#E5E7EB] rounded-xl p-6">
            <div className="font-semibold text-lg mb-4">Location</div>
            {keyCombo.Location && (
              <div className="mb-4">
                <div className="mb-2 text-base font-medium">
                  {keyCombo.Location}
                  <span className="text-red-500 ml-1">*</span>
                </div>
                <InputFields
                  label=""
                  type="select"
                  isSingle={false}
                  options={locationDropdownMap[keyCombo.Location] ? [{ label: `Select ${keyCombo.Location}`, value: "" }, ...locationDropdownMap[keyCombo.Location]] : [{ label: `Select ${keyCombo.Location}`, value: "" }]}
                  value={keyValue[keyCombo.Location] || ""}
                  onChange={e => {
                    const valueFromEvent = e.target.value;
                    let selectedValues: string[];
                    if (Array.isArray(valueFromEvent)) {
                      selectedValues = valueFromEvent;
                    } else {
                      selectedValues = valueFromEvent ? [String(valueFromEvent)] : [];
                    }
                    setKeyValue(s => ({ ...s, [keyCombo.Location]: selectedValues.filter(val => val !== "") }));
                  }}
                  width="w-full"
                />
              </div>
            )}
          </ContainerCard>
        </div>
        {keyCombo.Customer && (
          <div className="flex-1">
            <ContainerCard className="bg-[#fff] border border-[#E5E7EB] rounded-xl p-6">
              <div className="font-semibold text-lg mb-4">Customer</div>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                   <div className="text-base font-medium">
                    {keyCombo.Customer}
                    <span className="text-red-500 ml-1">*</span>
                   </div>
                   {keyCombo.Customer === "Customer" && (
                    <>
                      <input
                        type="file"
                        accept=".xlsx, .xls, .csv"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                      {hasCustomerData && (
                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              setExtraOptions([]);
                              setKeyValue(prev => ({ ...prev, [keyCombo.Customer]: [] }));
                            }}
                            className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800"
                          >
                            <Icon icon="lucide:trash-2" width={16} />
                            Clear List
                          </button>
                          <a
                            href="/demo_customer_import.csv"
                            download="customer_import_sample.csv"
                            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
                          >
                            <Icon icon="lucide:download" width={16} />
                            Sample
                          </a>
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
                          >
                            <Icon icon="lucide:upload" width={16} />
                            {uploading ? "Uploading..." : "Bulk Upload"}
                          </button>
                        </div>
                      )}
                    </>
                   )}
                </div>
                {keyCombo.Customer === "Customer" ? (
                  !hasCustomerData ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center gap-3">
                      <div className="text-gray-500 text-sm text-center">
                        Please upload an Excel file to select customers.
                      </div>
                      <div className="flex gap-3">
                        <a
                          href="/demo_customer_import.csv"
                          download="customer_import_sample.csv"
                          className="flex items-center gap-1 px-3 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-medium transition-colors"
                        >
                          <Icon icon="lucide:download" width={16} />
                          Download Sample
                        </a>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                          className="flex items-center gap-1 px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Icon icon="lucide:upload" width={16} />
                          {uploading ? "Uploading..." : "Upload File"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <InputFields
                      label=""
                      type="select"
                      isSingle={false}
                      multiSelectChips={true}
                      searchable={true}
                      options={allCustomerOptions}
                      value={keyValue[keyCombo.Customer] || []}
                      onChange={e => {
                        const valueFromEvent = e.target.value;
                        let selectedValues: string[];
                        if (Array.isArray(valueFromEvent)) {
                          selectedValues = valueFromEvent;
                        } else {
                          selectedValues = valueFromEvent ? [String(valueFromEvent)] : [];
                        }
                        setKeyValue(s => ({ ...s, [keyCombo.Customer]: selectedValues.filter(val => val !== "") }));
                      }}
                      width="w-full"
                    />
                  )
                ) : (
                  <InputFields
                    label=""
                    type="select"
                    isSingle={false}
                    options={customerDropdownMap[keyCombo.Customer] ? [{ label: `Select ${keyCombo.Customer}`, value: "" }, ...customerDropdownMap[keyCombo.Customer]] : [{ label: `Select ${keyCombo.Customer}`, value: "" }]}
                    value={keyValue[keyCombo.Customer] || []}
                    onChange={e => {
                      const valueFromEvent = e.target.value;
                      let selectedValues: string[];
                      if (Array.isArray(valueFromEvent)) {
                        selectedValues = valueFromEvent;
                      } else {
                        selectedValues = valueFromEvent ? [String(valueFromEvent)] : [];
                      }
                      setKeyValue(s => ({ ...s, [keyCombo.Customer]: selectedValues.filter(val => val !== "") }));
                    }}
                    width="w-full"
                  />
                )}
              </div>
            </ContainerCard>
          </div>
        )}
      </div>

      <Popup isOpen={showPreview} onClose={handleClosePreview}>
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Preview Imported Customers</h3>
            <button onClick={handleClosePreview} className="text-gray-500 hover:text-gray-700">
              <Icon icon="lucide:x" width={20} />
            </button>
          </div>
          
          {previewData.length > 0 && (
            <div className="overflow-auto max-h-[40vh] border border-gray-200 rounded-md">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3">Code</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Warehouse</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((customer, index) => (
                    <tr key={index} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{customer.osa_code || "-"}</td>
                      <td className="px-4 py-3">{customer.business_name || customer.name || "-"}</td>
                      <td className="px-4 py-3">{customer.warehouse_name || customer.warehouse_code || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {missingCodes.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex items-center gap-2 text-red-700 font-semibold mb-2">
                <Icon icon="lucide:alert-circle" width={18} />
                <span>Missing Customers ({missingCodes.length})</span>
              </div>
              <p className="text-xs text-red-600 mb-2">The following codes were not found in the system and will be skipped:</p>
              <div className="flex flex-wrap gap-2">
                {missingCodes.map((code, idx) => (
                  <span key={idx} className="bg-red-100 text-red-800 text-[10px] px-2 py-1 rounded font-mono">
                    {code}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-2">
            <button
              onClick={handleClosePreview}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmPreview}
              disabled={previewData.length === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm Import
            </button>
          </div>
        </div>
      </Popup>
    </ContainerCard>
  );
}
