"use client";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import InputFields from "@/app/components/inputFields";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { addRegion, countryList } from "@/app/services/allApi";
export default function AddUser() {
const [countries, setCountries] = useState<{ value: string; label: string }[]>([]);
const [country, setCountry] = useState("");
  type ApiCountry = {
    id?: string;
    code?: string;
    name?: string;
    country_name?: string;
    currency?: string;
  };
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const countryRes = await countryList({
          page: "",
          limit: "",
        });
        const countryOptions = countryRes.data.map((c: ApiCountry) => ({
          value: c.id ?? "",
          label: c.id ?? c.name ?? "",
        }));
        setCountries(countryOptions);

      } catch (error) {
        console.error("Failed to fetch dropdown data ❌", error);
      }
    };
    fetchDropdowns();
  }, []);
  const [roleType, setRoleType] = useState("");
  const [status, setStatus] = useState<number>(1); // 1 = Active, 2 = Inactive
  const [popupMessage, setPopupMessage] = useState<string | null>(null); // for popup
  // default null

  // API call function
  const handleSubmit = async () => {
    try {
      const payload = {
        region_name: roleType,
        status: (status),
        country_id: Number(country),
      };
      const response = await addRegion(payload); // Axios call
      // Check payload success
      const { message, access_token, success } = response.data;
      if (success || response.status === 201) {
        if (access_token) localStorage.setItem("token", access_token);
        setPopupMessage(`✅ Success: ${message || "Region added successfully!"}`);
        setRoleType("");
        setStatus(1);
        console.log(56);
      } else {
        setPopupMessage(`❌ Error: ${message || "Something went wrong"}`);
        console.log(60);
        console.log(response.status);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("API Error:", error.message);
        setPopupMessage(`❌ Error: ${error.message}`);
        console.log(68);
      } else {
        console.error("API Error:", error);
        setPopupMessage("❌ Error: Unable to connect to server");
        console.log(72);
      }
    }
  };
  return (
    <>
      {/* Header */}
      <div className="w-full h-full overflow-x-hidden p-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/settings/user">
              <Icon icon="lucide:arrow-left" width={24} />
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">Add User Types</h1>
          </div>
        </div>
        {/* Content */}
        <div>
          {/* Additional Information */}
          <div className="bg-white rounded-2xl shadow divide-y divide-gray-200">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-800 mb-4">
                Additional Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <InputFields
                    label="Region Name"
                    value={roleType}
                    onChange={(e) => setRoleType(e.target.value)}
                  />
                </div>
                  <div>
                    <InputFields
                      label="Status"
                      value={status.toString()} // convert number to string
                      onChange={(e) => setStatus(Number(e.target.value))} // convert string → number
                      options={[
                        { value: "1", label: "Active" },
                        { value: "0", label: "Inactive" },
                      ]}
                    />
                </div>
                 <div>
                    <InputFields
                      name="country"
                      label="Country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      options={countries}
                    />
                  </div>

              </div>
            </div>
          </div>
          {/* Buttons */}
          <div className="flex justify-end gap-4 mt-6 pr-0">
            <button
              type="button"
              className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
              onClick={() => {
                setRoleType("");      // reset to empty string
                setStatus(1);     // or false if you want default inactive
                setPopupMessage(null);
              }}
            >
              Cancel
            </button>
            <SidebarBtn
              label="Submit"
              isActive={true}
              leadingIcon="mdi:check"
              onClick={handleSubmit}
            />
          </div>
        </div>
      </div>
      {/* Popup */}
      {popupMessage && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96 text-center">
            <p className="text-gray-800 mb-4">{popupMessage}</p>
            <button
              onClick={() => setPopupMessage(null)}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
}
