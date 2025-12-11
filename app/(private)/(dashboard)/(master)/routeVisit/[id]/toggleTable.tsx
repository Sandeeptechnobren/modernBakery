"use client";
import { Icon } from "@iconify-icon/react";
import { useState, useEffect, useRef, useCallback } from "react";
import Toggle from "@/app/components/toggle";
import Loading from "@/app/components/Loading";

// Add your API function import
import { getRouteVisitDetails } from "@/app/services/allApi";

const transformCustomerList = (apiResponse: any[]) => {
  return apiResponse.map((item) => ({
    id: item.id,
    name: `${item.osa_code} - ${item.name.toUpperCase()}`,
  }));
};

// Types for customer schedule
type CustomerSchedule = {
  customer_id: number;
  days: string[];
};

type TableProps = {
  customers: any[];
  setCustomerSchedules: any;
  initialSchedules?: CustomerSchedule[];
  loading?: boolean;
  editMode?: boolean;
  visitUuid?: string;
};

export default function Table({
  customers,
  setCustomerSchedules,
  initialSchedules = [],
  loading = false,
  editMode = false,
  visitUuid = "",
}: TableProps) {
  const data = transformCustomerList(customers);
  const isInitialMount = useRef(true);
  const [internalLoading, setInternalLoading] = useState(false);
  const hasFetchedData = useRef(false);

  // ✅ Track pre-filled customer IDs from API
  const [prefilledCustomerIds, setPrefilledCustomerIds] = useState<Set<number>>(
    new Set()
  );

  const [rowStates, setRowStates] = useState<
    Record<
      number,
      {
        Monday: boolean;
        Tuesday: boolean;
        Wednesday: boolean;
        Thursday: boolean;
        Friday: boolean;
        Saturday: boolean;
        Sunday: boolean;
      }
    >
  >({});

  const [columnSelection, setColumnSelection] = useState({
    Monday: false,
    Tuesday: false,
    Wednesday: false,
    Thursday: false,
    Friday: false,
    Saturday: false,
    Sunday: false,
  });

  // ✅ Filtered data - only show customers that are in both current customer_type AND pre-filled data
  const filteredData = data.filter(
    (customer) => !editMode || prefilledCustomerIds.has(customer.id)
  );

  // ✅ Load visit data for editing
  const loadVisitData = useCallback(async (uuid: string) => {
    if (!uuid || hasFetchedData.current) {
      console.log("Skipping data fetch - no UUID or already fetched");
      return;
    }

    setInternalLoading(true);
    try {
      console.log("Fetching visit data for UUID:", uuid);
      const res = await getRouteVisitDetails(uuid);
      console.log("API Response for edit:", res);

      if (res?.data) {
        const existing = res.data;
        console.log("Existing data:", existing);

        // Create customer schedule from the API response
        if (existing.customer && existing.customer.id) {
          const daysMap = {
            Monday: existing.days?.includes("Monday") || false,
            Tuesday: existing.days?.includes("Tuesday") || false,
            Wednesday: existing.days?.includes("Wednesday") || false,
            Thursday: existing.days?.includes("Thursday") || false,
            Friday: existing.days?.includes("Friday") || false,
            Saturday: existing.days?.includes("Saturday") || false,
            Sunday: existing.days?.includes("Sunday") || false,
          };

          const initialRowStates: typeof rowStates = {};
          initialRowStates[existing.customer.id] = daysMap;

          setRowStates(initialRowStates);
          // ✅ Store the pre-filled customer ID
          setPrefilledCustomerIds(new Set([existing.customer.id]));
          hasFetchedData.current = true;
          console.log("Table initialized with schedule:", initialRowStates);
          console.log("Prefilled customer IDs:", [existing.customer.id]);
        } else {
          console.log("No customer data found in API response");
        }
      } else {
        console.warn("Route visit not found in API response");
      }
    } catch (error) {
      console.error("Error loading visit data:", error);
      hasFetchedData.current = false;
    } finally {
      setInternalLoading(false);
    }
  }, []);

  // Initialize row states - FIXED VERSION
  useEffect(() => {
    console.log("Initialization effect running:", {
      editMode,
      visitUuid,
      initialSchedulesLength: initialSchedules.length,
      isInitialMount: isInitialMount.current,
      hasFetchedData: hasFetchedData.current,
    });

    if (editMode && visitUuid && !hasFetchedData.current) {
      console.log("Table in edit mode, fetching data for UUID:", visitUuid);
      loadVisitData(visitUuid);
    } else if (
      initialSchedules.length > 0 &&
      isInitialMount.current &&
      !editMode
    ) {
      console.log("Using initialSchedules:", initialSchedules);
      const initialRowStates: typeof rowStates = {};
      const prefilledIds = new Set<number>();

      initialSchedules.forEach((schedule) => {
        const daysMap = {
          Monday: schedule.days.includes("Monday"),
          Tuesday: schedule.days.includes("Tuesday"),
          Wednesday: schedule.days.includes("Wednesday"),
          Thursday: schedule.days.includes("Thursday"),
          Friday: schedule.days.includes("Friday"),
          Saturday: schedule.days.includes("Saturday"),
          Sunday: schedule.days.includes("Sunday"),
        };

        initialRowStates[schedule.customer_id] = daysMap;
        prefilledIds.add(schedule.customer_id);
      });

      setRowStates(initialRowStates);
      setPrefilledCustomerIds(prefilledIds);
      console.log("Initialized with initialSchedules:", initialRowStates);
      console.log("Prefilled customer IDs:", Array.from(prefilledIds));
    }

    isInitialMount.current = false;
  }, [initialSchedules, editMode, visitUuid, loadVisitData]);

  // Update parent when rowStates change - DEBOUNCED VERSION
  useEffect(() => {
    if (Object.keys(rowStates).length > 0) {
      console.log("Row states updated, notifying parent:", rowStates);
      setCustomerSchedules(rowStates);
    }
  }, [rowStates, setCustomerSchedules]);

  // Reset row states when customers change - ONLY in create mode
  const previousCustomers = useRef(customers);
  useEffect(() => {
    if (!editMode && customers.length > 0) {
      const customersChanged =
        JSON.stringify(previousCustomers.current) !== JSON.stringify(customers);

      if (customersChanged) {
        console.log("Customers changed in create mode, resetting table states");
        setRowStates({});
        setPrefilledCustomerIds(new Set()); // Reset pre-filled IDs in create mode
        setColumnSelection({
          Monday: false,
          Tuesday: false,
          Wednesday: false,
          Thursday: false,
          Friday: false,
          Saturday: false,
          Sunday: false,
        });
        previousCustomers.current = customers;
      }
    }
  }, [customers, editMode]);

  // Handle individual toggle
  const handleToggle = (
    rowId: number,
    field: keyof (typeof rowStates)[number]
  ) => {
    setRowStates((prev) => {
      const current = prev[rowId] || {
        Monday: false,
        Tuesday: false,
        Wednesday: false,
        Thursday: false,
        Friday: false,
        Saturday: false,
        Sunday: false,
      };

      const newState = {
        ...prev,
        [rowId]: {
          ...current,
          [field]: !current[field],
        },
      };

      console.log(`Toggled ${field} for customer ${rowId}:`, newState[rowId]);
      return newState;
    });
  };

  // Handle column selection - UPDATED to use filteredData
  const handleColumnSelect = (day: keyof typeof columnSelection) => {
    const newColumnState = !columnSelection[day];

    console.log(`Column ${day} selection:`, newColumnState);

    setColumnSelection((prev) => ({
      ...prev,
      [day]: newColumnState,
    }));

    setRowStates((prev) => {
      const updatedStates = { ...prev };

      // ✅ Use filteredData instead of data
      filteredData.forEach((customer) => {
        const currentState = updatedStates[customer.id] || {
          Monday: false,
          Tuesday: false,
          Wednesday: false,
          Thursday: false,
          Friday: false,
          Saturday: false,
          Sunday: false,
        };

        updatedStates[customer.id] = {
          ...currentState,
          [day]: newColumnState,
        };
      });

      console.log(`Updated all rows for column ${day}:`, updatedStates);
      return updatedStates;
    });
  };

  // Handle row selection
  const handleRowSelect = (rowId: number) => {
    setRowStates((prev) => {
      const current = prev[rowId] || {
        Monday: false,
        Tuesday: false,
        Wednesday: false,
        Thursday: false,
        Friday: false,
        Saturday: false,
        Sunday: false,
      };

      const allSelected = Object.values(current).every(Boolean);

      const newState = {
        ...prev,
        [rowId]: {
          Monday: !allSelected,
          Tuesday: !allSelected,
          Wednesday: !allSelected,
          Thursday: !allSelected,
          Friday: !allSelected,
          Saturday: !allSelected,
          Sunday: !allSelected,
        },
      };

      console.log(`Row ${rowId} selection:`, newState[rowId]);
      return newState;
    });
  };

  // Check if all toggles in a column are selected - UPDATED to use filteredData
  const isColumnFullySelected = (day: keyof typeof columnSelection) => {
    if (filteredData.length === 0) return false;

    return filteredData.every((customer) => {
      const customerState = rowStates[customer.id];
      return customerState?.[day] === true;
    });
  };

  // Check if some toggles in a column are selected - UPDATED to use filteredData
  const isColumnPartiallySelected = (day: keyof typeof columnSelection) => {
    if (filteredData.length === 0) return false;

    const hasTrue = filteredData.some((customer) => {
      const customerState = rowStates[customer.id];
      return customerState?.[day] === true;
    });

    const hasFalse = filteredData.some((customer) => {
      const customerState = rowStates[customer.id];
      return customerState?.[day] === false;
    });

    return hasTrue && hasFalse;
  };

  // Check if all toggles in a row are selected
  const isRowFullySelected = (rowId: number) => {
    const customerState = rowStates[rowId];
    if (!customerState) return false;

    return Object.values(customerState).every(Boolean);
  };

  // Check if some toggles in a row are selected (for indeterminate state)
  const isRowPartiallySelected = (rowId: number) => {
    const customerState = rowStates[rowId];
    if (!customerState) return false;

    const hasTrue = Object.values(customerState).some(Boolean);
    const hasFalse = Object.values(customerState).some((value) => !value);

    return hasTrue && hasFalse;
  };

  // Show loading when customers are being fetched or internal loading
  if (loading || internalLoading) {
    return (
      <div className="w-full flex flex-col overflow-hidden">
        <div className="rounded-lg border border-[#E9EAEB] overflow-hidden">
          <div className="flex items-center justify-center py-12">
            <Loading />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col overflow-hidden">
      <div className="rounded-lg border border-[#E9EAEB] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max">
            <thead className="text-[12px] bg-[#FAFAFA] text-[#535862] sticky top-0 z-20">
              <tr className="border-b-[1px] border-[#E9EAEB]">
                <th className="px-4 py-3 font-[500] text-left min-w-[220px] sticky left-0 bg-[#FAFAFA] z-10 border-r border-[#E9EAEB]">
                  <div className="flex items-center gap-2">
                    <span>Customer List</span>
                  </div>
                </th>

                {Object.keys(columnSelection).map((day) => {
                  const dayKey = day as keyof typeof columnSelection;
                  const isFullySelected = isColumnFullySelected(dayKey);
                  const isPartiallySelected = isColumnPartiallySelected(dayKey);

                  return (
                    <th
                      key={day}
                      className="px-4 py-3 font-[500] text-center min-w-[120px] border-l border-[#E9EAEB]"
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <span className="text-xs">{day}</span>
                        <div className="flex items-center">
                          {!editMode && (
                            <Toggle
                              isChecked={isFullySelected}
                              onChange={() => handleColumnSelect(dayKey)}
                            // ✅ Disable column toggle if no filtered customers
                            // disabled={filteredData.length === 0}
                            />
                          )}
                        </div>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="text-[14px] bg-white text-[#535862]">
              {filteredData.map((row) => {
                const state = rowStates[row.id] || {
                  Monday: false,
                  Tuesday: false,
                  Wednesday: false,
                  Thursday: false,
                  Friday: false,
                  Saturday: false,
                  Sunday: false,
                };

                const isRowSelected = isRowFullySelected(row.id);
                const isRowPartial = isRowPartiallySelected(row.id);

                return (
                  <tr
                    className="border-b-[1px] border-[#E9EAEB] hover:bg-gray-50"
                    key={row.id}
                  >
                    <td className="px-4 py-3 text-left font-[500] sticky left-0 bg-white z-10 border-r border-[#E9EAEB] min-w-[220px]">
                      <div className="flex items-center gap-3">
                        <Toggle
                          isChecked={isRowSelected}
                          onChange={() => handleRowSelect(row.id)}
                        />
                        <span
                          className="truncate max-w-[100%]"
                          title={row.name}
                        >
                          {row.name}
                        </span>
                      </div>
                    </td>

                    {Object.entries(state).map(([day, isChecked]) => (
                      <td
                        key={day}
                        className="px-4 py-3 text-center border-l border-[#E9EAEB] min-w-[120px]"
                      >
                        <div className="flex justify-center">
                          <Toggle
                            isChecked={isChecked}
                            onChange={() =>
                              handleToggle(
                                row.id,
                                day as keyof (typeof rowStates)[number]
                              )
                            }
                          />
                        </div>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {editMode ? (
              <div>
                <p>No matching customers found for edit</p>
                <p className="text-sm text-gray-400 mt-2">
                  The pre-filled customer is not available in the current
                  customer type selection.
                </p>
              </div>
            ) : (
              "No customers found"
            )}
          </div>
        )}
      </div>
    </div>
  );
}
