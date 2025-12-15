"use client";

import KeyValueData from "@/app/components/keyValueData";
import ContainerCard from "@/app/components/containerCard";
import StatusBtn from "@/app/components/statusBtn2";
import { getSurveyById } from "@/app/services/allApi";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type SurveyFormValues = {
    
  survey_code: string;
  survey_name: string;
  start_date: string;
  end_date: string;
  status: number | "Active" | "Inactive";
};

const title = "Survey Details";
const backBtnUrl = "/merchandiser/survey";

export default function ViewPage() {
const params = useParams();
const rawId = params?.id || params?.id;
const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const { showSnackbar } = useSnackbar();
  const { setLoading } = useLoading();
  const [survey, setSurvey] = useState<SurveyFormValues | null>(null);

  useEffect(() => {
    const fetchSurveyDetails = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await getSurveyById(id);
        setLoading(false);

        if (res.error) {
          showSnackbar(res.data?.message || "Unable to fetch Survey Details", "error");
          return;
        }

        // Map API response to form values
        setSurvey({
          survey_code: res.data.survey_code || "-",
          survey_name: res.data.survey_name || "-",
          start_date: res.data.start_date || "-",
          end_date: res.data.end_date || "-",
          status: res.data.status,
        });
      } catch (error) {
        setLoading(false);
        console.error(error);
        showSnackbar("Something went wrong while fetching Survey details", "error");
      }
    };

    fetchSurveyDetails();
  }, [id, setLoading, showSnackbar]);

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href={backBtnUrl}>
          <Icon icon="lucide:arrow-left" width={24} />
        </Link>
        <h1 className="text-xl font-semibold mb-1">{title}</h1>
      </div>

      {/* Survey Details */}
      <div className="flex flex-wrap gap-x-[20px]">
        <ContainerCard className="w-full lg:w-[350px]">
          <KeyValueData
            data={[
              { value: survey?.survey_code, key: "Survey Code" },
                   { value: survey?.survey_name, key: "Survey Name" },
                   { value: survey?.start_date, key: "start_date" },
                   { value: survey?.end_date, key: "End Date" },
              {
                value: "",
                key: "Status",
                component: (
                  <StatusBtn
                    isActive={survey?.status === 1 || survey?.status === "Active"}
                  />
                ),
              },
            ]}
          />
        </ContainerCard>
      </div>
    </>
  );
}
