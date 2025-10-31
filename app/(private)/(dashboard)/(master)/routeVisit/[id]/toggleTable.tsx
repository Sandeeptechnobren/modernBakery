"use client";
import ContainerCard from "@/app/components/containerCard";
import Loading from "@/app/components/Loading";
import { getRouteVisitList } from "@/app/services/allApi";
import { useState, useEffect } from "react";

// Types for API responses
type CustomerItem = {
  id: number;
  osa_code: string;
  owner_name: string;
};

type RouteVisitItem = {
  id: number;
  uuid: string;
  osa_code: string;
  customer?: {
    id: number;
    code: string;
    name: string;
  };
  days: string[];
};

type TransformedCustomer = {
  id: number;
  name: string;
};

type TransformedEditCustomer = {
  id: number; // <-- will now represent customer.id
  uuid: string;
  name: string;
  days: string[];
};

// ✅ Transform function for add mode (existing functionality)
const transformCustomerList = (
  apiResponse: CustomerItem[]
): TransformedCustomer[] => {
  return apiResponse.map((item) => ({
    id: item.id,
    name: `${item.osa_code} - ${item.owner_name}`,
  }));
};

// ✅ Transform function for edit mode (updated to use customer.id)
const transformEditCustomerList = (
  apiResponse: RouteVisitItem[]
): TransformedEditCustomer[] => {
  return apiResponse.map((item) => ({
    id: item.customer?.id ?? item.id, // ✅ use customer.id if available, fallback to item.id
    uuid: item.uuid,
    name: item.customer
      ? `${item.customer.code} - ${item.customer.name}`
      : "Unknown Customer",
    days: item.days || [],
  }));
};

type DayState = {
  Monday: boolean;
  Tuesday: boolean;
  Wednesday: boolean;
  Thursday: boolean;
  Friday: boolean;
  Saturday: boolean;
  Sunday: boolean;
};

type RowStates = Record<number, DayState>;

type CustomerSchedule = {
  customer_id: number;
  days: string[];
};

type TableProps = {
  searchQuery: {
    from_date: string | null;
    to_date: string | null;
    customer_type: string | null;
    status: string | null;
  };
  isEditMode: boolean;
  customers: CustomerItem[];
  onScheduleUpdate?: (schedules: CustomerSchedule[]) => void;
  initialSchedules?: CustomerSchedule[];
  selectedCustomerType: string;
};

export default function Table({
  searchQuery,
  isEditMode,
  selectedCustomerType,
  customers,
  onScheduleUpdate,
  initialSchedules = [],
}: TableProps) {
  const [editModeData, setEditModeData] = useState<TransformedEditCustomer[]>(
    []
  );
  const [addModeData, setAddModeData] = useState<TransformedCustomer[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // ✅ If customers is null or undefined, show loading and exit early
    if (!customers) {
      setLoading(true);
      return;
    }

    // ✅ If customers array is empty, still show loading (no data yet)
    if (customers.length === 0) {
      setLoading(true);
      return;
    }

    // ✅ Customers available — process data
    setLoading(true);
    const data = transformCustomerList(customers);
    setAddModeData(data);
    setLoading(false);
  }, [customers]);

  // ✅ For EDIT mode: fetch and transform data from route visit list API
  useEffect(() => {
    // ✅ Ensure we're in edit mode
    if (!isEditMode) return;

    // ✅ Ensure all required search params exist before calling API
    const { from_date, to_date, customer_type, status } = searchQuery || {};

    const hasValidParams = from_date && to_date && customer_type && status;

    if (!hasValidParams) return; // ⛔ Skip API call if any param is missing

    const fetchEditData = async () => {
      setLoading(true);
      try {
        const res = await getRouteVisitList(searchQuery);
        if (res?.data) {
          const transformedData = transformEditCustomerList(
            res.data as RouteVisitItem[]
          );
          setEditModeData(transformedData);
        }
      } catch (error) {
        console.error("Failed to fetch edit mode data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEditData();
  }, [isEditMode, JSON.stringify(searchQuery)]);

  // ✅ Initialize state from props or edit mode data
  const initialRowStates = isEditMode
    ? editModeData.reduce((acc, item) => {
        acc[item.id] = {
          Monday: item.days.includes("Monday"),
          Tuesday: item.days.includes("Tuesday"),
          Wednesday: item.days.includes("Wednesday"),
          Thursday: item.days.includes("Thursday"),
          Friday: item.days.includes("Friday"),
          Saturday: item.days.includes("Saturday"),
          Sunday: item.days.includes("Sunday"),
        };
        return acc;
      }, {} as RowStates)
    : initialSchedules.reduce((acc, sched) => {
        acc[sched.customer_id] = {
          Monday: sched.days.includes("Monday"),
          Tuesday: sched.days.includes("Tuesday"),
          Wednesday: sched.days.includes("Wednesday"),
          Thursday: sched.days.includes("Thursday"),
          Friday: sched.days.includes("Friday"),
          Saturday: sched.days.includes("Saturday"),
          Sunday: sched.days.includes("Sunday"),
        };
        return acc;
      }, {} as RowStates);

  const [rowStates, setRowStates] = useState<RowStates>(initialRowStates);

  // ✅ Update rowStates when editModeData changes
  useEffect(() => {
    if (isEditMode && editModeData.length > 0) {
      const newRowStates = editModeData.reduce((acc, item) => {
        acc[item.id] = {
          Monday: item.days.includes("Monday"),
          Tuesday: item.days.includes("Tuesday"),
          Wednesday: item.days.includes("Wednesday"),
          Thursday: item.days.includes("Thursday"),
          Friday: item.days.includes("Friday"),
          Saturday: item.days.includes("Saturday"),
          Sunday: item.days.includes("Sunday"),
        };
        return acc;
      }, {} as RowStates);
      setRowStates(newRowStates);
    }
  }, [isEditMode, editModeData]);

  useEffect(() => {
    if (typeof onScheduleUpdate === "function") {
      const schedules: CustomerSchedule[] = Object.entries(rowStates)
        .map(([customer_id, daysObj]) => {
          const dayState = daysObj as DayState;
          const selectedDays = Object.entries(dayState)
            .filter(([_, isSelected]) => isSelected)
            .map(([day]) => day);
          return selectedDays.length > 0
            ? { customer_id: Number(customer_id), days: selectedDays }
            : null;
        })
        .filter(Boolean) as CustomerSchedule[];

      onScheduleUpdate(schedules);
    }
  }, [rowStates, onScheduleUpdate]);

  const handleToggle = (rowId: number, field: keyof DayState) => {
    setRowStates((prev: RowStates) => {
      const current = prev[rowId] || {
        Monday: false,
        Tuesday: false,
        Wednesday: false,
        Thursday: false,
        Friday: false,
        Saturday: false,
        Sunday: false,
      };

      const updatedRow = {
        ...current,
        [field]: !current[field],
      };

      return {
        ...prev,
        [rowId]: updatedRow,
      };
    });
  };

  if (loading) {
    return <Loading />;
  }

  const hasEditData = editModeData && editModeData.length > 0;
  const displayData = isEditMode ? editModeData : addModeData;

  // ✅ If in edit mode and no data, show "No Data Found"
  if (isEditMode && !hasEditData) {
    return (
      <ContainerCard className="w-full flex font-semibold justify-center items-center py-10 text-black">
        No Data Found
      </ContainerCard>
    );
  }

  // ✅ Otherwise, show the table
  return (
    <div className="w-full flex flex-col">
      <div className="rounded-lg border border-[#E9EAEB] overflow-hidden">
        {/* ✅ Horizontal scroll container for small screens */}
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto text-sm">
            <thead className="text-[12px] bg-[#FAFAFA] text-[#535862] sticky top-0 z-20">
              <tr className="h-[44px] border-b border-[#E9EAEB]">
                <th className="px-4 py-3 font-[500] text-left border-r border-[#E9EAEB] whitespace-nowrap">
                  {selectedCustomerType.toString() === "1"
                    ? "Agent Customer"
                    : "Merchandiser"}
                </th>
                {[
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ].map((day) => (
                  <th
                    key={day}
                    className="px-4 py-3 font-[500] text-center border-l border-[#E9EAEB] whitespace-nowrap"
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="text-[14px] bg-white text-[#535862]">
              {displayData.map((row) => {
                const state = rowStates[row.id] || {
                  Monday: false,
                  Tuesday: false,
                  Wednesday: false,
                  Thursday: false,
                  Friday: false,
                  Saturday: false,
                  Sunday: false,
                };

                return (
                  <tr key={row.id} className="border-b border-[#E9EAEB]">
                    <td className="px-4 py-3 text-left font-[500] border-r border-[#E9EAEB] whitespace-nowrap">
                      {row.name}
                    </td>

                    {Object.keys(state).map((day) => (
                      <td
                        key={day}
                        className="px-4 py-3 text-center border-l border-[#E9EAEB] whitespace-nowrap"
                      >
                        <Checkbox
                          isChecked={state[day as keyof DayState]}
                          onChange={() =>
                            handleToggle(row.id, day as keyof DayState)
                          }
                        />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

type CheckboxProps = {
  label?: string;
  isChecked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export function Checkbox({
  label,
  isChecked = false,
  onChange,
}: CheckboxProps) {
  return (
    <label className="inline-flex items-center cursor-pointer space-x-2">
      <input
        type="checkbox"
        className="w-5 h-5 accent-green-500 cursor-pointer border border-gray-300 rounded focus:ring-2 focus:ring-white"
        checked={isChecked}
        onChange={onChange}
      />
      {label && (
        <span className="text-sm font-medium text-gray-900">{label}</span>
      )}
    </label>
  );
}
