"use client";

import { useState, useCallback } from "react";
import { Icon } from "@iconify-icon/react";
import { useRouter } from "next/navigation";
import CustomDropdown from "@/app/components/customDropdown";
import BorderIconButton from "@/app/components/borderIconButton";
import Table, { TableDataType, listReturnType, searchReturnType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { SurveyList, surveyGlobalSearch } from "@/app/services/allApi";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import StatusBtn from "@/app/components/statusBtn2";
import { usePagePermissions } from "@/app/(private)/utils/usePagePermissions";
import { useEffect } from "react";

interface SurveyItem {
  id: number;
  uuid: string;
  survey_code: string;
  survey_name: string;
  survey_type: string;
  start_date: string;
  end_date: string;
  status: number | string;
}

interface SurveyApiResponse {
  error?: boolean;
  message?: string;
  data: SurveyItem[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

interface DropdownItem {
  icon: string;
  label: string;
  iconWidth: number;
}

const dropdownDataList: DropdownItem[] = [
  { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
  { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
];

export default function Survey() {
  const { can, permissions } = usePagePermissions();
  const { setLoading } = useLoading();
  const { showSnackbar } = useSnackbar();
  const router = useRouter();

  const [showDropdown, setShowDropdown] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Refresh table when permissions load
  useEffect(() => {
    if (permissions.length > 0) {
      setRefreshKey((prev) => prev + 1);
    }
  }, [permissions]);

  const SURVEY_TYPE_MAP: Record<string, string> = {
    "1": "Consumer Survey",
    "2": "Sensory Survey",
    "3": "Asset Survey",
  };

  // ✅ Fetch Surveys (List)
  const fetchSurveys = useCallback(
    async (page: number = 1, pageSize: number = 50): Promise<listReturnType> => {
      setLoading(true);
      try {
        const res: SurveyApiResponse = await SurveyList({
          page: page.toString(),
          limit: pageSize.toString(),
        });

        setLoading(false);
        if (res.error) throw new Error(res.message || "Failed to fetch surveys");

        const data: TableDataType[] = res.data.map((item) => ({
          id: item.id.toString(),
          survey_code: item.survey_code,
          survey_name: item.survey_name,
          survey_type: SURVEY_TYPE_MAP[item.survey_type] || "-",
          start_date: item.start_date,
          end_date: item.end_date,
        }));

        return {
          data,
          total: res.pagination.last_page,
          currentPage: res.pagination.current_page,
          pageSize: res.pagination.per_page,
        };
      } catch (error) {
        setLoading(false);
        showSnackbar((error as Error).message, "error");
        return { data: [], total: 0, currentPage: 1, pageSize };
      }
    },
    [setLoading, showSnackbar]
  );

  // ✅ Global Search (no any)
  const searchSurvey = useCallback(
    async (searchQuery: string): Promise<searchReturnType> => {

      setLoading(true);
      try {
        const res: SurveyApiResponse = await surveyGlobalSearch({
          search: searchQuery,

        });

        setLoading(false);
        if (res.error) throw new Error(res.message || "Search failed");

        const data: TableDataType[] = res.data.map((item) => ({
          id: item.id.toString(),
          survey_code: item.survey_code,
          survey_name: item.survey_name,
          survey_type: SURVEY_TYPE_MAP[item.survey_type] || "-",
          start_date: item.start_date,
          end_date: item.end_date,
          status:
            item.status === 1 || String(item.status).toLowerCase() === "active"
              ? "Active"
              : "Inactive",
        }));

        return {
          data,
          total: res.pagination.last_page,
          currentPage: res.pagination.current_page,
          pageSize: res.pagination.per_page,
        };
      } catch (error) {
        setLoading(false);
        showSnackbar((error as Error).message, "error");
        return { data: [], total: 0, currentPage: 1, pageSize: 50 };
      }
    },
    [setLoading, showSnackbar]
  );

  // ✅ Table Columns
  const columns = [
    { key: "survey_code", label: "Survey Code" },
    { key: "survey_name", label: "Survey Name" },
    { key: "survey_type", label: "Survey Type" },
    { key: "start_date", label: "Start Date" },
    { key: "end_date", label: "End Date" },
    {
      key: "status",
      label: "Status",
      render: (row: TableDataType) => <StatusBtn isActive={row.status === "Active"} />,
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <Table
        refreshKey={refreshKey}
        config={{
          api: {
            list: fetchSurveys,
            search: searchSurvey,
          },
          header: {
            title: "Survey",
            searchBar: true,
            columnFilter: true,
            wholeTableActions: [
              <div key={0} className="flex gap-[12px] relative">
                <BorderIconButton
                  icon="ic:sharp-more-vert"
                  onClick={() => setShowDropdown(!showDropdown)}
                />
                {showDropdown && (
                  <div className="absolute top-[40px] right-0 z-30 w-[226px]">
                    <CustomDropdown>
                      {dropdownDataList.map((link, idx) => (
                        <div
                          key={idx}
                          className="px-[14px] py-[10px] flex items-center gap-[8px] hover:bg-[#FAFAFA]"
                        >
                          <Icon
                            icon={link.icon}
                            width={link.iconWidth}
                            className="text-[#717680]"
                          />
                          <span className="text-[#181D27] font-[500] text-[16px]">
                            {link.label}
                          </span>
                        </div>
                      ))}
                    </CustomDropdown>
                  </div>
                )}
              </div>,
            ],
            actions: can("create") ? [
              <SidebarBtn
                key="add-survey"
                href="/survey/add"
                leadingIcon="lucide:plus"
                label="Add"
                labelTw="hidden sm:block"
                isActive
              />,
            ] : [],
          },
          footer: { nextPrevBtn: true, pagination: true },
          columns,
          rowSelection: true,
          rowActions: [
            {
              icon: "lucide:eye",
              onClick: (data: TableDataType) => {
                router.push(`/survey/view/${data.uuid}`);
              },
            },
          ],
          pageSize: 50,
        }}
      />
    </div>
  );
}
